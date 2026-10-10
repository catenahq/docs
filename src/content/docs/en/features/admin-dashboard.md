---
title: "Admin dashboard"
description: "The catena-admin panel: status, apps, actions, restore, schedules, settings and, with a subscription, people and domains."
---

The admin dashboard is one panel for status, apps, backups, restores, schedules and settings. Staff see only the apps they may open; as an administrator, you get everything. It is served at `dash.yourdomain.com` once you apply a domain, and through the SSH forward before that (see [Installation](/en/installation/)). The panel is available in English and French, with light and dark themes.

## How it works

**Tabs by role.** Non-admins see only **Apps**, with tiles filtered to their groups. You also get **System**, **Actions**, **Restore**, **Schedules**, **Log** and **Settings**, plus the paid panels your subscription unlocks.

- **System.** Gauges for backup, disk, CPU, RAM and Healthchecks, active alerts, the status of the core services, the restart control and the Docker engine control. Proof tiles show whether a restore was tested, whether the offsite copy was verified, whether the backups pass an integrity check, the health of single sign-on, unexpected exposed ports, monitoring status, and critical and high vulnerabilities in running apps.
- **Apps.** One tile per routed app deployed in Portainer, with a status dot and badges such as **admin-only** or **public**. As an administrator, you also see, on the tile of each app that signs in by itself, a badge saying whether its sign-in is ready, waiting or failed, with the reason when it is not ready. Staff do not see it. See [Sign-in and people](/en/configuration/sign-in-and-people/).
- **Actions.** Buttons that run named operations on the server (backup now, list or browse snapshots, wiring for the catalog apps, restart the tunnel service or Portainer, disk breakdown, a full sync) with output streamed into a console.
- **Restore, Schedules, Log, Settings.** Restore from a backup, set when scheduled work runs, read the maintenance log, and edit every setting.

**Safe actions.** The panel container never edits the server directly. A button dispatches a named action to the host over SSH, and unknown names are rejected. Every action a button triggers is logged in the server's system journal.

**Paid panels.** Panels your subscription does not unlock appear greyed under **Catena Pro** or **Catena Business** and open an explainer with a link to the edition comparison. The panel stays refused until a key unlocks it.

**Banners.** Admin pages show a banner when a restart is pending, when no backup is configured, or when the paid features are locked. Applications and their data keep running in every case.

**Disaster-recovery keyset.** Hidden by default; the log records when you reveal it.

## What each edition adds

Community has Apps, System, Actions, Restore, Schedules, Log and Settings. Catena Pro adds **Managed updates**, **Domains**, **People**, **Migration** and **Restore report**. Catena Business adds **Audit log** and **Compliance report**. See the [edition comparison](https://catena.run/en/#pricing).

## Limits

- The panel is a closed-source image, published publicly; removing it leaves your apps and backups untouched.
- Renaming the panel's own subdomain moves it to a new address; the page opens there once the new address answers.
- Nothing in the panel shows an installed version next to an available one for every app; update results are in the **Log** tab.

## Configuration

- [Configuration overview](/en/configuration/)
- [Subscription](/en/configuration/subscription/)
- [Server settings](/en/configuration/server/)
- [Configure an app for Catena](/en/configure-apps/)
