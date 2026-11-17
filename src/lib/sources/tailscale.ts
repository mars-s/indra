import "server-only";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { promisify } from "node:util";
import { env } from "@/lib/env";
import { describeError, request } from "./request";

const run = promisify(execFile);

export interface TailscaleNode {
  hostName: string;
  dnsName: string;
  ips: string[];
  online: boolean;
  lastSeen?: string;
  self: boolean;
}

export type TailscaleResult =
  | { ok: true; backendState: string; nodes: TailscaleNode[] }
  | { ok: false; error: string };

interface RawNode {
  HostName?: string;
  DNSName?: string;
  TailscaleIPs?: string[];
  Online?: boolean;
  LastSeen?: string;
}

interface RawStatus {
  BackendState?: string;
  Self?: RawNode;
  Peer?: Record<string, RawNode>;
}

const DEFAULT_SOCKET = "/var/run/tailscale/tailscaled.sock";

// Prefer the local API socket (works in a container with the socket mounted),
// then fall back to the CLI (macOS, or hosts where the socket is elsewhere).
async function readStatus(): Promise<RawStatus> {
  const socketPath = env("TAILSCALE_SOCKET") ?? DEFAULT_SOCKET;
  if (existsSync(/*turbopackIgnore: true*/ socketPath)) {
    const res = await request("http://local-tailscaled.sock/localapi/v0/status", {
      socketPath,
      headers: { Host: "local-tailscaled.sock" },
    });
    if (res.status !== 200) throw new Error(`local API returned ${res.status}`);
    return JSON.parse(res.body) as RawStatus;
  }
  const bin = env("TAILSCALE_BIN") ?? "tailscale";
  const { stdout } = await run(bin, ["status", "--json"], {
    timeout: 5000,
    maxBuffer: 8 * 1024 * 1024,
  });
  return JSON.parse(stdout) as RawStatus;
}

function toNode(raw: RawNode, self: boolean, running: boolean): TailscaleNode {
  const lastSeen = raw.LastSeen && !raw.LastSeen.startsWith("0001") ? raw.LastSeen : undefined;
  return {
    hostName: raw.HostName ?? "",
    dnsName: (raw.DNSName ?? "").replace(/\.$/, ""),
    ips: raw.TailscaleIPs ?? [],
    online: running && (self || Boolean(raw.Online)),
    lastSeen,
    self,
  };
}

export async function getTailscale(): Promise<TailscaleResult> {
  try {
    const status = await readStatus();
    const backendState = status.BackendState ?? "Unknown";
    const running = backendState === "Running";
    const nodes = Object.values(status.Peer ?? {}).map((p) => toNode(p, false, running));
    if (status.Self) nodes.push(toNode(status.Self, true, running));
    return { ok: true, backendState, nodes };
  } catch (error) {
    return { ok: false, error: describeError(error) };
  }
}
