import { Asterisk, ChevronDown, Sparkle } from "lucide-react";
import { PageTitle } from "@/components/page-title";

// Layout shell only. No usage API keys are connected, so every figure is an
// honest "not connected" rather than an invented number.
const PROVIDERS = [
  { name: "Claude", Icon: Asterisk },
  { name: "Google", Icon: Sparkle },
];

export function Subscriptions() {
  return (
    <section className="mt-20" aria-labelledby="subscriptions-title">
      <div className="flex flex-wrap items-end gap-3">
        <PageTitle as="h2" id="subscriptions-title">Subscriptions</PageTitle>
        <div className="ml-auto flex items-center gap-2 text-[12px] text-dim">
          <span className="flex h-7 items-center gap-2 rounded-full border border-line px-3" aria-disabled title="Not connected">
            <span className="relative h-3 w-5 rounded-full bg-line" aria-hidden>
              <span className="absolute top-0.5 left-0.5 size-2 rounded-full bg-dim" />
            </span>
            Fable limit
          </span>
          <span className="flex h-7 items-center gap-1.5 rounded-full border border-line px-3" aria-disabled title="Not connected">
            Last 7 days
            <ChevronDown strokeWidth={1.5} className="size-3.5" aria-hidden />
          </span>
        </div>
      </div>

      <p className="mt-3 text-[13px] text-dim">
        <span className="font-mono text-[22px] text-dim-2 tabular">$-</span> over last 7 days · placeholder, no usage
        API connected yet
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-line">
        <div className="grid md:grid-cols-2">
          {PROVIDERS.map(({ name, Icon }, i) => (
            <div key={name} className={i ? "border-t border-line md:border-t-0 md:border-l" : ""}>
              <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
                <Icon strokeWidth={1.5} className="size-4 text-dim-2" aria-hidden />
                <div>
                  <div className="text-[13px] font-medium text-fg">{name}</div>
                  <div className="text-[11.5px] text-dim">not connected</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="font-mono text-[13px] text-dim-2 tabular">$-</div>
                  <div className="text-[10.5px] text-dim">list price</div>
                </div>
              </div>
              <div className="flex h-[60px] items-center gap-2 px-4 text-[12px] text-dim">
                <span className="size-1.5 rounded-full bg-line" aria-hidden />
                No accounts. Add a read-only usage key to show {name} accounts here.
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center border-t border-line px-4 py-3">
          <span className="text-[13px] font-medium text-fg">Credits</span>
          <span className="ml-2 text-[11.5px] text-dim">pay as you go · not connected</span>
          <span className="ml-auto font-mono text-[12px] text-dim-2 tabular">$- left</span>
        </div>
        <div className="flex items-center gap-3 border-t border-line px-4 py-3 text-[12px] text-dim">
          <span className="hatch h-[3px] flex-1 rounded-full" aria-hidden />
          <span className="font-mono tabular">- left</span>
        </div>
      </div>
    </section>
  );
}
