-- =====================================================
-- Clothing Co - Enhanced Database Schema
-- Features: Shipping, Inventory Management, Storage
-- =====================================================

-- ============================================
-- 1. SHIPPING METHODS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS shipping_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  estimated_days VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert default shipping methods
INSERT INTO shipping_methods (name, description, price, estimated_days) VALUES
('Standard Shipping', 'Delivery in 5-7 business days', 50.00, '5-7 days'),
('Express Shipping', 'Delivery in 2-3 business days', 150.00, '2-3 days'),
('Next Day Delivery', 'Delivery by next business day', 250.00, '1 day');

-- ============================================
-- 2. ENHANCE ORDERS TABLE
-- ============================================
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS shipping_method_id UUID REFERENCES shipping_methods(id),
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- 3. INVENTORY MANAGEMENT
-- ============================================
-- Enhance products table for inventory
ALTER TABLE products
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS sku VARCHAR(100) UNIQUE,
ADD COLUMN IF NOT EXISTS weight DECIMAL(10, 2) DEFAULT 0.00; -- in kg

-- Inventory history table
CREATE TABLE IF NOT EXISTS inventory_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity_change INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reason VARCHAR(50) NOT NULL, -- 'sale', 'restock', 'adjustment', 'return'
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Low stock alerts view
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
  p.id,
  p.name,
  p.sku,
  p.stock_quantity,
  p.low_stock_threshold,
  b.name as brand_name
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id
WHERE p.stock_quantity <= p.low_stock_threshold
ORDER BY p.stock_quantity ASC;

-- ============================================
-- 4. STORAGE BUCKET SETUP
-- ============================================
-- Create storage bucket for product images (run this in Supabase Dashboard > Storage)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('product-images', 'product-images', true);

-- Storage policies for product images
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT
-- USING ( bucket_id = 'product-images' );

-- CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK ( bucket_id = 'product-images' );

-- CREATE POLICY "Users can update their uploads" ON storage.objects FOR UPDATE
-- TO authenticated
-- USING ( bucket_id = 'product-images' );

-- CREATE POLICY "Users can delete their uploads" ON storage.objects FOR DELETE
-- TO authenticated
-- USING ( bucket_id = 'product-images' );

-- ============================================
-- 5. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to decrement stock on order
CREATE OR REPLACE FUNCTION decrement_stock(product_id UUID, quantity INTEGER)
RETURNS void AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  SELECT stock_quantity INTO current_stock
  FROM products
  WHERE id = product_id
  FOR UPDATE;
  
  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  
  IF current_stock < quantity THEN
    RAISE EXCEPTION 'Insufficient stock. Available: %, Requested: %', current_stock, quantity;
  END IF;
  
  UPDATE products
  SET stock_quantity = stock_quantity - quantity
  WHERE id = product_id;
  
  INSERT INTO inventory_history (product_id, quantity_change, previous_quantity, new_quantity, reason)
  VALUES (product_id, -quantity, current_stock, current_stock - quantity, 'sale');
END;
$$ LANGUAGE plpgsql;

-- Function to increment stock (for returns/restocks)
CREATE OR REPLACE FUNCTION increment_stock(product_id UUID, quantity INTEGER, reason TEXT DEFAULT 'restock')
RETURNS void AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  SELECT stock_quantity INTO current_stock
  FROM products
  WHERE id = product_id
  FOR UPDATE;
  
  IF current_stock IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  
  UPDATE products
  SET stock_quantity = stock_quantity + quantity
  WHERE id = product_id;
  
  INSERT INTO inventory_history (product_id, quantity_change, previous_quantity, new_quantity, reason)
  VALUES (product_id, quantity, current_stock, current_stock + quantity, reason);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp on orders
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_shipping_methods_timestamp
BEFORE UPDATE ON shipping_methods
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- ============================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_history_product ON inventory_history(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_history_created ON inventory_history(created_at);

-- ============================================
-- 7. RLS POLICIES
-- ============================================

-- Shipping methods are public
ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read shipping methods" ON shipping_methods
  FOR SELECT USING (is_active = true);

-- Admin policy (requires role column in profiles - run supabase-fix-profiles.sql first)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    EXECUTE 'CREATE POLICY "Admin manage shipping methods" ON shipping_methods
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = ''admin''
        )
      )';
  END IF;
END $$;

-- Inventory history - admin only
ALTER TABLE inventory_history ENABLE ROW LEVEL SECURITY;

-- Admin policy (requires role column in profiles - run supabase-fix-profiles.sql first)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    EXECUTE 'CREATE POLICY "Admin read inventory history" ON inventory_history
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role = ''admin''
        )
      )';
  END IF;
END $$;

-- ============================================
-- 8. ORDER STATUS ENUMS (if not exists)
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
  END IF;
END $$;

-- =====================================================
-- COMPLETION
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- After running, configure storage buckets in the Dashboard
