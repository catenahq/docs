---
title: "Alerts"
description: "The watchdog addresses and ntfy fields of the alerts section, how missed jobs and failing services raise alerts, and how notification channels are added in Healthchecks."
---

Alerts come from three on-server tools: Gatus (is each service answering), Healthchecks (did each scheduled job report in) and Beszel (are CPU, memory and disk healthy). The overview is in [Monitoring and alerts](/en/features/monitoring-alerts/). This page covers the settings and the first-time wiring.

## Fields

**Settings** > **Alerts and missed-job reporting** holds optional watchdog addresses. Each scheduled job pings one when it finishes, and the watchdog raises the alarm when a ping does not arrive. A blank field keeps its default.

| Field | Purpose |
|---|---|
| **Healthchecks backup watchdog URL (success ping)** | Pinged when a backup succeeds. Defaults to the Healthchecks on this same server. |
| **Healthchecks backup watchdog URL (attempt ping)** | Pinged when a backup is attempted, whether or not it succeeds. Defaults to the Healthchecks on this same server. |
| **Off-site Healthchecks backup watchdog URL (client)** | A Healthchecks address on an outside service, owned by the server's owner. |
| **Off-site Healthchecks backup watchdog URL (Catena)** | A second outside address, for a watchdog run by Catena. Left blank when none was issued. |
| **ntfy server** | Address of an ntfy server for push notifications. |
| **ntfy topic** | The topic on that server. Hard to guess by design: anyone who knows it can post to it. |

The two local addresses cannot report an outage that takes the whole server down, because the watchdog is on the server. The off-site pair closes that gap: when the server goes dark, silence itself raises the alert. If neither off-site address is set, the install prints a non-fatal warning that a whole-server outage would go unreported.

The ntfy channel is created only when both **ntfy server** and **ntfy topic** are filled. There is no default.

The section ends with **Save and apply**; the services that use these values restart briefly.

## How alerts flow

1. Gatus probes every infrastructure service and every routed application on a fixed interval (about one to two minutes). After 3 consecutive failures it raises an alert, and after 2 successes it resolves it.
2. Each Gatus alert is posted to Healthchecks as one check per service, named `gatus-<service>`, created on the first failure.
3. Healthchecks forwards to the notification channels added in its own interface.
4. Scheduled jobs (backup, offsite copy, nightly maintenance, restart probe) ping Healthchecks as they run. A missed ping is itself the alert.
5. Beszel watches the server with rules created once and never overwritten: status (agent silent) for 5 minutes, CPU at 90% for 10 minutes, memory at 90% for 10 minutes, disk at 85% for 10 minutes. Its alerts go through Healthchecks and by outgoing email.

## Add notification channels in Healthchecks

Alerts reach no one until a channel exists, apart from the ntfy channel above.

1. Open `https://heartbeat.yourdomain.com` and sign in (single sign-on).
2. Open the project's integrations page and add a channel: email, Slack, a webhook, or any other the page offers.
3. Check that the channel is attached to the checks to be notified. New checks, including the `gatus-` ones, use the project's channels.

Email channels need [Outgoing email](/en/configuration/email/).

## Where to look

- `https://monitor.yourdomain.com`: the Gatus status page.
- `https://heartbeat.yourdomain.com`: Healthchecks, with each job's last ping.
- `https://hub.yourdomain.com`: Beszel, with the server's resource graphs.
- The **System** page of the admin panel shows active alerts and jobs not reporting yet.

The subdomain names can be changed in [Domain and Cloudflare](/en/configuration/domain/).

## Troubleshooting

- A job shows late or down in Healthchecks: the schedule is off or the job failed. Check [Schedules](/en/configuration/schedules/) and the **Log**.
- No notification arrived for a failing service: no channel is attached. Add one as above.
- ntfy messages never arrive: both ntfy fields must be set, and the topic must match on the receiving side.
