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
    <nav className="px-4 py-4 space-y-1">
      <p className="text-[10px] text-text-low tracking-widest uppercase mb-2 px-2">Endpoints</p>
      {endpointGroups.map((g) => {
        const slug = groupSlugMap[g.group];
        const href = `/${slug}`;
        const isActive = pathname === href;
        return (
          <Link
            key={g.group}
            href={href}
            className={`block w-full text-left text-xs py-2 px-2 rounded-md transition-colors ${
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
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
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
          <span className="text-sm font-semibold text-primary tracking-wide">RZP Sandbox</span>
        </div>
        <ThemeToggle />
      </div>

      <CredentialsPanel />

      <NavSection />
    </aside>
  );
}
