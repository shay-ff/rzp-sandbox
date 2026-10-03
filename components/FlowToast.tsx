"use client";

import { useEffect } from "react";

interface FlowToastProps {
  message: string;
  onClose: () => void;
}

export function FlowToast({ message, onClose }: FlowToastProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onClose, 5000);
    return () => window.clearTimeout(timeout);
  }, [onClose]);

  return (
    <div
      role="status"
      className="fixed right-4 top-4 z-[70] flex max-w-sm items-start gap-3 rounded-xl border border-success/30 bg-surface px-4 py-3 text-xs text-text-high shadow-xl shadow-black/15"
    >
      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-success-bg text-[10px] text-success">
        ✓
      </span>
      <p className="flex-1 leading-relaxed">{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="text-sm leading-none text-text-low hover:text-text-high"
      >
        ×
      </button>
    </div>
  );
}
