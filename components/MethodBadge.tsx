"use client";

import { METHOD_COLORS } from "@/lib/utils/helpers";

export function MethodBadge({ method }: { method: string }) {
  const style = METHOD_COLORS[method as keyof typeof METHOD_COLORS] || "text-text-medium bg-surface border-border";
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${style}`}>
      {method}
    </span>
  );
}
