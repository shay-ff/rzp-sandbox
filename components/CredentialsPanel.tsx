"use client";

import { useApp } from "@/context/AppContext";
import { useEffect } from "react";

interface CredentialsPanelProps {
  onKeyIdChange?: (id: string) => void;
}

export function CredentialsPanel({ onKeyIdChange }: CredentialsPanelProps) {
  const { credentials, endpointState } = useApp();

  useEffect(() => {
    if (onKeyIdChange) onKeyIdChange(credentials.keyId);
  }, [credentials.keyId, onKeyIdChange]);

  useEffect(() => {
    if (!credentials.keyId) return;
    endpointState.setCheckoutValues((p) => ({
      ...p,
      caw_checkout: { ...(p.caw_checkout || {}), key: credentials.keyId },
    }));
  }, [credentials.keyId]);

  return (
    <div className="px-4 py-4 border-b border-border space-y-2">
      <p className="text-[10px] text-text-low tracking-widest uppercase mb-3">Credentials</p>
      <input
        placeholder="Key ID"
        value={credentials.keyId}
        onChange={(e) => credentials.setKeyId(e.target.value)}
        className="w-full bg-bg border border-border rounded-md px-3 py-1.5 text-xs text-text-high placeholder-text-low outline-none focus:border-primary transition-colors"
      />
      <input
        type={credentials.showSecret ? "text" : "password"}
        placeholder="Key Secret"
        value={credentials.keySecret}
        onChange={(e) => credentials.setKeySecret(e.target.value)}
        className="w-full bg-bg border border-border rounded-md px-3 py-1.5 text-xs text-text-high placeholder-text-low outline-none focus:border-primary transition-colors"
      />
      <label className="flex items-center gap-2 text-[10px] text-text-medium select-none cursor-pointer">
        <input
          type="checkbox"
          checked={credentials.showSecret}
          onChange={(e) => credentials.setShowSecret(e.target.checked)}
          className="accent-primary"
        />
        Show secret
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={credentials.saveCredentials}
          className={`w-full py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
            credentials.credsSaved
              ? "bg-success-bg border border-success/30 text-success"
              : "bg-primary-bg border border-primary/30 text-primary hover:bg-primary/20"
          }`}
        >
          {credentials.credsSaved ? "✓ saved" : "save"}
        </button>
        <button
          onClick={credentials.clearCredentials}
          className="w-full py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all bg-error-bg border border-error/30 text-error hover:bg-error/20"
        >
          clear
        </button>
      </div>
      {credentials.credError && <p className="text-[10px] text-error mt-1">{credentials.credError}</p>}
    </div>
  );
}
