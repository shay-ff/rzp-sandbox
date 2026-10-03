"use client";

interface GroupHeaderProps {
  group: string;
  numbered?: boolean;
}

export function GroupHeader({ group, numbered }: GroupHeaderProps) {
  return (
    <div className="mb-4 flex items-center gap-2 sm:mb-5 sm:gap-3">
      <h2 className="text-sm font-semibold tracking-tight text-text-high">{group}</h2>
      {numbered && (
        <span className="rounded-full border border-primary/30 bg-primary-bg px-2 py-0.5 text-[10px] font-medium text-primary">
          sequential flow
        </span>
      )}
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
