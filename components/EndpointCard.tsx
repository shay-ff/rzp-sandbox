"use client";

import { useApp } from "@/context/AppContext";
import type { Endpoint } from "@/lib/endpoint";
import {
  isEndpointBodyDirty,
  getCheckoutFieldHint,
  getResponseCopyText,
  getResponseSummaryText,
  getResponsePreviewText,
  getResponseRawCopyText,
} from "@/lib/utils/helpers";
import { MethodBadge } from "./MethodBadge";

interface EndpointCardProps {
  endpoint: Endpoint;
  index: number;
  numbered?: boolean;
}

export function EndpointCard({ endpoint, index, numbered }: EndpointCardProps) {
  const { credentials, endpointState, handler } = useApp();
  const {
    bodyValues,
    setBodyValues,
    urlValues,
    setUrlValues,
    checkoutValues,
    setCheckoutValues,
    selectedVariants,
    setSelectedVariants,
    bodyErrors,
    setBodyErrors,
  } = endpointState;

  const {
    responses, loading, curlStatus, responseViewMode,
    setResponseViewMode, sendRequest, copyCurl, openCheckout,
    copyStatus, showCopied,
  } = handler;

  const ep = endpoint;
  const isCheckout = ep.method === "CHECKOUT";

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showCopied(key, "copied");
    } catch {
      showCopied(key, "error");
    }
  };

  const getCopyStatus = (key: string) => copyStatus[key] || "";

  return (
    <div
      id={ep.id}
      className="scroll-mt-24 border border-border rounded-lg bg-surface overflow-hidden"
    >
      <div className="px-4 sm:px-5 py-3 border-b border-border flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
        {numbered && (
          <span className="text-[10px] w-5 h-5 rounded-full border border-border flex items-center justify-center text-text-medium shrink-0">
            {index + 1}
          </span>
        )}
        <MethodBadge method={ep.method} />
        <span className="text-xs text-text-high font-semibold">{ep.label}</span>
      </div>

      <div className="p-5 space-y-4">
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
              <input
                value={urlValues[ep.id] || ep.url || ""}
                onChange={(e) => setUrlValues((p) => ({ ...p, [ep.id]: e.target.value }))}
                className="w-full bg-bg border border-border rounded-md px-3 py-2 text-xs text-text-high outline-none focus:border-primary transition-colors font-mono"
              />
            </div>

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
                      [ep.id]: JSON.stringify((ep.defaultBody as Record<string, any>)[key], null, 2),
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

            {(ep.defaultBody || (ep.method === "POST" && !ep.hideBody)) && (
              <div>
                {isEndpointBodyDirty(ep, bodyValues, selectedVariants) && (
                  <div className="mb-1.5 inline-flex rounded-full border border-amber/30 bg-amber-bg px-2 py-0.5 text-[10px] font-semibold text-amber">
                    modified from default
                  </div>
                )}
                <textarea
                  rows={Object.keys(ep.defaultBody || {}).length + 3}
                  value={bodyValues[ep.id] || ""}
                  onChange={(e) => setBodyValues((p) => ({ ...p, [ep.id]: e.target.value }))}
                  className={`w-full bg-bg border rounded-md px-3 py-2 text-xs text-text-high outline-none transition-colors font-mono resize-none ${
                    bodyErrors[ep.id]
                      ? "border-error focus:border-error"
                      : isEndpointBodyDirty(ep, bodyValues, selectedVariants)
                        ? "border-amber/40 focus:border-amber"
                        : "border-border focus:border-primary"
                  }`}
                  onBlur={(e) => {
                    try {
                      JSON.parse(e.target.value);
                      setBodyErrors((p) => ({ ...p, [ep.id]: false }));
                    } catch {
                      setBodyErrors((p) => ({ ...p, [ep.id]: true }));
                    }
                  }}
                />
                {bodyErrors[ep.id] && <p className="text-[10px] text-error mt-1">invalid JSON</p>}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2">
              <button
                onClick={() => sendRequest(ep)}
                disabled={loading[ep.id] || !credentials.credsSaved}
                title={!credentials.credsSaved ? "Save credentials first" : ""}
                className={`w-full sm:w-auto px-5 py-2 bg-primary-bg border border-primary/30 text-primary text-xs font-semibold rounded-md hover:bg-primary/20 transition-all disabled:opacity-50 ${
                  loading[ep.id] ? "cursor-wait" : !credentials.credsSaved ? "cursor-not-allowed" : ""
                }`}
              >
                {loading[ep.id] ? "sending..." : "Send →"}
              </button>
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
              {responses[ep.id] && (
                <>
                  <button
                    onClick={() => copyToClipboard(getResponseRawCopyText(responses[ep.id]), `json-${ep.id}`)}
                    className="relative w-full sm:w-auto px-3 py-2 bg-surface border border-border text-text-high text-xs font-semibold rounded-md hover:bg-surface-hover transition-all"
                  >
                    Copy JSON
                    {getCopyStatus(`json-${ep.id}`) && (
                      <span className={`absolute -right-1 -top-2 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        getCopyStatus(`json-${ep.id}`) === "copied"
                          ? "bg-success text-white"
                          : "bg-error text-white"
                      }`}>
                        {getCopyStatus(`json-${ep.id}`)}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => copyToClipboard(getResponseSummaryText(responses[ep.id]), `summary-${ep.id}`)}
                    className="relative w-full sm:w-auto px-3 py-2 bg-surface border border-border text-text-high text-xs font-semibold rounded-md hover:bg-surface-hover transition-all"
                  >
                    Copy summary
                    {getCopyStatus(`summary-${ep.id}`) && (
                      <span className={`absolute -right-1 -top-2 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        getCopyStatus(`summary-${ep.id}`) === "copied"
                          ? "bg-success text-white"
                          : "bg-error text-white"
                      }`}>
                        {getCopyStatus(`summary-${ep.id}`)}
                      </span>
                    )}
                  </button>
                </>
              )}
            </div>

            {responses[ep.id] && (
              <div className="mt-2">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                  <label className="text-[10px] text-text-medium tracking-widest uppercase">Response</label>
                  {responses[ep.id].isJson === false && (
                    <>
                      <button
                        onClick={() => setResponseViewMode((p) => ({ ...p, [ep.id]: "raw" }))}
                        className={`text-[10px] transition-colors ${(responseViewMode[ep.id] || "raw") === "raw" ? "text-primary" : "text-text-medium hover:text-text-high"}`}
                      >
                        raw
                      </button>
                      <button
                        onClick={() => setResponseViewMode((p) => ({ ...p, [ep.id]: "json" }))}
                        className={`text-[10px] transition-colors ${(responseViewMode[ep.id] || "raw") === "json" ? "text-primary" : "text-text-medium hover:text-text-high"}`}
                      >
                        json wrapper
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handler.setResponses((p) => ({ ...p, [ep.id]: null }))}
                    className="ml-auto text-[10px] text-text-medium hover:text-text-high transition-colors"
                  >
                    ✕ clear
                  </button>
                  {responses[ep.id].status && (
                    <span className={`text-[10px] font-bold ${
                      responses[ep.id].status < 300 ? "text-success" :
                      responses[ep.id].status < 500 ? "text-amber" : "text-error"
                    }`}>
                      {responses[ep.id].status}
                    </span>
                  )}
                  {responses[ep.id].error && (
                    <span className="text-[10px] text-error">{responses[ep.id].error}</span>
                  )}
                </div>
                {responses[ep.id].contentType && (
                  <p className="text-[10px] text-text-medium mb-2">{responses[ep.id].contentType}</p>
                )}
                <pre className="bg-bg border border-border rounded-md p-4 text-[11px] text-text-medium overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {getResponsePreviewText(responses[ep.id])}
                </pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
