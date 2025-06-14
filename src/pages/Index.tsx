import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, UserCheck, Bed, FileText, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHospitalStats } from "@/hooks/useHospitalStats";
import PatientManagement from "@/components/PatientManagement";
import DoctorManagement from "@/components/DoctorManagement";
import AppointmentScheduling from "@/components/AppointmentScheduling";
import MedicalRecords from "@/components/MedicalRecords";
import RoomManagement from "@/components/RoomManagement";
import BillingInvoices from "@/components/BillingInvoices";
import ReportTab from "@/components/ReportTab";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<"admin" | "doctor" | "staff">("admin");
  const { data: stats, isLoading: statsLoading } = useHospitalStats();

  useEffect(() => {
    const getUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch the user's role from the 'profiles' table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single(); // Assuming 'id' is the user ID column in your 'profiles' table

        if (profileError) {
          console.error("Error fetching user role:", profileError);
          toast({
            title: "Error fetching user role",
            description: "Failed to determine your role. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (profileData && profileData.role) {
          setUserRole(profileData.role);
        } else {
          console.warn("User role not found in profile, defaulting to 'staff'");
          setUserRole("staff"); // Default role if not found
        }
      }
    };

    getUserRole();
  }, [toast]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white shadow-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Hospital Management System</h1>
            <Badge variant="secondary" className="ml-2">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate("/billing/create")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
              <div className="text-3xl font-bold">{statsLoading ? "Loading..." : stats?.activeDoctors}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Rooms</CardTitle>
              <CardDescription>Rooms ready for occupancy</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center space-x-4">
              <Bed className="h-9 w-9 text-blue-500" />
              <div className="text-3xl font-bold">{statsLoading ? "Loading..." : stats?.availableRooms}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Scheduled appointments today</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center space-x-4">
              <CalendarDays className="h-9 w-9 text-orange-500" />
              <div className="text-3xl font-bold">{statsLoading ? "Loading..." : stats?.upcomingAppointments}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="medical-records">Medical Records</TabsTrigger>
            <TabsTrigger value="rooms">Rooms</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="patients">
            <PatientManagement />
          </TabsContent>
          <TabsContent value="doctors">
            <DoctorManagement />
          </TabsContent>
          <TabsContent value="appointments">
            <AppointmentScheduling />
          </TabsContent>
          <TabsContent value="medical-records">
            <MedicalRecords />
          </TabsContent>
          <TabsContent value="rooms">
            <RoomManagement />
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
