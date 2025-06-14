import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, Stethoscope, Clock, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Doctor } from "@/types/hospital";
import { useDoctors } from "@/hooks/useDoctors";

interface DoctorManagementProps {
  userRole: "admin" | "doctor" | "staff";
}

const DoctorManagement = ({ userRole }: DoctorManagementProps) => {
  // Get doctors from Supabase
  const { doctors, isLoading, error, addDoctor, updateDoctor, refetch } = useDoctors();

  const doctorsList = doctors ?? [];

  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);
  const { toast } = useToast();

  // Keep only local form state:
  const [newDoctor, setNewDoctor] = useState({
    fullName: "",
    specialization: "",
    qualification: "",
    experience: "",
    phone: "",
    email: "",
    department: "",
    consultationFee: "",
    maxPatientsPerDay: ""
  });

  // Add new doctor handler
  const handleAddDoctor = async () => {
    // Validation: require full name, specialization, phone
    if (!newDoctor.fullName || !newDoctor.specialization || !newDoctor.phone) {
      toast({
        title: "Missing Fields",
        description: "Full name, specialization, and phone are required.",
        variant: "destructive",
      });
      return;
    }
    try {
      await addDoctor.mutateAsync({
        fullName: newDoctor.fullName,
        specialization: newDoctor.specialization,
        qualification: newDoctor.qualification,
        experience: parseInt(newDoctor.experience) || 0,
        phone: newDoctor.phone,
        email: newDoctor.email,
        department: newDoctor.department,
        consultationFee: parseInt(newDoctor.consultationFee) || 0,
        maxPatientsPerDay: parseInt(newDoctor.maxPatientsPerDay) || 0,
        status: "Active",
        schedule: {}, // new doctor starts with empty schedule
      });
      setShowAddDialog(false);
      setNewDoctor({
        fullName: "",
        specialization: "",
        qualification: "",
        experience: "",
        phone: "",
        email: "",
        department: "",
        consultationFee: "",
        maxPatientsPerDay: "",
      });
      toast({
        title: "Doctor Added",
        description: "Doctor has been added successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to add doctor",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  // Edit doctor handler — calls updateDoctor mutation
  const handleEditDoctor = async () => {
    if (!editDoctor) return;
    try {
      await updateDoctor.mutateAsync({
        ...editDoctor,
        updatedAt: new Date(),
      });
      toast({
        title: "Doctor Updated",
        description: `${editDoctor.fullName}'s information has been updated successfully`,
      });
      setShowEditDialog(false);
      setEditDoctor(null);
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.message || "Failed to update doctor",
        variant: "destructive"
      });
    }
  };

  const handleViewDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowViewDialog(true);
  };

  const handleEditClick = (doctor: Doctor) => {
    setEditDoctor(doctor);
    setShowEditDialog(true);
  };

  const filteredDoctors = doctorsList.filter(doctor => {
    const matchesSearch = doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "All" || doctor.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "On Leave": return "bg-yellow-100 text-yellow-800";
      case "Inactive": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const departments = [...new Set(doctorsList.map(doctor => doctor.department))].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doctor Management</h1>
          <p className="text-muted-foreground">Manage medical staff and their schedules</p>
        </div>
        {userRole === "admin" && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Doctor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Doctor</DialogTitle>
                <DialogDescription>Fill in the doctor information below</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={newDoctor.fullName}
                      onChange={(e) => setNewDoctor({...newDoctor, fullName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialization">Specialization *</Label>
                    <Input
                      id="specialization"
                      value={newDoctor.specialization}
                      onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="qualification">Qualification</Label>
                    <Input
                      id="qualification"
                      value={newDoctor.qualification}
                      onChange={(e) => setNewDoctor({...newDoctor, qualification: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Experience (years)</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={newDoctor.experience}
                      onChange={(e) => setNewDoctor({...newDoctor, experience: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={newDoctor.phone}
                      onChange={(e) => setNewDoctor({...newDoctor, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newDoctor.email}
                      onChange={(e) => setNewDoctor({...newDoctor, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={newDoctor.department}
                      onChange={(e) => setNewDoctor({...newDoctor, department: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="consultationFee">Consultation Fee (₹)</Label>
                    <Input
                      id="consultationFee"
                      type="number"
                      value={newDoctor.consultationFee}
                      onChange={(e) => setNewDoctor({...newDoctor, consultationFee: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="maxPatientsPerDay">Max Patients per Day</Label>
                  <Input
                    id="maxPatientsPerDay"
                    type="number"
                    value={newDoctor.maxPatientsPerDay}
                    onChange={(e) => setNewDoctor({...newDoctor, maxPatientsPerDay: e.target.value})}
                  />
                </div>
                <Button onClick={handleAddDoctor} className="w-full">
                  Add Doctor
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Edit Doctor Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Doctor Information</DialogTitle>
            <DialogDescription>Update doctor details</DialogDescription>
          </DialogHeader>
          {editDoctor && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={editDoctor.fullName}
                    onChange={(e) => setEditDoctor({...editDoctor, fullName: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Specialization *</Label>
                  <Input
                    value={editDoctor.specialization}
                    onChange={(e) => setEditDoctor({...editDoctor, specialization: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Qualification</Label>
                  <Input
                    value={editDoctor.qualification}
                    onChange={(e) => setEditDoctor({...editDoctor, qualification: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Experience (years)</Label>
                  <Input
                    type="number"
                    value={editDoctor.experience}
                    onChange={(e) => setEditDoctor({...editDoctor, experience: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone *</Label>
                  <Input
                    value={editDoctor.phone}
                    onChange={(e) => setEditDoctor({...editDoctor, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={editDoctor.email}
                    onChange={(e) => setEditDoctor({...editDoctor, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Department</Label>
                  <Input
                    value={editDoctor.department}
                    onChange={(e) => setEditDoctor({...editDoctor, department: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Consultation Fee (₹)</Label>
                  <Input
                    type="number"
                    value={editDoctor.consultationFee}
                    onChange={(e) => setEditDoctor({...editDoctor, consultationFee: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              <div>
                <Label>Max Patients/Day</Label>
                <Input
                  type="number"
                  value={editDoctor.maxPatientsPerDay}
                  onChange={(e) => setEditDoctor({...editDoctor, maxPatientsPerDay: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={editDoctor.status}
                  onValueChange={v => setEditDoctor({ ...editDoctor, status: v as Doctor["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleEditDoctor} className="w-full" disabled={updateDoctor.status === "pending"}>
                {updateDoctor.status === "pending" ? "Updating..." : "Update Doctor"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View Doctor Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Doctor Profile</DialogTitle>
            <DialogDescription>Doctor information details</DialogDescription>
          </DialogHeader>
          {selectedDoctor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Full Name</Label>
                  <p>{selectedDoctor.fullName}</p>
                </div>
                <div>
                  <Label className="font-semibold">Specialization</Label>
                  <p>{selectedDoctor.specialization}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Qualification</Label>
                  <p>{selectedDoctor.qualification}</p>
                </div>
                <div>
                  <Label className="font-semibold">Experience</Label>
                  <p>{selectedDoctor.experience} years</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Phone</Label>
                  <p>{selectedDoctor.phone}</p>
                </div>
                <div>
                  <Label className="font-semibold">Email</Label>
                  <p>{selectedDoctor.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Department</Label>
                  <p>{selectedDoctor.department}</p>
                </div>
                <div>
                  <Label className="font-semibold">Consultation Fee</Label>
                  <p>₹{selectedDoctor.consultationFee}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Max Patients/Day</Label>
                  <p>{selectedDoctor.maxPatientsPerDay}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status</Label>
                  <Badge className={getStatusColor(selectedDoctor.status)}>
                    {selectedDoctor.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctorsList.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
            <Stethoscope className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctorsList.filter(d => d.status === "Active").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Experience</CardTitle>
            <Stethoscope className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(doctorsList.reduce((sum, d) => sum + d.experience, 0) / doctorsList.length)}yr
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doctor List</CardTitle>
          <CardDescription>Search and filter medical staff</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor Name</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Consultation Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDoctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell className="font-medium">{doctor.fullName}</TableCell>
                  <TableCell>{doctor.specialization}</TableCell>
                  <TableCell>{doctor.department}</TableCell>
                  <TableCell>{doctor.experience} years</TableCell>
                  <TableCell>₹{doctor.consultationFee}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(doctor.status)}>
                      {doctor.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDoctor(doctor)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditClick(doctor)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
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

export default DoctorManagement;
