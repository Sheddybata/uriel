"use client";

import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminSignIn({ configured }: { configured: boolean }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (response.ok) {
      window.location.reload();
      return;
    }
    const payload = (await response.json()) as { message?: string };
    setError(payload.message ?? "Sign in failed.");
    setBusy(false);
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-sm">
        <Logo className="h-14" />
        <h1 className="mt-6 text-3xl font-medium tracking-tight">Command Center</h1>
        <p className="mt-2 text-sm text-white/60">
          {configured
            ? "Enter the admin password to see the router."
            : "Add ADMIN_PASSWORD to .env.local, then restart the dev server."}
        </p>

        {configured && (
          <form onSubmit={submit} className="mt-8 space-y-4">
            <Input
              type="password"
              autoFocus
              autoComplete="current-password"
              placeholder="Admin password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              className="border-white/15 bg-white/5 text-white placeholder:text-white/40"
            />
            {error && <p className="text-sm text-red-300">{error}</p>}
            <Button type="submit" disabled={busy || !password} className="h-12 w-full rounded-2xl">
              {busy ? "Checking…" : "Sign in"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
