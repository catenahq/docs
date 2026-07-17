---
title: "Files you should not touch"
description: "The VPS owns the whole machine and keeps itself configured. The one rule: don't hand-edit the server directly."
---

The VPS is managed end to end. It owns the whole machine and keeps its
own configuration in sync, so there is really just one rule:

**Don't hand-edit anything on the server itself.** Any change you make
directly on the machine gets overwritten the next time the system
reconciles itself (the weekly update run, or the next `catena
converge`), and it can break automatic recovery. There is almost
certainly a supported way to make the change stick -- a compose label,
a setting in the catena-admin panel, or an entry in your
configuration -- so use that instead.

Everything you actually need is exposed through the web UIs, and those
are yours to change freely:

- Apps you deploy through [Portainer](/en/manage-apps/).
- Users, roles, and groups in
  [Keycloak](/en/manage-users-and-roles/).
- Notification channels in Healthchecks, dashboard tiles, and the
  other in-app settings.

If you find yourself opening an SSH session to hand-edit a file on the
server, stop: reach the same outcome through a compose label or the
catena-admin panel so the change survives the next reconcile.
