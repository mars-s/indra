"use client";

import { Eye, FileText, KeyRound, Network, Server } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  online: number | undefined;
  total: number | undefined;
  unreached: number | undefined;
}

const row = "flex h-[34px] items-center gap-2.5 rounded-md px-2 text-[13px]";
const icon = "size-4 shrink-0";

export function NavLinks({ online, total, unreached }: Props) {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "All machines", Icon: Server, trailing: total === undefined ? "" : `${online}/${total}` },
    { label: "Previews", Icon: Eye },
    { label: "Proxy", Icon: Network },
    { href: "/context", label: "Context", Icon: FileText, trailing: unreached ? `${unreached} not reached` : "" },
    { label: "Secrets", Icon: KeyRound },
  ];

  return (
    <nav className="mt-[22px] space-y-px" aria-label="Main">
      {items.map(({ href, label, Icon, trailing }) => {
        if (!href) {
          return (
            <div key={label} className={`${row} text-dim/70`} title="Not built yet" aria-disabled>
              <Icon strokeWidth={1.5} className={icon} aria-hidden />
              {label}
            </div>
          );
        }
        const active = pathname === href;
        return (
          <Link
            key={label}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`${row} transition-colors duration-150 ${active ? "bg-raised text-fg" : "text-dim-2 hover:bg-raised hover:text-fg"}`}
          >
            <Icon strokeWidth={1.5} className={icon} aria-hidden />
            {label}
            {trailing ? <span className="ml-auto font-mono text-[11.5px] text-dim tabular">{trailing}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
