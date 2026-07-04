-- SANAQ — Debt payment type + auto-sync support + mixed payment fix
-- Выполните в Supabase SQL Editor

-- 1. Добавляем 'debt' в enum оплаты
ALTER TABLE public.sales DROP CONSTRAINT IF EXISTS sales_payment_check;
ALTER TABLE public.sales ADD CONSTRAINT sales_payment_check
  CHECK (payment IN ('cash', 'kaspi', 'transfer', 'mixed', 'debt'));

-- 2. Добавляем колонки для долга и смешанной оплаты
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS debt_phone TEXT NOT NULL DEFAULT '';
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS debt_return_date DATE;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS transfer_amount NUMERIC(14, 2) NOT NULL DEFAULT 0;

-- 3. Добавляем updated_at в debtors и debts
ALTER TABLE public.debtors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.deferred_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
