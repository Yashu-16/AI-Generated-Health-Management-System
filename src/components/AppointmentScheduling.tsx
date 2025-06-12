
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Calendar as CalendarIcon, Clock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Appointment } from "@/types/hospital";

interface AppointmentSchedulingProps {
  userRole: "admin" | "doctor" | "staff";
}

const AppointmentScheduling = ({ userRole }: AppointmentSchedulingProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "apt1",
      patientId: "1",
      doctorId: "doc1",
      appointmentDate: new Date("2024-06-15"),
      appointmentTime: "10:00",
      duration: 30,
      type: "Consultation",
      status: "Scheduled",
      fee: 200,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "apt2",
      patientId: "2",
      doctorId: "doc2",
      appointmentDate: new Date("2024-06-15"),
      appointmentTime: "14:30",
      duration: 45,
      type: "Follow-up",
      status: "Completed",
      fee: 150,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const { toast } = useToast();

  // Mock data for patients and doctors
  const patients = [
    { id: "1", name: "John Doe" },
    { id: "2", name: "Sarah Wilson" },
    { id: "3", name: "Mike Johnson" }
  ];

  const doctors = [
    { id: "doc1", name: "Dr. Sarah Johnson", specialization: "Cardiology" },
    { id: "doc2", name: "Dr. Michael Chen", specialization: "Neurology" },
    { id: "doc3", name: "Dr. Emily Davis", specialization: "General Medicine" }
  ];

  const [newAppointment, setNewAppointment] = useState({
    patientId: "",
    doctorId: "",
    appointmentDate: new Date(),
    appointmentTime: "",
    duration: "30",
    type: "",
    notes: ""
  });

  const handleAddAppointment = () => {
    if (!newAppointment.patientId || !newAppointment.doctorId || !newAppointment.appointmentTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const selectedDoctor = doctors.find(d => d.id === newAppointment.doctorId);
    const baseFee = selectedDoctor?.specialization === "Cardiology" ? 200 : 
                   selectedDoctor?.specialization === "Neurology" ? 250 : 150;

    const appointment: Appointment = {
      id: `apt_${Date.now()}`,
      patientId: newAppointment.patientId,
      doctorId: newAppointment.doctorId,
      appointmentDate: newAppointment.appointmentDate,
      appointmentTime: newAppointment.appointmentTime,
      duration: parseInt(newAppointment.duration),
      type: newAppointment.type as "Consultation" | "Follow-up" | "Emergency" | "Surgery",
      status: "Scheduled",
      fee: baseFee,
      notes: newAppointment.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setAppointments([...appointments, appointment]);
    
    toast({
      title: "Appointment Scheduled",
      description: `Appointment scheduled successfully for ${newAppointment.appointmentDate.toLocaleDateString()} at ${newAppointment.appointmentTime}`,
    });

    setNewAppointment({
      patientId: "",
      doctorId: "",
      appointmentDate: new Date(),
      appointmentTime: "",
      duration: "30",
      type: "",
      notes: ""
    });
    setShowAddDialog(false);
  };

  const updateAppointmentStatus = (appointmentId: string, newStatus: "Completed" | "Cancelled" | "No Show") => {
    setAppointments(appointments.map(apt => 
      apt.id === appointmentId 
        ? { ...apt, status: newStatus, updatedAt: new Date() }
        : apt
    ));
    
    toast({
      title: "Status Updated",
      description: `Appointment status changed to ${newStatus}`,
    });
  };

  const filteredAppointments = appointments.filter(appointment => {
    const patient = patients.find(p => p.id === appointment.patientId);
    const doctor = doctors.find(d => d.id === appointment.doctorId);
    
    const matchesSearch = patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || appointment.status === statusFilter;
    const matchesDate = !selectedDate || 
                       appointment.appointmentDate.toDateString() === selectedDate.toDateString();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled": return "bg-blue-100 text-blue-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      case "No Show": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Consultation": return "bg-blue-100 text-blue-800";
      case "Follow-up": return "bg-green-100 text-green-800";
      case "Emergency": return "bg-red-100 text-red-800";
      case "Surgery": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const todaysAppointments = appointments.filter(apt => 
    apt.appointmentDate.toDateString() === new Date().toDateString()
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointment Scheduling</h1>
          <p className="text-muted-foreground">Manage patient appointments and schedules</p>
        </div>
        {(userRole === "admin" || userRole === "staff") && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Appointment</DialogTitle>
                <DialogDescription>Fill in the appointment details below</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patient">Patient *</Label>
                    <Select onValueChange={(value) => setNewAppointment({...newAppointment, patientId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.map(patient => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="doctor">Doctor *</Label>
                    <Select onValueChange={(value) => setNewAppointment({...newAppointment, doctorId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map(doctor => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name} - {doctor.specialization}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="appointmentTime">Time *</Label>
                    <Select onValueChange={(value) => setNewAppointment({...newAppointment, appointmentTime: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 18}, (_, i) => {
                          const hour = Math.floor(8 + i / 2);
                          const minute = i % 2 === 0 ? "00" : "30";
                          const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                          return (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Select 
                      value={newAppointment.duration} 
                      onValueChange={(value) => setNewAppointment({...newAppointment, duration: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="type">Appointment Type</Label>
                  <Select onValueChange={(value) => setNewAppointment({...newAppointment, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Consultation">Consultation</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="Surgery">Surgery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                    placeholder="Additional notes or instructions"
                  />
                </div>
                <Button onClick={handleAddAppointment} className="w-full">
                  Schedule Appointment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysAppointments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(a => a.status === "Scheduled").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments.filter(a => a.status === "Completed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <CalendarIcon className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${todaysAppointments.reduce((sum, apt) => sum + apt.fee, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Appointment List</CardTitle>
            <CardDescription>
              {selectedDate ? `Appointments for ${selectedDate.toLocaleDateString()}` : "All appointments"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient or doctor..."
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
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="No Show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => {
                  const patient = patients.find(p => p.id === appointment.patientId);
                  const doctor = doctors.find(d => d.id === appointment.doctorId);
                  
                  return (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">{patient?.name}</TableCell>
                      <TableCell>{doctor?.name}</TableCell>
                      <TableCell>
                        {appointment.appointmentDate.toLocaleDateString()} at {appointment.appointmentTime}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(appointment.type)}>
                          {appointment.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>${appointment.fee}</TableCell>
                      <TableCell className="space-x-1">
                        {appointment.status === "Scheduled" && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateAppointmentStatus(appointment.id, "Completed")}
                            >
                              Complete
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => updateAppointmentStatus(appointment.id, "Cancelled")}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentScheduling;
