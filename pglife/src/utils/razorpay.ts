import { supabase } from './supabase';
import { PaymentType } from '../types';

// Define the Razorpay options interface
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    payment_type: PaymentType;
    user_id: string;
    [key: string]: string;
  };
  theme: {
    color: string;
  };
}

// Function to load Razorpay script
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Function to create a Razorpay order
export const createRazorpayOrder = async (
  amount: number,
  paymentType: PaymentType,
  userId: string,
  metadata: Record<string, string> = {}
): Promise<{ orderId: string; error: string | null }> => {
  try {
    // Call your Supabase function to create an order
    const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
      body: {
        amount,
        paymentType,
        userId,
        ...metadata
      }
    });

    if (error) {
      console.error('Error creating Razorpay order:', error);
      return { orderId: '', error: error.message };
    }

    return { orderId: data.orderId, error: null };
  } catch (error) {
    console.error('Error:', error);
    return { orderId: '', error: 'Failed to create order' };
  }
};

// Function to initialize Razorpay payment
export const initializeRazorpayPayment = (
  options: Omit<RazorpayOptions, 'key'>,
  onSuccess: (response: any) => void,
  onError: (error: any) => void
): void => {
  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
  
  if (!razorpayKey) {
    onError(new Error('Razorpay key not found'));
    return;
  }

  try {
    const razorpayOptions: RazorpayOptions = {
      ...options,
      key: razorpayKey,
      handler: (response) => {
        onSuccess(response);
      },
    };

    const razorpay = new (window as any).Razorpay(razorpayOptions);
    razorpay.on('payment.failed', onError);
    razorpay.open();
  } catch (error) {
    console.error('Error initializing Razorpay:', error);
    onError(error);
  }
};

// Function to verify Razorpay payment
export const verifyRazorpayPayment = async (
  paymentId: string,
  orderId: string,
  signature: string,
  paymentType: PaymentType,
  userId: string,
  metadata: Record<string, string> = {}
): Promise<{ success: boolean; error: string | null }> => {
  try {
    // Call your Supabase function to verify the payment
    const { data, error } = await supabase.functions.invoke('verify-razorpay-payment', {
      body: {
        paymentId,
        orderId,
        signature,
        paymentType,
        userId,
        ...metadata
      }
    });

    if (error) {
      console.error('Error verifying Razorpay payment:', error);
      return { success: false, error: error.message };
    }

    return { success: data.success, error: null };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Failed to verify payment' };
  }
}; 