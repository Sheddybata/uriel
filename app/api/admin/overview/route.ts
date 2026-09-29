import { getOverview } from "@/lib/mikrotik";

export const dynamic = "force-dynamic";

export async function GET() {
  const overview = await getOverview();
  return Response.json(overview, { headers: { "Cache-Control": "no-store" } });
}
