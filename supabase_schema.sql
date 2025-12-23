-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies (examples)
CREATE POLICY "Users can view their own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Function to handle new user creation automatically via trigger on auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-----------------------------------------------------------
-- TABELAS EXISTENTES
-----------------------------------------------------------

-- Tabela para meses de cada ano
CREATE TABLE IF NOT EXISTS public.months (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    month_name TEXT,
    first_day DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela para estrutura organizacional
CREATE TABLE IF NOT EXISTS public.organizational_structure (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    updated_at TIMESTAMPTZ DEFAULT now(),
    first_day_of_month DATE, -- primeiro dia do mês
    year_month TEXT, -- Ano Mês
    dex TEXT,
    dir TEXT,
    geg TEXT,
    ger TEXT,
    gar TEXT
);

-- Tabelas para cada indicador (Baseado no data.ts)
CREATE TABLE IF NOT EXISTS public.kpi_oee (
    id UUID REFERENCES public.organizational_structure(id) ON DELETE CASCADE PRIMARY KEY,
    numerator FLOAT DEFAULT 0,
    denominator FLOAT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.kpi_availability (
    id UUID REFERENCES public.organizational_structure(id) ON DELETE CASCADE PRIMARY KEY,
    numerator FLOAT DEFAULT 0,
    denominator FLOAT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.kpi_mtbf (
    id UUID REFERENCES public.organizational_structure(id) ON DELETE CASCADE PRIMARY KEY,
    numerator FLOAT DEFAULT 0,
    denominator FLOAT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.kpi_projects (
    id UUID REFERENCES public.organizational_structure(id) ON DELETE CASCADE PRIMARY KEY,
    numerator FLOAT DEFAULT 0,
    denominator FLOAT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.kpi_routes (
    id UUID REFERENCES public.organizational_structure(id) ON DELETE CASCADE PRIMARY KEY,
    numerator FLOAT DEFAULT 0,
    denominator FLOAT DEFAULT 0
);

-- KPI: Backlog
CREATE TABLE IF NOT EXISTS public.kpi_backlog (
    key TEXT PRIMARY KEY,
    "update" TIMESTAMPTZ,
    dia_mes DATE,
    mes TEXT,
    processo TEXT,
    subprocesso TEXT,
    backlog_n FLOAT DEFAULT 0,
    backlog_d FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.kpi_emergency (
    id UUID REFERENCES public.organizational_structure(id) ON DELETE CASCADE PRIMARY KEY,
    numerator FLOAT DEFAULT 0,
    denominator FLOAT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.kpi_budget (
    id UUID REFERENCES public.organizational_structure(id) ON DELETE CASCADE PRIMARY KEY,
    numerator FLOAT DEFAULT 0,
    denominator FLOAT DEFAULT 0
);

-----------------------------------------------------------
-- NOVAS TABELAS (KPI AMS e PROCESSOS)
-----------------------------------------------------------

-- Tabela de Processos
CREATE TABLE IF NOT EXISTS public.process (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    processo TEXT,
    subprocesso TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela KPI AMS
CREATE TABLE IF NOT EXISTS public.kpi_ams (
    key TEXT PRIMARY KEY,
    "update" TIMESTAMPTZ,
    dia_mes DATE,
    mes TEXT,
    processo TEXT,
    subprocesso TEXT,
    ams_n_cont FLOAT DEFAULT 0,
    ams_d_cont FLOAT DEFAULT 0,
    ams_n_calend FLOAT DEFAULT 0,
    ams_d_calend FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);
