---
title: Your VPS, your docs
description: Public reference docs for the catena self-hosted stack. Per-VPS specifics live in the client portal.
---

This wiki documents the catena stack as deployed on your VPS. Every
page applies to **every catena installation**; the per-installation
specifics (your domain names, your inventory hostname, your S3
bucket) are surfaced in the [client portal](https://app.catena.run).

## Where to start

- **[How this stack works](/docs/how-this-stack-works/)** -- a
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
  stack reduces the blast radius of common failures.
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
| Keycloak (identity + SSO) | `auth.<your-zone>` |
| Dokploy (app deployment) | `admin.<your-zone>` |
| Gatus (service health) | `monitor.<your-zone>` |
| Homepage (dashboard) | `dash.<your-zone>` |
| OliveTin (one-click actions) | `actions.<your-zone>` |
| Healthchecks (cron / dead-man) | `checks.<your-zone>` |
| Per-VPS wiki (this site, served from your VPS) | `vps-docs.<your-zone>` |

> **Note:** This site is also served from your own VPS at
> `vps-docs.<your-zone>`. The VPS-served copy is byte-identical to
> docs.catena.run -- both come from the same release artifact. The
> on-VPS copy is a sovereignty + offline fallback; treat them as
> interchangeable.
