"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { HISTORY_GROUPING_OPTIONS, ENDPOINT_METHOD_FILTERS } from "@/lib/utils/constants";
import type { HistoryGrouping, EndpointMethodFilter } from "@/lib/utils/constants";
import type { RequestHistoryEntry } from "@/lib/history";
import { METHOD_COLORS } from "@/lib/utils/helpers";
import { STATUS_COLOR } from "@/lib/utils/helpers";

export function HistoryPanel() {
  const { history, endpointState } = useApp();
  const { requestHistory, setRequestHistory, historyOpen, setHistoryOpen, clearRequestHistory } = history;
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [historySearch, setHistorySearch] = useState("");
  const [historyGrouping, setHistoryGrouping] = useState<HistoryGrouping>("group");
  const [historyMethodFilter, setHistoryMethodFilter] = useState<EndpointMethodFilter>("ALL");
  const [collapsedHistoryGroups, setCollapsedHistoryGroups] = useState<Record<string, boolean>>({});

  const toggleHistoryRow = (id: string) => {
    setExpandedHistoryId((p) => (p === id ? null : id));
  };

  const toggleHistoryGroup = (groupKey: string) => {
    setCollapsedHistoryGroups((p) => ({ ...p, [groupKey]: !p[groupKey] }));
  };

  const isHistoryGroupCollapsed = (groupKey: string) => collapsedHistoryGroups[groupKey] ?? false;

  const getHistoryGroupLabel = (groupKey: string) =>
    historyGrouping === "group" ? groupKey : `Method: ${groupKey}`;

  const filteredHistory = requestHistory.filter((item) => {
    const searchTerm = historySearch.trim().toLowerCase();
    const matchesMethod = historyMethodFilter === "ALL" || item.method === historyMethodFilter;
    if (!searchTerm) return matchesMethod;

    const haystack = [
      item.endpointId,
      item.endpointLabel,
      item.endpointGroup || "",
      item.method,
      item.url,
      item.variantKey || "",
      item.requestBody || "",
      item.responseSummary || "",
      item.responsePreview || "",
    ]
      .join(" ")
      .toLowerCase();

    return matchesMethod && haystack.includes(searchTerm);
  });

  const groupedHistory = filteredHistory.reduce<Record<string, RequestHistoryEntry[]>>((acc, item) => {
    const groupKey = historyGrouping === "group" ? item.endpointGroup || "Ungrouped" : item.method;
    acc[groupKey] = acc[groupKey] || [];
    acc[groupKey].push(item);
    return acc;
  }, {});

  const groupedHistoryEntries = Object.entries(groupedHistory);

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:bottom-auto sm:top-4 sm:right-4">
      <button
        onClick={() => setHistoryOpen((p) => !p)}
        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-border bg-surface/90 px-4 py-2 text-xs font-semibold text-text-high shadow-lg shadow-black/10 backdrop-blur hover:border-primary/40 hover:text-text-high transition-colors"
      >
        <span>History</span>
        <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] text-text-medium">{requestHistory.length}</span>
      </button>

      {historyOpen && (
        <div className="mt-3 w-full sm:w-[min(92vw,56rem)] max-h-[85vh] overflow-hidden rounded-2xl border border-border bg-surface/95 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="flex flex-col items-start gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xs tracking-widest text-text-medium uppercase">Session History</h2>
              <p className="text-[10px] text-text-medium">Requests are stored with the saved session</p>
            </div>
            <button
              onClick={clearRequestHistory}
              disabled={!requestHistory.length}
              className="text-[10px] text-text-medium hover:text-text-high transition-colors disabled:opacity-40 sm:ml-auto"
            >
              clear
            </button>
            <button
              onClick={() => setHistoryOpen(false)}
              className="text-[10px] text-text-medium hover:text-text-high transition-colors"
            >
              close
            </button>
          </div>

          <div className="border-b border-border px-4 py-3">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <label className="text-[10px] text-text-medium tracking-widest uppercase block mb-1">Search history</label>
                <input
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search by endpoint, body, response, or URL"
                  className="w-full bg-bg border border-border rounded-md px-3 py-2 text-xs text-text-high placeholder-text-medium outline-none focus:border-primary transition-colors font-mono"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1">
                  {HISTORY_GROUPING_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => setHistoryGrouping(option)}
                      className={`rounded-full px-3 py-1 text-[10px] font-semibold transition-colors ${
                        historyGrouping === option
                          ? "bg-primary-bg text-primary"
                          : "text-text-medium hover:text-text-high"
                      }`}
                    >
                      {option === "group" ? "Group" : "Method"}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {ENDPOINT_METHOD_FILTERS.map((method) => (
                    <button
                      key={method}
                      onClick={() => setHistoryMethodFilter(method)}
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                        historyMethodFilter === method
                          ? "border-primary/40 bg-primary-bg text-primary"
                          : "border-border bg-surface text-text-medium hover:border-border hover:text-text-high"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setHistorySearch("");
                    setHistoryGrouping("group");
                    setHistoryMethodFilter("ALL");
                  }}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-[10px] font-semibold text-text-medium hover:border-border hover:text-text-high transition-colors"
                >
                  clear filters
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-3">
            {groupedHistoryEntries.length ? (
              <div className="space-y-3">
                {groupedHistoryEntries.map(([groupKey, items]) => {
                  const collapsed = isHistoryGroupCollapsed(groupKey);
                  return (
                    <div key={groupKey} className="rounded-xl border border-border bg-surface overflow-hidden">
                      <button
                        onClick={() => toggleHistoryGroup(groupKey)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-hover transition-colors"
                      >
                        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-text-high">
                          {getHistoryGroupLabel(groupKey)}
                        </span>
                        <span className="shrink-0 rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] text-text-medium">
                          {items.length}
                        </span>
                        <span className="shrink-0 text-[10px] text-text-medium">{collapsed ? "▸" : "▾"}</span>
                      </button>

                      {!collapsed && (
                        <div className="space-y-2 p-3">
                          {items
                            .slice()
                            .reverse()
                            .map((item) => {
                              const isExpanded = expandedHistoryId === item.id;
                              return (
                                <div key={item.id} className="rounded-lg border border-border bg-bg overflow-hidden">
                                  <button
                                    onClick={() => toggleHistoryRow(item.id)}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-hover transition-colors"
                                  >
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                                        METHOD_COLORS[item.method as keyof typeof METHOD_COLORS] ||
                                        "text-text-medium bg-surface border-border"
                                      }`}
                                    >
                                      {item.method}
                                    </span>
                                    <span className="min-w-0 flex-1 truncate text-xs text-text-high font-semibold">
                                      {item.endpointLabel}
                                    </span>
                                    {item.variantKey && (
                                      <span className="shrink-0 rounded-full border border-primary/30 bg-primary-bg px-2 py-0.5 text-[10px] text-primary">
                                        {item.variantKey}
                                      </span>
                                    )}
                                    <span className={`shrink-0 text-[10px] font-bold ${STATUS_COLOR(item.status)}`}>
                                      {item.status ?? "failed"}
                                    </span>
                                    <span className="shrink-0 text-[10px] text-text-medium">{isExpanded ? "−" : "+"}</span>
                                  </button>

                                  {isExpanded && (
                                    <div className="grid gap-px border-t border-border bg-border md:grid-cols-2">
                                      <div className="bg-bg p-4">
                                        <div className="mb-3 flex items-center gap-2">
                                          <span className="text-[10px] tracking-widest text-text-medium uppercase">Request</span>
                                        </div>
                                        <div className="space-y-3 text-xs text-text-high">
                                          <div>
                                            <p className="text-[10px] uppercase tracking-widest text-text-medium mb-1">URL</p>
                                            <p className="break-all font-mono text-[11px] text-text-medium">{item.url || "-"}</p>
                                          </div>
                                          <div>
                                            <p className="text-[10px] uppercase tracking-widest text-text-medium mb-1">Body</p>
                                            <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-bg p-3 text-[11px] leading-relaxed text-text-medium">
                                              {item.requestBody || "No body"}
                                            </pre>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="bg-bg p-4">
                                        <div className="mb-3 flex items-center gap-2">
                                          <span className="text-[10px] tracking-widest text-text-medium uppercase">Response</span>
                                          {item.responseTruncated && (
                                            <span className="rounded-full border border-amber/30 bg-amber-bg px-2 py-0.5 text-[10px] text-amber">
                                              truncated
                                            </span>
                                          )}
                                        </div>
                                        <div className="space-y-3 text-xs text-text-high">
                                          <div>
                                            <p className="text-[10px] uppercase tracking-widest text-text-medium mb-1">Summary</p>
                                            <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-bg p-3 text-[11px] leading-relaxed text-text-medium">
                                              {item.responseSummary}
                                            </pre>
                                          </div>
                                          <div>
                                            <p className="text-[10px] uppercase tracking-widest text-text-medium mb-1">Preview</p>
                                            <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-bg p-3 text-[11px] leading-relaxed text-text-medium">
                                              {item.responsePreview}
                                            </pre>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-surface px-5 py-8 text-sm text-text-medium">
                No API requests match the current filters.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
