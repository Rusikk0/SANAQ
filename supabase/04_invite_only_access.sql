-- Обновление функции create_store: разрешаем всем авторизованным создавать магазины
-- (защита от неавторизованного создания — мастер-код на клиенте в config.js)
-- Выполните этот код в SQL Editor вашего проекта Supabase

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
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  v_name := trim(p_name);
  IF v_name = '' THEN
    RAISE EXCEPTION 'Store name required';
  END IF;

  INSERT INTO public.stores (name, owner_id)
  VALUES (v_name, auth.uid())
  RETURNING id INTO v_store_id;

  INSERT INTO public.store_members (store_id, user_id, role, display_name)
  SELECT v_store_id, auth.uid(), 'admin',
    COALESCE((SELECT display_name FROM public.profiles WHERE id = auth.uid()), 'Администратор');

  RETURN v_store_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_store(TEXT) TO authenticated;
