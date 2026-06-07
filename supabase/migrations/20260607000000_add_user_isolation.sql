-- Isolamento por usuário: cada registro pertence a um auth.users
-- Dados globais existentes não têm dono identificável e são removidos.

DELETE FROM public.transacoes;
DELETE FROM public.cofrinho;
DELETE FROM public.categorias;

DROP POLICY IF EXISTS "categorias_all" ON public.categorias;
DROP POLICY IF EXISTS "transacoes_all" ON public.transacoes;
DROP POLICY IF EXISTS "cofrinho_all" ON public.cofrinho;

ALTER TABLE public.categorias
  ADD COLUMN user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.transacoes
  ADD COLUMN user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.cofrinho
  ADD COLUMN user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX categorias_user_id_idx ON public.categorias(user_id);
CREATE INDEX transacoes_user_id_idx ON public.transacoes(user_id);
CREATE INDEX cofrinho_user_id_idx ON public.cofrinho(user_id);

CREATE POLICY "categorias_own" ON public.categorias
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transacoes_own" ON public.transacoes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "cofrinho_own" ON public.cofrinho
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.seed_default_categories(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.categorias WHERE user_id = p_user_id) THEN
    RETURN;
  END IF;

  INSERT INTO public.categorias (name, type, color, user_id) VALUES
    ('Salário', 'receita', '#3b82f6', p_user_id),
    ('Alimentação', 'despesa', '#f59e0b', p_user_id),
    ('Moradia', 'despesa', '#ef4444', p_user_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user_finance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.seed_default_categories(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_finance ON auth.users;

CREATE TRIGGER on_auth_user_created_finance
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_finance();

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM auth.users LOOP
    PERFORM public.seed_default_categories(r.id);
  END LOOP;
END $$;
