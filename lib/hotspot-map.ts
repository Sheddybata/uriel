import type { Plan, Subscriber, Voucher, VoucherStatus } from "@/lib/data";

export type RosRecord = Record<string, string> & { ".id": string };

const UNIT_MS: Record<string, number> = {
  w: 604_800_000,
  d: 86_400_000,
  h: 3_600_000,
  m: 60_000,
  s: 1_000,
};

export function parseDuration(value: string | undefined): number {
  if (!value) return 0;
  let total = 0;
  for (const match of value.matchAll(/(\d+)([wdhms])/g)) {
    total += Number(match[1]) * UNIT_MS[match[2]];
  }
  return total;
}

export function formatRos(ms: number): string {
  let left = Math.max(0, Math.round(ms / 1000));
  const parts: string[] = [];
  for (const [unit, size] of [
    ["w", 604800],
    ["d", 86400],
    ["h", 3600],
    ["m", 60],
    ["s", 1],
  ] as const) {
    const count = Math.floor(left / size);
    if (count > 0) {
      parts.push(`${count}${unit}`);
      left -= count * size;
    }
  }
  return parts.join("") || "0s";
}

export function formatRemaining(ms: number): string {
  if (ms <= 0) return "Ended";
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  return `${Math.max(1, minutes)}m`;
}

export function parseComment(comment: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!comment) return out;
  for (const part of comment.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    out[part.slice(0, index).trim()] = part.slice(index + 1).trim();
  }
  return out;
}

export function profileFor(plan: Plan) {
  return plan === "Monthly" ? "uriel-monthly" : "uriel-daily";
}

export function limitFor(duration: string) {
  if (duration.startsWith("30")) return "30d";
  if (duration.startsWith("7")) return "7d";
  return "1d";
}

export function planOf(record: RosRecord): Plan {
  const comment = parseComment(record.comment);
  if (comment.plan === "Monthly" || comment.plan === "Daily") return comment.plan;
  return (record.profile ?? "").includes("month") ? "Monthly" : "Daily";
}

function disabled(record: RosRecord) {
  return record.disabled === "true" || record.disabled === "yes";
}

function priceOf(record: RosRecord) {
  const price = Number(parseComment(record.comment).price);
  return Number.isFinite(price) ? price : 0;
}

export function mbps(bits: string | number | undefined) {
  const value = Number(bits) / 1_000_000;
  if (!Number.isFinite(value)) return 0;
  return value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
}

export function mapVouchers(users: RosRecord[], active: RosRecord[]): Voucher[] {
  const online = new Set(active.map((session) => session.user));
  return users.map((user) => {
    const limit = parseDuration(user["limit-uptime"]);
    const used = parseDuration(user.uptime);
    const started = used > 0 || online.has(user.name);
    const expired = disabled(user) || (limit > 0 && used >= limit);
    const status: VoucherStatus = expired ? "Expired" : started ? "Active" : "Unused";
    const comment = parseComment(user.comment);
    return {
      code: user.name,
      plan: planOf(user),
      price: priceOf(user),
      status,
      shop: comment.shop || "—",
      expires: expired ? "Ended" : limit > 0 ? formatRemaining(limit - used) : "—",
    };
  });
}

export function mapSubscribers(users: RosRecord[], active: RosRecord[]): Subscriber[] {
  const online = new Map(active.map((session) => [session.user, session]));
  return users
    .map((user) => {
      const session = online.get(user.name);
      const profile = user.profile ?? "";
      const capped = profile === "uriel-capped";
      const status: Subscriber["status"] = session ? (capped ? "Capped" : "Online") : "Offline";
      const limit = parseDuration(user["limit-uptime"]);
      const used = parseDuration(user.uptime);
      const left = session?.["session-time-left"]
        ? parseDuration(session["session-time-left"])
        : limit - used;
      const speed = status === "Offline" ? "—" : capped ? "1 Mbps" : profile.includes("month") || planOf(user) === "Monthly" ? "15 Mbps" : "3 Mbps";
      const comment = parseComment(user.comment);
      return {
        id: user[".id"],
        activeId: session?.[".id"],
        shop: comment.shop || `PIN ${user.name}`,
        mac: session?.["mac-address"] || user["mac-address"] || "—",
        plan: planOf(user),
        status,
        expires: limit > 0 || session?.["session-time-left"] ? formatRemaining(left) : "—",
        speed,
      };
    })
    .sort((a, b) => Number(a.status === "Offline") - Number(b.status === "Offline"));
}
