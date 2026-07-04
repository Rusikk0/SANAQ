-- Новые функции для «АвтоЗапчасти» — миграция схемы Supabase
-- Выполните этот код в SQL Editor вашего проекта Supabase

-- 1. Добавление колонки совместимости в таблицу товаров
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS compatibility TEXT NOT NULL DEFAULT '';

-- 2. Таблица списаний (брак, утеря и др.)
CREATE TABLE IF NOT EXISTS public.write_offs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_code TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL,
  reason TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  user_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS для списаний (только администратор)
ALTER TABLE public.write_offs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "write_offs_select_admin" ON public.write_offs
  FOR SELECT TO authenticated
  USING (public.is_store_admin(store_id));

CREATE POLICY "write_offs_write_admin" ON public.write_offs
  FOR ALL TO authenticated
  USING (public.is_store_admin(store_id))
  WITH CHECK (public.is_store_admin(store_id));

-- 3. Таблица ревизий (инвентаризаций)
CREATE TABLE IF NOT EXISTS public.audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  items JSONB NOT NULL, -- Список корректировок [{product_id, code, name, qty_system, qty_fact, diff}]
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS для ревизий (только администратор)
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audits_select_admin" ON public.audits
  FOR SELECT TO authenticated
  USING (public.is_store_admin(store_id));

CREATE POLICY "audits_write_admin" ON public.audits
  FOR ALL TO authenticated
  USING (public.is_store_admin(store_id))
  WITH CHECK (public.is_store_admin(store_id));

-- 4. Таблица возвратов (логирование возвратов)
CREATE TABLE IF NOT EXISTS public.returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_code TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL,
  refund_amount NUMERIC(14, 2) NOT NULL,
  user_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS для возвратов (чтение и добавление доступно участникам магазина, изменение — админу)
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "returns_select" ON public.returns
  FOR SELECT TO authenticated
  USING (public.is_store_member(store_id));

CREATE POLICY "returns_insert" ON public.returns
  FOR INSERT TO authenticated
  WITH CHECK (public.is_store_member(store_id));

CREATE POLICY "returns_update_admin" ON public.returns
  FOR UPDATE TO authenticated
  USING (public.is_store_admin(store_id))
  WITH CHECK (public.is_store_admin(store_id));

-- 5. Добавление колонок разделения оплаты в таблицу продаж (для смешанной оплаты)
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS cash_amount NUMERIC(14, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS kaspi_amount NUMERIC(14, 2) NOT NULL DEFAULT 0;

