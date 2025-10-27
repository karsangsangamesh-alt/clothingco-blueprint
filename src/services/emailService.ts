import { supabase } from '@/integrations/supabase/client';

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  orderTotal: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: any;
}

// Email templates
export const generateOrderConfirmationEmail = (data: OrderEmailData): EmailTemplate => {
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
    </tr>
  `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #000; color: #fff; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Clothing Co</h1>
      </div>
      
      <div style="padding: 30px; background-color: #f9f9f9;">
        <h2 style="color: #000;">Order Confirmation</h2>
        <p>Hi ${data.customerName},</p>
        <p>Thank you for your order! We're excited to let you know that we've received your order and it's being processed.</p>
        
        <div style="background-color: #fff; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin-top: 0;">Order Details</h3>
          <p><strong>Order ID:</strong> ${data.orderId}</p>
          <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
          
          <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold; border-top: 2px solid #000;">Total:</td>
                <td style="padding: 15px 10px; text-align: right; font-weight: bold; border-top: 2px solid #000;">₹${data.orderTotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div style="background-color: #fff; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin-top: 0;">Shipping Address</h3>
          <p>
            ${data.shippingAddress.name}<br>
            ${data.shippingAddress.address}<br>
            ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.pincode}<br>
            ${data.shippingAddress.country}<br>
            Phone: ${data.shippingAddress.phone}
          </p>
        </div>
        
        <p>You'll receive another email when your order ships. If you have any questions, please don't hesitate to contact us.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${window.location.origin}/orders/${data.orderId}" style="background-color: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Track Your Order</a>
        </div>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Clothing Co. All rights reserved.</p>
        <p>This is an automated email, please do not reply directly to this message.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Order Confirmation - Clothing Co
    
    Hi ${data.customerName},
    
    Thank you for your order! Order ID: ${data.orderId}
    
    Order Details:
    ${data.items.map((item) => `${item.name} x ${item.quantity} - ₹${item.price}`).join('\n')}
    
    Total: ₹${data.orderTotal.toFixed(2)}
    
    Shipping Address:
    ${data.shippingAddress.name}
    ${data.shippingAddress.address}
    ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.pincode}
    ${data.shippingAddress.country}
    
    Track your order: ${window.location.origin}/orders/${data.orderId}
  `;

  return {
    to: data.customerEmail,
    subject: `Order Confirmation #${data.orderId}`,
    html,
    text,
  };
};

export const sendOrderConfirmation = async (orderData: OrderEmailData) => {
  try {
    const emailTemplate = generateOrderConfirmationEmail(orderData);
    
    // Using Supabase Edge Function to send email
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: emailTemplate,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

export const sendShippingNotification = async (
  customerEmail: string,
  orderId: string,
  trackingNumber: string
) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Your Order Has Shipped!</h2>
      <p>Great news! Your order #${orderId} is on its way.</p>
      <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
      <a href="${window.location.origin}/track/${trackingNumber}" style="background-color: #000; color: #fff; padding: 12px 30px; text-decoration: none; display: inline-block; margin-top: 20px;">Track Shipment</a>
    </body>
    </html>
  `;

  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: customerEmail,
        subject: `Your Order #${orderId} Has Shipped`,
        html,
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending shipping notification:', error);
    throw error;
  }
};

export const sendOrderStatusUpdate = async (
  customerEmail: string,
  orderId: string,
  status: string,
  message: string
) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Order Status Update</h2>
      <p>Your order #${orderId} status has been updated to: <strong>${status}</strong></p>
      <p>${message}</p>
    </body>
    </html>
  `;

  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: customerEmail,
        subject: `Order #${orderId} Status Update`,
        html,
      },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending status update email:', error);
    throw error;
  }
};
