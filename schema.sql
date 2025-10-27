-- ============================================
-- CLOTHING E-COMMERCE PLATFORM - SQL SCHEMA
-- ============================================
-- Clean, dynamic schema for full project functionality
-- Compatible with PostgreSQL/Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Brands Table
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    tagline VARCHAR(255),
    image_url TEXT NOT NULL,
    logo_url TEXT,
    category VARCHAR(255),
    established VARCHAR(50),
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT NOT NULL,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Profiles Table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cart Items Table
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_brand VARCHAR(255) NOT NULL,
    product_image TEXT NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL CHECK (product_price >= 0),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Wishlist Items Table
CREATE TABLE wishlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_brand VARCHAR(255) NOT NULL,
    product_image TEXT NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL CHECK (product_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Hero Sections Table
CREATE TABLE hero_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL UNIQUE,
    subtitle TEXT,
    description TEXT,
    background_image TEXT NOT NULL,
    cta_text VARCHAR(100),
    cta_link VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Collections Table
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Collection Products (Many-to-Many)
CREATE TABLE collection_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(collection_id, product_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_is_premium ON products(is_premium);
CREATE INDEX idx_products_is_featured ON products(is_featured);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_wishlist_items_user_id ON wishlist_items(user_id);
CREATE INDEX idx_brands_slug ON brands(slug);
CREATE INDEX idx_brands_is_featured ON brands(is_featured);
CREATE INDEX idx_brands_display_order ON brands(display_order);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_collections_is_featured ON collections(is_featured);
CREATE INDEX idx_collection_products_collection_id ON collection_products(collection_id);
CREATE INDEX idx_collection_products_product_id ON collection_products(product_id);
CREATE INDEX idx_hero_sections_is_active ON hero_sections(is_active);
CREATE INDEX idx_hero_sections_display_order ON hero_sections(display_order);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to products table
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to profiles table
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to hero_sections table
CREATE TRIGGER update_hero_sections_updated_at
    BEFORE UPDATE ON hero_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to collections table
CREATE TRIGGER update_collections_updated_at
    BEFORE UPDATE ON collections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all user-related tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Cart Items Policies
CREATE POLICY "Users can view own cart"
    ON cart_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to own cart"
    ON cart_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
    ON cart_items FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from own cart"
    ON cart_items FOR DELETE
    USING (auth.uid() = user_id);

-- Wishlist Items Policies
CREATE POLICY "Users can view own wishlist"
    ON wishlist_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to own wishlist"
    ON wishlist_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wishlist"
    ON wishlist_items FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from own wishlist"
    ON wishlist_items FOR DELETE
    USING (auth.uid() = user_id);

-- Public read access for categories, brands, and products
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
    ON categories FOR SELECT
    USING (true);

CREATE POLICY "Brands are viewable by everyone"
    ON brands FOR SELECT
    USING (true);

CREATE POLICY "Products are viewable by everyone"
    ON products FOR SELECT
    USING (true);

CREATE POLICY "Hero sections are viewable by everyone"
    ON hero_sections FOR SELECT
    USING (true);

CREATE POLICY "Collections are viewable by everyone"
    ON collections FOR SELECT
    USING (true);

CREATE POLICY "Collection products are viewable by everyone"
    ON collection_products FOR SELECT
    USING (true);

-- ============================================
-- SAMPLE DATA (OPTIONAL)
-- ============================================

-- Insert sample categories
INSERT INTO categories (name, slug) VALUES
    ('Streetwear', 'streetwear'),
    ('Luxury', 'luxury'),
    ('Sportswear', 'sportswear'),
    ('Casual', 'casual'),
    ('Formal', 'formal')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample brands
INSERT INTO brands (name, slug, description, tagline, image_url, category, established, is_featured, display_order) VALUES
    ('Maison Élégance', 'maison-elegance', 'Timeless haute couture with French sophistication', 'Haute Couture', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d', 'Luxury', '1985', true, 1),
    ('Urban Chic', 'urban-chic', 'Contemporary designs for modern lifestyle', 'Contemporary', 'https://images.unsplash.com/photo-1483985988355-763728e1935b', 'Contemporary', '2010', true, 2),
    ('Luxe Heritage', 'luxe-heritage', 'Premium craftsmanship and heritage quality', 'Premium', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea', 'Luxury', '1950', true, 3),
    ('Atelier Moderne', 'atelier-moderne', 'Designer pieces with artistic expression', 'Designer', 'https://images.unsplash.com/photo-1558769132-cb1aea3c0c78', 'Designer', '2015', true, 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample hero section
INSERT INTO hero_sections (title, subtitle, description, background_image, cta_text, cta_link, is_active, display_order) VALUES
    ('Discover Luxury Fashion', 'Curated Excellence', 'Explore our handpicked selection of premium brands and timeless designs', 'https://images.unsplash.com/photo-1558769132-cb1aea3c0c78', 'Shop Now', '/products', true, 1),
    ('New Season Collection', 'Spring/Summer 2025', 'Experience the latest trends in haute couture and contemporary fashion', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d', 'Explore Collection', '/collections/new-season', true, 2)
ON CONFLICT (title) DO NOTHING;

-- Insert sample collections
INSERT INTO collections (name, slug, description, image_url, is_featured, display_order) VALUES
    ('Featured Collection', 'featured-collection', 'Handpicked pieces that embody timeless elegance and modern sophistication', 'https://images.unsplash.com/photo-1483985988355-763728e1935b', true, 1),
    ('New Arrivals', 'new-arrivals', 'Latest additions to our curated selection', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d', true, 2),
    ('Best Sellers', 'best-sellers', 'Our most popular items loved by customers', 'https://images.unsplash.com/photo-1558769132-cb1aea3c0c78', true, 3)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products with featured items
INSERT INTO products (name, description, price, image_url, brand_id, category_id, is_premium, is_featured, stock_quantity) 
SELECT 
    'Silk Evening Gown',
    'Luxurious silk gown with elegant draping and timeless design',
    1299.00,
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8',
    b.id,
    c.id,
    true,
    true,
    15
FROM brands b, categories c
WHERE b.slug = 'maison-elegance' AND c.slug = 'luxury'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, image_url, brand_id, category_id, is_premium, is_featured, stock_quantity) 
SELECT 
    'Cashmere Blazer',
    'Premium cashmere blazer with contemporary tailoring',
    899.00,
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea',
    b.id,
    c.id,
    true,
    true,
    20
FROM brands b, categories c
WHERE b.slug = 'urban-chic' AND c.slug = 'casual'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, image_url, brand_id, category_id, is_premium, is_featured, stock_quantity) 
SELECT 
    'Designer Handbag',
    'Handcrafted leather handbag with signature hardware',
    1599.00,
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3',
    b.id,
    c.id,
    true,
    true,
    8
FROM brands b, categories c
WHERE b.slug = 'luxe-heritage' AND c.slug = 'luxury'
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, image_url, brand_id, category_id, is_premium, is_featured, stock_quantity) 
SELECT 
    'Leather Jacket',
    'Classic leather jacket with modern design details',
    799.00,
    'https://images.unsplash.com/photo-1551028719-00167b16eac5',
    b.id,
    c.id,
    true,
    true,
    12
FROM brands b, categories c
WHERE b.slug = 'atelier-moderne' AND c.slug = 'casual'
ON CONFLICT DO NOTHING;

-- Link featured products to featured collection
INSERT INTO collection_products (collection_id, product_id, display_order)
SELECT 
    c.id,
    p.id,
    ROW_NUMBER() OVER (ORDER BY p.created_at)
FROM collections c
CROSS JOIN products p
WHERE c.slug = 'featured-collection' AND p.is_featured = true
ON CONFLICT DO NOTHING;

-- ============================================
-- FUNCTIONS & STORED PROCEDURES
-- ============================================

-- Function to get user's cart total
CREATE OR REPLACE FUNCTION get_cart_total(user_uuid UUID)
RETURNS DECIMAL AS $$
    SELECT COALESCE(SUM(product_price * quantity), 0)
    FROM cart_items
    WHERE user_id = user_uuid;
$$ LANGUAGE SQL STABLE;

-- Function to get cart item count
CREATE OR REPLACE FUNCTION get_cart_count(user_uuid UUID)
RETURNS INTEGER AS $$
    SELECT COALESCE(SUM(quantity), 0)::INTEGER
    FROM cart_items
    WHERE user_id = user_uuid;
$$ LANGUAGE SQL STABLE;

-- Function to check if product is in wishlist
CREATE OR REPLACE FUNCTION is_in_wishlist(user_uuid UUID, prod_id INTEGER)
RETURNS BOOLEAN AS $$
    SELECT EXISTS(
        SELECT 1 FROM wishlist_items
        WHERE user_id = user_uuid AND product_id = prod_id
    );
$$ LANGUAGE SQL STABLE;

-- Function to get featured brands
CREATE OR REPLACE FUNCTION get_featured_brands(limit_count INTEGER DEFAULT 4)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    slug VARCHAR(255),
    tagline VARCHAR(255),
    image_url TEXT,
    category VARCHAR(255)
) AS $$
    SELECT id, name, slug, tagline, image_url, category
    FROM brands
    WHERE is_featured = true
    ORDER BY display_order, name
    LIMIT limit_count;
$$ LANGUAGE SQL STABLE;

-- Function to get featured products
CREATE OR REPLACE FUNCTION get_featured_products(limit_count INTEGER DEFAULT 4)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    description TEXT,
    price DECIMAL(10, 2),
    image_url TEXT,
    is_premium BOOLEAN,
    brand_name VARCHAR(255),
    brand_slug VARCHAR(255)
) AS $$
    SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.image_url,
        p.is_premium,
        b.name,
        b.slug
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.is_featured = true
    ORDER BY p.created_at DESC
    LIMIT limit_count;
$$ LANGUAGE SQL STABLE;

-- Function to get active hero sections
CREATE OR REPLACE FUNCTION get_active_hero_sections()
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    subtitle TEXT,
    description TEXT,
    background_image TEXT,
    cta_text VARCHAR(100),
    cta_link VARCHAR(255),
    display_order INTEGER
) AS $$
    SELECT id, title, subtitle, description, background_image, cta_text, cta_link, display_order
    FROM hero_sections
    WHERE is_active = true
    ORDER BY display_order, created_at DESC;
$$ LANGUAGE SQL STABLE;

-- Function to get collection with products
CREATE OR REPLACE FUNCTION get_collection_products(collection_slug VARCHAR)
RETURNS TABLE (
    product_id UUID,
    product_name VARCHAR(255),
    product_price DECIMAL(10, 2),
    product_image TEXT,
    brand_name VARCHAR(255),
    is_premium BOOLEAN
) AS $$
    SELECT 
        p.id,
        p.name,
        p.price,
        p.image_url,
        b.name,
        p.is_premium
    FROM collection_products cp
    JOIN collections c ON cp.collection_id = c.id
    JOIN products p ON cp.product_id = p.id
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE c.slug = collection_slug
    ORDER BY cp.display_order, p.name;
$$ LANGUAGE SQL STABLE;

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View for products with brand and category details
CREATE OR REPLACE VIEW products_detailed AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.image_url,
    p.is_premium,
    p.is_featured,
    p.stock_quantity,
    b.name AS brand_name,
    b.slug AS brand_slug,
    b.tagline AS brand_tagline,
    c.name AS category_name,
    c.slug AS category_slug,
    p.created_at,
    p.updated_at
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN categories c ON p.category_id = c.id;

-- View for featured collections with product count
CREATE OR REPLACE VIEW featured_collections_summary AS
SELECT 
    c.id,
    c.name,
    c.slug,
    c.description,
    c.image_url,
    c.display_order,
    COUNT(cp.product_id) AS product_count
FROM collections c
LEFT JOIN collection_products cp ON c.id = cp.collection_id
WHERE c.is_featured = true
GROUP BY c.id, c.name, c.slug, c.description, c.image_url, c.display_order
ORDER BY c.display_order, c.created_at DESC;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE categories IS 'Product categories for organizing items';
COMMENT ON TABLE brands IS 'Brand information including name, description, and image';
COMMENT ON TABLE products IS 'Main products table with pricing and details';
COMMENT ON TABLE profiles IS 'User profile information extending auth.users';
COMMENT ON TABLE cart_items IS 'Shopping cart items for each user';
COMMENT ON TABLE wishlist_items IS 'Wishlist/favorites for each user';
COMMENT ON TABLE hero_sections IS 'Hero/banner sections for homepage and landing pages';
COMMENT ON TABLE collections IS 'Product collections for curated shopping experiences';
COMMENT ON TABLE collection_products IS 'Many-to-many relationship between collections and products';
COMMENT ON FUNCTION get_cart_total IS 'Calculate total price of items in user cart';
COMMENT ON FUNCTION get_cart_count IS 'Get total quantity of items in user cart';
COMMENT ON FUNCTION is_in_wishlist IS 'Check if a product is in user wishlist';
COMMENT ON FUNCTION get_featured_brands IS 'Get featured brands for homepage display';
COMMENT ON FUNCTION get_featured_products IS 'Get featured products for homepage collection';
COMMENT ON FUNCTION get_active_hero_sections IS 'Get active hero sections for carousel';
COMMENT ON FUNCTION get_collection_products IS 'Get all products in a specific collection';

-- ============================================
-- END OF SCHEMA
-- ============================================
