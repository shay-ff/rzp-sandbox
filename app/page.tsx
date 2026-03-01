"use client";

import { useState, useEffect } from "react";
import { endpointGroups, Endpoint, EndpointGroup } from "@/lib/endpoint";

export default function Home() {
  const [keyId, setKeyId] = useState("");
  const [credError, setCredError] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [credsSaved, setCredsSaved] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [urlValues, setUrlValues] = useState<Record<string, string>>({});
  const [bodyValues, setBodyValues] = useState<Record<string, string>>({});
  const [bodyErrors, setBodyErrors] = useState<Record<string, boolean>>({});
  const [checkoutValues, setCheckoutValues] = useState<Record<string, Record<string, string>>>({});
  
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
    const bodies: Record<string, string> = {};
    const urls: Record<string, string> = {};
    endpointGroups.forEach((g) => {
      g.endpoints.forEach((ep) => {
        if (ep.defaultBody) bodies[ep.id] = JSON.stringify(ep.defaultBody, null, 2);
        if (ep.url) urls[ep.id] = ep.url;
        if (ep.checkoutFields) {
          const cv: Record<string, string> = {};
          ep.checkoutFields.forEach((f) => (cv[f] = ""));
          setCheckoutValues((p) => ({ ...p, [ep.id]: cv }));
        }
      });
    });
    setBodyValues(bodies);
    setUrlValues(urls);
  }, []);

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

  const toggleGroup = (group: string) => {
    setOpenGroups((p) => ({ ...p, [group]: !p[group] }));
  };

  const sendRequest = async (ep: Endpoint) => {
    setLoading((p) => ({ ...p, [ep.id]: true }));
    setResponses((p) => ({ ...p, [ep.id]: null }));

    let body = null;
    if (bodyValues[ep.id]) {
      try {
        body = JSON.parse(bodyValues[ep.id]);
      } catch {
        setResponses((p) => ({ ...p, [ep.id]: { error: "Invalid JSON in body" } }));
        setLoading((p) => ({ ...p, [ep.id]: false }));
        return;
      }
    }

    const res = await fetch("/api/rzp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: ep.method, url: urlValues[ep.id] || ep.url, body }),
    });

    const data = await res.json();
    setResponses((p) => ({ ...p, [ep.id]: data }));
    setLoading((p) => ({ ...p, [ep.id]: false }));
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
            type="password"
            placeholder="Key Secret"
            value={keySecret}
            onChange={(e) => setKeySecret(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 outline-none focus:border-indigo-500/50 transition-colors"
          />
          <button
            onClick={saveCredentials}
            className={`w-full py-1.5 rounded text-xs font-semibold tracking-wide transition-all ${credsSaved
              ? "bg-green-500/10 border border-green-500/20 text-green-400"
              : "bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/30"
              }`}
          >
            {credsSaved ? "✓ saved" : "save to session"}
          </button>
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
                          {(ep.defaultBody || ep.method === "POST") && (
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

                          {/* Send Button */}
                          <button
                            onClick={() => sendRequest(ep)}
                            disabled={loading[ep.id] || !credsSaved}
                            title={!credsSaved ? "Save credentials first" : ""}
                            className={`px-5 py-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold rounded hover:bg-indigo-500/30 transition-all disabled:opacity-50 ${loading[ep.id] ? "cursor-wait" : !credsSaved ? "cursor-not-allowed" : ""}`}
                          >
                            {loading[ep.id] ? "sending..." : "Send →"}
                          </button>

                          {/* Response */}
                          {responses[ep.id] && (
                            <div className="mt-2">
                              <div className="flex items-center gap-3 mb-2">
                                <label className="text-[10px] text-slate-600 tracking-widest uppercase">Response</label>
                                <button
                                  onClick={() => setResponses((p) => ({ ...p, [ep.id]: null }))}
                                  className="ml-auto text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
                                >
                                  ✕ clear
                                </button>
                                <button
                                  onClick={() => navigator.clipboard.writeText(JSON.stringify(responses[ep.id].data || responses[ep.id], null, 2))}
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
                              <pre className="bg-black/40 border border-white/5 rounded p-4 text-[11px] text-slate-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                {JSON.stringify(responses[ep.id].data || responses[ep.id], null, 2)}
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
    </div>
  );
}