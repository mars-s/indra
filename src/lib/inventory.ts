// The machines Indra knows about, and how to find each one in every source.
// This is wiring, not data: live state always comes from the sources.
// Addresses come from docs/plan.md (LAN and tailnet only, never public).

export type GroupId = "lan" | "tailnet" | "edge";
export type MachineKind = "host" | "vm" | "lxc" | "pi" | "laptop" | "desktop";

export interface InventoryMachine {
  id: string;
  name: string;
  kind: MachineKind;
  group: GroupId;
  where: string;
  proxmox?: { node: string } | { vmid: number };
  tailscaleIp?: string;
  exporter?: string;
}

export interface Group {
  id: GroupId;
  label: string;
  caption: string;
}

export const GROUPS: Group[] = [
  { id: "lan", label: "Home LAN", caption: "Proxmox on mars" },
  { id: "tailnet", label: "Tailnet", caption: "Laptops" },
  { id: "edge", label: "Edge", caption: "Raspberry Pi" },
];

export const HUB_ID = "mars";

export const INVENTORY: InventoryMachine[] = [
  {
    id: "mars",
    name: "mars",
    kind: "host",
    group: "lan",
    where: "Proxmox VE host",
    proxmox: { node: "pve" },
    tailscaleIp: "100.98.253.74",
  },
  { id: "umbrel", name: "umbrel", kind: "vm", group: "lan", where: "VM 100", proxmox: { vmid: 100 }, tailscaleIp: "100.89.186.35" },
  { id: "haos", name: "haos-17.2", kind: "vm", group: "lan", where: "VM 101", proxmox: { vmid: 101 }, tailscaleIp: "100.86.149.112" },
  { id: "jellyfin", name: "jellyfin", kind: "lxc", group: "lan", where: "LXC 110", proxmox: { vmid: 110 } },
  { id: "nod", name: "nod", kind: "vm", group: "lan", where: "VM 121", proxmox: { vmid: 121 }, tailscaleIp: "100.86.219.49" },
  { id: "openbot", name: "openbot", kind: "vm", group: "lan", where: "VM 120", proxmox: { vmid: 120 }, tailscaleIp: "100.72.165.19" },
  {
    id: "macbook",
    name: "Avi's MacBook Pro",
    kind: "laptop",
    group: "tailnet",
    where: "macOS",
    tailscaleIp: "100.122.114.39",
  },
  {
    id: "desktop-e97e1ea",
    name: "desktop-e97e1ea",
    kind: "desktop",
    group: "tailnet",
    where: "Windows",
    tailscaleIp: "100.115.204.41",
  },
  {
    id: "pluto",
    name: "pluto",
    kind: "pi",
    group: "edge",
    where: "Raspberry Pi 5",
    tailscaleIp: "100.101.119.88",
    exporter: "http://192.168.1.120:9100/metrics",
  },
];
