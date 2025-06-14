export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string | null
          appointment_time: string | null
          created_at: string | null
          doctor_id: string | null
          duration: number | null
          fee: number | null
          id: string
          notes: string | null
          patient_id: string | null
          room_id: string | null
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_date?: string | null
          appointment_time?: string | null
          created_at?: string | null
          doctor_id?: string | null
          duration?: number | null
          fee?: number | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          room_id?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string | null
          appointment_time?: string | null
          created_at?: string | null
          doctor_id?: string | null
          duration?: number | null
          fee?: number | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          room_id?: string | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          consultation_fee: number | null
          created_at: string | null
          department: string | null
          email: string | null
          experience: number | null
          full_name: string
          id: string
          max_patients_per_day: number | null
          phone: string | null
          qualification: string | null
          schedule: Json | null
          specialization: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          consultation_fee?: number | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          experience?: number | null
          full_name: string
          id?: string
          max_patients_per_day?: number | null
          phone?: string | null
          qualification?: string | null
          schedule?: Json | null
          specialization?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          consultation_fee?: number | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          experience?: number | null
          full_name?: string
          id?: string
          max_patients_per_day?: number | null
          phone?: string | null
          qualification?: string | null
          schedule?: Json | null
          specialization?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string | null
          discount: number | null
          due_date: string | null
          id: string
          invoice_number: string | null
          issue_date: string | null
          items: Json | null
          notes: string | null
          patient_id: string | null
          payment_date: string | null
          payment_method: string | null
          status: string | null
          subtotal: number | null
          tax: number | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          discount?: number | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          issue_date?: string | null
          items?: Json | null
          notes?: string | null
          patient_id?: string | null
          payment_date?: string | null
          payment_method?: string | null
          status?: string | null
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          discount?: number | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          issue_date?: string | null
          items?: Json | null
          notes?: string | null
          patient_id?: string | null
          payment_date?: string | null
          payment_method?: string | null
          status?: string | null
          subtotal?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          chief_complaint: string | null
          created_at: string | null
          diagnosis: string | null
          doctor_id: string | null
          face_sheet_snapshot: Json | null
          follow_up_date: string | null
          id: string
          lab_results: Json | null
          medications: Json | null
          notes: string | null
          patient_id: string | null
          treatment: string | null
          updated_at: string | null
          visit_date: string | null
          vital_signs: Json | null
        }
        Insert: {
          chief_complaint?: string | null
          created_at?: string | null
          diagnosis?: string | null
          doctor_id?: string | null
          face_sheet_snapshot?: Json | null
          follow_up_date?: string | null
          id?: string
          lab_results?: Json | null
          medications?: Json | null
          notes?: string | null
          patient_id?: string | null
          treatment?: string | null
          updated_at?: string | null
          visit_date?: string | null
          vital_signs?: Json | null
        }
        Update: {
          chief_complaint?: string | null
          created_at?: string | null
          diagnosis?: string | null
          doctor_id?: string | null
          face_sheet_snapshot?: Json | null
          follow_up_date?: string | null
          id?: string
          lab_results?: Json | null
          medications?: Json | null
          notes?: string | null
          patient_id?: string | null
          treatment?: string | null
          updated_at?: string | null
          visit_date?: string | null
          vital_signs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          admission_date: string | null
          age: number | null
          allergies: string[] | null
          assigned_doctor_id: string | null
          assigned_room_id: string | null
          blood_type: string | null
          created_at: string | null
          current_diagnosis: string | null
          discharge_date: string | null
          email: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          full_name: string
          gender: string | null
          id: string
          insurance_info: string | null
          medical_history: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          admission_date?: string | null
          age?: number | null
          allergies?: string[] | null
          assigned_doctor_id?: string | null
          assigned_room_id?: string | null
          blood_type?: string | null
          created_at?: string | null
          current_diagnosis?: string | null
          discharge_date?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name: string
          gender?: string | null
          id?: string
          insurance_info?: string | null
          medical_history?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          admission_date?: string | null
          age?: number | null
          allergies?: string[] | null
          assigned_doctor_id?: string | null
          assigned_room_id?: string | null
          blood_type?: string | null
          created_at?: string | null
          current_diagnosis?: string | null
          discharge_date?: string | null
          email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          insurance_info?: string | null
          medical_history?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rooms: {
        Row: {
          amenities: string[] | null
          assigned_patients: string[] | null
          capacity: number | null
          created_at: string | null
          current_occupancy: number | null
          daily_rate: number | null
          equipment: string[] | null
          floor: number | null
          id: string
          last_cleaned: string | null
          room_number: string
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          amenities?: string[] | null
          assigned_patients?: string[] | null
          capacity?: number | null
          created_at?: string | null
          current_occupancy?: number | null
          daily_rate?: number | null
          equipment?: string[] | null
          floor?: number | null
          id?: string
          last_cleaned?: string | null
          room_number: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          amenities?: string[] | null
          assigned_patients?: string[] | null
          capacity?: number | null
          created_at?: string | null
          current_occupancy?: number | null
          daily_rate?: number | null
          equipment?: string[] | null
          floor?: number | null
          id?: string
          last_cleaned?: string | null
          room_number?: string
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          department: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          permissions: string[] | null
          phone: string | null
          role: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          permissions?: string[] | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          permissions?: string[] | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
