-- =====================================================
-- Fix: Add role column to profiles table
-- Run this BEFORE running supabase-enhancements.sql
-- =====================================================

-- Add role column to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role VARCHAR(20) DEFAULT 'customer';
  END IF;
END $$;

-- Create index on role for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Update existing profiles to have customer role (if not set)
UPDATE profiles SET role = 'customer' WHERE role IS NULL;

-- Add constraint to ensure only valid roles
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('customer', 'admin', 'staff'));

-- Create a view for admin users (convenient for queries)
CREATE OR REPLACE VIEW admin_users AS
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
WHERE role = 'admin';

-- Grant appropriate permissions
GRANT SELECT ON admin_users TO authenticated;

COMMENT ON COLUMN profiles.role IS 'User role: customer (default), admin, or staff';
COMMENT ON VIEW admin_users IS 'View of users with admin role';

-- =====================================================
-- Optional: Make your first user an admin
-- =====================================================
-- Find your user ID from Supabase Dashboard > Authentication
-- Then run this (replace YOUR_USER_ID):
-- UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID';
