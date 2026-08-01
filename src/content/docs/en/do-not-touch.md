---
title: "Files that must not be edited"
description: "The VPS owns the whole machine and keeps itself configured. The one rule: nothing on the server is hand-edited."
---

The VPS is managed end to end. It owns the whole machine and keeps its
own configuration in sync, so there is really just one rule:

**Nothing on the server itself is hand-edited.** A change made
directly on the machine is overwritten the next time the system
reconciles itself (the weekly update run, or the next `catena
converge`), and it can break automatic recovery. There is almost
certainly a supported way to make the change stick -- a compose label,
a setting in the catena-admin panel, or an entry in the
configuration -- and that is the way to make it.

Everything actually needed is exposed through the web UIs, and those
are free to change:

- Apps deployed through [Portainer](/en/manage-apps/).
- Users, roles, and groups in
  [Keycloak](/en/manage-users-and-roles/).
- Notification channels in Healthchecks, dashboard tiles, and the
  other in-app settings.

An SSH session opened to hand-edit a file on the server is the signal
to stop: the same outcome reached through a compose label or the
catena-admin panel survives the next reconcile.
