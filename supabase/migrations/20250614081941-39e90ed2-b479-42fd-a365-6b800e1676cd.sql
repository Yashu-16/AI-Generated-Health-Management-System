
-- Enable RLS for invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Allow all users to select, insert, update, delete for development
CREATE POLICY "Enable read access for all users"
  ON public.invoices
  FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for all users"
  ON public.invoices
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Enable update for all users"
  ON public.invoices
  FOR UPDATE
  USING (true);

CREATE POLICY "Enable delete for all users"
  ON public.invoices
  FOR DELETE
  USING (true);
