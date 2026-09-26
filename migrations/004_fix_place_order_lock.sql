-- Fix: PostgreSQL does not allow FOR UPDATE on a query containing GROUP BY.
CREATE OR REPLACE FUNCTION public.place_order(
  p_customer_name text,
  p_email text,
  p_phone text,
  p_address text,
  p_city text,
  p_country text,
  p_postal_code text,
  p_notes text,
  p_items jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order_id uuid;
  v_total numeric(14,2);
  v_requested integer;
  v_valid integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication is required to place an order';
  END IF;
  IF nullif(trim(p_customer_name), '') IS NULL OR nullif(trim(p_email), '') IS NULL
     OR nullif(trim(p_phone), '') IS NULL OR nullif(trim(p_address), '') IS NULL
     OR nullif(trim(p_city), '') IS NULL THEN
    RAISE EXCEPTION 'Missing required delivery information';
  END IF;
  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 OR jsonb_array_length(p_items) > 100 THEN
    RAISE EXCEPTION 'The order must contain between 1 and 100 products';
  END IF;

  WITH requested AS (
    SELECT (item->>'product_id')::bigint product_id, sum((item->>'quantity')::integer)::integer quantity
    FROM jsonb_array_elements(p_items) item GROUP BY 1
  ) SELECT count(*) INTO v_requested FROM requested;

  PERFORM p.id
  FROM public.products p
  JOIN jsonb_array_elements(p_items) item
    ON p.id = (item->>'product_id')::bigint
  FOR UPDATE OF p;

  WITH requested AS (
    SELECT (item->>'product_id')::bigint product_id, sum((item->>'quantity')::integer)::integer quantity
    FROM jsonb_array_elements(p_items) item GROUP BY 1
  )
  SELECT count(*), sum(p.price * r.quantity)
  INTO v_valid, v_total
  FROM requested r JOIN public.products p ON p.id = r.product_id
  WHERE r.quantity > 0 AND r.quantity <= coalesce(p.stock, 0) AND coalesce(p.is_active, true);

  IF v_valid <> v_requested OR v_total IS NULL THEN
    RAISE EXCEPTION 'A product is unavailable or does not have enough stock';
  END IF;

  INSERT INTO public.orders (user_id, customer_name, email, phone, address, city, country, postal_code, notes, total)
  VALUES (auth.uid(), trim(p_customer_name), trim(p_email), trim(p_phone), trim(p_address), trim(p_city),
          coalesce(nullif(trim(p_country), ''), 'Vietnam'), nullif(trim(p_postal_code), ''), nullif(trim(p_notes), ''), v_total)
  RETURNING id INTO v_order_id;

  WITH requested AS (
    SELECT (item->>'product_id')::bigint product_id, sum((item->>'quantity')::integer)::integer quantity
    FROM jsonb_array_elements(p_items) item GROUP BY 1
  )
  INSERT INTO public.order_items (order_id, product_id, product_name, sku, quantity, unit_price, line_total)
  SELECT v_order_id, p.id, p.name, p.sku, r.quantity, p.price, p.price * r.quantity
  FROM requested r JOIN public.products p ON p.id = r.product_id;

  WITH requested AS (
    SELECT (item->>'product_id')::bigint product_id, sum((item->>'quantity')::integer)::integer quantity
    FROM jsonb_array_elements(p_items) item GROUP BY 1
  )
  UPDATE public.products p SET stock = coalesce(p.stock, 0) - r.quantity, updated_at = now()
  FROM requested r WHERE p.id = r.product_id;

  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(text,text,text,text,text,text,text,text,jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.place_order(text,text,text,text,text,text,text,text,jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.place_order(text,text,text,text,text,text,text,text,jsonb) TO authenticated;
NOTIFY pgrst, 'reload schema';
