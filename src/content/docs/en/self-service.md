---
title: "Self-service -- what you can do without the operator"
description: "Rule of thumb: anything the web UIs expose, you can do yourself. Anything that requires SSH + sudo goes through the operator."
---

Rule of thumb: anything the web UIs expose, you can do yourself.
Anything that requires SSH + sudo goes through the operator.

## Yes, do this yourself

- **Add / remove staff accounts:** Keycloak UI
  (`auth.yourdomain.com`). Includes password resets, MFA enrollment,
  and group membership for per-department app access.
- **Deploy new apps from the vetted catalog:** Portainer UI
  (`portainer.yourdomain.com`). Pick a template, set the per-department
  group label, deploy. SSO is wired automatically.
- **Check service health:** Gatus (`monitor.yourdomain.com`) for the
  external probe view, Homepage (`dash.yourdomain.com`) for the
  per-app status tiles.
- **Trigger one-off backups, view backup history:** OliveTin
  (`actions.yourdomain.com`).
- **See what's alerting:** Healthchecks (`checks.yourdomain.com`)
  shows the dead-man state of every scheduled job.
- **Manage app-level settings:** anything inside Nextcloud,
  Rocket.Chat, EspoCRM, etc. -- the apps' own admin UIs are yours.

## Ask the operator

- Upgrading Keycloak / Portainer / Postgres major versions.
- Changing the Cloudflare Tunnel or DNS topology.
- Restoring from backup (destructive; must be done with the VPS in a
  quiesced state).
- Migrating to a different VPS provider.
- Adding a custom (non-vetted) template, or anything outside the
  app catalog.
- Anything that needs SSH or sudo.

If you are not sure which side of the line a task falls on, ask
first. Most things lean self-service; the few that don't are
clearly destructive or cross-cutting.
