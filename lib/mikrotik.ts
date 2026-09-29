import http from "node:http";
import https from "node:https";
import type { Plan, Voucher } from "@/lib/data";
import {
  formatRos,
  limitFor,
  mapSubscribers,
  mapVouchers,
  mbps,
  parseDuration,
  profileFor,
  type RosRecord,
} from "@/lib/hotspot-map";
import { randomCode } from "@/lib/utils";

const PROFILES = [
  { name: "uriel-daily", "rate-limit": "3M/3M", "shared-users": "1" },
  { name: "uriel-monthly", "rate-limit": "15M/15M", "shared-users": "1" },
  { name: "uriel-capped", "rate-limit": "1M/1M", "shared-users": "1" },
] as const;

const SETUP_MESSAGE = "Add MIKROTIK_HOST, MIKROTIK_USER, and MIKROTIK_PASSWORD to .env.local, then restart the dev server.";

export function isConfigured() {
  return Boolean(process.env.MIKROTIK_HOST && process.env.MIKROTIK_USER && process.env.MIKROTIK_PASSWORD);
}

function hostUrl() {
  const raw = process.env.MIKROTIK_HOST ?? "";
  const withProtocol = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
  return new URL(withProtocol);
}

function ros<T>(method: string, path: string, body?: unknown): Promise<T> {
  const target = hostUrl();
  const payload = body === undefined ? null : JSON.stringify(body);
  const transport = target.protocol === "https:" ? https : http;
  const auth = Buffer.from(`${process.env.MIKROTIK_USER}:${process.env.MIKROTIK_PASSWORD}`).toString("base64");

  return new Promise((resolve, reject) => {
    const req = transport.request(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port || (target.protocol === "https:" ? 443 : 80),
        path,
        method,
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
          ...(payload ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } : {}),
        },
        rejectUnauthorized: process.env.MIKROTIK_TLS_INSECURE !== "true",
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          const status = res.statusCode ?? 500;
          if (status >= 400) {
            reject(new Error(routerMessage(text) || res.statusMessage || "MikroTik refused the request"));
            return;
          }
          if (!text) {
            resolve(undefined as T);
            return;
          }
          try {
            resolve(JSON.parse(text) as T);
          } catch {
            reject(new Error("MikroTik returned a response that was not JSON"));
          }
        });
      },
    );
    req.setTimeout(8000, () => req.destroy(new Error("MikroTik did not respond")));
    req.on("error", (error) => reject(error instanceof Error ? error : new Error("MikroTik did not respond")));
    if (payload) req.write(payload);
    req.end();
  });
}

function routerMessage(text: string) {
  try {
    const parsed = JSON.parse(text) as { message?: string; detail?: string };
    return [parsed.message, parsed.detail].filter(Boolean).join(": ");
  } catch {
    return text.trim();
  }
}

function asList(value: RosRecord[] | RosRecord | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function idPath(resource: string, id: string) {
  return `/rest/${resource}/${encodeURIComponent(id)}`;
}

let profilesReady: Promise<void> | null = null;

function ensureProfiles() {
  profilesReady ??= (async () => {
    const existing = asList(await ros<RosRecord[]>("GET", "/rest/ip/hotspot/user/profile"));
    const names = new Set(existing.map((profile) => profile.name));
    for (const profile of PROFILES) {
      if (!names.has(profile.name)) {
        await ros("PUT", "/rest/ip/hotspot/user/profile", profile);
      }
    }
  })().catch((error) => {
    profilesReady = null;
    throw error;
  });
  return profilesReady;
}

async function hotspotUsers() {
  return asList(await ros<RosRecord[]>("GET", "/rest/ip/hotspot/user"));
}

async function hotspotActive() {
  return asList(await ros<RosRecord[]>("GET", "/rest/ip/hotspot/active"));
}

async function readTraffic() {
  const wan = process.env.MIKROTIK_WAN_INTERFACE || "ether1";
  const sample = asList(await ros<RosRecord[]>("POST", "/rest/interface/monitor-traffic", { interface: wan, once: "" }));
  const row = sample[0];
  return {
    wan,
    downMbps: mbps(row?.["rx-bits-per-second"]),
    upMbps: mbps(row?.["tx-bits-per-second"]),
  };
}

function blankOverview(message: string) {
  return {
    connected: false,
    message,
    identity: "",
    activeSubscribers: null,
    capacity: null,
    downMbps: null,
    upMbps: null,
    wanInterface: "",
    trafficMessage: "",
    uptime: "",
    interfaces: [] as { name: string; running: boolean; type: string }[],
    vouchers: [] as Voucher[],
  };
}

export async function routerStatus() {
  if (!isConfigured()) return { connected: false, label: "Router not configured" };
  try {
    const identity = asList(await ros<RosRecord[]>("GET", "/rest/system/identity"));
    return { connected: true, label: identity[0]?.name || "MikroTik" };
  } catch {
    return { connected: false, label: "Router unreachable" };
  }
}

export async function getOverview() {
  if (!isConfigured()) return blankOverview(SETUP_MESSAGE);
  try {
    await ensureProfiles();
    const [identity, active, users, resource, interfaces] = await Promise.all([
      ros<RosRecord[]>("GET", "/rest/system/identity").then(asList),
      hotspotActive(),
      hotspotUsers(),
      ros<RosRecord[]>("GET", "/rest/system/resource").then(asList),
      ros<RosRecord[]>("GET", "/rest/interface").then(asList),
    ]);
    let traffic = { wan: process.env.MIKROTIK_WAN_INTERFACE || "ether1", downMbps: 0, upMbps: 0 };
    let trafficMessage = "";
    try {
      traffic = await readTraffic();
    } catch (error) {
      trafficMessage = error instanceof Error ? error.message : "Could not read the WAN interface";
    }
    return {
      connected: true,
      message: "",
      identity: identity[0]?.name || "MikroTik",
      activeSubscribers: active.length,
      capacity: Number(process.env.MIKROTIK_CAPACITY || 100),
      downMbps: trafficMessage ? null : traffic.downMbps,
      upMbps: trafficMessage ? null : traffic.upMbps,
      wanInterface: traffic.wan,
      trafficMessage,
      uptime: resource[0]?.uptime || "",
      interfaces: interfaces.map((item) => ({
        name: item.name,
        running: item.running === "true",
        type: item.type || "",
      })),
      vouchers: mapVouchers(users, active),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reach MikroTik";
    return blankOverview(message);
  }
}

export async function getSubscribers() {
  if (!isConfigured()) {
    return { connected: false, message: SETUP_MESSAGE, subscribers: [] };
  }
  try {
    await ensureProfiles();
    const [users, active] = await Promise.all([hotspotUsers(), hotspotActive()]);
    return { connected: true, message: "", subscribers: mapSubscribers(users, active) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reach MikroTik";
    return { connected: false, message, subscribers: [] };
  }
}

export async function createVouchers(quantity: number, duration: string, price: number) {
  await ensureProfiles();
  const users = await hotspotUsers();
  const taken = new Set(users.map((user) => user.name));
  const count = Math.min(200, Math.max(1, quantity));
  const plan: Plan = duration.startsWith("30") ? "Monthly" : "Daily";
  const created: string[] = [];

  for (let index = 0; index < count; index += 1) {
    let code = randomCode();
    for (let attempt = 0; attempt < 20 && taken.has(code); attempt += 1) code = randomCode();
    if (taken.has(code)) throw new Error("Could not allocate a unique PIN");
    taken.add(code);
    await ros("PUT", "/rest/ip/hotspot/user", {
      name: code,
      password: code,
      profile: profileFor(plan),
      server: "all",
      "limit-uptime": limitFor(duration),
      comment: `price=${price};plan=${plan}`,
    });
    created.push(code);
  }
  return created;
}

async function setQueueLimit(username: string, limit: string) {
  try {
    const queues = asList(await ros<RosRecord[]>("GET", "/rest/queue/simple"));
    const queue = queues.find((item) => item.name === username || item.name?.endsWith(username));
    if (!queue) return;
    await ros("PATCH", idPath("queue/simple", queue[".id"]), { "max-limit": limit });
  } catch {
    // The profile still applies on the next login when no dynamic queue is present.
  }
}

export async function applySubscriberAction(input: {
  action: "kick" | "renew" | "cap";
  userId: string;
  activeId?: string;
  plan: Plan;
}) {
  await ensureProfiles();
  const users = await hotspotUsers();
  const user = users.find((item) => item[".id"] === input.userId);
  if (!user) throw new Error("Hotspot user not found");

  if (input.action === "kick") {
    if (!input.activeId) throw new Error("This subscriber is already offline.");
    await ros("DELETE", idPath("ip/hotspot/active", input.activeId));
    return;
  }

  if (input.action === "cap") {
    await ros("PATCH", idPath("ip/hotspot/user", input.userId), { profile: "uriel-capped" });
    await setQueueLimit(user.name, "1M/1M");
    return;
  }

  const extension = input.plan === "Monthly" ? parseDuration("30d") : parseDuration("1d");
  const nextLimit = parseDuration(user.uptime) + extension;
  const profile = profileFor(input.plan);
  await ros("PATCH", idPath("ip/hotspot/user", input.userId), {
    profile,
    "limit-uptime": formatRos(nextLimit),
    disabled: "false",
  });
  await setQueueLimit(user.name, input.plan === "Monthly" ? "15M/15M" : "3M/3M");
}
