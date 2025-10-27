import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WishlistItem {
  id: string;
  product_id: string;
  product_name: string;
  product_brand: string;
  product_price: number;
  product_image: string;
}

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('user_id', user.id);
    
    if (!error && data) {
      setWishlistItems(data.map(item => ({ ...item, product_id: String(item.product_id) })));
    }
  };

  const addToWishlist = async (product: Omit<WishlistItem, 'id'>) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to wishlist.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('wishlist_items')
      .insert([{ ...product, product_id: Number(product.product_id), user_id: user.id }]);
    
    if (!error) {
      await fetchWishlist();
      toast({
        title: "Added to wishlist",
        description: `${product.product_name} has been added to your wishlist.`,
      });
    } else if (error.code === '23505') {
      toast({
        title: "Already in wishlist",
        description: "This item is already in your wishlist.",
        variant: "destructive",
      });
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', Number(productId));
    
    if (!error) {
      await fetchWishlist();
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist.",
      });
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  return {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  };
};
