import "server-only";
import { env } from "@/lib/env";
import { HUB_ID, INVENTORY, type GroupId, type InventoryMachine, type MachineKind } from "@/lib/inventory";
import { getExporter, type ExporterResult } from "@/lib/sources/node-exporter";
import { getProxmox, type ProxmoxResource } from "@/lib/sources/proxmox";
import { getTailscale, type TailscaleNode } from "@/lib/sources/tailscale";

// online: a source says it is up. asleep: a source says it is stopped or offline.
// unknown: no connected source can see it.
export type MachineState = "online" | "asleep" | "unknown";

export interface Machine {
  id: string;
  name: string;
  kind: MachineKind;
  group: GroupId;
  where: string;
  state: MachineState;
  note?: string;
  cpu?: number;
  mem?: number;
  cores?: number;
  memTotal?: number;
  uptime?: number;
  latencyMs?: number;
  lastSeen?: string;
}

export type SourceState = "live" | "error" | "not-configured" | "placeholder";

export interface Source {
  id: "tailscale" | "proxmox" | "node-exporter" | "serveros" | "t3";
  label: string;
  state: SourceState;
  detail: string;
}

export interface Snapshot {
  at: string;
  machines: Machine[];
  hub: { machine: Machine; version?: string; cpuHistory: number[] } | null;
  sources: Source[];
}

function exporterTargets(): Map<string, string> {
  const targets = new Map(INVENTORY.filter((m) => m.exporter).map((m) => [m.id, m.exporter!]));
  // NODE_EXPORTER_TARGETS="pluto=http://100.101.119.88:9100/metrics,mars=http://…"
  for (const pair of (env("NODE_EXPORTER_TARGETS") ?? "").split(",")) {
    const [id, url] = pair.split("=").map((s) => s.trim());
    if (id && url) targets.set(id, url);
  }
  return targets;
}

function findProxmox(m: InventoryMachine, resources: ProxmoxResource[]) {
  const ref = m.proxmox;
  if (!ref) return undefined;
  return "node" in ref
    ? resources.find((r) => r.type === "node" && r.node === ref.node)
    : resources.find((r) => r.type !== "node" && r.vmid === ref.vmid);
}

function sinceDays(iso?: string): string {
  if (!iso) return "";
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  return days >= 1 ? ` ${days}d` : "";
}

function build(
  m: InventoryMachine,
  pve: ProxmoxResource | undefined,
  pveLatency: number | undefined,
  ts: TailscaleNode | undefined,
  tsRunning: boolean,
  exp: ExporterResult | undefined,
): Machine {
  const machine: Machine = {
    id: m.id,
    name: m.name,
    kind: m.kind,
    group: m.group,
    where: m.where,
    state: "unknown",
    lastSeen: ts?.lastSeen,
  };

  if (pve) {
    const running = pve.status === "running" || pve.status === "online";
    machine.state = running ? "online" : "asleep";
    machine.cores = pve.maxcpu;
    machine.memTotal = pve.maxmem;
    if (running) {
      machine.cpu = pve.cpu;
      machine.mem = pve.maxmem ? pve.mem / pve.maxmem : undefined;
      machine.uptime = pve.uptime;
    }
    if (pve.type === "node") machine.latencyMs = pveLatency;
    if (running && ts && tsRunning && !ts.online) {
      machine.note = `Tailscale offline${sinceDays(ts.lastSeen)}`;
    }
  }

  if (exp?.ok) {
    machine.state = "online";
    machine.cpu = exp.cpu;
    machine.mem = exp.mem;
    machine.cores = exp.cores;
    machine.memTotal = exp.memTotal;
    machine.uptime = exp.uptime;
    machine.latencyMs = exp.latencyMs;
  }

  if (machine.state === "unknown" && ts && tsRunning) {
    machine.state = ts.online ? "online" : "asleep";
    if (!ts.online) machine.note = `Tailscale offline${sinceDays(ts.lastSeen)}`;
  }

  return machine;
}

async function collect(): Promise<Snapshot> {
  const targets = exporterTargets();
  const [tailscale, proxmox, exporterEntries] = await Promise.all([
    getTailscale(),
    getProxmox(),
    Promise.all([...targets].map(async ([id, url]) => [id, await getExporter(url)] as const)),
  ]);
  const exporters = new Map(exporterEntries);
  const tsRunning = tailscale.ok && tailscale.backendState === "Running";

  const machines = INVENTORY.map((m) =>
    build(
      m,
      proxmox.ok ? findProxmox(m, proxmox.resources) : undefined,
      proxmox.ok ? proxmox.latencyMs : undefined,
      tailscale.ok ? tailscale.nodes.find((n) => m.tailscaleIp && n.ips.includes(m.tailscaleIp)) : undefined,
      tsRunning,
      exporters.get(m.id),
    ),
  );

  const hubMachine = machines.find((m) => m.id === HUB_ID)!;
  const hubRef = INVENTORY.find((m) => m.id === HUB_ID)?.proxmox;
  const hubNode = hubRef && "node" in hubRef ? hubRef.node : undefined;

  const liveExporters = exporterEntries.filter(([, r]) => r.ok).length;
  const exporterError = exporterEntries.find(([, r]) => !r.ok);

  const sources: Source[] = [
    tailscale.ok
      ? {
          id: "tailscale",
          label: "Tailscale",
          state: tsRunning ? "live" : "error",
          detail: tsRunning
            ? `${tailscale.nodes.length} nodes`
            : `tailscaled is ${tailscale.backendState.toLowerCase()} on this host`,
        }
      : { id: "tailscale", label: "Tailscale", state: "error", detail: tailscale.error },
    proxmox.ok
      ? { id: "proxmox", label: "Proxmox", state: "live", detail: `PVE ${proxmox.version ?? ""}`.trim() }
      : {
          id: "proxmox",
          label: "Proxmox",
          state: proxmox.configured ? "error" : "not-configured",
          detail: proxmox.error,
        },
    {
      id: "node-exporter",
      label: "node_exporter",
      state: liveExporters > 0 ? "live" : targets.size ? "error" : "not-configured",
      detail:
        exporterError && !exporterError[1].ok
          ? `${liveExporters} of ${targets.size} up · ${exporterError[0]}: ${exporterError[1].error}`
          : `${liveExporters} of ${targets.size} up`,
    },
    { id: "serveros", label: "ServerOS", state: "placeholder", detail: "not connected" },
    { id: "t3", label: "T3 Code", state: "placeholder", detail: "not connected" },
  ];

  return {
    at: new Date().toISOString(),
    machines,
    hub: hubMachine
      ? {
          machine: hubMachine,
          version: proxmox.ok ? proxmox.version : undefined,
          cpuHistory: proxmox.ok && hubNode ? (proxmox.cpuHistory[hubNode] ?? []) : [],
        }
      : null,
    sources,
  };
}

// Sources are polled at most every 10 s, however many tabs are open.
const TTL_MS = 10_000;
let cached: { at: number; value: Promise<Snapshot> } | undefined;

export function getSnapshot(): Promise<Snapshot> {
  if (!cached || Date.now() - cached.at > TTL_MS) {
    cached = { at: Date.now(), value: collect() };
  }
  return cached.value;
}
