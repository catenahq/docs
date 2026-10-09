---
title: "Configuration overview"
description: "Where the Settings page lives, how a save works, and the order in which a new server is configured."
---

An installed server asks for nothing beyond how to reach it. You set the domain, Cloudflare, backups, email, the private network and the rest afterwards in the admin panel, on the **Settings** page.

## Where Settings lives

**Settings** is in the left rail of the admin panel and is visible to administrators only. You reach the panel at:

- `https://dash.yourdomain.com` once you apply a domain;
- `http://localhost:9010` before that, through the SSH forward the installer keeps open (or reopens with `uvx catena-installer connect --inventory <name>`). Without the installer, the forward is:

```bash
ssh -N -L 9010:127.0.0.1:9010 -L 9000:127.0.0.1:9000 panel@<server-address>
```

Sign in with the admin email and the admin password shown once at install. See [Installation](/en/installation/).

## How a save works

- Each section of **Settings** is its own form with its own button. Saving one section never touches another.
- Every value is stored on the server and is part of every backup.
- A blank field keeps the stored value. Typing a value replaces it. Secrets already stored carry a **set** badge and are never shown again; fields that must be filled carry a **required** badge.
- A value the section cannot accept is refused as a whole: "Nothing was saved. Correct the fields marked below."
- Sections that end with **Save and apply** (Infrastructure app subdomains, Outgoing mail, Alerts and missed-job reporting, Sign-in requirements, Time zone and locale) bring the server up to date right away. The note under the button reads: "Saving applies these settings right away: the services that use them restart and are briefly unavailable." Progress shows in **Server configuration**, further down the page.
- Other sections have their own action: **Apply** for **Domain**, the join for **Admin access tunnel**, and a plain **Save** for the rest. Backup values are read by the backup itself and need no restart.
- If applying cannot start, the section reports: "Saved, but applying it did not start, most likely because the server is already updating its configuration." Run **Bring this server up to date** once the other work finishes to apply the saved values. See [Server settings](/en/configuration/server/).

## First-time setup order

The order below avoids dead ends: later steps rely on earlier ones.

1. [Subscription](/en/configuration/subscription/), if you bought a Catena Pro or Catena Business key. Saving the key first lets the later steps use the features it unlocks, such as schedules and extra domains.
2. [Domain and Cloudflare](/en/configuration/domain/): the Cloudflare API token, the domain, then **Apply**. Until you do this, the server runs without public addresses.
3. [Backups and S3 storage](/en/configuration/backups/): the repository and its keys, then **Generate backup encryption password**, then save the disaster-recovery keyset in a password manager.
4. [Schedules](/en/configuration/schedules/): turning on the backup and maintenance schedules (Catena Pro or Catena Business).
5. [Outgoing email](/en/configuration/email/): the mail service used for password resets, invitations and alerts.
6. [Admin access and tailnet](/en/configuration/admin-access/): the private network, then optionally **Close SSH on public port 22**.
7. [Alerts](/en/configuration/alerts/): the off-site heartbeat address and notification channels.
8. [Sign-in and people](/en/configuration/sign-in-and-people/): second-factor requirement and accounts.
9. [Server settings](/en/configuration/server/): time zone, locale and the manual configuration run.

## Other configuration pages

- [Updates](/en/configuration/updates/): the control panel version and how applications are kept current.
- [Vulnerabilities](/en/configuration/vulnerabilities/): what is scanned and how findings are shown.
- [Restore and migrate](/en/configuration/restore-and-migrate/): restoring from a backup and moving to another server.
- [Configure an app for Catena](/en/configure-apps/): wiring an application into sign-in and the dashboard.

## Paid panels

Some panels outside **Settings** need Catena Pro or Catena Business. A panel the subscription does not include is greyed in the menu and opens a short explanation. The editions are compared at [catena.run](https://catena.run/en/#pricing).
