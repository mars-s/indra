# Homelab dashboard plan

Read-only research, 17 November 2026, Australia/Melbourne (UTC+11). Nothing was built or installed, and no host was changed. The Windows laptop was not opened over SSH. The Pi was identified from the LAN, Tailscale and a public node_exporter scrape; nobody logged into it. Chemwatch and Paperless projects were skipped and their thread content was not read.

The visual target is the strawhat UI in `/workspace/dashboard/design-spec.md`. Build that look, leave the skills section out, and fill it with Avi's machines and T3 environments.

## 1. Machine inventory

### First-class machines (9, plus this box)

These are the ones the dashboard should show as machines, grouped like strawhat's Tailnet / provider / sandbox split.

| Name | Kind | Status at 19:52 AEDT, 17 Nov 2026 | LAN | Tailscale | Notes |
|---|---|---|---|---|---|
| mars (`pve`) | Proxmox VE 9.2.26 host, Ryzen 5 3550H, 8 threads, 15.1 GiB RAM | Online, up 3d 10h 43m | 192.168.1.200 | 100.98.253.74 | Kernel 7.0.14-28-pve. Storage: local-lvm ~349 GiB (90 GiB free), root 94 GiB (13.5 GiB used). API on :8006. No node_exporter. |
| umbrel | VM 100, 4 cores, 2 GiB, 64G + 224G + T9 USB | Running, onboot | 192.168.1.132 | 100.89.186.35 | Umbrel UI on :80/:443. :8090 is qBittorrent WebUI, not Beszel. Do not treat this guest as disposable, and do not touch the ZFS/T9 stripe. |
| haos-17.2 | VM 101, 2 cores, 2 GiB, 32G | Running, onboot | 192.168.1.134 | `homeassistant` 100.86.149.112, **offline 17d** | Home Assistant OS, UI on :8123. QEMU guest agent is on. Tailscale client on the guest looks dead even though the VM is up. |
| jellyfin | LXC 110, 2 cores, 2 GiB, 16G, Debian | Running, onboot | 192.168.1.141 | (no tailnet node) | Media LXC, UI on :8096, VAAPI from the host GPU. Reach it via LAN or through mars. |
| nod | VM 121, 4 cores, 6 GiB, 64G | Running, onboot **off** | 192.168.1.211 | 100.86.219.49 | General-purpose guest, Docker bridges present. Common metric ports were closed from the LAN. A candidate host for the dashboard, but it will not come back after a host reboot unless onboot is turned on. |
| openbot | VM 120, 4 cores, 10 GiB, 32G | **Stopped**, onboot off | 192.168.1.210 (planned) | 100.72.165.19, last seen 3d ago | Show as asleep. Fate of this VM is still an open homelab question. |
| pluto | Raspberry Pi 5, 8 GB, 4 cores | Online | **192.168.1.120** (wlan0) | **100.101.119.88** (`pluto` / `pluto-1`) | See the Pi section below. Already has node_exporter and Grafana. |
| Avi's MacBook Pro | macOS, arm64 laptop | On the LAN; Tailscale **offline 3d** | 192.168.1.101 (hostname `Mac`) | 100.122.114.39, last seen 14 Nov 2026 12:17 AEDT | The T3 Code connector still reaches this machine, so T3 is not using Tailscale as its only path. |
| desktop-e97e1ea | Windows laptop, RTX 4060, 16 GB | Tailscale **offline 5h**; not on the LAN now | 192.168.1.131 when it is home | 100.115.204.41, last seen 17 Nov 2026 14:34 AEDT | Do not SSH in unless Avi asks. ComfyUI lives here. Status should come from Tailscale only. |
| grok-bot-vm-433157538 | Current Grok Bot box | Online | (cloud) | 100.75.241.44 | Useful as a "this agent" tile, not a homelab server. |

### The Raspberry Pi

Found on the LAN, not under a "raspberrypi" name.

- Hostname **pluto**, Tailscale DNS `pluto-1.tuatara-mine.ts.net`.
- LAN **192.168.1.120**, MAC `88:a2:9e:04:b2:29` on wlan0. OUI `88:A2:9E` is registered to Raspberry Pi (Trading) Ltd, so this is a Pi, not a generic ARM box.
- Wired eth0 (`88:a2:9e:04:b2:28`) is down. It is on Wi-Fi.
- Kernel `6.18.34+rpt-rpi-2712` (BCM2712, Pi 5), Debian 13 Trixie, aarch64.
- 4 CPUs, 7.87 GiB RAM (about 5.8 GiB free), root on `mmcblk0p2` ~58 GiB (about 36 GiB free).
- Last booted 16 July 2026 22:03 AEDT, up about 124 days at the time of the scrape.
- Already running **node_exporter 1.12.1** on :9100 (open, no auth from the tailnet) and **Grafana 13.1.1** on :3000 (redirects to `/login`; left alone).
- Docker, flannel, cni0 and several veths are up, so a Kubernetes node (almost certainly k3s) is still running here. There is also a `wt0` interface, consistent with NetBird, which Monash Automation has used elsewhere.

Older notes called this Pi "lilgooner". The live name is pluto. Nobody logged in; the facts above come from DHCP/mDNS, the MAC OUI, and the exporter's info metrics.

### Venus VPS

Not found. It is not on the tailnet and not on `192.168.1.0/24`. The only mention in memory is an older idea of putting a RustDesk server there. It should stay an open question for Avi rather than a guessed tile.

### Shared or stale tailnet nodes (do not treat as first-class unless Avi says so)

Online but not Avi-owned: `heimdall.shad-mohs.ts.net` (100.96.13.125, hostname `srv1087357`, user `kumarmid2005`). A work or friend's node that has landed on this tailnet. Leave it out of the default inventory.

Offline stale nodes, last seen days to months ago: `burrow`, `burrow-box`, `burrow-box-1`, `burrow-devbox` (old Grok Bot boxes), `botbox` (old nested sandbox), `celld`, `marstest`, `marstest-1`, `marstest2`, `marstest2-1`, `iphone172` (9d), `ipad-pro-11-4th-gen-wifi` (251d). Show these behind a "stale / other devices" disclosure, or not at all.

### Other LAN devices (do not inventory as machines)

The Belkin router `joyastpl` at 192.168.1.1, phones, an iPad, PS and Sony audio, Arlo, Hikvision, Brother printer, Philips lighting, Grandstream, a Dell "Desktop" at 192.168.1.140, and `ADN_Laptop` at 192.168.1.136. Family and IoT. Keep them off the Machines view unless Avi wants a separate "house network" list later.

### How the groups should map onto the strawhat topology

- **Home LAN / Proxmox**, with mars as the hub (or the dashboard itself as the hub once it exists). Children: umbrel, haos, jellyfin, nod, openbot (asleep).
- **Tailnet / laptops**: MacBook Pro, desktop-e97e1ea, this box, maybe the phone.
- **Edge / Pi**: pluto on its own, since it already has metrics and k3s.
- **Sandboxes**: T3 environments (see below). If Avi later has Modal, Instabox or other ephemeral boxes, they go here too.
- **VPS**: only if Venus (or another VPS) is identified.

## 2. T3 Code

The `user-t3-code` connector was used read-only. No session was created, sent to, or interrupted.

### What it can see today

Only **one environment**:

- Id `cb291737-89f7-49f3-ad77-794bbd2b8f6f`
- Label **Avi's MacBook Pro**
- Platform darwin / arm64 / laptop
- Server version `0.1.10-nightly.20261114.4669`

There is no list-environments tool on this connector. `t3_environment_read` returns this environment. Every thread link we saw is under the same id. If Avi has T3 installed on Windows, nod, or a cloud box, this connector cannot see those environments yet.

### Projects

27 projects are registered on that environment. **6 work projects tied to Chemwatch or Paperless were skipped and are not listed.** The other 21, by title only: lifeos, tanacraft, eunomia, fit3143, FIT3161, fit3178, Heimdall, court, discord-bot, Ares, dayweave, fihbih, finance_dashboard, nullspace, discordbot, instatic-source, No project (scratch), gaia, monocode, Omen, tome.

Available project fields: id, title, workspace path, git identity, scripts (most have a "One" script), created/updated timestamps. No CPU, RAM, token or cost fields.

### Threads and models

`t3_thread_list` reports **922 threads** on this environment. Only the first page of 100 was fetched, and work-project threads were not read. The list API does not return token usage or dollar cost. Fields we can show on a dashboard:

- status (`idle`, `preparing`, `queued`, `starting`, `running`, `waiting`, `completed`, `interrupted`, `failed`, `cancelled`, `rolled_back`)
- provider and model
- runtime and interaction mode
- created/updated, settled, snoozed
- whether it is a subagent, and pending background tasks (as a count, not the command text)
- linked PR counts (not the URLs of skipped work repos)

Providers the orchestrator currently exposes: Codex (`gpt-6.1-sol`, `gpt-6-astra`, `gpt-6.1-terra`, `gpt-6-luna`) and two Claude accounts (`claude-opus-5-5`, `claude-sonnet-5-5`, `claude-fable-5-2`, `claude-haiku-5-5`). Cursor, Grok, OpenCode, Antigravity, fx, Kiro, Muse and Pi are present but marked disabled.

### Honest limits

The connector is a good source for "is the Mac T3 environment up, what projects exist, how many threads are running or waiting, which model is in play". It is a poor source, today, for a strawhat-style spend chart or a list of every T3 environment Avi owns. Do not scrape skipped work threads for those charts.

## 3. ServerOS panel verdict

Repo: [github.com/serveroshq/panel](https://github.com/serveroshq/panel), licence **AGPL-3.0**, homepage serveros.com. Public for **eight days** (created 9 Nov 2026), already ~1100 stars, still being pushed today. The official image can also load a commercial `panel-ee` package.

**What it is.** A full control plane for Linux servers you already own: connect a machine, deploy apps and databases, backups, monitors, logs, workflows, teams, an API and an MCP server. Each machine runs **serverosd**, a daemon that opens an outbound connection to the panel on port 8443. You can self-host with Docker and a real domain, or use their hosted product.

**Stack.** PHP 8.3+ / Laravel 13, Inertia, Vue 3 (the bulk of the UI) plus some React, Tailwind CSS 4, Reka UI, Lucide, ECharts, Vite. SQLite works out of the box. Languages are roughly PHP 5.6M, Vue 2.9M, TypeScript 0.4M.

**How it gets data.** Not SSH from the panel, and not a scrape. The daemon is installed on each server and phones home. That is a real agent, with a big surface: deploys, consoles, database browsing, updates.

**UI.** Avi is right that it looks good. Recent work added a left sidebar, CPU charts, small CPU/disk meters in the machines table, a proper dark theme, and a phone layout. It is a clean ops console: top or side navigation, tables, meters, workspaces. It is **not** the strawhat look (no serif display face, no purple stage, no topology diagram, no subscriptions or T3 context). Borrowing "a sidebar and little meters" is fine as a mood note. Forking it will not get us a pixel match.

**Verdict: ignore it as a foundation.** Do not fork the panel, and do not install serverosd, for three reasons:

1. **Wrong product.** We need a private, read-mostly status board with a custom UI, plus (later) routing. ServerOS is a deploy/backup/workflow platform with teams, billing editions and an MCP. That is a platform project, not a dashboard.
2. **Wrong licence and age.** AGPL-3.0 on both panel and daemon means any networked modification has to be published. The repo is eight days old. A commercial edition sits beside the community one. Too much legal and churn risk for a homelab board.
3. **Wrong stack.** PHP/Laravel/Vue is not the TypeScript/Next.js app we would otherwise ship, and it fights a pixel-faithful strawhat rebuild.

Do not borrow the daemon "just for metrics" either. Pluto already has node_exporter, Proxmox already has an API, and Tailscale already has a status API. A second agent is extra moving parts.

## 4. Panel-to-data-source map

| UI panel | Best live source today | Gaps and notes |
|---|---|---|
| Shell footer: online / asleep counts, hub name, cores, uptime | Tailscale status (from the dashboard host) + Proxmox `/cluster/resources` for guests that have no tailnet node (jellyfin, and HAOS when its Tailscale client is down) | "Asleep" can mean TS offline, or a stopped VM. Show both. |
| Sidebar tree and All machines fraction | Same, grouped by site (LAN/Proxmox, tailnet laptops, Pi, T3 sandboxes) | Stale burrow/marstest nodes should be hidden by default. |
| Topology machine cards: CPU, MEM, cores, RAM, latency | **CPU/MEM/disk:** node_exporter where it exists (today: only pluto :9100). Proxmox API for mars and every guest (CPU, mem, disk, uptime, status) even without an exporter. Tailscale for online/offline and last seen. **Latency:** Tailscale ping or a periodic ICMP/TCP check from the dashboard host to each node. | Mac and Windows have no exporter. Use Tailscale (and, for the Mac, T3 environment_read as a liveness signal) until Avi agrees to an exporter. Do not SSH to the Windows laptop for this. |
| Hub sparkline | A short time series: either Prometheus/VictoriaMetrics scraping exporters, or Proxmox RRD (`pvesh get /nodes/pve/rrddata`) for the host and guests | Pluto's Grafana may already have history, but the dashboard should not depend on the Pi being up. Keep a small local series store next to the app. |
| Sandboxes | T3 environment + project + thread-status counts | Only one environment is visible. Token figures are not in the connector. Empty state until that changes. |
| Context: machine sync topology | Tailscale + T3 `t3_environment_read` / last thread `updatedAt` as "last seen" | This is not strawhat skill sync. Relabel it honestly (reachability, last T3 activity). |
| Context: token preamble chart | No good source yet | Claude and OpenAI usage APIs, or T3 if they later expose tokens. Until then, keep the layout and show "no usage data". |
| Context: instructions | T3 environment preferences (`customInstructions`), plus a short dashboard runbook if Avi wants one | Do not invent a skill pack manager. |
| Subscriptions: Claude / Google / DeepSeek / credits | Official usage APIs where they exist, with keys Avi provides: Anthropic/Claude console usage, OpenAI usage, Google AI Studio or Cloud billing, DeepSeek platform balance | Many of these APIs are awkward or incomplete, and we do not have keys. Ship the Machines view first. Do not scrape billing inboxes. |
| Previews, Proxy, Secrets sidebar items | Out of scope for stage one | Leave the nav slots, disabled or hidden, so the shell still matches. |

### Existing agents (do not invent a new one)

- **pluto:** node_exporter 1.12.1 and Grafana 13.1.1. This is the pattern to copy.
- **mars and all other guests:** no node_exporter, no Beszel, no Glances, no Netdata, no Prometheus on the host. Umbrel :8090 is qBittorrent.
- **Historical note:** Beszel and Homarr once sat on an older Caddy setup around the previous laptop. They are not on these hosts now.

Recommendation: **node_exporter on each Linux box** (mars, umbrel, nod, jellyfin, and HAOS if a supervised add-on is acceptable), scrape from a tiny Prometheus or VictoriaMetrics on the dashboard host, and use Proxmox + Tailscale as the always-on fallback. windows_exporter and a Mac collector only if Avi wants laptop meters later. Do not install Grafana a second time; the app can draw the strawhat sparklines itself. Do not install Beszel unless Avi prefers a ready-made agent over exporters, and even then it would feed the strawhat UI, not replace it.

node_exporter on pluto is currently open on the tailnet with no auth. That is fine only while it stays on the tailnet. The dashboard scrape should use the tailnet or LAN, never the public internet, and we should ask Avi before locking that port down with a firewall or a slightly more locked exporter.

## 5. Architecture

Keep it small.

**Stack.** TypeScript, Next.js (App Router), Tailwind CSS, shadcn/ui as a primitive kit, then custom components that follow `/workspace/dashboard/design-spec.md`. The strawhat shell, topology and meters will be custom; shadcn is for buttons, dropdowns, dialogs and the bits that do not need to be pixel-identical. A little SQLite or a single VictoriaMetrics container for scrapes and history. No Kubernetes for this app, even though the Pi already has a cluster.

**Where to host it.** A **new small LXC on mars**, Debian, 1 to 2 vCPU, 1 to 2 GiB RAM, onboot on, Tailscale joined, listening only on the tailnet (Tailscale Serve, or a bind to the 100.x address). Give it a name such as `dash.tuatara-mine.ts.net`. Do not put it on the public internet, and do not put it on umbrel.

Why not VM 121 (nod)? Nod already has Docker and spare RAM, so it would work, but onboot is off, its role is general-purpose, and we have been treating its future as unsettled. A tiny LXC keeps this off nod and off umbrel, and it will come back after a mars reboot. Creating that LXC needs Avi's say-so.

**How metrics are collected.** A 30 to 60 second scrape loop on the dashboard host:

1. `tailscale status --json` (and optionally the Tailscale API if we want last-seen history after a restart).
2. Proxmox API with a **new read-only** token (PVEAuditor, or a tighter ACL). No root password in the app.
3. HTTP scrape of node_exporter on pluto, then on any other host Avi agrees to instrument.
4. T3 connector or a later T3 API, from a small server-side job, never from the browser.
5. Subscription APIs, only after keys exist.

No custom agent. No ServerOS daemon. No SSH fan-out from the app for metrics (SSH to mars is fine for one-off work, not for the 30 second loop).

**Secrets.** A root-owned file on the LXC, mode 0600, loaded by systemd (`EnvironmentFile=` or systemd credentials). Something like `/etc/dashboard/secrets.env`. Contents would be the Proxmox token, an optional Tailscale API token, and later any usage-API keys. Not in git, not in the Next.js client bundle, not in chat. If the app grows, wrap the file with age or sops, but a 0600 env file is enough for stage one.

**Auth.** Tailscale identity is enough at first (if you can reach the hostname, you are on Avi's tailnet). Add a simple login only if the board is ever exposed more widely.

**Routing, later.** Once the board shows reliable live state, a second phase can pick a machine or T3 environment for a job (for example "run this on nod if it is up, otherwise the Mac"). That is a small policy layer on top of the same data, not a workflow engine.

## 6. Phased build

Do not start until Avi answers the questions in section 7, or at least the hosting one.

1. **Pixel shell, fake data.** Next.js app that matches the Machines screen (sidebar, topology, subscriptions layout) against the PNGs using the overlay checklist in the design spec. Context page with sync topology, token chart and instructions only. No skills. No live data. This is the part that will eat the most care, and it should be done first so we are not restyling a working API later.
2. **Live machines.** Wire Tailscale + Proxmox, and pluto's existing exporter. Guests without an exporter still show CPU/MEM from `pvesh`. Laptop tiles show online/asleep from Tailscale only.
3. **Exporters, with approval.** node_exporter on mars, nod, umbrel and jellyfin (and HAOS if agreed). Local Prometheus or VictoriaMetrics, and real sparklines.
4. **T3 sandboxes.** Environment, project list (work projects omitted or behind a toggle), thread status counts. Honest empty states for tokens.
5. **Subscriptions.** Only if Avi wants that panel live and will provide keys. Otherwise leave the layout as a static shell or hide it.
6. **Routing.** After the board has been accurate for a while, add a way for this agent to pick a target machine or T3 environment.

## 7. Open questions for Avi

1. **Where should it run?** Recommended: a new onboot LXC on mars, tailnet only. Alternative: nod (VM 121), if you would rather not add a guest. Creating either needs your go-ahead.
2. **What should the Context tab be, without skills?** Recommended: machine reachability / last-seen, a token chart only once we have a real source, and an instructions list. Alternative: drop the Context tab entirely until T3 usage data exists.
3. **Which subscription accounts belong on the board, and will you provide read-only API keys?** Claude, Google, DeepSeek and any others. Without keys this panel stays a layout mock.
4. May I install node_exporter on mars, nod, umbrel and jellyfin (read-only, tailnet/LAN scrape only)?
5. Where is the Venus VPS, if it is still in play (provider, hostname or IP, and whether it should appear)?
6. Should stale tailnet nodes (old burrow boxes, marstest, the shared Heimdall node, the ancient iPad) be hidden, or listed under a stale group?
7. A name for the board, since "strawhat" is the reference product's brand, not ours.
8. HAOS is up on the LAN but its Tailscale node has been offline for 17 days. Worth fixing later, not in this build, unless you want it on the tailnet view now.

## 8. What I did not do

- No builds, installs, firewall changes, or guests created.
- No SSH to the Windows laptop, the Pi, umbrel, nod, or HAOS.
- No login to Grafana, Umbrel, or qBittorrent.
- No reads of Chemwatch or Paperless thread content.
- No secrets printed, and no SSH keys copied out of Proxmox configs.
