import { percent } from "@/lib/format";

// A tiny CPU/MEM meter. Empty (hatched stub, "-") when there is no reading.
export function Meter({ label, value }: { label: string; value: number | undefined }) {
  const danger = value !== undefined && value >= 0.9;
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-6 text-[9.5px] font-medium tracking-[0.06em] text-dim uppercase">{label}</span>
      <span className={`relative h-[3px] w-8 overflow-hidden rounded-full ${value === undefined ? "hatch" : "bg-line"}`}>
        {value !== undefined && (
          <span
            className={`absolute inset-y-0 left-0 rounded-full ${danger ? "bg-danger" : "bg-meter"}`}
            style={{ width: `${Math.max(2, Math.round(value * 100))}%` }}
          />
        )}
      </span>
      <span className="w-7 text-right font-mono text-[11px] text-dim-2 tabular">{percent(value)}</span>
    </div>
  );
}
