# Indra

Indra is a read-only homelab dashboard for Avi's machines and T3 Code environments. Named for the Hindu god whose net connects everything.

Next.js (App Router, TypeScript), Tailwind and shadcn. It shows live machine state and never changes anything on a host.

## Pages

- **Machines**: topology (tailnet laptops, the mars hub, the Pi, Proxmox guests, sandboxes) and a Subscriptions layout shell.
- **Context**: machine reachability, a token chart placeholder, and the instruction files in `instructions/`.

## Data sources

| Source | State | What it gives |
|---|---|---|
| Tailscale | live | online, last seen. Reads the local API socket, or `tailscale status --json`. |
| Proxmox VE API | live once a token is set | mars and every VM/LXC: status, CPU, memory, cores, uptime, hub CPU sparkline. |
| node_exporter | live | pluto (`:9100`): CPU, memory, cores, uptime, scrape latency. |
| ServerOS panel | placeholder | not connected |
| T3 Code environments | placeholder | not connected |
| Subscriptions, token usage | placeholder | no usage API keys yet |

Nothing is mocked. A machine no source can see shows "no data". Placeholders say so on screen. The source strip under the topology shows each source's state.

Sources are polled at most every 10 s on the server. The page refreshes every 30 s.

## Configuration

Secrets come from the environment. Under systemd that is `EnvironmentFile=/etc/indra/secrets.env`. Indra also reads that file itself if it exists and is readable (set `INDRA_SECRETS_FILE` to use another path). See `deploy/secrets.env.example` for every variable.

- `PROXMOX_HOST`, `PROXMOX_TOKEN_ID`, `PROXMOX_TOKEN_SECRET`, `PROXMOX_VERIFY_TLS`
- `NODE_EXPORTER_TARGETS` (optional, `id=url,id=url`)
- `TAILSCALE_SOCKET`, `TAILSCALE_BIN` (optional)

Make the Proxmox token read-only:

```sh
pveum user add indra@pve
pveum acl modify / --users indra@pve --roles PVEAuditor
pveum user token add indra@pve dashboard --privsep 0
```

The machine list and how each one maps to a source lives in `src/lib/inventory.ts`.

## Run locally

```sh
npm ci
npm run dev            # http://localhost:3000
```

Checks: `npm run lint`, `npx tsc --noEmit`, `npm run build`.

## Deploy to a small Debian LXC (systemd)

Plan: an onboot LXC on mars, joined to the tailnet. Indra binds to `127.0.0.1` and Tailscale Serve puts it on the tailnet. Never expose it publicly.

```sh
# on the LXC, as root
apt install -y nodejs npm tailscale     # Node 20.9+; tailscale from its apt repo
useradd --system --home /opt/indra indra
install -d -m 700 /etc/indra
install -m 600 deploy/secrets.env.example /etc/indra/secrets.env   # then fill it in

npm ci && npm run build
rm -rf /opt/indra && cp -r .next/standalone /opt/indra
cp -r .next/static /opt/indra/.next/static
install -d -o indra -g indra /opt/indra/.next/cache

cp deploy/indra.service /etc/systemd/system/
systemctl daemon-reload && systemctl enable --now indra
tailscale serve --bg 3000               # https://<lxc>.tuatara-mine.ts.net, tailnet only
```

## Docker

```sh
docker build -t indra .
docker run -d --name indra --network host --restart unless-stopped \
  -v /etc/indra/secrets.env:/etc/indra/secrets.env:ro \
  -v /var/run/tailscale/tailscaled.sock:/var/run/tailscale/tailscaled.sock \
  indra
```

`--network host` keeps the `127.0.0.1` bind on the host. To listen on the LAN or tailnet address instead, add `-e HOSTNAME=<that address>`.

## Design

The UI follows the measured spec in `docs/design-spec.md` at 1 CSS px = 2 source px (sidebar 256 px, corner 12 px, stage padding 76 px). The skills section is left out on purpose. Reference screenshots are not in this repo.

## Docs

- `docs/design-spec.md`: the measured UI spec
- `docs/plan.md`: research and build plan
