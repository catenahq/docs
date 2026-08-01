---
title: "How this software suite works"
description: "A plain-language tour of what runs on `your VPS`"
---

A plain-language tour of what runs on `your VPS`
and how the pieces fit together. None of it needs memorizing -- it is
here so that when something misbehaves, there is a mental model for
where to look first.

## The one-paragraph version

When a staff member types one of the suite's URLs into a browser, the
request enters through **Cloudflare** (which hides the VPS's real
address), crosses a private tunnel into `your VPS`,
hits a router (**Traefik**) that figures out which app it is for,
then gets stopped at **Keycloak** -- the identity layer -- to prove
the person is signed in and in the right team. Only then does the
request reach the actual application. Meanwhile, another process
quietly backs everything up to a client-owned S3 bucket with each
backup, and a monitor pings each service every minute to catch
outages before anyone reports them.

## The services at a glance

| Service | What it does |
|---|---|
| **Cloudflare** | The public front door. Hides the VPS's IP, issues HTTPS certificates, and absorbs bad traffic. |
| **Cloudflare Tunnel** | A private link between Cloudflare and the VPS. Nothing on `your VPS` is exposed directly to the internet. |
| **Tailscale** | The private way onto the box. A mesh network only authorised machines are on -- it is the SSH path into `your VPS` for maintenance or investigation, for the client and anyone they invite to help, and the way back in if the web dashboards ever fail. Public SSH is closed, so without Tailscale (or Cloudflare, for staff traffic) nothing reaches the VPS. Control stays client-side: Tailscale can be disabled or removed at any time from the VPS provider's console (or physically, for on-premises hardware). |
| **Traefik** | The switchboard. Reads the URL in each request and routes it to the right application. |
| **Keycloak** | The identity server. Handles sign-in, password resets, and team-based access control. The only login page users ever see. |
| **Portainer** | The deployment panel. Where new apps are installed and updated, and where logs are readable. |
| **Apps** | Whatever has been deployed through Portainer -- one container per app, running on a private Docker network. |
| **Gatus** | The health monitor. Probes every service every minute from two angles: internally (is the container up?) and externally (is the whole path from Cloudflare to the app still working?). |
| **Healthchecks** | The notification hub. Every alert from Gatus (services down) and the backup engine (missed backup) lands here, wired to whichever channels are configured -- email, Slack, Discord, ntfy, and ~30 others. See [How alerts get delivered](#how-alerts-get-delivered). |
| **catena-admin** | The dashboard. Collects links and status into one page, and carries the one-click actions (the "sync now" button, for example) on its **Actions** tab, gated to the `administrators` group. |
| **Restic -> S3** | The backup engine. Takes an encrypted, deduplicated snapshot of the data with each backup, pushes it to a client-owned storage bucket. |

## How a page request flows

This is what happens when a staff member opens, say,
`https://paperless.yourdomain.com`:

```mermaid
flowchart LR
    U[Staff member's browser]
    CF[Cloudflare edge]
    TUN[Cloudflare Tunnel<br/>on the VPS]
    T[Traefik<br/>router]
    A[Keycloak<br/>sign-in check]
    APP[The app<br/>e.g. Paperless]

    U -->|1. HTTPS request| CF
    CF -->|2. through private tunnel| TUN
    TUN -->|3. into the VPS| T
    T -->|4. ask: is this user signed in?| A
    A -->|5. yes, with role X| T
    T -->|6. forward request| APP
    APP -->|7. response back| U
```

If step 5 says "no" (the user is not signed in, or is not in the right
team), they are bounced to the Keycloak sign-in page instead -- they
never see the app until they prove who they are.

## How the data is protected

```mermaid
flowchart LR
    APPS[The apps<br/>on the VPS]
    PG[(Postgres<br/>databases)]
    VOL[(Docker volumes<br/>app files)]
    RESTIC[Restic<br/>backup engine]
    S3[(Client-owned S3 bucket<br/>encrypted, deduplicated)]
    HC[Healthchecks<br/>dead-man alert]
    TEAM[The team<br/>via the chosen channels]

    APPS --> PG
    APPS --> VOL
    PG --> RESTIC
    VOL --> RESTIC
    RESTIC -->|each backup| S3
    RESTIC -->|ping after success| HC
    HC -.->|no ping on schedule| TEAM
```

Two things worth knowing:

- The S3 bucket is **client-owned**. Its credentials are set on the VPS
  at install, and the account and billing relationship with the storage
  provider stay in the client's name -- nothing about the backups
  depends on anyone else.
- The backup is **encrypted on the VPS before it leaves**, using a key
  held separately from the VPS itself (part of the
  [recovery keyset](/en/disaster-prevention/)). Even someone with full
  access to the S3 bucket cannot read the backup without that key.

## How monitoring catches problems

Gatus runs two probes per service every minute:

- **Internal probe** -- does the container reply on the private Docker
  network? If not, the app itself is broken.
- **Public probe** -- does the full path (Cloudflare -> Tunnel -> Traefik
  -> Keycloak -> app) return the expected response? If this fails but
  the internal probe succeeds, something between Cloudflare and the
  app is misbehaving -- a DNS record, the tunnel, the sign-in layer.

Two probes, two different failure stories. On an alert, the one that
fired says which half of the suite to look at first.

## How alerts get delivered

Every Gatus probe that goes red sends a notification through
**Healthchecks** at [`heartbeat.yourdomain.com`](https://heartbeat.yourdomain.com).
Each service has its own check, named `gatus-<service>` (e.g.
`gatus-actualbudget`, `gatus-traefik-internal`), so the push names the
failing service directly. Recoveries notify too, so a cleared problem
is visible without refreshing Gatus.

By default, alerts push through **ntfy** (a free push-notification
service, auto-configured at setup, no account required). Pointing it
at a phone and **adding any other channels** is a one-time setup:

1. Sign in to [`heartbeat.yourdomain.com`](https://heartbeat.yourdomain.com)
   (same Keycloak login as every other service).
2. **Settings -> Integrations -> Add Integration**. Pick a channel:
   Email, Slack, Discord, Telegram, Microsoft Teams, Pushover,
   ntfy, Matrix, PagerDuty, a webhook, or any of the ~30 others. Paste
   the target (email address, Slack webhook URL, and so on) and save.
   New integrations automatically apply to every `gatus-*` check --
   there is no per-check ticking to do.
3. For a channel on *some* services but not others, open the
   specific `gatus-<service>` check, click **Integrations**, and tick
   only the ones that belong to that service. Useful when, say, the
   staff portal going down should page by SMS but the internal
   dashboard should not.
4. The same applies to **Daily backup ping** for missed backups.

Removing a channel is the same flow in reverse. The built-in default
channel is not exposed in this UI -- it stays attached regardless of
what is added or removed. New services that start being monitored (an
app just deployed, for instance) get their own check on the first
failure, with the configured channels automatically attached.

## Updates and rollback

The apps and the infrastructure they run on get refreshed on a weekly
schedule -- outside business hours, with an automatic rollback if
anything starts failing.

Not every app gets the same treatment. It depends on how the image
tag is pinned in the app's configuration:

| Tag looks like...   | Example              | Gets auto-updated? |
|---|---|---|
| Full version      | `paperless:2.12.3`   | **Yes** -- with auto-rollback on failure. |
| Major-only pin    | `postgres:16-alpine` | No. System-pinned; ignored by the weekly updater. |
| Floating          | `nginx:latest`       | No. Unsafe to touch unsupervised. |

For apps on a full version pin, each service can optionally tag a
policy in its compose:

- `vps.auto-update=patch` *(default)* -- accept bug-fix releases only
  (e.g., 2.12.3 -> 2.12.4).
- `vps.auto-update=minor` -- also accept feature releases within the
  same major line (2.12.3 -> 2.13.0).
- `vps.auto-update=major` -- accept anything newer, including major
  version jumps.
- `vps.auto-update=off` -- skip this service entirely.

The label on an app with a floating or major-only tag is silently
ignored -- the system's pinning rule wins. This is deliberate:
auto-rollback needs a known-good prior version to revert to, and a
floating tag does not provide one.

**What happens when an update breaks:**

1. Gatus health probes catch the regression within ~3 minutes
   (internal + public probes both).
2. The updater reverts the service to the previous known-good
   version and redeploys it.
3. The bad version is remembered -- next week's run picks the *next*
   version up, not the one that just broke.
4. **Healthchecks** pages out the service name + the version that
   failed. The running version of every service is visible on the
   **Gatus monitoring surface** at `monitor.<your-zone>` -- a
   quarantined service shows the prior pinned tag with the bad version
   annotated next to it.

No response is required. The app comes back on its own, so the root
cause can wait -- it is not a 3 a.m. emergency.

To skip a week of updates entirely (during a demo, for instance, where
nothing should change), the updater **pauses** from the **Actions**
tab of the dashboard -- status stays visible on the Gatus surface
until it resumes.

## The day-to-day surface

Cloudflare, Traefik, the tunnel and the backup engine need no
attention. What does:

- **Keycloak** -- add or remove staff, reset passwords, assign people
  to teams (see [Manage users and roles](/en/manage-users-and-roles/)).
- **Portainer** -- deploy new apps with access-control labels (see
  [Manage apps](/en/manage-apps/)).
- **The dashboard** -- a glance at service health and pinned links.
- **Healthchecks** -- add the notification channels alerts should
  reach (see [How alerts get delivered](#how-alerts-get-delivered)).
- **The dashboard's Actions tab** (administrators only) -- click a
  named action to run a pre-defined operation (like "resync the
  dashboard now"). Visible to staff in the `administrators` Keycloak
  group; non-admin staff see the tile but hitting it bounces them
  through login.

Everything else runs on its own. If any of it stops running, Gatus
pages out before a staff complaint arrives.
