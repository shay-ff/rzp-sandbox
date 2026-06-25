"use client";

import { useState, useCallback } from "react";
import type { Endpoint } from "@/lib/endpoint";
import type { RequestHistoryEntry } from "@/lib/history";
import {
  safeJsonStringify,
  truncateText,
  createHistoryId,
  getResponseSummaryText,
  getResponsePreviewText,
  shellEscape,
  resolveUrl,
} from "@/lib/utils/helpers";
import { endpointMetaById } from "@/lib/utils/endpointMeta";

export function useRequestHandler(
  keyId: string,
  keySecret: string,
  bodyValues: Record<string, string>,
  urlValues: Record<string, string>,
  urlParamValues: Record<string, Record<string, string>>,
  selectedVariants: Record<string, string>,
  saveRequestHistory: (entry: RequestHistoryEntry) => Promise<void>
) {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [curlStatus, setCurlStatus] = useState<Record<string, string>>({});
  const [responseViewMode, setResponseViewMode] = useState<Record<string, "json" | "raw">>({});
  const [copyStatus, setCopyStatus] = useState<Record<string, string>>({});

  const clearCopyStatus = useCallback((epId: string) => {
    setCopyStatus((p) => {
      const next = { ...p };
      delete next[`curl-${epId}`];
      delete next[`json-${epId}`];
      delete next[`summary-${epId}`];
      return next;
    });
    setCurlStatus((p) => {
      const next = { ...p };
      delete next[epId];
      return next;
    });
  }, []);

  const showCopied = useCallback((key: string, message: string = "copied") => {
    setCopyStatus((p) => ({ ...p, [key]: message }));
    setTimeout(() => {
      setCopyStatus((p) => {
        const next = { ...p };
        delete next[key];
        return next;
      });
    }, 2000);
  }, []);

  const sendRequest = useCallback(
    async (ep: Endpoint) => {
      clearCopyStatus(ep.id);
      setLoading((p) => ({ ...p, [ep.id]: true }));
      setResponses((p) => ({ ...p, [ep.id]: null }));
      setResponseViewMode((p) => ({ ...p, [ep.id]: "json" }));

      const requestBodyText = bodyValues[ep.id] || "";

      try {
        let body = null;
        if (requestBodyText) {
          body = JSON.parse(requestBodyText);
        }
        const templateUrl = urlValues[ep.id] || ep.url || "";
        const params = urlParamValues[ep.id] || {};
        const url = resolveUrl(templateUrl, params);
        const res = await fetch("/api/rzp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method: ep.method, url, body }),
        });

        const data = await res.json();
        setResponses((p) => ({ ...p, [ep.id]: data }));
        if (data && data.isJson === false) {
          setResponseViewMode((p) => ({ ...p, [ep.id]: "raw" }));
        }

        const responsePreview = getResponsePreviewText(data);
        const historyEntry: RequestHistoryEntry = {
          id: createHistoryId(),
          endpointId: ep.id,
          endpointLabel: ep.label,
          endpointGroup: endpointMetaById[ep.id]?.group,
          method: ep.method,
          url,
          requestBody: requestBodyText.trim() || null,
          responseSummary: getResponseSummaryText(data),
          responsePreview: truncateText(responsePreview, 1800),
          responseTruncated: responsePreview.length > 1800,
          status: res.status,
          timestamp: new Date().toISOString(),
          variantKey: selectedVariants[ep.id],
        };

        await saveRequestHistory(historyEntry);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Request failed";
        setResponses((p) => ({ ...p, [ep.id]: { error: message } }));
        const errorUrl = resolveUrl(urlValues[ep.id] || ep.url || "", urlParamValues[ep.id] || {});
        await saveRequestHistory({
          id: createHistoryId(),
          endpointId: ep.id,
          endpointLabel: ep.label,
          endpointGroup: endpointMetaById[ep.id]?.group,
          method: ep.method,
          url: errorUrl,
          requestBody: requestBodyText.trim() || null,
          responseSummary: `Error: ${message}`,
          responsePreview: message,
          responseTruncated: false,
          status: null,
          timestamp: new Date().toISOString(),
          variantKey: selectedVariants[ep.id],
        });
      } finally {
        setLoading((p) => ({ ...p, [ep.id]: false }));
      }
    },
    [bodyValues, urlValues, urlParamValues, selectedVariants, saveRequestHistory, clearCopyStatus]
  );

  const buildCurlCommand = useCallback(
    (ep: Endpoint) => {
      const templateUrl = urlValues[ep.id] || ep.url || "";
      const params = urlParamValues[ep.id] || {};
      const url = resolveUrl(templateUrl, params).trim();
      if (!url) throw new Error("URL is required");

      const parts = ["curl", "-X", ep.method, shellEscape(url)];
      if (keyId || keySecret) {
        parts.push("-u", shellEscape(`${keyId}:${keySecret}`));
      }
      const rawBody = (bodyValues[ep.id] || "").trim();
      if (rawBody) {
        const parsedBody = JSON.parse(rawBody);
        parts.push("-H", shellEscape("Content-Type: application/json"));
        parts.push("--data-raw", shellEscape(JSON.stringify(parsedBody)));
      }
      return parts.join(" ");
    },
    [keyId, keySecret, bodyValues, urlValues, urlParamValues]
  );

  const copyCurl = useCallback(
    async (ep: Endpoint) => {
      try {
        clearCopyStatus(ep.id);
        const command = buildCurlCommand(ep);
        await navigator.clipboard.writeText(command);
        setCurlStatus((p) => ({ ...p, [ep.id]: "copied" }));
        setTimeout(() => {
          setCurlStatus((p) => {
            const next = { ...p };
            delete next[ep.id];
            return next;
          });
        }, 2000);
      } catch {
        setCurlStatus((p) => ({ ...p, [ep.id]: "invalid payload" }));
      }
    },
    [buildCurlCommand, clearCopyStatus]
  );

  const openCheckout = useCallback(
    (ep: Endpoint, checkoutValues: Record<string, Record<string, string>>) => {
      const vals = checkoutValues[ep.id] || {};
      const options = {
        key: keyId || "",
        order_id: vals.order_id || "",
        customer_id: vals.customer_id || "",
        recurring: "1",
        handler: function (response: any) {
          alert(response.razorpay_payment_id);
          alert(response.razorpay_order_id);
          alert(response.razorpay_signature);
        },
        notes: {
          note_key_1: "Beam me up Scotty",
          note_key_2: "Tea. Earl Gray. Hot.",
        },
        theme: {
          color: "#528FF0",
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    },
    [keyId]
  );

  return {
    responses,
    setResponses,
    loading,
    curlStatus,
    responseViewMode,
    setResponseViewMode,
    copyStatus,
    showCopied,
    clearCopyStatus,
    sendRequest,
    copyCurl,
    openCheckout,
  };
}
