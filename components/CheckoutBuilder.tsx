"use client";

import { useState, useCallback, useRef } from "react";
import {
  type PaymentMethodConfig,
  type CheckoutOptions,
  PAYMENT_METHODS,
  BANK_ISSUERS,
  CARD_NETWORKS,
  WALLETS,
  PAYLATER_PROVIDERS,
  CURRENCY_PRESETS,
  DEFAULT_CHECKOUT_OPTIONS,
  generateCheckoutCode,
  buildCheckoutOptions,
} from "@/lib/checkoutConfig";
import { CheckoutCodePreview } from "./CheckoutCodePreview";

interface DragState {
  draggedId: string | null;
  draggedOverId: string | null;
}

export function CheckoutBuilder() {
  const [options, setOptions] = useState<CheckoutOptions>(DEFAULT_CHECKOUT_OPTIONS);
  const [methods, setMethods] = useState<PaymentMethodConfig[]>(PAYMENT_METHODS);
  const [dragState, setDragState] = useState<DragState>({ draggedId: null, draggedOverId: null });
  const [showTestModal, setShowTestModal] = useState(false);
  const [testResult, setTestResult] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const updateOption = useCallback(<K extends keyof CheckoutOptions>(
    key: K,
    value: CheckoutOptions[K]
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updatePrefill = useCallback((field: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      prefill: { ...prev.prefill, [field]: value },
    }));
  }, []);

  const updateTheme = useCallback((color: string) => {
    setOptions((prev) => ({
      ...prev,
      theme: { color },
    }));
  }, []);

  const toggleMethod = useCallback((id: string) => {
    setMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  }, []);

  const updateMethodConfig = useCallback((id: string, config: Record<string, any>) => {
    setMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, config: { ...m.config, ...config } } : m))
    );
  }, []);

  const handleDragStart = useCallback((id: string) => {
    setDragState({ draggedId: id, draggedOverId: null });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragState((prev) => ({ ...prev, draggedOverId: id }));
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragState({ draggedId: null, draggedOverId: null });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = dragState.draggedId;
    if (!draggedId || draggedId === targetId) {
      setDragState({ draggedId: null, draggedOverId: null });
      return;
    }

    setMethods((prev) => {
      const draggedIndex = prev.findIndex((m) => m.id === draggedId);
      const targetIndex = prev.findIndex((m) => m.id === targetId);
      if (draggedIndex === -1 || targetIndex === -1) return prev;

      const newMethods = [...prev];
      const [removed] = newMethods.splice(draggedIndex, 1);
      newMethods.splice(targetIndex, 0, removed);

      return newMethods.map((m, i) => ({ ...m, order: i + 1 }));
    });

    setDragState({ draggedId: null, draggedOverId: null });
  }, [dragState.draggedId]);

  const toggleIssuer = useCallback((methodId: string, issuerCode: string, issuerList: string) => {
    const current = methods.find((m) => m.id === methodId)?.config[issuerList] || [];
    const exists = current.includes(issuerCode);
    const updated = exists ? current.filter((c: string) => c !== issuerCode) : [...current, issuerCode];
    updateMethodConfig(methodId, { [issuerList]: updated });
  }, [methods, updateMethodConfig]);

  const toggleWallet = useCallback((walletCode: string) => {
    const current = methods.find((m) => m.id === "wallet")?.config.wallets || [];
    const exists = current.includes(walletCode);
    const updated = exists ? current.filter((c: string) => c !== walletCode) : [...current, walletCode];
    updateMethodConfig("wallet", { wallets: updated });
  }, [methods, updateMethodConfig]);

  const togglePaylaterProvider = useCallback((provider: string) => {
    const current = methods.find((m) => m.id === "paylater")?.config.providers || [];
    const exists = current.includes(provider);
    const updated = exists ? current.filter((c: string) => c !== provider) : [...current, provider];
    updateMethodConfig("paylater", { providers: updated });
  }, [methods, updateMethodConfig]);

  const generatedOptions = buildCheckoutOptions(options, methods);
  const code = generateCheckoutCode(generatedOptions);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const testCheckout = () => {
    if (!options.key) {
      setTestResult("Error: Key is required to test checkout.");
      setShowTestModal(true);
      return;
    }
    try {
      const rzp = new (window as any).Razorpay({
        ...generatedOptions,
        modal: {
          ...generatedOptions.modal,
          // Razorpay expects a function here; the builder only stores a boolean toggle.
          ondismiss: generatedOptions.modal?.ondismiss
            ? function () {
                console.log("Checkout form closed by user");
              }
            : undefined,
        },
        handler: function (response: any) {
          // Razorpay auto-closes on success, but close explicitly so the
          // overlay/iframe never lingers behind our own result modal.
          rzp.close();
          setTestResult(
            `Payment Success!\nPayment ID: ${response.razorpay_payment_id}\nOrder ID: ${response.razorpay_order_id}\nSignature: ${response.razorpay_signature}`
          );
          setShowTestModal(true);
        },
      });
      rzp.on("payment.failed", function (response: any) {
        // Razorpay keeps its modal open after a failure (to allow retry) —
        // close it first, otherwise its overlay stays stuck behind ours
        // and the page becomes unscrollable once our modal is dismissed.
        rzp.close();
        setTestResult(
          `Payment Failed!\nError: ${response.error.description}\nCode: ${response.error.code}`
        );
        setShowTestModal(true);
      });
      rzp.open();
    } catch (err: any) {
      setTestResult(`Error: ${err.message || "Failed to initialize checkout"}`);
      setShowTestModal(true);
    }
  };

  const enabledMethods = methods.filter((m) => m.enabled).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8">
      {/* Basic Fields */}
      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="text-xs font-semibold text-text-high tracking-widest uppercase mb-4">
          Checkout Configuration
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-text-medium tracking-widest uppercase block mb-1.5">
              Key ID
            </label>
            <input
              value={options.key}
              onChange={(e) => updateOption("key", e.target.value)}
              placeholder="rzp_test_... or rzp_live_..."
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-xs text-text-high placeholder-text-low outline-none focus:border-primary transition-colors font-mono"
            />
            <p className="text-[10px] text-text-low mt-1">No credentials required. Just paste your key.</p>
          </div>
          <div>
            <label className="text-[10px] text-text-medium tracking-widest uppercase block mb-1.5">
              Order ID
            </label>
            <input
              value={options.order_id || ""}
              onChange={(e) => updateOption("order_id", e.target.value)}
              placeholder="order_... (optional)"
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-xs text-text-high placeholder-text-low outline-none focus:border-primary transition-colors font-mono"
            />
            <p className="text-[10px] text-text-low mt-1">Optional. Checkout can run without an order_id (amount-only mode).</p>
          </div>
          <div>
            <label className="text-[10px] text-text-medium tracking-widest uppercase block mb-1.5">
              Amount (in paise)
            </label>
            <input
              type="number"
              value={options.amount}
              onChange={(e) => updateOption("amount", Number(e.target.value))}
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-xs text-text-high placeholder-text-low outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] text-text-medium tracking-widest uppercase block mb-1.5">
              Currency
            </label>
            <select
              value={CURRENCY_PRESETS.includes(options.currency) ? options.currency : "custom"}
              onChange={(e) => {
                if (e.target.value === "custom") {
                  updateOption("currency", "");
                } else {
                  updateOption("currency", e.target.value);
                }
              }}
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-xs text-text-high outline-none focus:border-primary transition-colors"
            >
              {CURRENCY_PRESETS.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
              <option value="custom">Custom...</option>
            </select>
            {!CURRENCY_PRESETS.includes(options.currency) && (
              <input
                value={options.currency}
                onChange={(e) => updateOption("currency", e.target.value.toUpperCase())}
                placeholder="e.g. SGD, AED, MYR"
                maxLength={3}
                className="mt-2 w-full bg-bg border border-border rounded-md px-3 py-2 text-xs text-text-high placeholder-text-low outline-none focus:border-primary transition-colors font-mono uppercase"
              />
            )}
          </div>
          <div>
            <label className="text-[10px] text-text-medium tracking-widest uppercase block mb-1.5">
              Business Name
            </label>
            <input
              value={options.name}
              onChange={(e) => updateOption("name", e.target.value)}
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-xs text-text-high placeholder-text-low outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] text-text-medium tracking-widest uppercase block mb-1.5">
              Description
            </label>
            <input
              value={options.description}
              onChange={(e) => updateOption("description", e.target.value)}
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-xs text-text-high placeholder-text-low outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] text-text-medium tracking-widest uppercase block mb-1.5">
              Customer Name
            </label>
            <input
              value={options.prefill.name}
              onChange={(e) => updatePrefill("name", e.target.value)}
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-xs text-text-high placeholder-text-low outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] text-text-medium tracking-widest uppercase block mb-1.5">
              Customer Email
            </label>
            <input
              type="email"
              value={options.prefill.email}
              onChange={(e) => updatePrefill("email", e.target.value)}
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-xs text-text-high placeholder-text-low outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] text-text-medium tracking-widest uppercase block mb-1.5">
              Customer Phone
            </label>
            <input
              value={options.prefill.contact}
              onChange={(e) => updatePrefill("contact", e.target.value)}
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-xs text-text-high placeholder-text-low outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] text-text-medium tracking-widest uppercase block mb-1.5">
              Theme Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={options.theme.color}
                onChange={(e) => updateTheme(e.target.value)}
                className="h-8 w-8 rounded border border-border cursor-pointer bg-transparent"
              />
              <input
                value={options.theme.color}
                onChange={(e) => updateTheme(e.target.value)}
                className="flex-1 bg-bg border border-border rounded-md px-3 py-2 text-xs text-text-high font-mono outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Payment Methods - Draggable */}
      <section className="rounded-lg border border-border bg-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-text-high tracking-widest uppercase">
            Payment Methods
          </h2>
          <span className="text-[10px] text-text-low">Drag to reorder</span>
        </div>

        <div className="space-y-2">
          {enabledMethods.map((method) => {
            const isDragged = dragState.draggedId === method.id;
            const isDraggedOver = dragState.draggedOverId === method.id;
            const methodFull = methods.find((m) => m.id === method.id)!;

            return (
              <div
                key={method.id}
                draggable
                onDragStart={() => handleDragStart(method.id)}
                onDragOver={(e) => handleDragOver(e, method.id)}
                onDrop={(e) => handleDrop(e, method.id)}
                onDragEnd={handleDragEnd}
                className={`rounded-md border transition-all cursor-move ${
                  isDragged
                    ? "border-primary opacity-50"
                    : isDraggedOver
                    ? "border-primary bg-primary-bg"
                    : "border-border bg-bg"
                }`}
              >
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="text-text-low cursor-grab active:cursor-grabbing">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                      <circle cx="2" cy="3" r="1.5" />
                      <circle cx="7" cy="3" r="1.5" />
                      <circle cx="12" cy="3" r="1.5" />
                      <circle cx="2" cy="7" r="1.5" />
                      <circle cx="7" cy="7" r="1.5" />
                      <circle cx="12" cy="7" r="1.5" />
                      <circle cx="2" cy="11" r="1.5" />
                      <circle cx="7" cy="11" r="1.5" />
                      <circle cx="12" cy="11" r="1.5" />
                    </svg>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={methodFull.enabled}
                      onChange={() => toggleMethod(method.id)}
                      className="accent-primary rounded"
                    />
                    <span className="text-xs font-medium text-text-high">{method.label}</span>
                  </label>
                  <span className="text-[10px] text-text-low ml-auto">Order #{method.order}</span>
                </div>

                {methodFull.enabled && (
                  <div className="border-t border-border px-4 py-3">
                    {/* Cards - Credit / Debit split, each with issuer / network / IIN filters */}
                    {method.id === "card" && (
                      <div className="space-y-4">
                        {(["credit", "debit"] as const).map((cardType) => {
                          const enabledKey = cardType === "credit" ? "creditEnabled" : "debitEnabled";
                          const issuersKey = cardType === "credit" ? "creditIssuers" : "debitIssuers";
                          const networksKey = cardType === "credit" ? "creditNetworks" : "debitNetworks";
                          const typeEnabled = methodFull.config[enabledKey] !== false;
                          return (
                            <div key={cardType} className="space-y-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={typeEnabled}
                                  onChange={() =>
                                    updateMethodConfig("card", { [enabledKey]: !typeEnabled })
                                  }
                                  className="accent-primary rounded"
                                />
                                <span className="text-[10px] text-text-medium uppercase tracking-wider">
                                  {cardType === "credit" ? "Credit Cards" : "Debit Cards"}
                                </span>
                              </label>
                              {typeEnabled && (
                                <div className="pl-6 space-y-3">
                                  <div className="space-y-1.5">
                                    <p className="text-[10px] text-text-low">
                                      Issuing banks. Leave empty to allow all.
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {BANK_ISSUERS.map((issuer) => {
                                        const selected =
                                          methodFull.config[issuersKey]?.includes(issuer.code) || false;
                                        return (
                                          <button
                                            key={issuer.code}
                                            onClick={() => toggleIssuer("card", issuer.code, issuersKey)}
                                            className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all border ${
                                              selected
                                                ? "border-primary bg-primary-bg text-primary"
                                                : "border-border bg-surface text-text-medium hover:border-primary/40"
                                            }`}
                                          >
                                            {issuer.name}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                  <div className="space-y-1.5">
                                    <p className="text-[10px] text-text-low">
                                      Card networks. Leave empty to allow all.
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {CARD_NETWORKS.map((network) => {
                                        const selected =
                                          methodFull.config[networksKey]?.includes(network.code) || false;
                                        return (
                                          <button
                                            key={network.code}
                                            onClick={() => toggleIssuer("card", network.code, networksKey)}
                                            className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all border ${
                                              selected
                                                ? "border-primary bg-primary-bg text-primary"
                                                : "border-border bg-surface text-text-medium hover:border-primary/40"
                                            }`}
                                          >
                                            {network.name}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Net Banking - Bank issuers */}
                    {method.id === "netbanking" && (
                      <div className="space-y-2">
                        <p className="text-[10px] text-text-medium uppercase tracking-wider">
                          Preferred Banks
                        </p>
                        <p className="text-[10px] text-text-low">
                          Select banks to show at the top. Leave empty for default list.
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {BANK_ISSUERS.map((bank) => {
                            const selected = methodFull.config.banks?.includes(bank.code) || false;
                            return (
                              <button
                                key={bank.code}
                                onClick={() => toggleIssuer("netbanking", bank.code, "banks")}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all border ${
                                  selected
                                    ? "border-primary bg-primary-bg text-primary"
                                    : "border-border bg-surface text-text-medium hover:border-primary/40"
                                }`}
                              >
                                {bank.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* UPI - Intent only, no Collect flow */}
                    {method.id === "upi" && (
                      <div className="space-y-2">
                        <p className="text-[10px] text-text-medium uppercase tracking-wider">
                          UPI Configuration
                        </p>
                        <p className="text-[10px] text-text-low">
                          Intent flow only — the customer picks their UPI app directly. Collect
                          (VPA entry) is disabled.
                        </p>
                      </div>
                    )}

                    {/* Wallets */}
                    {method.id === "wallet" && (
                      <div className="space-y-2">
                        <p className="text-[10px] text-text-medium uppercase tracking-wider">
                          Allowed Wallets
                        </p>
                        <p className="text-[10px] text-text-low">
                          Select wallets to display. Leave empty to show all.
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {WALLETS.map((wallet) => {
                            const selected = methodFull.config.wallets?.includes(wallet.code) || false;
                            return (
                              <button
                                key={wallet.code}
                                onClick={() => toggleWallet(wallet.code)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all border ${
                                  selected
                                    ? "border-primary bg-primary-bg text-primary"
                                    : "border-border bg-surface text-text-medium hover:border-primary/40"
                                }`}
                              >
                                {wallet.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* EMI */}
                    {method.id === "emi" && (
                      <div className="space-y-2">
                        <p className="text-[10px] text-text-medium uppercase tracking-wider">
                          EMI Banks
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {BANK_ISSUERS.map((bank) => {
                            const selected = methodFull.config.issuers?.includes(bank.code) || false;
                            return (
                              <button
                                key={bank.code}
                                onClick={() => toggleIssuer("emi", bank.code, "issuers")}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all border ${
                                  selected
                                    ? "border-primary bg-primary-bg text-primary"
                                    : "border-border bg-surface text-text-medium hover:border-primary/40"
                                }`}
                              >
                                {bank.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Pay Later */}
                    {method.id === "paylater" && (
                      <div className="space-y-2">
                        <p className="text-[10px] text-text-medium uppercase tracking-wider">
                          Pay Later Providers
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {PAYLATER_PROVIDERS.map((provider) => {
                            const selected = methodFull.config.providers?.includes(provider.code) || false;
                            return (
                              <button
                                key={provider.code}
                                onClick={() => togglePaylaterProvider(provider.code)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-all border ${
                                  selected
                                    ? "border-primary bg-primary-bg text-primary"
                                    : "border-border bg-surface text-text-medium hover:border-primary/40"
                                }`}
                              >
                                {provider.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Disabled methods */}
        <div className="mt-3 space-y-2">
          {methods
            .filter((m) => !m.enabled)
            .map((method) => (
              <div
                key={method.id}
                className="rounded-md border border-border bg-bg opacity-60"
              >
                <div className="px-4 py-2.5 flex items-center gap-3">
                  <div className="text-text-low opacity-40">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                      <circle cx="2" cy="3" r="1.5" />
                      <circle cx="7" cy="3" r="1.5" />
                      <circle cx="12" cy="3" r="1.5" />
                      <circle cx="2" cy="7" r="1.5" />
                      <circle cx="7" cy="7" r="1.5" />
                      <circle cx="12" cy="7" r="1.5" />
                      <circle cx="2" cy="11" r="1.5" />
                      <circle cx="7" cy="11" r="1.5" />
                      <circle cx="12" cy="11" r="1.5" />
                    </svg>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => toggleMethod(method.id)}
                      className="accent-primary rounded"
                    />
                    <span className="text-xs text-text-medium">{method.label}</span>
                  </label>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* Generated Code */}
      <CheckoutCodePreview code={code} onCopy={copyCode} copied={copied} />

      {/* Test Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={testCheckout}
          className="px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary-hover transition-all"
        >
          Test Live Checkout
        </button>
        <p className="text-[10px] text-text-low">
          Requires a valid key. Order ID is optional — this will open the actual Razorpay checkout.
        </p>
      </div>

      {/* Test Result Modal */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-lg w-full rounded-xl border border-border bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-high">
                {testResult.startsWith("Payment Success") ? "Success" : testResult.startsWith("Payment Failed") ? "Failed" : "Info"}
              </h3>
              <button
                onClick={() => setShowTestModal(false)}
                className="text-text-low hover:text-text-high transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                </svg>
              </button>
            </div>
            <pre className="bg-bg border border-border rounded-md p-4 text-xs text-text-medium whitespace-pre-wrap font-mono leading-relaxed">
              {testResult}
            </pre>
            <button
              onClick={() => setShowTestModal(false)}
              className="mt-4 w-full py-2 bg-primary-bg border border-primary/30 text-primary text-xs font-semibold rounded-md hover:bg-primary/20 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
