
-- Create a face_sheets table for IPD case papers / face sheet management

CREATE TABLE public.face_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  age smallint,
  sex text CHECK (sex IN ('M', 'F')),
  prn_no text,
  ipd_no text,
  patient_category text,
  patient_sub_category text,
  date_of_admission date,
  time text,
  consultant_doctor text,
  ref_by_doctor text,
  patient_address text,
  ward_name text,
  bed_no text,
  id_proof_taken text,
  relative_name text,
  contact_no text,
  relative_address text,
  provisional_diagnosis text,
  final_diagnosis text,
  icd_codes text,
  discharge_date date,
  discharge_time text,
  type_of_discharge text CHECK (type_of_discharge IN ('Normal Discharge', 'Against Medical Advice', 'Discharged On Requested', 'Absconded/Died')),
  discharge_card_prepared_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS) for the table
ALTER TABLE public.face_sheets ENABLE ROW LEVEL SECURITY;

-- Make RLS policy permissive for now (anyone can read/write; you can later restrict as needed)
CREATE POLICY "Allow all select on face_sheets" ON public.face_sheets
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all insert on face_sheets" ON public.face_sheets
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow all update on face_sheets" ON public.face_sheets
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow all delete on face_sheets" ON public.face_sheets
  FOR DELETE
  USING (true);
