-- Suporte a múltiplos cofrinhos com nome
ALTER TABLE public.cofrinho
  ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT 'Cofrinho',
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

UPDATE public.cofrinho SET name = 'Cofrinho' WHERE name IS NULL OR name = '';
