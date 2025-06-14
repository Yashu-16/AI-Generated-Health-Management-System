
-- Allow full access to everyone for doctors table (for development)
CREATE POLICY "Enable read access for all users"
  ON public.doctors
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for all users"
  ON public.doctors
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for all users"
  ON public.doctors
  FOR UPDATE
  USING (true);

CREATE POLICY "Enable delete for all users"
  ON public.doctors
  FOR DELETE
  USING (true);
