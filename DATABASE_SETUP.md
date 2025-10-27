# Database Setup - Quick Fix

You encountered the error: **`column profiles.role does not exist`**

This is because the profiles table needs a `role` column for admin functionality.

## 🔧 Quick Fix (3 steps)

### Step 1: Run Profile Fix Migration
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open and run: **`supabase-fix-profiles.sql`**
3. This adds the `role` column to profiles table

### Step 2: Run Enhancement Migration
1. Still in **SQL Editor**
2. Open and run: **`supabase-enhancements.sql`**
3. This adds shipping, inventory, and other features

### Step 3: Make Yourself Admin
1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Copy your user ID (UUID)
3. Go to **Table Editor** → **profiles** table
4. Find your profile row
5. Set `role` column to: **`admin`**

**OR** run this SQL (replace YOUR_USER_ID):
```sql
UPDATE profiles SET role = 'admin' 
WHERE id = 'YOUR_USER_ID';
```

---

## 📝 Files to Run in Order

Run these SQL files in your Supabase SQL Editor:

1. ✅ **`supabase-migrations.sql`** (if not already run)
2. ✅ **`supabase-fix-profiles.sql`** ⭐ **RUN THIS FIRST**
3. ✅ **`supabase-enhancements.sql`**

---

## ✅ Verify Setup

After running all migrations, check:

```sql
-- Check if role column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'role';

-- Check your role
SELECT id, email, role FROM profiles WHERE email = 'your@email.com';

-- Check if shipping methods exist
SELECT * FROM shipping_methods;

-- Check if inventory history table exists
SELECT COUNT(*) FROM inventory_history;
```

---

## 🎯 What Each Migration Does

### `supabase-migrations.sql`
- Creates base tables (orders, order_items, user_addresses)
- Sets up basic RLS policies

### `supabase-fix-profiles.sql` ⭐ NEW
- **Adds `role` column** to profiles table
- Sets default role to 'customer'
- Adds role validation
- Creates admin_users view

### `supabase-enhancements.sql`
- Creates shipping_methods table
- Adds inventory_history tracking
- Enhances orders table (payment, shipping, tracking)
- Adds stock management functions
- Creates performance indexes

---

## 🚨 Troubleshooting

### Error: "relation 'profiles' does not exist"
Your base schema hasn't been created. This table should be auto-created by Supabase Auth.

**Fix:**
1. Go to Supabase Dashboard → Authentication
2. Make sure Authentication is enabled
3. Sign up a test user to trigger profiles table creation

### Error: "column profiles.role does not exist"
You haven't run `supabase-fix-profiles.sql` yet.

**Fix:** Run `supabase-fix-profiles.sql` FIRST, then run `supabase-enhancements.sql`

### Can't access admin panel
Your user doesn't have admin role.

**Fix:**
```sql
-- Find your user ID from Authentication page, then:
UPDATE profiles SET role = 'admin' WHERE id = 'your-user-id';
```

---

## 🎉 After Setup

Once all migrations are complete:

1. ✅ Profiles have role column
2. ✅ Shipping methods table created
3. ✅ Inventory tracking enabled
4. ✅ Stock management functions ready
5. ✅ Enhanced order tracking
6. ✅ Your user has admin role

You can now:
- Access admin panel
- Manage products with inventory
- Process orders with shipping
- Track stock changes

---

## 📞 Still Having Issues?

1. Check Supabase SQL Editor for error messages
2. Verify you're logged into correct Supabase project
3. Make sure tables exist: `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`
4. Check your user exists: `SELECT * FROM auth.users;`

---

**Next:** See `SETUP_GUIDE.md` for complete application setup
