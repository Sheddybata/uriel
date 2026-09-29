import type { Metadata } from "next";
import { SubscribersView } from "@/components/admin/subscribers-view";

export const metadata: Metadata = { title: "Subscribers · Uriel Network" };

export default function SubscribersPage() {
  return <SubscribersView />;
}
