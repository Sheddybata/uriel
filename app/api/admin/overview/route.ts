import { guardAdminRequest } from "@/lib/admin-auth";
import { getOverview } from "@/lib/mikrotik";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await guardAdminRequest();
  if (denied) return denied;
  const overview = await getOverview();
  return Response.json(overview, { headers: { "Cache-Control": "no-store" } });
}
