"use client";

import { useState, useEffect, useCallback } from "react";

export function useCredentials() {
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [credsSaved, setCredsSaved] = useState(false);
  const [credError, setCredError] = useState("");

  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((data) => {
        if (data.keyId) {
          setKeyId(data.keyId);
          setCredsSaved(true);
        }
        if (data.keySecret) setKeySecret(data.keySecret);
      });
  }, []);

  const saveCredentials = useCallback(async () => {
    if (!keyId || !keySecret) return;
    if (!keyId.startsWith("rzp_test_") && !keyId.startsWith("rzp_live_")) {
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
  }, [keyId, keySecret]);

  const clearCredentials = useCallback(async () => {
    await fetch("/api/session", { method: "DELETE" });
    setKeyId("");
    setKeySecret("");
    setCredError("");
    setCredsSaved(false);
    setShowSecret(false);
  }, []);

  return {
    keyId,
    setKeyId,
    keySecret,
    setKeySecret,
    showSecret,
    setShowSecret,
    credsSaved,
    credError,
    saveCredentials,
    clearCredentials,
  };
}
