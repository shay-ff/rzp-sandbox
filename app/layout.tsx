import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Razorpay API Sandbox",
  description: "A sandbox environment to test Razorpay APIs and integrate with the Razorpay Checkout form.",
  icons: {
    icon: "/razorpay-icon.webp",
    shortcut: "/razorpay-icon.webp",
    apple: "/razorpay-icon.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Analytics />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="beforeInteractive" />  {/* ← move inside body */}
      </body>
    </html>
  );
}