import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, UserCheck, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Patient } from "@/types/hospital";
import { usePatients } from "@/hooks/usePatients";
import { supabase } from "@/integrations/supabase/client";

interface PatientManagementProps {
  userRole: "admin" | "doctor" | "staff";
}

const PatientManagement = ({ userRole }: PatientManagementProps) => {
  // State for UI
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const { toast } = useToast();

  // State for doctors and rooms select lists
  const [doctors, setDoctors] = useState<{ id: string; full_name: string }[]>([]);
  const [rooms, setRooms] = useState<{ id: string; room_number: string }[]>([]);

  // Set selects to undefined by default for correct controlled usage
  const [newPatient, setNewPatient] = useState({
    fullName: "",
    age: "",
    gender: undefined as "Male" | "Female" | "Other" | undefined,
    phone: "",
    email: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    bloodType: undefined as string | undefined,
    allergies: "",
    medicalHistory: "",
    insuranceInfo: "",
    assignedDoctorId: undefined as string | undefined,
    assignedRoomId: undefined as string | undefined,
  });

  // Load patients from Supabase
  const { patients, isLoading, addPatient, updatePatient, dischargePatient, refetch } = usePatients();

  // Fetch doctors and rooms from Supabase
  useEffect(() => {
    async function fetchDoctorsAndRooms() {
      const { data: docData } = await supabase.from("doctors").select("id, full_name");
      setDoctors(docData ?? []);
      const { data: roomData } = await supabase.from("rooms").select("id, room_number");
      setRooms(roomData ?? []);
    }
    fetchDoctorsAndRooms();
  }, []);

  // Reset logic - use undefined for selects as well
  const resetNewPatientForm = () =>
    setNewPatient({
      fullName: "",
      age: "",
      gender: undefined,
      phone: "",
      email: "",
      address: "",
      emergencyContact: "",
      emergencyPhone: "",
      bloodType: undefined,
      allergies: "",
      medicalHistory: "",
      insuranceInfo: "",
      assignedDoctorId: undefined,
      assignedRoomId: undefined,
    });

  // 1. Function to open View Patient Dialog
  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowViewDialog(true);
  };

  // 2. Function to open Edit Patient Dialog
  const handleEditClick = (patient: Patient) => {
    setEditPatient({ ...patient });
    setShowEditDialog(true);
  };

  // 3. Remove old doctor/room assignment and use selected
  const handleAddPatient = async () => {
    if (!newPatient.fullName || !newPatient.age || !newPatient.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const patient: Partial<Patient> = {
      fullName: newPatient.fullName,
      age: parseInt(newPatient.age),
      gender: newPatient.gender,
      phone: newPatient.phone,
      email: newPatient.email,
      address: newPatient.address,
      emergencyContact: newPatient.emergencyContact,
      emergencyPhone: newPatient.emergencyPhone,
      bloodType: newPatient.bloodType,
      allergies: newPatient.allergies.split(",").map(a => a.trim()).filter(a => a),
      admissionDate: new Date(),
      status: "Admitted",
      assignedDoctorId: newPatient.assignedDoctorId || null,
      assignedRoomId: newPatient.assignedRoomId || null,
      medicalHistory: newPatient.medicalHistory,
      insuranceInfo: newPatient.insuranceInfo,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      await addPatient.mutateAsync(patient);
      toast({
        title: "Patient Added Successfully",
        description: `${patient.fullName} has been admitted`,
      });
      resetNewPatientForm();
      setShowAddDialog(false);
    } catch (err: any) {
      toast({
        title: "Error adding patient",
        description: err.message || "Failed to add patient",
        variant: "destructive"
      });
    }
  };

  // Edit patient in Supabase
  const handleEditPatient = async () => {
    if (!editPatient) return;
    try {
      await updatePatient.mutateAsync({
        ...editPatient,
        updatedAt: new Date(),
      });
      toast({
        title: "Patient Updated",
        description: `${editPatient.fullName}'s information has been updated successfully`,
      });
      setShowEditDialog(false);
      setEditPatient(null);
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.message || "Failed to update patient",
        variant: "destructive"
      });
    }
  };

  // Discharge patient in Supabase
  const handleDischarge = async (patientId: string) => {
    try {
      await dischargePatient.mutateAsync({ id: patientId });
      toast({
        title: "Patient Discharged",
        description: "Patient has been discharged. Invoice generated and sent.",
      });
    } catch (err: any) {
      toast({
        title: "Discharge failed",
        description: err.message || "Failed to discharge",
        variant: "destructive"
      });
    }
  };

  // Patient filtering from Supabase data
  const filteredPatients = (patients ?? []).filter(patient => {
    const matchesSearch = patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.includes(searchTerm);
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
                    <Select
                      value={newPatient.gender}
                      onValueChange={(value) =>
                        setNewPatient({ ...newPatient, gender: value as "Male" | "Female" | "Other" })
                      }
                    >
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
                    <Select
                      value={newPatient.bloodType}
                      onValueChange={(value) =>
                        setNewPatient({ ...newPatient, bloodType: value })
                      }
                    >
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="doctor">Assigned Doctor</Label>
                    <select
                      id="doctor"
                      className="w-full border rounded px-3 py-2"
                      value={newPatient.assignedDoctorId || ""}
                      onChange={e =>
                        setNewPatient({
                          ...newPatient,
                          assignedDoctorId: e.target.value === "" ? undefined : e.target.value,
                        })
                      }
                    >
                      <option value="">Select doctor</option>
                      {doctors.map(d => (
                        <option value={d.id} key={d.id}>{d.full_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="room">Assigned Room</Label>
                    <select
                      id="room"
                      className="w-full border rounded px-3 py-2"
                      value={newPatient.assignedRoomId || ""}
                      onChange={e =>
                        setNewPatient({
                          ...newPatient,
                          assignedRoomId: e.target.value === "" ? undefined : e.target.value,
                        })
                      }
                    >
                      <option value="">Select room</option>
                      {rooms.map(r => (
                        <option value={r.id} key={r.id}>{r.room_number}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button onClick={handleAddPatient} className="w-full">
                  Add Patient
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Edit Patient Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Patient Information</DialogTitle>
            <DialogDescription>Update patient details</DialogDescription>
          </DialogHeader>
          {editPatient && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={editPatient.fullName}
                    onChange={(e) => setEditPatient({...editPatient, fullName: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Age *</Label>
                  <Input
                    type="number"
                    value={editPatient.age}
                    onChange={(e) => setEditPatient({...editPatient, age: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone *</Label>
                  <Input
                    value={editPatient.phone}
                    onChange={(e) => setEditPatient({...editPatient, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={editPatient.email || ""}
                    onChange={(e) => setEditPatient({...editPatient, email: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={editPatient.address}
                  onChange={(e) => setEditPatient({...editPatient, address: e.target.value})}
                />
              </div>
              <div>
                <Label>Medical History</Label>
                <Textarea
                  value={editPatient.medicalHistory}
                  onChange={(e) => setEditPatient({...editPatient, medicalHistory: e.target.value})}
                />
              </div>
              <Button onClick={handleEditPatient} className="w-full">
                Update Patient
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Patient Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Patient Profile</DialogTitle>
            <DialogDescription>Patient information details</DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Full Name</Label>
                  <p>{selectedPatient.fullName}</p>
                </div>
                <div>
                  <Label className="font-semibold">Age</Label>
                  <p>{selectedPatient.age} years</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Gender</Label>
                  <p>{selectedPatient.gender}</p>
                </div>
                <div>
                  <Label className="font-semibold">Blood Type</Label>
                  <p>{selectedPatient.bloodType}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Phone</Label>
                  <p>{selectedPatient.phone}</p>
                </div>
                <div>
                  <Label className="font-semibold">Email</Label>
                  <p>{selectedPatient.email || "Not provided"}</p>
                </div>
              </div>
              <div>
                <Label className="font-semibold">Address</Label>
                <p>{selectedPatient.address}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Emergency Contact</Label>
                  <p>{selectedPatient.emergencyContact}</p>
                </div>
                <div>
                  <Label className="font-semibold">Emergency Phone</Label>
                  <p>{selectedPatient.emergencyPhone}</p>
                </div>
              </div>
              <div>
                <Label className="font-semibold">Allergies</Label>
                <p>{selectedPatient.allergies.length > 0 ? selectedPatient.allergies.join(", ") : "None"}</p>
              </div>
              <div>
                <Label className="font-semibold">Medical History</Label>
                <p>{selectedPatient.medicalHistory || "None"}</p>
              </div>
              <div>
                <Label className="font-semibold">Current Status</Label>
                <Badge className={getStatusColor(selectedPatient.status)}>
                  {selectedPatient.status}
                </Badge>
              </div>
              <div>
                <Label className="font-semibold">Admission Date</Label>
                <p>{selectedPatient.admissionDate.toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
            <Select
              value={statusFilter === "" ? "All" : statusFilter}
              onValueChange={v => setStatusFilter(v || "All")}
            >
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewPatient(patient)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditClick(patient)}
                    >
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
