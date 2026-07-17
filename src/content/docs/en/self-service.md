---
title: "Self-service -- web UI vs the shell"
description: "Rule of thumb: anything the web UIs expose, you do in a browser. The rest you do over your Tailscale SSH access or with the catena CLI."
---

Rule of thumb: anything the web UIs expose, you do in a browser.
Everything else you do over your Tailscale SSH access to the box, or
with the `catena` CLI from your Catena checkout. Either way it is
yours to run -- nothing here requires anyone else.

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

## Over the shell or the `catena` CLI

These need a shell on the box (SSH in over Tailscale) or the `catena`
CLI run from your Catena checkout:

- **Restore from backup** -- `catena restore` in place, or
  `catena recover` onto a fresh server. See
  [Rebuilding your server from backup](/en/self-restore/).
- **Migrate to a different VPS provider** -- `catena recover` at the
  new provider, using your recovery keyset.
- **Rotate the Cloudflare tunnel or Tailscale access** -- regenerate
  the credential in the provider console, then `catena rotate-tunnel`
  / `catena rotate-tailscale`.
- **Re-apply configuration** after a settings change -- `catena
  converge`.
- Major-version upgrades of core services, custom (non-catalog)
  templates, or anything that edits a file on the host directly.

If you are not sure which side a task falls on, start with the web
UI; the shell is the fallback for the few things it doesn't cover.
Prefer a hand with any of it? Reach your Catena contact -- it is an
option, not a requirement.
