"use client";

import { useEffect, useState } from "react";

export function RouterStatus() {
  const [label, setLabel] = useState("Checking router");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let cancel = false;
    async function load() {
      try {
        const response = await fetch("/api/admin/status", { cache: "no-store" });
        const body = (await response.json()) as { connected: boolean; label: string };
        if (cancel) return;
        setConnected(body.connected);
        setLabel(body.label);
      } catch {
        if (!cancel) {
          setConnected(false);
          setLabel("Router unreachable");
        }
      }
    }
    void load();
    const timer = window.setInterval(() => void load(), 15000);
    return () => {
      cancel = true;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${
        connected ? "border-emerald-400/30 text-emerald-400" : "border-amber-400/40 text-amber-300"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-[#10B981]" : "bg-amber-300"}`} />
      {label}
    </span>
  );
}
