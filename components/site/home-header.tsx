"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";

const links = [
  { href: "/login", label: "Portal" },
  { href: "/#plans", label: "Plans" },
  { href: "/#coverage", label: "Coverage" },
];

export function HomeHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="flex items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" className="inline-flex shrink-0" aria-label="Uriel Network">
          <Logo className="h-16 md:h-12" />
        </Link>
        <nav className="hidden items-center gap-8 text-base text-white/80 md:flex">
          {links.map((link) => (
            <Link key={link.label} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black">
            Connect
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white md:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="mx-6 mt-1 flex flex-col rounded-3xl border border-white/15 bg-black/85 px-2 py-2 backdrop-blur md:hidden">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-2xl px-4 py-4 text-lg text-white"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
