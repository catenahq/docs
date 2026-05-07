---
title: "cal.diy"
description: "Single-provider booking page with Stripe-paid bookings, calendar app store (Google / Outlook / Apple / CalDAV), and a polished public booking flow."
---

Single-provider booking page with Stripe-paid bookings, calendar app store (Google / Outlook / Apple / CalDAV), and a polished public booking flow. Self-hosted build of Cal.com.

- **Upstream project:** <https://github.com/calcom/cal.diy>
- **Replaces:** **Calendly**, **Acuity**, **SavvyCal**, **Cal.com Cloud**
- **Sign-in (SSO):** Not available — this app's community edition doesn't support OIDC. Users keep a per-app email/password login.

## Setup steps

1. Click **Deploy**. Wait ~2-3 min for the first boot (Prisma migrations run on the entrypoint).
2. Visit your cal.diy domain and complete the setup wizard (admin email, password, name). The wizard creates an account with role `ADMIN` and `identityProvider=CAL`.
3. **Unblock the admin login (one-time).** The legacy image force-downgrades any `IdentityProvider=CAL` admin to `INACTIVE_ADMIN` until 2FA is enabled, which makes the post-login redirect bounce. Open the Dokploy **Terminal** on the `db` service and run:
   ```sql
   UPDATE "users" SET role='USER' WHERE email='<your-admin-email>';
   ```
   Sign in. Open **Settings → Security → Two-factor authentication**, enable 2FA. Then back in the terminal:
   ```sql
   UPDATE "users" SET role='ADMIN' WHERE email='<your-admin-email>';
   ```
4. Connect a calendar: **Settings → Apps → Calendars** → install Google Calendar / Microsoft / CalDAV / Apple → authorize.
5. *(Optional)* Enable Stripe-paid bookings: **Apps → Stripe** → connect a Stripe account → on each event type, toggle **Requires Payment** and set the price.
6. Configure your event types under **Event Types**. Share the public URL `https://cal.<your-domain>/<username>/<event-slug>` with customers.

### Image situation

cal.diy is the new MIT-licensed open-source build of Cal.com. Upstream has not yet published a `calcom/cal.diy` Docker image; this template runs the legacy `calcom/cal.com:v6.2.0` image, which still works mechanically but carries commercial code paths (license phone-home, the `INACTIVE_ADMIN` gate above). Once cal.com publishes a clean cal.diy image with the gates removed, the operator can swap the image tag and the wizard-then-SQL dance goes away.

### Features removed in the open-source split

The cal.com `open-source-to-closed-source` rebrand moved the following into the commercial-only Cal.com tier: **Organizations & Teams**, **Routing Forms**, **Workflows** (automated reminders), **Instant Booking**, **AI Phone**, **Insights** (analytics), **API v1**, **SAML/SSO**, admin **Impersonation** + **Booking Audit**. If a workflow needs any of these, run the booking webhook into n8n and rebuild the missing piece there. See your operator before relying on a feature in this list.

### Resources

cal.diy runs Next.js + Postgres in two containers. Plan for ~1-2 GB RAM at rest, slower first boot than most apps in the catalog.

### Multi-tenant warning

Single-tenant deploys only. The community edition has no real org/team coordination. If you need multiple practitioners with shared availability (clinic / salon / repair shop), use [Easy!Appointments](/docs/apps/easyappointments/) instead.

## Environment variables

These values live in the Dokploy compose's **Environment** tab. Random
secrets are minted automatically when the template is first seeded —
you don't need to generate them yourself.

| Variable | Default |
|---|---|
| `CALDIY_HOSTNAME` | `cal.yourdomain.com` |
| `NEXTAUTH_SECRET` | _auto-generated random value_ |
| `CALENDSO_ENCRYPTION_KEY` | _auto-generated random value_ |
| `DB_PASSWORD` | _auto-generated random value_ |

## Domain

- **Service and port:** `caldiy:3000`
- **Hostname:** `cal.yourdomain.com`

The hostname is attached automatically when the template is seeded;
change it in the **Domains** tab before clicking Deploy if you want
something else.

## Compose file

For reference — this is what the template deploys. **Do not paste this
anywhere.** The compose is seeded into Dokploy automatically; the
client-facing adjustments you make happen in the Environment and
Domains tabs (described above), never in the compose itself.

```yaml
# cal.diy — MIT-licensed open-source build of Cal.com (scheduling
# links / Calendly alternative). cal.diy is the post-rebrand name
# for the self-hostable Cal.com codebase. Source:
# https://github.com/calcom/cal.diy. No standalone calcom/cal.diy
# Docker image yet; the legacy `calcom/cal.com` image (latest tag
# v6.2.0, 2026-03-02) is the runtime stand-in until upstream
# publishes one. SAML SSO is gated to the commercial Cal.com
# edition, so this template ships email/password admin login only —
# no Keycloak realm client, no BoxyHQ Jackson sidecar.
#
# v6.x auto-runs `prisma migrate deploy` on container boot
# (start.sh entrypoint). No first-deploy operator step needed.
#
# `INACTIVE_ADMIN` gate: the legacy image force-downgrades any
# `IdentityProvider=CAL` admin to INACTIVE_ADMIN unless the
# password passes the strict validator AND 2FA is enabled.
# Wizard-created admins land in INACTIVE_ADMIN and bounce on
# post-login redirect. Workaround documented in the catalog
# setup_steps (demote to USER → 2FA → re-promote).

services:
  caldiy:
    image: calcom/cal.com:v6.2.0
    restart: unless-stopped
    environment:
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      CALENDSO_ENCRYPTION_KEY: ${CALENDSO_ENCRYPTION_KEY}
      DATABASE_URL: postgres://caldiy:${DB_PASSWORD}@db:5432/caldiy
      DATABASE_DIRECT_URL: postgres://caldiy:${DB_PASSWORD}@db:5432/caldiy
      NEXT_PUBLIC_WEBAPP_URL: https://${CALDIY_HOSTNAME}
      NEXTAUTH_URL: https://${CALDIY_HOSTNAME}
      NEXT_PUBLIC_LICENSE_CONSENT: agree
      LICENSE: agree
      NODE_ENV: production
      # ALLOWED_HOSTNAMES: comma-separated, JSON-quoted hostnames.
      # Cal.com wraps the value in [] then JSON.parses, so the env var
      # must hold only the array CONTENTS (no surrounding brackets).
      # Single host: '"cal.yourdomain.com"'. Multiple:
      # '"a.yourdomain.com","b.yourdomain.com"'. Without this set, Cal.com
      # warns "Match of WEBAPP_URL with ALLOWED_HOSTNAMES failed" on
      # every request and gates parts of the auth flow (org dispatch).
      # Bare unquoted strings throw JSON.parse errors; surrounding []
      # produces a nested array that fails the match.
      ALLOWED_HOSTNAMES: '"${CALDIY_HOSTNAME}"'
      # Cookie domain MUST match the exact hostname (no leading dot)
      # for a single-host deploy. A leading dot makes the cookie valid
      # for sub-subdomains too, but NextAuth treats the dotted form
      # inconsistently across versions and can fail to set the session
      # cookie on the auth callback round-trip.
      NEXTAUTH_COOKIE_DOMAIN: ${CALDIY_HOSTNAME}
      # Upstream env var read by the cal.com source; the name stays
      # CALCOM_TELEMETRY_DISABLED because that is what the binary
      # checks for, regardless of the cal.diy rebrand.
      CALCOM_TELEMETRY_DISABLED: "1"
    depends_on:
      db:
        condition: service_healthy
    labels:
      - "vps.auth.mode=public"
      - "vps.auto-update=patch"
    networks:
      dokploy-network:
        aliases:
          - caldiy
      default: {}

  db:
    image: postgres:16.13-alpine3.22
    restart: unless-stopped
    environment:
      POSTGRES_USER: caldiy
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: caldiy
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U caldiy"]
      interval: 10s
      timeout: 5s
      retries: 5
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

volumes:
  db-data:

networks:
  dokploy-network:
    external: true
```

---

[← Back to all pre-configured apps](./)
