---
title: "Easy!Appointments"
description: "Customer-facing booking app for one or many providers (clinic, salon, lessons, repair shop)."
---

Customer-facing booking app for one or many providers (clinic, salon, lessons, repair shop). Public booking page; staff calendars; email + SMS reminders; ICS export.

- **Upstream project:** <https://easyappointments.org/>
- **Replaces:** **Calendly**, **Acuity**, **SimplyBook**, **Setmore**
- **Sign-in (SSO):** Not available — this app's community edition doesn't support OIDC. Users keep a per-app email/password login.

## Setup steps

1. Click **Deploy**. Wait ~1 min for the first boot (database initializes on first run).
2. Visit your Easy!Appointments domain and complete the first-run installer (creates the initial admin account, business name, working hours).
3. Add providers (staff with bookable calendars), services (durations + prices), and customers as needed.
4. *(Optional)* Configure SMTP under **Settings** → **Business Logic** → **Email** to send appointment confirmations and reminders. Without SMTP, customers and staff still see bookings inside the app, but no emails go out.
5. *(Optional)* Embed the booking page on your website: copy the public booking URL from **Settings** → **Booking Settings** and link to it from your site or business listings.

### Authentication

Easy!Appointments v1.5.2 uses local email/password sign-in for staff. No native OIDC in the upstream release. The customer-facing booking page is public by design -- visitors book a slot without creating an account, only providing name, email, and phone. The SSO gap therefore only affects staff sign-in and is typically manageable for the small teams (1-10 staff) the app targets.

If a single sign-on for staff is required, contact your operator to discuss an oauth2-proxy front layer; default deployment ships with local accounts.

### Email + SMS reminders

Email reminders work as soon as SMTP is configured. SMS reminders require a Twilio account (configured under **Settings** → **Notifications** → **SMS**). SMS is opt-in per customer at booking time.

### Public booking URL

The default public URL is `https://book.<your-domain>/`. Share this directly with customers, embed it as a button on your business website, or list it on Google Business Profile.

## Environment variables

These values live in the Dokploy compose's **Environment** tab. Random
secrets are minted automatically when the template is first seeded —
you don't need to generate them yourself.

| Variable | Default |
|---|---|
| `EASYAPPOINTMENTS_HOSTNAME` | `book.yourdomain.com` |
| `DB_PASSWORD` | _auto-generated random value_ |
| `DB_ROOT_PASSWORD` | _auto-generated random value_ |

## Domain

- **Service and port:** `easyappointments:80`
- **Hostname:** `book.yourdomain.com`

The hostname is attached automatically when the template is seeded;
change it in the **Domains** tab before clicking Deploy if you want
something else.

## Compose file

For reference — this is what the template deploys. **Do not paste this
anywhere.** The compose is seeded into Dokploy automatically; the
client-facing adjustments you make happen in the Environment and
Domains tabs (described above), never in the compose itself.

```yaml
# Easy!Appointments -- open-source customer-facing booking app. Default
# scheduler in the stack as of 2026-05-06 (F11 v1 pick: Branch A
# multi-provider). cal.diy stays deferred (D9) until upstream stabilizes.
#
# Auth: Easy!Appointments v1.5.2 has no native OIDC. Login is local
# email/password (or optional Google OAuth at the EA level). The booking
# page itself is public-by-design (customers book without an account),
# so the SSO gap only affects staff/provider sign-in. Marked
# sso_mode=none in the catalog for honesty; revisit once upstream
# adds OIDC support.
#
# Storage: server-data volume holds EA's storage/ dir (uploaded
# avatars + generated ICS files + cache). db-data holds MariaDB.
# Both restic-backed via /var/lib/docker/volumes.

services:
  easyappointments:
    image: alextselegidis/easyappointments:1.5.2
    restart: unless-stopped
    environment:
      BASE_URL: https://${EASYAPPOINTMENTS_HOSTNAME}
      DB_HOST: db
      DB_NAME: easyappointments
      DB_USERNAME: easyappointments
      DB_PASSWORD: ${DB_PASSWORD}
      DEBUG_MODE: "FALSE"
    volumes:
      - server-data:/var/www/html/storage
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "curl -fsS http://localhost/ >/dev/null || exit 1"]
      interval: 15s
      timeout: 5s
      retries: 10
      start_period: 30s
    labels:
      - "vps.auth.mode=public"
      - "vps.auto-update=patch"
    networks:
      dokploy-network:
        aliases:
          - easyappointments
      default: {}

  db:
    image: mariadb:11.8.6
    restart: unless-stopped
    environment:
      MARIADB_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MARIADB_DATABASE: easyappointments
      MARIADB_USER: easyappointments
      MARIADB_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
      interval: 10s
      timeout: 5s
      retries: 10
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

volumes:
  server-data:
  db-data:

networks:
  dokploy-network:
    external: true
```

---

[← Back to all pre-configured apps](./)
