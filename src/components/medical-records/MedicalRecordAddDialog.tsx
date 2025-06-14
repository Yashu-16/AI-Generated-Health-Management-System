
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import React from "react";

interface MedicalRecordAddDialogProps {
  show: boolean;
  setShow: (val: boolean) => void;
  newRecord: any;
  setNewRecord: (val: any) => void;
  handleAddRecord: () => void;
  patients: any[];
  doctors: { id: string; name: string }[];
}

export default function MedicalRecordAddDialog({
  show,
  setShow,
  newRecord,
  setNewRecord,
  handleAddRecord,
  patients,
  doctors
}: MedicalRecordAddDialogProps) {
  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Medical Record
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Medical Record</DialogTitle>
          <DialogDescription>Fill in the patient visit details</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patient">Patient *</Label>
              <select 
                className="w-full p-2 border rounded"
                value={newRecord.patientId}
                onChange={(e) => setNewRecord({...newRecord, patientId: e.target.value})}
              >
                <option value="">Select patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="doctor">Doctor *</Label>
              <select 
                className="w-full p-2 border rounded"
                value={newRecord.doctorId}
                onChange={(e) => setNewRecord({...newRecord, doctorId: e.target.value})}
              >
                <option value="">Select doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label htmlFor="chiefComplaint">Chief Complaint *</Label>
            <Textarea
              id="chiefComplaint"
              value={newRecord.chiefComplaint}
              onChange={(e) => setNewRecord({...newRecord, chiefComplaint: e.target.value})}
              placeholder="Primary reason for visit"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                value={newRecord.diagnosis}
                onChange={(e) => setNewRecord({...newRecord, diagnosis: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="treatment">Treatment</Label>
              <Textarea
                id="treatment"
                value={newRecord.treatment}
                onChange={(e) => setNewRecord({...newRecord, treatment: e.target.value})}
              />
            </div>
          </div>
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Vital Signs</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="temperature">Temperature (°F)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={newRecord.temperature}
                  onChange={(e) => setNewRecord({...newRecord, temperature: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="bloodPressure">Blood Pressure</Label>
                <Input
                  id="bloodPressure"
                  value={newRecord.bloodPressure}
                  onChange={(e) => setNewRecord({...newRecord, bloodPressure: e.target.value})}
                  placeholder="120/80"
                />
              </div>
              <div>
                <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                <Input
                  id="heartRate"
                  type="number"
                  value={newRecord.heartRate}
                  onChange={(e) => setNewRecord({...newRecord, heartRate: e.target.value})}
                />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={newRecord.notes}
              onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
              placeholder="Additional notes and observations"
            />
          </div>
          <Button onClick={handleAddRecord} className="w-full">
            Add Medical Record
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
