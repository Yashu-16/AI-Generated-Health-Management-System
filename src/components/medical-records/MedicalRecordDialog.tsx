
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MedicalRecord, Medication, LabResult, Patient } from "@/types/hospital";
import React from "react";

interface MedicalRecordDialogProps {
  record: MedicalRecord;
  patientName?: string;
  doctorName?: string;
  displayFaceSheet: (snapshot: any) => React.ReactNode;
  onClose?: () => void;
}

const getLabStatusColor = (status: string) => {
  switch (status) {
    case "Normal": return "bg-green-100 text-green-800";
    case "Abnormal": return "bg-yellow-100 text-yellow-800";
    case "Critical": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function MedicalRecordDialog({
  record,
  patientName,
  doctorName,
  displayFaceSheet,
}: MedicalRecordDialogProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Medical Record Details</DialogTitle>
        <DialogDescription>
          {patientName} - {record.visitDate.toLocaleDateString()}
        </DialogDescription>
      </DialogHeader>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="face-sheet">Face Sheet</TabsTrigger>
          <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="labs">Lab Results</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label className="font-semibold">Chief Complaint</Label>
              <p className="text-sm text-muted-foreground mt-1">{record.chiefComplaint}</p>
            </div>
            <div>
              <Label className="font-semibold">Diagnosis</Label>
              <p className="text-sm text-muted-foreground mt-1">{record.diagnosis}</p>
            </div>
            <div>
              <Label className="font-semibold">Treatment</Label>
              <p className="text-sm text-muted-foreground mt-1">{record.treatment}</p>
            </div>
            <div>
              <Label className="font-semibold">Notes</Label>
              <p className="text-sm text-muted-foreground mt-1">{record.notes}</p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="face-sheet" className="space-y-4">
          <h3 className="font-semibold">Face Sheet Snapshot (At Visit Time)</h3>
          {displayFaceSheet(record.faceSheetSnapshot)}
        </TabsContent>
        <TabsContent value="vitals" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <Label className="font-semibold">Temperature</Label>
              <p className="text-2xl font-bold">{record.vitalSigns.temperature}°F</p>
            </div>
            <div className="p-4 border rounded">
              <Label className="font-semibold">Blood Pressure</Label>
              <p className="text-2xl font-bold">{record.vitalSigns.bloodPressure}</p>
            </div>
            <div className="p-4 border rounded">
              <Label className="font-semibold">Heart Rate</Label>
              <p className="text-2xl font-bold">{record.vitalSigns.heartRate} bpm</p>
            </div>
            <div className="p-4 border rounded">
              <Label className="font-semibold">O2 Saturation</Label>
              <p className="text-2xl font-bold">{record.vitalSigns.oxygenSaturation}%</p>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="medications" className="space-y-4">
          {record.medications.map((med: Medication, i: number) => (
            <div key={i} className="p-4 border rounded">
              <div className="font-semibold">{med.name}</div>
              <div className="text-sm text-muted-foreground">
                {med.dosage} - {med.frequency} for {med.duration}
              </div>
              <div className="text-sm mt-1">{med.instructions}</div>
            </div>
          ))}
        </TabsContent>
        <TabsContent value="labs" className="space-y-4">
          {record.labResults?.map((lab: LabResult, i: number) => (
            <div key={i} className="p-4 border rounded">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{lab.testName}</div>
                  <div className="text-sm text-muted-foreground">
                    Normal Range: {lab.normalRange}
                  </div>
                </div>
                <Badge className={getLabStatusColor(lab.status)}>
                  {lab.status}
                </Badge>
              </div>
              <div className="text-lg font-bold mt-2">{lab.result}</div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </>
  );
}
