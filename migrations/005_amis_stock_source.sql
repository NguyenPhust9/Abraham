BEGIN;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS amis_stock_code text,
  ADD COLUMN IF NOT EXISTS amis_stock_synced_at timestamptz;

-- Prevent browser writes from changing imported inventory or its provenance.
-- The scheduled sync uses a privileged PostgreSQL connection, not the public API.
CREATE OR REPLACE FUNCTION public.protect_amis_stock()
RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
BEGIN
  IF coalesce(auth.role(), '') IN ('anon', 'authenticated') THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.amis_stock_code IS NOT NULL OR NEW.amis_stock_synced_at IS NOT NULL THEN
        RAISE EXCEPTION 'AMIS stock metadata is managed by the inventory sync';
      END IF;
    ELSIF NEW.amis_stock_code IS DISTINCT FROM OLD.amis_stock_code
       OR NEW.amis_stock_synced_at IS DISTINCT FROM OLD.amis_stock_synced_at
       OR (OLD.amis_stock_synced_at IS NOT NULL AND NEW.stock IS DISTINCT FROM OLD.stock) THEN
      RAISE EXCEPTION 'AMIS stock is read-only on the website';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS protect_amis_stock ON public.products;
CREATE TRIGGER protect_amis_stock BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.protect_amis_stock();

-- AMIS is the source of stock. Orders validate stock but never deduct or reserve it.
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

  -- Do not change stock here: the next AMIS snapshot remains authoritative.

  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(text,text,text,text,text,text,text,text,jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.place_order(text,text,text,text,text,text,text,text,jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.place_order(text,text,text,text,text,text,text,text,jsonb) TO authenticated;
NOTIFY pgrst, 'reload schema';

COMMIT;
