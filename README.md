# Indra

Indra is a read-only homelab dashboard and routing hub for Avi's machines and T3 Code environments. Named for the Hindu god whose net connects everything.

It is a Next.js (App Router, TypeScript) app with Tailwind and shadcn. It shows live machine state (Tailscale, the Proxmox API, node_exporter and other exporters) and the T3 Code environment list, and will later route jobs to a chosen machine or environment.

## Status

Scaffold and spec. The dashboard UI and data wiring are built in a tracked thread; see the open pull request.

## Data sources

- Tailscale local API / CLI (device status, last seen)
- Proxmox VE API, read-only PVEAuditor token from the environment
- node_exporter (pluto :9100 and others)
- ServerOS panel API, where available
- T3 Code environment list, where available

All credentials come from a root-owned 0600 env file on the host (see docs). Nothing public: binds to the tailnet or LAN only.

## Docs

- `docs/design-spec.md` - the measured UI spec
- `docs/plan.md` - research and build plan
