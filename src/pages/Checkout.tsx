import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { initiatePayment } from '@/services/paymentService';
import { calculateShipping } from '@/services/shippingService';
import { Loader2 } from 'lucide-react';

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimated_days: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string>('');
  const [shippingCost, setShippingCost] = useState(0);
  
  const [formData, setFormData] = useState({
    name: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });

  useEffect(() => {
    if (!user || cartItems.length === 0) {
      navigate('/cart');
    }
    fetchShippingMethods();
  }, [user, cartItems, navigate]);

  const fetchShippingMethods = async () => {
    const { data, error } = await supabase
      .from('shipping_methods')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true });

    if (!error && data) {
      setShippingMethods(data);
      if (data.length > 0) {
        setSelectedShipping(data[0].id);
        setShippingCost(data[0].price);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleShippingChange = (methodId: string) => {
    setSelectedShipping(methodId);
    const method = shippingMethods.find(m => m.id === methodId);
    if (method) {
      setShippingCost(method.price);
    }
  };

  const createOrderInDatabase = async (paymentDetails: any) => {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: user?.id,
          total_amount: finalTotal,
          status: 'processing',
          payment_status: 'paid',
          payment_method: 'razorpay',
          payment_id: paymentDetails.razorpay_payment_id,
          shipping_address: JSON.stringify(formData),
          shipping_method_id: selectedShipping,
          shipping_cost: shippingCost,
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = cartItems.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product_price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Update product stock
    for (const item of cartItems) {
      await supabase.rpc('decrement_stock', {
        product_id: item.product_id,
        quantity: item.quantity,
      });
    }

    return order;
  };

  const handlePayment = async () => {
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all shipping details',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const paymentResponse = await initiatePayment({
        amount: finalTotal,
        currency: 'INR',
        name: 'Clothing Co',
        description: `Order for ${cartItems.length} items`,
        order_id: `ORDER_${Date.now()}`,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        handler: async (response) => {
          try {
            const order = await createOrderInDatabase(response);
            await clearCart();
            
            toast({
              title: 'Payment successful!',
              description: 'Your order has been placed successfully.',
            });
            
            navigate(`/order-success/${order.id}`);
          } catch (error) {
            console.error('Error creating order:', error);
            toast({
              title: 'Error',
              description: 'Payment received but order creation failed. Please contact support.',
              variant: 'destructive',
            });
          }
        },
      });
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment failed',
        description: error.message || 'Failed to process payment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const finalTotal = cartTotal + shippingCost;

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <h1 className="text-4xl font-serif font-bold mb-8">Checkout</h1>
            
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                {/* Shipping Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pincode">Pincode *</Label>
                        <Input
                          id="pincode"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="India">India</SelectItem>
                            <SelectItem value="USA">USA</SelectItem>
                            <SelectItem value="UK">UK</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Method */}
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={selectedShipping} onValueChange={handleShippingChange}>
                      {shippingMethods.map((method) => (
                        <div key={method.id} className="flex items-center space-x-2 p-4 border rounded-lg">
                          <RadioGroupItem value={method.id} id={method.id} />
                          <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold">{method.name}</p>
                                <p className="text-sm text-muted-foreground">{method.description}</p>
                                <p className="text-sm text-muted-foreground">Delivery: {method.estimated_days}</p>
                              </div>
                              <p className="font-bold">₹{method.price.toFixed(2)}</p>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div>
                <Card className="sticky top-20">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>{item.product_name} x {item.quantity}</span>
                          <span>₹{(item.product_price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>₹{shippingCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total</span>
                        <span>₹{finalTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <Button
                      variant="luxury"
                      className="w-full"
                      onClick={handlePayment}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Pay with Razorpay'
                      )}
                    </Button>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      Secure payment powered by Razorpay
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
