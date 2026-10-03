"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { endpointGroups, type Endpoint } from "@/lib/endpoint";
import {
  isEndpointBodyDirty,
  getCheckoutFieldHint,
  getResponseSummaryText,
  getResponsePreviewText,
  getResponseRawCopyText,
  formatUrlForDisplay,
} from "@/lib/utils/helpers";
import { MethodBadge } from "./MethodBadge";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="p-4 text-xs text-text-low">Loading editor…</div>,
});

const MODAL_EDITOR_OPTIONS = {
  automaticLayout: true,
  minimap: { enabled: true },
  fontSize: 13,
  lineNumbers: "on",
  scrollBeyondLastLine: false,
  wordWrap: "on",
  links: true,
  padding: { top: 16, bottom: 16 },
} as const;

function getJsonError(text: string): string | null {
  if (!text.trim()) return null;
  try {
    JSON.parse(text);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "Invalid JSON";
  }
}

const URL_PATTERN = /(https?:\/\/[^\s"'<>]+)/g;
const isUrlPart = (part: string) => /^https?:\/\/[^\s"'<>]+$/.test(part);

const getParameterPlaceholder = (param: string) => {
  switch (param) {
    case "payment_id":
      return "pay_...";
    case "customer_id":
      return "cust_...";
    case "order_id":
      return "order_...";
    case "from":
    case "to":
      return "Unix timestamp";
    case "count":
    case "skip":
      return "e.g. 2";
    default:
      return `Enter ${param.replace(/_/g, " ")}`;
  }
};

function LinkifiedText({ text }: { text: string }) {
  return (
    <>
      {text.split(URL_PATTERN).map((part, index) =>
        isUrlPart(part) ? (
          <a
            key={`${part}-${index}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary-hover"
          >
            {part}
          </a>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        )
      )}
    </>
  );
}

interface EndpointCardProps {
  endpoint: Endpoint;
  index: number;
  numbered?: boolean;
  expanded: boolean;
  onToggle: () => void;
  onNextStep?: (endpoint: Endpoint, message: string) => void;
}

export function EndpointCard({ endpoint, index, numbered, expanded, onToggle, onNextStep }: EndpointCardProps) {
  const { credentials, endpointState, handler } = useApp();
  const { mode } = useTheme();
  const {
    bodyValues,
    setBodyValues,
    urlValues,
    setUrlValues,
    checkoutValues,
    setCheckoutValues,
    urlParamValues,
    setUrlParamValues,
    headerValues,
    setHeaderValues,
    selectedVariants,
    setSelectedVariants,
    resetEndpoint,
  } = endpointState;

  const {
    responses, loading, curlStatus, responseViewMode,
    setResponseViewMode, sendRequest, copyCurl, openCheckout, clearResponse,
    copyStatus, showCopied,
  } = handler;

  const ep = endpoint;
  const isCheckout = ep.method === "CHECKOUT";
  const isGet = ep.method === "GET";
  const [expandedPanel, setExpandedPanel] = useState<"request" | "response" | null>(null);
  const bodyText = bodyValues[ep.id] || "";
  const bodyError = useMemo(() => getJsonError(bodyText), [bodyText]);
  const bodyRows = Math.max(6, Math.min(14, bodyText.split("\n").length + 1));

  useEffect(() => {
    if (!expandedPanel) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpandedPanel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expandedPanel]);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showCopied(key, "copied");
    } catch {
      showCopied(key, "error");
    }
  };

  const resetRequest = () => {
    resetEndpoint(ep.id);
    clearResponse(ep.id);
  };

  const canRetry = Boolean(responses[ep.id]?.error) && !loading[ep.id] && credentials.credsSaved;
  const nextStep = ep.nextStep;
  const nextEndpoint = nextStep
    ? endpointGroups.flatMap((group) => group.endpoints).find((item) => item.id === nextStep.endpointId)
    : undefined;
  const nextResponseValue = nextStep && (
    responses[ep.id]?.data?.[nextStep.responseField] ??
    responses[ep.id]?.[nextStep.responseField]
  );
  const canContinue = Boolean(
    nextStep &&
    (nextEndpoint || nextStep?.target === "route") &&
    nextResponseValue &&
    responses[ep.id]?.status >= 200 &&
    responses[ep.id]?.status < 300 &&
    !loading[ep.id]
  );

  const continueToNextStep = () => {
    if (!nextStep || !nextResponseValue) return;

    if (nextStep.target === "route" && nextStep.route) {
      window.sessionStorage.setItem(
        "next-step-toast",
        JSON.stringify({
          message: `${nextStep.label} opened. The ${nextStep.targetField} was auto-populated from the successful response.`,
        })
      );
      window.location.assign(`${nextStep.route}?order_id=${encodeURIComponent(String(nextResponseValue))}`);
      return;
    }

    if (!nextEndpoint) return;

    if (nextStep.target === "checkout") {
      setCheckoutValues((previous) => ({
        ...previous,
        [nextEndpoint.id]: {
          ...previous[nextEndpoint.id],
          [nextStep.targetField]: String(nextResponseValue),
        },
      }));
    } else if (nextStep.target === "body") {
      setBodyValues((previous) => {
        let currentBody: Record<string, unknown> = {};
        try {
          currentBody = JSON.parse(previous[nextEndpoint.id] || "{}");
        } catch {
          currentBody = {};
        }
        return {
          ...previous,
          [nextEndpoint.id]: JSON.stringify(
            { ...currentBody, [nextStep.targetField]: nextResponseValue },
            null,
            2
          ),
        };
      });
    }

    window.sessionStorage.setItem(
      "next-step-toast",
      JSON.stringify({
        message: `${nextStep.label} opened. The ${nextStep.targetField} was auto-populated from the successful response.`,
      })
    );
    onNextStep?.(
      nextEndpoint,
      `${nextStep.label} opened. The ${nextStep.targetField} was auto-populated from the successful response.`
    );
  };

  const getCopyStatus = (key: string) => copyStatus[key] || "";

  return (
    <div
      id={ep.id}
      onKeyDown={(event) => {
        if (!(event.metaKey || event.ctrlKey) || event.key !== "Enter") return;
        event.preventDefault();
        if (!isCheckout && !loading[ep.id] && credentials.credsSaved) sendRequest(ep);
      }}
      className="scroll-mt-24 overflow-hidden rounded-xl border border-border bg-surface shadow-sm shadow-black/5 transition-shadow hover:shadow-md hover:shadow-black/5"
    >
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={`${ep.id}-content`}
        onClick={onToggle}
        className="flex w-full items-center gap-3 border-b border-border bg-surface/70 px-4 py-3 text-left transition-colors hover:bg-surface-hover sm:px-5"
      >
        {numbered && (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-[10px] text-text-medium">
            {index + 1}
          </span>
        )}
        <MethodBadge method={ep.method} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-semibold text-text-high">{ep.label}</span>
          {!expanded && ep.url && (
            <span className="mt-0.5 block truncate font-mono text-[10px] text-text-low">{ep.url}</span>
          )}
        </span>
        <span className="shrink-0 text-[10px] font-semibold text-text-medium">
          {expanded ? "Collapse" : "Configure"}
        </span>
        <span aria-hidden="true" className={`text-text-low transition-transform ${expanded ? "rotate-180" : ""}`}>
          ↓
        </span>
      </button>

      {expanded && (
        <div
          id={`${ep.id}-content`}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6"
        >
          <div className={isGet
            ? "flex h-[min(92vh,860px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
            : "flex h-[min(92vh,860px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"}>
            <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <MethodBadge method={ep.method} />
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-text-high">{ep.label}</h2>
                  <p className="truncate font-mono text-[10px] text-text-low">{ep.url || "Checkout flow"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggle}
                aria-label="Close endpoint configurator"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-lg text-text-medium transition-colors hover:bg-surface-hover hover:text-text-high"
              >
                ×
              </button>
            </div>
            <div className={isGet
              ? "min-h-0 flex-1 overflow-y-auto"
              : "grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-2 lg:overflow-hidden"}>
              <div className={isGet
                ? "p-4 sm:p-5"
                : "min-h-0 border-b border-border p-4 sm:p-5 lg:overflow-y-auto lg:border-b-0 lg:border-r"}>
                <div className="mb-4 flex items-center gap-2 border-b border-border pb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-high">Request</span>
                  <span className="text-[10px] text-text-low">Configure and send this endpoint</span>
                </div>
        {isCheckout ? (
          <div className="space-y-3">
            <p className="text-[11px] text-text-medium">Fill fields then open Razorpay checkout</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(ep.checkoutFields ?? []).map((field) => (
                <div key={field}>
                  <label className="text-[10px] text-text-medium block mb-1">
                    {field}
                    {["order_id", "customer_id"].includes(field) && <span className="text-error"> *</span>}
                    {field === "key" && <span className="text-primary"> · prefilled</span>}
                  </label>
                  <input
                    placeholder={field}
                    value={checkoutValues[ep.id]?.[field] || ""}
                    onChange={(e) =>
                      setCheckoutValues((p) => ({
                        ...p,
                        [ep.id]: { ...p[ep.id], [field]: e.target.value },
                      }))
                    }
                    className="w-full bg-bg border border-border rounded-md px-3 py-1.5 text-xs text-text-high placeholder-text-low outline-none focus:border-primary transition-colors"
                  />
                  <p className="mt-1 text-[10px] text-text-medium">{getCheckoutFieldHint(field)}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => openCheckout(ep, checkoutValues)}
              className="w-full sm:w-auto px-4 py-2 bg-primary-bg border border-primary/30 text-primary text-xs font-semibold rounded-md hover:bg-primary/20 transition-all"
            >
              Open Checkout →
            </button>
          </div>
        ) : (
          <>
            <div>
              <label className="text-[10px] text-text-medium tracking-widest uppercase block mb-1.5">URL</label>
              <div className="flex items-stretch gap-2">
                <input
                  value={ep.params && ep.params.length > 0
                    ? formatUrlForDisplay(urlValues[ep.id] || ep.url || "", urlParamValues[ep.id] || {})
                    : (urlValues[ep.id] || ep.url || "")
                  }
                  readOnly={ep.params && ep.params.length > 0}
                  onChange={ep.params && ep.params.length > 0
                    ? undefined
                    : (e) => setUrlValues((p) => ({ ...p, [ep.id]: e.target.value }))
                  }
                  className="flex-1 bg-bg border border-border rounded-md px-3 py-2 text-xs text-text-high outline-none focus:border-primary transition-colors font-mono"
                />
              </div>
              {ep.params && ep.params.length > 0 && (
                <p className="text-[10px] text-text-low mt-1">Template: {urlValues[ep.id] || ep.url || ""}</p>
              )}
            </div>

            {ep.params && ep.params.length > 0 && (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ep.params.map((param) => (
                  <div key={param}>
                    <label className="text-[10px] text-text-medium block mb-1">
                      {param}
                      <span className="text-error"> *</span>
                    </label>
                    <input
                      placeholder={getParameterPlaceholder(param)}
                      value={urlParamValues[ep.id]?.[param] || ""}
                      onChange={(e) =>
                        setUrlParamValues((p) => ({
                          ...p,
                          [ep.id]: { ...p[ep.id], [param]: e.target.value.replace(/\s/g, "") },
                        }))
                      }
                      className="w-full bg-bg border border-border rounded-md px-3 py-1.5 text-xs text-text-high placeholder-text-low outline-none focus:border-primary transition-colors font-mono"
                    />
                  </div>
                ))}
              </div>
            )}

            {ep.variants && (
              <div>
                <label className="text-[10px] text-text-medium tracking-widest uppercase block mb-1.5">Type</label>
                <select
                  value={selectedVariants[ep.id] || ep.variants[0].key}
                  onChange={(e) => {
                    const key = e.target.value;
                    setSelectedVariants((p) => ({ ...p, [ep.id]: key }));
                    setBodyValues((p) => ({
                      ...p,
                      [ep.id]: JSON.stringify((ep.defaultBody as Record<string, unknown>)[key], null, 2),
                    }));
                  }}
                  className="bg-bg border border-border rounded-md px-3 py-2 text-xs text-text-high outline-none focus:border-primary transition-colors font-mono w-full"
                >
                  {ep.variants.map((v) => (
                    <option key={v.key} value={v.key}>{v.label}</option>
                  ))}
                </select>
              </div>
            )}

            {ep.headers && Object.keys(ep.headers).map((headerName) => (
              <div key={headerName}>
                <label className="text-[10px] text-text-medium tracking-widest uppercase block mb-1.5">
                  {headerName}
                </label>
                <input
                  value={headerValues[ep.id]?.[headerName] || ""}
                  onChange={(event) =>
                    setHeaderValues((previous) => ({
                      ...previous,
                      [ep.id]: {
                        ...previous[ep.id],
                        [headerName]: event.target.value,
                      },
                    }))
                  }
                  className="w-full bg-bg border border-border rounded-md px-3 py-2 text-xs text-text-high placeholder-text-low outline-none focus:border-primary transition-colors font-mono"
                />
              </div>
            ))}

            {(ep.defaultBody || (ep.method === "POST" && !ep.hideBody)) && (
              <div>
                {isEndpointBodyDirty(ep, bodyValues, selectedVariants) && (
                  <div className="mb-1.5 inline-flex rounded-full border border-amber/30 bg-amber-bg px-2 py-0.5 text-[10px] font-semibold text-amber">
                    modified from default
                  </div>
                )}
                <div className={`overflow-hidden rounded-md border ${
                  bodyError
                    ? "border-error"
                    : isEndpointBodyDirty(ep, bodyValues, selectedVariants)
                      ? "border-amber/40"
                      : "border-border"
                }`}>
                  <div className="flex items-center justify-between border-b border-border bg-surface px-3 py-1.5">
                    <span className="text-[10px] text-text-low">JSON</span>
                    <button
                      type="button"
                      onClick={() => setExpandedPanel("request")}
                      className="text-[10px] font-semibold text-text-medium hover:text-text-high transition-colors"
                    >
                      Expand editor
                    </button>
                  </div>
                  <textarea
                    value={bodyText}
                    onChange={(event) => setBodyValues((p) => ({ ...p, [ep.id]: event.target.value }))}
                    spellCheck={false}
                    rows={bodyRows}
                    aria-invalid={Boolean(bodyError)}
                    className="block w-full resize-y bg-bg px-3 py-2 font-mono text-xs leading-relaxed text-text-high outline-none"
                  />
                </div>
                {bodyError && <p className="text-[10px] text-error mt-1">Invalid JSON: {bodyError}</p>}
              </div>
            )}

            <div className="flex flex-col items-stretch gap-2 border-t border-border pt-4 sm:flex-row sm:flex-wrap sm:items-center">
              <button
                onClick={() => sendRequest(ep)}
                disabled={loading[ep.id] || !credentials.credsSaved}
                title={!credentials.credsSaved ? "Save credentials first" : ""}
                className={`w-full rounded-md border border-primary bg-primary px-5 py-2 text-xs font-semibold text-white transition-all hover:bg-primary-hover disabled:opacity-50 sm:w-auto ${
                  loading[ep.id] ? "cursor-wait" : !credentials.credsSaved ? "cursor-not-allowed" : ""
                }`}
              >
                {loading[ep.id] ? "sending..." : "Send →"}
              </button>
              <button
                onClick={resetRequest}
                className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold text-text-medium transition-colors hover:bg-surface-hover hover:text-text-high sm:w-auto"
              >
                Reset
              </button>
              {canRetry && (
                <button
                  onClick={() => sendRequest(ep)}
                  className="w-full rounded-md border border-primary/40 bg-primary-bg px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 sm:w-auto"
                >
                  Retry
                </button>
              )}
              <button
                onClick={() => copyCurl(ep)}
                className="relative w-full sm:w-auto px-3 py-2 bg-surface border border-border text-text-high text-xs font-semibold rounded-md hover:bg-surface-hover transition-all"
              >
                Copy cURL
                {curlStatus[ep.id] && (
                  <span className={`absolute -right-1 -top-2 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    curlStatus[ep.id] === "copied"
                      ? "bg-success text-white"
                      : "bg-error text-white"
                  }`}>
                    {curlStatus[ep.id]}
                  </span>
                )}
              </button>
            </div>
          </>
        )}
              </div>
              <div className={isGet
                ? "border-t border-border bg-bg/30 p-4 sm:p-5"
                : "min-h-0 p-4 sm:p-5 lg:overflow-y-auto"}>
                <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-high">Response</span>
                  {!responses[ep.id] && <span className="text-[10px] text-text-low">Send a request to see the response</span>}
                </div>
                {!responses[ep.id] && (
                  <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-border bg-bg/40 p-6 text-center text-xs text-text-low">
                    Your API response will appear here.
                  </div>
                )}
                {responses[ep.id] && (
                  <div className={`transition-opacity ${loading[ep.id] ? "opacity-50" : ""}`}>
                    <div className="mb-3 flex flex-wrap items-center gap-2 sm:gap-3">
                      {responses[ep.id].status && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          responses[ep.id].status < 300 ? "bg-success-bg text-success" :
                          responses[ep.id].status < 500 ? "bg-amber-bg text-amber" : "bg-error-bg text-error"
                        }`}>
                          {responses[ep.id].status}
                        </span>
                      )}
                      {responses[ep.id].clientLatencyMs != null && (
                        <span className="text-[10px] text-text-low">{responses[ep.id].clientLatencyMs} ms</span>
                      )}
                      {responses[ep.id].error && <span className="text-[10px] text-error">{responses[ep.id].error}</span>}
                      <button
                        onClick={() => setExpandedPanel("response")}
                        className="ml-auto text-[10px] font-semibold text-text-medium hover:text-text-high"
                      >
                        Expand
                      </button>
                      <button
                        onClick={() => clearResponse(ep.id)}
                        className="text-[10px] text-text-medium hover:text-text-high"
                      >
                        Clear
                      </button>
                    </div>
                    {responses[ep.id].contentType && (
                      <p className="mb-2 text-[10px] text-text-medium">{responses[ep.id].contentType}</p>
                    )}
                    {responses[ep.id].isJson === false && (
                      <div className="mb-3 flex gap-3">
                        <button onClick={() => setResponseViewMode((p) => ({ ...p, [ep.id]: "raw" }))} className="text-[10px] text-primary">raw</button>
                        <button onClick={() => setResponseViewMode((p) => ({ ...p, [ep.id]: "json" }))} className="text-[10px] text-text-medium hover:text-text-high">json wrapper</button>
                      </div>
                    )}
                    <pre className="min-h-64 rounded-xl border border-border bg-bg p-4 text-[11px] leading-relaxed text-text-medium overflow-auto whitespace-pre-wrap">
                      <LinkifiedText text={getResponsePreviewText(responses[ep.id])} />
                    </pre>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button onClick={() => copyToClipboard(getResponseRawCopyText(responses[ep.id]), `json-${ep.id}`)} className="rounded-md border border-border bg-surface px-3 py-2 text-[10px] font-semibold text-text-high hover:bg-surface-hover">
                        Copy JSON
                      </button>
                      <button onClick={() => copyToClipboard(getResponseSummaryText(responses[ep.id]), `summary-${ep.id}`)} className="rounded-md border border-border bg-surface px-3 py-2 text-[10px] font-semibold text-text-high hover:bg-surface-hover">
                        Copy summary
                      </button>
                      {canContinue && (
                        <button
                          type="button"
                          onClick={continueToNextStep}
                          aria-label={`Continue to ${nextStep?.label}`}
                          className="group inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary px-3.5 py-2 text-[10px] font-semibold text-white shadow-sm shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-md hover:shadow-primary/25 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-1 focus:ring-offset-surface"
                        >
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/15 text-[9px]">
                            ✓
                          </span>
                          <span>Next: {nextStep?.label}</span>
                          <span aria-hidden="true" className="text-xs transition-transform group-hover:translate-x-0.5">
                            →
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {expandedPanel && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6"
        >
          <div className="flex h-[min(88vh,760px)] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <p className="text-xs font-semibold text-text-high">
                  {expandedPanel === "request" ? "Request body" : "Response"}
                </p>
                <p className="text-[10px] text-text-low">{ep.label}</p>
              </div>
              <button
                type="button"
                aria-label="Close expanded view"
                onClick={() => setExpandedPanel(null)}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-text-medium hover:bg-surface-hover hover:text-text-high"
              >
                ×
              </button>
            </div>
            <div className="min-h-0 flex-1">
              {expandedPanel === "request" ? (
                <MonacoEditor
                  height="100%"
                  language="json"
                  theme={mode === "light" ? "vs" : "vs-dark"}
                  value={bodyValues[ep.id] || ""}
                  onChange={(value) => setBodyValues((p) => ({ ...p, [ep.id]: value || "" }))}
                  options={MODAL_EDITOR_OPTIONS}
                />
              ) : (
                <pre className="h-full overflow-auto bg-bg p-4 text-xs leading-relaxed text-text-medium whitespace-pre-wrap">
                  <LinkifiedText text={getResponsePreviewText(responses[ep.id])} />
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
