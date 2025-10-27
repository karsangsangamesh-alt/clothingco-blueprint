import { supabase } from '@/integrations/supabase/client';

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimated_days: string;
  is_active: boolean;
}

export const calculateShipping = async (
  pincode: string,
  weight: number
): Promise<number> => {
  // Basic shipping calculation based on pincode and weight
  // In production, integrate with shipping APIs (Shiprocket, Delhivery, etc.)
  
  const basePincode = pincode.substring(0, 3);
  
  // Metro cities (example)
  const metroPincodes = ['110', '400', '560', '600', '700', '380'];
  const isMetro = metroPincodes.includes(basePincode);
  
  // Base rate calculation
  let shippingCost = isMetro ? 50 : 80;
  
  // Weight-based surcharge (per kg above 1kg)
  if (weight > 1) {
    shippingCost += (weight - 1) * 20;
  }
  
  return shippingCost;
};

export const getShippingMethods = async (): Promise<ShippingMethod[]> => {
  const { data, error } = await supabase
    .from('shipping_methods')
    .select('*')
    .eq('is_active', true)
    .order('price', { ascending: true });

  if (error) {
    console.error('Error fetching shipping methods:', error);
    return [];
  }

  return data || [];
};

export const getShippingMethod = async (id: string): Promise<ShippingMethod | null> => {
  const { data, error } = await supabase
    .from('shipping_methods')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching shipping method:', error);
    return null;
  }

  return data;
};

export const trackShipment = async (trackingNumber: string) => {
  // Integrate with shipping provider's tracking API
  // For now, return mock data
  return {
    trackingNumber,
    status: 'in_transit',
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    updates: [
      {
        timestamp: new Date(),
        status: 'picked_up',
        location: 'Warehouse',
        message: 'Package picked up from seller',
      },
      {
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: 'processing',
        location: 'Warehouse',
        message: 'Order is being processed',
      },
    ],
  };
};
