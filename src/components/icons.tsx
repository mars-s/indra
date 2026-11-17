import { Box, Container, Cpu, Laptop, Monitor, Server, type LucideProps } from "lucide-react";
import type { MachineKind } from "@/lib/inventory";

const KIND_ICONS = {
  host: Server,
  vm: Box,
  lxc: Container,
  pi: Cpu,
  laptop: Laptop,
  desktop: Monitor,
} satisfies Record<MachineKind, unknown>;

export function KindIcon({ kind, ...props }: { kind: MachineKind } & LucideProps) {
  const Icon = KIND_ICONS[kind];
  return <Icon strokeWidth={1.5} aria-hidden {...props} />;
}

// Indra's mark: a knot of the net, three rings over a dot. Our own, not the reference brand.
export function IndraMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="11" fill="#e9e7f2" />
      <g fill="none" stroke="#0e0e10" strokeWidth="1.3">
        <circle cx="12" cy="9" r="4" />
        <circle cx="9" cy="14" r="4" />
        <circle cx="15" cy="14" r="4" />
      </g>
      <circle cx="12" cy="12.3" r="1.2" fill="#0e0e10" />
    </svg>
  );
}

// Two-by-two dot glyph used for tailnet group headers.
export function TailnetGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 10 10" className={className} aria-hidden>
      {[2, 8].flatMap((x) => [2, 8].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.4" fill="currentColor" />))}
    </svg>
  );
}
