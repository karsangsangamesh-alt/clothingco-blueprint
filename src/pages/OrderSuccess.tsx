import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Package, Home } from 'lucide-react';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="text-center">
              <CardContent className="pt-12 pb-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                
                <h1 className="text-3xl font-serif font-bold mb-4">
                  Order Placed Successfully!
                </h1>
                
                <p className="text-muted-foreground mb-8">
                  Thank you for your purchase. We've received your order and will process it shortly.
                </p>

                {order && (
                  <div className="bg-muted/30 rounded-lg p-6 mb-8 text-left">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Order Number</p>
                        <p className="font-semibold">{order.order_number || order.id.slice(0, 8)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Amount</p>
                        <p className="font-semibold">₹{order.total_amount?.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Payment Status</p>
                        <p className="font-semibold capitalize">{order.payment_status}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Order Status</p>
                        <p className="font-semibold capitalize">{order.status}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Button asChild variant="luxury" size="lg" className="w-full">
                    <Link to="/products">
                      <Package className="w-4 h-4 mr-2" />
                      Continue Shopping
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" size="lg" className="w-full">
                    <Link to="/">
                      <Home className="w-4 h-4 mr-2" />
                      Back to Home
                    </Link>
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mt-6">
                  A confirmation email has been sent to your email address.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default OrderSuccess;
