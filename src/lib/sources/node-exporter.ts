import "server-only";
import { describeError, request } from "./request";

export type ExporterResult =
  | {
      ok: true;
      cpu: number;
      mem: number;
      cores: number;
      memTotal: number;
      uptime: number;
      latencyMs: number;
    }
  | { ok: false; error: string };

interface Sample {
  idle: number;
  total: number;
  cores: number;
  memTotal: number;
  memAvailable: number;
  uptime: number;
  ms: number;
}

// CPU % needs two readings of the cumulative counters. Keep the last one per target.
const previous = new Map<string, Sample>();

const LINE = /^([a-zA-Z_:][\w:]*)(\{[^}]*\})?\s+(\S+)/;

function parse(text: string, ms: number): Sample {
  let idle = 0;
  let total = 0;
  const cpus = new Set<string>();
  const values: Record<string, number> = {};
  for (const line of text.split("\n")) {
    if (line.startsWith("#")) continue;
    const match = LINE.exec(line);
    if (!match) continue;
    const [, name, labels = "", raw] = match;
    const value = Number(raw);
    if (name === "node_cpu_seconds_total") {
      total += value;
      if (labels.includes('mode="idle"') || labels.includes('mode="iowait"')) idle += value;
      const cpu = /cpu="([^"]+)"/.exec(labels)?.[1];
      if (cpu) cpus.add(cpu);
    } else if (!labels) {
      values[name] = value;
    }
  }
  return {
    idle,
    total,
    cores: cpus.size,
    memTotal: values.node_memory_MemTotal_bytes ?? 0,
    memAvailable: values.node_memory_MemAvailable_bytes ?? 0,
    uptime: (values.node_time_seconds ?? 0) - (values.node_boot_time_seconds ?? 0),
    ms,
  };
}

async function scrape(url: string): Promise<Sample> {
  const res = await request(url, { timeoutMs: 3000 });
  if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  return parse(res.body, res.ms);
}

export async function getExporter(url: string): Promise<ExporterResult> {
  try {
    let before = previous.get(url);
    if (!before) {
      before = await scrape(url);
      await new Promise((r) => setTimeout(r, 1000));
    }
    const now = await scrape(url);
    previous.set(url, now);
    const dTotal = now.total - before.total;
    const cpu = dTotal > 0 ? 1 - (now.idle - before.idle) / dTotal : 0;
    return {
      ok: true,
      cpu: Math.min(1, Math.max(0, cpu)),
      mem: now.memTotal ? 1 - now.memAvailable / now.memTotal : 0,
      cores: now.cores,
      memTotal: now.memTotal,
      uptime: now.uptime,
      latencyMs: now.ms,
    };
  } catch (error) {
    return { ok: false, error: describeError(error) };
  }
}
