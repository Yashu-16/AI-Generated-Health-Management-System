
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { FileText, Activity, TestTube } from "lucide-react";
import React from "react";
import { MedicalRecord } from "@/types/hospital";

interface MedicalRecordStatsProps {
  medicalRecords: MedicalRecord[];
}

export default function MedicalRecordStats({ medicalRecords }: MedicalRecordStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Records</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{medicalRecords.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <Activity className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {medicalRecords.filter(r => 
              r.visitDate.getMonth() === new Date().getMonth()
            ).length}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Critical Results</CardTitle>
          <TestTube className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {medicalRecords.reduce((count, record) => 
              count + (record.labResults?.filter(lab => lab.status === "Critical").length || 0), 0
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Follow-ups Due</CardTitle>
          <FileText className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {medicalRecords.filter(r => 
              r.followUpDate && r.followUpDate >= new Date()
            ).length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
