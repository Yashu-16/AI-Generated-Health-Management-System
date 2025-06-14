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
      .order("created_at", { ascending: false });
    if (error) {
      setError("Failed to fetch records");
      setLoading(false);
      return;
    }
    // Map data to MedicalRecord objects
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
      faceSheetSnapshot: rec.face_sheet_snapshot ?? null,
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

    // Get the patient face sheet data for snapshot
    let faceSheetSnapshot = null;
    const res = await supabase.from("patients").select("*").eq("id", newRecord.patientId).maybeSingle();
    if (res.data) {
      faceSheetSnapshot = res.data;
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
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Medical Record
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Medical Record</DialogTitle>
                <DialogDescription>Fill in the patient visit details</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patient">Patient *</Label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={newRecord.patientId}
                      onChange={(e) => setNewRecord({...newRecord, patientId: e.target.value})}
                    >
                      <option value="">Select patient</option>
                      {patients.map(patient => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="doctor">Doctor *</Label>
                    <select 
                      className="w-full p-2 border rounded"
                      value={newRecord.doctorId}
                      onChange={(e) => setNewRecord({...newRecord, doctorId: e.target.value})}
                    >
                      <option value="">Select doctor</option>
                      {doctors.map(doctor => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="chiefComplaint">Chief Complaint *</Label>
                  <Textarea
                    id="chiefComplaint"
                    value={newRecord.chiefComplaint}
                    onChange={(e) => setNewRecord({...newRecord, chiefComplaint: e.target.value})}
                    placeholder="Primary reason for visit"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="diagnosis">Diagnosis</Label>
                    <Textarea
                      id="diagnosis"
                      value={newRecord.diagnosis}
                      onChange={(e) => setNewRecord({...newRecord, diagnosis: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="treatment">Treatment</Label>
                    <Textarea
                      id="treatment"
                      value={newRecord.treatment}
                      onChange={(e) => setNewRecord({...newRecord, treatment: e.target.value})}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Vital Signs</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="temperature">Temperature (°F)</Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        value={newRecord.temperature}
                        onChange={(e) => setNewRecord({...newRecord, temperature: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bloodPressure">Blood Pressure</Label>
                      <Input
                        id="bloodPressure"
                        value={newRecord.bloodPressure}
                        onChange={(e) => setNewRecord({...newRecord, bloodPressure: e.target.value})}
                        placeholder="120/80"
                      />
                    </div>
                    <div>
                      <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                      <Input
                        id="heartRate"
                        type="number"
                        value={newRecord.heartRate}
                        onChange={(e) => setNewRecord({...newRecord, heartRate: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                    placeholder="Additional notes and observations"
                  />
                </div>

                <Button onClick={handleAddRecord} className="w-full">
                  Add Medical Record
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medicalRecords.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {medicalRecords.filter(r => 
                r.visitDate.getMonth() === new Date().getMonth()
              ).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Results</CardTitle>
            <TestTube className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {medicalRecords.reduce((count, record) => 
                count + (record.labResults?.filter(lab => lab.status === "Critical").length || 0), 0
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Follow-ups Due</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {medicalRecords.filter(r => 
                r.followUpDate && r.followUpDate >= new Date()
              ).length}
            </div>
          </CardContent>
        </Card>
      </div>

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

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Visit Date</TableHead>
                <TableHead>Chief Complaint</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => {
                const patient = patients.find(p => p.id === record.patientId);
                const doctor = doctors.find(d => d.id === record.doctorId);
                
                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{patient?.name}</TableCell>
                    <TableCell>{doctor?.name}</TableCell>
                    <TableCell>{record.visitDate.toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-xs truncate">{record.chiefComplaint}</TableCell>
                    <TableCell className="max-w-xs truncate">{record.diagnosis}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedRecord(record)}>
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Medical Record Details</DialogTitle>
                            <DialogDescription>
                              {patient?.name} - {record.visitDate.toLocaleDateString()}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedRecord && (
                            <Tabs defaultValue="overview" className="w-full">
                              <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="face-sheet">Face Sheet</TabsTrigger>
                                <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
                                <TabsTrigger value="medications">Medications</TabsTrigger>
                                <TabsTrigger value="labs">Lab Results</TabsTrigger>
                              </TabsList>
                              
                              <TabsContent value="overview" className="space-y-4">
                                <div className="grid gap-4">
                                  <div>
                                    <Label className="font-semibold">Chief Complaint</Label>
                                    <p className="text-sm text-muted-foreground mt-1">{selectedRecord.chiefComplaint}</p>
                                  </div>
                                  <div>
                                    <Label className="font-semibold">Diagnosis</Label>
                                    <p className="text-sm text-muted-foreground mt-1">{selectedRecord.diagnosis}</p>
                                  </div>
                                  <div>
                                    <Label className="font-semibold">Treatment</Label>
                                    <p className="text-sm text-muted-foreground mt-1">{selectedRecord.treatment}</p>
                                  </div>
                                  <div>
                                    <Label className="font-semibold">Notes</Label>
                                    <p className="text-sm text-muted-foreground mt-1">{selectedRecord.notes}</p>
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="face-sheet" className="space-y-4">
                                <h3 className="font-semibold">Face Sheet Snapshot (At Visit Time)</h3>
                                {displayFaceSheet(selectedRecord.faceSheetSnapshot)}
                              </TabsContent>
                              
                              <TabsContent value="vitals" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-4 border rounded">
                                    <Label className="font-semibold">Temperature</Label>
                                    <p className="text-2xl font-bold">{selectedRecord.vitalSigns.temperature}°F</p>
                                  </div>
                                  <div className="p-4 border rounded">
                                    <Label className="font-semibold">Blood Pressure</Label>
                                    <p className="text-2xl font-bold">{selectedRecord.vitalSigns.bloodPressure}</p>
                                  </div>
                                  <div className="p-4 border rounded">
                                    <Label className="font-semibold">Heart Rate</Label>
                                    <p className="text-2xl font-bold">{selectedRecord.vitalSigns.heartRate} bpm</p>
                                  </div>
                                  <div className="p-4 border rounded">
                                    <Label className="font-semibold">O2 Saturation</Label>
                                    <p className="text-2xl font-bold">{selectedRecord.vitalSigns.oxygenSaturation}%</p>
                                  </div>
                                </div>
                              </TabsContent>
                              
                              <TabsContent value="medications" className="space-y-4">
                                {selectedRecord.medications.map((med, index) => (
                                  <div key={index} className="p-4 border rounded">
                                    <div className="font-semibold">{med.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {med.dosage} - {med.frequency} for {med.duration}
                                    </div>
                                    <div className="text-sm mt-1">{med.instructions}</div>
                                  </div>
                                ))}
                              </TabsContent>
                              
                              <TabsContent value="labs" className="space-y-4">
                                {selectedRecord.labResults?.map((lab, index) => (
                                  <div key={index} className="p-4 border rounded">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="font-semibold">{lab.testName}</div>
                                        <div className="text-sm text-muted-foreground">
                                          Normal Range: {lab.normalRange}
                                        </div>
                                      </div>
                                      <Badge className={getLabStatusColor(lab.status)}>
                                        {lab.status}
                                      </Badge>
                                    </div>
                                    <div className="text-lg font-bold mt-2">{lab.result}</div>
                                  </div>
                                ))}
                              </TabsContent>
                            </Tabs>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalRecords;
