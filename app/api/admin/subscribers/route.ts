import { guardAdminRequest } from "@/lib/admin-auth";
import { applySubscriberAction, getSubscribers, isConfigured } from "@/lib/mikrotik";
import type { Plan } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await guardAdminRequest();
  if (denied) return denied;
  const payload = await getSubscribers();
  return Response.json(payload, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const denied = await guardAdminRequest();
  if (denied) return denied;
  if (!isConfigured()) {
    return Response.json({ connected: false, message: "MikroTik is not configured." }, { status: 409 });
  }
  const body = (await request.json()) as {
    action?: "kick" | "renew" | "cap";
    userId?: string;
    activeId?: string;
    plan?: Plan;
  };
  if (!body.action || !body.userId || (body.plan !== "Daily" && body.plan !== "Monthly")) {
    return Response.json({ message: "Missing subscriber action." }, { status: 400 });
  }
  try {
    await applySubscriberAction({
      action: body.action,
      userId: body.userId,
      activeId: body.activeId,
      plan: body.plan,
    });
    const payload = await getSubscribers();
    return Response.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "MikroTik rejected the action";
    return Response.json({ connected: true, message }, { status: 502 });
  }
}
