import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const tones = {
  online: "bg-emerald-400/15 text-emerald-300",
  degraded: "bg-amber-400/15 text-amber-300",
  offline: "bg-red-400/15 text-red-300",
  neutral: "bg-white/10 text-white/80",
  dark: "bg-white/10 text-white",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: ComponentProps<"span"> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
