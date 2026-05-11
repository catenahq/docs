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
[How this software suite works](/docs/how-this-stack-works/) for the
plain-language tour. If you are an existing client, your portal
links into these docs in context for the operational tasks that come
up day-to-day.

## Where to start

- **[How this software suite works](/docs/how-this-stack-works/)** -- a
  plain-language tour of the services and how they fit together.
  Start here if this is your first time.
- **[Where your data lives](/docs/where-is-my-data/)** -- what's on
  the VPS, what's in your S3 backup bucket, what's lost if the VPS
  burns down.
- **[Files you should not touch](/docs/do-not-touch/)** -- hand-edits
  get overwritten the next time your operator pushes an update.
  Here's what to leave alone.

## Day-to-day tasks

- **[Add / remove users](/docs/how-to-add-users/)** -- Keycloak
  walkthrough for staff onboarding + password resets.
- **[Deploy apps (per-department access)](/docs/how-to-deploy-apps/)**
  -- gate new apps to specific teams using compose labels.
- **[What you can do yourself](/docs/self-service/)** -- day-to-day
  tasks that never need your operator.

## Disaster handling

- **[Disaster prevention](/docs/disaster-prevention/)** -- how the
  suite reduces the blast radius of common failures.
- **[Disaster recovery](/docs/disaster-recovery/)** -- what happens
  when the VPS is lost.
- **[Self-restore](/docs/self-restore/)** -- the one-script flow you
  can run yourself to spin up a replacement.

## Your subdomains

Every catena installation publishes the same set of subdomains
under your zone. Your portal shows the actual values for **your**
deployment. The shape:

| Service | Subdomain |
|---|---|
| Keycloak (identity + SSO) | `auth.yourdomain.com` |
| Dokploy (app deployment) | `admin.yourdomain.com` |
| Gatus (service health) | `monitor.yourdomain.com` |
| Homepage (dashboard) | `dash.yourdomain.com` |
| OliveTin (one-click actions) | `actions.yourdomain.com` |
| Healthchecks (cron / dead-man) | `checks.yourdomain.com` |

> **Note:** Throughout the docs, `yourdomain.com` is the business
> domain you provided at onboarding -- the input pill at the top of
> this page rewrites every occurrence on the fly so the URLs you
> see match your installation.
