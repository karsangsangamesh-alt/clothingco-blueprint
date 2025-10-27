-- Add missing fields to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON public.products(stock_quantity);

-- Add unique constraint for slug
ALTER TABLE public.products
ADD CONSTRAINT unique_products_slug UNIQUE (slug);

-- Update existing products to have generated slugs and set them as active
UPDATE public.products
SET
  slug = LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), '''', ''), ',', '')),
  is_active = true,
  is_featured = CASE
    WHEN is_premium = true THEN true
    ELSE false
  END,
  stock_quantity = CASE
    WHEN is_premium = true THEN GREATEST(5, FLOOR(RANDOM() * 20 + 1)::INTEGER)
    ELSE GREATEST(10, FLOOR(RANDOM() * 50 + 1)::INTEGER)
  END
WHERE slug IS NULL;
