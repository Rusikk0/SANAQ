-- Row Level Security — изоляция данных по магазинам и ролям
-- (функции is_store_* созданы в 01_schema.sql)

GRANT EXECUTE ON FUNCTION public.is_store_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_store_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_store_cashier(UUID) TO authenticated;

-- ─── profiles ───
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_select_store_colleagues" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.store_members sm1
      JOIN public.store_members sm2 ON sm1.store_id = sm2.store_id
      WHERE sm1.user_id = auth.uid() AND sm2.user_id = profiles.id AND sm1.active
    )
  );

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ─── stores ───
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stores_select_member" ON public.stores
  FOR SELECT TO authenticated
  USING (public.is_store_member(id) OR owner_id = auth.uid());

CREATE POLICY "stores_insert_owner" ON public.stores
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "stores_update_admin" ON public.stores
  FOR UPDATE TO authenticated
  USING (public.is_store_admin(id))
  WITH CHECK (public.is_store_admin(id));

CREATE POLICY "stores_delete_admin" ON public.stores
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- ─── store_members ───
ALTER TABLE public.store_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "store_members_select_same_store" ON public.store_members
  FOR SELECT TO authenticated
  USING (public.is_store_member(store_id));

CREATE POLICY "store_members_insert_admin" ON public.store_members
  FOR INSERT TO authenticated
  WITH CHECK (public.is_store_admin(store_id));

CREATE POLICY "store_members_update_admin" ON public.store_members
  FOR UPDATE TO authenticated
  USING (public.is_store_admin(store_id))
  WITH CHECK (public.is_store_admin(store_id));

CREATE POLICY "store_members_delete_admin" ON public.store_members
  FOR DELETE TO authenticated
  USING (public.is_store_admin(store_id));

-- ─── categories ───
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select" ON public.categories
  FOR SELECT TO authenticated USING (public.is_store_member(store_id));

CREATE POLICY "categories_write_admin" ON public.categories
  FOR ALL TO authenticated
  USING (public.is_store_admin(store_id))
  WITH CHECK (public.is_store_admin(store_id));

-- ─── products ───
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_select" ON public.products
  FOR SELECT TO authenticated USING (public.is_store_member(store_id));

CREATE POLICY "products_insert_admin" ON public.products
  FOR INSERT TO authenticated
  WITH CHECK (public.is_store_admin(store_id));

CREATE POLICY "products_update_admin" ON public.products
  FOR UPDATE TO authenticated
  USING (public.is_store_admin(store_id))
  WITH CHECK (public.is_store_admin(store_id));

CREATE POLICY "products_update_qty_cashier" ON public.products
  FOR UPDATE TO authenticated
  USING (public.is_store_cashier(store_id))
  WITH CHECK (public.is_store_cashier(store_id));

CREATE POLICY "products_delete_admin" ON public.products
  FOR DELETE TO authenticated
  USING (public.is_store_admin(store_id));

-- ─── customers ───
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "customers_select" ON public.customers
  FOR SELECT TO authenticated USING (public.is_store_member(store_id));

CREATE POLICY "customers_write_admin" ON public.customers
  FOR ALL TO authenticated
  USING (public.is_store_admin(store_id))
  WITH CHECK (public.is_store_admin(store_id));

CREATE POLICY "customers_update_cashier_sale" ON public.customers
  FOR UPDATE TO authenticated
  USING (public.is_store_cashier(store_id))
  WITH CHECK (public.is_store_cashier(store_id));

-- ─── loyalty_cards ───
ALTER TABLE public.loyalty_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "loyalty_select" ON public.loyalty_cards
  FOR SELECT TO authenticated USING (public.is_store_member(store_id));

CREATE POLICY "loyalty_write_admin" ON public.loyalty_cards
  FOR ALL TO authenticated
  USING (public.is_store_admin(store_id))
  WITH CHECK (public.is_store_admin(store_id));

CREATE POLICY "loyalty_upsert_cashier" ON public.loyalty_cards
  FOR INSERT TO authenticated
  WITH CHECK (public.is_store_member(store_id));

-- ─── shifts ───
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shifts_select" ON public.shifts
  FOR SELECT TO authenticated USING (public.is_store_member(store_id));

CREATE POLICY "shifts_insert" ON public.shifts
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_store_member(store_id)
    AND (public.is_store_admin(store_id) OR cashier_user_id = auth.uid())
  );

CREATE POLICY "shifts_update" ON public.shifts
  FOR UPDATE TO authenticated
  USING (
    public.is_store_member(store_id)
    AND (public.is_store_admin(store_id) OR cashier_user_id = auth.uid())
  )
  WITH CHECK (public.is_store_member(store_id));

-- ─── sales ───
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sales_select" ON public.sales
  FOR SELECT TO authenticated USING (public.is_store_member(store_id));

CREATE POLICY "sales_insert" ON public.sales
  FOR INSERT TO authenticated
  WITH CHECK (public.is_store_member(store_id));

CREATE POLICY "sales_update" ON public.sales
  FOR UPDATE TO authenticated
  USING (
    public.is_store_member(store_id)
    AND (public.is_store_admin(store_id) OR user_id = auth.uid())
  )
  WITH CHECK (public.is_store_member(store_id));

-- ─── sale_items ───
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sale_items_select" ON public.sale_items
  FOR SELECT TO authenticated USING (public.is_store_member(store_id));

CREATE POLICY "sale_items_insert" ON public.sale_items
  FOR INSERT TO authenticated
  WITH CHECK (public.is_store_member(store_id));

CREATE POLICY "sale_items_update" ON public.sale_items
  FOR UPDATE TO authenticated
  USING (public.is_store_member(store_id))
  WITH CHECK (public.is_store_member(store_id));

-- ─── documents ───
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_select" ON public.documents
  FOR SELECT TO authenticated USING (public.is_store_member(store_id));

CREATE POLICY "documents_insert" ON public.documents
  FOR INSERT TO authenticated
  WITH CHECK (public.is_store_member(store_id));

CREATE POLICY "documents_update" ON public.documents
  FOR UPDATE TO authenticated
  USING (
    public.is_store_member(store_id)
    AND (public.is_store_admin(store_id) OR created_by = auth.uid())
  )
  WITH CHECK (public.is_store_member(store_id));

ALTER TABLE public.document_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "document_items_select" ON public.document_items
  FOR SELECT TO authenticated USING (public.is_store_member(store_id));

CREATE POLICY "document_items_insert" ON public.document_items
  FOR INSERT TO authenticated
  WITH CHECK (public.is_store_member(store_id));

CREATE POLICY "document_items_update" ON public.document_items
  FOR UPDATE TO authenticated
  USING (public.is_store_member(store_id))
  WITH CHECK (public.is_store_member(store_id));

-- ─── expenses (только админ) ───
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses_select_admin" ON public.expenses
  FOR SELECT TO authenticated
  USING (public.is_store_admin(store_id));

CREATE POLICY "expenses_write_admin" ON public.expenses
  FOR ALL TO authenticated
  USING (public.is_store_admin(store_id))
  WITH CHECK (public.is_store_admin(store_id));
