
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import React, { useState } from "react";
import MedicalRecordDialog from "./MedicalRecordDialog";
import { MedicalRecord } from "@/types/hospital";

interface MedicalRecordsTableProps {
  records: MedicalRecord[];
  patients: any[];
  doctors: { id: string; name: string }[];
  displayFaceSheet: (snapshot: any) => React.ReactNode;
}

export default function MedicalRecordsTable({
  records,
  patients,
  doctors,
  displayFaceSheet,
}: MedicalRecordsTableProps) {
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Patient</TableHead>
          <TableHead>Doctor</TableHead>
          <TableHead>Visit Date</TableHead>
          <TableHead>Chief Complaint</TableHead>
          <TableHead>Diagnosis</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => {
          const patient = patients.find(p => p.id === record.patientId);
          const doctor = doctors.find(d => d.id === record.doctorId);

          return (
            <TableRow key={record.id}>
              <TableCell className="font-medium">{patient?.name}</TableCell>
              <TableCell>{doctor?.name}</TableCell>
              <TableCell>{record.visitDate.toLocaleDateString()}</TableCell>
              <TableCell className="max-w-xs truncate">{record.chiefComplaint}</TableCell>
              <TableCell className="max-w-xs truncate">{record.diagnosis}</TableCell>
              <TableCell>
                <Dialog open={selectedRecord?.id === record.id} onOpenChange={open => setSelectedRecord(open ? record : null)}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => setSelectedRecord(record)}>
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    {selectedRecord && (
                      <MedicalRecordDialog
                        record={selectedRecord}
                        patientName={patient?.name}
                        doctorName={doctor?.name}
                        displayFaceSheet={displayFaceSheet}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
