-- ============================================================
-- MJ Fitness – Setup das Tabelas no Supabase
-- Execute este script no Supabase Dashboard → SQL Editor
-- ============================================================

-- Tabela de Alunos
CREATE TABLE IF NOT EXISTS public.students (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome             TEXT NOT NULL,
  cpf              TEXT,
  telefone         TEXT,
  plano            TEXT NOT NULL DEFAULT 'Plano Mensal – R$ 100,00',
  data_matricula   DATE NOT NULL,
  data_vencimento  DATE NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Transações (pagamentos)
CREATE TABLE IF NOT EXISTS public.transactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID REFERENCES public.students(id) ON DELETE CASCADE,
  student_name     TEXT NOT NULL,
  valor            NUMERIC NOT NULL DEFAULT 100,
  forma_pagamento  TEXT NOT NULL,
  data_pagamento   DATE NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE public.students     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_students"     ON public.students     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
