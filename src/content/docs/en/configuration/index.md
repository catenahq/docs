---
title: "Configuration overview"
description: "Where the Settings page lives, how a save works, and the order in which a new server is configured."
---

An installed server asks for nothing beyond how to reach it. You set the domain, Cloudflare, backups, email, the private network and the rest afterwards in the admin panel, on the **Settings** page.

## Where Settings lives

**Settings** is in the left menu of the admin panel and is visible to administrators only. You reach the panel at:

- `https://dash.yourdomain.com` once you apply a domain;
- `http://localhost:9010` before that, through the SSH forward the installer keeps open (or reopens with `uvx catena-installer connect --inventory <name>`). Without the installer, the forward is:

```bash
ssh -N -L 9010:127.0.0.1:9010 -L 9000:127.0.0.1:9000 panel@<server-address>
```

Sign in with the admin email and the admin password shown once at install. See [Installation](/en/installation/).

## How a save works

- **Settings** shows one section at a time. Choose it from the **On this page** card at the right of the page (a list above the section on a narrow screen); the **Setup guide** shows until you do.
- A section whose badge is **Pending**, **Not checked** or **Failed** carries a short hint at the top saying the next action. The close button at its end hides it in that browser; it shows again if the section's state changes.
- The page checks saved values by itself when it opens, for each section in use that has no passing check of its current values on record, or whose last check is more than 30 days old. **Domain** reads the domains the Cloudflare token reaches, **Backup repository** lists the repository, and **Outgoing mail** signs in without sending anything. The badge reads **Checking** until the answer, then **Applied**, or **Failed** with the reason in its tooltip. A server that does not answer leaves it **Not checked**. The check runs once: the answer is kept, and later visits read it.
- **Admin access tunnel** and **Alerts and missed-job reporting** are checked only by their **Test** buttons, because their check creates a short-lived key at the provider or calls the outside monitor. Until the button is pressed, or once its last answer is more than 30 days old, their badge is the gray **Not checked**. The badge reads **Pending** only for a saved change that the server has not applied yet. **Disaster-recovery keyset** reads **To do** until you show its keys once. A section that only a server configuration run applies (Infrastructure app subdomains, Sign-in requirements, Time zone and locale) reads **Applied** once the last run of **Bring this server up to date** succeeded.
- A section that is part of Catena Pro or Catena Business (**Alerts and missed-job reporting**, **Vulnerabilities**, **Offsite copies**, **Error reports to Catena support**) carries a **Pro** or **Business** badge beside its name, in the card and in the section. The badge is gray while the subscription does not include the section, and selecting it opens the page that explains the edition; it turns green once the subscription includes the section, which then also shows its check badge when it is in use.
- Each section of **Settings** is its own form with its own button. Saving one section never touches another.
- The answer to a button shows right under that button, and the page stays where you are. A banner at the top of the page links to the answer when it must not be missed: a secret shown once (the backup password, the disaster-recovery keys), a refused save that leaves a setup step undone (domain, backup repository and password, outgoing mail), and an action that takes the server or the panel away for a while (a panel update, a restart, a configuration update, a restore).
- Every value is stored on the server and is part of every backup.
- A blank field keeps the stored value. Typing a value replaces it. Secrets already stored carry a **set** badge and are never shown again; fields that must be filled carry a **required** badge.
- A value the section cannot accept is refused as a whole: "Nothing was saved. Correct the fields marked below."
- Sections that end with **Save and apply** (Infrastructure app subdomains, Outgoing mail, Alerts and missed-job reporting, Sign-in requirements, Time zone and locale) bring the server up to date right away. The note under the button reads: "Saving applies these settings right away: the services that use them restart and are briefly unavailable." Progress shows in the section you saved.
- Other sections have their own action: **Apply** for **Domain**, the join for **Admin access tunnel**, and a plain **Save** for the rest. Backup values are read by the backup itself and need no restart.
- If the server is already updating its configuration, the section reports: "Saved. The server is already updating its configuration, and will apply this change as soon as that finishes." The server applies the saved values in one more run right after the running one; there is nothing to repeat.
- If applying can neither start nor be queued, the section reports: "Saved, but applying it did not start, most likely because the server is already updating its configuration." Run **Bring this server up to date** once the other work finishes to apply the saved values. See [Server settings](/en/configuration/server/).

## First-time setup order

The order below avoids dead ends: later steps rely on earlier ones. The **Setup guide**, the first section of **Settings**, lists the same steps with the badge of each and a link to its section, and marks the next one to do. The domain, the backups, the backup schedule and the disaster-recovery keyset are the required steps; the **Backup schedule** step links to the **Backup** section of **Schedules** and shows its state, **On**, **Slower**, **Refused** or **To do** while it is off. Once all four are applied, the guide shrinks to one line that opens the list.

1. [Subscription](/en/configuration/subscription/), if you bought a Catena Pro or Catena Business key. Saving the key first lets the later steps use the features it unlocks, such as faster schedules and extra domains.
2. [Domain and Cloudflare](/en/configuration/domain/): the Cloudflare API token, the domain, then **Apply**. Until you do this, the server runs without public addresses.
3. [Backups and S3 storage](/en/configuration/backups/): the repository and its keys, then **Generate backup encryption password**, then save the disaster-recovery keyset in a password manager.
4. [Schedules](/en/configuration/schedules/): turning on the backup schedule, at most once a week on every edition, and the maintenance schedules (Catena Pro or Catena Business).
5. [Outgoing email](/en/configuration/email/): the mail service used for password resets, invitations and alerts.
6. [Admin access and tailnet](/en/configuration/admin-access/): the private network, then optionally **Close SSH on public port 22**.
7. [Alerts](/en/configuration/alerts/): the off-site heartbeat address and notification channels.
8. [Sign-in and people](/en/configuration/sign-in-and-people/): second-factor requirement and accounts.
9. [Server settings](/en/configuration/server/): time zone, locale and the manual configuration run.

## Other configuration pages

- [Updates](/en/configuration/updates/): the control panel version and how applications are kept current.
- [Vulnerabilities](/en/configuration/vulnerabilities/): the security alerts every edition gets, what is scanned and how findings are shown.
- [Restore and migrate](/en/configuration/restore-and-migrate/): restoring from a backup and migrating to another server.
- [Configure an app for Catena](/en/configure-apps/): wiring an application into sign-in and the dashboard.

## Paid panels

Some panels outside **Settings** need Catena Pro or Catena Business. A panel the subscription does not include is greyed in the menu and opens a short explanation. The editions are compared at [catena.run](https://catena.run/en/#pricing).
