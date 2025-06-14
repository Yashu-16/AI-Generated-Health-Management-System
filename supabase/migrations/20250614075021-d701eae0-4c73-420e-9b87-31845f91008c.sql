
-- Allow full access to everyone for patients table (for development)
CREATE POLICY "Enable read access for all users"
  ON public.patients
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for all users"
  ON public.patients
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for all users"
  ON public.patients
  FOR UPDATE
  USING (true);

CREATE POLICY "Enable delete for all users"
  ON public.patients
  FOR DELETE
  USING (true);
