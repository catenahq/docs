---
title: "EspoCRM"
description: "Default CRM in the stack. Contacts, accounts, opportunities, leads, calendar, email integration, mass mail, workflow automation."
---

Default CRM in the stack. Contacts, accounts, opportunities, leads, calendar, email integration, mass mail, workflow automation. Native OIDC via post-deploy toggle.

- **Upstream project:** <https://www.espocrm.com/>
- **Replaces:** **Salesforce**, **HubSpot**, **Zoho CRM**, **Pipedrive**
- **Sign-in (SSO):** Enable via the app's admin UI — paste the `OIDC_*` values from the Environment tab once.

## Setup steps

1. Click **Deploy**. Wait ~1 min.
2. Visit your EspoCRM domain. Sign in as `ESPOCRM_ADMIN_USERNAME` / `ESPOCRM_ADMIN_PASSWORD` from the Environment tab.
3. *(Optional)* Enable Keycloak SSO: **Administration** → **Authentication** → set **Method** to **OIDC** → paste:
   - **Client ID:** `OIDC_CLIENT_ID` from Environment (`espocrm`)
   - **Client Secret:** `OIDC_CLIENT_SECRET` from Environment (ask your operator to mint one in Keycloak if blank)
   - **Authorization Endpoint:** `<OIDC_ISSUER_URL>/protocol/openid-connect/auth`
   - **Token Endpoint:** `<OIDC_ISSUER_URL>/protocol/openid-connect/token`
   - **JSON Web Key Set Endpoint:** `<OIDC_ISSUER_URL>/protocol/openid-connect/certs`
   - **Username Claim:** `preferred_username`
   - Save. The login page gains a **Sign in with Keycloak** button. Local admin login keeps working as a break-glass.

### Why EspoCRM is the default

It is the only fully open-source CRM in this catalog with native OIDC in the community edition (no Pro tier upgrade), pre-built mobile apps, and an established record of stable upgrades. Twenty is the alternative if you prefer its modern Notion-like UI; both are kept in the catalog so you can pick.

### Resource note

EspoCRM runs as PHP-Apache + MariaDB + a cron sidecar. Plan for ~1 GB RAM at idle, ~2 GB under bulk-import or mass-email workloads.

## Environment variables

These values live in the Dokploy compose's **Environment** tab. Random
secrets are minted automatically when the template is first seeded —
you don't need to generate them yourself.

| Variable | Default |
|---|---|
| `ESPOCRM_HOSTNAME` | `crm.yourdomain.com` |
| `ESPOCRM_ADMIN_USERNAME` | `admin` |
| `ESPOCRM_ADMIN_PASSWORD` | _auto-generated random value_ |
| `DB_PASSWORD` | _auto-generated random value_ |
| `DB_ROOT_PASSWORD` | _auto-generated random value_ |
| `OIDC_CLIENT_ID` | `espocrm` |
| `OIDC_CLIENT_SECRET` | _(set before deploy)_ |
| `OIDC_ISSUER_URL` | `https://auth.yourdomain.com/realms/catena` |

## Domain

- **Service and port:** `espocrm:80`
- **Hostname:** `crm.yourdomain.com`

The hostname is attached automatically when the template is seeded;
change it in the **Domains** tab before clicking Deploy if you want
something else.

## Compose file

For reference — this is what the template deploys. **Do not paste this
anywhere.** The compose is seeded into Dokploy automatically; the
client-facing adjustments you make happen in the Environment and
Domains tabs (described above), never in the compose itself.

```yaml
# EspoCRM -- open-source CRM. Default CRM in this stack as of 2026-04-29
# (D8 decision). Twenty stays in catalog as alternative.
#
# Auth: EspoCRM has native OIDC in the community edition. Enable from
# Administration -> Authentication -> set Method to OIDC -> paste OIDC_*
# values from the Environment tab. Marked sso_mode=post-deploy-ui in the
# catalog because the toggle is in the admin UI, not env-driven on first
# boot.
#
# Storage: server-data volume holds EspoCRM's data/ dir (config + uploaded
# attachments + cron state). db-data holds MariaDB. Both are picked up by
# restic via the standard /var/lib/docker/volumes path.

services:
  espocrm:
    image: espocrm/espocrm:9.3.6
    restart: unless-stopped
    environment:
      ESPOCRM_DATABASE_PLATFORM: Mysql
      ESPOCRM_DATABASE_HOST: db
      ESPOCRM_DATABASE_PORT: "3306"
      ESPOCRM_DATABASE_NAME: espocrm
      ESPOCRM_DATABASE_USER: espocrm
      ESPOCRM_DATABASE_PASSWORD: ${DB_PASSWORD}
      ESPOCRM_ADMIN_USERNAME: ${ESPOCRM_ADMIN_USERNAME}
      ESPOCRM_ADMIN_PASSWORD: ${ESPOCRM_ADMIN_PASSWORD}
      ESPOCRM_SITE_URL: https://${ESPOCRM_HOSTNAME}
      ESPOCRM_CONFIG_USE_WEB_SOCKET: "false"
      # Exposed for operator reference (Administration -> Authentication)
      # but not consumed by EspoCRM directly at boot. Operator pastes
      # these in the admin UI once after first sign-in.
      OIDC_CLIENT_ID: ${OIDC_CLIENT_ID}
      OIDC_CLIENT_SECRET: ${OIDC_CLIENT_SECRET}
      OIDC_ISSUER_URL: ${OIDC_ISSUER_URL}
    volumes:
      - server-data:/var/www/html/data
    depends_on:
      db:
        condition: service_healthy
    labels:
      - "vps.auth.mode=public"
      - "vps.auth.oidc=true"
      - "vps.auth.groups=client-staff"
      - "vps.auth.oidc.redirect_uris=https://${ESPOCRM_HOSTNAME}/oauth-callback.php"
      - "vps.auth.oidc.scopes=openid email profile"
      - "vps.auto-update=patch"
    networks:
      dokploy-network:
        aliases:
          - espocrm
      default: {}

  cron:
    image: espocrm/espocrm:9.3.6
    restart: unless-stopped
    entrypoint: docker-cron.sh
    environment:
      ESPOCRM_DATABASE_PLATFORM: Mysql
      ESPOCRM_DATABASE_HOST: db
      ESPOCRM_DATABASE_PORT: "3306"
      ESPOCRM_DATABASE_NAME: espocrm
      ESPOCRM_DATABASE_USER: espocrm
      ESPOCRM_DATABASE_PASSWORD: ${DB_PASSWORD}
    volumes:
      - server-data:/var/www/html/data
    depends_on:
      espocrm:
        condition: service_started
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  db:
    image: mariadb:11.8.6
    restart: unless-stopped
    environment:
      MARIADB_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MARIADB_DATABASE: espocrm
      MARIADB_USER: espocrm
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
