import type { Metadata } from "next";
import { LoginView } from "@/components/portal/login-view";

export const metadata: Metadata = { title: "Connect · Uriel Network" };

export default function LoginPage() {
  return (
    <main className="min-h-svh bg-white">
      <LoginView />
    </main>
  );
}
