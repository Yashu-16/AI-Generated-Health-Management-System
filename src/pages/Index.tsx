
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, FileText, DollarSign, Bed, Activity, Calendar, TrendingUp } from "lucide-react";
import PatientManagement from "@/components/PatientManagement";
import DoctorManagement from "@/components/DoctorManagement";
import MedicalRecords from "@/components/MedicalRecords";
import BillingInvoices from "@/components/BillingInvoices";
import RoomManagement from "@/components/RoomManagement";
import FaceSheet from "@/components/FaceSheet";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userRole] = useState<"admin" | "doctor" | "staff">("admin");

  // Mock hospital stats
  const stats = {
    totalPatients: 156,
    admittedPatients: 89,
    dischargedToday: 12,
    availableBeds: 34,
    occupancyRate: 72,
    totalRevenue: 125000,
    monthlyRevenue: 87500,
    activeStaff: 45,
    criticalPatients: 8
  };

  const renderContent = () => {
    switch (activeTab) {
      case "patients":
        return <PatientManagement userRole={userRole} />;
      case "doctors":
        return <DoctorManagement userRole={userRole} />;
      case "records":
        return <MedicalRecords userRole={userRole} />;
      case "billing":
        return <BillingInvoices userRole={userRole} />;
      case "rooms":
        return <RoomManagement userRole={userRole} />;
      case "facesheet":
        return <FaceSheet userRole={userRole} />;
      default:
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Hospital Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome to the Hospital Information Management System
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPatients}</div>
                  <p className="text-xs text-muted-foreground">
                    +12 from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Beds</CardTitle>
                  <Bed className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.availableBeds}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.occupancyRate}% occupancy rate
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +15% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Critical Patients</CardTitle>
                  <Activity className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.criticalPatients}</div>
                  <p className="text-xs text-muted-foreground">
                    Require immediate attention
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Admissions</CardTitle>
                  <CardDescription>Patients admitted in the last 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">John Doe</p>
                        <p className="text-sm text-muted-foreground">Room 204 - Emergency</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Sarah Wilson</p>
                        <p className="text-sm text-muted-foreground">Room 301 - Planned Surgery</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => setActiveTab("patients")}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add New Patient
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => setActiveTab("facesheet")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Create Face Sheet
                    </Button>
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={() => setActiveTab("billing")}
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Generate Invoice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="mr-8">
            <h2 className="text-2xl font-bold">Hospital IMS</h2>
          </div>
          <div className="flex space-x-4">
            <Button
              variant={activeTab === "dashboard" ? "default" : "ghost"}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </Button>
            <Button
              variant={activeTab === "patients" ? "default" : "ghost"}
              onClick={() => setActiveTab("patients")}
            >
              Patient Management
            </Button>
            <Button
              variant={activeTab === "facesheet" ? "default" : "ghost"}
              onClick={() => setActiveTab("facesheet")}
            >
              Face Sheet
            </Button>
            <Button
              variant={activeTab === "doctors" ? "default" : "ghost"}
              onClick={() => setActiveTab("doctors")}
            >
              Doctor Management
            </Button>
            <Button
              variant={activeTab === "records" ? "default" : "ghost"}
              onClick={() => setActiveTab("records")}
            >
              Medical Records
            </Button>
            <Button
              variant={activeTab === "billing" ? "default" : "ghost"}
              onClick={() => setActiveTab("billing")}
            >
              Billing & Invoices
            </Button>
            <Button
              variant={activeTab === "rooms" ? "default" : "ghost"}
              onClick={() => setActiveTab("rooms")}
            >
              Room Management
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto py-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
