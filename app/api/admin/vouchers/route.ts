import { guardAdminRequest } from "@/lib/admin-auth";
import { createVouchers, getOverview, isConfigured } from "@/lib/mikrotik";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = await guardAdminRequest();
  if (denied) return denied;
  if (!isConfigured()) {
    return Response.json(
      { connected: false, message: "MikroTik is not configured. Vouchers were kept in this browser only." },
      { status: 409 },
    );
  }
  const body = (await request.json()) as { quantity?: number; duration?: string; price?: number };
  try {
    const codes = await createVouchers(Number(body.quantity) || 1, body.duration || "24 hours", Number(body.price) || 0);
    const overview = await getOverview();
    return Response.json({ connected: true, codes, vouchers: overview.vouchers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create Hotspot users";
    return Response.json({ connected: true, message }, { status: 502 });
  }
}
