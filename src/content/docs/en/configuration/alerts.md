---
title: "Alerts"
description: "Choosing which alerts the server sends and where they go: email addresses and webhook addresses, the test alert, the Alerts page, the off-site heartbeat address, and how service, resource and job alerts reach you."
---

The server tells you about its own events: an update available or failed, a vulnerability, a restart needed, a certificate not renewed, the paid features locking, and alerts that stop reaching a destination. Every alert is off until you turn it on, except **Paid features locked**. Each alert goes to the email addresses you list and to the webhook addresses you save, on every edition.

Alerts about services and resources come from two other on-server tools: Gatus (is each service answering) and Beszel (are CPU, memory and disk healthy). They hand their alerts to the control panel, which sends them like every other alert, and you choose them in the same section. The scheduled jobs report each run to the control panel itself, which raises a job that failed or did not run. The overview is in [Monitoring and alerts](/en/features/monitoring-alerts/). This page covers the settings and the first-time wiring.

## Fields

**Settings** > **Alerts** holds these fields, then the **Webhook addresses** card below it.

| Field | Purpose |
|---|---|
| **Alert email addresses** | Up to ten email addresses, each just the address, separated by commas or spaces. Leave it empty to send to the admin email. |
| One field per alert | **Off** or **On**. See [Alert types](#alert-types). |
| **Lowest vulnerability level named in alerts** | The threshold of the vulnerability alerts. **Exploited vulnerabilities only** names the ones CISA lists as exploited. **Exploited and critical vulnerabilities** adds the critical ones fixed by an update on offer. **Exploited, critical and high vulnerabilities** adds the high ones fixed by an update on offer. It reads as the first one until you choose another. |
| **Off-site heartbeat address** | The ping address of a check at an outside monitoring service, such as a free healthchecks.io check. Used by the off-site heartbeat (Catena Pro), which you turn on in [Schedules](/en/configuration/schedules/). See [Off-site heartbeat](#off-site-heartbeat). |

A blank **Alert email addresses** field leaves the list as it is. To empty the list, tick **Send to the admin email only** under the field and save. Nothing is saved while an address is refused: the field shows "Up to ten email addresses, each just the address, separated by commas or spaces."

The section ends with **Save**, **Send a test heartbeat** and **Send a test alert**. A save takes effect at once and restarts nothing. Everything in the section is free except the off-site heartbeat: without Catena Pro, its address and its **Send a test heartbeat** button are shown locked, with a notice.

## Alert types

Each alert has its own field, named as in the first column. A failure alert has two more fields, named like it with ": message when it ends" and ": reminder every seven days". An alert that asks you to do something has the first of the two, and **Emergency patch** has neither. Every one of these fields is **Off** until you turn it on, except **Paid features locked**, which is **On**; its message when it ends is **Off**.

| Alert | Raised when | Message when it ends | Reminder |
|---|---|---|---|
| **Panel update available** | A newer version of the control panel is on offer. | The panel now runs it. | No |
| **Application update available** | An update is on offer for an application. One alert for each application. | No update is on offer any more. | No |
| **Application update failed** | An update failed its checks and was rolled back, or the deployment of the application failed. | An update of the application succeeded. | Yes |
| **Vulnerability in an application** | The vulnerability watch alerts on an application, by the rule in [Security alerts](/en/configuration/vulnerabilities/#security-alerts-every-edition), at or above the level you chose. | No vulnerability at that level remains, or the application is gone. | No |
| **Update fixes a vulnerability** | An update on offer replaces the images of an application that carries those vulnerabilities. | The update was applied, or the vulnerabilities are gone. | No |
| **Emergency patch** | An emergency patch ran, or was refused, with its outcome. | Never ends. | No |
| **Restart needed** | Installed updates take effect only after the server restarts. | The server restarted. | No |
| **Restart failed** | A restart by the maintenance did not bring everything back. | A later restart brought everything back. | Yes |
| **Certificate not renewed** | An application's certificate is missing, has a fifth of its life left, or a renewed one has not reached the application for over a day. | The certificate was renewed. | Yes |
| **Paid features locked** | The subscription locks the paid features. See [Subscription](/en/configuration/subscription/). | The features unlocked, or the key was removed. | No |
| **Subscription check failing** | The subscription service has not been reachable to confirm the key. The paid features stay unlocked during the grace period. | The service answered, the grace ended, or the key was removed. | No |
| **Alerts not delivered** | A destination has failed for a day. | Delivery to it works again. | Yes |
| **Service down** | The status monitor (Gatus) reports a service down. One alert, then one more when it is back if the message when it ends is on. | The status monitor reports the service back up. | Yes |
| **Resource alert** | The resource monitor (Beszel) raises one of its rules: the server silent, or processor, memory or disk past its threshold. See [How service and job alerts flow](#how-service-and-job-alerts-flow). | The resource monitor reports the rule clear. | Yes |
| **Backup failed** | A backup run failed. A backup held after a restore raises this alert only: the offsite copy and the restore test record a skipped run. | A later backup succeeded. | Yes |
| **Restore test failed** | A run of the restore test failed. | A later restore test succeeded. | Yes |
| **Offsite copy failed** | A run of the offsite copy failed. | A later offsite copy succeeded. | Yes |
| **Backup repository check failed** | A run of the backup repository check failed. | A later backup repository check passed. | Yes |
| **Scheduled job late** | A job reported no run by its schedule plus a margin (see the rule below), or the maintenance, the vulnerability watch or the off-site heartbeat ended a run failed. | The job reported a run that passed. | Yes |

How an alert behaves:

- **Turning an alert on sends what is open now,** once. An emergency patch that ran while its alert was off is not sent later.
- **One message for each alert type** carries everything due for it at that moment, so several applications raising the same alert together arrive as one message. When **Vulnerability in an application** and **Update fixes a vulnerability** are both on, one message names the vulnerabilities and the update.
- **A reminder** repeats an alert that is still open every seven days.
- **A job is late** when it reports no run by its schedule plus a margin. A job that is turned off, or that your edition does not run, is never late.
- **Nothing is sent without a destination.** With no outgoing mail and no webhook address, an alert that is on stays quiet. **Send a test alert** says so.

## Destinations

### Email

Each alert goes as one email to each address of the list, or to the admin email when the list is empty, through the service chosen in [Outgoing email](/en/configuration/email/). With **No outgoing mail**, no email is sent and only the webhook addresses are used.

The subject reads `Catena yourdomain.com: panel update available / mise à jour du panneau disponible`. The body is in English, then `--`, then French, and each language ends with where to turn the alert off.

### Webhook addresses

The **Webhook addresses** card sends alerts to chat and notification services that take a web address. Paste up to ten addresses, separated by spaces, in **Webhook addresses, separated by spaces, up to ten**, then press **Save the webhook addresses**.

- **Only public https addresses are accepted.** An address that leads to the server itself, its containers, a private network or a local network is refused, at saving and at every sending. A redirect is not followed. A refused address is listed by its position with the reason, for example "Address 2: the address must start with https://.", and nothing is saved until every address passes.
- **Saving replaces the whole list.** The addresses stay on the server and are never shown again. The card shows how many are saved, and each one's position and host, for example "Address 1: chat.example.net". It never shows an address.
- **To remove them all,** tick **Remove every webhook address** and press **Save the webhook addresses**. A blank field without the box saves nothing.

Each address receives one POST for each message, with `Content-Type: application/json`, and a 2xx answer counts as delivered:

```json
{"title": "...", "text": "...", "content": "...", "allowed_mentions": {"parse": []}}
```

`text` and `content` hold the same words: the English text, `--`, then the French, at most 2000 characters, with the longest lists shortened to "and `<count>` more". `allowed_mentions` asks services that read it, such as Discord, not to notify anyone named in the text. Each address is its own destination: one that fails does not hold back the others.

| Service | Address to paste | Reads |
|---|---|---|
| Slack incoming webhook | The address Slack gives. | `text` |
| Discord webhook | The address Discord gives. | `content` |
| Matrix (hookshot generic webhook) | The address hookshot gives. | `text` |
| ntfy | `https://HOST/TOPIC?tpl=yes&t=%7B%7B.title%7D%7D&m=%7B%7B.text%7D%7D`, with your ntfy host and topic in place of `HOST` and `TOPIC`. | The template in the address. |

After saving, press **Send a test alert** to see whether the service takes the message.

### Send a test alert

**Send a test alert** sends one test message to every destination at once, whatever the alert switches say, and answers beside the button:

- "A test alert was sent to every destination."
- "The test alert did not reach every destination." followed by each destination that failed and why.
- "The test alert reached no destination."
- "Nothing to send to yet: set up outgoing mail, or add a webhook address."

The result also updates the state of each destination on the Alerts page.

A destination that does not answer is tried again after a longer wait each time, up to one hour, and given up on after 24 hours. The reason is always in words: "the mail relay could not be reached", "no answer came in time", "the secure connection failed", "the mail relay refused it (code `<number>`)", "the service answered with error `<number>`", "the address leads to this server or a private network, where alerts are not sent", or "the sending failed".

## The Alerts page

**Alerts** in the main menu, for an administrator, shows what the server has raised and where it goes. Its **Alert settings** link opens **Settings** > **Alerts**.

- **Sending** gives the time of the last check, says whether the emails go to the admin email or how many addresses the list holds, and warns when outgoing mail is not set up.
- **Destinations** lists each destination by its kind and position, and a webhook by its host, never by its address, with its state: "Working. Last delivery `<time>`.", "Nothing has been sent to it yet.", "The last attempt failed (`<time>`): `<reason>`." or "Failing since `<time>`: `<reason>`."
- **Open alerts** lists what is open now, since when, whether it was sent or is waiting to be sent, and when the next reminder is due.
- **Recent history** lists what happened in the last 30 days: alert raised, condition ended, message sent, ending message sent, reminder sent, sending given up and dropped.

When a destination has failed for a day, a banner on every admin page reads "Alerts are not reaching one of their destinations. The Alerts page shows which." and links to the page. The **Alerts not delivered** alert, when it is on, tells you through the other destinations.

## Off-site heartbeat

A monitor on the server cannot report an outage that takes the whole server down. The off-site heartbeat closes that gap: on its schedule, the server checks that its status monitor, resource monitor and alert intake answer and that the control panel's alerts ran in the last 3 minutes, then calls the off-site address. A plain call means all is well; a failure call names the monitors that stopped answering; no call at all means the server is down, and the outside service raises the alert. Saving the address alone sends nothing: the heartbeat runs once you turn it on in [Schedules](/en/configuration/schedules/), where its section shows the period and grace time to set on the outside check. When your subscription ends, the calls stop, so pause the outside check then.

**Send a test heartbeat** runs the heartbeat once now, on the saved address, and shows beside the button whether the outside service took the call, or which monitor on the server did not answer. It needs Catena Pro.

## How service and job alerts flow

Service, resource and scheduled job alerts are all sent by the control panel, to the email addresses and webhook addresses of **Settings** > **Alerts**, through the service chosen in [Outgoing email](/en/configuration/email/).

1. Gatus probes the shared services (the admin panel, Keycloak, Beszel, the Cloudflare tunnel and the reverse proxy) and every routed application on a fixed interval (about one to two minutes). After 3 consecutive failures it raises an alert, and after 2 successes it resolves it.
2. Gatus posts each alert to the control panel, which sends it as **Service down** when that alert is on.
3. Beszel watches the server with rules created once and never overwritten: status (agent silent) for 5 minutes, CPU at 90% for 10 minutes, memory at 90% for 10 minutes, disk at 85% for 10 minutes. It posts each alert to the control panel, which sends it as **Resource alert** when that alert is on.
4. Scheduled jobs (backup, repository check, restore test, offsite copy, maintenance, vulnerability watch, off-site heartbeat, restart probe) report each run to the control panel. A run that failed raises the job's own alert (**Backup failed**, **Restore test failed**, **Offsite copy failed**, **Backup repository check failed**) or, for the others, **Scheduled job late**. The control panel itself notices a job that missed its run, by its schedule plus a margin. The maintenance reports to the backup and offsite copy only while its backup and offsite copy steps are on (see [Choosing the steps](/en/configuration/schedules/#choosing-the-steps)). The vulnerability watch also raises **Scheduled job late** when it cannot run (see [the second alert on the Vulnerabilities page](/en/configuration/vulnerabilities/#alerts)).

## Send error reports to Catena support

**Settings** > **Error reports to Catena support** lets a server tell Catena when one of Catena's own checks fails or recovers. It is on every edition and off until you turn it on. On Catena Pro or Catena Business, support can then help you before a small fault becomes a large one. Without a paid subscription, the reports help Catena find and fix problems in the product: the server signs up with a random install identity it keeps for itself, tied to no licence, and a report opens no support ticket.

To turn it on:

1. Read the report the section shows. It is the report this server would send right now.
2. Tick the box that confirms you agree, then press **Turn error reports on**. Within five minutes the server signs up with Catena support.

To turn it off, press **Turn error reports off**. The server stops sending at once and signs off.

A report names each open alert and failing check, since when, the application it concerns, your Catena version and your edition. It never names a vulnerability. It never holds what is inside your applications: no files, log lines, user accounts, email or network addresses, or domain names. A report is sent only when the list of failing checks changes or a one-off event happens.

Below the switch, the section lists the last 100 reports sent, newest first, each with the exact text that left the server and whether Catena support received it.

When a failed job wrote text about what went wrong, that text stays on your server. Without a paid subscription, it is not sent. On Catena Pro or Catena Business, the list offers it for each report that has some:

- **Download the job output** saves the text as it is.
- **Review and send to Catena support** opens the text in a box. Remove whatever you do not want support to see, then press **Send this text to Catena support**. Only the text in the box is sent, and the list shows exactly what you sent.

Support tickets and replies come with Catena Pro and Catena Business, and support answers Monday to Friday, 08:00 to 17:00. Error reports are not round-the-clock monitoring, and a server that is switched off or cannot reach the internet sends nothing: for that, use the [off-site heartbeat](#off-site-heartbeat).

## Where to look

- `https://gatus.yourdomain.com`: the Gatus status page.
- `https://beszel.yourdomain.com`: Beszel, with the server's resource graphs.
- The **System** page of the admin panel: the title of **Resources** opens Beszel, the title of **Monitoring** opens Gatus, and the title of **Alerts** opens the **Alerts** page. The **Alerts** card lists what needs attention now (each scheduled job that failed or is late, a pending restart, and each resource alert, named by its key), and "No alert" when there is nothing; the services that are down are on the **Monitoring** card; the **Scheduled jobs** card names each job that is turned on, with a grey dot and "not reporting yet" for one that has not reported.

You can change the subdomain names in [Domain and Cloudflare](/en/configuration/domain/).

## Troubleshooting

- An alert you turned on never arrives: check that a destination exists (outgoing mail set, or a webhook address saved), then press **Send a test alert**. The **Alerts** page shows each destination's state and what is waiting to be sent.
- An alert arrives only once: an alert is sent once while its condition lasts. Turn on its reminder to hear about it again every seven days.
- Nothing arrives by email, but webhooks work: **Send mail through** is set to **No outgoing mail** in **Settings** > **Outgoing mail**, or the mail went to the spam folder.
- A webhook address is refused: it must be a public https address, and not one that leads to this server or a private network. The card lists each refused address by its position with the reason.
- A job shows failed or late on the **System** page: the job failed, or did not run at its schedule. Check the **Log** and [Schedules](/en/configuration/schedules/).
- A failed or late job sent no message: turn on its alert in **Settings** > **Alerts** (**Backup failed**, **Restore test failed**, **Offsite copy failed**, **Backup repository check failed** or **Scheduled job late**). Every one is off until you do.
