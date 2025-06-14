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
import ReportTab from "@/components/ReportTab";

// Import stats hook
import { useHospitalStats } from "@/hooks/useHospitalStats";

const Index = () => {
  const [userRole] = useState<"admin" | "doctor" | "staff">("admin");

  const handleLogout = () => {
    window.location.reload();
  };

  // Fetch real-time stats
  const { data: hospitalStats, isLoading, error } = useHospitalStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-[#102042] text-primary-foreground rounded-t-xl shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white p-2 rounded-full">
                <Stethoscope className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">VISION MULTISPECIALITY HOSPITAL</h1>
                <p className="text-primary-foreground/80 text-white/90">Healthcare Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="rounded-full font-bold text-black px-6 py-1 text-lg bg-white">
                Admin
              </Badge>
              <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-white/10 transition">
                <LogOut className="h-4 w-4 mr-2" />
                <span className="text-white">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="facesheet">Face Sheet</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">Welcome to Vision Multispeciality Hospital Management System</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {isLoading ? (
                <div className="col-span-4 flex justify-center py-12">
                  <span>Loading dashboard stats...</span>
                </div>
              ) : error ? (
                <div className="col-span-4 flex justify-center text-red-600 py-12">
                  Error loading stats.
                </div>
              ) : hospitalStats && (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{hospitalStats.totalPatients}</div>
                      {/* Optionally, you can implement % from last month via code */}
                      {/* <p className="text-xs text-muted-foreground">
                        +8% from last month
                      </p> */}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Currently Admitted</CardTitle>
                      <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{hospitalStats.admittedPatients}</div>
                      <p className="text-xs text-muted-foreground">
                        {hospitalStats.dischargedToday} discharged today
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Available Beds</CardTitle>
                      <Bed className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{hospitalStats.availableBeds}</div>
                      <p className="text-xs text-muted-foreground">
                        {hospitalStats.occupancyRate}% occupancy rate
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                      <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹{Number(hospitalStats.totalRevenue).toLocaleString('en-IN')}</div>
                      <p className="text-xs text-muted-foreground">
                        Monthly: ₹{Number(hospitalStats.monthlyRevenue).toLocaleString('en-IN')}
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Additional Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              {isLoading ? (
                <div className="col-span-3 flex justify-center py-8">
                  <span>Loading stats...</span>
                </div>
              ) : error ? (
                <div className="col-span-3 flex justify-center text-red-600 py-8">
                  Error loading stats.
                </div>
              ) : hospitalStats && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CalendarDays className="h-5 w-5 mr-2" />
                        Today's Appointments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{hospitalStats.todaysAppointments}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Activity className="h-5 w-5 mr-2" />
                        Active Staff
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{hospitalStats.activeStaff}</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
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
                </>
              )}
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
            <FaceSheet userRole={userRole} />
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
