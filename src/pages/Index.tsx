
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserCheck, Calendar, DollarSign, Bed, User, Stethoscope, FileText, CreditCard, Building } from "lucide-react";
import PatientManagement from "@/components/PatientManagement";
import DoctorManagement from "@/components/DoctorManagement";
import AppointmentScheduling from "@/components/AppointmentScheduling";
import MedicalRecords from "@/components/MedicalRecords";
import BillingInvoices from "@/components/BillingInvoices";
import RoomManagement from "@/components/RoomManagement";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [userRole, setUserRole] = useState<"admin" | "doctor" | "staff">("admin");
  const { toast } = useToast();

  // Mock data for dashboard stats
  const dashboardStats = {
    totalPatients: 156,
    availableBeds: 24,
    todaysAppointments: 18,
    totalRevenue: 125000,
    occupancyRate: 78,
    activeStaff: 45
  };

  const modules = [
    { id: "dashboard", name: "Dashboard", icon: Users, description: "Overview & Statistics" },
    { id: "patients", name: "Patient Management", icon: User, description: "Manage patient records" },
    { id: "doctors", name: "Doctor Management", icon: Stethoscope, description: "Manage medical staff" },
    { id: "appointments", name: "Appointments", icon: Calendar, description: "Schedule & manage appointments" },
    { id: "records", name: "Medical Records", icon: FileText, description: "Patient medical history" },
    { id: "billing", name: "Billing & Invoices", icon: CreditCard, description: "Financial management" },
    { id: "rooms", name: "Room Management", icon: Building, description: "Bed allocation & occupancy" }
  ];

  const StatCard = ({ title, value, icon: Icon, trend, color = "blue" }: any) => (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <Badge variant={trend > 0 ? "default" : "secondary"} className="mt-2">
            {trend > 0 ? "+" : ""}{trend}% from last month
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hospital Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening at your hospital today.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">Role: {userRole}</Badge>
          <Button 
            variant="outline" 
            onClick={() => setUserRole(userRole === "admin" ? "doctor" : userRole === "doctor" ? "staff" : "admin")}
          >
            Switch Role
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Patients" 
          value={dashboardStats.totalPatients} 
          icon={Users} 
          trend={8}
          color="blue"
        />
        <StatCard 
          title="Available Beds" 
          value={dashboardStats.availableBeds} 
          icon={Bed} 
          trend={-2}
          color="green"
        />
        <StatCard 
          title="Today's Appointments" 
          value={dashboardStats.todaysAppointments} 
          icon={Calendar} 
          trend={12}
          color="purple"
        />
        <StatCard 
          title="Total Revenue" 
          value={`$${dashboardStats.totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          trend={15}
          color="yellow"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" onClick={() => setActiveModule("patients")}>
              <User className="mr-2 h-4 w-4" />
              Add New Patient
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setActiveModule("appointments")}>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Appointment
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setActiveModule("rooms")}>
              <Building className="mr-2 h-4 w-4" />
              Check Room Availability
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => setActiveModule("billing")}>
              <CreditCard className="mr-2 h-4 w-4" />
              Generate Invoice
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest hospital updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Patient John Doe admitted to Room 204</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Dr. Smith completed surgery</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm">Room 301 maintenance completed</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm">New appointment scheduled</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderActiveModule = () => {
    switch (activeModule) {
      case "patients":
        return <PatientManagement userRole={userRole} />;
      case "doctors":
        return <DoctorManagement userRole={userRole} />;
      case "appointments":
        return <AppointmentScheduling userRole={userRole} />;
      case "records":
        return <MedicalRecords userRole={userRole} />;
      case "billing":
        return <BillingInvoices userRole={userRole} />;
      case "rooms":
        return <RoomManagement userRole={userRole} />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-8">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">MedAdmin</h2>
                <p className="text-xs text-muted-foreground">Hospital Management</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              {modules.map((module) => (
                <Button
                  key={module.id}
                  variant={activeModule === module.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveModule(module.id)}
                >
                  <module.icon className="mr-3 h-4 w-4" />
                  <div className="text-left">
                    <div className="text-sm font-medium">{module.name}</div>
                  </div>
                </Button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {renderActiveModule()}
        </div>
      </div>
    </div>
  );
};

export default Index;
