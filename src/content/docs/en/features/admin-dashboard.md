---
title: "Admin dashboard"
description: "The catena-admin panel: status, apps, actions, restore, schedules, settings and, with a subscription, people and domains."
---

The admin dashboard is one panel for status, apps, backups, restores, schedules and settings. Staff see only the apps they may open; as an administrator, you get everything. It is served at `dash.yourdomain.com` once you apply a domain, and through the SSH forward before that (see [Installation](/en/installation/)). The panel is available in English and French, with light and dark themes.

## How it works

**Tabs by role.** The menu is in a dark sidebar at the left; on a narrow screen, a button at the top opens it. Non-admins see only **Apps**, with tiles filtered to their groups. You also get **System**, **Actions**, **Restore**, **Schedules**, **Log** and **Settings**, plus the paid panels your subscription unlocks.

- **System.** A grid of cards, all read from the server itself. **Backup** shows the size, the snapshot count and the integrity line (it says verified only for a check of the repository backups go to now, and says the destination changed until the check has run on the new one). **Resources** shows disk, memory and processor as three big numbers of one size; the processor reads the load over the last minute as a percentage of its cores, with the load and the core count beneath. **Scheduled jobs** counts the jobs that reported in and names each one, with a dot and a link to where it is set; a job that has not reported yet reads with a grey dot. Three proof cards show whether a restore was tested, whether the offsite copy was verified, and the health of single sign-on with the unexpected exposed ports. **Monitoring** counts the services that answer and names each one that is down. **Known vulnerabilities** counts the applications to update, with a button to **Apps** and the link to every vulnerability (see [Known vulnerabilities card](/en/configuration/vulnerabilities/#known-vulnerabilities-card)). **Alerts** lists what Healthchecks is warning about now, or "No alert". The titles of **Resources**, **Scheduled jobs**, **Monitoring** and **Alerts** open Beszel, Healthchecks and Gatus in a new tab. **Scheduled jobs** and **Monitoring** each carry a dot: green when everything measured is fine, red when a job failed or is late or a service is down, grey when nothing is measured. A vulnerability alert is neither a failed job nor a service down: the vulnerability card has it. Below the cards are the restart control and, when files that decide who reaches the server have changed, the list of those files. Docker follows the Catena release (see [Docker engine](/en/configuration/updates/#docker-engine)).
- **Apps.** One tile per routed app, with a status dot. As an administrator, you also see badges such as **admin-only** or **public**, **Accounts only** instead of **public** for an app whose address is open but whose own sign-in admits only Catena accounts, and, on the tile of each app that signs in by itself, a badge saying whether its sign-in is ready, waiting or failed, with the reason when it is not ready. Staff see no badge: only an administrator can change who reaches an app. From a deploy, an update or a restore until the app answers its ready question or its time to answer passes, the status dot of its tile reads **Starting** for everyone who sees the tile, and as an administrator you also see **Starting** on its page (see [Declare the backup mode and update steps](/en/configure-apps/#declare-the-backup-mode-and-update-steps-optional)). You also see the version each app runs and, when a newer one exists, "Update available" with that version. On Catena Pro, a service its template keeps off the automatic updates shows a notice on the app's tile when a newer version exists (see [Services kept off the automatic updates](/en/configuration/updates/#services-kept-off-the-automatic-updates)). See [Sign in with Catena accounts](/en/configure-apps/#sign-in-with-catena-accounts-optional). Each app is one card. Its logo, the app's first letter when it has none, opens the app, and the card holds the app's description. In the **Catena services** group, the cards of Keycloak, Gatus, Healthchecks and Beszel show each project's own logo. As an administrator, you also see on a card a line about the vulnerabilities of the version it runs: an **Exploited** badge when attackers exploit one, "Vulnerability in this version.", then "Update to fix." or "No fix published yet." (see [Vulnerabilities page](/en/configuration/vulnerabilities/#vulnerabilities-page)). A gear on the card of each app added from a repository opens the app's own page, with its **Overview** (which says where the app keeps its files and ends with **Start, stop and delete**, where you also delete the app with its data), **Settings** (the app's settings file in one text editor, opened on request and recorded, with every value shown and the compose file read-only, and a **Back up now** button), **Vulnerabilities** and **Update** (the version the app runs and the one an update moves it to, on every edition) (see [Settings, start, stop and delete](/en/configure-apps/#settings-start-stop-and-delete)). An app that runs nothing has a card too, for an administrator only: its logo is not a link, and the card says **Not started** for an app added and never started, or **Stopped**. The buttons above the cards, **Add an application** and **Compose checker**, open the page that adds an app from a repository and edits the list of repositories, where the services Catena did not add are also listed under **Outside Catena** (see [Add an app from a repository](/en/configure-apps/#add-an-app-from-a-repository)), and the compose checker.
- **Compose checker.** Under **Apps**, last in the **On this page** card. Paste an app's compose file to see its errors and warnings and get a corrected file before you deploy it; the tiles of the **Apps** tab link each app's own findings here. See [Check an app with the panel](/en/configure-apps/#check-an-app-with-the-panel).
- **Actions.** Buttons that run named operations on the server (backup now, list or browse snapshots, wiring for the catalog apps, restart the tunnel service, disk breakdown, a full sync) with output streamed into a console.
- **Restore, Schedules, Log, Settings.** Restore from a backup, set when scheduled work runs (the **On this page** card lists the checker, each job and the backups kept, with a badge on each job that is on, locked, slower than saved or refused), read the maintenance log, and edit every setting.

**Safe actions.** The panel container never edits the server directly. A button dispatches a named action to the host over SSH, and unknown names are rejected. Every action a button triggers is logged in the server's system journal.

**Paid panels.** Panels your subscription does not unlock appear greyed under **Catena Pro** or **Catena Business** and open an explainer with a link to the edition comparison. The panel stays refused until a key unlocks it.

**Banners.** Admin pages show a banner when a restart is pending, when no backup is configured, or when the paid features are locked. Applications and their data keep running in every case.

**Disaster-recovery keyset.** Hidden by default; the log records when you reveal it.

## What each edition adds

Community has Apps (with the Compose checker), System, Actions, Restore, Schedules (the weekly backup and the vulnerability watch), Log, Settings and the Vulnerabilities page (see [Vulnerabilities page](/en/configuration/vulnerabilities/#vulnerabilities-page)). Catena Pro adds **Managed updates**, **Domains**, **People**, **Migration** and **Restore report**. Catena Business adds **Audit log**, **Compliance report** and **Monthly report**. See the [edition comparison](https://catena.run/en/#pricing).

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

You can add your own controls under **Add a control**, mapped to the clauses they help satisfy, and keep evidence files under **Add a file**: PDF, PNG, JPEG, text, CSV, Office or OpenDocument, up to 10 MiB each, 500 files and 200 MiB in all. If your server runs the ClamAV antivirus app from the catalog, each file is scanned before it is kept, and refused when ClamAV is not the catalog's unchanged version, when another antivirus app is installed beside it, or when it is not running and able to scan the file. If no antivirus app is installed, the list says the file was not scanned.

Nothing is edited or deleted: each change is one more record carrying the hash of the one before it, and a withdrawn file still downloads.

**Review timings.** An attestation is due for review 12 months after you record it, the latest backup is out of date after 7 days, and the drills and checks after 8 days. Press **Change the timings** to change them; the change is recorded like any other.

**Where the data is kept.** The page lists the storage your backups and offsite copies go to, read from your settings, and Catena's own subprocessors.

**Export.** **Download the records** saves every record and evidence file as one archive, on every edition. If your subscription ends, open **Compliance report** in the navigation to download them.

The page documents the infrastructure side. It does not replace your organization's privacy officer.

## Limits

- The panel is a closed-source image, published publicly; removing it leaves your apps and backups untouched.
- Renaming the panel's own subdomain moves it to a new address; the page opens there once the new address answers.
- Versions come from a periodic check. When it has not reported recently, no version is shown. Update results are in the **Log** tab.

## Configuration

- [Configuration overview](/en/configuration/)
- [Subscription](/en/configuration/subscription/)
- [Server settings](/en/configuration/server/)
- [Configure an app for Catena](/en/configure-apps/)
