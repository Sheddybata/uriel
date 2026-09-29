import type { Metadata } from "next";
import { AdminOverview } from "@/components/admin/overview";

export const metadata: Metadata = { title: "Command Center · Uriel Network" };

export default function AdminPage() {
  return <AdminOverview />;
}
