import { routerStatus } from "@/lib/mikrotik";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await routerStatus();
  return Response.json(status, { headers: { "Cache-Control": "no-store" } });
}
