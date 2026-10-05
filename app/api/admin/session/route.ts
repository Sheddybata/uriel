import { cookies } from "next/headers";
import { SESSION_COOKIE, isLockConfigured, issueToken, passwordMatches } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isLockConfigured()) {
    return Response.json(
      { message: "Add ADMIN_PASSWORD to .env.local, then restart the dev server." },
      { status: 503 },
    );
  }
  const body = await request
    .json()
    .then((value) => value as { password?: string })
    .catch(() => ({ password: undefined }));
  if (!body.password || !passwordMatches(body.password)) {
    return Response.json({ message: "Wrong password." }, { status: 401 });
  }
  const token = issueToken();
  const store = await cookies();
  store.set(SESSION_COOKIE, token.value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: token.maxAge,
  });
  return Response.json({ ok: true });
}

export async function DELETE() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  return Response.json({ ok: true });
}
