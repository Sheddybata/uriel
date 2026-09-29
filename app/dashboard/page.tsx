import type { Metadata } from "next";
import { DashboardView } from "@/components/portal/dashboard-view";

export const metadata: Metadata = { title: "Session · Uriel Network" };

export default function DashboardPage() {
  return (
    <main className="min-h-full bg-[#F8FAFC]">
      <DashboardView />
    </main>
  );
}
