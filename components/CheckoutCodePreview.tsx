"use client";

interface CheckoutCodePreviewProps {
  code: string;
  onCopy: () => void;
  copied: boolean;
}

export function CheckoutCodePreview({ code, onCopy, copied }: CheckoutCodePreviewProps) {
  return (
    <section className="rounded-lg border border-border bg-surface overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold text-text-high tracking-widest uppercase">
            Generated Checkout Code
          </h2>
          <p className="text-[10px] text-text-low mt-0.5">
            Copy this code and include Razorpay script in your HTML
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            className="px-3 py-1.5 bg-primary-bg border border-primary/30 text-primary text-[10px] font-semibold rounded-md hover:bg-primary/20 transition-all"
          >
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>
      </div>
      <div className="relative">
        <pre className="max-h-96 overflow-auto p-5 text-[11px] leading-relaxed text-text-medium font-mono whitespace-pre-wrap">
          <code>{code}</code>
        </pre>
      </div>
    </section>
  );
}
