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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-12 sm:space-y-16">
          <FilterBar
            search={endpointSearch}
            setSearch={setEndpointSearch}
            methodFilter={endpointMethodFilter}
            setMethodFilter={setEndpointMethodFilter}
          />

          <section>
            <GroupHeader group={group.group} numbered={group.numbered} />

            {filteredEndpoints.length > 0 && (
              <nav
                aria-label={`${group.group} endpoints`}
                className="mb-5 rounded-lg border border-border bg-surface p-3"
              >
                <p className="text-[10px] text-text-low tracking-widest uppercase mb-2">Jump to endpoint</p>
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {filteredEndpoints.map((endpoint) => (
                    <a
                      key={endpoint.id}
                      href={`#${endpoint.id}`}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-text-medium hover:bg-surface-hover hover:text-text-high transition-colors"
                    >
                      <span className="w-8 shrink-0 text-[10px] font-bold text-success">{endpoint.method}</span>
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
      <HistoryPanel />
    </div>
  );
}
