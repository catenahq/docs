---
title: "Kimai"
description: "Open-source time tracker. Customers, projects, activities, timesheets, multi-user teams, invoice generation from tracked time."
---

Open-source time tracker. Customers, projects, activities, timesheets, multi-user teams, invoice generation from tracked time. SAML federates with Keycloak via the post-deploy admin UI.

- **Upstream project:** <https://www.kimai.org/>
- **Replaces:** **Toggl**, **Clockify**, **Harvest**, **TimeCamp**
- **Sign-in (SSO):** Enable via the app's admin UI -- paste the `OIDC_*` values from the Environment tab once.

## Setup steps

1. Click **Deploy**. Wait ~1 min for the first boot (database migrations run on first start).
2. Visit your Kimai domain. Sign in as `KIMAI_ADMIN_EMAIL` / `KIMAI_ADMIN_PASSWORD` from the Environment tab.
3. *(Optional)* Enable Keycloak SAML SSO: **System** -> **Settings** -> **SAML** -> enable + paste:
   - **Identity Provider Entity ID:** `<OIDC_ISSUER_URL>/protocol/saml/descriptor` (your operator can mint a SAML client in Keycloak)
   - **Single Sign-On URL:** `<OIDC_ISSUER_URL>/protocol/saml`
   - **X.509 Certificate:** from the Keycloak realm metadata
   - **Username Attribute:** `username` (or `email`)
   - Save. Local admin login keeps working as break-glass.
4. Configure your default invoice template under **Invoices** -> **Templates** -> pick one (DOCX / HTML / PDF). Set your company logo, address, and tax rates under **System** -> **Configuration**.

### Time tracking in the Catena suite

Kimai is the time-tracking master in the Catena suite. Hours tracked here flow downstream to your invoicing app (Invoice Ninja) via the operator's monthly sync (see your operator if you want this automated). Customer records in Kimai carry an `espo_account_id` custom field so each timesheet ties back to the EspoCRM Account.

### Invoicing built in

Kimai can generate PDF invoices directly from tracked time. Use this if your billing flow is "email a PDF; client pays via e-transfer or wire." If you need Stripe-driven online payment, a client portal, or recurring billing, ask your operator to deploy Invoice Ninja and the suite will route invoices through that instead.

### Authentication

Until SAML is wired (step 3 above), Kimai uses local username/password. Even after SAML is wired, local admin login keeps working as a break-glass path. The Keycloak `client-staff` group gates access at the Traefik edge via oauth2-proxy before traffic reaches Kimai, so people outside your staff group cannot reach the login page.

### Resource note

Kimai runs as PHP-Apache + MariaDB. Plan for ~250 MB RAM at idle, ~500 MB under bulk export or invoice rendering on busy month-end.

## Environment variables

These values live in the Dokploy compose's **Environment** tab. Random
secrets are minted automatically when the template is first seeded --
you don't need to generate them yourself.

| Variable | Default |
|---|---|
| `KIMAI_HOSTNAME` | `time.yourdomain.com` |
| `KIMAI_ADMIN_EMAIL` | `admin@yourdomain.com` |
| `KIMAI_ADMIN_PASSWORD` | _auto-generated random value_ |
| `KIMAI_APP_SECRET` | _auto-generated random value_ |
| `DB_PASSWORD` | _auto-generated random value_ |
| `DB_ROOT_PASSWORD` | _auto-generated random value_ |
| `KIMAI_MAIL_FROM` | `time@yourdomain.com` |
| `KIMAI_MAIL_URL` | `null://localhost` |

## Domain

- **Service and port:** `kimai:8001`
- **Hostname:** `time.yourdomain.com`

The hostname is attached automatically when the template is seeded;
change it in the **Domains** tab before clicking Deploy if you want
something else.

## Compose file

For reference -- this is what the template deploys. **Do not paste this
anywhere.** The compose is seeded into Dokploy automatically; the
client-facing adjustments you make happen in the Environment and
Domains tabs (described above), never in the compose itself.

```yaml
# Kimai -- open-source time tracker. Picked 2026-05-21 as the time-
# tracking master in the Path E composition (Kimai -> Invoice Ninja
# -> ERPNext, anchored on EspoCRM as customer master).
#
# Auth: Kimai 2.x supports SAML in self-hosted (LDAP + database too).
# Marked sso_mode=post-deploy-ui in the catalog -- the operator wires
# Keycloak SAML federation from the Kimai admin UI after first deploy.
# Until SAML is wired, oauth2-proxy at the Traefik edge gates access
# via the Keycloak `client-staff` group; local Kimai auth still works
# as a break-glass.
#
# Storage: kimai-data volume holds /opt/kimai/var (Symfony var/ dir
# including user uploads, exports, generated invoice PDFs, and
# cache). db-data holds MariaDB. Both are picked up by restic via
# /var/lib/docker/volumes.
#
# Image: kimai/kimai2:stable (the `:apache` tag is deprecated upstream
# in favour of `:stable`; see https://www.kimai.org/documentation/docker.html).

services:
  kimai:
    image: kimai/kimai2:stable
    restart: unless-stopped
    environment:
      DATABASE_URL: "mysql://kimai:${DB_PASSWORD}@db:3306/kimai?charset=utf8mb4&serverVersion=11.8.6-MariaDB"
      APP_SECRET: ${KIMAI_APP_SECRET}
      ADMINMAIL: ${KIMAI_ADMIN_EMAIL}
      ADMINPASS: ${KIMAI_ADMIN_PASSWORD}
      TRUSTED_PROXIES: "0.0.0.0/0"
      TRUSTED_HOSTS: "localhost,${KIMAI_HOSTNAME}"
      MAILER_FROM: ${KIMAI_MAIL_FROM}
      MAILER_URL: ${KIMAI_MAIL_URL}
      memory_limit: "512M"
    volumes:
      - kimai-data:/opt/kimai/var
    depends_on:
      db:
        condition: service_healthy
    labels:
      - "vps.auth.mode=public"
      - "vps.auth.groups=client-staff"
      - "vps.auto-update=patch"
    networks:
      dokploy-network:
        aliases:
          - kimai
      default: {}

  db:
    image: mariadb:11.8.6
    restart: unless-stopped
    environment:
      MARIADB_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MARIADB_DATABASE: kimai
      MARIADB_USER: kimai
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
  kimai-data:
  db-data:

networks:
  dokploy-network:
    external: true
```

---

[<- Back to all pre-configured apps](/en/apps/)
