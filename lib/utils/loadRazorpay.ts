let pending: Promise<void> | null = null;

export function loadRazorpay(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Razorpay Checkout can only load in a browser"));
  }

  if (window.Razorpay) return Promise.resolve();
  if (pending) return pending;

  pending = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      pending = null;
      reject(new Error("Failed to load Razorpay Checkout"));
    };
    document.head.appendChild(script);
  });

  return pending;
}
