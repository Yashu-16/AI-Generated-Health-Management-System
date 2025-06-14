import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, UserCheck, Bed, FileText, Plus, LayoutDashboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHospitalStats } from "@/hooks/useHospitalStats";
import PatientManagement from "@/components/PatientManagement";
import DoctorManagement from "@/components/DoctorManagement";
import FaceSheet from "@/components/FaceSheet";
import BillingInvoices from "@/components/BillingInvoices";
import ReportTab from "@/components/ReportTab";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import ActivityLog from "@/components/ActivityLog";
import { ActivityProvider, useActivity } from "@/context/ActivityContext";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<"admin" | "doctor" | "staff">("admin");
  const { data: stats, isLoading: statsLoading } = useHospitalStats();
  const { logActivity } = useActivity();

  useEffect(() => {
    const getUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserRole("admin");
      }
    };
    getUserRole();
  }, [toast]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      logActivity("Signed out.");
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Example handlers logging activities
  const handleCreateInvoice = () => {
    logActivity("Created a new invoice");
    navigate("/billing/create");
  };
  const handleManagePatients = () => {
    logActivity("Accessed Manage Patients");
    const patientsTab = document.querySelector('[value="patients"]') as HTMLElement;
    patientsTab?.click();
  };
  const handleManageDoctors = () => {
    logActivity("Accessed Manage Doctors");
    const doctorsTab = document.querySelector('[value="doctors"]') as HTMLElement;
    doctorsTab?.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white shadow-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">VISION MULTISPECIALTY HOSPITAL</h1>
            <Badge variant="secondary" className="ml-2">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="facesheet">Face Sheet</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <div className="space-y-6">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Patients</CardTitle>
                    <CardDescription>All registered patients</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center space-x-4">
                    <Users className="h-9 w-9 text-gray-500" />
                    <div className="text-3xl font-bold">{statsLoading ? "Loading..." : stats?.totalPatients}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Active Doctors</CardTitle>
                    <CardDescription>Currently working doctors</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center space-x-4">
                    <UserCheck className="h-9 w-9 text-green-500" />
                    <div className="text-3xl font-bold">{statsLoading ? "Loading..." : stats?.activeStaff}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Available Rooms</CardTitle>
                    <CardDescription>Rooms ready for occupancy</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center space-x-4">
                    <Bed className="h-9 w-9 text-blue-500" />
                    <div className="text-3xl font-bold">{statsLoading ? "Loading..." : stats?.availableBeds}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>Scheduled appointments today</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center space-x-4">
                    <CalendarDays className="h-9 w-9 text-orange-500" />
                    <div className="text-3xl font-bold">{statsLoading ? "Loading..." : stats?.todaysAppointments}</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Hospital Dashboard</span>
                  </CardTitle>
                  <CardDescription>Overview of hospital operations and key metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Quick Stats</h3>
                      <div className="grid gap-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">Total Patients</span>
                          <span className="text-lg font-bold text-blue-600">{stats?.totalPatients || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">Active Staff</span>
                          <span className="text-lg font-bold text-green-600">{stats?.activeStaff || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">Available Beds</span>
                          <span className="text-lg font-bold text-orange-600">{stats?.availableBeds || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium">Today's Appointments</span>
                          <span className="text-lg font-bold text-purple-600">{stats?.todaysAppointments || 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Quick Actions</h3>
                      <div className="grid gap-3">
                        <Button 
                          onClick={handleCreateInvoice} 
                          className="justify-start h-12"
                          variant="outline"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create New Invoice
                        </Button>
                        <Button 
                          className="justify-start h-12" 
                          variant="outline"
                          onClick={handleManagePatients}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Manage Patients
                        </Button>
                        <Button 
                          className="justify-start h-12" 
                          variant="outline"
                          onClick={handleManageDoctors}
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Manage Doctors
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <ActivityLog />
            </div>
          </TabsContent>
          <TabsContent value="patients">
            <PatientManagement userRole={userRole} />
          </TabsContent>
          <TabsContent value="doctors">
            <DoctorManagement userRole={userRole} />
          </TabsContent>
          <TabsContent value="facesheet">
            <FaceSheet userRole={userRole} />
          </TabsContent>
          <TabsContent value="billing">
            <BillingInvoices userRole={userRole} />
          </TabsContent>
          <TabsContent value="reports">
            <ReportTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
