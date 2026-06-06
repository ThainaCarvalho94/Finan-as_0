-- Remove tabela antiga
DROP TABLE IF EXISTS public.clientes CASCADE;

-- Categorias
CREATE TABLE public.categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('receita', 'despesa')),
  color text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Transações
CREATE TABLE public.transacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL,
  category_id uuid NOT NULL REFERENCES public.categorias(id) ON DELETE RESTRICT,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  date date NOT NULL,
  tag text NOT NULL DEFAULT '',
  type text NOT NULL CHECK (type IN ('receita', 'despesa')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Cofrinho (singleton)
CREATE TABLE public.cofrinho (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal numeric(12, 2) NOT NULL DEFAULT 0 CHECK (goal >= 0),
  saved numeric(12, 2) NOT NULL DEFAULT 0 CHECK (saved >= 0),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS com acesso público (app sem autenticação por enquanto)
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cofrinho ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categorias_all" ON public.categorias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "transacoes_all" ON public.transacoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "cofrinho_all" ON public.cofrinho FOR ALL USING (true) WITH CHECK (true);

-- 3 categorias
INSERT INTO public.categorias (id, name, type, color) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Salário', 'receita', '#3b82f6'),
  ('11111111-1111-1111-1111-111111111102', 'Alimentação', 'despesa', '#f59e0b'),
  ('11111111-1111-1111-1111-111111111103', 'Moradia', 'despesa', '#ef4444');

-- 3 receitas
INSERT INTO public.transacoes (id, description, category_id, amount, date, tag, type) VALUES
  ('22222222-2222-2222-2222-222222222201', 'Salário mensal', '11111111-1111-1111-1111-111111111101', 7500.00, '2026-06-05', 'fixo', 'receita'),
  ('22222222-2222-2222-2222-222222222202', 'Projeto freelance', '11111111-1111-1111-1111-111111111101', 1200.00, '2026-06-12', 'extra', 'receita'),
  ('22222222-2222-2222-2222-222222222203', 'Dividendos', '11111111-1111-1111-1111-111111111101', 420.00, '2026-06-15', 'passivo', 'receita');

-- 3 despesas
INSERT INTO public.transacoes (id, description, category_id, amount, date, tag, type) VALUES
  ('33333333-3333-3333-3333-333333333301', 'Aluguel', '11111111-1111-1111-1111-111111111103', 2200.00, '2026-06-10', 'fixo', 'despesa'),
  ('33333333-3333-3333-3333-333333333302', 'Supermercado', '11111111-1111-1111-1111-111111111102', 950.00, '2026-06-08', 'essencial', 'despesa'),
  ('33333333-3333-3333-3333-333333333303', 'Combustível e app', '11111111-1111-1111-1111-111111111102', 480.00, '2026-06-18', 'essencial', 'despesa');

-- Cofrinho inicial
INSERT INTO public.cofrinho (id, goal, saved) VALUES
  ('44444444-4444-4444-4444-444444444401', 10000.00, 3500.00);
