const GIB = 1024 ** 3;

export function percent(fraction: number | undefined): string {
  return fraction === undefined ? "-" : `${Math.round(fraction * 100)}%`;
}

export function gib(bytes: number | undefined): string {
  if (!bytes) return "-";
  const value = bytes / GIB;
  return `${value >= 10 ? Math.round(value) : value.toFixed(1)} GiB`;
}

export function duration(seconds: number | undefined): string {
  if (!seconds || seconds < 0) return "-";
  const d = Math.floor(seconds / 86_400);
  const h = Math.floor((seconds % 86_400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d) return `${d}d ${h}h`;
  if (h) return `${h}h ${m}m`;
  return `${m}m`;
}

export function ago(iso: string | undefined, now: string): string {
  if (!iso) return "never seen";
  const seconds = Math.max(0, (Date.parse(now) - Date.parse(iso)) / 1000);
  if (seconds < 60) return "just now";
  return `${duration(seconds).split(" ")[0]} ago`;
}
