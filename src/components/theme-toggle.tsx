"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

type Choice = "light" | "dark" | "system";
const KEY = "indra-theme";
const listeners = new Set<() => void>();

function read(): Choice {
  try {
    const value = localStorage.getItem(KEY);
    return value === "dark" ? "dark" : "system";
  } catch {
    return "system";
  }
}

function write(choice: Choice) {
  try {
    localStorage.setItem(KEY, choice);
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Dark and system (system falls back to dark). Light stays disabled until a
// real light theme exists; an inverted dark theme would look wrong.
export function ThemeToggle() {
  const choice = useSyncExternalStore(subscribe, read, () => "system" as Choice);
  const options = [
    { value: "light" as const, label: "Light theme (not designed yet)", Icon: Sun, disabled: true },
    { value: "dark" as const, label: "Dark theme", Icon: Moon, disabled: false },
    { value: "system" as const, label: "Follow system", Icon: Monitor, disabled: false },
  ];

  return (
    <div role="radiogroup" aria-label="Theme" className="inline-flex">
      {options.map(({ value, label, Icon, disabled }, i) => {
        const selected = choice === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            disabled={disabled}
            onClick={() => write(value)}
            className={`grid size-[30px] place-items-center border border-line transition-colors duration-150 disabled:cursor-not-allowed ${
              i === 0 ? "rounded-l-md" : "-ml-px"
            } ${i === options.length - 1 ? "rounded-r-md" : ""} ${
              selected ? "text-fg" : "text-dim hover:text-dim-2"
            }`}
          >
            <Icon strokeWidth={1.5} className="size-3.5" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
