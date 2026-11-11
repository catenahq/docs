---
title: "Safe updates"
description: "How the operating system, apps, the panel and the Docker engine are kept current, with checks before and rollback after each change."
---

The operating system patches itself on every edition. Apps and Catena's own services update on a schedule, behind a backup and health checks, and roll back by themselves when the server gets less healthy.

## Operating system

Debian's unattended upgrades is the only thing that applies OS packages: security updates, stable updates and point releases. The server never restarts on its own initiative. An hourly check reads whether a restart is needed, and a banner on every admin page says so. The restart is your decision, taken from **System** > **Restart** (**Restart this server**), or by the maintenance, which restarts only as its last step, only when one is due and only when that schedule is on.

## Maintenance

On Catena Pro and Catena Business, **Schedules** > **Maintenance** (off by default, 03:00 when turned on) runs its steps in order: a free-disk check, a backup, a restore check, a check of the backup repository, the offsite copy, a Gatus health gate, container updates, a vulnerability scan, the Docker engine upgrade and the restart if due. The maintenance stops before any update when the disk floor, the backup, its verification or the health gate fails, and it resumes after a reboot. Without a configured backup, updates still run and a warning banner says there is nothing to return to. You choose which steps run, and a warning appears when a combination is unsafe (see [Choosing the steps](/en/configuration/schedules/#choosing-the-steps)).

## App updates

- **New versions of an app.** An app comes from a repository, which publishes its versions as tags. A new version waits for the waiting period, then applies by itself when the repository is trusted (Catena's catalog is), or is offered to you on the **Apps** page when it is not. When the running version is more than 12 months old, updates are only offered, even from a trusted repository. See [Apps added from a repository](/en/configuration/updates/#apps-added-from-a-repository).
- **Hold, copies and revert.** An update holds the app's writes and keeps copies of its databases and data. They are kept 14 days and until a later backup succeeds, and while they exist you can [revert the update](/en/configuration/updates/#revert-an-update).
- **Apps changed by hand.** An app changed by hand, or through another container manager, is not updated, and the **Apps** page says so (see [Apps changed outside Catena](/en/configuration/updates/#apps-changed-outside-catena)).
- **Only full x.y.z tags are updated automatically.** A tag such as `1.2.3` is eligible; `1.2`, `latest` or `stable` are never touched.
- **Policy.** A catalog app follows each version its repository publishes, majors included, one major version at a time, up to its **Automatic updates** setting (`major` by default; `minor`, `patch` or `off`); a newer version beyond it is offered to you. An app you wrote yourself defaults to patch updates (`1.2.3` to `1.2.9`); Catena's own services take their patch releases by themselves, and newer minor and major versions arrive with a control panel update (see [Catena's own services](/en/configuration/updates/#catenas-own-services)). The per-app label `vps.auto-update=off|patch|minor|major` overrides the default for your apps (see [Configure an app for Catena](/en/configure-apps/)). `off` leaves an app alone.
- **Waiting period.** A new version waits 7 days after release by default before it is adopted.
- **CVE remediation (Catena Pro).** Before an update, the candidate versions are scanned. A version that adds a new high or critical CVE is skipped in favour of a lower clean version, or the update waits. A newer version that removes a CVE from the running one is applied without the 7-day waiting period.
- **Rollback.** After each change, the server's health is compared with its state before. On a regression the previous version is restored and the failed version is set aside, so the next run tries the next version up. An app with a database gets a dump before the update that is replayed on rollback. An app whose new version upgrades its code, configuration and add-ons in place (Nextcloud) also gets a copy of them, put back on rollback; its users' files stay as they are.
- **Log.** The **Log** tab records backups, updates, rollbacks, vulnerability changes and restarts.

## Panel and Docker engine

The panel has its own **Control panel updates** schedule and a manual **Update this panel** button in **Settings** > **Control panel version**, which works on every edition. The panel is unavailable for about a minute, and a failed update is rolled back. The Docker engine is held at its version. A control panel update moves it to the version its release carries, on every edition, and the maintenance moves it within its major version; both put the previous one back if services do not return (see [Docker engine](/en/configuration/updates/#docker-engine)).

## What each edition adds

Community has OS patching, restart reporting, version visibility, security alerts for exploited vulnerabilities and for critical or high ones an update on offer fixes (see [Security alerts](/en/configuration/vulnerabilities/#security-alerts-every-edition)), a check on request and the emergency patch you start yourself, and manual panel and engine updates; for apps, no update is offered or applied. Catena Pro and Catena Business add the maintenance and the other schedules, managed app updates, the automatic patch of exploited vulnerabilities and automatic rollback. Catena Business adds the full list of vulnerabilities and the software inventory. See the [edition comparison](https://catena.run/en/#pricing).

## Limits

- Only containers are managed; the OS belongs to Debian.
- An update is not offered for an app whose tag is not a full x.y.z version.
- The restart at the end of the maintenance is the only automatic restart.

## Configuration

- [Updates](/en/configuration/updates/)
- [Vulnerabilities](/en/configuration/vulnerabilities/)
- [Schedules](/en/configuration/schedules/)
