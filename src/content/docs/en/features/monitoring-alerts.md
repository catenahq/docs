---
title: "Monitoring and alerts"
description: "Status page, missed-job alarms and resource alerts hosted on your own server, plus optional off-site watchdogs."
---

The server hosts its own monitoring: a status page, resource graphs and push alerts when a service goes down, a scheduled job goes quiet, or disk, CPU or memory run hot. Alerts reach you by email, through the server's outgoing mail, and anyone else through channels you add in Healthchecks.

## How it works

**Gatus** (`gatus.yourdomain.com`) is the status page. Infrastructure services are probed every 60 to 120 seconds, and each routed, running app gets one public check every 120 seconds, regenerated every 10 minutes. An app's own `vps.health.path` and `vps.health.expect` labels are used when present; otherwise the sign-in redirect counts as healthy (see [Configure an app for Catena](/en/configure-apps/)). An alert fires after 3 consecutive failures and resolves after 2 successes, so a short outage takes a few minutes to show. A check on the container vulnerability inventory fails when any critical, or more than 10 high, findings exist.

**Healthchecks** (`healthchecks.yourdomain.com`) receives Gatus alerts, one check per service, created on the first failure. It also receives a ping from each scheduled job (backup, offsite copy, nightly maintenance, restart probe); a missed ping is the alarm. Alerts reach the admin email by default, through the mail service chosen in **Settings** > **Outgoing mail**; you add more notification channels (email, Slack and many others) in Healthchecks' own interface. An ntfy channel exists only when both the ntfy server and topic are set in **Settings** > **Alerts and missed-job reporting**; there is no default.

**Beszel** (`beszel.yourdomain.com`) graphs server resources through an agent on the host. Alert rules are created once for the server: status (agent silent) after 5 minutes, CPU and memory at 90 percent and disk at 85 percent, each sustained for 10 minutes. Alerts go through a Healthchecks bridge, so they reach the admin email and the other channels like any other alert. Rules are never overwritten after creation, so later edits in Beszel stay.

**Off-site watchdogs.** The default watchdog addresses point to the Healthchecks on the same server, which cannot report an outage that takes the whole server down. **Settings** > **Alerts and missed-job reporting** has an off-site pair, **Off-site Healthchecks backup watchdog URL (client)** and **(Catena)**, for an outside Healthchecks-style endpoint. If a ping stops arriving, the outside service raises the alarm: silence itself is the alert. When neither is set, the install prints a non-fatal warning that a whole-server outage would be silent.

**Other signals.** The panel shows tiles for monitoring status and exposed ports, a banner for missing backups and pending restarts, and a **System** page with active alerts and jobs that have not yet reported. Antivirus watch and mail delivery canaries run as timers.

## What each edition adds

Gatus, Healthchecks, Beszel, ntfy, the status page, on-host alerts and the off-site watchdog fields work on every edition. Catena Pro adds external uptime monitoring and Catena Business adds monitoring-as-a-service, described in the [edition comparison](https://catena.run/en/#pricing).

## Limits

- On-server monitors cannot report an outage of the server itself, which is why the off-site pair exists.
- Alerting needs a channel: with **No outgoing mail**, nothing is sent until you set up ntfy or a Healthchecks channel.
- Alert latency is the probe interval times the 3-failure threshold.

## Configuration

- [Alerts](/en/configuration/alerts/)
- [Outgoing email](/en/configuration/email/)
- [Server settings](/en/configuration/server/)
