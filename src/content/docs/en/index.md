---
title: Your VPS, your docs
description: Public reference docs for the catena self-hosted software suite.
---

These are the public reference docs for the catena software suite as
deployed on your VPS. Every page applies to **every catena
installation**; the per-installation specifics (your domain names,
your inventory hostname, your S3 bucket) are the ones your own
deployment was set up with.

If you are evaluating catena, start with
[How this software suite works](/en/how-this-stack-works/) for the
plain-language tour.

## Where to start

- **[How this software suite works](/en/how-this-stack-works/)** -- a
  plain-language tour of the services and how they fit together.
  Start here if this is your first time.
- **[Where your data lives](/en/where-is-my-data/)** -- what's on
  the VPS, what's in your S3 backup bucket, what's lost if the VPS
  burns down.
- **[Files you should not touch](/en/do-not-touch/)** -- the VPS runs
  the whole machine and manages its own files. Here's the one rule to
  follow.

## Day-to-day

- **[Manage users and roles](/en/manage-users-and-roles/)** -- create
  accounts in Keycloak and assign the role that decides which apps
  each person reaches.
- **[Manage apps](/en/manage-apps/)** -- deploy new apps and set the
  labels that gate access and publish the URL.
- **[What you can do yourself](/en/self-service/)** -- day-to-day
  tasks that never need to reach us.

## Tasks

- **[Recurring tasks](/en/disaster-prevention/)** -- the short
  checklist to run at onboarding, once a month, and once a year so
  recovery is always possible.
- **[Recovering from a failure](/en/disaster-recovery/)** -- what
  happens, and what you do, when the VPS is lost.
- **[Rebuild your server yourself](/en/self-restore/)** -- the
  one-script flow you can run to spin up a replacement.

## Your subdomains

Every catena installation publishes the same set of subdomains
under your zone. The shape:

| Service | Subdomain |
|---|---|
| Keycloak (identity + SSO) | `auth.yourdomain.com` |
| Portainer (app deployment) | `portainer.yourdomain.com` |
| Gatus (service health) | `monitor.yourdomain.com` |
| catena-admin (your dashboard + one-click actions) | `dash.yourdomain.com` |
| Healthchecks (cron / dead-man) | `heartbeat.yourdomain.com` |

> **Note:** Throughout the docs, `yourdomain.com` is the business
> domain you provided at onboarding -- the input pill at the top of
> this page rewrites every occurrence on the fly so the URLs you
> see match your installation.
