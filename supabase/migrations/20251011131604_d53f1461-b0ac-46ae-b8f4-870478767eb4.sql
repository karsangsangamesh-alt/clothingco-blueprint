-- Create categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

-- Create brands table
CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  category text,
  image_url text NOT NULL,
  established text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  image_url text NOT NULL,
  brand_id uuid REFERENCES public.brands(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  is_premium boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public read access for all
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view brands" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);

-- Add updated_at trigger for products
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample categories
INSERT INTO public.categories (name, slug) VALUES
  ('Dresses', 'dresses'),
  ('Outerwear', 'outerwear'),
  ('Accessories', 'accessories'),
  ('Bottoms', 'bottoms');

-- Insert sample brands
INSERT INTO public.brands (name, slug, description, category, image_url, established) VALUES
  ('Maison Élégance', 'maison-elegance', 'French haute couture reimagined for the modern woman', 'Haute Couture', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop', '1985'),
  ('Urban Chic', 'urban-chic', 'Contemporary luxury with an urban edge', 'Contemporary', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=800&fit=crop', '2010'),
  ('Luxe Heritage', 'luxe-heritage', 'Timeless elegance meets artisanal craftsmanship', 'Premium', 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&h=800&fit=crop', '1972'),
  ('Atelier Moderne', 'atelier-moderne', 'Avant-garde design for the discerning connoisseur', 'Designer', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800&fit=crop', '2005');

-- Insert sample products
INSERT INTO public.products (name, description, price, image_url, brand_id, category_id, is_premium)
SELECT 
  'Silk Evening Gown',
  'Luxurious silk evening gown with elegant draping',
  1299,
  'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=500&fit=crop',
  (SELECT id FROM public.brands WHERE slug = 'maison-elegance'),
  (SELECT id FROM public.categories WHERE slug = 'dresses'),
  true;

INSERT INTO public.products (name, description, price, image_url, brand_id, category_id, is_premium)
SELECT 
  'Cashmere Blazer',
  'Premium cashmere blazer with modern tailoring',
  899,
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop',
  (SELECT id FROM public.brands WHERE slug = 'urban-chic'),
  (SELECT id FROM public.categories WHERE slug = 'outerwear'),
  false;

INSERT INTO public.products (name, description, price, image_url, brand_id, category_id, is_premium)
SELECT 
  'Designer Handbag',
  'Handcrafted leather handbag with signature details',
  1599,
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop',
  (SELECT id FROM public.brands WHERE slug = 'luxe-heritage'),
  (SELECT id FROM public.categories WHERE slug = 'accessories'),
  true;

INSERT INTO public.products (name, description, price, image_url, brand_id, category_id, is_premium)
SELECT 
  'Leather Jacket',
  'Contemporary leather jacket with avant-garde design',
  749,
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop',
  (SELECT id FROM public.brands WHERE slug = 'atelier-moderne'),
  (SELECT id FROM public.categories WHERE slug = 'outerwear'),
  false;

INSERT INTO public.products (name, description, price, image_url, brand_id, category_id, is_premium)
SELECT 
  'Cocktail Dress',
  'Elegant cocktail dress for special occasions',
  599,
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop',
  (SELECT id FROM public.brands WHERE slug = 'maison-elegance'),
  (SELECT id FROM public.categories WHERE slug = 'dresses'),
  false;

INSERT INTO public.products (name, description, price, image_url, brand_id, category_id, is_premium)
SELECT 
  'Wool Coat',
  'Classic wool coat with contemporary styling',
  1099,
  'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=400&h=500&fit=crop',
  (SELECT id FROM public.brands WHERE slug = 'urban-chic'),
  (SELECT id FROM public.categories WHERE slug = 'outerwear'),
  true;

INSERT INTO public.products (name, description, price, image_url, brand_id, category_id, is_premium)
SELECT 
  'Silk Scarf',
  'Hand-painted silk scarf with unique patterns',
  199,
  'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=500&fit=crop',
  (SELECT id FROM public.brands WHERE slug = 'luxe-heritage'),
  (SELECT id FROM public.categories WHERE slug = 'accessories'),
  false;

INSERT INTO public.products (name, description, price, image_url, brand_id, category_id, is_premium)
SELECT 
  'Tailored Pants',
  'Perfectly tailored pants for modern sophistication',
  449,
  'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=500&fit=crop',
  (SELECT id FROM public.brands WHERE slug = 'atelier-moderne'),
  (SELECT id FROM public.categories WHERE slug = 'bottoms'),
  false;