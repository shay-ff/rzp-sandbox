"use client";

import { ThemeProvider } from "@/context/ThemeContext";
import { AppProvider } from "@/context/AppContext";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AppProvider>
        {children}
      </AppProvider>
    </ThemeProvider>
  );
}
