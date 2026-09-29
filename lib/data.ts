export type NodeStatus = "online" | "degraded" | "offline";
export type VoucherStatus = "Active" | "Unused" | "Expired";
export type Plan = "Daily" | "Monthly";

export const market = {
  name: "Jos Terminus Market",
  node: "Terminus Market Node 1",
  gateway: "Starlink Gateway · 11th Floor",
};

export const telemetry = {
  activeSubscribers: 42,
  capacity: 100,
  downMbps: 185,
  upMbps: 24,
  mrr: 4_280_000,
  linkDbm: -58,
  linkQuality: 100,
  linkName: "CPE710",
};

export const nodes: {
  id: string;
  name: string;
  detail: string;
  status: NodeStatus;
  meta?: string;
}[] = [
  { id: "gw", name: "Starlink Gateway", detail: "11th Floor", status: "online", meta: "185 / 24 Mbps" },
  { id: "ptp", name: "PtP Bridge", detail: "5 GHz", status: "online", meta: "CPE710 · −58 dBm" },
  { id: "rx", name: "Market Receiver", detail: "Terminus roof", status: "online", meta: "100% quality" },
  { id: "ap1", name: "Omada AP1", detail: "Row A · Textiles", status: "online", meta: "24 clients" },
  { id: "ap2", name: "Omada AP2", detail: "Row C · Provisions", status: "degraded", meta: "18 clients · retry" },
];

export type Voucher = {
  code: string;
  plan: Plan;
  price: number;
  status: VoucherStatus;
  shop: string;
  expires: string;
};

export const vouchers: Voucher[] = [
  { code: "482913", plan: "Daily", price: 700, status: "Active", shop: "Shop 14", expires: "18h" },
  { code: "819204", plan: "Monthly", price: 8000, status: "Active", shop: "Shop 22", expires: "22d" },
  { code: "330118", plan: "Daily", price: 700, status: "Unused", shop: "—", expires: "—" },
  { code: "774501", plan: "Daily", price: 700, status: "Unused", shop: "—", expires: "—" },
  { code: "190442", plan: "Monthly", price: 8000, status: "Unused", shop: "—", expires: "—" },
  { code: "552010", plan: "Daily", price: 700, status: "Expired", shop: "Shop 7", expires: "Ended" },
  { code: "661883", plan: "Monthly", price: 8000, status: "Expired", shop: "Shop 3", expires: "Ended" },
  { code: "248775", plan: "Daily", price: 700, status: "Active", shop: "Shop 31", expires: "6h" },
];

export type Subscriber = {
  id: string;
  activeId?: string;
  shop: string;
  mac: string;
  plan: Plan;
  status: "Online" | "Offline" | "Capped";
  expires: string;
  speed: string;
};

export const subscribers: Subscriber[] = [
  { id: "1", shop: "Mama Nkechi Provisions · 14", mac: "48:22:54:1A:09:11", plan: "Daily", status: "Online", expires: "18h", speed: "3 Mbps" },
  { id: "2", shop: "Alhaji Musa Electronics · 22", mac: "B4:2E:99:70:14:C2", plan: "Monthly", status: "Online", expires: "22d", speed: "15 Mbps" },
  { id: "3", shop: "Grace Fabrics · 7", mac: "A4:83:E7:22:88:01", plan: "Daily", status: "Offline", expires: "Ended", speed: "—" },
  { id: "4", shop: "Jos Gold Jewelry · 3", mac: "3C:22:FB:09:44:7E", plan: "Monthly", status: "Capped", expires: "4d", speed: "1 Mbps" },
  { id: "5", shop: "Emeka Phone Repairs · 31", mac: "F0:9F:C2:61:10:AB", plan: "Daily", status: "Online", expires: "6h", speed: "3 Mbps" },
  { id: "6", shop: "Terminus Cold Room · 18", mac: "00:1A:2B:88:33:19", plan: "Monthly", status: "Online", expires: "11d", speed: "15 Mbps" },
  { id: "7", shop: "Amina Cosmetics · 9", mac: "DC:A6:32:17:55:90", plan: "Daily", status: "Online", expires: "21h", speed: "3 Mbps" },
  { id: "8", shop: "Plateau Grains · 27", mac: "18:66:DA:44:02:6C", plan: "Monthly", status: "Online", expires: "28d", speed: "15 Mbps" },
];
