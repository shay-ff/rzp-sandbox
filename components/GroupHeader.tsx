"use client";

interface GroupHeaderProps {
  group: string;
  numbered?: boolean;
}

export function GroupHeader({ group, numbered }: GroupHeaderProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
      <h2 className="text-xs tracking-widest text-text-medium uppercase">{group}</h2>
      {numbered && (
        <span className="text-[10px] bg-primary-bg border border-primary/30 text-primary px-2 py-0.5 rounded-full">
          sequential flow
        </span>
      )}
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
