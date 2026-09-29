import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/uriel.png"
      alt="Uriel Network"
      width={1285}
      height={1213}
      priority
      className={cn("h-14 w-auto", className)}
    />
  );
}
