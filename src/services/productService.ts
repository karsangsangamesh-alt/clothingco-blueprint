import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Simplified type definitions to avoid deep instantiation
type Product = Database['public']['Tables']['products']['Row'];
type Brand = Database['public']['Tables']['brands']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

// Type for the query result with joined relations
interface ProductWithRelations extends Product {
  brand: { id: string; name: string; slug: string } | null;
  category: { id: string; name: string; slug: string } | null;
  slug: string;
  compare_at_price: number | null;
}

export const getProducts = async (): Promise<ProductWithRelations[]> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(id, name, slug),
      category:categories(id, name, slug)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return (data || []).map(item => ({
    ...item,
    slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    compare_at_price: null,
    brand: item.brand ? {
      id: item.brand.id,
      name: item.brand.name,
      slug: item.brand.slug
    } : null,
    category: item.category ? {
      id: item.category.id,
      name: item.category.name,
      slug: item.category.slug
    } : null
  }));
};

export const getFeaturedProducts = async (): Promise<ProductWithRelations[]> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(id, name, slug),
      category:categories(id, name, slug)
    `)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(8);

  if (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }

  return (data || []).map(item => ({
    ...item,
    slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    compare_at_price: null,
    brand: item.brand ? {
      id: item.brand.id,
      name: item.brand.name,
      slug: item.brand.slug
    } : null,
    category: item.category ? {
      id: item.category.id,
      name: item.category.name,
      slug: item.category.slug
    } : null
  }));
};

// Update other service functions similarly
export const getProductsByBrand = async (brandSlug: string): Promise<ProductWithRelations[]> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands!inner(*),
      category:categories(*)
    `)
    .eq('brand.slug', brandSlug)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by brand:', error);
    throw error;
  }

  return (data || []).map(item => ({
    ...item,
    slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    compare_at_price: null,
    brand: item.brand ? {
      id: item.brand.id,
      name: item.brand.name,
      slug: item.brand.slug
    } : null,
    category: item.category ? {
      id: item.category.id,
      name: item.category.name,
      slug: item.category.slug
    } : null
  }));
};

export const getProductsByCategory = async (categorySlug: string): Promise<ProductWithRelations[]> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      brand:brands(*),
      category:categories!inner(*)
    `)
    .eq('category.slug', categorySlug)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }

  return (data || []).map(item => ({
    ...item,
    slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    compare_at_price: null,
    brand: item.brand ? {
      id: item.brand.id,
      name: item.brand.name,
      slug: item.brand.slug
    } : null,
    category: item.category ? {
      id: item.category.id,
      name: item.category.name,
      slug: item.category.slug
    } : null
  }));
};