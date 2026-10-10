---
title: "Admin dashboard"
description: "The catena-admin panel: status, apps, actions, restore, schedules, settings and, with a subscription, people and domains."
---

The admin dashboard is one panel for status, apps, backups, restores, schedules and settings. Staff see only the apps they may open; as an administrator, you get everything. It is served at `dash.yourdomain.com` once you apply a domain, and through the SSH forward before that (see [Installation](/en/installation/)). The panel is available in English and French, with light and dark themes.

## How it works

**Tabs by role.** Non-admins see only **Apps**, with tiles filtered to their groups. You also get **System**, **App check**, **Actions**, **Restore**, **Schedules**, **Log** and **Settings**, plus the paid panels your subscription unlocks.

- **System.** Gauges for backup, disk, CPU, RAM and Healthchecks, active alerts, the status of the core services, the restart control and the Docker engine control. Proof tiles show whether a restore was tested, whether the offsite copy was verified, whether the backups pass an integrity check, the health of single sign-on, unexpected exposed ports, monitoring status, and critical and high vulnerabilities in running apps.
- **Apps.** One tile per routed app deployed in Portainer, with a status dot and badges such as **admin-only** or **public**. As an administrator, you also see, on the tile of each app that signs in by itself, a badge saying whether its sign-in is ready, waiting or failed, with the reason when it is not ready. Staff do not see it. You also see the version each app runs and, when a newer one exists, "Update available" with that version; the **System** tab shows the same for the server's own components and says when versions were last checked. On Catena Pro, a service its template keeps off the automatic updates shows a notice on the app's tile when a newer version exists (see [Services kept off the automatic updates](/en/configuration/updates/#services-kept-off-the-automatic-updates)). See [Sign in with Catena accounts](/en/configure-apps/#sign-in-with-catena-accounts-optional).
- **App check.** Paste an app's compose file to see its errors and warnings and get a corrected file before you deploy it; the **Apps** tab links each app's own findings here. See [Check an app with the panel](/en/configure-apps/#check-an-app-with-the-panel).
- **Actions.** Buttons that run named operations on the server (backup now, list or browse snapshots, wiring for the catalog apps, restart the tunnel service or Portainer, disk breakdown, a full sync) with output streamed into a console.
- **Restore, Schedules, Log, Settings.** Restore from a backup, set when scheduled work runs, read the maintenance log, and edit every setting.

**Safe actions.** The panel container never edits the server directly. A button dispatches a named action to the host over SSH, and unknown names are rejected. Every action a button triggers is logged in the server's system journal.

**Paid panels.** Panels your subscription does not unlock appear greyed under **Catena Pro** or **Catena Business** and open an explainer with a link to the edition comparison. The panel stays refused until a key unlocks it.

**Banners.** Admin pages show a banner when a restart is pending, when no backup is configured, or when the paid features are locked. Applications and their data keep running in every case.

**Disaster-recovery keyset.** Hidden by default; the log records when you reveal it.

## What each edition adds

Community has Apps, System, App check, Actions, Restore, Schedules, Log and Settings. Catena Pro adds **Managed updates**, **Domains**, **People**, **Migration** and **Restore report**. Catena Business adds **Audit log**, **Compliance report** and **Monthly report**. See the [edition comparison](https://catena.run/en/#pricing).

## Monthly report (Catena Business)

The **Monthly report** panel is one printable page that sums up what the server recorded about its own upkeep. It shows two periods: last calendar month, and the current month so far. Each period has these sections:

- **Backups**, **Restore tests** and **Updates** (applied, rolled back, restarts, and components with a newer version available).
- **Vulnerabilities**: critical and high ones with a published fix in the images that run on the server, at the start and end of the period, with how many were fixed and found.
- **Availability**: for each watched service, the share of the time it answered, how many times it stopped answering and for how long.
- **Alerts and warnings** raised by the job monitor and the maintenance log.

Every figure is read on the server, and nothing is sent elsewhere. All times are UTC. To keep a copy on paper or as a PDF, use your browser's print command.

A figure the server does not record is never estimated. It appears under **Not shown for this period** as not shown, with the reason (for example, "The maintenance log on this server goes back to `<date>`, so the backups, updates and warnings before that date are not shown."). The section **What this server does not record** lists what is never part of the report, such as operating-system updates and the result of each night's restore test.

## Compliance report (Catena Business)

The **Compliance report** maps your server's security and privacy controls to ISO/IEC 27001:2022, Quebec's Law 25, PIPEDA, the GDPR and SOC 2. SOC 2 is shown as a self-assessment: only an independent auditor issues a SOC 2 report. Pick a framework under **Frameworks** to see only its controls, with a **Summary** of the clauses they cover and how many you have attested.

Each control shows what the server measures for it as you open the page: the latest restore test, the backups kept, vulnerability counts, who can reach each application, whether a second factor is required at sign-in. A measurement older than its limit is marked out of date. For a control you own or share, press **Record the state of this control** and choose its state (**Met**, **In progress**, **Not met** or **Not applicable**), with a note, evidence files and an optional review date. A control Catena operates carries Catena's statement.

You can add your own controls under **Add a control**, mapped to the clauses they help satisfy, and keep evidence files under **Add a file**: PDF, PNG, JPEG, text, CSV, Office or OpenDocument, up to 10 MiB each, 500 files and 200 MiB in all. If your server runs the virus scanner that comes with the mail server or Nextcloud, each file is scanned before it is kept; otherwise the list says it was not scanned.

Nothing is edited or deleted: each change is one more record carrying the hash of the one before it, and a withdrawn file still downloads.

**Review timings.** An attestation is due for review 12 months after you record it, the latest backup is out of date after 7 days, and the drills and checks after 8 days. Press **Change the timings** to change them; the change is recorded like any other.

**Where the data is kept.** The page lists the storage your backups and offsite copies go to, read from your settings, and Catena's own subprocessors.

**Export.** **Download the records** saves every record and evidence file as one archive, on every edition. If your subscription ends, open **Compliance report** in the navigation to download them.

The page documents the infrastructure side. It does not replace your organization's privacy officer.

## Limits

- The panel is a closed-source image, published publicly; removing it leaves your apps and backups untouched.
- Renaming the panel's own subdomain moves it to a new address; the page opens there once the new address answers.
- Versions come from a periodic check. When it has not reported recently, no version is shown and the **System** tab says so. Update results are in the **Log** tab.

## Configuration

- [Configuration overview](/en/configuration/)
- [Subscription](/en/configuration/subscription/)
- [Server settings](/en/configuration/server/)
- [Configure an app for Catena](/en/configure-apps/)
