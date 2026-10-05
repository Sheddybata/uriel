import { guardAdminRequest } from "@/lib/admin-auth";
import { routerStatus } from "@/lib/mikrotik";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await guardAdminRequest();
  if (denied) return denied;
  const status = await routerStatus();
  return Response.json(status, { headers: { "Cache-Control": "no-store" } });
}
