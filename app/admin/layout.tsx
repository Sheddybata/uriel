import { AdminShell } from "@/components/admin/shell";
import { AdminSignIn } from "@/components/admin/sign-in";
import { hasAdminSession, isLockConfigured } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const unlocked = isLockConfigured() && (await hasAdminSession());
  if (!unlocked) return <AdminSignIn configured={isLockConfigured()} />;
  return <AdminShell>{children}</AdminShell>;
}
