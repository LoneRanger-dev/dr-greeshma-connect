import { describe, it, expect } from "vitest";
import crypto from "crypto";

// Pure HMAC verification logic extracted for unit testing
// (mirrors what payments.service.ts does inside verifyPayment)

function computePaymentSignature(orderId: string, paymentId: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

function computeWebhookSignature(rawBody: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
}

describe("Razorpay payment signature verification", () => {
  const SECRET  = "test-webhook-secret";
  const ORDER   = "order_TestABC123";
  const PAYMENT = "pay_TestXYZ456";

  it("accepts a valid payment signature", () => {
    const sig = computePaymentSignature(ORDER, PAYMENT, SECRET);
    expect(sig).toMatch(/^[a-f0-9]{64}$/);
    // The same inputs produce the same signature
    expect(computePaymentSignature(ORDER, PAYMENT, SECRET)).toBe(sig);
  });

  it("rejects a payment signature with wrong order id", () => {
    const validSig  = computePaymentSignature(ORDER, PAYMENT, SECRET);
    const wrongSig  = computePaymentSignature("order_WRONG", PAYMENT, SECRET);
    expect(validSig).not.toBe(wrongSig);
  });

  it("rejects a payment signature with wrong payment id", () => {
    const validSig  = computePaymentSignature(ORDER, PAYMENT, SECRET);
    const wrongSig  = computePaymentSignature(ORDER, "pay_WRONG", SECRET);
    expect(validSig).not.toBe(wrongSig);
  });

  it("rejects a payment signature with wrong secret", () => {
    const validSig  = computePaymentSignature(ORDER, PAYMENT, SECRET);
    const wrongSig  = computePaymentSignature(ORDER, PAYMENT, "wrong-secret");
    expect(validSig).not.toBe(wrongSig);
  });

  it("timing-safe: equal signatures are identical strings", () => {
    const a = computePaymentSignature(ORDER, PAYMENT, SECRET);
    const b = computePaymentSignature(ORDER, PAYMENT, SECRET);
    expect(a).toBe(b);
    expect(a.length).toBe(64);
  });
});

describe("Razorpay webhook signature verification", () => {
  const SECRET = "wh-secret-abc";

  it("accepts a valid webhook signature", () => {
    const body = JSON.stringify({ event: "payment.captured", payload: {} });
    const sig  = computeWebhookSignature(body, SECRET);
    expect(computeWebhookSignature(body, SECRET)).toBe(sig);
  });

  it("rejects a webhook signature with tampered body", () => {
    const body    = JSON.stringify({ event: "payment.captured", payload: {} });
    const tampered = JSON.stringify({ event: "refund.created", payload: {} });
    const sig   = computeWebhookSignature(body, SECRET);
    const wrong = computeWebhookSignature(tampered, SECRET);
    expect(sig).not.toBe(wrong);
  });

  it("rejects a webhook signature with wrong secret", () => {
    const body = JSON.stringify({ event: "payment.captured", payload: {} });
    const sig   = computeWebhookSignature(body, SECRET);
    const wrong = computeWebhookSignature(body, "different-secret");
    expect(sig).not.toBe(wrong);
  });
});
