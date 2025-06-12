
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, FileText, Printer, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [faceSheets, setFaceSheets] = useState<FaceSheetData[]>([
    {
      id: "fs1",
      patientName: "BALASAHEB SHELKE",
      age: 60,
      sex: "M",
      prnNo: "VMH2506/00032",
      ipdNo: "IPD2506/00637",
      patientCategory: "CASH",
      patientSubCategory: "",
      dateOfAdmission: new Date("2025-06-12"),
      time: "05:00 PM",
      consultantDoctor: "Dr.AKSHAY BANDGAR",
      refByDoctor: "",
      patientAddress: "BHAGWAN GAVHANE CHOWK BHOSARI",
      wardName: "",
      bedNo: "",
      idProofTaken: "-",
      relativeName: "SONALI UNKI",
      contactNo: "9823019845/9146964765",
      relativeAddress: "",
      provisionalDiagnosis: "",
      finalDiagnosis: "",
      icdCodes: "",
      typeOfDischarge: "Normal Discharge",
      dischargeCardPreparedBy: "",
      createdAt: new Date()
    }
  ]);

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

  const handleCreateFaceSheet = () => {
    if (!newFaceSheet.patientName || !newFaceSheet.age || !newFaceSheet.contactNo) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const faceSheet: FaceSheetData = {
      id: `fs_${Date.now()}`,
      patientName: newFaceSheet.patientName.toUpperCase(),
      age: parseInt(newFaceSheet.age),
      sex: newFaceSheet.sex as "M" | "F",
      prnNo: newFaceSheet.prnNo || generatePRNNumber(),
      ipdNo: newFaceSheet.ipdNo || generateIPDNumber(),
      patientCategory: newFaceSheet.patientCategory,
      patientSubCategory: newFaceSheet.patientSubCategory,
      dateOfAdmission: new Date(),
      time: newFaceSheet.time,
      consultantDoctor: newFaceSheet.consultantDoctor,
      refByDoctor: newFaceSheet.refByDoctor,
      patientAddress: newFaceSheet.patientAddress.toUpperCase(),
      wardName: newFaceSheet.wardName,
      bedNo: newFaceSheet.bedNo,
      idProofTaken: newFaceSheet.idProofTaken,
      relativeName: newFaceSheet.relativeName.toUpperCase(),
      contactNo: newFaceSheet.contactNo,
      relativeAddress: newFaceSheet.relativeAddress,
      provisionalDiagnosis: newFaceSheet.provisionalDiagnosis,
      finalDiagnosis: newFaceSheet.finalDiagnosis,
      icdCodes: newFaceSheet.icdCodes,
      typeOfDischarge: "Normal Discharge",
      dischargeCardPreparedBy: "",
      createdAt: new Date()
    };

    setFaceSheets([...faceSheets, faceSheet]);
    
    toast({
      title: "Face Sheet Created",
      description: `Face sheet for ${faceSheet.patientName} has been created successfully`,
    });

    // Reset form
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
              .header { text-align: center; margin-bottom: 20px; border: 1px solid #000; padding: 10px; }
              .title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
              .section { margin: 10px 0; }
              .field { margin: 5px 0; }
              .label { font-weight: bold; display: inline-block; width: 150px; }
              .discharge-section { margin-top: 30px; border: 1px solid #000; padding: 10px; }
              .checkbox { margin: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">VISION MULTISPECIALITY HOSPITAL</div>
              <div>Moshi-Chikhali Near RKH Blessings, Moshi,Pune -412105</div>
              <div>📞 9766660572/9146383404</div>
            </div>
            
            <div style="text-align: center; margin: 20px 0; font-size: 16px; font-weight: bold;">
              IPD CASE PAPER
            </div>
            
            <div class="section">
              <div class="field">
                <span class="label">Name of the Patient:</span> ${faceSheet.patientName}
                <span style="margin-left: 100px;">Age: ${faceSheet.age}</span>
                <span style="margin-left: 50px;">Sex: ${faceSheet.sex}</span>
              </div>
            </div>
            
            <div class="section">
              <div class="field">
                <span class="label">PRN NO:</span> ${faceSheet.prnNo}
                <span style="margin-left: 100px;">IPD NO: ${faceSheet.ipdNo}</span>
              </div>
            </div>
            
            <div class="section">
              <div class="field">
                <span class="label">Patient Category:</span> ${faceSheet.patientCategory}
                <span style="margin-left: 50px;">Patient Sub Category: ${faceSheet.patientSubCategory}</span>
              </div>
            </div>
            
            <div class="section">
              <div class="field">
                <span class="label">Date of Admission:</span> ${faceSheet.dateOfAdmission.toLocaleDateString()}
                <span style="margin-left: 50px;">Time: ${faceSheet.time}</span>
              </div>
            </div>
            
            <div class="section">
              <div class="field">
                <span class="label">Consultant Doctor:</span> ${faceSheet.consultantDoctor}
                <span style="margin-left: 50px;">Ref By Doctor: ${faceSheet.refByDoctor}</span>
              </div>
            </div>
            
            <div class="section">
              <div class="field">
                <span class="label">Patient Address:</span> ${faceSheet.patientAddress}
              </div>
            </div>
            
            <div class="section">
              <div class="field">
                <span class="label">Ward Name:</span> ${faceSheet.wardName}
                <span style="margin-left: 100px;">Bed NO: ${faceSheet.bedNo}</span>
              </div>
            </div>
            
            <div class="section">
              <div class="field">
                <span class="label">ID Proof Taken:</span> ${faceSheet.idProofTaken}
              </div>
            </div>
            
            <div class="section">
              <div class="field">
                <span class="label">Relative Name:</span> ${faceSheet.relativeName}
                <span style="margin-left: 50px;">Contact NO: ${faceSheet.contactNo}</span>
              </div>
            </div>
            
            <div class="section">
              <div class="field">
                <span class="label">Relative Address:</span> ${faceSheet.relativeAddress}
              </div>
            </div>
            
            <div class="section">
              <div class="field">
                <span class="label">Provisional Diagnosis:</span>
                <div style="border-bottom: 1px solid #000; height: 30px; margin-top: 5px;">${faceSheet.provisionalDiagnosis}</div>
              </div>
            </div>
            
            <div class="section">
              <div class="field">
                <span class="label">Final Diagnosis:</span>
                <div style="border-bottom: 1px solid #000; height: 30px; margin-top: 5px;">${faceSheet.finalDiagnosis}</div>
              </div>
            </div>
            
            <div class="section">
              <div class="field">
                <span class="label">ICD Codes:</span>
                <div style="border-bottom: 1px solid #000; height: 30px; margin-top: 5px;">${faceSheet.icdCodes}</div>
              </div>
            </div>
            
            <div class="discharge-section">
              <div style="font-weight: bold; margin-bottom: 10px;">Discharge Record:</div>
              
              <div class="field">
                <span class="label">Date Of Discharge:</span> ${faceSheet.dischargeDate ? faceSheet.dischargeDate.toLocaleDateString() : '_____________'}
                <span style="margin-left: 50px;">Time: ${faceSheet.dischargeTime || '_____________'}</span>
              </div>
              
              <div class="field" style="margin-top: 20px;">
                <span class="label">Type of Discharge:</span>
              </div>
              
              <div class="checkbox">
                ☐ Normal Discharge
                <span style="margin-left: 100px;">☐ Discharged On Requested</span>
              </div>
              <div class="checkbox">
                ☐ Against Medical Advice
                <span style="margin-left: 74px;">☐ Absconded/Died</span>
              </div>
              
              <div class="field" style="margin-top: 30px;">
                <span class="label">Discharge card Prepared By:</span>
                <div style="border-bottom: 1px solid #000; width: 300px; display: inline-block;">${faceSheet.dischargeCardPreparedBy}</div>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
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
              {filteredFaceSheets.map((sheet) => (
                <TableRow key={sheet.id}>
                  <TableCell className="font-medium">{sheet.patientName}</TableCell>
                  <TableCell>{sheet.prnNo}</TableCell>
                  <TableCell>{sheet.ipdNo}</TableCell>
                  <TableCell>{sheet.age}/{sheet.sex}</TableCell>
                  <TableCell>{sheet.dateOfAdmission.toLocaleDateString()}</TableCell>
                  <TableCell>{sheet.consultantDoctor}</TableCell>
                  <TableCell className="space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => printFaceSheet(sheet)}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedFaceSheet(sheet)}>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FaceSheet;
