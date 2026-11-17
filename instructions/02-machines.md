---
title: Machines
scope: how each machine is watched
---
- mars (Proxmox host) and its guests: the Proxmox API with a read-only PVEAuditor token.
- pluto (Raspberry Pi 5): node_exporter on port 9100, plus Tailscale.
- Laptops (MacBook Pro, desktop-e97e1ea): Tailscale status only.
- nod has onboot off. It will not come back after a mars reboot on its own.
- openbot is stopped on purpose. Show it as asleep.
