"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Voucher, VoucherStatus } from "@/lib/data";
import { formatNaira } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const filters: ("All" | VoucherStatus)[] = ["All", "Active", "Unused", "Expired"];

type InterfaceRow = { name: string; running: boolean; type: string };

type Overview = {
  connected: boolean;
  message: string;
  activeSubscribers: number | null;
  capacity: number | null;
  downMbps: number | null;
  upMbps: number | null;
  wanInterface: string;
  trafficMessage: string;
  uptime: string;
  interfaces: InterfaceRow[];
  vouchers: Voucher[];
};

function tone(status: string) {
  if (status === "online" || status === "Active") return "online" as const;
  if (status === "degraded" || status === "Unused") return "degraded" as const;
  if (status === "offline" || status === "Expired") return "offline" as const;
  return "neutral" as const;
}

export function AdminOverview() {
  const [data, setData] = useState<Overview | null>(null);
  const [rows, setRows] = useState<Voucher[]>([]);
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(10);
  const [duration, setDuration] = useState("24 hours");
  const [price, setPrice] = useState(700);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/overview", { cache: "no-store" });
    const body = (await response.json()) as Overview;
    setData(body);
    setRows((current) => (body.connected || current.length === 0 ? body.vouchers : current));
  }, []);

  useEffect(() => {
    let cancel = false;
    void (async () => {
      const response = await fetch("/api/admin/overview", { cache: "no-store" });
      const body = (await response.json()) as Overview;
      if (cancel) return;
      setData(body);
      setRows(body.vouchers);
    })();
    const timer = window.setInterval(() => {
      if (!cancel) void load();
    }, 8000);
    return () => {
      cancel = true;
      window.clearInterval(timer);
    };
  }, [load]);

  const visible = useMemo(
    () => rows.filter((row) => filter === "All" || row.status === filter),
    [rows, filter],
  );

  async function generate() {
    if (!data?.connected) {
      setNotice(data?.message || "Connect MikroTik before creating vouchers.");
      setOpen(false);
      return;
    }

    setBusy(true);
    setNotice("");
    const response = await fetch("/api/admin/vouchers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity, duration, price }),
    });
    const body = (await response.json()) as { message?: string; vouchers?: Voucher[] };
    setBusy(false);
    if (!response.ok) {
      setNotice(body.message || "MikroTik did not create the vouchers.");
      return;
    }
    if (body.vouchers) setRows(body.vouchers);
    setFilter("Unused");
    setOpen(false);
  }

  function downloadCsv() {
    const header = "code,plan,price,status,shop,expires";
    const body = visible.map((row) => [row.code, row.plan, row.price, row.status, row.shop, row.expires].join(",")).join("\n");
    const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "uriel-vouchers.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function printThermal() {
    const cards = visible
      .map(
        (row) =>
          `<div style="border:1px dashed #111;padding:8px;margin:0 0 8px;font-family:monospace"><strong>URIEL NETWORK</strong><br/>PIN ${row.code}<br/>${row.plan} · ₦${row.price}</div>`,
      )
      .join("");
    const popup = window.open("", "print", "width=420,height=700");
    if (!popup) return;
    popup.document.write(
      `<html><head><title>Uriel vouchers</title><style>@page{size:80mm auto;margin:4mm}body{margin:0}</style></head><body>${cards}<script>print()<\/script></body></html>`,
    );
    popup.document.close();
  }

  const liveData = data?.connected ? data : null;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-white/40">Hotspot</p>
        <h1 className="mt-2 text-4xl font-medium tracking-tight md:text-5xl">Network overview</h1>
      </div>

      {data && !data.connected && (
        <p className="rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {data.message}
        </p>
      )}
      {notice && <p className="text-sm text-amber-200">{notice}</p>}

      <section className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Active subscribers", liveData ? `${liveData.activeSubscribers} / ${liveData.capacity}` : "—", "Hotspot sessions"],
          ["Network throughput", liveData && liveData.downMbps !== null ? `${liveData.downMbps} Mbps` : "—", liveData?.trafficMessage || (liveData && liveData.upMbps !== null ? `${liveData.upMbps} Mbps up · ${liveData.wanInterface}` : "WAN interface")],
          ["Router uptime", liveData?.uptime || "—", "RouterOS"],
          ["Interfaces up", liveData ? `${liveData.interfaces.filter((item) => item.running).length} / ${liveData.interfaces.length}` : "—", "Running on the router"],
        ].map(([label, value, detail]) => (
          <article key={label} className="bg-black p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">{label}</p>
            <p className="mt-3 text-3xl font-medium tracking-tight">{value}</p>
            <p className="mt-2 text-sm text-white/50">{detail}</p>
          </article>
        ))}
      </section>

      <section id="nodes" className="rounded-3xl border border-white/10 p-5">
        <h2 className="text-lg font-medium">Interfaces</h2>
        <p className="mt-1 text-sm text-white/50">Ports reported by the router.</p>
        {data?.interfaces.length ? (
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {data.interfaces.map((item) => (
              <div key={item.name} className="rounded-2xl border border-white/10 p-4">
                <Badge tone={item.running ? "online" : "offline"}>{item.running ? "running" : "down"}</Badge>
                <p className="mt-3 font-medium">{item.name}</p>
                <p className="text-sm text-white/50">{item.type}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-white/40">No interfaces yet.</p>
        )}
      </section>

      <section id="vouchers" className="rounded-3xl border border-white/10 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-medium">Vouchers</h2>
            <p className="text-sm text-white/50">Hotspot users. The PIN is the username and the password.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="dark" onClick={downloadCsv}>Download CSV</Button>
            <Button size="sm" variant="dark" onClick={printThermal}>Print thermal grid</Button>
            <Button size="sm" onClick={() => setOpen(true)}>Generate Bulk Vouchers</Button>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-full px-3 py-1 text-xs ${filter === item ? "bg-white text-black" : "text-white/60"}`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-white/40">
              <tr>
                <th className="py-2 font-medium">Code</th>
                <th className="font-medium">Plan</th>
                <th className="font-medium">Price</th>
                <th className="font-medium">Status</th>
                <th className="font-medium">Shop</th>
                <th className="font-medium">Expires</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr className="border-t border-white/10">
                  <td className="py-6 text-white/40" colSpan={6}>No vouchers on the router.</td>
                </tr>
              ) : visible.map((row) => (
                <tr key={row.code} className="border-t border-white/10">
                  <td className="py-3 font-mono tracking-widest">{row.code}</td>
                  <td>{row.plan}</td>
                  <td>{row.price ? formatNaira(row.price) : "—"}</td>
                  <td><Badge tone={tone(row.status)}>{row.status}</Badge></td>
                  <td>{row.shop}</td>
                  <td>{row.expires}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate bulk vouchers</DialogTitle>
            <DialogDescription>Each PIN is created as a MikroTik Hotspot user and can be printed at 80mm.</DialogDescription>
          </DialogHeader>
          <label className="block text-sm">
            Quantity
            <input className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3" type="number" min={1} max={200} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
          </label>
          <label className="mt-3 block text-sm">
            Duration
            <select className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3" value={duration} onChange={(event) => setDuration(event.target.value)}>
              <option>24 hours</option>
              <option>7 days</option>
              <option>30 days</option>
            </select>
          </label>
          <label className="mt-3 block text-sm">
            Price (₦)
            <input className="mt-1 h-11 w-full rounded-xl border border-zinc-200 px-3" type="number" min={0} value={price} onChange={(event) => setPrice(Number(event.target.value))} />
          </label>
          <Button className="mt-4 w-full" disabled={busy} onClick={() => void generate()}>
            {busy ? "Creating Hotspot users…" : "Generate and queue print"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
