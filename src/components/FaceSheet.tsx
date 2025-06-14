import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, FileText, Printer, Download, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FaceSheetProps {
  userRole: "admin" | "doctor" | "staff";
}

interface FaceSheetData {
  id: string;
  patientName: string;
  age: number;
  sex: "M" | "F";
  prnNo: string;
  ipdNo: string;
  patientCategory: string;
  patientSubCategory: string;
  dateOfAdmission: Date;
  time: string;
  consultantDoctor: string;
  refByDoctor: string;
  patientAddress: string;
  wardName: string;
  bedNo: string;
  idProofTaken: string;
  relativeName: string;
  contactNo: string;
  relativeAddress: string;
  provisionalDiagnosis: string;
  finalDiagnosis: string;
  icdCodes: string;
  dischargeDate?: Date;
  dischargeTime?: string;
  typeOfDischarge: "Normal Discharge" | "Against Medical Advice" | "Discharged On Requested" | "Absconded/Died";
  dischargeCardPreparedBy: string;
  createdAt: Date;
}

const FaceSheet = ({ userRole }: FaceSheetProps) => {
  // Now FaceSheetData array is loaded from Supabase
  const [faceSheets, setFaceSheets] = useState<FaceSheetData[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedFaceSheet, setSelectedFaceSheet] = useState<FaceSheetData | null>(null);
  const { toast } = useToast();

  const [newFaceSheet, setNewFaceSheet] = useState({
    patientName: "",
    age: "",
    sex: "",
    prnNo: "",
    ipdNo: "",
    patientCategory: "CASH",
    patientSubCategory: "",
    time: "",
    consultantDoctor: "",
    refByDoctor: "",
    patientAddress: "",
    wardName: "",
    bedNo: "",
    idProofTaken: "",
    relativeName: "",
    contactNo: "",
    relativeAddress: "",
    provisionalDiagnosis: "",
    finalDiagnosis: "",
    icdCodes: ""
  });

  // Helper to load all face sheets from Supabase
  const fetchFaceSheets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("face_sheets")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({
        title: "Error loading face sheets",
        description: error.message,
        variant: "destructive"
      });
      setFaceSheets([]); // fallback empty
    } else if (data) {
      setFaceSheets(
        data.map((sheet: any) => ({
          id: sheet.id,
          patientName: sheet.patient_name,
          age: sheet.age,
          sex: sheet.sex,
          prnNo: sheet.prn_no,
          ipdNo: sheet.ipd_no,
          patientCategory: sheet.patient_category,
          patientSubCategory: sheet.patient_sub_category,
          dateOfAdmission: sheet.date_of_admission
            ? new Date(sheet.date_of_admission)
            : new Date(),
          time: sheet.time ?? "",
          consultantDoctor: sheet.consultant_doctor ?? "",
          refByDoctor: sheet.ref_by_doctor ?? "",
          patientAddress: sheet.patient_address ?? "",
          wardName: sheet.ward_name ?? "",
          bedNo: sheet.bed_no ?? "",
          idProofTaken: sheet.id_proof_taken ?? "",
          relativeName: sheet.relative_name ?? "",
          contactNo: sheet.contact_no ?? "",
          relativeAddress: sheet.relative_address ?? "",
          provisionalDiagnosis: sheet.provisional_diagnosis ?? "",
          finalDiagnosis: sheet.final_diagnosis ?? "",
          icdCodes: sheet.icd_codes ?? "",
          dischargeDate: sheet.discharge_date
            ? new Date(sheet.discharge_date)
            : undefined,
          dischargeTime: sheet.discharge_time ?? "",
          typeOfDischarge: (sheet.type_of_discharge ??
            "Normal Discharge") as FaceSheetData["typeOfDischarge"],
          dischargeCardPreparedBy: sheet.discharge_card_prepared_by ?? "",
          createdAt: sheet.created_at ? new Date(sheet.created_at) : new Date()
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFaceSheets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generatePRNNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `VMH${year}${month}/${random}`;
  };

  const generateIPDNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `IPD${year}${month}/${random}`;
  };

  const handleCreateFaceSheet = async () => {
    if (!newFaceSheet.patientName || !newFaceSheet.age || !newFaceSheet.contactNo) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Prepare record for Supabase
    const insertObj = {
      patient_name: newFaceSheet.patientName.toUpperCase(),
      age: parseInt(newFaceSheet.age),
      sex: newFaceSheet.sex as "M" | "F",
      prn_no: newFaceSheet.prnNo || generatePRNNumber(),
      ipd_no: newFaceSheet.ipdNo || generateIPDNumber(),
      patient_category: newFaceSheet.patientCategory,
      patient_sub_category: newFaceSheet.patientSubCategory,
      date_of_admission: new Date().toISOString().slice(0, 10), // "YYYY-MM-DD"
      time: newFaceSheet.time,
      consultant_doctor: newFaceSheet.consultantDoctor,
      ref_by_doctor: newFaceSheet.refByDoctor,
      patient_address: newFaceSheet.patientAddress.toUpperCase(),
      ward_name: newFaceSheet.wardName,
      bed_no: newFaceSheet.bedNo,
      id_proof_taken: newFaceSheet.idProofTaken,
      relative_name: newFaceSheet.relativeName.toUpperCase(),
      contact_no: newFaceSheet.contactNo,
      relative_address: newFaceSheet.relativeAddress,
      provisional_diagnosis: newFaceSheet.provisionalDiagnosis,
      final_diagnosis: newFaceSheet.finalDiagnosis,
      icd_codes: newFaceSheet.icdCodes,
      type_of_discharge: "Normal Discharge",
      discharge_card_prepared_by: "",
      created_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from("face_sheets")
      .insert([insertObj]);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create face sheet: " + error.message,
        variant: "destructive"
      });
      return;
    } else {
      toast({
        title: "Face Sheet Created",
        description: `Face sheet for ${insertObj.patient_name} has been created successfully`,
      });
      fetchFaceSheets(); // Reload new data
      setNewFaceSheet({
        patientName: "",
        age: "",
        sex: "",
        prnNo: "",
        ipdNo: "",
        patientCategory: "CASH",
        patientSubCategory: "",
        time: "",
        consultantDoctor: "",
        refByDoctor: "",
        patientAddress: "",
        wardName: "",
        bedNo: "",
        idProofTaken: "",
        relativeName: "",
        contactNo: "",
        relativeAddress: "",
        provisionalDiagnosis: "",
        finalDiagnosis: "",
        icdCodes: ""
      });
      setShowAddDialog(false);
    }
  };

  const printFaceSheet = (faceSheet: FaceSheetData) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>IPD Case Paper - ${faceSheet.patientName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header {
                text-align: center; margin-bottom: 20px; border: 1px solid #000; padding: 10px;
              }
              .title { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
              .clinic-contact { color: #b8001f; margin: 4px 0; }
              .section-title {
                font-size: 15px; font-weight: bold; margin: 30px 0 10px 0; text-align: left; border-bottom: 2px solid #000;
              }
              .table-section {
                width: 100%; border-collapse: collapse; margin-bottom: 10px;
              }
              .table-section td {
                padding: 4px 8px;
                vertical-align: top;
                font-size: 15px;
              }
              .table-section .label {
                font-weight: bold;
                text-align: left;
                width: 190px;
              }
              .double-col { width: 45%; }
              .hr { border: none; border-bottom: 1.5px solid #000; margin: 20px 0; }
              .discharge-section {
                margin-top: 24px;
                border: 1px solid #000; 
                padding: 14px 18px 10px 18px;
                width: 95%;
                font-size: 15px;
              }
              .discharge-section .dtype-row { margin: 10px 0; }
              .checkbox-row {
                display: flex;
                gap: 60px;
                margin: 5px 0 0 20px;
              }
              .checkbox-item {
                display: flex;
                align-items: center;
                min-width: 200px;
                font-size: 15px;
              }
              .signature {
                margin-top: 22px;
                font-size: 15px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">VISION MULTISPECIALITY HOSPITAL</div>
              <div>Moshi-Chikhali Near RKH Blessings, Moshi,Pune -412105</div>
              <div class="clinic-contact">&#128222; 9766660572/9146383404</div>
            </div>
            
            <div style="text-align: center; margin: 14px 0 20px 0; font-size: 18px; font-weight: bold;">
              IPD CASE PAPER
            </div>
            
            <table class="table-section">
              <tr>
                <td class="label">Name of the Patient:</td>
                <td class="double-col">${faceSheet.patientName}</td>
                <td class="label" style="width:80px;">Age:</td>
                <td>${faceSheet.age}</td>
                <td class="label" style="width:60px;">Sex:</td>
                <td>${faceSheet.sex}</td>
              </tr>
              <tr>
                <td class="label">PRN NO:</td>
                <td class="double-col">${faceSheet.prnNo}</td>
                <td class="label">IPD NO:</td>
                <td colspan="3">${faceSheet.ipdNo}</td>
              </tr>
              <tr>
                <td class="label">Patient Category:</td>
                <td class="double-col">${faceSheet.patientCategory}</td>
                <td class="label">Patient Sub Category:</td>
                <td colspan="3">${faceSheet.patientSubCategory}</td>
              </tr>
              <tr>
                <td class="label">Date of Admission:</td>
                <td class="double-col">${faceSheet.dateOfAdmission ? faceSheet.dateOfAdmission.toLocaleDateString() : ''}</td>
                <td class="label">Time:</td>
                <td colspan="3">${faceSheet.time}</td>
              </tr>
              <tr>
                <td class="label">Consultant Doctor:</td>
                <td class="double-col">${faceSheet.consultantDoctor}</td>
                <td class="label">Ref By Doctor:</td>
                <td colspan="3">${faceSheet.refByDoctor}</td>
              </tr>
              <tr>
                <td class="label">Patient Address:</td>
                <td class="double-col" colspan="5">${faceSheet.patientAddress}</td>
              </tr>
              <tr>
                <td class="label">Ward Name:</td>
                <td class="double-col">${faceSheet.wardName}</td>
                <td class="label">Bed NO:</td>
                <td colspan="3">${faceSheet.bedNo}</td>
              </tr>
              <tr>
                <td class="label">ID Proof Taken:</td>
                <td class="double-col" colspan="5">${faceSheet.idProofTaken}</td>
              </tr>
              <tr>
                <td class="label">Relative Name:</td>
                <td class="double-col">${faceSheet.relativeName}</td>
                <td class="label">Contact NO:</td>
                <td colspan="3">${faceSheet.contactNo}</td>
              </tr>
              <tr>
                <td class="label">Relative Address:</td>
                <td class="double-col" colspan="5">${faceSheet.relativeAddress}</td>
              </tr>
              <tr>
                <td class="label">Provisional Diagnosis:</td>
                <td class="double-col" colspan="5" style="border-bottom:1px solid #000;height:36px;">
                  ${faceSheet.provisionalDiagnosis}
                </td>
              </tr>
              <tr>
                <td class="label">Final Diagnosis:</td>
                <td class="double-col" colspan="5" style="border-bottom:1px solid #000;height:30px;">
                  ${faceSheet.finalDiagnosis}
                </td>
              </tr>
              <tr>
                <td class="label">ICD Codes:</td>
                <td class="double-col" colspan="5" style="border-bottom:1px solid #000;height:30px;">
                  ${faceSheet.icdCodes}
                </td>
              </tr>
            </table>

            <div class="discharge-section">
              <div style="font-weight: bold; margin-bottom: 6px;">Discharge Record:</div>
              <table>
                <tr>
                  <td class="label" style="width:150px;">Date Of Discharge:</td>
                  <td style="width:160px;">${faceSheet.dischargeDate ? faceSheet.dischargeDate.toLocaleDateString() : '_____________'}</td>
                  <td class="label" style="width:50px;">Time:</td>
                  <td>${faceSheet.dischargeTime || '_____________'}</td>
                </tr>
              </table>
              <div class="dtype-row" style="margin-top:8px;font-weight:bold;">Type of Discharge:</div>
              <div class="checkbox-row">
                <span class="checkbox-item">☐ Normal Discharge</span>
                <span class="checkbox-item">☐ Discharged On Requested</span>
              </div>
              <div class="checkbox-row">
                <span class="checkbox-item">☐ Against Medical Advice</span>
                <span class="checkbox-item">☐ Absconded/Died</span>
              </div>
              <div class="signature" style="margin-top:24px;">
                <span class="label" style="font-weight:bold;">Discharge card Prepared By:</span>
                <span style="display:inline-block; border-bottom:1px solid #000; width:250px; margin-left:3px;">${faceSheet.dischargeCardPreparedBy}</span>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Replace handleDeleteFaceSheet with inline logic using Trash icon
  const handleDeleteFaceSheet = async (faceSheetId: string) => {
    if (!window.confirm("Are you sure you want to delete this face sheet? This cannot be undone.")) return;
    setFaceSheets(current => current.filter(s => s.id !== faceSheetId));
    const { error } = await supabase.from("face_sheets").delete().eq("id", faceSheetId);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Face Sheet Deleted",
        description: "Face sheet has been deleted.",
      });
      // No refetch required since we filter locally above.
    }
  };

  const filteredFaceSheets = faceSheets.filter(sheet => 
    sheet.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sheet.prnNo.includes(searchTerm) ||
    sheet.ipdNo.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Face Sheet Management</h1>
          <p className="text-muted-foreground">Create and manage IPD case papers</p>
        </div>
        {(userRole === "admin" || userRole === "staff") && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Face Sheet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Face Sheet</DialogTitle>
                <DialogDescription>Fill in the patient information for IPD case paper</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="patientName">Patient Name *</Label>
                    <Input
                      id="patientName"
                      value={newFaceSheet.patientName}
                      onChange={(e) => setNewFaceSheet({...newFaceSheet, patientName: e.target.value})}
                      placeholder="FULL NAME IN CAPS"
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={newFaceSheet.age}
                      onChange={(e) => setNewFaceSheet({...newFaceSheet, age: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sex">Sex</Label>
                    <Select onValueChange={(value) => setNewFaceSheet({...newFaceSheet, sex: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="F">F</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prnNo">PRN NO (auto-generated if empty)</Label>
                    <Input
                      id="prnNo"
                      value={newFaceSheet.prnNo}
                      onChange={(e) => setNewFaceSheet({...newFaceSheet, prnNo: e.target.value})}
                      placeholder="VMH2506/00032"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ipdNo">IPD NO (auto-generated if empty)</Label>
                    <Input
                      id="ipdNo"
                      value={newFaceSheet.ipdNo}
                      onChange={(e) => setNewFaceSheet({...newFaceSheet, ipdNo: e.target.value})}
                      placeholder="IPD2506/00637"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Patient Category</Label>
                    <Select value={newFaceSheet.patientCategory} onValueChange={(value) => setNewFaceSheet({...newFaceSheet, patientCategory: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">CASH</SelectItem>
                        <SelectItem value="INSURANCE">INSURANCE</SelectItem>
                        <SelectItem value="GOVERNMENT">GOVERNMENT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      value={newFaceSheet.time}
                      onChange={(e) => setNewFaceSheet({...newFaceSheet, time: e.target.value})}
                      placeholder="05:00 PM"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="consultantDoctor">Consultant Doctor</Label>
                    <Input
                      id="consultantDoctor"
                      value={newFaceSheet.consultantDoctor}
                      onChange={(e) => setNewFaceSheet({...newFaceSheet, consultantDoctor: e.target.value})}
                      placeholder="Dr.AKSHAY BANDGAR"
                    />
                  </div>
                  <div>
                    <Label htmlFor="refByDoctor">Ref By Doctor</Label>
                    <Input
                      id="refByDoctor"
                      value={newFaceSheet.refByDoctor}
                      onChange={(e) => setNewFaceSheet({...newFaceSheet, refByDoctor: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="patientAddress">Patient Address</Label>
                  <Input
                    id="patientAddress"
                    value={newFaceSheet.patientAddress}
                    onChange={(e) => setNewFaceSheet({...newFaceSheet, patientAddress: e.target.value})}
                    placeholder="FULL ADDRESS IN CAPS"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="wardName">Ward Name</Label>
                    <Input
                      id="wardName"
                      value={newFaceSheet.wardName}
                      onChange={(e) => setNewFaceSheet({...newFaceSheet, wardName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bedNo">Bed NO</Label>
                    <Input
                      id="bedNo"
                      value={newFaceSheet.bedNo}
                      onChange={(e) => setNewFaceSheet({...newFaceSheet, bedNo: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="idProofTaken">ID Proof Taken</Label>
                    <Input
                      id="idProofTaken"
                      value={newFaceSheet.idProofTaken}
                      onChange={(e) => setNewFaceSheet({...newFaceSheet, idProofTaken: e.target.value})}
                      placeholder="Aadhar/PAN/etc"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="relativeName">Relative Name *</Label>
                    <Input
                      id="relativeName"
                      value={newFaceSheet.relativeName}
                      onChange={(e) => setNewFaceSheet({...newFaceSheet, relativeName: e.target.value})}
                      placeholder="NAME IN CAPS"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactNo">Contact NO *</Label>
                    <Input
                      id="contactNo"
                      value={newFaceSheet.contactNo}
                      onChange={(e) => setNewFaceSheet({...newFaceSheet, contactNo: e.target.value})}
                      placeholder="9823019845/9146964765"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="relativeAddress">Relative Address</Label>
                  <Input
                    id="relativeAddress"
                    value={newFaceSheet.relativeAddress}
                    onChange={(e) => setNewFaceSheet({...newFaceSheet, relativeAddress: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="provisionalDiagnosis">Provisional Diagnosis</Label>
                  <Textarea
                    id="provisionalDiagnosis"
                    value={newFaceSheet.provisionalDiagnosis}
                    onChange={(e) => setNewFaceSheet({...newFaceSheet, provisionalDiagnosis: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="finalDiagnosis">Final Diagnosis</Label>
                  <Textarea
                    id="finalDiagnosis"
                    value={newFaceSheet.finalDiagnosis}
                    onChange={(e) => setNewFaceSheet({...newFaceSheet, finalDiagnosis: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="icdCodes">ICD Codes</Label>
                  <Input
                    id="icdCodes"
                    value={newFaceSheet.icdCodes}
                    onChange={(e) => setNewFaceSheet({...newFaceSheet, icdCodes: e.target.value})}
                    placeholder="ICD10 codes separated by commas"
                  />
                </div>

                <Button onClick={handleCreateFaceSheet} className="w-full">
                  Create Face Sheet
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Face Sheet List</CardTitle>
          <CardDescription>Search and manage IPD case papers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name, PRN or IPD number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-muted-foreground text-center">Loading...</div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>PRN NO</TableHead>
                <TableHead>IPD NO</TableHead>
                <TableHead>Age/Sex</TableHead>
                <TableHead>Admission Date</TableHead>
                <TableHead>Consultant</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFaceSheets.map((faceSheet) => (
                <TableRow key={faceSheet.id}>
                  <TableCell className="font-medium">{faceSheet.patientName}</TableCell>
                  <TableCell>{faceSheet.prnNo}</TableCell>
                  <TableCell>{faceSheet.ipdNo}</TableCell>
                  <TableCell>{faceSheet.age}/{faceSheet.sex}</TableCell>
                  <TableCell>{faceSheet.dateOfAdmission.toLocaleDateString()}</TableCell>
                  <TableCell>{faceSheet.consultantDoctor}</TableCell>
                  <TableCell className="space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => printFaceSheet(faceSheet)}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedFaceSheet(faceSheet)}>
                          <FileText className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Face Sheet Details</DialogTitle>
                          <DialogDescription>{selectedFaceSheet?.patientName} - {selectedFaceSheet?.ipdNo}</DialogDescription>
                        </DialogHeader>
                        {selectedFaceSheet && (
                          <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                            <div><strong>Patient Name:</strong> {selectedFaceSheet.patientName}</div>
                            <div><strong>Age/Sex:</strong> {selectedFaceSheet.age}/{selectedFaceSheet.sex}</div>
                            <div><strong>PRN NO:</strong> {selectedFaceSheet.prnNo}</div>
                            <div><strong>IPD NO:</strong> {selectedFaceSheet.ipdNo}</div>
                            <div><strong>Patient Category:</strong> {selectedFaceSheet.patientCategory}</div>
                            <div><strong>Admission Date:</strong> {selectedFaceSheet.dateOfAdmission.toLocaleDateString()}</div>
                            <div><strong>Time:</strong> {selectedFaceSheet.time}</div>
                            <div><strong>Consultant Doctor:</strong> {selectedFaceSheet.consultantDoctor}</div>
                            <div className="col-span-2"><strong>Patient Address:</strong> {selectedFaceSheet.patientAddress}</div>
                            <div><strong>Ward Name:</strong> {selectedFaceSheet.wardName}</div>
                            <div><strong>Bed NO:</strong> {selectedFaceSheet.bedNo}</div>
                            <div><strong>Relative Name:</strong> {selectedFaceSheet.relativeName}</div>
                            <div><strong>Contact NO:</strong> {selectedFaceSheet.contactNo}</div>
                            <div className="col-span-2"><strong>Provisional Diagnosis:</strong> {selectedFaceSheet.provisionalDiagnosis}</div>
                            <div className="col-span-2"><strong>Final Diagnosis:</strong> {selectedFaceSheet.finalDiagnosis}</div>
                            <div className="col-span-2"><strong>ICD Codes:</strong> {selectedFaceSheet.icdCodes}</div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteFaceSheet(faceSheet.id)}
                      className="border border-[#102042] text-[#102042] hover:bg-[#102042]/10"
                      title="Delete Face Sheet"
                    >
                      <Trash className="h-5 w-5 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FaceSheet;
