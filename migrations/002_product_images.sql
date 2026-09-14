-- Preserve the existing main image and store additional product images.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS image_urls jsonb NOT NULL DEFAULT '[]'::jsonb;
NOTIFY pgrst, 'reload schema';
