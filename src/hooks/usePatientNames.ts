
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PatientNameLite {
  id: string;
  fullName: string;
  age?: number;
  gender?: string;
  phone?: string;
}

export function usePatientNames() {
  return useQuery({
    queryKey: ["patient-names-lite"],
    queryFn: async (): Promise<PatientNameLite[]> => {
      const { data, error } = await supabase
        .from("patients")
        .select("id, full_name, age, gender, phone")
        .order("full_name", { ascending: true });
      if (error) throw error;
      return (
        data?.map((row: any) => ({
          id: row.id,
          fullName: row.full_name,
          age: row.age,
          gender: row.gender,
          phone: row.phone,
        })) ?? []
      );
    },
  });
}
