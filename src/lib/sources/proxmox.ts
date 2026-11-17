import "server-only";
import { env } from "@/lib/env";
import { describeError, request } from "./request";

// One row of GET /cluster/resources, trimmed to what Indra shows.
export interface ProxmoxResource {
  type: "node" | "qemu" | "lxc";
  node: string;
  vmid?: number;
  name: string;
  status: string;
  cpu: number;
  maxcpu: number;
  mem: number;
  maxmem: number;
  disk: number;
  maxdisk: number;
  uptime: number;
}

export type ProxmoxResult =
  | {
      ok: true;
      resources: ProxmoxResource[];
      version?: string;
      latencyMs: number;
      cpuHistory: Record<string, number[]>;
    }
  | { ok: false; error: string; configured: boolean };

function baseUrl(host: string): string {
  const withScheme = /^https?:\/\//.test(host) ? host : `https://${host}`;
  const url = new URL(withScheme);
  if (!url.port && url.protocol === "https:") url.port = "8006";
  return url.origin;
}

export async function getProxmox(): Promise<ProxmoxResult> {
  const host = env("PROXMOX_HOST");
  const tokenId = env("PROXMOX_TOKEN_ID");
  const secret = env("PROXMOX_TOKEN_SECRET");
  if (!host || !tokenId || !secret) {
    return {
      ok: false,
      configured: false,
      error: "set PROXMOX_HOST, PROXMOX_TOKEN_ID and PROXMOX_TOKEN_SECRET",
    };
  }

  const origin = baseUrl(host);
  const verify = !/^(0|false|no)$/i.test(env("PROXMOX_VERIFY_TLS") ?? "true");
  const get = async <T>(path: string) => {
    const res = await request(`${origin}/api2/json${path}`, {
      insecure: !verify,
      headers: { Authorization: `PVEAPIToken=${tokenId}=${secret}` },
    });
    if (res.status !== 200) throw new Error(`${path} returned HTTP ${res.status}`);
    return { data: (JSON.parse(res.body) as { data: T }).data, ms: res.ms };
  };

  try {
    const [resources, version] = await Promise.all([
      get<ProxmoxResource[]>("/cluster/resources"),
      get<{ version: string }>("/version").catch(() => undefined),
    ]);
    const nodes = resources.data.filter((r) => r.type === "node" && r.status === "online");
    const histories = await Promise.all(
      nodes.map((n) =>
        get<{ cpu?: number }[]>(`/nodes/${encodeURIComponent(n.node)}/rrddata?timeframe=hour&cf=AVERAGE`)
          .then((r) => [n.node, r.data.map((p) => p.cpu).filter((v) => typeof v === "number")] as const)
          .catch(() => [n.node, [] as number[]] as const),
      ),
    );
    return {
      ok: true,
      resources: resources.data.filter((r) => r.type === "node" || r.type === "qemu" || r.type === "lxc"),
      version: version?.data.version,
      latencyMs: resources.ms,
      cpuHistory: Object.fromEntries(histories),
    };
  } catch (error) {
    return { ok: false, configured: true, error: describeError(error) };
  }
}
