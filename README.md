# Clothing Co - E-Commerce Blueprint

A modern, full-featured e-commerce platform built with React, TypeScript, and Supabase, featuring a comprehensive admin panel for complete store management.

## 🚀 Features

### Customer-Facing Features
- **Product Catalog** - Browse products with filtering and search
- **Brand Mall** - Explore products by brand
- **Shopping Cart** - Add, update, and manage cart items
- **User Authentication** - Secure login and registration
- **User Profiles** - Manage account details and preferences
- **Responsive Design** - Works seamlessly on all devices

### Admin Panel Features
- **Dashboard** - Real-time statistics and insights
- **Product Management** - Full CRUD operations for products
- **Order Management** - Track and update order status
- **Customer Management** - View and manage customer accounts
- **Category Management** - Organize products with categories
- **Brand Management** - Manage brand information and assets
- **Collection Management** - Curate seasonal collections

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Form Validation**: React Hook Form + Zod

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/karsangsangamesh-alt/clothingco-blueprint.git
   cd clothingco-blueprint
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
   ```

4. **Set up Supabase database**
   
   Run the SQL migration file to create necessary tables:
   ```bash
   # Use the SQL editor in your Supabase dashboard
   # Run the contents of supabase-migrations.sql
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:8080`

## 🗄️ Database Schema

The project uses the following Supabase tables:

- `profiles` - User profiles and authentication
- `products` - Product catalog
- `brands` - Brand information
- `categories` - Product categories
- `collections` - Curated product collections
- `orders` - Customer orders
- `order_items` - Order line items
- `cart_items` - Shopping cart
- `wishlist_items` - User wishlists
- `user_addresses` - Shipping/billing addresses

## 🎨 Project Structure

```
clothingco-blueprint/
├── src/
│   ├── admin/              # Admin panel
│   │   ├── layouts/        # Admin layout components
│   │   ├── pages/          # Admin pages
│   │   └── components/     # Admin-specific components
│   ├── components/         # Shared UI components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── integrations/       # External service integrations
│   │   └── supabase/       # Supabase client and types
│   ├── pages/              # Customer-facing pages
│   └── services/           # API services
├── public/                 # Static assets
└── supabase-migrations.sql # Database schema
```

## 🔑 Admin Panel

Access the admin panel at `/admin` after authentication.

### Admin Features:
- **Dashboard** (`/admin`) - Overview and statistics
- **Products** (`/admin/products`) - Manage product catalog
- **Orders** (`/admin/orders`) - Order management
- **Customers** (`/admin/customers`) - Customer list
- **Categories** (`/admin/categories`) - Category management
- **Brands** (`/admin/brands`) - Brand management
- **Collections** (`/admin/collections`) - Collection curation

## 🚀 Deployment

### Build for production
```bash
npm run build
```

The built files will be in the `dist/` directory.

### Deploy to various platforms:

- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy --prod`
- **GitHub Pages**: Use the built `dist/` folder

## 🔧 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code with ESLint

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database and auth by [Supabase](https://supabase.com/)
- Icons from [Lucide](https://lucide.dev/)

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Made with ❤️ by [karsangsangamesh-alt](https://github.com/karsangsangamesh-alt)
