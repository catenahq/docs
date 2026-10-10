---
title: "Alerts"
description: "The off-site heartbeat address in the alerts section, how missed jobs and failing services raise alerts, how alerts reach your admin email, and how you add more notification channels in Healthchecks."
---

Alerts come from three on-server tools: Gatus (is each service answering), Healthchecks (did each scheduled job report in) and Beszel (are CPU, memory and disk healthy). The overview is in [Monitoring and alerts](/en/features/monitoring-alerts/). This page covers the settings and the first-time wiring.

## Fields

**Settings** > **Alerts and missed-job reporting** holds the off-site heartbeat address. Scheduled jobs report to the Healthchecks on the server, which raises the alarm when a report is late or failed.

| Field | Purpose |
|---|---|
| **Off-site heartbeat address** | The ping address of a check at an outside monitoring service, such as a free healthchecks.io check. Used by the off-site heartbeat (Catena Pro), which you turn on in [Schedules](/en/configuration/schedules/). |

A monitor on the server cannot report an outage that takes the whole server down. The off-site heartbeat closes that gap: on its schedule, the server checks that its status page, job monitor and resource monitor answer, then calls the off-site address. A plain call means all is well; a failure call names the monitors that stopped answering; no call at all means the server is down, and the outside service raises the alert. Saving the address alone sends nothing: the heartbeat runs once you turn it on in [Schedules](/en/configuration/schedules/), where its section shows the period and grace time to set on the outside check. When your subscription ends, the calls stop, so pause the outside check then.

Alerts also reach your admin email, through the service chosen in [Outgoing email](/en/configuration/email/): while outgoing mail is set, the server keeps an email channel to your admin address in Healthchecks, attached to every check when the channel is created. A channel detached from a check in Healthchecks stays detached. With **No outgoing mail**, the channel is removed and alerts reach only the channels you add in Healthchecks.

The section ends with **Save and apply**; the services that use these values restart briefly.

## How alerts flow

1. Gatus probes the shared services (the admin panel, Portainer, Healthchecks, Keycloak, Beszel, the Cloudflare tunnel and the reverse proxy) and every routed application on a fixed interval (about one to two minutes). After 3 consecutive failures it raises an alert, and after 2 successes it resolves it.
2. Each Gatus alert is posted to Healthchecks as one check per service, named `gatus-<service>`, created on the first failure.
3. Healthchecks sends each alert to your admin email and to the channels added in its own interface.
4. Scheduled jobs (backup, offsite copy, nightly maintenance, restart probe, off-site heartbeat) ping Healthchecks as they run. A missed ping is itself the alert. The checks of the backup, the offsite copy and the off-site heartbeat follow the schedules of the jobs that report to them; while none of those jobs is turned on, the check is paused, so it never goes late.
5. Beszel watches the server with rules created once and never overwritten: status (agent silent) for 5 minutes, CPU at 90% for 10 minutes, memory at 90% for 10 minutes, disk at 85% for 10 minutes. Its alerts go through Healthchecks, so they reach the same channels.

## Add notification channels in Healthchecks

Alerts reach your admin email with no step here. You add more channels, for other people or other tools, in Healthchecks:

1. Open `https://healthchecks.yourdomain.com` and sign in (single sign-on).
2. Open the project's integrations page and add a channel: email, Slack, ntfy, a webhook, or any other the page offers.
3. Check that the channel is attached to the checks you want notified. New checks, including the `gatus-` ones, use the project's channels.

Email channels need [Outgoing email](/en/configuration/email/).

## Where to look

- `https://gatus.yourdomain.com`: the Gatus status page.
- `https://healthchecks.yourdomain.com`: Healthchecks, with each job's last ping.
- `https://beszel.yourdomain.com`: Beszel, with the server's resource graphs.
- The **System** page of the admin panel shows active alerts and jobs not reporting yet.

You can change the subdomain names in [Domain and Cloudflare](/en/configuration/domain/).

## Troubleshooting

- A job shows late or down in Healthchecks: the job failed, or did not run at its schedule. Check the **Log** and [Schedules](/en/configuration/schedules/).
- No alert email arrived: **Outgoing mail** is set to **No outgoing mail**, your admin email channel was detached from that check in Healthchecks, or the mail went to the spam folder.
- No notification on another channel: that channel is not attached to the check. Attach it as above.
- A channel you added never delivers: check its address or topic in Healthchecks against the receiving side.
