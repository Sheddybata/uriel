import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "uriel-admin";
const SESSION_DAYS = 7;

function secret() {
  return process.env.ADMIN_PASSWORD ?? "";
}

export function isLockConfigured() {
  return secret().length > 0;
}

function sign(expires: number) {
  return createHmac("sha256", secret()).update(`admin:${expires}`).digest("hex");
}

function sameString(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function passwordMatches(candidate: string) {
  if (!isLockConfigured()) return false;
  return sameString(candidate, secret());
}

export function issueToken() {
  const expires = Date.now() + SESSION_DAYS * 86400000;
  return { value: `${expires}.${sign(expires)}`, maxAge: SESSION_DAYS * 86400 };
}

export function tokenIsValid(token: string | undefined) {
  if (!token || !isLockConfigured()) return false;
  const [stamp, digest] = token.split(".");
  const expires = Number(stamp);
  if (!digest || !Number.isFinite(expires) || expires < Date.now()) return false;
  return sameString(digest, sign(expires));
}

export async function hasAdminSession() {
  const store = await cookies();
  return tokenIsValid(store.get(SESSION_COOKIE)?.value);
}

export async function guardAdminRequest() {
  if (!isLockConfigured()) {
    return Response.json(
      { connected: false, message: "Add ADMIN_PASSWORD to .env.local, then restart the dev server." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
  if (await hasAdminSession()) return null;
  return Response.json(
    { connected: false, message: "Sign in to the command center." },
    { status: 401, headers: { "Cache-Control": "no-store" } },
  );
}
