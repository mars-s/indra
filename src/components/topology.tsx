import { Cloud, MapPin } from "lucide-react";
import { KindIcon, TailnetGlyph } from "@/components/icons";
import { Meter } from "@/components/meter";
import { gib, percent } from "@/lib/format";
import { GROUPS, type GroupId } from "@/lib/inventory";
import type { Machine, Snapshot } from "@/lib/snapshot";

const label = "text-[10.5px] font-medium tracking-[0.06em] text-dim uppercase";

function specs(m: Machine): string {
  return [m.cores ? `${m.cores} cores` : null, m.memTotal ? gib(m.memTotal) : null].filter(Boolean).join(" · ");
}

export function MachineCard({ machine: m }: { machine: Machine }) {
  const awake = m.state === "online";
  return (
    <div
      className={`flex min-w-0 items-center gap-2.5 rounded-lg border p-2.5 ${
        awake ? "border-line" : "border-dashed border-line-subtle bg-transparent"
      }`}
    >
      <span className="grid size-[30px] shrink-0 place-items-center rounded-md bg-raised">
        <KindIcon kind={m.kind} className={`size-4 ${awake ? "text-dim-2" : "text-dim"}`} />
      </span>
      <div className="min-w-0 flex-1">
        <div className={`truncate text-[13px] font-medium ${awake ? "text-fg" : "text-dim"}`}>{m.name}</div>
        <div className="flex items-center gap-1 truncate text-[11.5px] text-dim">
          <MapPin strokeWidth={1.5} className="size-3 shrink-0" aria-hidden />
          {m.where}
        </div>
        <div className="truncate font-mono text-[11px] text-dim tabular">
          {m.state === "online" ? specs(m) || "online" : m.state === "asleep" ? "asleep" : "no data"}
          {m.note ? <span className="text-unreached"> · {m.note}</span> : null}
        </div>
      </div>
      <div className="shrink-0 space-y-1">
        <Meter label="CPU" value={awake ? m.cpu : undefined} />
        <Meter label="MEM" value={awake ? m.mem : undefined} />
      </div>
    </div>
  );
}

function GroupColumn({ id, machines }: { id: GroupId; machines: Machine[] }) {
  const group = GROUPS.find((g) => g.id === id)!;
  const up = machines.filter((m) => m.state === "online").length;
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center gap-2 px-1">
        <TailnetGlyph className="size-2.5 text-dim" />
        <span className={label}>
          {group.label} · {group.caption}
        </span>
        <span className="ml-auto font-mono text-[11px] text-dim tabular">
          {up} of {machines.length} up
        </span>
      </div>
      <div className="space-y-2">
        {machines.map((m) => (
          <MachineCard key={m.id} machine={m} />
        ))}
      </div>
    </div>
  );
}

function Wire({ latencyMs }: { latencyMs?: number }) {
  return (
    <div className="relative hidden w-11 self-stretch lg:block" aria-hidden>
      <div className="absolute inset-x-0 top-1/2 h-px bg-line" />
      {latencyMs !== undefined && (
        <span className="absolute inset-x-0 top-1/2 -translate-y-[calc(100%+3px)] text-center font-mono text-[10.5px] text-dim tabular">
          {latencyMs} ms
        </span>
      )}
    </div>
  );
}

function Stem() {
  return <div className="mx-auto hidden h-6 w-px bg-line lg:block" aria-hidden />;
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) {
    return <div className="hatch h-5 rounded-sm" title="No CPU history from Proxmox" />;
  }
  const max = Math.max(0.05, ...values);
  const points = values.map((v, i) => [(i / (values.length - 1)) * 100, 20 - (v / max) * 18] as const);
  const line = points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  return (
    <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="h-5 w-full" role="img" aria-label="CPU over the last hour">
      <line x1="0" x2="100" y1="19.5" y2="19.5" stroke="var(--color-line)" strokeDasharray="1 2" vectorEffect="non-scaling-stroke" />
      <path d={`${line} L100,20 L0,20 Z`} fill="var(--color-meter)" fillOpacity="0.22" />
      <path d={line} fill="none" stroke="var(--color-meter)" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function HubCard({ hub }: { hub: NonNullable<Snapshot["hub"]> }) {
  const m = hub.machine;
  const memUsed = m.mem !== undefined && m.memTotal ? m.mem * m.memTotal : undefined;
  return (
    <div className="min-w-0 rounded-lg border border-line p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-[30px] shrink-0 place-items-center rounded-md bg-raised">
          <KindIcon kind={m.kind} className="size-4 text-dim-2" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-[14px] font-medium ${m.state === "online" ? "text-fg" : "text-dim"}`}>{m.name}</span>
            <span className="rounded-[4px] border border-line px-1 text-[10px] leading-[14px] text-dim-2">hub</span>
          </div>
          <div className="flex items-center gap-1 truncate text-[11.5px] text-dim">
            <Cloud strokeWidth={1.5} className="size-3 shrink-0" aria-hidden />
            {hub.version ? `Proxmox VE ${hub.version}` : "Proxmox VE"} · Home LAN
          </div>
        </div>
        {m.latencyMs !== undefined && (
          <span className="ml-auto shrink-0 font-mono text-[11px] whitespace-nowrap text-dim tabular">{m.latencyMs} ms</span>
        )}
      </div>
      <div className="mt-4">
        <Sparkline values={hub.cpuHistory} />
      </div>
      <div className="mt-2 font-mono text-[11px] text-dim tabular">
        {m.state === "online"
          ? `${percent(m.cpu)} CPU · ${m.cores ?? "-"} cores · ${gib(memUsed)} of ${gib(m.memTotal)}`
          : m.state === "asleep"
            ? "asleep"
            : "no live source · connect the Proxmox API"}
      </div>
    </div>
  );
}

export function Topology({ snap }: { snap: Snapshot }) {
  const by = (id: GroupId) => snap.machines.filter((m) => m.group === id && m.id !== snap.hub?.machine.id);
  const guests = by("lan");
  const guestsUp = guests.filter((m) => m.state === "online").length;
  const edge = by("edge");

  return (
    <div className="rounded-xl border border-line p-4 md:p-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-0">
        <GroupColumn id="tailnet" machines={by("tailnet")} />
        <Wire />
        {snap.hub ? <HubCard hub={snap.hub} /> : <div />}
        <Wire latencyMs={edge[0]?.latencyMs} />
        <GroupColumn id="edge" machines={edge} />
      </div>

      <Stem />
      <div className="mt-4 rounded-lg border border-line p-3 lg:mt-0">
        <div className="mb-2 flex items-center px-1">
          <span className={label}>Proxmox guests · Home LAN</span>
          <span className="ml-auto font-mono text-[11px] text-dim tabular">
            {guestsUp} of {guests.length} up
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {guests.map((m) => (
            <MachineCard key={m.id} machine={m} />
          ))}
        </div>
      </div>

      <Stem />
      <div className="mt-4 rounded-lg border border-dashed border-line p-3 lg:mt-0">
        <div className="mb-2 flex items-center px-1">
          <span className={label}>Sandboxes</span>
          <span className="ml-auto font-mono text-[11px] text-dim tabular">0 awake · 0 asleep</span>
        </div>
        <div className="flex items-center gap-2 px-1 text-[12.5px]">
          <span className="text-dim-2">T3 Code</span>
          <span className="font-mono text-[11px] text-dim tabular">-</span>
        </div>
        <div className="mt-2 rounded-lg border border-dashed border-line-subtle p-3 text-[12px] text-dim sm:max-w-[calc(50%-4px)] xl:max-w-[calc(33.333%-6px)]">
          Placeholder · the T3 Code environment list is not connected yet.
        </div>
      </div>
    </div>
  );
}

const SOURCE_DOT = {
  live: "bg-online",
  error: "bg-unreached",
  "not-configured": "bg-dim",
  placeholder: "border border-dim bg-transparent",
} as const;

export function SourceStrip({ sources }: { sources: Snapshot["sources"] }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 px-1 text-[11.5px] text-dim" aria-label="Data sources">
      {sources.map((s) => (
        <li key={s.id} className="flex min-w-0 items-center gap-1.5" title={s.detail}>
          <span className={`size-1.5 shrink-0 rounded-full ${SOURCE_DOT[s.state]}`} aria-hidden />
          <span className="text-dim-2">{s.label}</span>
          <span className="truncate">
            {s.state === "live" ? "live" : s.state === "not-configured" ? "not configured" : s.state === "placeholder" ? "placeholder" : "unreachable"}
            {s.state !== "placeholder" && s.detail ? ` · ${s.detail}` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}
