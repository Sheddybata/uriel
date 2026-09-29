"use client";

import { useCallback, useEffect, useState } from "react";
import type { Subscriber } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

type Payload = {
  connected: boolean;
  message: string;
  subscribers: Subscriber[];
};

export function SubscribersView() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/subscribers", { cache: "no-store" });
    const body = (await response.json()) as Payload;
    setPayload(body);
    setRows(body.subscribers);
  }, []);

  useEffect(() => {
    let cancel = false;
    void (async () => {
      const response = await fetch("/api/admin/subscribers", { cache: "no-store" });
      const body = (await response.json()) as Payload;
      if (cancel) return;
      setPayload(body);
      setRows(body.subscribers);
    })();
    const timer = window.setInterval(() => {
      if (!cancel) void load();
    }, 8000);
    return () => {
      cancel = true;
      window.clearInterval(timer);
    };
  }, [load]);

  async function act(row: Subscriber, action: "kick" | "renew" | "cap") {
    if (!payload?.connected) {
      setNotice(payload?.message || "Connect MikroTik before changing a subscriber.");
      return;
    }
    setNotice("");
    const response = await fetch("/api/admin/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, userId: row.id, activeId: row.activeId, plan: row.plan }),
    });
    const body = (await response.json()) as Payload & { message?: string };
    if (!response.ok) {
      setNotice(body.message || "MikroTik rejected the action.");
      return;
    }
    setRows(body.subscribers);
    setPayload(body);
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.22em] text-white/40">Hotspot</p>
      <h1 className="mt-2 text-4xl font-medium tracking-tight">Subscribers</h1>
      {payload && !payload.connected && (
        <p className="mt-4 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {payload.message}
        </p>
      )}
      {notice && <p className="mt-4 text-sm text-amber-200">{notice}</p>}
      <div className="mt-6 overflow-x-auto rounded-3xl border border-white/10">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="text-[11px] uppercase tracking-wider text-white/40">
            <tr>
              {["Shop Name / No.", "MAC Address", "Plan", "Status", "Expires In", "Actions"].map((heading) => (
                <th key={heading} className="px-4 py-3 font-medium">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-white/40" colSpan={6}>No subscribers on the router.</td>
              </tr>
            ) : rows.map((row) => (
              <tr key={row.id} className="border-t border-white/10">
                <td className="px-4 py-3">{row.shop}</td>
                <td className="px-4 py-3 font-mono text-xs">{row.mac}</td>
                <td className="px-4 py-3">{row.plan}</td>
                <td className="px-4 py-3">
                  <Badge tone={row.status === "Online" ? "online" : row.status === "Capped" ? "degraded" : "offline"}>
                    {row.status} · {row.speed}
                  </Badge>
                </td>
                <td className="px-4 py-3">{row.expires}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button type="button" className="rounded-full border border-white/15 px-3 py-1 text-xs" onClick={() => void act(row, "kick")}>Kick</button>
                    <button type="button" className="rounded-full border border-white/15 px-3 py-1 text-xs" onClick={() => void act(row, "renew")}>Renew</button>
                    <button type="button" className="rounded-full border border-white/15 px-3 py-1 text-xs" onClick={() => void act(row, "cap")}>Cap Speed</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
