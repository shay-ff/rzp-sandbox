"use client";

import { useState, useEffect } from "react";
import { endpointGroups, Endpoint, EndpointGroup } from "@/lib/endpoint";

type RequestHistoryItem = {
  id: string;
  endpointId: string;
  endpointLabel: string;
  method: string;
  url: string;
  requestBody: string | null;
  response: any;
  status: number | null;
  timestamp: string;
  variantKey?: string;
};

const REQUEST_HISTORY_STORAGE_KEY = "rzp-sandbox-request-history";

const buildEndpointState = () => {
  const bodies: Record<string, string> = {};
  const urls: Record<string, string> = {};
  const checkoutValues: Record<string, Record<string, string>> = {};

  endpointGroups.forEach((group) => {
    group.endpoints.forEach((endpoint) => {
      if (endpoint.defaultBody) {
        if (endpoint.variants?.length) {
          const variantKey = endpoint.variants[0].key;
          bodies[endpoint.id] = JSON.stringify(endpoint.defaultBody[variantKey] ?? endpoint.defaultBody, null, 2);
        } else {
          bodies[endpoint.id] = JSON.stringify(endpoint.defaultBody, null, 2);
        }
      }
      if (endpoint.url) urls[endpoint.id] = endpoint.url;
      if (endpoint.checkoutFields) {
        checkoutValues[endpoint.id] = endpoint.checkoutFields.reduce<Record<string, string>>((acc, field) => {
          acc[field] = "";
          return acc;
        }, {});
      }
    });
  });

  return { bodies, urls, checkoutValues };
};

export default function Home() {
  const [keyId, setKeyId] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [credError, setCredError] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [credsSaved, setCredsSaved] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [urlValues, setUrlValues] = useState<Record<string, string>>({});
  const [bodyValues, setBodyValues] = useState<Record<string, string>>({});
  const [bodyErrors, setBodyErrors] = useState<Record<string, boolean>>({});
  const [curlStatus, setCurlStatus] = useState<Record<string, string>>({});
  const [responseViewMode, setResponseViewMode] = useState<Record<string, "json" | "raw">>({});
  const [checkoutValues, setCheckoutValues] = useState<Record<string, Record<string, string>>>({});
  const [requestHistory, setRequestHistory] = useState<RequestHistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  
  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((data) => {
        if (data.keyId) { setKeyId(data.keyId); setCredsSaved(true); }
        if (data.keySecret) setKeySecret(data.keySecret);
      });
  }, []);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(REQUEST_HISTORY_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) setRequestHistory(parsed);
    } catch {
      window.sessionStorage.removeItem(REQUEST_HISTORY_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem(REQUEST_HISTORY_STORAGE_KEY, JSON.stringify(requestHistory));
  }, [requestHistory]);

  useEffect(() => {
    if (!keyId) return;
    setCheckoutValues((p) => ({
      ...p,
      caw_checkout: {
        ...(p.caw_checkout || {}),
        key: keyId,
      },
    }));
  }, [keyId]);

  useEffect(() => {
    const { bodies, urls, checkoutValues } = buildEndpointState();
    setBodyValues(bodies);
    setUrlValues(urls);
    setCheckoutValues(checkoutValues);
  }, [endpointGroups]);

  const saveCredentials = async () => {
    if (!keyId || !keySecret) return;
    if(!keyId.startsWith("rzp_test_") && !keyId.startsWith("rzp_live_")) {
      setCredError("Key ID should start with 'rzp_test_' or 'rzp_live_'");
      return;
    }
    setCredError("");
    await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyId, keySecret }),
    });
    setCredsSaved(true);

  };

  const clearCredentials = async () => {
    await fetch("/api/session", { method: "DELETE" });
    setKeyId("");
    setKeySecret("");
    setCredError("");
    setCredsSaved(false);
    setShowSecret(false);
    setCheckoutValues((p) => ({
      ...p,
      caw_checkout: {
        ...(p.caw_checkout || {}),
        key: "",
      },
    }));
  };

  const toggleGroup = (group: string) => {
    setOpenGroups((p) => ({ ...p, [group]: !p[group] }));
  };

  const clearRequestHistory = () => {
    setRequestHistory([]);
  };

  const toggleHistoryRow = (id: string) => {
    setExpandedHistoryId((p) => (p === id ? null : id));
  };

  const createHistoryId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const sendRequest = async (ep: Endpoint) => {
    setLoading((p) => ({ ...p, [ep.id]: true }));
    setResponses((p) => ({ ...p, [ep.id]: null }));
    setResponseViewMode((p) => ({ ...p, [ep.id]: "json" }));

    const requestBodyText = bodyValues[ep.id] || "";

    try {
      let body = null;
      if (requestBodyText) {
        body = JSON.parse(requestBodyText);
      }

      const url = urlValues[ep.id] || ep.url || "";
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

      setRequestHistory((p) => [
        ...p,
        {
          id: createHistoryId(),
          endpointId: ep.id,
          endpointLabel: ep.label,
          method: ep.method,
          url,
          requestBody: requestBodyText.trim() || null,
          response: data,
          status: res.status,
          timestamp: new Date().toISOString(),
          variantKey: selectedVariants[ep.id],
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request failed";
      setResponses((p) => ({ ...p, [ep.id]: { error: message } }));
      setRequestHistory((p) => [
        ...p,
        {
          id: createHistoryId(),
          endpointId: ep.id,
          endpointLabel: ep.label,
          method: ep.method,
          url: urlValues[ep.id] || ep.url || "",
          requestBody: requestBodyText.trim() || null,
          response: { error: message },
          status: null,
          timestamp: new Date().toISOString(),
          variantKey: selectedVariants[ep.id],
        },
      ]);
    } finally {
      setLoading((p) => ({ ...p, [ep.id]: false }));
    }
  };

  const shellEscape = (value: string) => `'${value.replace(/'/g, `'\\''`)}'`;

  const buildCurlCommand = (ep: Endpoint) => {
    const url = (urlValues[ep.id] || ep.url || "").trim();
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
  };

  const copyCurl = async (ep: Endpoint) => {
    try {
      const command = buildCurlCommand(ep);
      await navigator.clipboard.writeText(command);
      setCurlStatus((p) => ({ ...p, [ep.id]: "copied" }));
    } catch {
      setCurlStatus((p) => ({ ...p, [ep.id]: "invalid payload" }));
    }
  };

  const getResponseCopyText = (response: any) => {
    if (response?.isJson === false) {
      return String(response.raw || "");
    }
    return JSON.stringify(response?.data || response, null, 2);
  };

  const getResponseDisplayText = (epId: string, response: any) => {
    const mode = responseViewMode[epId] || "json";
    if (mode === "raw") {
      if (response?.isJson === false) {
        return String(response.raw || "");
      }
      return JSON.stringify(response?.data || response, null, 2);
    }
    return JSON.stringify(response?.data || response, null, 2);
  };

  const openCheckout = (ep: Endpoint) => {
    const vals = checkoutValues[ep.id] || {};
    const options = {
      "key": keyId || "",
      "order_id": vals.order_id || "",
      "customer_id": vals.customer_id || "",
      "recurring": "1",
      "handler": function (response: any) {
        alert(response.razorpay_payment_id);
        alert(response.razorpay_order_id);
        alert(response.razorpay_signature);
      },
      "notes": {
        "note_key 1": "Beam me up Scotty",
        "note_key 2": "Tea. Earl Gray. Hot."
      },
      "theme": {
        "color": "#F37254"
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const METHOD_COLOR: Record<string, string> = {
    GET: "text-green-400 bg-green-400/10 border-green-400/20",
    POST: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    PUT: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    PATCH: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    DELETE: "text-red-400 bg-red-400/10 border-red-400/20",
    CHECKOUT: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  };

  const STATUS_COLOR = (status: number | null) => {
    if (!status) return "text-slate-400";
    if (status < 300) return "text-green-400";
    if (status < 500) return "text-yellow-400";
    return "text-red-400";
  };

  const formatHistoryResponse = (response: any) => {
    if (response?.error) return response.error;
    return JSON.stringify(response, null, 2);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200 font-mono flex">

      {/* Sidebar */}
      <aside className="w-56 border-r border-white/5 bg-[#0d0d18] flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold">⚡</div>
            <span className="text-sm font-semibold text-indigo-300 tracking-wide">RZP Sandbox</span>
          </div>
        </div>

        {/* Credentials */}
        <div className="px-4 py-4 border-b border-white/5 space-y-2">
          <p className="text-[10px] text-slate-600 tracking-widest uppercase mb-3">Credentials</p>
          <input
            placeholder="Key ID"
            value={keyId}
            onChange={(e) => setKeyId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-colors"
          />
          <input
            type={showSecret ? "text" : "password"}
            placeholder="Key Secret"
            value={keySecret}
            onChange={(e) => setKeySecret(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-colors"
          />
          <label className="flex items-center gap-2 text-[10px] text-slate-500 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={showSecret}
              onChange={(e) => setShowSecret(e.target.checked)}
              className="accent-indigo-500"
            />
            Show secret
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={saveCredentials}
              className={`w-full py-1.5 rounded text-xs font-semibold tracking-wide transition-all ${credsSaved
                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                : "bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30"
                }`}
            >
              {credsSaved ? "✓ saved" : "save"}
            </button>
            <button
              onClick={clearCredentials}
              className="w-full py-1.5 rounded text-xs font-semibold tracking-wide transition-all bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20"
            >
              clear
            </button>
          </div>
          {credError && <p className="text-[10px] text-red-400 mt-1">{credError}</p>
          }
        </div>

        {/* Nav Groups */}
        <nav className="px-4 py-4 space-y-1">
          {endpointGroups.map((g) => (
            <div key={g.group}>
              <button
                onClick={() => toggleGroup(g.group)}
                className="w-full text-left text-xs text-slate-400 hover:text-slate-200 py-1.5 flex items-center justify-between transition-colors group"
              >
                <span className="underline underline-offset-2 decoration-slate-600 group-hover:decoration-slate-400">
                  {g.group}
                </span>
                <span className="text-slate-600 text-[10px]">{openGroups[g.group] ? "▲" : "▼"}</span>
              </button>
              {openGroups[g.group] && (
                <div className="ml-2 mt-1 space-y-0.5 border-l border-white/5 pl-3">
                  {g.endpoints.map((ep, i) => (
                    <a
                      key={ep.id}
                      href={`#${ep.id}`}
                      className="flex items-center gap-2 py-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {g.numbered && (
                        <span className="text-[9px] text-slate-700 w-3">{i + 1}.</span>
                      )}
                      <span>{ep.label}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-10 space-y-16">
          {endpointGroups.map((g) => (
            <section key={g.group}>
              {/* Group Header */}
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xs tracking-widest text-slate-500 uppercase">{g.group}</h2>
                {g.numbered && (
                  <span className="text-[10px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">
                    sequential flow
                  </span>
                )}
                <div className="flex-1 h-px bg-white/5" />
              </div>

              {/* Endpoint Cards */}
              <div className="space-y-4">
                {g.endpoints.map((ep, idx) => (
                  <div
                    key={ep.id}
                    id={ep.id}
                    className="border border-white/5 rounded-lg bg-[#0d0d18] overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="px-5 py-3 border-b border-white/5 flex items-center gap-3">
                      {g.numbered && (
                        <span className="text-[10px] w-5 h-5 rounded-full border border-white/10 flex items-center justify-center text-slate-500 shrink-0">
                          {idx + 1}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${METHOD_COLOR[ep.method]}`}>
                        {ep.method}
                      </span>
                      <span className="text-xs text-slate-300 font-semibold">{ep.label}</span>
                    </div>

                    <div className="p-5 space-y-4">
                      {/* CHECKOUT card */}
                      {ep.method === "CHECKOUT" ? (
                        <div className="space-y-3">
                          <p className="text-[11px] text-slate-500">Fill fields then open Razorpay checkout</p>
                          <div className="grid grid-cols-2 gap-2">
                            {(ep.checkoutFields ?? []).map((field) => (
                              <div key={field}>
                                <label className="text-[10px] text-slate-600 block mb-1">{field}</label>
                                <input
                                  placeholder={field}
                                  value={checkoutValues[ep.id]?.[field] || ""}
                                  onChange={(e) =>
                                    setCheckoutValues((p) => ({
                                      ...p,
                                      [ep.id]: { ...p[ep.id], [field]: e.target.value },
                                    }))
                                  }
                                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 outline-none focus:border-cyan-500/40 transition-colors"
                                />
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => openCheckout(ep)}
                            className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold rounded hover:bg-cyan-500/30 transition-all"
                          >
                            Open Checkout →
                          </button>
                        </div>
                      ) : (
                        <>
                          {/* URL Bar */}
                          <div>
                            <label className="text-[10px] text-slate-600 tracking-widest uppercase block mb-1.5">URL</label>
                            <input
                              value={urlValues[ep.id] || ep.url || ""}
                              onChange={(e) =>
                                setUrlValues((p) => ({ ...p, [ep.id]: e.target.value }))
                              }
                              className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-xs text-slate-300 outline-none focus:border-indigo-500/50 transition-colors font-mono"
                            />
                          </div>

                          {/* Body */}
                          {ep.variants && (
                            <div>
                              <label className="text-[10px] text-slate-600 tracking-widest uppercase block mb-1.5">Type</label>
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
                                className="bg-black/30 border border-white/10 rounded px-3 py-2 text-xs text-slate-300 outline-none focus:border-indigo-500/50 transition-colors font-mono w-full"
                              >
                                {ep.variants.map((v) => (
                                  <option key={v.key} value={v.key}>{v.label}</option>
                                ))}
                              </select>
                            </div>
                          )}
                          {(ep.defaultBody || (ep.method === "POST" && !ep.hideBody)) && (
                            <div>
                              <textarea
                                rows={Object.keys(ep.defaultBody || {}).length + 3}
                                value={bodyValues[ep.id] || ""}
                                onChange={(e) =>
                                  setBodyValues((p) => ({ ...p, [ep.id]: e.target.value }))
                                }
                                className={`w-full bg-black/30 border rounded px-3 py-2 text-xs text-slate-300 outline-none transition-colors font-mono resize-none ${bodyErrors[ep.id] ? "border-red-500/50 focus:border-red-500/70" : "border-white/10 focus:border-indigo-500/50"
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
                              {bodyErrors[ep.id] && (
                                <p className="text-[10px] text-red-400 mt-1">invalid JSON</p>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => sendRequest(ep)}
                              disabled={loading[ep.id] || !credsSaved}
                              title={!credsSaved ? "Save credentials first" : ""}
                              className={`px-5 py-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold rounded hover:bg-indigo-500/30 transition-all disabled:opacity-50 ${loading[ep.id] ? "cursor-wait" : !credsSaved ? "cursor-not-allowed" : ""}`}
                            >
                              {loading[ep.id] ? "sending..." : "Send →"}
                            </button>
                            <button
                              onClick={() => copyCurl(ep)}
                              className="px-3 py-2 bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold rounded hover:bg-white/10 transition-all"
                            >
                              Copy cURL
                            </button>
                            {curlStatus[ep.id] && (
                              <span className={`text-[10px] ${curlStatus[ep.id] === "copied" ? "text-green-400" : "text-red-400"}`}>
                                {curlStatus[ep.id]}
                              </span>
                            )}
                          </div>

                          {/* Response */}
                          {responses[ep.id] && (
                            <div className="mt-2">
                              <div className="flex items-center gap-3 mb-2">
                                <label className="text-[10px] text-slate-600 tracking-widest uppercase">Response</label>
                                {responses[ep.id].isJson === false && (
                                  <>
                                    <button
                                      onClick={() => setResponseViewMode((p) => ({ ...p, [ep.id]: "raw" }))}
                                      className={`text-[10px] transition-colors ${
                                        (responseViewMode[ep.id] || "raw") === "raw"
                                          ? "text-cyan-300"
                                          : "text-slate-600 hover:text-slate-400"
                                      }`}
                                    >
                                      raw
                                    </button>
                                    <button
                                      onClick={() => setResponseViewMode((p) => ({ ...p, [ep.id]: "json" }))}
                                      className={`text-[10px] transition-colors ${
                                        (responseViewMode[ep.id] || "raw") === "json"
                                          ? "text-cyan-300"
                                          : "text-slate-600 hover:text-slate-400"
                                      }`}
                                    >
                                      json wrapper
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => setResponses((p) => ({ ...p, [ep.id]: null }))}
                                  className="ml-auto text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
                                >
                                  ✕ clear
                                </button>
                                <button
                                  onClick={() => navigator.clipboard.writeText(getResponseCopyText(responses[ep.id]))}
                                  className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
                                >
                                  copy
                                </button>
                                {responses[ep.id].status && (
                                  <span className={`text-[10px] font-bold ${STATUS_COLOR(responses[ep.id].status)}`}>
                                    {responses[ep.id].status}
                                  </span>
                                )}
                                {responses[ep.id].error && (
                                  <span className="text-[10px] text-red-400">{responses[ep.id].error}</span>
                                )}
                              </div>
                              {responses[ep.id].contentType && (
                                <p className="text-[10px] text-slate-600 mb-2">
                                  {responses[ep.id].contentType}
                                </p>
                              )}
                              <pre className="bg-black/40 border border-white/5 rounded p-4 text-[11px] text-slate-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                {getResponseDisplayText(ep.id, responses[ep.id])}
                              </pre>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}

        </div>
      </main>

      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setHistoryOpen((p) => !p)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0d0d18]/90 px-4 py-2 text-xs font-semibold text-slate-200 shadow-lg shadow-black/30 backdrop-blur hover:border-indigo-400/40 hover:text-white transition-colors"
        >
          <span>History</span>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">{requestHistory.length}</span>
        </button>

        {historyOpen && (
          <div className="mt-3 w-[min(92vw,56rem)] rounded-2xl border border-white/10 bg-[#0b0b11]/95 shadow-2xl shadow-black/50 backdrop-blur overflow-hidden">
            <div className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
              <div>
                <h2 className="text-xs tracking-widest text-slate-400 uppercase">Session History</h2>
                <p className="text-[10px] text-slate-600">Requests stay in this browser session</p>
              </div>
              <button
                onClick={clearRequestHistory}
                disabled={!requestHistory.length}
                className="ml-auto text-[10px] text-slate-500 hover:text-slate-200 transition-colors disabled:opacity-40"
              >
                clear
              </button>
              <button
                onClick={() => setHistoryOpen(false)}
                className="text-[10px] text-slate-500 hover:text-slate-200 transition-colors"
              >
                close
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-3">
              {requestHistory.length ? (
                <div className="space-y-2">
                  {requestHistory.slice().reverse().map((item) => {
                    const isExpanded = expandedHistoryId === item.id;
                    return (
                      <div key={item.id} className="rounded-xl border border-white/5 bg-[#0d0d18] overflow-hidden">
                        <button
                          onClick={() => toggleHistoryRow(item.id)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                        >
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${METHOD_COLOR[item.method] || "text-slate-300 bg-white/5 border-white/10"}`}>
                            {item.method}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-xs text-slate-200 font-semibold">
                            {item.endpointLabel}
                          </span>
                          {item.variantKey && (
                            <span className="shrink-0 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-300">
                              {item.variantKey}
                            </span>
                          )}
                          <span className={`shrink-0 text-[10px] font-bold ${STATUS_COLOR(item.status)}`}>
                            {item.status ?? "failed"}
                          </span>
                          <span className="shrink-0 text-[10px] text-slate-500">{isExpanded ? "−" : "+"}</span>
                        </button>

                        {isExpanded && (
                          <div className="grid gap-px border-t border-white/5 bg-white/5 md:grid-cols-2">
                            <div className="bg-[#0b0b11] p-4">
                              <div className="mb-3 flex items-center gap-2">
                                <span className="text-[10px] tracking-widest text-slate-500 uppercase">Request</span>
                              </div>
                              <div className="space-y-3 text-xs text-slate-300">
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">URL</p>
                                  <p className="break-all font-mono text-[11px] text-slate-300">{item.url || "-"}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Body</p>
                                  <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg border border-white/5 bg-black/40 p-3 text-[11px] leading-relaxed text-slate-400">
                                    {item.requestBody || "No body"}
                                  </pre>
                                </div>
                              </div>
                            </div>

                            <div className="bg-[#0b0b11] p-4">
                              <div className="mb-3 flex items-center gap-2">
                                <span className="text-[10px] tracking-widest text-slate-500 uppercase">Response</span>
                              </div>
                              <div className="space-y-3 text-xs text-slate-300">
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Status</p>
                                  <p className={`text-[11px] font-bold ${STATUS_COLOR(item.status)}`}>{item.status ?? "failed"}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">Payload</p>
                                  <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-lg border border-white/5 bg-black/40 p-3 text-[11px] leading-relaxed text-slate-400">
                                    {formatHistoryResponse(item.response)}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 bg-[#0d0d18] px-5 py-8 text-sm text-slate-500">
                  No API requests have been recorded in this session yet.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}