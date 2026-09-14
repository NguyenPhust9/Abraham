-- Add optional technical specifications without changing existing products.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS specifications jsonb NOT NULL DEFAULT '{}'::jsonb;
NOTIFY pgrst, 'reload schema';
