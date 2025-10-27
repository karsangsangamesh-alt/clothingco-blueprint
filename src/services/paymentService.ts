import { supabase } from '@/integrations/supabase/client';

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const createOrder = async (amount: number, currency: string = 'INR') => {
  try {
    // In production, this should call your backend API
    // For now, we'll create a Supabase function to handle this
    const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
      body: { amount: amount * 100, currency }, // Razorpay expects amount in paise
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

export const initiatePayment = async (
  options: Omit<RazorpayOptions, 'key' | 'theme'>
): Promise<RazorpayResponse> => {
  const isLoaded = await loadRazorpayScript();
  
  if (!isLoaded) {
    throw new Error('Failed to load Razorpay SDK');
  }

  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
  
  if (!razorpayKey) {
    throw new Error('Razorpay key not configured');
  }

  return new Promise((resolve, reject) => {
    const razorpay = new window.Razorpay({
      ...options,
      key: razorpayKey,
      theme: {
        color: '#000000',
      },
      handler: (response: RazorpayResponse) => {
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          reject(new Error('Payment cancelled'));
        },
      },
    });

    razorpay.open();
  });
};

export const verifyPayment = async (
  orderId: string,
  paymentId: string,
  signature: string
) => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
      body: { order_id: orderId, payment_id: paymentId, signature },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};
