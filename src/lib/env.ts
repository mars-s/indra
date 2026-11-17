import "server-only";
import { readFileSync } from "node:fs";

// systemd loads /etc/indra/secrets.env through EnvironmentFile=. When Indra runs
// some other way (Docker with the file bind-mounted, `npm start` on the host),
// read the same file ourselves. Values already in the environment win.
const SECRETS_FILE = process.env.INDRA_SECRETS_FILE ?? "/etc/indra/secrets.env";

let loaded = false;

function loadSecretsFile() {
  if (loaded) return;
  loaded = true;
  let text: string;
  try {
    text = readFileSync(/*turbopackIgnore: true*/ SECRETS_FILE, "utf8");
  } catch {
    return;
  }
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    const value = line
      .slice(eq + 1)
      .trim()
      .replace(/^(["'])(.*)\1$/, "$2");
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

export function env(name: string): string | undefined {
  loadSecretsFile();
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}
