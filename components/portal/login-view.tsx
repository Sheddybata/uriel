"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, MessageCircle } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { VoucherPurchase } from "@/components/portal/voucher-purchase";

const DEVICE_KEY = "uriel-device";

export function LoginView() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [scanNote, setScanNote] = useState("");
  const [buyOpen, setBuyOpen] = useState(false);
  const [remembered, setRemembered] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(DEVICE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as { code: string; until: number };
    if (saved.until > Date.now()) {
      setRemembered(true);
      setCode(saved.code);
      const timer = window.setTimeout(() => router.push("/dashboard"), 1200);
      return () => window.clearTimeout(timer);
    }
    localStorage.removeItem(DEVICE_KEY);
  }, [router]);

  function connect(event: React.FormEvent) {
    event.preventDefault();
    const pin = code.replace(/\s/g, "");
    if (!/^\d{6}$/.test(pin)) {
      setError("Enter the 6-digit PIN printed on your voucher.");
      return;
    }
    const plan = pin.startsWith("8") ? "monthly" : "daily";
    const now = Date.now();
    const span = plan === "monthly" ? 30 * 86400000 : 86400000;
    sessionStorage.setItem(
      "uriel-session",
      JSON.stringify({ code: pin, plan, startedAt: now, expiresAt: now + span }),
    );
    if (remember) {
      localStorage.setItem(DEVICE_KEY, JSON.stringify({ code: pin, until: now + 30 * 86400000 }));
    }
    router.push("/dashboard");
  }

  async function onScan(file: File) {
    setScanNote("Reading voucher…");
    const Detector = (window as Window & { BarcodeDetector?: new (opts: { formats: string[] }) => { detect: (source: ImageBitmap) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
    if (Detector) {
      const bitmap = await createImageBitmap(file);
      const codes = await new Detector({ formats: ["qr_code"] }).detect(bitmap);
      const raw = codes[0]?.rawValue?.replace(/\D/g, "").slice(0, 6);
      if (raw && raw.length === 6) {
        setCode(raw);
        setScanNote("Voucher captured.");
        setError("");
        return;
      }
    }
    setCode("482913");
    setScanNote("Sample voucher loaded. Point the camera at a PIN QR when you are on the market Wi-Fi.");
    setError("");
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-5 py-8">
      <header>
        <div className="flex justify-center">
          <Logo className="h-24" />
        </div>
        <h1 className="mt-3 text-4xl font-medium tracking-tight text-[#111111]">Data without limits.</h1>
        <p className="mt-2 text-sm text-zinc-500">One voucher. One PIN. Instant connection over the local Starlink satellite.</p>
      </header>

      <form onSubmit={connect} className="mt-8 space-y-4">
        <label className="block text-xs font-medium uppercase tracking-[0.18em] text-zinc-500" htmlFor="pin">
          Voucher PIN
        </label>
        <Input
          id="pin"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="6-digit PIN"
          value={code}
          onChange={(event) => {
            setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
            setError("");
          }}
        />
        {error && <p className="text-sm text-[#800020]">{error}</p>}
        {scanNote && <p className="text-sm text-zinc-500">{scanNote}</p>}
        {remembered && <p className="text-sm text-emerald-700">This device is remembered. Signing you in.</p>}

        <Button type="button" variant="outline" className="w-full rounded-2xl" onClick={() => fileRef.current?.click()}>
          <Camera className="h-4 w-4" /> Scan Voucher QR Code
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void onScan(file);
          }}
        />

        <label className="flex items-start gap-3 text-sm text-[#111111]">
          <Checkbox checked={remember} onCheckedChange={(value) => setRemember(value === true)} />
          <span>Remember my device for 30 days of automatic login.</span>
        </label>

        <Button type="submit" className="h-14 w-full rounded-2xl text-base tracking-[0.16em]">
          CONNECT NOW
        </Button>
        <button type="button" className="w-full text-sm text-[#800020]" onClick={() => setBuyOpen(true)}>
          Need a voucher? Buy Daily ₦700 or Monthly ₦8,000
        </button>
      </form>

      <VoucherPurchase open={buyOpen} onOpenChange={setBuyOpen} />

      <a
        href="https://wa.me/2348030001122?text=Hello%20Uriel%20Network%2C%20I%20need%20help%20at%20Terminus%20Market"
        className="fixed bottom-5 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981] text-white shadow-lg"
        aria-label="WhatsApp agent support"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
}
