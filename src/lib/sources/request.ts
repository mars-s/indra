import "server-only";
import http from "node:http";
import https from "node:https";

export interface Response {
  status: number;
  body: string;
  ms: number;
}

interface Options {
  headers?: Record<string, string>;
  insecure?: boolean;
  socketPath?: string;
  timeoutMs?: number;
}

// node:http rather than fetch, so one call can skip TLS checks (Proxmox ships a
// self-signed cert) or talk over a unix socket (tailscaled) without a new dependency.
export function request(url: string, options: Options = {}): Promise<Response> {
  const { headers, insecure, socketPath, timeoutMs = 4000 } = options;
  const target = new URL(url);
  const client = target.protocol === "https:" ? https : http;
  const started = performance.now();

  return new Promise((resolve, reject) => {
    const req = client.request(
      target,
      {
        headers,
        socketPath,
        rejectUnauthorized: !insecure,
        timeout: timeoutMs,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () =>
          resolve({
            status: res.statusCode ?? 0,
            body: Buffer.concat(chunks).toString("utf8"),
            ms: Math.round(performance.now() - started),
          }),
        );
        res.on("error", reject);
      },
    );
    req.on("timeout", () => req.destroy(new Error(`timed out after ${timeoutMs} ms`)));
    req.on("error", reject);
    req.end();
  });
}

export function describeError(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as NodeJS.ErrnoException).code;
    return code ? `${code}: ${error.message}` : error.message;
  }
  return String(error);
}
