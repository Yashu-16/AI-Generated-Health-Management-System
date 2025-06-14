
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Doctor } from "@/types/hospital";

// Map DB row to Doctor type
const mapDoctor = (row: any): Doctor => ({
  id: row.id,
  fullName: row.full_name,
  specialization: row.specialization,
  qualification: row.qualification ?? "",
  experience: row.experience ?? 0,
  phone: row.phone ?? "",
  email: row.email ?? "",
  department: row.department ?? "",
  schedule: row.schedule ?? {},
  consultationFee: row.consultation_fee ?? 0,
  status: row.status ?? "Active",
  maxPatientsPerDay: row.max_patients_per_day ?? 0,
  createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
});

const table = "doctors";

export function useDoctors() {
  const queryClient = useQueryClient();

  // Get all doctors
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [table],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapDoctor);
    }
  });

  // Add new doctor
  const addDoctor = useMutation({
    mutationFn: async (input: Partial<Doctor>) => {
      const insertData = {
        full_name: input.fullName,
        specialization: input.specialization,
        qualification: input.qualification,
        experience: input.experience,
        phone: input.phone,
        email: input.email,
        department: input.department,
        schedule: input.schedule, // Accepts object (jsonb)
        consultation_fee: input.consultationFee,
        status: input.status,
        max_patients_per_day: input.maxPatientsPerDay,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase.from(table).insert([insertData]).select().single();
      if (error) throw error;
      return mapDoctor(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
    }
  });

  // You can add update/delete as needed

  return {
    doctors: data,
    isLoading,
    error,
    refetch,
    addDoctor
  };
}
