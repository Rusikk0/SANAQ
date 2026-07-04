-- ============================================================
-- SANAQ — ПОЛНАЯ МИГРАЦИЯ БАЗЫ ДАННЫХ
-- Выполните ВЕСЬ файл в Supabase SQL Editor (один раз)
-- ============================================================

-- ============================================================
-- 01_schema.sql — Базовая схема
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stores_owner ON public.stores(owner_id);

CREATE TABLE IF NOT EXISTS public.store_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'cashier')),
  display_name TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_store_members_user ON public.store_members(user_id);
CREATE INDEX IF NOT EXISTS idx_store_members_store ON public.store_members(store_id);

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, name)
);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  barcode TEXT NOT NULL DEFAULT '',
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
  purchase_price NUMERIC(14, 2) NOT NULL DEFAULT 0,
  price NUMERIC(14, 2) NOT NULL DEFAULT 0,
  min_stock NUMERIC(12, 2) NOT NULL DEFAULT 5,
  info TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, code)
);

CREATE INDEX IF NOT EXISTS idx_products_store ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(store_id, barcode);

CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  name TEXT NOT NULL,
  spent NUMERIC(14, 2) NOT NULL DEFAULT 0,
  bonus_balance NUMERIC(14, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customers_store_phone ON public.customers(store_id, phone);

CREATE TABLE IF NOT EXISTS public.loyalty_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  card_number TEXT NOT NULL DEFAULT '',
  tier_name TEXT NOT NULL DEFAULT 'Bronze',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, customer_id)
);

CREATE TABLE IF NOT EXISTS public.shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  cashier_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  cashier_name TEXT NOT NULL DEFAULT '',
  cashier_email TEXT NOT NULL DEFAULT '',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  opened_by_name TEXT NOT NULL DEFAULT '',
  closed_by_name TEXT,
  totals JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shifts_store ON public.shifts(store_id);
CREATE INDEX IF NOT EXISTS idx_shifts_cashier ON public.shifts(store_id, cashier_user_id, status);

CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  shift_id UUID REFERENCES public.shifts(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL DEFAULT '',
  payment TEXT NOT NULL DEFAULT 'cash' CHECK (payment IN ('cash', 'kaspi', 'transfer', 'mixed', 'debt')),
  total NUMERIC(14, 2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  bonus_spend NUMERIC(14, 2) NOT NULL DEFAULT 0,
  earned_bonus NUMERIC(14, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled')),
  cancelled_at TIMESTAMPTZ,
  cancelled_by TEXT,
  sale_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_store_date ON public.sales(store_id, sale_date DESC);

CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_code TEXT NOT NULL DEFAULT '',
  product_name TEXT NOT NULL DEFAULT '',
  quantity NUMERIC(12, 2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(14, 2) NOT NULL DEFAULT 0,
  purchase_price NUMERIC(14, 2) NOT NULL DEFAULT 0,
  line_total NUMERIC(14, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_store ON public.sale_items(store_id);

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  user_name TEXT NOT NULL DEFAULT '',
  expense_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  cancelled_at TIMESTAMPTZ,
  cancelled_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_store ON public.expenses(store_id, expense_date DESC);

-- ─── RLS-хелперы ───
CREATE OR REPLACE FUNCTION public.is_store_member(p_store_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.store_members
    WHERE store_id = p_store_id AND user_id = auth.uid() AND active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_store_admin(p_store_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.store_members
    WHERE store_id = p_store_id AND user_id = auth.uid() AND role = 'admin' AND active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_store_cashier(p_store_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.store_members
    WHERE store_id = p_store_id AND user_id = auth.uid() AND role = 'cashier' AND active = true
  );
$$;

-- ─── Триггер: профиль при регистрации ───
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Создание магазина (RPC) ───
CREATE OR REPLACE FUNCTION public.create_store(p_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_store_id UUID;
  v_name TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  v_name := trim(p_name);
  IF v_name = '' THEN RAISE EXCEPTION 'Store name required'; END IF;
  INSERT INTO public.stores (name, owner_id) VALUES (v_name, auth.uid()) RETURNING id INTO v_store_id;
  INSERT INTO public.store_members (store_id, user_id, role, display_name)
    SELECT v_store_id, auth.uid(), 'admin', COALESCE((SELECT display_name FROM public.profiles WHERE id = auth.uid()), 'Администратор');
  RETURN v_store_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_store(TEXT) TO authenticated;

-- ─── Добавление участника (вызывает админ) ───
CREATE OR REPLACE FUNCTION public.add_store_member(p_store_id UUID, p_user_id UUID, p_role TEXT, p_display_name TEXT DEFAULT '')
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_id UUID;
BEGIN
  IF NOT public.is_store_admin(p_store_id) THEN RAISE EXCEPTION 'Only store admin can add members'; END IF;
  IF p_role NOT IN ('admin', 'cashier') THEN RAISE EXCEPTION 'Invalid role'; END IF;
  INSERT INTO public.store_members (store_id, user_id, role, display_name)
    VALUES (p_store_id, p_user_id, p_role, COALESCE(NULLIF(trim(p_display_name), ''), 'Сотрудник'))
    ON CONFLICT (store_id, user_id) DO UPDATE SET role = EXCLUDED.role, display_name = EXCLUDED.display_name, active = true
    RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.add_store_member(UUID, UUID, TEXT, TEXT) TO authenticated;

-- ============================================================
-- 02_rls.sql — Row Level Security
-- ============================================================

GRANT EXECUTE ON FUNCTION public.is_store_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_store_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_store_cashier(UUID) TO authenticated;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_select_store_colleagues" ON public.profiles;
CREATE POLICY "profiles_select_store_colleagues" ON public.profiles FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.store_members sm1 JOIN public.store_members sm2 ON sm1.store_id = sm2.store_id WHERE sm1.user_id = auth.uid() AND sm2.user_id = profiles.id AND sm1.active)
);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stores_select_member" ON public.stores;
CREATE POLICY "stores_select_member" ON public.stores FOR SELECT TO authenticated USING (public.is_store_member(id) OR owner_id = auth.uid());

DROP POLICY IF EXISTS "stores_insert_owner" ON public.stores;
CREATE POLICY "stores_insert_owner" ON public.stores FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "stores_update_admin" ON public.stores;
CREATE POLICY "stores_update_admin" ON public.stores FOR UPDATE TO authenticated USING (public.is_store_admin(id)) WITH CHECK (public.is_store_admin(id));

DROP POLICY IF EXISTS "stores_delete_admin" ON public.stores;
CREATE POLICY "stores_delete_admin" ON public.stores FOR DELETE TO authenticated USING (owner_id = auth.uid());

ALTER TABLE public.store_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "store_members_select_same_store" ON public.store_members;
CREATE POLICY "store_members_select_same_store" ON public.store_members FOR SELECT TO authenticated USING (public.is_store_member(store_id));

DROP POLICY IF EXISTS "store_members_insert_admin" ON public.store_members;
CREATE POLICY "store_members_insert_admin" ON public.store_members FOR INSERT TO authenticated WITH CHECK (public.is_store_admin(store_id));

DROP POLICY IF EXISTS "store_members_update_admin" ON public.store_members;
CREATE POLICY "store_members_update_admin" ON public.store_members FOR UPDATE TO authenticated USING (public.is_store_admin(store_id)) WITH CHECK (public.is_store_admin(store_id));

DROP POLICY IF EXISTS "store_members_delete_admin" ON public.store_members;
CREATE POLICY "store_members_delete_admin" ON public.store_members FOR DELETE TO authenticated USING (public.is_store_admin(store_id));

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select" ON public.categories;
CREATE POLICY "categories_select" ON public.categories FOR SELECT TO authenticated USING (public.is_store_member(store_id));

DROP POLICY IF EXISTS "categories_write_admin" ON public.categories;
CREATE POLICY "categories_write_admin" ON public.categories FOR ALL TO authenticated USING (public.is_store_admin(store_id)) WITH CHECK (public.is_store_admin(store_id));

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select" ON public.products;
CREATE POLICY "products_select" ON public.products FOR SELECT TO authenticated USING (public.is_store_member(store_id));

DROP POLICY IF EXISTS "products_insert_admin" ON public.products;
CREATE POLICY "products_insert_admin" ON public.products FOR INSERT TO authenticated WITH CHECK (public.is_store_admin(store_id));

DROP POLICY IF EXISTS "products_update_admin" ON public.products;
CREATE POLICY "products_update_admin" ON public.products FOR UPDATE TO authenticated USING (public.is_store_admin(store_id)) WITH CHECK (public.is_store_admin(store_id));

DROP POLICY IF EXISTS "products_update_qty_cashier" ON public.products;
CREATE POLICY "products_update_qty_cashier" ON public.products FOR UPDATE TO authenticated USING (public.is_store_cashier(store_id)) WITH CHECK (public.is_store_cashier(store_id));

DROP POLICY IF EXISTS "products_delete_admin" ON public.products;
CREATE POLICY "products_delete_admin" ON public.products FOR DELETE TO authenticated USING (public.is_store_admin(store_id));

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customers_select" ON public.customers;
CREATE POLICY "customers_select" ON public.customers FOR SELECT TO authenticated USING (public.is_store_member(store_id));

DROP POLICY IF EXISTS "customers_write_admin" ON public.customers;
CREATE POLICY "customers_write_admin" ON public.customers FOR ALL TO authenticated USING (public.is_store_admin(store_id)) WITH CHECK (public.is_store_admin(store_id));

DROP POLICY IF EXISTS "customers_update_cashier_sale" ON public.customers;
CREATE POLICY "customers_update_cashier_sale" ON public.customers FOR UPDATE TO authenticated USING (public.is_store_cashier(store_id)) WITH CHECK (public.is_store_cashier(store_id));

ALTER TABLE public.loyalty_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "loyalty_select" ON public.loyalty_cards;
CREATE POLICY "loyalty_select" ON public.loyalty_cards FOR SELECT TO authenticated USING (public.is_store_member(store_id));

DROP POLICY IF EXISTS "loyalty_write_admin" ON public.loyalty_cards;
CREATE POLICY "loyalty_write_admin" ON public.loyalty_cards FOR ALL TO authenticated USING (public.is_store_admin(store_id)) WITH CHECK (public.is_store_admin(store_id));

DROP POLICY IF EXISTS "loyalty_upsert_cashier" ON public.loyalty_cards;
CREATE POLICY "loyalty_upsert_cashier" ON public.loyalty_cards FOR INSERT TO authenticated WITH CHECK (public.is_store_member(store_id));

ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shifts_select" ON public.shifts;
CREATE POLICY "shifts_select" ON public.shifts FOR SELECT TO authenticated USING (public.is_store_member(store_id));

DROP POLICY IF EXISTS "shifts_insert" ON public.shifts;
CREATE POLICY "shifts_insert" ON public.shifts FOR INSERT TO authenticated WITH CHECK (public.is_store_member(store_id) AND (public.is_store_admin(store_id) OR cashier_user_id = auth.uid()));

DROP POLICY IF EXISTS "shifts_update" ON public.shifts;
CREATE POLICY "shifts_update" ON public.shifts FOR UPDATE TO authenticated USING (public.is_store_member(store_id) AND (public.is_store_admin(store_id) OR cashier_user_id = auth.uid())) WITH CHECK (public.is_store_member(store_id));

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sales_select" ON public.sales;
CREATE POLICY "sales_select" ON public.sales FOR SELECT TO authenticated USING (public.is_store_member(store_id));

DROP POLICY IF EXISTS "sales_insert" ON public.sales;
CREATE POLICY "sales_insert" ON public.sales FOR INSERT TO authenticated WITH CHECK (public.is_store_member(store_id));

DROP POLICY IF EXISTS "sales_update" ON public.sales;
CREATE POLICY "sales_update" ON public.sales FOR UPDATE TO authenticated USING (public.is_store_member(store_id) AND (public.is_store_admin(store_id) OR user_id = auth.uid())) WITH CHECK (public.is_store_member(store_id));

ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sale_items_select" ON public.sale_items;
CREATE POLICY "sale_items_select" ON public.sale_items FOR SELECT TO authenticated USING (public.is_store_member(store_id));

DROP POLICY IF EXISTS "sale_items_insert" ON public.sale_items;
CREATE POLICY "sale_items_insert" ON public.sale_items FOR INSERT TO authenticated WITH CHECK (public.is_store_member(store_id));

DROP POLICY IF EXISTS "sale_items_update" ON public.sale_items;
CREATE POLICY "sale_items_update" ON public.sale_items FOR UPDATE TO authenticated USING (public.is_store_member(store_id)) WITH CHECK (public.is_store_member(store_id));

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "expenses_select_admin" ON public.expenses;
CREATE POLICY "expenses_select_admin" ON public.expenses FOR SELECT TO authenticated USING (public.is_store_admin(store_id));

DROP POLICY IF EXISTS "expenses_write_admin" ON public.expenses;
CREATE POLICY "expenses_write_admin" ON public.expenses FOR ALL TO authenticated USING (public.is_store_admin(store_id)) WITH CHECK (public.is_store_admin(store_id));

-- ============================================================
-- 03_new_features.sql — Списания, ревизии, возвраты, смешанная оплата
-- ============================================================

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS compatibility TEXT NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku TEXT NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS supplier TEXT NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS markup NUMERIC(8, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS favorite BOOLEAN NOT NULL DEFAULT false;

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
ALTER TABLE public.write_offs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "write_offs_select_admin" ON public.write_offs;
CREATE POLICY "write_offs_select_admin" ON public.write_offs FOR SELECT TO authenticated USING (public.is_store_admin(store_id));

DROP POLICY IF EXISTS "write_offs_write_admin" ON public.write_offs;
CREATE POLICY "write_offs_write_admin" ON public.write_offs FOR ALL TO authenticated USING (public.is_store_admin(store_id)) WITH CHECK (public.is_store_admin(store_id));

CREATE TABLE IF NOT EXISTS public.audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audits_select_admin" ON public.audits;
CREATE POLICY "audits_select_admin" ON public.audits FOR SELECT TO authenticated USING (public.is_store_admin(store_id));

DROP POLICY IF EXISTS "audits_write_admin" ON public.audits;
CREATE POLICY "audits_write_admin" ON public.audits FOR ALL TO authenticated USING (public.is_store_admin(store_id)) WITH CHECK (public.is_store_admin(store_id));

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
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "returns_select" ON public.returns;
CREATE POLICY "returns_select" ON public.returns FOR SELECT TO authenticated USING (public.is_store_member(store_id));

DROP POLICY IF EXISTS "returns_insert" ON public.returns;
CREATE POLICY "returns_insert" ON public.returns FOR INSERT TO authenticated WITH CHECK (public.is_store_member(store_id));

DROP POLICY IF EXISTS "returns_update_admin" ON public.returns;
CREATE POLICY "returns_update_admin" ON public.returns FOR UPDATE TO authenticated USING (public.is_store_admin(store_id)) WITH CHECK (public.is_store_admin(store_id));

ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS cash_amount NUMERIC(14, 2) NOT NULL DEFAULT 0;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS kaspi_amount NUMERIC(14, 2) NOT NULL DEFAULT 0;

-- ============================================================
-- 05_debts_deferred.sql — Долги и отложенные товары
-- ============================================================

CREATE TABLE IF NOT EXISTS public.debtors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  rating TEXT NOT NULL DEFAULT 'good' CHECK (rating IN ('good', 'warning', 'bad')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_debtors_store ON public.debtors(store_id);
ALTER TABLE public.debtors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "debtors_select" ON public.debtors;
CREATE POLICY "debtors_select" ON public.debtors FOR SELECT TO authenticated USING (public.is_store_member(store_id));

DROP POLICY IF EXISTS "debtors_write" ON public.debtors;
CREATE POLICY "debtors_write" ON public.debtors FOR ALL TO authenticated USING (public.is_store_member(store_id)) WITH CHECK (public.is_store_member(store_id));

CREATE TABLE IF NOT EXISTS public.debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  debtor_id UUID NOT NULL REFERENCES public.debtors(id) ON DELETE CASCADE,
  product_code TEXT NOT NULL DEFAULT '',
  product_name TEXT NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL DEFAULT 1,
  amount NUMERIC(14, 2) NOT NULL,
  cashier_name TEXT NOT NULL DEFAULT '',
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'paid', 'cancelled')),
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_debts_store ON public.debts(store_id);
CREATE INDEX IF NOT EXISTS idx_debts_debtor ON public.debts(debtor_id);
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "debts_select" ON public.debts;
CREATE POLICY "debts_select" ON public.debts FOR SELECT TO authenticated USING (public.is_store_member(store_id));

DROP POLICY IF EXISTS "debts_write" ON public.debts;
CREATE POLICY "debts_write" ON public.debts FOR ALL TO authenticated USING (public.is_store_member(store_id)) WITH CHECK (public.is_store_member(store_id));

CREATE TABLE IF NOT EXISTS public.deferred_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL DEFAULT '',
  customer_phone TEXT NOT NULL DEFAULT '',
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_code TEXT NOT NULL DEFAULT '',
  product_name TEXT NOT NULL DEFAULT '',
  quantity NUMERIC(12, 2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total NUMERIC(14, 2) NOT NULL DEFAULT 0,
  cashier_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_deferred_store ON public.deferred_items(store_id);
ALTER TABLE public.deferred_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deferred_select" ON public.deferred_items;
CREATE POLICY "deferred_select" ON public.deferred_items FOR SELECT TO authenticated USING (public.is_store_member(store_id));

DROP POLICY IF EXISTS "deferred_write" ON public.deferred_items;
CREATE POLICY "deferred_write" ON public.deferred_items FOR ALL TO authenticated USING (public.is_store_member(store_id)) WITH CHECK (public.is_store_member(store_id));

-- ============================================================
-- 06_debt_payment_sync.sql — Долг как оплата + updated_at
-- ============================================================

ALTER TABLE public.sales DROP CONSTRAINT IF EXISTS sales_payment_check;
ALTER TABLE public.sales ADD CONSTRAINT sales_payment_check
  CHECK (payment IN ('cash', 'kaspi', 'transfer', 'mixed', 'debt'));

ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS debt_phone TEXT NOT NULL DEFAULT '';
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS debt_return_date DATE;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS transfer_amount NUMERIC(14, 2) NOT NULL DEFAULT 0;

ALTER TABLE public.debtors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.deferred_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
