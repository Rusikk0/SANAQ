-- ============================================================
-- SANAQ — ПОЛНЫЙ СБРОС И СОЗДАНИЕ БАЗЫ ДАННЫХ
-- Выполни ВЕСЬ скрипт в Supabase SQL Editor
-- ============================================================

-- ═══════════════════════════════════════════
-- ШАГ 0: УДАЛИТЬ ВСЁ СТАРОЕ
-- ═══════════════════════════════════════════

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

DROP TABLE IF EXISTS public.deferred_items CASCADE;
DROP TABLE IF EXISTS public.debts CASCADE;
DROP TABLE IF EXISTS public.debtors CASCADE;
DROP TABLE IF EXISTS public.returns CASCADE;
DROP TABLE IF EXISTS public.audits CASCADE;
DROP TABLE IF EXISTS public.write_offs CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.sale_items CASCADE;
DROP TABLE IF EXISTS public.sales CASCADE;
DROP TABLE IF EXISTS public.shifts CASCADE;
DROP TABLE IF EXISTS public.loyalty_cards CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.store_members CASCADE;
DROP TABLE IF EXISTS public.stores CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP FUNCTION IF EXISTS public.is_store_member(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_store_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_store_cashier(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_store(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.add_store_member(UUID, UUID, TEXT, TEXT) CASCADE;

-- ═══════════════════════════════════════════
-- ШАГ 1: РАСШИРЕНИЯ
-- ═══════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════
-- ШАГ 2: ТАБЛИЦЫ
-- ═══════════════════════════════════════════

-- Профили пользователей
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Магазины
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_stores_owner ON public.stores(owner_id);

-- Участники магазина
CREATE TABLE public.store_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'cashier')),
  display_name TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, user_id)
);
CREATE INDEX idx_store_members_user ON public.store_members(user_id);
CREATE INDEX idx_store_members_store ON public.store_members(store_id);

-- Категории
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, name)
);

-- Товары
CREATE TABLE public.products (
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
  compatibility TEXT NOT NULL DEFAULT '',
  sku TEXT NOT NULL DEFAULT '',
  supplier TEXT NOT NULL DEFAULT '',
  markup NUMERIC(8, 2) NOT NULL DEFAULT 0,
  favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, code)
);
CREATE INDEX idx_products_store ON public.products(store_id);
CREATE INDEX idx_products_barcode ON public.products(store_id, barcode);

-- Клиенты
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  name TEXT NOT NULL,
  spent NUMERIC(14, 2) NOT NULL DEFAULT 0,
  bonus_balance NUMERIC(14, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_customers_store_phone ON public.customers(store_id, phone);

-- Скидочные карты
CREATE TABLE public.loyalty_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  card_number TEXT NOT NULL DEFAULT '',
  tier_name TEXT NOT NULL DEFAULT 'Bronze',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, customer_id)
);

-- Смены
CREATE TABLE public.shifts (
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
CREATE INDEX idx_shifts_store ON public.shifts(store_id);
CREATE INDEX idx_shifts_cashier ON public.shifts(store_id, cashier_user_id, status);

-- Продажи (заголовок чека)
CREATE TABLE public.sales (
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
  cash_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  kaspi_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled')),
  cancelled_at TIMESTAMPTZ,
  cancelled_by TEXT,
  sale_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sales_store_date ON public.sales(store_id, sale_date DESC);

-- Строки продажи
CREATE TABLE public.sale_items (
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
CREATE INDEX idx_sale_items_sale ON public.sale_items(sale_id);
CREATE INDEX idx_sale_items_store ON public.sale_items(store_id);

-- Расходы
CREATE TABLE public.expenses (
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
CREATE INDEX idx_expenses_store ON public.expenses(store_id, expense_date DESC);

-- Списания (брак, утеря)
CREATE TABLE public.write_offs (
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

-- Ревизии (инвентаризация)
CREATE TABLE public.audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Возвраты
CREATE TABLE public.returns (
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

-- ═══════════════════════════════════════════
-- ШАГ 2Б: НОВЫЕ ТАБЛИЦЫ — ДОЛГИ И ОТЛОЖЕННЫЕ
-- ═══════════════════════════════════════════

-- Должники
CREATE TABLE public.debtors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  rating TEXT NOT NULL DEFAULT 'good' CHECK (rating IN ('good', 'warning', 'bad')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_debtors_store ON public.debtors(store_id);

-- Записи долгов
CREATE TABLE public.debts (
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
CREATE INDEX idx_debts_store ON public.debts(store_id);
CREATE INDEX idx_debts_debtor ON public.debts(debtor_id);

-- Отложенные товары
CREATE TABLE public.deferred_items (
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
CREATE INDEX idx_deferred_store ON public.deferred_items(store_id);

-- ═══════════════════════════════════════════
-- ШАГ 3: ФУНКЦИИ-ХЕЛПЕРЫ
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.is_store_member(p_store_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.store_members
    WHERE store_id = p_store_id AND user_id = auth.uid() AND active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_store_admin(p_store_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.store_members
    WHERE store_id = p_store_id AND user_id = auth.uid() AND role = 'admin' AND active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_store_cashier(p_store_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.store_members
    WHERE store_id = p_store_id AND user_id = auth.uid() AND role = 'cashier' AND active = true
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_store_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_store_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_store_cashier(UUID) TO authenticated;

-- ═══════════════════════════════════════════
-- ШАГ 4: ТРИГГЕР — ПРОФИЛЬ ПРИ РЕГИСТРАЦИИ
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════
-- ШАГ 5: RPC ФУНКЦИИ
-- ═══════════════════════════════════════════

-- Создание магазина
CREATE OR REPLACE FUNCTION public.create_store(p_name TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_store_id UUID; v_name TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  v_name := trim(p_name);
  IF v_name = '' THEN RAISE EXCEPTION 'Store name required'; END IF;
  INSERT INTO public.stores (name, owner_id) VALUES (v_name, auth.uid()) RETURNING id INTO v_store_id;
  INSERT INTO public.store_members (store_id, user_id, role, display_name)
    SELECT v_store_id, auth.uid(), 'admin',
      COALESCE((SELECT display_name FROM public.profiles WHERE id = auth.uid()), 'Администратор');
  RETURN v_store_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.create_store(TEXT) TO authenticated;

-- Добавление участника
CREATE OR REPLACE FUNCTION public.add_store_member(
  p_store_id UUID, p_user_id UUID, p_role TEXT, p_display_name TEXT DEFAULT ''
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id UUID;
BEGIN
  IF NOT public.is_store_admin(p_store_id) THEN RAISE EXCEPTION 'Only store admin can add members'; END IF;
  IF p_role NOT IN ('admin', 'cashier') THEN RAISE EXCEPTION 'Invalid role'; END IF;
  INSERT INTO public.store_members (store_id, user_id, role, display_name)
    VALUES (p_store_id, p_user_id, p_role, COALESCE(NULLIF(trim(p_display_name), ''), 'Сотрудник'))
    ON CONFLICT (store_id, user_id) DO UPDATE SET
      role = EXCLUDED.role, display_name = EXCLUDED.display_name, active = true
    RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.add_store_member(UUID, UUID, TEXT, TEXT) TO authenticated;

-- ═══════════════════════════════════════════
-- ШАГ 6: ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_select_colleagues" ON public.profiles FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.store_members sm1 JOIN public.store_members sm2 ON sm1.store_id = sm2.store_id WHERE sm1.user_id = auth.uid() AND sm2.user_id = profiles.id AND sm1.active)
);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- stores
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stores_select_member" ON public.stores FOR SELECT TO authenticated USING (public.is_store_member(id) OR owner_id = auth.uid());
CREATE POLICY "stores_insert_owner" ON public.stores FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "stores_update_admin" ON public.stores FOR UPDATE TO authenticated USING (public.is_store_admin(id)) WITH CHECK (public.is_store_admin(id));
CREATE POLICY "stores_delete_admin" ON public.stores FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- store_members
ALTER TABLE public.store_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sm_select" ON public.store_members FOR SELECT TO authenticated USING (public.is_store_member(store_id));
CREATE POLICY "sm_insert" ON public.store_members FOR INSERT TO authenticated WITH CHECK (public.is_store_admin(store_id));
CREATE POLICY "sm_update" ON public.store_members FOR UPDATE TO authenticated USING (public.is_store_admin(store_id)) WITH CHECK (public.is_store_admin(store_id));
CREATE POLICY "sm_delete" ON public.store_members FOR DELETE TO authenticated USING (public.is_store_admin(store_id));

-- categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cat_select" ON public.categories FOR SELECT TO authenticated USING (public.is_store_member(store_id));
CREATE POLICY "cat_write" ON public.categories FOR ALL TO authenticated USING (public.is_store_admin(store_id)) WITH CHECK (public.is_store_admin(store_id));

-- products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prod_select" ON public.products FOR SELECT TO authenticated USING (public.is_store_member(store_id));
CREATE POLICY "prod_insert" ON public.products FOR INSERT TO authenticated WITH CHECK (public.is_store_admin(store_id));
CREATE POLICY "prod_update_admin" ON public.products FOR UPDATE TO authenticated USING (public.is_store_admin(store_id)) WITH CHECK (public.is_store_admin(store_id));
CREATE POLICY "prod_update_cashier" ON public.products FOR UPDATE TO authenticated USING (public.is_store_cashier(store_id)) WITH CHECK (public.is_store_cashier(store_id));
CREATE POLICY "prod_delete" ON public.products FOR DELETE TO authenticated USING (public.is_store_admin(store_id));

-- customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cust_select" ON public.customers FOR SELECT TO authenticated USING (public.is_store_member(store_id));
CREATE POLICY "cust_write" ON public.customers FOR ALL TO authenticated USING (public.is_store_admin(store_id)) WITH CHECK (public.is_store_admin(store_id));
CREATE POLICY "cust_update_cashier" ON public.customers FOR UPDATE TO authenticated USING (public.is_store_cashier(store_id)) WITH CHECK (public.is_store_cashier(store_id));

-- loyalty_cards
ALTER TABLE public.loyalty_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "loyalty_select" ON public.loyalty_cards FOR SELECT TO authenticated USING (public.is_store_member(store_id));
CREATE POLICY "loyalty_write" ON public.loyalty_cards FOR ALL TO authenticated USING (public.is_store_admin(store_id)) WITH CHECK (public.is_store_admin(store_id));
CREATE POLICY "loyalty_insert_member" ON public.loyalty_cards FOR INSERT TO authenticated WITH CHECK (public.is_store_member(store_id));

-- shifts
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shifts_select" ON public.shifts FOR SELECT TO authenticated USING (public.is_store_member(store_id));
CREATE POLICY "shifts_insert" ON public.shifts FOR INSERT TO authenticated WITH CHECK (public.is_store_member(store_id) AND (public.is_store_admin(store_id) OR cashier_user_id = auth.uid()));
CREATE POLICY "shifts_update" ON public.shifts FOR UPDATE TO authenticated USING (public.is_store_member(store_id) AND (public.is_store_admin(store_id) OR cashier_user_id = auth.uid())) WITH CHECK (public.is_store_member(store_id));

-- sales
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sales_select" ON public.sales FOR SELECT TO authenticated USING (public.is_store_member(store_id));
CREATE POLICY "sales_insert" ON public.sales FOR INSERT TO authenticated WITH CHECK (public.is_store_member(store_id));
CREATE POLICY "sales_update" ON public.sales FOR UPDATE TO authenticated USING (public.is_store_member(store_id) AND (public.is_store_admin(store_id) OR user_id = auth.uid())) WITH CHECK (public.is_store_member(store_id));

-- sale_items
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "si_select" ON public.sale_items FOR SELECT TO authenticated USING (public.is_store_member(store_id));
CREATE POLICY "si_insert" ON public.sale_items FOR INSERT TO authenticated WITH CHECK (public.is_store_member(store_id));
CREATE POLICY "si_update" ON public.sale_items FOR UPDATE TO authenticated USING (public.is_store_member(store_id)) WITH CHECK (public.is_store_member(store_id));

-- expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exp_select" ON public.expenses FOR SELECT TO authenticated USING (public.is_store_admin(store_id));
CREATE POLICY "exp_write" ON public.expenses FOR ALL TO authenticated USING (public.is_store_admin(store_id)) WITH CHECK (public.is_store_admin(store_id));

-- write_offs
ALTER TABLE public.write_offs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wo_select" ON public.write_offs FOR SELECT TO authenticated USING (public.is_store_admin(store_id));
CREATE POLICY "wo_write" ON public.write_offs FOR ALL TO authenticated USING (public.is_store_admin(store_id)) WITH CHECK (public.is_store_admin(store_id));

-- audits
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aud_select" ON public.audits FOR SELECT TO authenticated USING (public.is_store_admin(store_id));
CREATE POLICY "aud_write" ON public.audits FOR ALL TO authenticated USING (public.is_store_admin(store_id)) WITH CHECK (public.is_store_admin(store_id));

-- returns
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ret_select" ON public.returns FOR SELECT TO authenticated USING (public.is_store_member(store_id));
CREATE POLICY "ret_insert" ON public.returns FOR INSERT TO authenticated WITH CHECK (public.is_store_member(store_id));
CREATE POLICY "ret_update" ON public.returns FOR UPDATE TO authenticated USING (public.is_store_admin(store_id)) WITH CHECK (public.is_store_admin(store_id));

-- debtors
ALTER TABLE public.debtors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "debtors_select" ON public.debtors FOR SELECT TO authenticated USING (public.is_store_member(store_id));
CREATE POLICY "debtors_write" ON public.debtors FOR ALL TO authenticated USING (public.is_store_member(store_id)) WITH CHECK (public.is_store_member(store_id));

-- debts
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "debts_select" ON public.debts FOR SELECT TO authenticated USING (public.is_store_member(store_id));
CREATE POLICY "debts_write" ON public.debts FOR ALL TO authenticated USING (public.is_store_member(store_id)) WITH CHECK (public.is_store_member(store_id));

-- deferred_items
ALTER TABLE public.deferred_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deferred_select" ON public.deferred_items FOR SELECT TO authenticated USING (public.is_store_member(store_id));
CREATE POLICY "deferred_write" ON public.deferred_items FOR ALL TO authenticated USING (public.is_store_member(store_id)) WITH CHECK (public.is_store_member(store_id));

-- ═══════════════════════════════════════════
-- ГОТОВО! Все 17 таблиц, функции и политики созданы.
-- ═══════════════════════════════════════════
