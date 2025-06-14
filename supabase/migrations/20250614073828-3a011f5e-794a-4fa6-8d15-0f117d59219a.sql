
-- 1. Create rooms table first (required as dependency for other FKs)
CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number text NOT NULL,
  type text CHECK (type IN ('General', 'ICU', 'Private', 'Semi-Private', 'Emergency', 'Surgery')),
  floor smallint,
  capacity smallint,
  current_occupancy smallint,
  status text CHECK (status IN ('Available', 'Occupied', 'Maintenance', 'Reserved')),
  daily_rate numeric,
  amenities text[],
  assigned_patients uuid[],
  last_cleaned date,
  equipment text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create patients table
CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  age smallint,
  gender text CHECK (gender IN ('Male', 'Female', 'Other')),
  phone text,
  email text,
  address text,
  emergency_contact text,
  emergency_phone text,
  blood_type text,
  allergies text[],
  admission_date date,
  discharge_date date,
  status text CHECK (status IN ('Admitted', 'Discharged', 'Critical', 'Stable')),
  assigned_doctor_id uuid,
  assigned_room_id uuid,
  insurance_info text,
  medical_history text,
  current_diagnosis text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Create doctors table
CREATE TABLE public.doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  specialization text,
  qualification text,
  experience smallint,
  phone text,
  email text,
  department text,
  schedule jsonb,
  consultation_fee numeric,
  status text CHECK (status IN ('Active', 'On Leave', 'Inactive')),
  max_patients_per_day smallint,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Create appointments table (with reference to rooms)
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  doctor_id uuid REFERENCES public.doctors(id) ON DELETE SET NULL,
  appointment_date date,
  appointment_time text,
  duration smallint,
  type text CHECK (type IN ('Consultation', 'Follow-up', 'Emergency', 'Surgery')),
  status text CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'No Show')),
  notes text,
  fee numeric,
  room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Create medical_records table
CREATE TABLE public.medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES public.doctors(id) ON DELETE SET NULL,
  visit_date date,
  chief_complaint text,
  diagnosis text,
  treatment text,
  medications jsonb,
  vital_signs jsonb,
  lab_results jsonb,
  notes text,
  follow_up_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. Create invoices table (with reference to rooms)
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE SET NULL,
  invoice_number text,
  issue_date date,
  due_date date,
  items jsonb,
  subtotal numeric,
  tax numeric,
  discount numeric,
  total numeric,
  status text CHECK (status IN ('Pending', 'Paid', 'Overdue', 'Cancelled')),
  payment_method text,
  payment_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7. Create users table (for staff/admins)
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  email text UNIQUE NOT NULL,
  role text CHECK (role IN ('admin', 'doctor', 'staff')),
  full_name text,
  phone text,
  department text,
  permissions text[],
  is_active boolean DEFAULT TRUE,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8. Enable Row Level Security for all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
