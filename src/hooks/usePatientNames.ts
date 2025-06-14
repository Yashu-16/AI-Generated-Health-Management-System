
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Minimal type for drop-downs and display
export interface PatientBasic {
  id: string;
  fullName: string;
  email?: string;
}

export function usePatientNames() {
  return useQuery({
    queryKey: ["patients", "basic"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("id, full_name, email")
        .order("full_name", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        id: row.id,
        fullName: row.full_name,
        email: row.email,
      }));
    },
  });
}
