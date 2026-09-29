import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-16 w-full rounded-2xl border-2 border-[#111111] bg-white px-4 text-center text-2xl font-semibold tracking-[0.4em] text-[#111111] outline-none transition-colors placeholder:tracking-normal placeholder:text-base placeholder:font-normal placeholder:text-zinc-400 focus:border-[#800020]",
        className,
      )}
      {...props}
    />
  );
}
