---
title: Your VPS, your docs
description: Public reference docs for the catena self-hosted software suite. Per-VPS specifics live in the client portal.
---

These are the public reference docs for the catena software suite as
deployed on your VPS. Every page applies to **every catena
installation**; the per-installation specifics (your domain names,
your inventory hostname, your S3 bucket) are surfaced in the
[client portal](https://app.catena.run).

If you are evaluating catena, start with
[How this software suite works](/en/how-this-stack-works/) for the
plain-language tour. If you are an existing client, your portal
links into these docs in context for the operational tasks that come
up day-to-day.

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
- **[Email archive](/en/email-archive/)** -- how your email history is
  captured into your backups, and how to switch it on.

## Your subdomains

Every catena installation publishes the same set of subdomains
under your zone. Your portal shows the actual values for **your**
deployment. The shape:

| Service | Subdomain |
|---|---|
| Keycloak (identity + SSO) | `auth.yourdomain.com` |
| Portainer (app deployment) | `portainer.yourdomain.com` |
| Gatus (service health) | `monitor.yourdomain.com` |
| Homepage (dashboard) | `dash.yourdomain.com` |
| OliveTin (one-click actions) | `actions.yourdomain.com` |
| Healthchecks (cron / dead-man) | `checks.yourdomain.com` |

> **Note:** Throughout the docs, `yourdomain.com` is the business
> domain you provided at onboarding -- the input pill at the top of
> this page rewrites every occurrence on the fly so the URLs you
> see match your installation.
