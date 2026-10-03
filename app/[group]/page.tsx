"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { endpointGroups } from "@/lib/endpoint";
import { getGroupBySlug } from "@/lib/utils/endpointMeta";
import { Sidebar } from "@/components/Sidebar";
import { GroupHeader } from "@/components/GroupHeader";
import { EndpointCard } from "@/components/EndpointCard";
import { FilterBar } from "@/components/FilterBar";
import { HistoryPanel } from "@/components/HistoryPanel";
import { METHOD_COLORS } from "@/lib/utils/helpers";
import type { EndpointMethodFilter } from "@/lib/utils/constants";

export default function GroupPage() {
  const params = useParams();
  const slug = params.group as string;
  const groupName = getGroupBySlug(slug);

  const [endpointSearch, setEndpointSearch] = useState("");
  const [endpointMethodFilter, setEndpointMethodFilter] = useState<EndpointMethodFilter>("ALL");

  if (!groupName) {
    return (
      <div className="min-h-screen bg-bg text-text-medium font-sans flex flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 overflow-visible lg:overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="rounded-lg border border-border bg-surface p-8 text-center">
              <h1 className="text-sm font-semibold text-text-high mb-2">Group not found</h1>
              <p className="text-xs text-text-medium">The API group &quot;{slug}&quot; does not exist.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const group = endpointGroups.find((g) => g.group === groupName);
  if (!group) return null;

  const filteredEndpoints = group.endpoints.filter((endpoint) => {
    const matchesMethod = endpointMethodFilter === "ALL" || endpoint.method === endpointMethodFilter;
    const searchTerm = endpointSearch.trim().toLowerCase();
    if (!searchTerm) return matchesMethod;

    const haystack = [
      endpoint.id,
      endpoint.label,
      endpoint.method,
      group.group,
      endpoint.url || "",
      endpoint.variants?.map((v) => `${v.label} ${v.key}`).join(" ") || "",
    ]
      .join(" ")
      .toLowerCase();

    return matchesMethod && haystack.includes(searchTerm);
  });

  return (
    <div className="min-h-screen bg-bg text-text-medium font-sans flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-visible lg:overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-10 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <FilterBar
            search={endpointSearch}
            setSearch={setEndpointSearch}
            methodFilter={endpointMethodFilter}
            setMethodFilter={setEndpointMethodFilter}
          />

          <section>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-text-low">API reference</p>
                <p className="text-xs text-text-medium">
                  {filteredEndpoints.length} of {group.endpoints.length} endpoints
                </p>
              </div>
              {endpointSearch || endpointMethodFilter !== "ALL" ? (
                <span className="rounded-full border border-primary/20 bg-primary-bg px-2.5 py-1 text-[10px] font-medium text-primary">
                  filtered
                </span>
              ) : null}
            </div>
            <GroupHeader group={group.group} numbered={group.numbered} />

            {filteredEndpoints.length > 0 && (
              <nav
                aria-label={`${group.group} endpoints`}
                className="mb-5 rounded-xl border border-border bg-surface p-3 shadow-sm shadow-black/5"
              >
                <p className="text-[10px] text-text-low tracking-widest uppercase mb-2">Jump to endpoint</p>
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {filteredEndpoints.map((endpoint) => (
                    <a
                      key={endpoint.id}
                      href={`#${endpoint.id}`}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-text-medium hover:bg-surface-hover hover:text-text-high transition-colors"
                    >
                      <span
                        className={`inline-flex shrink-0 items-center justify-center rounded border px-1.5 py-0.5 text-[9px] font-bold ${
                          METHOD_COLORS[endpoint.method as keyof typeof METHOD_COLORS] ||
                          "text-text-medium bg-surface border-border"
                        }`}
                      >
                        {endpoint.method}
                      </span>
                      <span className="truncate">{endpoint.label}</span>
                    </a>
                  ))}
                </div>
              </nav>
            )}

            <div className="space-y-4">
              {filteredEndpoints.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-surface p-8 text-center text-xs text-text-medium">
                  No endpoints match the current filters.
                </div>
              ) : (
                filteredEndpoints.map((ep, idx) => (
                  <EndpointCard
                    key={ep.id}
                    endpoint={ep}
                    index={idx}
                    numbered={group.numbered}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </main>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-20 right-3 z-40 rounded-full border border-border bg-surface/95 px-3 py-2 text-[10px] font-semibold text-text-medium shadow-lg shadow-black/10 backdrop-blur transition-colors hover:border-primary/40 hover:text-text-high sm:bottom-6 sm:right-6"
        title="Back to top"
      >
        ↑ top
      </button>
      <HistoryPanel />
    </div>
  );
}
