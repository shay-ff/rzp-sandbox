import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { ClientProviders } from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: "Razorpay API Sandbox",
  description: "A sandbox environment to test Razorpay APIs and integrate with the Razorpay Checkout form.",
  icons: {
    icon: "/razorpay-icon.webp",
    shortcut: "/razorpay-icon.webp",
    apple: "/razorpay-icon.webp",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="antialiased">
        <ClientProviders>
          {children}
        </ClientProviders>
        <Analytics />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
