import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { PageTitle } from "@/components/page-title";
import { SyncNow } from "@/components/sync-now";
import { ago } from "@/lib/format";
import { getInstructions } from "@/lib/instructions";
import { GROUPS } from "@/lib/inventory";
import { getSnapshot, type Machine, type MachineState } from "@/lib/snapshot";

export const metadata: Metadata = { title: "Context · Indra" };

const label = "text-[10.5px] font-medium tracking-[0.06em] text-dim uppercase";

// Without skills there is nothing to "sync", so this shows reachability.
// Colours follow the spec's sync legend: in sync mint, asleep grey, not reached muted red.
const STATE = {
  online: { dot: "bg-online", word: "reachable" },
  asleep: { dot: "bg-dim", word: "asleep" },
  unknown: { dot: "bg-unreached", word: "not reached" },
} satisfies Record<MachineState, { dot: string; word: string }>;

function Cell({ m, now }: { m: Machine; now: string }) {
  const s = STATE[m.state];
  const detail =
    m.state === "online" ? "live now" : m.state === "asleep" ? (m.lastSeen ? `seen ${ago(m.lastSeen, now)}` : "stopped") : "no live source";
  return (
    <div className={`min-w-0 rounded-md border px-2.5 py-2 ${m.state === "online" ? "border-line" : "border-dashed border-line-subtle"}`}>
      <div className="flex items-center gap-1.5">
        <span className={`size-1.5 shrink-0 rounded-full ${s.dot}`} aria-hidden />
        <span className={`truncate text-[12.5px] ${m.state === "online" ? "text-fg" : "text-dim-2"}`}>{m.name}</span>
      </div>
      <div className="mt-0.5 truncate text-[11px] text-dim">
        {s.word} · {detail}
      </div>
    </div>
  );
}

async function Reachability() {
  await connection();
  const snap = await getSnapshot();
  const count = (state: MachineState) => snap.machines.filter((m) => m.state === state).length;

  return (
    <div className="rounded-xl border border-line p-4">
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className={label}>Machine reachability</span>
        <span className="ml-auto flex flex-wrap items-center gap-3 text-[11.5px] text-dim">
          {(["online", "asleep", "unknown"] as const).map((state) => (
            <span key={state} className="flex items-center gap-1.5">
              <span className={`size-1.5 rounded-full ${STATE[state].dot}`} aria-hidden />
              <span className="font-mono tabular">{count(state)}</span> {STATE[state].word}
            </span>
          ))}
        </span>
      </div>
      <div className="space-y-2">
        {GROUPS.map((group) => (
          <div key={group.id} className="grid gap-2 md:grid-cols-[120px_1fr] md:items-start">
            <div className="pt-2 text-[12px] text-dim-2">{group.label}</div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {snap.machines
                .filter((m) => m.group === group.id)
                .map((m) => (
                  <Cell key={m.id} m={m} now={snap.at} />
                ))}
            </div>
          </div>
        ))}
        <div className="grid gap-2 md:grid-cols-[120px_1fr] md:items-start">
          <div className="pt-2 text-[12px] text-dim-2">Sandboxes</div>
          <div className="rounded-md border border-dashed border-line-subtle px-2.5 py-2 text-[11.5px] text-dim sm:max-w-[calc(50%-4px)] xl:max-w-[calc(25%-6px)]">
            T3 Code · placeholder, not connected
          </div>
        </div>
      </div>
    </div>
  );
}

function TokenPreamble() {
  return (
    <section className="mt-10" aria-label="Session context size">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <div className={label}>Every session starts with</div>
          <div className="mt-1 font-mono text-[22px] text-dim-2 tabular">- tokens</div>
        </div>
        <div className="ml-auto text-right">
          <div className={label}>Read only when a task needs it</div>
          <div className="mt-1 font-mono text-[12px] text-dim tabular">- tokens</div>
        </div>
      </div>
      <div className="hatch mt-3 h-2.5 rounded-full" aria-hidden />
      <p className="mt-2 text-[12px] text-dim">
        Placeholder · no token source is connected. T3 Code does not report token counts yet, so nothing is shown
        rather than a guess.
      </p>
    </section>
  );
}

async function Instructions() {
  const items = await getInstructions();
  return (
    <section className="mt-10" aria-labelledby="instructions-title">
      <div className="flex items-baseline gap-3">
        <h2 id="instructions-title" className="text-[15px] font-medium text-fg">
          Instructions
        </h2>
        <span className="ml-auto text-[11.5px] text-dim">from instructions/ in the Indra repo</span>
      </div>
      <div className="mt-3 divide-y divide-line rounded-xl border border-line">
        {items.length === 0 && <div className="px-4 py-3 text-[12px] text-dim">No instruction files found.</div>}
        {items.map((item) => (
          <details key={item.slug} className="group/i">
            <summary className="flex h-11 cursor-pointer list-none items-center gap-2.5 px-4 hover:bg-raised [&::-webkit-details-marker]:hidden">
              <ChevronRight
                strokeWidth={1.5}
                className="size-3.5 text-dim transition-transform duration-150 group-open/i:rotate-90"
                aria-hidden
              />
              <span className="text-[13px] text-fg">{item.title}</span>
              <span className="font-mono text-[11px] text-dim tabular">~{item.tokens} tokens</span>
              <span className="ml-auto truncate text-[12px] text-dim">{item.scope}</span>
            </summary>
            <pre className="px-4 pt-1 pb-4 pl-10 font-sans text-[12.5px] leading-relaxed whitespace-pre-wrap text-dim-2">
              {item.body}
            </pre>
          </details>
        ))}
      </div>
    </section>
  );
}

export default function ContextPage() {
  return (
    <>
      <div className="flex items-center gap-3">
        <PageTitle>Context</PageTitle>
        <div className="ml-auto">
          <SyncNow />
        </div>
      </div>
      <p className="mt-3 text-[12.5px] text-dim">Showing reachability on All machines</p>
      <div className="mt-6">
        <Suspense fallback={<div className="h-[260px] rounded-xl border border-line" aria-busy />}>
          <Reachability />
        </Suspense>
      </div>
      <TokenPreamble />
      <Suspense fallback={null}>
        <Instructions />
      </Suspense>
    </>
  );
}
