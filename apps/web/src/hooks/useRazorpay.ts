"use client";

import { useState, useEffect } from "react";

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

export function useRazorpay(): { ready: boolean; error: boolean } {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Already loaded
    if (document.querySelector(`script[src="${RAZORPAY_SCRIPT}"]`)) {
      setReady(true);
      return;
    }

    const script   = document.createElement("script");
    script.src     = RAZORPAY_SCRIPT;
    script.async   = true;
    script.onload  = () => setReady(true);
    script.onerror = () => setError(true);
    document.head.appendChild(script);
  }, []);

  return { ready, error };
}
