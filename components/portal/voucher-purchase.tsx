"use client";

import { useState } from "react";
import { CreditCard, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const plans = [
  { id: "daily", label: "₦700", name: "Daily Pass", detail: "24 hours · 3 Mbps" },
  { id: "monthly", label: "₦8,000", name: "Monthly Unlimited", detail: "Save 60% · 15 Mbps" },
] as const;

export function VoucherPurchase({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [plan, setPlan] = useState<(typeof plans)[number]["id"]>("daily");
  const [handoff, setHandoff] = useState<string | null>(null);
  const selected = plans.find((item) => item.id === plan)!;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buy a voucher</DialogTitle>
          <DialogDescription>Pay once. Your PIN appears on this phone.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {plans.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setPlan(item.id);
                setHandoff(null);
              }}
              className={`rounded-2xl border-2 px-4 py-4 text-left transition-colors ${
                plan === item.id ? "border-[#800020] bg-[#800020]/5" : "border-zinc-200"
              }`}
            >
              <div className="text-lg font-semibold">{item.label}</div>
              <div className="text-sm text-[#111111]">{item.name}</div>
              <div className="text-xs text-zinc-500">{item.detail}</div>
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-2">
          <Button type="button" onClick={() => setHandoff("Paystack")}>
            <CreditCard className="h-4 w-4" /> Paystack · {selected.label}
          </Button>
          <Button type="button" variant="outline" onClick={() => setHandoff("Flutterwave")}>
            <Landmark className="h-4 w-4" /> Flutterwave bank transfer
          </Button>
        </div>
        {handoff && (
          <p className="mt-4 rounded-2xl bg-[#F8FAFC] p-3 text-sm text-zinc-600">
            {handoff} checkout for the {selected.name} is ready. Connect a live {handoff} key to take payment.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
