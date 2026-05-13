---
title: "Mautic"
description: "Open-source marketing automation. Contact segments, email campaigns, drip sequences, landing pages, forms, lead scoring."
---

Open-source marketing automation. Contact segments, email campaigns, drip sequences, landing pages, forms, lead scoring. Replaces Mailchimp / ActiveCampaign / HubSpot Marketing.

- **Upstream project:** <https://www.mautic.org/>
- **Replaces:** **Mailchimp**, **ActiveCampaign**, **HubSpot Marketing**, **Brevo (Sendinblue)**
- **Sign-in (SSO):** Not available -- this app's community edition doesn't support OIDC. Users keep a per-app email/password login.

## Setup steps

1. Click **Deploy**. Wait ~2 min for the first boot (database migrations run on first start).
2. Visit your Mautic domain and complete the first-run wizard:
   - **Database**: pre-filled (host `db`, name `mautic`, user `mautic`, password from the `DB_PASSWORD` env var).
   - **Admin user**: create your initial admin account.
   - **Email settings**: paste your managed-relay SMTP creds (host, port `587`, username, password, from-address). Skip if you'll do this later under **Settings** -> **Configuration** -> **Email Settings**.
3. Verify the cron + worker containers are running in Dokploy (Mautic needs `mautic_cron` for scheduled campaigns + `mautic_worker` for the email queue).
4. Build your first segment: **Segments** -> **New** -> filter by contact attribute.
5. Build your first email campaign: **Campaigns** -> **New** -> drag the **Send email** action onto a segment trigger.

### Authentication

Mautic community edition does not ship native OIDC. Local username/password is the default. SAML2 is supported upstream but requires per-deploy config; third-party generic-OAuth2 plugins exist. If single sign-on across the stack is required, contact your operator to add an oauth2-proxy front layer (Keycloak group `client-staff` gates access at the Traefik edge before traffic reaches Mautic).

### SMTP and sending reputation

Mautic does NOT send email directly. It hands every outbound to your managed SMTP relay (see the [email providers guide](/docs/en/guides/email-providers/) for recommended choices). Sending reputation, SPF/DKIM/DMARC, and bounce handling all live at the relay layer. Configure SMTP under **Settings** -> **Configuration** -> **Email Settings** with your relay's credentials before the first campaign goes out.

### Lead-magnet content and drip-campaign copy

The template ships the engine. Authoring the lead-magnet PDFs, drip-sequence copy, and email templates is your team's job (or your operator's, if they offer marketing-content services). Mautic itself does not ship pre-built campaigns.

### Resource note

Mautic runs as Apache + MariaDB + a worker sidecar + a cron sidecar. Plan for ~1.5 GB RAM at idle (worker + cron eat ~300 MB each), ~3 GB under campaign sends or segment rebuilds. Storage grows with media uploads and email-event history; budget ~10 GB after the first year of regular use.

## Environment variables

These values live in the Dokploy compose's **Environment** tab. Random
secrets are minted automatically when the template is first seeded --
you don't need to generate them yourself.

| Variable | Default |
|---|---|
| `MAUTIC_HOSTNAME` | `marketing.yourdomain.com` |
| `DB_PASSWORD` | _auto-generated random value_ |
| `DB_ROOT_PASSWORD` | _auto-generated random value_ |
| `SMTP_HOST` | _(set before deploy)_ |
| `SMTP_PORT` | `587` |
| `SMTP_USERNAME` | _(set before deploy)_ |
| `SMTP_PASSWORD` | _(set before deploy)_ |
| `SMTP_FROM_ADDRESS` | _(set before deploy)_ |

## Domain

- **Service and port:** `mautic_web:80`
- **Hostname:** `marketing.yourdomain.com`

The hostname is attached automatically when the template is seeded;
change it in the **Domains** tab before clicking Deploy if you want
something else.

## Compose file

For reference -- this is what the template deploys. **Do not paste this
anywhere.** The compose is seeded into Dokploy automatically; the
client-facing adjustments you make happen in the Environment and
Domains tabs (described above), never in the compose itself.

```yaml
# Mautic -- open-source marketing automation (Mailchimp / ActiveCampaign /
# HubSpot Marketing replacement). Three-process layout per upstream
# docker-mautic example:
#
#   - mautic_web    -- the Apache web container the client browser hits
#   - mautic_worker -- Symfony Messenger consumer (emails, hits, failed)
#   - mautic_cron   -- scheduled tasks (campaign triggers, segment
#                      rebuilds, retention pruning)
#
# All three share the same image + named volumes so the docroot, config,
# and logs stay coherent across roles.
#
# Auth: Mautic community edition has no native OIDC. SAML2 is supported
# upstream but requires per-deploy config; third-party OAuth2 plugins
# exist but are not first-party. Marked sso_mode=none for honesty; the
# operator can wire SAML or a generic-OAuth2 plugin per client request.
# Local username/password login is the default; pair with oauth2-proxy
# in front if a single-sign-on layer is required.
#
# Storage:
#   - config-data  -> /var/www/html/config        (local.php, plugin config)
#   - logs-data    -> /var/www/html/var/logs      (Symfony logs)
#   - media-data   -> /var/www/html/docroot/media (uploaded files + images)
#   - db-data      -> /var/lib/mysql              (MariaDB)
# All four volumes ride restic via /var/lib/docker/volumes.
#
# SMTP: Mautic stores SMTP settings in its own DB-backed config after
# the first-run wizard. The SMTP_* env vars below are exposed for the
# operator to paste into Settings -> Configuration -> Email Settings
# post-deploy; Mautic does NOT consume them at boot.

services:
  mautic_web:
    image: mautic/mautic:7.1.1-apache
    restart: unless-stopped
    environment:
      MAUTIC_DB_HOST: db
      MAUTIC_DB_PORT: "3306"
      MAUTIC_DB_DATABASE: mautic
      MAUTIC_DB_USER: mautic
      MAUTIC_DB_PASSWORD: ${DB_PASSWORD}
      DOCKER_MAUTIC_RUN_MIGRATIONS: "true"
      # Doctrine-backed Messenger transport (no RabbitMQ dependency).
      MAUTIC_MESSENGER_DSN_EMAIL: doctrine://default
      MAUTIC_MESSENGER_DSN_HIT: doctrine://default
      PHP_INI_VALUE_MEMORY_LIMIT: 512M
      PHP_INI_VALUE_UPLOAD_MAX_FILESIZE: 64M
      PHP_INI_VALUE_POST_MAX_SIZE: 64M
      # Exposed for operator reference. Mautic persists SMTP settings
      # in its DB-backed config once the admin saves them in the UI.
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT}
      SMTP_USERNAME: ${SMTP_USERNAME}
      SMTP_PASSWORD: ${SMTP_PASSWORD}
      SMTP_FROM_ADDRESS: ${SMTP_FROM_ADDRESS}
    volumes:
      - config-data:/var/www/html/config
      - logs-data:/var/www/html/var/logs
      - media-data:/var/www/html/docroot/media
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "curl -fsS http://localhost/ >/dev/null || exit 1"]
      interval: 15s
      timeout: 5s
      retries: 10
      start_period: 60s
    labels:
      - "vps.auth.mode=public"
      - "vps.auto-update=patch"
    networks:
      dokploy-network:
        aliases:
          - mautic
      default: {}

  mautic_worker:
    image: mautic/mautic:7.1.1-apache
    restart: unless-stopped
    environment:
      DOCKER_MAUTIC_ROLE: mautic_worker
      MAUTIC_DB_HOST: db
      MAUTIC_DB_PORT: "3306"
      MAUTIC_DB_DATABASE: mautic
      MAUTIC_DB_USER: mautic
      MAUTIC_DB_PASSWORD: ${DB_PASSWORD}
      MAUTIC_MESSENGER_DSN_EMAIL: doctrine://default
      MAUTIC_MESSENGER_DSN_HIT: doctrine://default
    volumes:
      - config-data:/var/www/html/config
      - logs-data:/var/www/html/var/logs
      - media-data:/var/www/html/docroot/media
    depends_on:
      mautic_web:
        condition: service_healthy
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  mautic_cron:
    image: mautic/mautic:7.1.1-apache
    restart: unless-stopped
    environment:
      DOCKER_MAUTIC_ROLE: mautic_cron
      MAUTIC_DB_HOST: db
      MAUTIC_DB_PORT: "3306"
      MAUTIC_DB_DATABASE: mautic
      MAUTIC_DB_USER: mautic
      MAUTIC_DB_PASSWORD: ${DB_PASSWORD}
    volumes:
      - config-data:/var/www/html/config
      - logs-data:/var/www/html/var/logs
      - media-data:/var/www/html/docroot/media
    depends_on:
      mautic_web:
        condition: service_healthy
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  db:
    image: mariadb:11.8.6
    restart: unless-stopped
    environment:
      MARIADB_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MARIADB_DATABASE: mautic
      MARIADB_USER: mautic
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
  config-data:
  logs-data:
  media-data:
  db-data:

networks:
  dokploy-network:
    external: true
```

---

[<- Back to all pre-configured apps](./)
