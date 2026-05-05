---
title: "Self-service — what you can do without the operator"
description: "TODO. Rule of thumb: anything the UIs expose, you can do. Anything that"
---

TODO. Rule of thumb: anything the UIs expose, you can do. Anything that
requires SSH + sudo needs the operator.

## Yes, do this yourself

- Add / remove staff accounts: Keycloak UI (`auth.yourdomain.com`)
- Deploy new apps: Dokploy UI (`admin.yourdomain.com`)
- Check service health: Gatus (`monitor.yourdomain.com`) or
  Homepage (`dash.yourdomain.com`)
- Trigger one-off backups, view backup history: OliveTin
  (`actions.yourdomain.com`)
- See what's alerting: Healthchecks (`checks.yourdomain.com`)

## Ask the operator

- Upgrading Keycloak / Dokploy / Postgres major versions
- Changing the CF Tunnel / DNS topology
- Restoring from backup (destructive; must be done with VPS in
  quiesced state)
- Migrating to a different VPS provider
- Anything involving SSH

Full self-service guide with screenshots goes here.
