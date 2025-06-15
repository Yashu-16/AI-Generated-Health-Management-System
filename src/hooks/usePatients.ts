import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Patient } from "@/types/hospital";

const table = "patients";

// Utility: Map Supabase row to Patient type
const mapPatient = (row: any): Patient => ({
  id: row.id,
  fullName: row.full_name,
  age: row.age,
  gender: row.gender,
  phone: row.phone,
  email: row.email,
  address: row.address,
  emergencyContact: row.emergency_contact,
  emergencyPhone: row.emergency_phone,
  bloodType: row.blood_type,
  allergies: row.allergies ?? [],
  admissionDate: row.admission_date
    ? (() => {
        if (typeof row.admission_date === "string") {
          // Format is usually "YYYY-MM-DD" or ISO, so parse explicitly as local date
          // Be defensive: if string is in "YYYY-MM-DD", use split for consistent results
          const [y, m, d] = row.admission_date.split("-");
          return new Date(Number(y), Number(m) - 1, Number(d));
        } else if (row.admission_date instanceof Date) {
          return row.admission_date;
        } else {
          return undefined;
        }
      })()
    : undefined,
  dischargeDate: row.discharge_date
    ? (() => {
        if (typeof row.discharge_date === "string") {
          const [y, m, d] = row.discharge_date.split("-");
          return new Date(Number(y), Number(m) - 1, Number(d));
        } else if (row.discharge_date instanceof Date) {
          return row.discharge_date;
        } else {
          return undefined;
        }
      })()
    : undefined,
  status: row.status,
  assignedDoctorId: row.assigned_doctor_id,
  assignedRoomId: row.assigned_room_id,
  insuranceInfo: row.insurance_info,
  medicalHistory: row.medical_history,
  currentDiagnosis: row.current_diagnosis,
  createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
});

// Fetch all patients
export function usePatients() {
  const queryClient = useQueryClient();

  // Get all patients
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [table],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapPatient);
    },
  });

  // Add new patient
  const addPatient = useMutation({
    mutationFn: async (input: Partial<Patient>) => {
      let admissionDate = undefined;
      if (typeof input.admissionDate === "string") {
        // Already formatted as "YYYY-MM-DD"
        admissionDate = input.admissionDate;
      } else if (input.admissionDate instanceof Date) {
        admissionDate = input.admissionDate.toISOString().slice(0, 10); // Always string YYYY-MM-DD
      }

      const insertData = {
        full_name: input.fullName,
        age: input.age,
        gender: input.gender,
        phone: input.phone,
        email: input.email,
        address: input.address,
        emergency_contact: input.emergencyContact,
        emergency_phone: input.emergencyPhone,
        blood_type: input.bloodType,
        allergies: input.allergies,
        admission_date: admissionDate,
        status: input.status,
        assigned_doctor_id: input.assignedDoctorId,
        assigned_room_id: input.assignedRoomId,
        insurance_info: input.insuranceInfo,
        medical_history: input.medicalHistory,
        current_diagnosis: input.currentDiagnosis,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase.from(table).insert([insertData]).select().single();
      if (error) throw error;
      return mapPatient(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
    }
  });

  // Update existing patient
  const updatePatient = useMutation({
    mutationFn: async (input: Partial<Patient> & { id: string }) => {
      const { id, ...fields } = input;
      const updateData = {
        full_name: fields.fullName,
        age: fields.age,
        gender: fields.gender,
        phone: fields.phone,
        email: fields.email,
        address: fields.address,
        emergency_contact: fields.emergencyContact,
        emergency_phone: fields.emergencyPhone,
        blood_type: fields.bloodType,
        allergies: fields.allergies,
        admission_date: fields.admissionDate instanceof Date ? fields.admissionDate.toISOString().slice(0,10) : fields.admissionDate,
        discharge_date: fields.dischargeDate ? fields.dischargeDate.toISOString()?.slice(0,10) : null,
        status: fields.status,
        assigned_doctor_id: fields.assignedDoctorId,
        assigned_room_id: fields.assignedRoomId,
        insurance_info: fields.insuranceInfo,
        medical_history: fields.medicalHistory,
        current_diagnosis: fields.currentDiagnosis,
        updated_at: new Date().toISOString(),
      };
      const { error, data } = await supabase.from(table).update(updateData).eq("id", id).select().single();
      if (error) throw error;
      return mapPatient(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
    }
  });

  // Soft discharge operation (update status/discharge_date)
  const dischargePatient = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await supabase
        .from(table)
        .update({
          status: "Discharged",
          discharge_date: new Date().toISOString().slice(0,10),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
    }
  });

  return {
    patients: data,
    isLoading,
    error,
    refetch,
    addPatient,
    updatePatient,
    dischargePatient,
  };
}
