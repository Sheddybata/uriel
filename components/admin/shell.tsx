"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Radio, Ticket, Users } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { RouterStatus } from "@/components/admin/router-status";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin#nodes", label: "Interfaces", icon: Radio },
  { href: "/admin#vouchers", label: "Vouchers", icon: Ticket },
  { href: "/admin/subscribers", label: "Shops", icon: Users },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-full bg-black text-white">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-white/10 md:flex md:flex-col">
        <Link href="/admin" className="px-6 py-7">
          <Logo className="h-16" />
          <p className="mt-3 text-sm text-white/60">Command Center</p>
        </Link>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {links.map((link) => {
            const active = link.href === pathname || (link.href === "/admin" && pathname === "/admin");
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm text-white/70 hover:bg-white/5",
                  active && "bg-white text-black",
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <p className="px-6 py-6 text-xs text-white/40">MikroTik hotspot</p>
      </aside>

      <div className="md:pl-60">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <Logo className="h-10 md:hidden" />
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">Live feed</p>
              <p className="text-sm">MikroTik hotspot</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RouterStatus />
            <button
              type="button"
              aria-label="Sign out"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 hover:bg-white/5"
              onClick={async () => {
                await fetch("/api/admin/session", { method: "DELETE" });
                window.location.reload();
              }}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>
        <main className="px-5 py-6 pb-24 md:px-8 md:pb-10">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-white/10 bg-black md:hidden">
        {links.map((link) => {
          const Icon = link.icon;
          const active = link.href === "/admin/subscribers" ? pathname.startsWith("/admin/subscribers") : pathname === "/admin" && link.href === "/admin";
          return (
            <Link key={link.label} href={link.href} className={cn("flex flex-col items-center gap-1 py-3 text-[11px] text-white/50", active && "text-white")}>
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
