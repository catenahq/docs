---
title: "Schedules"
description: "The eight scheduled jobs of a Catena server, their default times, the schedule syntax, the nightly maintenance chain, and backup retention."
---

The **Schedules** page sets when the server does its scheduled work. Nothing runs on a schedule until you turn it on here. You can also run every job by hand from the **Actions** page, in every edition.

## Prerequisites

- Catena Pro or Catena Business. Turning on any schedule needs an active subscription (see [Subscription](/en/configuration/subscription/) and the [edition comparison](https://catena.run/en/#pricing)). On Community the page reads "Schedules can be turned on with a Catena license. Until then, every job below can still be run by hand from the Actions page."
- For the backup job, a configured backup repository (see [Backups and S3 storage](/en/configuration/backups/)).

Saving an enabled job without an active subscription is refused with "scheduled work needs an active Catena Pro licence", after the schedule itself has been checked.

## The jobs

Every job ships switched off. The time shown is the pre-filled schedule, which runs only once you turn the job on.

| Job | Default schedule | Randomised delay | What it does |
|---|---|---|---|
| **Backup** | `Sun *-*-* 03:00:00` (Sundays, 3 AM) | up to 1 hour | Takes a snapshot of the server and sends it to the configured backup storage. |
| **Nightly maintenance** | `*-*-* 03:00:00` (every day, 3 AM) | up to 15 minutes | Backs up, checks the backup, copies it offsite, then moves the server's own components and the deployed applications to newer versions behind those checks. You choose which steps it runs (see [Choosing the steps](#choosing-the-steps)). |
| **Offsite copy** | `*-*-* 04:30:00` (every day, 4:30 AM) | up to 30 minutes | Copies every declared bucket to the write-once storage at the second provider (see [Offsite copies](/en/configuration/backups/#offsite-copies)). Needs Catena Business. |
| **Backup integrity check** | `Sun *-*-* 04:15:00` (Sundays, 4:15 AM) | up to 1 hour | Reads a sample of the backup repository end to end, which catches silent storage corruption between snapshots. |
| **Control panel updates** | `monthly` | up to 30 minutes | Moves the control panel to a newer version, and puts the previous one back if the new one makes the server less healthy. The panel is unavailable for about a minute. |
| **Server configuration** | `*-*-* 04:20:00` (every day, 4:20 AM) | up to 40 minutes | Brings the server back to the configuration its control panel carries. Anything that drifted is put back, and anything already correct is left alone. |
| **Off-site heartbeat** | `*:0/5` (every 5 minutes) | up to 30 seconds | Checks that the status page, job monitor and resource monitor answer, then calls the off-site heartbeat address saved in **Settings** > **Alerts and missed-job reporting** (see [Alerts](/en/configuration/alerts/)). Needs that address and Catena Pro. Its section shows the period and grace time to set on the outside check. |
| **Vulnerability watch** | `*-*-* 01,07,13,19:00:00` (every 6 hours, from 1 AM) | up to 10 minutes | Checks the software of every application and service against a fresh vulnerability database and CISA's list of exploited vulnerabilities, and alerts on each one that is exploited, or critical and published in the last 30 days (see [Vulnerabilities](/en/configuration/vulnerabilities/#vulnerabilities-page-catena-pro)). Needs Catena Pro. It can instead run inside the nightly maintenance, after the night's updates (see [Choosing the steps](#choosing-the-steps)). |

The randomised delay spreads the real start over a window after the set time, so a job starts a little later than the time written. A job missed because the server was off or restarting runs at the next start of the server.

### Nightly maintenance

The nightly maintenance is one ordered chain. It resumes by itself if a restart interrupts it.

1. **Preflight.** Checks that at least 5 GiB of disk is free.
2. **Maintenance mode and scripts around the backup.** A catalog application whose entry asks for it, such as Nextcloud, is put in maintenance mode while the backup runs and taken out of it afterwards, even when the backup fails. Optional pre- and post-backup scripts run when such scripts exist on the server. Nothing else is paused unless a script does it, and a failing script only logs a warning.
3. **Backup.**
4. **Restore test.** Restores the latest snapshot into a scratch area and checks it.
5. **Backup repository check.** Verifies the repository's metadata.
6. **Offsite copy.**
7. **Offsite copy check.**
8. **Health check before the updates.** Looks at the status page.
9. **Server package scan.** Lists security advisories flagged in the server's own packages (informational).
10. **Updates.** Updates the server's containers and the deployed applications (see [Updates](/en/configuration/updates/)).
11. **Image scan.** Scans the running images (informational; see [Vulnerabilities](/en/configuration/vulnerabilities/)).
12. **Vulnerability watch.** Runs the watch after the night's updates, when you chose it as a step (see [Choosing the steps](#choosing-the-steps)).
13. **Docker engine upgrade.** Within the current major version; the previous version is put back if the server does not come back healthy.
14. **Cleanup.** Removes unused image layers older than a week.
15. **Restart.** Restarts the server only when a security update needs it, then checks that every service came back. The restart first waits for other work on the server, such as a backup or an update, to finish; work still running after an hour moves the restart to the next night, and the **System** page shows it as postponed.

These steps stop the chain, so that no update is applied on top of a failure: the preflight, the backup, the restore test, the backup repository check, the health check before the updates (any failing endpoint on the status page), and the offsite copy check (which is required by default). The other steps log their result and let the chain continue. A step you leave out does not run, so it cannot stop the chain.

A configured backup that fails, or fails its restore test or repository check, therefore stops the chain before any update, unless the backup step is left out. A night stopped this way has changed nothing on the server, and it still restarts the server when a restart is due and the **Restart** step is on. When no backup is configured at all, the chain skips from the backup step to the health check before the updates, records a Log event, and still applies updates; the panel shows a banner on every page until a backup is configured. When the chain then changes nothing (the nightly maintenance is off, or **Updates** and **Docker engine upgrade** are both left out), the banner is shortened to "No backup is configured. Configure one in Settings."

### Choosing the steps

Under **Steps**, in the **Nightly maintenance** section, each step of the chain is a box with a one-line summary, in the order it runs:

1. **Backup**
2. **Restore test**
3. **Backup repository check**
4. **Offsite copy**
5. **Offsite copy check**
6. **Health check before the updates**
7. **Server package scan**
8. **Updates**
9. **Image scan**
10. **Vulnerability watch**
11. **Docker engine upgrade**
12. **Restart**

Every step is on except **Vulnerability watch**. The disk space check at the start and the cleanup of old image layers at the end always run and have no box. To leave a step out, untick its box and press **Save schedules**: the chain skips it every night. To put it back, tick the box and save again.

Some choices are held or refused:

- While the offsite copy is on and an offsite copy is declared (see [Offsite copies](/en/configuration/backups/#offsite-copies)), **Restore test** and **Backup repository check** stay ticked and greyed, with the reason "This step stays on while the offsite copy is on: the copy goes to storage nothing can delete from, so it runs only after the backup has passed its restore test and repository check." Once saved, they stay ticked after the offsite copy is off, until you untick them and save again.
- On Catena Pro, **Offsite copy** and **Offsite copy check** are greyed with "Needs Catena Business: without it the offsite copy does not run, on a schedule or by hand."
- With no offsite copy declared, **Offsite copy** shows the hint "No offsite copy is declared in Settings, so this step copies nothing."
- The vulnerability watch runs either as a step or on its own schedule, never both. Ticking **Vulnerability watch** while its own schedule is on, or turning that schedule on while the step is ticked, is refused with "The vulnerability watch runs either every night in the nightly maintenance or on its own schedule, not both. Turn one of them off." and the page reads "Nothing was saved. The steps of the nightly maintenance below say why." Turn one of the two off and save again.

Five combinations save, with a warning under the list:

| Combination | Warning |
|---|---|
| **Updates** or **Docker engine upgrade** on, **Backup** off | "The updates or the Docker engine upgrade are on and the backup is not. A failed update or database migration could cause permanent data loss: Catena's own services keep no copy of their data while they update, and damage found after an update has passed its health check has nothing to go back to." |
| **Backup** on, **Restore test** off | "The nightly backup is not restore-tested. A backup that cannot be restored is found only when it is needed." |
| **Backup** on, **Backup repository check** off | "The backup repository is not checked after the nightly backup. Damage in the backup storage is found only when a backup is restored." |
| **Updates** or **Docker engine upgrade** on, **Health check before the updates** off | "The health check before the updates is off. An update can land on a service that is already down, and the comparison that decides whether to put the previous version back then cannot tell that the update broke it." |
| **Offsite copy** on, **Offsite copy check** off | "The offsite copy check is off. Nothing proves the offsite copy can be read back, so a copy that cannot be restored is found only when it is needed, and the updates do not wait for that proof." |

While the nightly maintenance is on and runs **Updates** or **Docker engine upgrade** with **Backup** left out, every admin page opens with a warning banner: "The nightly maintenance updates this server with its backup step left out. A failed update or database migration could cause permanent data loss. Turn the backup step back on in Schedules, under Nightly maintenance." The banner links to the list of steps.

With **Restart** off, the nightly maintenance never restarts the server. A pending restart then shows the banner "An installed update takes effect only after this server restarts. Restart it from the System page." Restart from **System** > **Restart** (see [Updates](/en/configuration/updates/)).

### What the nightly maintenance reports

The **Log** records the result of each night, and each warning once, when its combination starts to hold:

| Event |
|---|
| The nightly maintenance completed. |
| The nightly maintenance did not complete cleanly. Step that failed: `<step>`. |
| The nightly maintenance runs its updates with its backup left out on the Schedules page. A failed update or database migration could cause permanent data loss. |
| The nightly maintenance takes its backup with the restore test left out on the Schedules page. A backup that cannot be restored is found only when it is needed. |
| The nightly maintenance takes its backup with the backup repository check left out on the Schedules page. Damage in the backup storage is found only when a backup is restored. |
| The nightly maintenance runs its updates with the health check before the updates left out on the Schedules page. An update can land on a service that is already down, and the check after it then cannot tell whether the update broke it. |
| The nightly maintenance makes its offsite copy with the offsite copy check left out on the Schedules page. Nothing proves the copy can be read back, and the updates do not wait for that proof. |

The step named in a failed night is the one that stopped it, or else the first that failed.

The nightly maintenance also has its own Healthchecks check, **Nightly maintenance**. It is told when each night starts, when a step fails and when the night ends, so a night that fails or does not run raises an alert (see [Alerts](/en/configuration/alerts/)). The nightly maintenance reports to the backup checks only while **Backup** is a step, and to the offsite copy checks only while **Offsite copy** is.

## Schedule syntax

A schedule is a systemd calendar expression, which you write in the **Schedule** field of each job. Common forms:

| Expression | Meaning |
|---|---|
| `Sun 3:00` | every Sunday at 3 AM |
| `3:00` | every day at 3 AM |
| `*-*-1 3:00` | at 3 AM on the first day of each month |
| `hourly`, `monthly` | the named intervals |
| `*:0/15` | every quarter hour |

There is no limit on how often a job runs. The **Full syntax reference** link opens the complete syntax.

### Check tool

Under **Check a schedule**, type an expression and press **Check**. The panel replies "Read as: `<normalized form>`" and the next three run times, before anything is saved. Each job also has its own **Check** button and a read-only **Next runs** line. An invalid expression is refused.

## Turning a job on

1. Open **Schedules**.
2. In the job's section, edit **Schedule** if the default does not suit, and tick **Run on this schedule**.
3. Press **Save schedules**. The page confirms with "Schedules saved and applied to this server." A refusal reads "This server did not accept the schedule." followed by the reason.

Saving also sets the Healthchecks checks of the backup, the offsite copy, the nightly maintenance and the off-site heartbeat to the new schedules; a check that no turned-on job reports to is paused. When Healthchecks does not answer, the page reads "Schedules saved and applied to this server. Healthchecks did not answer, so the checks that watch these jobs take the new schedules the next time the schedules are saved or this server's configuration is brought up to date." A check turned back on shows "new" in Healthchecks until its job next runs.

When nothing is turned on, the page warns "Nothing is scheduled on this server, so no backup will run. Turn on the backup schedule below."

## How many backups to keep

Under **How many backups to keep**, five numbers decide what survives pruning. Each row is kept independently.

| Field | Default |
|---|---|
| **Most recent** | 0 |
| **Hourly** | 24 |
| **Daily** | 7 |
| **Weekly** | 4 |
| **Monthly** | 6 |

Keeping the last 8 and 24 hourly on a quarter-hour schedule holds 8 backups across the last two hours and 22 more across the rest of the day. A zero means none are kept on that basis. Every number must be a whole number of zero or more, and at least one must be above zero: all zeros would delete every snapshot on the next prune, so the save is refused. The numbers apply even when no job is enabled.

## When the subscription lapses

The timers are switched off and the jobs stop running. The saved schedules and retention numbers are kept. Applications, their data and manual backups are not affected. The Log and a banner record the lock.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| "Schedules can be turned on with a Catena license." | No active Catena Pro or Catena Business subscription. Check **Settings** > **Subscription**. |
| "This server did not accept the schedule." | The reason follows the message; most often an expression that does not parse. Use **Check**. |
| "Could not reach this server to read or change the schedule." | The host did not answer; retry in a moment. |
| A job did not start at the set time | The randomised delay applies; a missed run starts at the next boot. |
| Turning on **Off-site heartbeat** is refused | The off-site heartbeat address in **Settings** > **Alerts and missed-job reporting** is empty or not a web address (`http://` or `https://`). Save it there first. |
