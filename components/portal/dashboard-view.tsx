"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { VoucherPurchase } from "@/components/portal/voucher-purchase";

type Session = { code: string; plan: "daily" | "monthly"; startedAt: number; expiresAt: number };

function parts(ms: number) {
  const safe = Math.max(0, ms);
  const days = Math.floor(safe / 86400000);
  const hours = Math.floor((safe % 86400000) / 3600000);
  const minutes = Math.floor((safe % 3600000) / 60000);
  return { days, hours, minutes };
}

export function DashboardView() {
  const [session, setSession] = useState<Session | null>(null);
  const [now, setNow] = useState(Date.now());
  const [buyOpen, setBuyOpen] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("uriel-session");
    if (raw) setSession(JSON.parse(raw) as Session);
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const plan = session?.plan ?? "daily";
  const speed = plan === "monthly" ? "15 Mbps" : "3 Mbps";
  const remaining = parts((session?.expiresAt ?? now + 86400000) - now);
  const elapsed = session ? now - session.startedAt : 0;
  const span = session ? session.expiresAt - session.startedAt : 1;
  const progress = Math.min(100, Math.round((elapsed / span) * 100));
  const uptime = parts(elapsed);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-5 py-8">
      <Logo className="h-20" />
      <h1 className="mt-3 text-4xl font-medium tracking-tight">You are online.</h1>
      <div className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
        <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
        {speed} Speed Active
      </div>

      <section className="mt-8 rounded-3xl border border-zinc-200 bg-white p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Time remaining</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            [remaining.days, "Days"],
            [remaining.hours, "Hours"],
            [remaining.minutes, "Min"],
          ].map(([value, label]) => (
            <div key={String(label)}>
              <div className="text-4xl font-medium tracking-tight">{value}</div>
              <div className="text-xs uppercase tracking-wider text-zinc-500">{label}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-zinc-500">{plan === "monthly" ? "Monthly Unlimited" : "Daily Pass"} · PIN {session?.code ?? "482913"}</p>
      </section>

      <section className="mt-4 rounded-3xl border border-zinc-200 p-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Session uptime</p>
            <p className="mt-1 text-2xl font-medium">Unlimited</p>
          </div>
          <p className="text-sm text-zinc-500">
            {uptime.hours}h {uptime.minutes}m
          </p>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100">
          <div className="h-full rounded-full bg-[#800020]" style={{ width: `${Math.max(progress, 4)}%` }} />
        </div>
      </section>

      {!session && (
        <p className="mt-4 text-sm text-zinc-500">
          No saved session on this browser. <Link className="text-[#800020]" href="/login">Connect with a PIN</Link>.
        </p>
      )}

      <Button className="mt-6 w-full rounded-2xl" onClick={() => setBuyOpen(true)}>
        Recharge voucher
      </Button>
      <VoucherPurchase open={buyOpen} onOpenChange={setBuyOpen} />

      <a
        href="https://wa.me/2348030001122?text=Hello%20Uriel%20Network%20support"
        className="fixed bottom-5 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981] text-white shadow-lg"
        aria-label="WhatsApp agent support"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
}
