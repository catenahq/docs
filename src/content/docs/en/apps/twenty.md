---
title: "Twenty"
description: "Modern open-source CRM. Contacts, companies, opportunities, email sync, pipelines. Alternative to EspoCRM (the default CRM)."
---

Modern open-source CRM. Contacts, companies, opportunities, email sync, pipelines. Alternative to EspoCRM (the default CRM).

- **Upstream project:** <https://twenty.com/>
- **Replaces:** **Salesforce**, **HubSpot**, **Pipedrive**
- **Sign-in (SSO):** Enable via the app's admin UI -- paste the `OIDC_*` values from the Environment tab once.

## Setup steps

1. Click **Deploy**. Wait ~1 min.
2. Visit your Twenty domain and sign up to create the initial workspace + admin user.
3. *(Optional)* Enable Keycloak SSO: **Settings** -> **Security** -> **Single sign-on** -> paste `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, `OIDC_ISSUER_URL` from the Environment tab. Save.

**EspoCRM vs Twenty.** EspoCRM is this stack's default CRM (mature, native OIDC, mobile apps). Twenty is offered as an alternative for clients who prefer its Notion-style UI; both can be deployed side-by-side. The default `crm.<your-domain>` host is reserved for EspoCRM -- Twenty defaults to `twenty.<your-domain>`.

## Environment variables

These values live in the Dokploy compose's **Environment** tab. Random
secrets are minted automatically when the template is first seeded --
you don't need to generate them yourself.

| Variable | Default |
|---|---|
| `TWENTY_HOSTNAME` | `twenty.yourdomain.com` |
| `TWENTY_APP_SECRET` | _auto-generated random value_ |
| `DB_PASSWORD` | _auto-generated random value_ |

## Domain

- **Service and port:** `server:3000`
- **Hostname:** `twenty.yourdomain.com`

The hostname is attached automatically when the template is seeded;
change it in the **Domains** tab before clicking Deploy if you want
something else.

## Compose file

For reference -- this is what the template deploys. **Do not paste this
anywhere.** The compose is seeded into Dokploy automatically; the
client-facing adjustments you make happen in the Environment and
Domains tabs (described above), never in the compose itself.

```yaml
# Twenty -- modern open-source CRM. Email/password login out of the box;
# to enable Keycloak SSO, go to Settings -> Security -> Single sign-on
# (OIDC) after first deploy and paste the OIDC_* values from
# the Environment tab. Workspace-level config -- not env-driven in the
# community edition.

services:
  server:
    image: twentycrm/twenty:v2.3.2
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PG_DATABASE_URL: postgres://postgres:${DB_PASSWORD}@db:5432/default
      REDIS_URL: redis://redis:6379
      SERVER_URL: https://${TWENTY_HOSTNAME}
      STORAGE_TYPE: local
      STORAGE_LOCAL_PATH: /app/.local-storage
      APP_SECRET: ${TWENTY_APP_SECRET}
      # Exposed for operator reference (Settings -> SSO) but not read by
      # the server directly.
      OIDC_CLIENT_ID: ${OIDC_CLIENT_ID}
      OIDC_CLIENT_SECRET: ${OIDC_CLIENT_SECRET}
      OIDC_ISSUER_URL: ${OIDC_ISSUER_URL}
    volumes:
      - server-data:/app/.local-storage
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    labels:
      - "vps.auth.mode=public"
      - "vps.auth.oidc=true"
      - "vps.auth.groups=client-staff"
      - "vps.auth.oidc.redirect_uris=https://${TWENTY_HOSTNAME}/auth/oidc/callback"
      - "vps.auth.oidc.scopes=openid email profile"
      - "vps.auto-update=patch"
    networks:
      dokploy-network:
        aliases:
          - twenty
      default: {}

  worker:
    image: twentycrm/twenty:v2.3.2
    restart: unless-stopped
    command: ["yarn", "worker:prod"]
    environment:
      NODE_ENV: production
      PG_DATABASE_URL: postgres://postgres:${DB_PASSWORD}@db:5432/default
      REDIS_URL: redis://redis:6379
      SERVER_URL: https://${TWENTY_HOSTNAME}
      STORAGE_TYPE: local
      STORAGE_LOCAL_PATH: /app/.local-storage
      APP_SECRET: ${TWENTY_APP_SECRET}
    volumes:
      - server-data:/app/.local-storage
    depends_on:
      - server
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  db:
    image: postgres:16.13-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: default
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  redis:
    image: redis:8.6.3-alpine3.23
    restart: unless-stopped
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

[<- Back to all pre-configured apps](/en/apps/)
