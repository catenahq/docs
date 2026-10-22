---
title: "What is Catena?"
description: "Catena is a software suite installed on a server you own: the apps your business runs on, plus the environment that keeps them reachable, signed-in, backed up, updated and monitored."
---

Catena is a software suite installed on a server you own. It brings two things together: the apps your business runs on (files, email, chat, booking, CRM and more), and the environment that keeps those apps reachable, signed-in, backed up, updated and monitored. Everything runs on your own server and accounts.

## Who it is for

Small and mid-size organizations that want to own the software they depend on, with an admin who is comfortable with SSH. Catena is fully self-hosted: you own and run the server, and you do every task from the admin panel or with standard tools.

## What is installed

| Component | Role |
|---|---|
| Cloudflare tunnel | Carries all web traffic to the server, so no web port is open on the machine. |
| Traefik | Routes each address to the right app. |
| Keycloak | One sign-on for every app, with groups deciding who can open what. |
| catena-admin | The admin panel: apps (add, configure, start, stop, update and remove them), status, actions, restore, schedules and settings. |
| restic backups | Encrypted backups sent to S3 storage you own. |
| Gatus, Healthchecks, Beszel | Status page, missed-job alarms, and server resource graphs. |
| Tailnet (optional) | A private network for administration. |

## Addresses the server publishes

Once you apply a domain, each service answers on its own subdomain of `yourdomain.com`:

| Subdomain | Service |
|---|---|
| `auth.yourdomain.com` | Keycloak sign-in |
| `dash.yourdomain.com` | The admin panel |
| `gatus.yourdomain.com` | Gatus status page |
| `healthchecks.yourdomain.com` | Healthchecks |
| `beszel.yourdomain.com` | Beszel resource graphs |

You can change each name in **Settings** > **Infrastructure app subdomains**. Until you apply a domain, nothing is published and you reach the panel through an SSH forward (see [Installation](/en/installation/)).

## Editions

Community is free and fully functional: apps, single sign-on, manual backups and a weekly scheduled backup, whole-server restore, manual panel and Docker engine updates, monitoring and security alerts. Catena Pro and Catena Business unlock more panel and automation features, such as daily backups and other schedules, managed updates, People and offsite copies, with a subscription key. Your applications and data are never locked. The comparison is on the [pricing page](https://catena.run/en/#pricing).

## Data ownership

The server, the domain, the Cloudflare account, the backup storage and the sign-on accounts all belong to you. Backups are standard restic repositories that any computer can read with your backup password, and you can remove the panel without touching the apps. See [Backup, restore, and migrate](/en/features/backup-restore-migrate/).

## Where to start

1. [Installation](/en/installation/): requirements and the installer.
2. [Configuration overview](/en/configuration/): the first-time setup order.
3. Features: [Secure connections](/en/features/secure-connections/), [Backup, restore, and migrate](/en/features/backup-restore-migrate/), [Single sign-on](/en/features/single-sign-on/), [Safe updates](/en/features/safe-updates/), [Admin dashboard](/en/features/admin-dashboard/), [Monitoring and alerts](/en/features/monitoring-alerts/).
4. [Configure an app for Catena](/en/configure-apps/): add an app from a repository, then routing, access and updates.
