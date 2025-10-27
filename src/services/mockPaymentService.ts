/**
 * Mock Payment Service - For Testing Without Razorpay Keys
 * 
 * This simulates payment processing for development/testing
 * Replace with real Razorpay integration in production
 */

export interface MockPaymentOptions {
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
}

export interface MockPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  success: boolean;
}

/**
 * Simulate payment processing with a modal dialog
 */
export const initiateMockPayment = async (
  options: MockPaymentOptions
): Promise<MockPaymentResponse> => {
  return new Promise((resolve, reject) => {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(4px);
    `;

    // Create payment modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 32px;
      max-width: 450px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease-out;
    `;

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateY(-20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    // Modal content
    modal.innerHTML = `
      <div style="text-align: center;">
        <div style="width: 60px; height: 60px; background: #528FF0; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        
        <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 600; color: #1a1a1a;">
          Mock Payment Gateway
        </h2>
        <p style="margin: 0 0 24px; color: #666; font-size: 14px;">
          Testing Mode - No real payment
        </p>

        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: left;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #666;">Merchant:</span>
            <strong style="color: #1a1a1a;">${options.name}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #666;">Amount:</span>
            <strong style="color: #1a1a1a; font-size: 18px;">₹${options.amount.toFixed(2)}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #666;">Order ID:</span>
            <strong style="color: #1a1a1a; font-size: 12px;">${options.order_id}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #666;">Customer:</span>
            <strong style="color: #1a1a1a;">${options.prefill.name}</strong>
          </div>
        </div>

        <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 12px; margin-bottom: 24px; font-size: 13px; color: #856404;">
          <strong>⚠️ Test Mode:</strong> This is a simulated payment. No real money will be charged.
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <button id="mockPaymentSuccess" style="
            background: #22c55e;
            color: white;
            border: none;
            padding: 14px 24px;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          ">
            ✓ Success
          </button>
          <button id="mockPaymentFail" style="
            background: #ef4444;
            color: white;
            border: none;
            padding: 14px 24px;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          ">
            ✗ Fail
          </button>
        </div>

        <p style="margin-top: 16px; font-size: 12px; color: #999;">
          Click "Success" to simulate successful payment
        </p>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Success button handler
    const successBtn = modal.querySelector('#mockPaymentSuccess');
    successBtn?.addEventListener('click', () => {
      document.body.removeChild(overlay);
      
      // Generate mock payment IDs
      const paymentId = `pay_mock_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      const signature = `sig_mock_${Math.random().toString(36).substr(2, 20)}`;
      
      resolve({
        razorpay_payment_id: paymentId,
        razorpay_order_id: options.order_id,
        razorpay_signature: signature,
        success: true,
      });
    });

    // Fail button handler
    const failBtn = modal.querySelector('#mockPaymentFail');
    failBtn?.addEventListener('click', () => {
      document.body.removeChild(overlay);
      reject(new Error('Payment failed - User cancelled'));
    });

    // Click outside to cancel
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
        reject(new Error('Payment cancelled'));
      }
    });
  });
};

/**
 * Check if we should use mock payment (no Razorpay keys configured)
 */
export const shouldUseMockPayment = (): boolean => {
  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
  return !razorpayKey || razorpayKey === 'your_razorpay_key_id_here' || razorpayKey === '';
};

/**
 * Generate mock order ID
 */
export const generateMockOrderId = (): string => {
  return `order_mock_${Date.now()}`;
};
