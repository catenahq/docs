---
title: "Monitoring and alerts"
description: "Status page, failed and late job alerts and resource alerts hosted on your own server, plus an optional off-site heartbeat."
---

The server hosts its own monitoring: a status page, resource graphs and push alerts when a service goes down, a scheduled job goes quiet, or disk, CPU or memory run hot. Service, resource and scheduled job alerts reach you by email, through the server's outgoing mail, and by webhook, as you choose in [Alerts](/en/configuration/alerts/).

## How it works

Gatus and Beszel are installed by default as applications, and each one sets itself up. You set each address in its application's settings (see [Domain and Cloudflare](/en/configuration/domain/#infrastructure-app-subdomains)) and update it from its page (see [Update an app by hand](/en/configuration/updates/#update-an-app-by-hand)); a Catena update also moves each one to the newer version its release names, never to an older one. A monitor you remove stays removed: Catena does not install it again and raises no alert for it. Add it back from the catalog and the next configuration run wires it again.

**Gatus** (`gatus.yourdomain.com`) is the status page. Infrastructure services are probed every 60 to 120 seconds, and each routed, running app gets one public check every 120 seconds, regenerated every 10 minutes. An app's own `vps.health.path` and `vps.health.expect` labels are used when present; otherwise the check reads the app's front page: an app behind sign-in is healthy when it sends the visitor to sign in, and a public app when its front page answers with a page or a redirect rather than an error (see [Configure an app for Catena](/en/configure-apps/)). An alert fires after 3 consecutive failures and resolves after 2 successes, so a short outage takes a few minutes to show. Gatus hands the alert to the control panel, which sends it as the **Service down** alert of [Alerts](/en/configuration/alerts/#alert-types).

**Scheduled jobs.** Each scheduled job (backup, repository check, restore test, offsite copy, maintenance, vulnerability watch, off-site heartbeat, restart probe) reports its runs to the control panel's alerts, which notices a job that failed or missed its run (its schedule plus a margin). A job that is turned off, or that your edition does not run, is never late.

**Beszel** (`beszel.yourdomain.com`) graphs server resources through its agent on the host, part of the Beszel application, with the history and the usage of each container; the **System** tab's CPU and RAM gauges are read from the server itself and do not depend on it. Alert rules are created once for the server: status (agent silent) after 5 minutes, CPU and memory at 90 percent and disk at 85 percent, each sustained for 10 minutes. Beszel hands its alerts to the control panel, which sends them as the **Resource alert** of [Alerts](/en/configuration/alerts/#alert-types). Rules are never overwritten after creation, so later edits in Beszel stay.

**Off-site heartbeat.** The monitors on the server cannot report an outage that takes the whole server down. With Catena Pro, the off-site heartbeat calls a check at an outside monitoring service on the schedule you set in [Schedules](/en/configuration/schedules/); you save its address in **Settings** > **Alerts**. When the calls stop, the outside service raises the alarm, and a call that names a silent monitor reports the monitor that stopped.

**Other signals.** The panel shows tiles for monitoring status and exposed ports, a banner for missing backups and pending restarts, and a **System** page with active alerts and jobs that have not yet reported. Antivirus watch and mail delivery canaries run as timers.

**Healthchecks.** A new server does not install it. It stays in the catalog as an ordinary application that you install, update and remove like any other, with its own sign-in. A server that already runs it keeps it running as an ordinary application: Catena no longer pings it, reads it or signs in to it, so the checks Catena made in it stop receiving pings and Healthchecks emails each one once as down. Keep it, or open its page in **Apps**, choose **Take down application**, then **Delete application and data**.

## What each edition adds

Gatus, Beszel, the status page and on-host alerts work on every edition, and so do the security alerts: the vulnerability watch emails you about an exploited vulnerability, or a critical or high one that an update on offer fixes (see [Security alerts](/en/configuration/vulnerabilities/#security-alerts-every-edition)). Catena Pro adds the off-site heartbeat and Catena Business adds monitoring-as-a-service, described in the [edition comparison](https://catena.run/en/#pricing).

## Limits

- On-server monitors cannot report an outage of the server itself, which is why the off-site heartbeat exists.
- Alerting needs a channel: with **No outgoing mail**, nothing is sent by email, so add a webhook address in [Alerts](/en/configuration/alerts/#webhook-addresses).
- Alert latency is the probe interval times the 3-failure threshold.

## Configuration

- [Alerts](/en/configuration/alerts/)
- [Outgoing email](/en/configuration/email/)
- [Server settings](/en/configuration/server/)
