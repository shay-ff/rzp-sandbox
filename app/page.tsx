"use client";

import Link from "next/link";
import { endpointGroups } from "@/lib/endpoint";
import { groupSlugMap } from "@/lib/utils/endpointMeta";
import { Sidebar } from "@/components/Sidebar";
import { HistoryPanel } from "@/components/HistoryPanel";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg text-text-medium font-sans flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-visible lg:overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
          <div>
            <h1 className="text-lg font-semibold text-text-high tracking-tight">Razorpay API Sandbox</h1>
            <p className="text-xs text-text-medium mt-1">Select an API group to explore endpoints</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {endpointGroups.map((g) => {
              const slug = groupSlugMap[g.group];
              const methods = [...new Set(g.endpoints.map((e) => e.method))];
              return (
                <Link
                  key={g.group}
                  href={`/${slug}`}
                  className="group block rounded-lg border border-border bg-surface p-4 hover:border-primary/40 hover:bg-surface-hover transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-text-high group-hover:text-primary transition-colors">
                      {g.group}
                    </h3>
                    {g.numbered && (
                      <span className="text-[10px] bg-primary-bg border border-primary/30 text-primary px-2 py-0.5 rounded-full">
                        flow
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-text-medium">
                    <span>{g.endpoints.length} endpoints</span>
                    <span className="text-border">·</span>
                    <span className="flex gap-1">
                      {methods.map((m) => (
                        <span key={m} className="font-mono font-medium">
                          {m}
                        </span>
                      ))}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <HistoryPanel />
    </div>
  );
}
