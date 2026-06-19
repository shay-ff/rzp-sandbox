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
    <div className="sticky top-0 z-10 -mx-2 mb-4 rounded-xl sm:rounded-2xl border border-border bg-bg/90 px-3 sm:px-4 py-3 sm:py-4 backdrop-blur">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-text-medium tracking-widest uppercase mr-1">Method</span>
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
          <button
            onClick={() => {
              setSearch("");
              setMethodFilter("ALL");
            }}
            className="rounded-full border border-border bg-surface px-3 py-1 text-[10px] font-semibold text-text-medium hover:border-border hover:text-text-high transition-colors"
          >
            clear filters
          </button>
        </div>
      </div>
    </div>
  );
}
