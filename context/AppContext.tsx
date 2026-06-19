"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { useCredentials } from "@/hooks/useCredentials";
import { useHistory } from "@/hooks/useHistory";
import { useEndpointState } from "@/hooks/useEndpointState";
import { useRequestHandler } from "@/hooks/useRequestHandler";

function useAppState() {
  const credentials = useCredentials();
  const history = useHistory();
  const endpointState = useEndpointState();
  const handler = useRequestHandler(
    credentials.keyId,
    credentials.keySecret,
    endpointState.bodyValues,
    endpointState.urlValues,
    endpointState.selectedVariants,
    history.saveRequestHistory
  );

  useEffect(() => {
    if (!credentials.keyId) return;
    endpointState.setCheckoutValues((p) => ({
      ...p,
      caw_checkout: { ...(p.caw_checkout || {}), key: credentials.keyId },
    }));
  }, [credentials.keyId]);

  return { credentials, history, endpointState, handler };
}

type AppState = ReturnType<typeof useAppState>;

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const state = useAppState();
  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
