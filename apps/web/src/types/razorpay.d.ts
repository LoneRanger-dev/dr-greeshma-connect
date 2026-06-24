// Minimal types for Razorpay checkout.js loaded from CDN

interface RazorpayOptions {
  key:         string;
  amount:      number;       // paise
  currency:    string;
  name:        string;
  description?: string;
  order_id:    string;
  prefill?: {
    name?:    string;
    email?:   string;
    contact?: string;
  };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
  handler: (response: RazorpayResponse) => void;
}

interface RazorpayResponse {
  razorpay_order_id:   string;
  razorpay_payment_id: string;
  razorpay_signature:  string;
}

interface RazorpayInstance {
  open(): void;
  on(event: string, callback: () => void): void;
}

declare const Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
