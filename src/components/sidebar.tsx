import { ChevronDown, PanelLeft, Plus } from "lucide-react";
import { connection } from "next/server";
import { IndraMark, KindIcon } from "@/components/icons";
import { NavLinks } from "@/components/nav-links";
import { ThemeToggle } from "@/components/theme-toggle";
import { duration, percent } from "@/lib/format";
import { GROUPS } from "@/lib/inventory";
import { getSnapshot, type Machine } from "@/lib/snapshot";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-6 items-center justify-between px-2 text-[10.5px] font-medium tracking-[0.06em] text-dim uppercase">
      {children}
    </div>
  );
}

function machineTrailing(m: Machine) {
  if (m.state === "asleep") return <span className="text-dim">asleep</span>;
  if (m.state === "unknown") return <span className="text-dim">no data</span>;
  return <span className="font-mono text-dim-2 tabular">{m.cpu === undefined ? "up" : percent(m.cpu)}</span>;
}

function Brand() {
  return (
    <div className="flex h-8 items-center gap-2.5 px-2">
      <IndraMark className="size-6" />
      <span className="font-serif text-[22px] leading-none tracking-[-0.01em] text-fg">indra</span>
      <PanelLeft strokeWidth={1.5} className="ml-auto size-4 text-dim" aria-hidden />
    </div>
  );
}

function Frame({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <aside className="flex shrink-0 flex-col border-b border-line px-[14px] pt-[22px] pb-4 md:w-[256px] md:border-r md:border-b-0">
      <Brand />
      {children}
      <div className="mt-auto pt-8">{footer}</div>
    </aside>
  );
}

export function SidebarFallback() {
  return (
    <Frame footer={<ThemeToggle />}>
      <NavLinks online={undefined} total={undefined} unreached={undefined} />
    </Frame>
  );
}

export async function Sidebar() {
  await connection();
  const snap = await getSnapshot();
  const online = snap.machines.filter((m) => m.state === "online").length;
  const asleep = snap.machines.filter((m) => m.state === "asleep").length;
  const unknown = snap.machines.length - online - asleep;
  const hub = snap.hub?.machine;

  return (
    <Frame
      footer={
        <div className="space-y-1 px-2 text-[12px]">
          <div className="flex items-center gap-2 text-fg">
            <span className="size-1.5 rounded-full bg-online" aria-hidden />
            <span>
              {online} online · {asleep} asleep{unknown ? ` · ${unknown} no data` : ""}
            </span>
          </div>
          <div className="text-dim">Hub {hub?.name ?? "-"}</div>
          <div className="font-mono text-[11.5px] text-dim tabular">
            {hub?.cores ?? "-"} cores · up {duration(hub?.uptime)}
          </div>
          <div className="pt-3">
            <ThemeToggle />
          </div>
        </div>
      }
    >
      <NavLinks online={online} total={snap.machines.length} unreached={unknown} />

      <div className="mt-6">
        <SectionLabel>Servers</SectionLabel>
        {GROUPS.map((group) => {
          const members = snap.machines.filter((m) => m.group === group.id);
          const up = members.filter((m) => m.state === "online").length;
          return (
            <details key={group.id} open className="group/tree">
              <summary className="flex h-7 cursor-pointer list-none items-center gap-2 rounded-md px-2 text-dim-2 hover:bg-raised [&::-webkit-details-marker]:hidden">
                <ChevronDown
                  strokeWidth={1.5}
                  className="size-3.5 -rotate-90 transition-transform duration-150 group-open/tree:rotate-0"
                  aria-hidden
                />
                <span className="text-fg/90">{group.label}</span>
                <span className="ml-auto font-mono text-[11.5px] text-dim tabular">
                  {up}/{members.length}
                </span>
              </summary>
              <ul className="pb-1">
                {members.map((m) => (
                  <li key={m.id} className="flex h-7 items-center gap-2 rounded-md pr-2 pl-[30px] text-[12.5px] hover:bg-raised">
                    <KindIcon kind={m.kind} className="size-3.5 text-dim" />
                    <span className={m.state === "online" ? "truncate text-fg/85" : "truncate text-dim"}>{m.name}</span>
                    <span className="ml-auto shrink-0 text-[11.5px]">{machineTrailing(m)}</span>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </div>

      <div className="mt-4">
        <SectionLabel>
          <span>Sandboxes</span>
          <span className="flex items-center gap-2 normal-case">
            <span className="font-mono tabular">0</span>
            <Plus strokeWidth={1.5} className="size-3.5" aria-label="Add sandbox (not available yet)" />
          </span>
        </SectionLabel>
        <div className="flex h-7 items-center gap-2 px-2 text-[12.5px] text-dim">
          <span className="size-1.5 rounded-full bg-line" aria-hidden />
          T3 Code
          <span className="ml-auto text-[11.5px]">not connected</span>
        </div>
      </div>
    </Frame>
  );
}
