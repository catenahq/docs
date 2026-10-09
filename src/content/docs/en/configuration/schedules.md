---
title: "Schedules"
description: "The seven scheduled jobs of a Catena server, their default times, the schedule syntax, the nightly maintenance chain, and backup retention."
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
| **Nightly maintenance** | `*-*-* 03:00:00` (every day, 3 AM) | up to 15 minutes | Backs up, checks the backup, copies it offsite, then moves the server's own components and the deployed applications to newer versions behind those checks. |
| **Offsite copy** | `*-*-* 04:30:00` (every day, 4:30 AM) | up to 30 minutes | Copies every declared bucket to the write-once storage at the second provider (see [Offsite copies](/en/configuration/backups/#offsite-copies)). Needs Catena Business. |
| **Backup integrity check** | `Sun *-*-* 04:15:00` (Sundays, 4:15 AM) | up to 1 hour | Reads a sample of the backup repository end to end, which catches silent storage corruption between snapshots. |
| **Control panel updates** | `monthly` | up to 30 minutes | Moves the control panel to a newer version, and puts the previous one back if the new one makes the server less healthy. The panel is unavailable for about a minute. |
| **Server configuration** | `*-*-* 04:20:00` (every day, 4:20 AM) | up to 40 minutes | Brings the server back to the configuration its control panel carries. Anything that drifted is put back, and anything already correct is left alone. |
| **Off-site heartbeat** | `*:0/5` (every 5 minutes) | up to 30 seconds | Checks that the status page, job monitor and resource monitor answer, then calls the off-site heartbeat address saved in **Settings** > **Alerts and missed-job reporting** (see [Alerts](/en/configuration/alerts/)). Needs that address and Catena Pro. Its section shows the period and grace time to set on the outside check. |

The randomised delay spreads the real start over a window after the set time, so a job starts a little later than the time written. A job missed because the server was off or restarting runs at the next start of the server.

### Nightly maintenance

The nightly maintenance is one ordered chain. It resumes by itself if a restart interrupts it.

1. **Preflight.** Checks that at least 5 GiB of disk is free.
2. **Hooks before and after the backup.** Run optional pre- and post-backup scripts when such scripts exist on the server. Nothing is paused unless a script does it, and a failing script only logs a warning.
3. **Backup.**
4. **Hot verification.** Restores the latest snapshot into a scratch area and checks it.
5. **Repository check.** Verifies the repository's metadata.
6. **Offsite copy.**
7. **Offsite verification.**
8. **Pre-update gate.** Looks at the status page.
9. **Host vulnerabilities.** Lists security advisories flagged in the server's own packages (informational).
10. **Application updates.** Updates the server's containers and the deployed applications (see [Updates](/en/configuration/updates/)).
11. **Image vulnerability scan.** Scans the running images (informational; see [Vulnerabilities](/en/configuration/vulnerabilities/)).
12. **Docker engine upgrade.** Within the current major version; the previous version is put back if the server does not come back healthy.
13. **Cleanup.** Removes unused image layers older than a week.
14. **Restart.** Restarts the server only when a security update needs it, then checks that every service came back.

These steps stop the chain, so that no update is applied on top of a failure: the preflight, the backup, the hot verification, the repository check, the pre-update gate (any failing endpoint on the status page), and the offsite verification (which is required by default). The other steps log their result and let the chain continue.

A configured backup that fails, or fails its verification, therefore stops the chain before any update. When no backup is configured at all, the chain skips from the backup step to the pre-update gate, records a Log event, and still applies updates; the panel shows a banner on every page until a backup is configured.

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

Saving also sets the Healthchecks checks of the backup, the offsite copy and the off-site heartbeat to the new schedules; a check that no turned-on job reports to is paused. When Healthchecks does not answer, the page reads "Schedules saved and applied to this server. Healthchecks did not answer, so the checks that watch these jobs take the new schedules the next time the schedules are saved or this server's configuration is brought up to date." A check turned back on shows "new" in Healthchecks until its job next runs.

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
