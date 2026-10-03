"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { endpointGroups } from "@/lib/endpoint";
import { getGroupBySlug, getGroupSlug } from "@/lib/utils/endpointMeta";
import { Sidebar } from "@/components/Sidebar";
import { GroupHeader } from "@/components/GroupHeader";
import { EndpointCard } from "@/components/EndpointCard";
import { FilterBar } from "@/components/FilterBar";
import { HistoryPanel } from "@/components/HistoryPanel";
import type { EndpointMethodFilter } from "@/lib/utils/constants";
import { FlowToast } from "@/components/FlowToast";

export default function GroupPage() {
  const params = useParams();
  const slug = params.group as string;
  const groupName = getGroupBySlug(slug);
  const group = endpointGroups.find((g) => g.group === groupName);
  const router = useRouter();

  const [endpointSearch, setEndpointSearch] = useState("");
  const [endpointMethodFilter, setEndpointMethodFilter] = useState<EndpointMethodFilter>("ALL");
  const [expandedEndpointId, setExpandedEndpointId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const storedToast = window.sessionStorage.getItem("next-step-toast");
    if (storedToast) {
      try {
        setToast(JSON.parse(storedToast).message || "");
      } catch {
        window.sessionStorage.removeItem("next-step-toast");
      }
      window.sessionStorage.removeItem("next-step-toast");
    }
    const nextEndpointId = window.sessionStorage.getItem("next-endpoint-id");
    if (!nextEndpointId || !group) return;
    if (group.endpoints.some((endpoint) => endpoint.id === nextEndpointId)) {
      setEndpointSearch("");
      setEndpointMethodFilter("ALL");
      setExpandedEndpointId(nextEndpointId);
      window.sessionStorage.removeItem("next-endpoint-id");
    }
  }, [group]);

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
      {toast && <FlowToast message={toast} onClose={() => setToast("")} />}
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
                    expanded={expandedEndpointId === ep.id}
                    onToggle={() => setExpandedEndpointId((current) => current === ep.id ? null : ep.id)}
                    onNextStep={(nextEndpoint, message) => {
                      const nextGroup = endpointGroups.find((candidate) =>
                        candidate.endpoints.some((candidateEndpoint) => candidateEndpoint.id === nextEndpoint.id)
                      );
                      if (!nextGroup) return;
                      setExpandedEndpointId(null);
                      setEndpointSearch("");
                      setEndpointMethodFilter("ALL");
                      if (nextGroup.group === group.group) {
                        window.sessionStorage.removeItem("next-step-toast");
                        setExpandedEndpointId(nextEndpoint.id);
                        setToast(message);
                      } else {
                        window.sessionStorage.setItem("next-endpoint-id", nextEndpoint.id);
                        router.push(`/${getGroupSlug(nextGroup.group)}`);
                      }
                    }}
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
