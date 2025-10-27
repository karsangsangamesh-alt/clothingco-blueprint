import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Brand service
export type Brand = Database['public']['Tables']['brands']['Row'];

export const getBrands = async (): Promise<Brand[]> => {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }

  return data || [];
};

export const getFeaturedBrands = async (): Promise<Brand[]> => {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('is_featured', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching featured brands:', error);
    throw error;
  }

  return data || [];
};

export const getBrandBySlug = async (slug: string): Promise<Brand | null> => {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching brand by slug:', error);
    return null;
  }

  return data;
};

// Category service
export type Category = Database['public']['Tables']['categories']['Row'];

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return data || [];
};

export const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching category by slug:', error);
    return null;
  }

  return data;
};

// Hero sections service// ... existing imports ...

// Hero sections service
export type HeroSection = Database['public']['Tables']['hero_sections']['Row'];

export const getActiveHeroSections = async () => {
  const { data, error } = await supabase
    .rpc('get_active_hero_sections');

  if (error) {
    console.error('Error fetching active hero sections:', error);
    throw error;
  }

  return data || [];
};

// ... rest of the file remains the same ...

// Collections service
export type Collection = Database['public']['Tables']['collections']['Row'];

export const getCollections = async (): Promise<Collection[]> => {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }

  return data || [];
};

export const getFeaturedCollections = async (): Promise<Collection[]> => {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('is_featured', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching featured collections:', error);
    throw error;
  }

  return data || [];
};

export const getCollectionBySlug = async (slug: string): Promise<Collection | null> => {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching collection by slug:', error);
    return null;
  }

  return data;
};

export const getCollectionProducts = async (collectionSlug: string) => {
  const { data, error } = await supabase
    .rpc('get_collection_products', { collection_slug: collectionSlug });

  if (error) {
    console.error('Error fetching collection products:', error);
    throw error;
  }

  return data || [];
};

// Cart service
export type CartItem = Database['public']['Tables']['cart_items']['Row'];

export const getCartItems = async (userId: string): Promise<CartItem[]> => {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products(*)
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching cart items:', error);
    throw error;
  }

  return data || [];
};

export const addToCart = async (userId: string, productId: string, quantity: number = 1): Promise<void> => {
  const { error } = await supabase
    .from('cart_items')
    .upsert({
      user_id: userId,
      product_id: productId,
      quantity: quantity
    });

  if (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const removeFromCart = async (userId: string, productId: string): Promise<void> => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

export const updateCartItemQuantity = async (userId: string, productId: string, quantity: number): Promise<void> => {
  if (quantity <= 0) {
    await removeFromCart(userId, productId);
    return;
  }

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity: quantity })
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) {
    console.error('Error updating cart item quantity:', error);
    throw error;
  }
};

// Wishlist service
export type WishlistItem = Database['public']['Tables']['wishlist_items']['Row'];

export const getWishlistItems = async (userId: string): Promise<WishlistItem[]> => {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select(`
      *,
      product:products(*)
    `)
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching wishlist items:', error);
    throw error;
  }

  return data || [];
};

export const addToWishlist = async (userId: string, productId: string): Promise<void> => {
  const { error } = await supabase
    .from('wishlist_items')
    .insert({
      user_id: userId,
      product_id: productId
    });

  if (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const removeFromWishlist = async (userId: string, productId: string): Promise<void> => {
  const { error } = await supabase
    .from('wishlist_items')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};
