import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, UserCheck, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Patient } from "@/types/hospital";

interface PatientManagementProps {
  userRole: "admin" | "doctor" | "staff";
}

const PatientManagement = ({ userRole }: PatientManagementProps) => {
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: "1",
      fullName: "John Doe",
      age: 35,
      gender: "Male",
      phone: "+1234567890",
      email: "john.doe@email.com",
      address: "123 Main St, City",
      emergencyContact: "Jane Doe",
      emergencyPhone: "+1234567891",
      bloodType: "O+",
      allergies: ["Penicillin"],
      admissionDate: new Date("2024-06-10"),
      status: "Admitted",
      assignedDoctorId: "doc1",
      assignedRoomId: "room204",
      medicalHistory: "Hypertension, Diabetes",
      currentDiagnosis: "Pneumonia",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "2",
      fullName: "Sarah Wilson",
      age: 28,
      gender: "Female",
      phone: "+1234567892",
      email: "sarah.wilson@email.com",
      address: "456 Oak Ave, City",
      emergencyContact: "Mike Wilson",
      emergencyPhone: "+1234567893",
      bloodType: "A-",
      allergies: ["Shellfish"],
      admissionDate: new Date("2024-06-11"),
      status: "Stable",
      assignedDoctorId: "doc2",
      assignedRoomId: "room301",
      medicalHistory: "None",
      currentDiagnosis: "Appendicitis",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const { toast } = useToast();

  const [newPatient, setNewPatient] = useState({
    fullName: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    bloodType: "",
    allergies: "",
    medicalHistory: "",
    insuranceInfo: ""
  });

  const getAvailableRoom = () => {
    const availableRooms = ["room101", "room102", "room201", "room202", "room301"];
    return availableRooms[Math.floor(Math.random() * availableRooms.length)];
  };

  const getAvailableDoctor = () => {
    const availableDoctors = ["doc1", "doc2", "doc3"];
    return availableDoctors[Math.floor(Math.random() * availableDoctors.length)];
  };

  const handleAddPatient = () => {
    if (!newPatient.fullName || !newPatient.age || !newPatient.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const assignedRoom = getAvailableRoom();
    const assignedDoctor = getAvailableDoctor();

    const patient: Patient = {
      id: `pat_${Date.now()}`,
      fullName: newPatient.fullName,
      age: parseInt(newPatient.age),
      gender: newPatient.gender as "Male" | "Female" | "Other",
      phone: newPatient.phone,
      email: newPatient.email,
      address: newPatient.address,
      emergencyContact: newPatient.emergencyContact,
      emergencyPhone: newPatient.emergencyPhone,
      bloodType: newPatient.bloodType,
      allergies: newPatient.allergies.split(",").map(a => a.trim()).filter(a => a),
      admissionDate: new Date(),
      status: "Admitted",
      assignedDoctorId: assignedDoctor,
      assignedRoomId: assignedRoom,
      medicalHistory: newPatient.medicalHistory,
      insuranceInfo: newPatient.insuranceInfo,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPatients([...patients, patient]);
    
    // Create blank medical record entry
    console.log(`Created blank medical record for patient ${patient.id}`);
    
    // Notify doctor via email (simulation)
    console.log(`Email notification sent to doctor ${assignedDoctor} about new patient ${patient.fullName}`);
    
    toast({
      title: "Patient Added Successfully",
      description: `${patient.fullName} has been admitted to ${assignedRoom} and assigned to doctor ${assignedDoctor}`,
    });

    setNewPatient({
      fullName: "",
      age: "",
      gender: "",
      phone: "",
      email: "",
      address: "",
      emergencyContact: "",
      emergencyPhone: "",
      bloodType: "",
      allergies: "",
      medicalHistory: "",
      insuranceInfo: ""
    });
    setShowAddDialog(false);
  };

  const handleDischarge = (patientId: string) => {
    setPatients(patients.map(patient => {
      if (patient.id === patientId) {
        const updatedPatient = {
          ...patient,
          status: "Discharged" as const,
          dischargeDate: new Date(),
          updatedAt: new Date()
        };
        
        // Mark room as vacant
        console.log(`Room ${patient.assignedRoomId} marked as vacant`);
        
        // Generate and email invoice
        console.log(`Invoice generated and emailed to ${patient.email}`);
        
        toast({
          title: "Patient Discharged",
          description: `${patient.fullName} has been discharged. Invoice generated and sent.`,
        });
        
        return updatedPatient;
      }
      return patient;
    }));
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "All" || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Admitted": return "bg-blue-100 text-blue-800";
      case "Stable": return "bg-green-100 text-green-800";
      case "Critical": return "bg-red-100 text-red-800";
      case "Discharged": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Management</h1>
          <p className="text-muted-foreground">Manage patient records and admissions</p>
        </div>
        {(userRole === "admin" || userRole === "staff") && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
                <DialogDescription>Fill in the patient information below</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={newPatient.fullName}
                      onChange={(e) => setNewPatient({...newPatient, fullName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      value={newPatient.age}
                      onChange={(e) => setNewPatient({...newPatient, age: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select onValueChange={(value) => setNewPatient({...newPatient, gender: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <Select onValueChange={(value) => setNewPatient({...newPatient, bloodType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={newPatient.phone}
                      onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newPatient.email}
                      onChange={(e) => setNewPatient({...newPatient, email: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newPatient.address}
                    onChange={(e) => setNewPatient({...newPatient, address: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      value={newPatient.emergencyContact}
                      onChange={(e) => setNewPatient({...newPatient, emergencyContact: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                    <Input
                      id="emergencyPhone"
                      value={newPatient.emergencyPhone}
                      onChange={(e) => setNewPatient({...newPatient, emergencyPhone: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="allergies">Allergies (comma separated)</Label>
                  <Input
                    id="allergies"
                    value={newPatient.allergies}
                    onChange={(e) => setNewPatient({...newPatient, allergies: e.target.value})}
                    placeholder="e.g., Penicillin, Shellfish"
                  />
                </div>
                <div>
                  <Label htmlFor="medicalHistory">Medical History</Label>
                  <Textarea
                    id="medicalHistory"
                    value={newPatient.medicalHistory}
                    onChange={(e) => setNewPatient({...newPatient, medicalHistory: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="insuranceInfo">Insurance Information</Label>
                  <Input
                    id="insuranceInfo"
                    value={newPatient.insuranceInfo}
                    onChange={(e) => setNewPatient({...newPatient, insuranceInfo: e.target.value})}
                  />
                </div>
                <Button onClick={handleAddPatient} className="w-full">
                  Add Patient
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient List</CardTitle>
          <CardDescription>Search and filter admitted patients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Admitted">Admitted</SelectItem>
                <SelectItem value="Stable">Stable</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="Discharged">Discharged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Admission Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.fullName}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>{patient.assignedRoomId}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(patient.status)}>
                      {patient.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{patient.admissionDate.toLocaleDateString()}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    {patient.status !== "Discharged" && (userRole === "admin" || userRole === "doctor") && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDischarge(patient.id)}
                      >
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    )}
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

export default PatientManagement;
