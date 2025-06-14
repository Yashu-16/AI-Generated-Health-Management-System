import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, FileText, Activity, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MedicalRecord, Medication, LabResult, Patient } from "@/types/hospital";
import { supabase } from "@/integrations/supabase/client";
import MedicalRecordStats from "./medical-records/MedicalRecordStats";
import MedicalRecordAddDialog from "./medical-records/MedicalRecordAddDialog";
import MedicalRecordsTable from "./medical-records/MedicalRecordsTable";

interface MedicalRecordsProps {
  userRole: "admin" | "doctor" | "staff";
}

const MedicalRecords = ({ userRole }: MedicalRecordsProps) => {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Save all patient object fields so we can use face sheet info directly
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<{id: string, name: string}[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [faceSheetPatient, setFaceSheetPatient] = useState<Patient | null>(null);
  const { toast } = useToast();

  const [newRecord, setNewRecord] = useState({
    patientId: "",
    doctorId: "",
    chiefComplaint: "",
    diagnosis: "",
    treatment: "",
    notes: "",
    temperature: "",
    bloodPressure: "",
    heartRate: "",
    respiratoryRate: "",
    oxygenSaturation: ""
  });

  // Fetch patients and doctors for dropdowns
  useEffect(() => {
    const fetchMeta = async () => {
      const [{ data: patientData }, { data: doctorData }] = await Promise.all([
        supabase.from("patients").select("*"),
        supabase.from("doctors").select("id, full_name"),
      ]);
      if (patientData) setPatients(patientData);
      else setPatients([]);
      if (doctorData) setDoctors(doctorData.map((d: any) => ({ id: d.id, name: d.full_name })));
      else setDoctors([]);
    };
    fetchMeta();
  }, []);

  // Fetch medical records from supabase
  const fetchMedicalRecords = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("medical_records")
      .select("*")
      .order("created_at", { ascending: false }); // get all including face_sheet_snapshot

    if (error) {
      setError("Failed to fetch records");
      setLoading(false);
      return;
    }

    // Map the face_sheet_snapshot field to faceSheetSnapshot property
    const mapped = (data || []).map((rec: any) => ({
      id: rec.id,
      patientId: rec.patient_id,
      doctorId: rec.doctor_id,
      visitDate: rec.visit_date ? new Date(rec.visit_date) : undefined,
      chiefComplaint: rec.chief_complaint ?? "",
      diagnosis: rec.diagnosis ?? "",
      treatment: rec.treatment ?? "",
      medications: rec.medications ?? [],
      vitalSigns: rec.vital_signs ?? {},
      labResults: rec.lab_results ?? [],
      notes: rec.notes ?? "",
      followUpDate: rec.follow_up_date ? new Date(rec.follow_up_date) : undefined,
      createdAt: rec.created_at ? new Date(rec.created_at) : new Date(),
      updatedAt: rec.updated_at ? new Date(rec.updated_at) : new Date(),
      faceSheetSnapshot: rec.face_sheet_snapshot ?? null, // <-- make sure this is mapped
    }));
    setMedicalRecords(mapped);
    setLoading(false);
  };

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  // Helper to get full patient face sheet data by id
  const getFaceSheetData = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient : null;
  };

  const displayFaceSheet = (snapshot: any) => {
    if (!snapshot) return <div className="text-muted-foreground text-sm">No face sheet snapshot saved.</div>;
    // Display important fields from snapshot; adjust as needed.
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div><span className="font-semibold">Full Name:</span> {snapshot.full_name}</div>
        <div><span className="font-semibold">Age:</span> {snapshot.age}</div>
        <div><span className="font-semibold">Gender:</span> {snapshot.gender}</div>
        <div><span className="font-semibold">Phone:</span> {snapshot.phone}</div>
        <div><span className="font-semibold">Address:</span> {snapshot.address}</div>
        <div><span className="font-semibold">Blood Type:</span> {snapshot.blood_type}</div>
        <div><span className="font-semibold">Allergies:</span> {Array.isArray(snapshot.allergies) ? snapshot.allergies.join(", ") : ""}</div>
        <div><span className="font-semibold">Admission Date:</span> {snapshot.admission_date}</div>
        <div><span className="font-semibold">Status:</span> {snapshot.status}</div>
        {/* Add other fields as needed */}
      </div>
    );
  };

  const handleAddRecord = async () => {
    if (!newRecord.patientId || !newRecord.doctorId || !newRecord.chiefComplaint) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Get the patient's Face Sheet data (using raw DB column keys)
    let faceSheetSnapshot = null;
    const res = await supabase.from("patients").select("*").eq("id", newRecord.patientId).maybeSingle();
    if (res.data) {
      faceSheetSnapshot = res.data; // This will include all columns from the patients table, using exact DB keys
    }

    const insertData = {
      patient_id: newRecord.patientId,
      doctor_id: newRecord.doctorId,
      visit_date: new Date().toISOString().slice(0, 10),
      chief_complaint: newRecord.chiefComplaint,
      diagnosis: newRecord.diagnosis,
      treatment: newRecord.treatment,
      medications: [],
      vital_signs: {
        temperature: parseFloat(newRecord.temperature) || 0,
        bloodPressure: newRecord.bloodPressure,
        heartRate: parseInt(newRecord.heartRate) || 0,
        respiratoryRate: parseInt(newRecord.respiratoryRate) || 0,
        oxygenSaturation: parseInt(newRecord.oxygenSaturation) || 0
      },
      lab_results: [],
      notes: newRecord.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      face_sheet_snapshot: faceSheetSnapshot,
    };

    const { error } = await supabase.from("medical_records").insert([insertData]);
    if (error) {
      toast({ title: "Error", description: "Could not add medical record", variant: "destructive" });
    } else {
      toast({ title: "Medical Record Added", description: "New medical record has been created successfully" });
      setShowAddDialog(false);
      setNewRecord({
        patientId: "",
        doctorId: "",
        chiefComplaint: "",
        diagnosis: "",
        treatment: "",
        notes: "",
        temperature: "",
        bloodPressure: "",
        heartRate: "",
        respiratoryRate: "",
        oxygenSaturation: ""
      });
      fetchMedicalRecords();
    }
  };

  const filteredRecords = medicalRecords.filter(record => {
    const patient = patients.find(p => p.id === record.patientId);
    const doctor = doctors.find(d => d.id === record.doctorId);
    return (
      (patient?.name && patient.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doctor?.name && doctor.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.diagnosis && record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const getLabStatusColor = (status: string) => {
    switch (status) {
      case "Normal": return "bg-green-100 text-green-800";
      case "Abnormal": return "bg-yellow-100 text-yellow-800";
      case "Critical": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medical Records</h1>
          <p className="text-muted-foreground">Patient medical history and treatment records</p>
        </div>
        {(userRole === "admin" || userRole === "doctor") && (
          <MedicalRecordAddDialog
            show={showAddDialog}
            setShow={setShowAddDialog}
            newRecord={newRecord}
            setNewRecord={setNewRecord}
            handleAddRecord={handleAddRecord}
            patients={patients}
            doctors={doctors}
          />
        )}
      </div>

      <MedicalRecordStats medicalRecords={medicalRecords} />

      <Card>
        <CardHeader>
          <CardTitle>Medical Records</CardTitle>
          <CardDescription>Search and view patient medical history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient, doctor, or diagnosis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
          <MedicalRecordsTable
            records={filteredRecords}
            patients={patients}
            doctors={doctors}
            displayFaceSheet={displayFaceSheet}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalRecords;
