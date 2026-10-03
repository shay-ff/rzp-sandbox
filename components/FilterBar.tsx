"use client";

import { useState } from "react";
import { ENDPOINT_METHOD_FILTERS } from "@/lib/utils/constants";
import type { EndpointMethodFilter } from "@/lib/utils/constants";

interface FilterBarProps {
  search: string;
  setSearch: (v: string) => void;
  methodFilter: EndpointMethodFilter;
  setMethodFilter: (v: EndpointMethodFilter) => void;
}

export function FilterBar({ search, setSearch, methodFilter, setMethodFilter }: FilterBarProps) {
  return (
    <div className="sticky top-0 z-10 -mx-2 mb-6 rounded-xl border border-border bg-bg/95 px-3 py-3 shadow-sm shadow-black/5 backdrop-blur sm:px-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search endpoints</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search endpoints, URLs, or parameters"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-high outline-none transition-colors placeholder:text-text-low focus:border-primary/50"
            />
          </label>
          <button
            onClick={() => {
              setSearch("");
              setMethodFilter("ALL");
            }}
            disabled={!search && methodFilter === "ALL"}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-[10px] font-semibold text-text-medium transition-colors hover:border-primary/40 hover:text-text-high disabled:cursor-default disabled:opacity-40"
          >
            Clear
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[10px] uppercase tracking-widest text-text-low">Method</span>
          {ENDPOINT_METHOD_FILTERS.map((method) => (
            <button
              key={method}
              onClick={() => setMethodFilter(method)}
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold transition-colors ${
                methodFilter === method
                  ? "border-primary/40 bg-primary-bg text-primary"
                  : "border-border bg-surface text-text-medium hover:border-border hover:text-text-high"
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
