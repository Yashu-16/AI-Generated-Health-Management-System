
-- Enable RLS for medical_records
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- Allow all users to select, insert, update, delete for development
CREATE POLICY "Enable read access for all users"
  ON public.medical_records
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for all users"
  ON public.medical_records
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for all users"
  ON public.medical_records
  FOR UPDATE
  USING (true);

CREATE POLICY "Enable delete for all users"
  ON public.medical_records
  FOR DELETE
  USING (true);
