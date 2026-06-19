"use client";

import { useState, useEffect, useCallback } from "react";
import type { RequestHistoryEntry } from "@/lib/history";

export function useHistory() {
  const [requestHistory, setRequestHistory] = useState<RequestHistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    fetch("/api/session/history")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.history)) setRequestHistory(data.history);
      });
  }, []);

  const saveRequestHistory = useCallback(async (entry: RequestHistoryEntry) => {
    const response = await fetch("/api/session/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    if (!response.ok) return;
    const data = await response.json();
    if (Array.isArray(data.history)) setRequestHistory(data.history);
  }, []);

  const clearRequestHistory = useCallback(async () => {
    await fetch("/api/session/history", { method: "DELETE" });
    setRequestHistory([]);
  }, []);

  return {
    requestHistory,
    setRequestHistory,
    historyOpen,
    setHistoryOpen,
    saveRequestHistory,
    clearRequestHistory,
  };
}
