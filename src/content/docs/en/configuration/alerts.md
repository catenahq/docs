---
title: "Alerts"
description: "The watchdog addresses and ntfy fields of the alerts section, how missed jobs and failing services raise alerts, how alerts reach the admin email, and how more notification channels are added in Healthchecks."
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

Alerts also reach the admin email, through the service chosen in [Outgoing email](/en/configuration/email/): while outgoing mail is set, the server keeps an email channel to the admin address in Healthchecks, attached to every check when the channel is created. A channel detached from a check in Healthchecks stays detached. With **No outgoing mail**, the channel is removed and alerts reach only ntfy and the channels added in Healthchecks.

The section ends with **Save and apply**; the services that use these values restart briefly.

## How alerts flow

1. Gatus probes the shared services (the admin panel, Portainer, Healthchecks, Keycloak, Beszel, the Cloudflare tunnel and the reverse proxy), the latest backup, the container vulnerability report and every routed application on a fixed interval (about one to two minutes). After 3 consecutive failures it raises an alert, and after 2 successes it resolves it.
2. Each Gatus alert is posted to Healthchecks as one check per service, named `gatus-<service>`, created on the first failure.
3. Healthchecks sends each alert to the admin email, to the ntfy channel when it is set, and to the channels added in its own interface.
4. Scheduled jobs (backup, offsite copy, nightly maintenance, restart probe) ping Healthchecks as they run. A missed ping is itself the alert.
5. Beszel watches the server with rules created once and never overwritten: status (agent silent) for 5 minutes, CPU at 90% for 10 minutes, memory at 90% for 10 minutes, disk at 85% for 10 minutes. Its alerts go through Healthchecks, so they reach the same channels.

## Add notification channels in Healthchecks

Alerts reach the admin email and the ntfy channel above with no step here. More channels, for other people or other tools, are added in Healthchecks:

1. Open `https://healthchecks.yourdomain.com` and sign in (single sign-on).
2. Open the project's integrations page and add a channel: email, Slack, a webhook, or any other the page offers.
3. Check that the channel is attached to the checks to be notified. New checks, including the `gatus-` ones, use the project's channels.

Email channels need [Outgoing email](/en/configuration/email/).

## Where to look

- `https://gatus.yourdomain.com`: the Gatus status page.
- `https://healthchecks.yourdomain.com`: Healthchecks, with each job's last ping.
- `https://beszel.yourdomain.com`: Beszel, with the server's resource graphs.
- The **System** page of the admin panel shows active alerts and jobs not reporting yet.

The subdomain names can be changed in [Domain and Cloudflare](/en/configuration/domain/).

## Troubleshooting

- A job shows late or down in Healthchecks: the schedule is off or the job failed. Check [Schedules](/en/configuration/schedules/) and the **Log**.
- No alert email arrived: **Outgoing mail** is set to **No outgoing mail**, the admin email channel was detached from that check in Healthchecks, or the mail went to the spam folder.
- No notification on another channel: that channel is not attached to the check. Attach it as above.
- ntfy messages never arrive: both ntfy fields must be set, and the topic must match on the receiving side.
