"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo } from "react";
import { endpointGroups } from "@/lib/endpoint";
import { groupSlugMap } from "@/lib/utils/endpointMeta";
import { ThemeToggle } from "./ThemeToggle";
import { CredentialsPanel } from "./CredentialsPanel";

const NavSection = memo(function NavSection() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 px-3 py-4">
      <p className="mb-2 px-2 text-[10px] uppercase tracking-widest text-text-low">Tools</p>
      <Link
        href="/checkout"
        className={`block w-full rounded-lg px-3 py-2 text-left text-xs transition-colors ${
          pathname === "/checkout"
            ? "bg-primary-bg text-primary font-medium"
            : "text-text-medium hover:text-text-high hover:bg-surface-hover"
        }`}
      >
        <span className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="shrink-0">
            <path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6zm-1 0a1 1 0 0 0 1 1H5a1 1 0 0 0 1-1h4z"/>
            <path d="M5 15a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5zm-1-1h6V2H4v12z"/>
            <path d="M8 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 1a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
          </svg>
          Checkout Builder
        </span>
      </Link>
      <p className="mb-2 mt-5 px-2 text-[10px] uppercase tracking-widest text-text-low">Endpoints</p>
      {endpointGroups.map((g) => {
        const slug = groupSlugMap[g.group];
        const href = `/${slug}`;
        const isActive = pathname === href;
        return (
          <Link
            key={g.group}
            href={href}
            className={`block w-full rounded-lg px-3 py-2 text-left text-xs transition-colors ${
              isActive
                ? "bg-primary-bg text-primary font-medium"
                : "text-text-medium hover:text-text-high hover:bg-surface-hover"
            }`}
          >
            <span className="flex items-center justify-between">
              <span>{g.group}</span>
              <span className="text-[10px] text-text-low">{g.endpoints.length}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
});

export function Sidebar() {
  return (
    <aside className="w-full border-b border-border bg-surface flex flex-col shrink-0 lg:w-56 lg:border-b-0 lg:border-r lg:sticky lg:top-0 lg:h-screen overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-md bg-bg border border-border">
            <Image
              src="/favicon.ico"
              alt="Razorpay"
              fill
              sizes="24px"
              className="object-contain p-0.5"
              priority
            />
          </div>
          <span className="text-sm font-semibold tracking-wide text-text-high">RZP <span className="text-primary">Sandbox</span></span>
        </div>
        <ThemeToggle />
      </div>

      <CredentialsPanel />

      <NavSection />
    </aside>
  );
}
