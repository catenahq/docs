---
title: "Outline"
description: "Team wiki / knowledge base. Notion-style pages, collections, nested docs. Keycloak SSO pre-wired."
---

Team wiki / knowledge base. Notion-style pages, collections, nested docs. Keycloak SSO pre-wired.

- **Upstream project:** <https://www.getoutline.com/>
- **Replaces:** **Notion**, **Confluence**, **Google Sites**
- **Sign-in (SSO):** Pre-wired -- the login page shows 'Sign in with Keycloak' out of the box, no post-deploy step.

## Setup steps

1. Click **Deploy**. Environment defaults are all pre-filled.
2. Wait ~1 min for the first boot.
3. Visit your Outline domain -> click **Sign in with Keycloak**. The first user to sign in becomes the workspace admin.



## Environment variables

These values are the fields you fill in when deploying the template
from your server's **App Templates** panel (Portainer). Random
secrets are minted automatically when the template is first seeded --
you don't need to generate them yourself.

| Variable | Default |
|---|---|
| `DOMAIN_HOST` | `wiki.yourdomain.com` |
| `OUTLINE_HOSTNAME` | `wiki.yourdomain.com` |
| `OUTLINE_SECRET_KEY` | _auto-generated random value_ |
| `OUTLINE_UTILS_SECRET` | _auto-generated random value_ |
| `DB_PASSWORD` | _auto-generated random value_ |

## Domain

- **Service and port:** `outline:3000`
- **Hostname:** `wiki.yourdomain.com`

The hostname is attached automatically when the template is deployed;
talk to your contact before deploying if you want something else.

## Compose file

For reference -- this is what the template deploys. **Do not paste this
anywhere.** The compose is seeded into Portainer automatically; the
client-facing adjustments you make happen in the deploy form's
environment fields (described above), never in the compose itself.

```yaml
# Outline -- team wiki / knowledge base, Keycloak SSO pre-wired via
# env-based OIDC. Zero admin-UI config needed after first deploy; users
# see "Sign in with Keycloak" on the login page.

services:
  outline:
    image: outlinewiki/outline:1.7.1
    restart: unless-stopped
    command: >-
      sh -c "yarn db:migrate --env production-ssl-disabled && yarn start"
    environment:
      NODE_ENV: production
      SECRET_KEY: ${OUTLINE_SECRET_KEY}
      UTILS_SECRET: ${OUTLINE_UTILS_SECRET}
      DATABASE_URL: postgres://outline:${DB_PASSWORD}@db:5432/outline
      REDIS_URL: redis://redis:6379
      URL: https://${OUTLINE_HOSTNAME}
      PORT: "3000"
      FILE_STORAGE: local
      FILE_STORAGE_LOCAL_ROOT_DIR: /var/lib/outline/data
      FILE_STORAGE_UPLOAD_MAX_SIZE: "262144000"
      FORCE_HTTPS: "true"
      ENABLE_UPDATES: "false"

      # Keycloak OIDC -- populated by dashboard-sync after first deploy.
      OIDC_CLIENT_ID: ${OIDC_CLIENT_ID}
      OIDC_CLIENT_SECRET: ${OIDC_CLIENT_SECRET}
      OIDC_AUTH_URI: ${OIDC_ISSUER_URL}/protocol/openid-connect/auth
      OIDC_TOKEN_URI: ${OIDC_ISSUER_URL}/protocol/openid-connect/token
      OIDC_USERINFO_URI: ${OIDC_ISSUER_URL}/protocol/openid-connect/userinfo
      OIDC_LOGOUT_URI: ${OIDC_ISSUER_URL}/protocol/openid-connect/logout
      OIDC_USERNAME_CLAIM: preferred_username
      OIDC_DISPLAY_NAME: Keycloak
      OIDC_SCOPES: openid profile email
    volumes:
      - outline-data:/var/lib/outline/data
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    labels:
      - "vps.route.host=${DOMAIN_HOST}"
      - "vps.route.port=3000"
      - "vps.route.service=outline"
      - "vps.auth.mode=public"
      - "vps.auth.oidc=true"
      - "vps.auth.groups=staff"
      - "vps.auth.oidc.redirect_uris=https://${OUTLINE_HOSTNAME}/auth/oidc.callback"
      - "vps.auth.oidc.scopes=openid email profile"
      - "vps.auto-update=patch"
    networks:
      catena-network:
        aliases:
          - outline
      default: {}

  db:
    image: postgres:18.4-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: outline
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: outline
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U outline"]
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
  outline-data:
  db-data:

networks:
  catena-network:
    external: true
```

---

[<- Back to all pre-configured apps](/en/apps/)
