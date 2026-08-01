---
title: VPS reference docs
description: Public reference docs for the catena self-hosted software suite.
---

These are the public reference docs for the catena software suite as
deployed on a VPS. Every page applies to **every catena
installation**; the per-installation specifics (domain names,
inventory hostname, S3 bucket) are the ones that particular
deployment was set up with.

For an evaluation, [How this software suite works](/en/how-this-stack-works/)
is the plain-language tour.

## Where to start

- **[How this software suite works](/en/how-this-stack-works/)** -- a
  plain-language tour of the services and how they fit together. The
  place to begin on a first read.
- **[Where the data lives](/en/where-is-my-data/)** -- what sits on
  the VPS, what sits in the S3 backup bucket, what is lost if the VPS
  burns down.
- **[Files that must not be edited](/en/do-not-touch/)** -- the VPS runs
  the whole machine and manages its own files. One rule covers it.

## Day-to-day

- **[Manage users and roles](/en/manage-users-and-roles/)** -- create
  accounts in Keycloak and assign the role that decides which apps
  each person reaches.
- **[Manage apps](/en/manage-apps/)** -- deploy new apps and set the
  labels that gate access and publish the URL.
- **[What the admin panel covers](/en/self-service/)** -- day-to-day
  tasks that never need to reach us.

## Tasks

- **[Recurring tasks](/en/disaster-prevention/)** -- the short
  checklist to run at onboarding, once a month, and once a year so
  recovery is always possible.
- **[Recovering from a failure](/en/disaster-recovery/)** -- what
  happens, and what to do, when the VPS is lost.
- **[Rebuilding a server from backup](/en/self-restore/)** -- the
  one-script flow that spins up a replacement.

## The subdomains

Every catena installation publishes the same set of subdomains
under its zone. The shape:

| Service | Subdomain |
|---|---|
| Keycloak (identity + SSO) | `auth.yourdomain.com` |
| Portainer (app deployment) | `portainer.yourdomain.com` |
| Gatus (service health) | `monitor.yourdomain.com` |
| catena-admin (the dashboard + one-click actions) | `dash.yourdomain.com` |
| Healthchecks (cron / dead-man) | `heartbeat.yourdomain.com` |

> **Note:** Throughout the docs, `yourdomain.com` stands for the business
> domain given at onboarding -- the input pill at the top of
> this page rewrites every occurrence on the fly so the URLs shown
> match the installation they describe.
