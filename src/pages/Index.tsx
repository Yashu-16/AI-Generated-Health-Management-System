
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, UserPlus, Heart, Activity, Bed, IndianRupee, Stethoscope, LogOut } from "lucide-react";

// Import components
import PatientManagement from "@/components/PatientManagement";
import DoctorManagement from "@/components/DoctorManagement";
import BillingInvoices from "@/components/BillingInvoices";
import FaceSheet from "@/components/FaceSheet";

const Index = () => {
  const [userRole] = useState<"admin" | "doctor" | "staff">("admin");

  const handleLogout = () => {
    window.location.reload();
  };

  // Mock data for dashboard
  const hospitalStats = {
    totalPatients: 245,
    admittedPatients: 89,
    dischargedToday: 12,
    availableBeds: 156,
    occupancyRate: 78,
    todaysAppointments: 34,
    totalRevenue: 2450000,
    monthlyRevenue: 12750000,
    activeStaff: 45,
    criticalPatients: 3
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-2 rounded-full">
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">VISION MULTISPECIALITY HOSPITAL</h1>
                <p className="text-blue-100">Healthcare Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-500 text-white">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </Badge>
              <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-blue-700">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-blue-100">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Dashboard</TabsTrigger>
            <TabsTrigger value="patients" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Patients</TabsTrigger>
            <TabsTrigger value="doctors" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Doctors</TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Billing</TabsTrigger>
            <TabsTrigger value="facesheet" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Face Sheet</TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-blue-800">Dashboard</h2>
              <p className="text-muted-foreground">Welcome to Vision Multispeciality Hospital Management System</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">Total Patients</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-800">{hospitalStats.totalPatients}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">Admitted Today</CardTitle>
                  <UserPlus className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-800">{hospitalStats.admittedPatients}</div>
                  <p className="text-xs text-muted-foreground">
                    {hospitalStats.dischargedToday} discharged
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">Available Beds</CardTitle>
                  <Bed className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-800">{hospitalStats.availableBeds}</div>
                  <p className="text-xs text-muted-foreground">
                    {hospitalStats.occupancyRate}% occupancy rate
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">Today's Revenue</CardTitle>
                  <IndianRupee className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-800">₹{hospitalStats.totalRevenue.toLocaleString('en-IN')}</div>
                  <p className="text-xs text-muted-foreground">
                    Monthly: ₹{hospitalStats.monthlyRevenue.toLocaleString('en-IN')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-700 flex items-center">
                    <CalendarDays className="h-5 w-5 mr-2" />
                    Today's Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-800">{hospitalStats.todaysAppointments}</div>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-700 flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Active Staff
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-800">{hospitalStats.activeStaff}</div>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-red-700 flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    Critical Patients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{hospitalStats.criticalPatients}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patients">
            <PatientManagement userRole={userRole} />
          </TabsContent>

          <TabsContent value="doctors">
            <DoctorManagement userRole={userRole} />
          </TabsContent>

          <TabsContent value="billing">
            <BillingInvoices userRole={userRole} />
          </TabsContent>

          <TabsContent value="facesheet">
            <FaceSheet />
          </TabsContent>

          <TabsContent value="reports">
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-700">Reports & Analytics</CardTitle>
                <CardDescription>Generate and view hospital reports</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Reports module coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
