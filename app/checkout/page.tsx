"use client";

import Link from "next/link";
import { CheckoutBuilder } from "@/components/CheckoutBuilder";
import { HistoryPanel } from "@/components/HistoryPanel";
import { Sidebar } from "@/components/Sidebar";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-bg text-text-medium font-sans flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-visible lg:overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-8">
          <div>
            <h1 className="text-lg font-semibold text-text-high tracking-tight">
              Standard Checkout Builder
            </h1>
            <p className="text-xs text-text-medium mt-1">
              Configure Razorpay Standard Checkout with custom payment methods, ordering, and bank / network / wallet filtering.
              No saved credentials needed—just enter your key and order_id directly below.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-start gap-2">
              <svg className="shrink-0 text-primary mt-0.5" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
              </svg>
              <div className="space-y-1">
                <p className="text-[11px] text-text-medium leading-relaxed">
                  <strong className="text-text-high">How to use:</strong> Enter your key and order_id, enable/disable payment methods, drag to reorder them, and select specific card networks / banks / wallets. The generated code will reflect your configuration. Click "Test Live Checkout" to open the actual Razorpay checkout modal.
                </p>
                <p className="text-[10px] text-text-low">
                  Reference: {" "}
                  <Link
                    href="https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Configure Payment Methods
                  </Link>
                  {" · "}
                  <Link
                    href="https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/configure-payment-methods/display-configuration/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Display Configuration
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <CheckoutBuilder />
        </div>
      </main>
      <HistoryPanel />
    </div>
  );
}
