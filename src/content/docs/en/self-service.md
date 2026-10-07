---
title: "Self-service -- web UI vs the shell"
description: "Rule of thumb: anything the web UIs expose is a browser task. The rest goes over Tailscale SSH access or the installer."
---

Rule of thumb: anything the web UIs expose is a browser task.
Everything else goes over Tailscale SSH access to the box, or through
the installer (`uvx catena-installer`). Either way nothing here
requires anyone else.

## Browser tasks

- **Add / remove staff accounts:** Keycloak UI
  (`auth.yourdomain.com`). Includes password resets, MFA enrollment,
  and group membership for per-department app access.
- **Deploy new apps from the vetted catalog:** Portainer UI
  (`portainer.yourdomain.com`). Pick a template, set the per-department
  group label, deploy. SSO is wired automatically.
- **Check service health:** Gatus (`monitor.yourdomain.com`) for the
  external probe view, the dashboard (`dash.yourdomain.com`) for the
  per-app status tiles.
- **Trigger one-off backups, view backup history:** the **Actions**
  tab of the dashboard (`dash.yourdomain.com`).
- **See what is alerting:** Healthchecks (`heartbeat.yourdomain.com`)
  shows the dead-man state of every scheduled job.
- **Manage app-level settings:** anything inside Nextcloud,
  Rocket.Chat, EspoCRM, and the rest -- each app's own admin UI covers
  its own settings.
- **Replace the Cloudflare tunnel or re-join Tailscale:** after
  regenerating the credential in the provider console, press **Apply**
  under catena-admin **Settings -> Domain** for the tunnel; for
  Tailscale, save the new credential in **Settings** and press
  **Re-join the private network**.
- **Re-apply the configuration** after a settings change: **Bring this
  server up to date** in catena-admin **Settings**.

## Over the shell or the installer

These need a shell on the box (SSH in over Tailscale) or the installer
(`uvx catena-installer`, which needs only uv and an SSH key on the
computer):

- **Rebuild a lost server** -- the installer on a fresh server,
  then the Restore page's **Another server's backups** view with the
  recovery keyset. See
  [Rebuilding a server from backup](/en/self-restore/). Putting the
  data back on a server that is still running is a browser task: the
  admin panel's **Restore** page. See
  [Restoring data from the admin panel](/en/restore-data/).
- **Migrate to a different VPS provider** -- the installer at
  the new provider, then restore from the old server's backups with the
  recovery keyset.
- **Re-apply the whole install** -- rerun
  `uvx catena-installer install --inventory <name>`, which is safe to
  rerun.
- Major-version upgrades of core services, custom (non-catalog)
  templates, or anything that edits a file on the host directly.

When it is unclear which side a task falls on, the web UI is the place
to start; the shell is the fallback for the few things it does not
cover. A hand with any of it is available from the Catena contact --
an option, not a requirement.
