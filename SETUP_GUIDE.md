# Complete Setup Guide - Clothing Co E-Commerce Platform

This guide will help you set up a fully functional e-commerce platform with payment processing, image uploads, email notifications, and shipping integration.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Razorpay Payment Setup](#razorpay-payment-setup)
5. [Supabase Storage Setup](#supabase-storage-setup)
6. [Email Notifications Setup](#email-notifications-setup)
7. [Running the Application](#running-the-application)
8. [Admin Panel Setup](#admin-panel-setup)

---

## Prerequisites

Before starting, ensure you have:
- **Node.js 18+** and npm installed
- **Supabase account** (https://supabase.com)
- **Razorpay account** (https://razorpay.com)
- **Email service** (optional: for production emails)

---

## Environment Setup

### 1. Main Website (.env)

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
VITE_RAZORPAY_KEY_SECRET=your_secret_key
```

### 2. Admin Panel (.env)

In the `clothingco-admin` directory, create a `.env` file:

```env
# Use the SAME Supabase credentials as main website
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

---

## Database Configuration

### Step 1: Run Base Migration

1. Go to your Supabase Dashboard → SQL Editor
2. Run the existing `supabase-migrations.sql` file

### Step 2: Run Enhancement Migration

1. In Supabase Dashboard → SQL Editor
2. Run the new `supabase-enhancements.sql` file
3. This adds:
   - Shipping methods table
   - Inventory management
   - Enhanced order tracking
   - Stock management functions

### Step 3: Verify Tables

Check that these tables exist:
- ✅ products (with new columns: sku, weight, low_stock_threshold)
- ✅ orders (with new columns: payment_method, payment_id, shipping_method_id, tracking_number)
- ✅ shipping_methods
- ✅ inventory_history

---

## Razorpay Payment Setup

### Step 1: Create Razorpay Account

1. Sign up at https://razorpay.com
2. Complete KYC verification (for live mode)

### Step 2: Get API Keys

1. Dashboard → Settings → API Keys
2. Generate Test Keys for development
3. Add to `.env` file:
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
   VITE_RAZORPAY_KEY_SECRET=xxxxx
   ```

### Step 3: Test Payment Flow

1. Run the application
2. Add items to cart
3. Go to checkout
4. Use Razorpay test cards:
   - Card: 4111 1111 1111 1111
   - CVV: Any 3 digits
   - Expiry: Any future date

### Step 4: Webhook Setup (Production)

1. Razorpay Dashboard → Webhooks
2. Add webhook URL: `https://your-domain.com/api/razorpay-webhook`
3. Select events: `payment.captured`, `payment.failed`

---

## Supabase Storage Setup

### Step 1: Create Storage Bucket

1. Supabase Dashboard → Storage
2. Click "New Bucket"
3. Name: `product-images`
4. Make it **Public**

### Step 2: Set Up Policies

Run this in Supabase SQL Editor:

```sql
-- Public read access
CREATE POLICY "Public Access" ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'product-images' );

-- Users can update their uploads
CREATE POLICY "Users can update uploads" ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'product-images' );

-- Users can delete their uploads
CREATE POLICY "Users can delete uploads" ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'product-images' );
```

### Step 3: Test Image Upload

1. Go to Admin Panel → Products
2. Create/Edit a product
3. Upload an image
4. Verify it appears in Storage bucket

---

## Email Notifications Setup

### Option 1: Supabase Edge Functions (Recommended)

#### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

#### Step 2: Create Email Function

Create `supabase/functions/send-email/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  const { to, subject, html } = await req.json()
  
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Clothing Co <orders@yourdomain.com>',
      to,
      subject,
      html,
    }),
  })

  const data = await res.json()
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

#### Step 3: Deploy Function

```bash
supabase functions deploy send-email
```

#### Step 4: Set Environment Variables

```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key
```

### Option 2: Direct SMTP Integration

Use services like:
- **Resend** (recommended): https://resend.com
- **SendGrid**: https://sendgrid.com
- **AWS SES**: https://aws.amazon.com/ses/

---

## Running the Application

### Main Website

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Website runs on: http://localhost:8080

### Admin Panel

```bash
# Navigate to admin directory
cd clothingco-admin

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Admin panel runs on: http://localhost:5173

---

## Admin Panel Setup

### Step 1: Create Admin User

1. Sign up through the website at `/auth`
2. Go to Supabase Dashboard → Table Editor → `profiles`
3. Find your user and set `role` to `admin`

### Step 2: Access Admin Panel

- Navigate to `/admin` on the main website, OR
- Use the separate admin panel at `http://localhost:5173`

### Step 3: Configure Admin Features

Admin can manage:
- ✅ Products (with image upload)
- ✅ Orders (with status updates)
- ✅ Customers
- ✅ Categories & Brands
- ✅ Shipping Methods
- ✅ Inventory (low stock alerts)

---

## Inventory Management Features

### Stock Tracking
- Automatic stock deduction on orders
- Low stock alerts (configurable threshold)
- Inventory history tracking

### Managing Inventory

```sql
-- Check low stock products
SELECT * FROM low_stock_products;

-- Manually adjust stock
SELECT increment_stock('product-uuid', 50, 'restock');

-- View inventory history
SELECT * FROM inventory_history 
WHERE product_id = 'product-uuid' 
ORDER BY created_at DESC;
```

---

## Shipping Integration

### Current Setup
- Manual shipping methods in database
- Basic pincode-based calculation
- Order tracking support

### Future Integrations

To integrate with real shipping providers:

1. **Shiprocket** (India)
   ```bash
   npm install shiprocket-api
   ```

2. **Delhivery** (India)
   - API documentation: https://www.delhivery.com/api/

3. **ShipStation** (International)
   - API documentation: https://www.shipstation.com/docs/api/

Update `src/services/shippingService.ts` with provider APIs.

---

## Testing Checklist

### Website Testing
- [ ] User registration & login
- [ ] Browse products
- [ ] Add to cart
- [ ] Checkout process
- [ ] Razorpay payment (test mode)
- [ ] Order confirmation

### Admin Testing
- [ ] Login as admin
- [ ] Create product with image
- [ ] View orders
- [ ] Update order status
- [ ] Check inventory alerts
- [ ] Manage shipping methods

---

## Deployment

### Website Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add environment variables in Vercel Dashboard.

### Admin Panel Deployment

Deploy separately or as a subdomain:
- Website: `https://clothingco.com`
- Admin: `https://admin.clothingco.com`

---

## Troubleshooting

### Payment Not Working
- Check Razorpay keys in `.env`
- Verify Razorpay script loads (check browser console)
- Ensure amount is in correct format (INR paise)

### Images Not Uploading
- Verify storage bucket exists and is public
- Check storage policies in Supabase
- Ensure user is authenticated

### Email Not Sending
- Verify edge function is deployed
- Check email service API keys
- Check Supabase function logs

### Stock Not Updating
- Verify `decrement_stock` function exists
- Check product IDs match between orders and products
- Review inventory_history table for errors

---

## Support

For issues or questions:
1. Check existing GitHub issues
2. Review Supabase documentation
3. Contact support team

---

## Next Steps

1. ✅ Complete all setup steps above
2. ✅ Test entire flow end-to-end
3. ✅ Customize branding and UI
4. ✅ Add more products via Admin Panel
5. ✅ Set up production Razorpay account
6. ✅ Configure production email service
7. ✅ Deploy to production
8. ✅ Set up monitoring and analytics

---

**Made with ❤️ by Clothing Co**
