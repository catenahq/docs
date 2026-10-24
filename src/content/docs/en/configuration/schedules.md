---
title: "Schedules"
description: "The nine scheduled jobs of a Catena server, the schedule syntax, the nightly maintenance chain, and backup retention."
---

The **Schedules** page sets when the server does its scheduled work. Apart from the **Vulnerability watch** on a server that has never saved its schedules, nothing runs on a schedule until you turn it on here. You can also run every job by hand from the **Actions** page, in every edition.

## Prerequisites

- A server without a paid subscription (Catena Community) schedules two jobs: the **Backup** job, at most once a week, and the **Vulnerability watch**, at most once a day. Every other job, and a faster backup, needs Catena Pro or Catena Business (see [Subscription](/en/configuration/subscription/) and the [edition comparison](https://catena.run/en/#pricing)). Without a paid subscription the page reads "Without a paid subscription, this server schedules its backup at most once a week and its vulnerability watch at most once a day. Every other job, and a faster backup, needs Catena Pro, and the offsite copy needs Catena Business. Each job that needs a paid subscription says below whether it can still be run by hand."
- For the backup job, a configured backup repository (see [Backups and S3 storage](/en/configuration/backups/)).

Saving a job that the subscription does not cover is refused with "scheduling this lane needs an active Catena Pro licence", or "this lane needs an active Catena Business licence" for the offsite copy, after the schedule itself has been checked. Saving a backup or vulnerability watch schedule that runs more often than a server without a paid subscription may is refused too (see [Schedule syntax](#schedule-syntax)).

## The jobs

Every job ships switched off, except the **Vulnerability watch** on a server that has never saved its schedules: it is on from the start.

| Job | What it does |
|---|---|
| **Backup** | Takes a snapshot of the server and sends it to the configured backup storage. Available on every edition: without a paid subscription it runs at most once a week, on any day and time you choose, and Catena Pro adds daily and custom schedules. |
| **Nightly maintenance** | Backs up, checks the backup, copies it offsite, then moves the server's own components and the deployed applications to newer versions behind those checks. You choose which steps it runs (see [Choosing the steps](#choosing-the-steps)). |
| **Offsite copy** | Copies every declared bucket to the write-once storage at the second provider (see [Offsite copies](/en/configuration/backups/#offsite-copies)). Needs Catena Business. |
| **Backup integrity check** | Reads a sample of the backup repository end to end, which catches silent storage corruption between snapshots. |
| **Restore test** | Restores the latest backup into a scratch area and checks what came back, which proves a backup can be restored. It downloads as much as the backup holds and needs as much free disk, so it ships off and runs weekly once on. Turn it on when the server has the room. It reports to its own Healthchecks check, so a test that fails or does not run raises an alert (see [Alerts](/en/configuration/alerts/)). Needs Catena Pro. It can instead run as a step of the nightly maintenance (see [Choosing the steps](#choosing-the-steps)). |
| **Control panel updates** | Moves the control panel to a newer version, and puts the previous one back if the new one makes the server less healthy. The panel is unavailable for about a minute. |
| **Server configuration** | Brings the server back to the configuration its control panel carries. Anything that drifted is put back, and anything already correct is left alone. |
| **Off-site heartbeat** | Checks that the status page, job monitor and resource monitor answer, then calls the off-site heartbeat address saved in **Settings** > **Alerts and missed-job reporting** (see [Alerts](/en/configuration/alerts/)). Needs that address and Catena Pro. Its section shows the period and grace time to set on the outside check. |
| **Vulnerability watch** | Checks the software of every application and service against a fresh vulnerability database and CISA's list of exploited vulnerabilities, and alerts on each one that is exploited, or critical, published in the last 30 days and fixed (see [Security alerts](/en/configuration/vulnerabilities/#security-alerts-every-edition)). Available on every edition: without a paid subscription it runs at most once a day. On Catena Pro or Catena Business it can instead run inside the nightly maintenance, after the night's updates (see [Choosing the steps](#choosing-the-steps)). |

Each job starts at its set time. A run still going at the next set time is not doubled: the job starts again at the first set time after it ends. A job missed because the server was off or restarting runs when the server starts again.

### Nightly maintenance

The nightly maintenance is one ordered chain. It resumes by itself if a restart interrupts it.

1. **Preflight.** Checks that at least 5 GiB of disk is free.
2. **Maintenance mode and scripts around the backup.** A catalog application whose entry asks for it, such as Nextcloud, is put in maintenance mode while the backup runs and taken out of it afterwards, even when the backup fails. Optional pre- and post-backup scripts run when such scripts exist on the server. Nothing else is paused unless a script does it, and a failing script only logs a warning.
3. **Backup.**
4. **Restore test.** Restores the latest snapshot into a scratch area and checks it. Off by default, because the restore test has its own schedule (see [The jobs](#the-jobs)).
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

These steps stop the chain, so that no update is applied on top of a failure: the preflight, the backup, the restore test (when it is a step), the backup repository check, the health check before the updates (any failing endpoint on the status page), and the offsite copy check (which is required by default). The other steps log their result and let the chain continue. A step you leave out does not run, so it cannot stop the chain.

A configured backup that fails, or fails its repository check (or its restore test, when that is a step), therefore stops the chain before any update, unless the backup step is left out. A night stopped this way has changed nothing on the server, and it still restarts the server when a restart is due and the **Restart** step is on. When no backup is configured at all, the chain skips from the backup step to the health check before the updates, records a Log event, and still applies updates; the panel shows a banner on every page until a backup is configured. When the chain then changes nothing (the nightly maintenance is off, or **Updates** and **Docker engine upgrade** are both left out), the banner is shortened to "No backup is configured. Configure one in Settings."

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

Every step is on except **Restore test** and **Vulnerability watch**. The disk space check at the start and the cleanup of old image layers at the end always run and have no box. To leave a step out, untick its box and press **Save schedules**: the chain skips it every night. To put it back, tick the box and save again.

Some choices are held or refused:

- While the offsite copy is on and an offsite copy is declared (see [Offsite copies](/en/configuration/backups/#offsite-copies)), **Backup repository check** stays ticked and greyed, with the reason "This step stays on while the offsite copy is on: the copy goes to storage nothing can delete from, so it runs only after the backup repository has passed its check." Once saved, it stays ticked after the offsite copy is off, until you untick it and save again.
- The restore test runs either as a step or on its own schedule, never both. Ticking **Restore test** while its own schedule is on, or turning that schedule on while the step is ticked, is refused with "The restore test runs either every night in the nightly maintenance or on its own schedule, not both. Turn one of them off." Turn one of the two off and save again.
- On Catena Pro, **Offsite copy** and **Offsite copy check** are greyed with "Needs Catena Business: without it the offsite copy does not run, on a schedule or by hand."
- With no offsite copy declared, **Offsite copy** shows the hint "No offsite copy is declared in Settings, so this step copies nothing."
- The vulnerability watch runs either as a step or on its own schedule, never both. Ticking **Vulnerability watch** while its own schedule is on, or turning that schedule on while the step is ticked, is refused with "The vulnerability watch runs either every night in the nightly maintenance or on its own schedule, not both. Turn one of them off." and the page reads "Nothing was saved. The steps of the nightly maintenance below say why." Turn one of the two off and save again.

Five combinations save, with a warning under the list:

| Combination | Warning |
|---|---|
| **Updates** or **Docker engine upgrade** on, **Backup** off | "The updates or the Docker engine upgrade are on and the backup is not. A failed update or database migration could cause permanent data loss: Catena's own services keep no copy of their data while they update, and damage found after an update has passed its health check has nothing to go back to." |
| **Backup** on, and no restore test scheduled (the step is off and the **Restore test** job is off) | "No restore test is scheduled. A backup that cannot be restored is found only when it is needed. Turn on the restore test, on its own schedule or as a step here." |
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
| The nightly maintenance takes its backup with no restore test scheduled on the Schedules page. A backup that cannot be restored is found only when it is needed. |
| The nightly maintenance takes its backup with the backup repository check left out on the Schedules page. Damage in the backup storage is found only when a backup is restored. |
| The nightly maintenance runs its updates with the health check before the updates left out on the Schedules page. An update can land on a service that is already down, and the check after it then cannot tell whether the update broke it. |
| The nightly maintenance makes its offsite copy with the offsite copy check left out on the Schedules page. Nothing proves the copy can be read back, and the updates do not wait for that proof. |

The step named in a failed night is the one that stopped it, or else the first that failed.

The nightly maintenance also has its own Healthchecks check, **Nightly maintenance**. It is told when each night starts, when a step fails and when the night ends, so a night that fails or does not run raises an alert (see [Alerts](/en/configuration/alerts/)). The nightly maintenance reports to the backup checks only while **Backup** is a step, and to the offsite copy checks only while **Offsite copy** is.

### Offsite copy and the restore test

Before every copy of this server's backup repository, the offsite copy removes the backups past the retention numbers and checks the repository. When the check fails, nothing is copied: the copy goes to storage nothing can delete from, so a damaged repository must not land there. The skipped copy raises an alert (see [Alerts](/en/configuration/alerts/)). To put a damaged repository back, see [Put a bucket back from its offsite copy](/en/configuration/restore-and-migrate/#put-a-bucket-back-from-its-offsite-copy).

Under the **Offsite copy** section, the box **Copy only a backup that passed a restore test** makes the copy wait for a restore test of the newest backup. When the newest backup has not passed one, the offsite copy runs a restore test first and copies nothing if it fails. The box is off by default: a backup that was never restore-tested is not thereby damaged.

## Schedule syntax

A schedule is a systemd calendar expression, which you write in the **Schedule** field of each job. Common forms:

| Expression | Meaning |
|---|---|
| `Sun 3:00` | every Sunday at 3 AM |
| `3:00` | every day at 3 AM |
| `*-*-1 3:00` | at 3 AM on the first day of each month |
| `hourly`, `monthly` | the named intervals |
| `*:0/15` | every quarter hour |

On Catena Pro and Catena Business, there is no limit on how often a job runs. Without a paid subscription, the backup runs at most once a week, for example `Sun 3:00` or `weekly`, and the vulnerability watch at most once a day, for example `3:00`; the day and time are yours to choose. A schedule that runs either job more often is refused with a message such as "backup: this schedule runs it as often as every 1 day 0 hours. Without a paid subscription the backup runs at most once a week. Choose a weekly or less frequent schedule, such as Sun 3:00, or subscribe to Catena Pro for daily and custom schedules." The **Full syntax reference** link opens the complete syntax.

### Check tool

Under **Check a schedule**, type an expression and press **Check**. The panel replies "Read as: `<normalized form>`" and the next three run times, before anything is saved. Each job also has its own **Check** button and a read-only **Next runs** line. An invalid expression is refused.

## Turning a job on

1. Open **Schedules**.
2. In the job's section, edit **Schedule** if the default does not suit, and tick **Run on this schedule**.
3. Press **Save schedules**. The page confirms with "Schedules saved and applied to this server." A refusal reads "This server did not accept the schedule." followed by the reason.

Saving also sets the Healthchecks checks of the backup, the backup integrity check, the restore test, the offsite copy, the nightly maintenance and the off-site heartbeat to the new schedules; a check that no turned-on job reports to is paused. When Healthchecks does not answer, the page reads "Schedules saved and applied to this server. Healthchecks did not answer, so the checks that watch these jobs take the new schedules the next time the schedules are saved or this server's configuration is brought up to date." A check turned back on shows "new" in Healthchecks until its job next runs.

When no backup is scheduled, the page warns "Nothing is scheduled on this server, so no backup will run. Turn on the backup schedule below."

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

Backups past these numbers are removed once a day, with the first backup after midnight in the server's time zone, and before each offsite copy, so the write-once storage receives only the backups you keep. Until then, every backup stays listed and can be restored.

## When the subscription lapses

The backup keeps running once a week and the vulnerability watch once a day. When the saved backup schedule was faster than weekly, or the backup ran only as a step of the nightly maintenance, it runs at the default time (Sunday 3 AM) until you save a weekly schedule or the subscription returns. The vulnerability watch does the same at 1 AM every day. The page names what each one runs in place of the saved schedule. Every other job stops. The saved schedules and retention numbers are kept, and the saved schedules return with the subscription. Applications, their data and manual backups are not affected. The Log and a banner record the lock.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| "scheduling this lane needs an active Catena Pro licence" | The job needs Catena Pro or Catena Business, and the server has no active subscription. Check **Settings** > **Subscription**. |
| "backup: this schedule runs it as often as every ..." | Without a paid subscription, the backup runs at most once a week and the vulnerability watch at most once a day. Choose a slower schedule, such as `Sun 3:00`, or subscribe to Catena Pro. |
| "This server runs the backup on ..." or "This server runs the vulnerability watch on ..." | The saved schedule is faster than a server without a paid subscription may run. The line names the schedule that runs instead. Save a weekly (backup) or daily (watch) schedule, or renew the subscription. |
| "Nothing is scheduled on this server, so no backup will run." | No backup schedule is on. Turn on **Backup** and save. |
| "This server did not accept the schedule." | The reason follows the message; most often an expression that does not parse. Use **Check**. |
| "Could not reach this server to read or change the schedule." | The host did not answer; retry in a moment. |
| A job did not start at the set time | The previous run was still going, or the server was off. A missed run starts when the server starts again. |
| Turning on **Off-site heartbeat** is refused | The off-site heartbeat address in **Settings** > **Alerts and missed-job reporting** is empty or not a web address (`http://` or `https://`). Save it there first. |
