---
title: "Postiz"
description: "Schedule and publish social media posts across Twitter/X, LinkedIn, Facebook, Instagram, YouTube, TikTok, and more."
---

Schedule and publish social media posts across Twitter/X, LinkedIn, Facebook, Instagram, YouTube, TikTok, and more.

- **Upstream project:** <https://postiz.com/>
- **Replaces:** **Buffer**, **Hootsuite**, **Later**
- **Sign-in (SSO):** Not available -- this app's community edition doesn't support OIDC. Users keep a per-app email/password login.

## Setup steps

1. Click **Deploy**. Wait ~1 min.
2. Visit your Postiz domain and create the admin account.
3. Add each social network's app credentials: **Settings** -> pick the network -> paste your developer-app client ID + secret from the network's developer portal. One-time per network.

**Note on sign-in:** Postiz uses local email/password login. No native OIDC in the current community release. The user count for this tool is typically 1-3 marketing people, so the SSO gap is less impactful than for chat / helpdesk tools.

## Environment variables

These values are the fields you fill in when deploying the template
from your server's **App Templates** panel (Portainer). Random
secrets are minted automatically when the template is first seeded --
you don't need to generate them yourself.

| Variable | Default |
|---|---|
| `DOMAIN_HOST` | `social.yourdomain.com` |
| `POSTIZ_HOSTNAME` | `social.yourdomain.com` |
| `JWT_SECRET` | _auto-generated random value_ |
| `DB_PASSWORD` | _auto-generated random value_ |

## Domain

- **Service and port:** `postiz:5000`
- **Hostname:** `social.yourdomain.com`

The hostname is attached automatically when the template is deployed;
talk to your contact before deploying if you want something else.

## Compose file

For reference -- this is what the template deploys. **Do not paste this
anywhere.** The compose is seeded into Portainer automatically; the
client-facing adjustments you make happen in the deploy form's
environment fields (described above), never in the compose itself.

```yaml
# Postiz -- social media scheduling / posting across networks (Twitter/X,
# LinkedIn, Facebook, Instagram, YouTube, TikTok, ...). Login is local
# (email/password) + optional social OAuth buttons configured per-
# network. No native OIDC in the current community release.

services:
  postiz:
    image: ghcr.io/gitroomhq/postiz-app:v2.21.7
    restart: unless-stopped
    environment:
      NOT_SECURED: "false"
      IS_GENERAL: "true"
      STORAGE_PROVIDER: local
      UPLOAD_DIRECTORY: /uploads
      NEXT_PUBLIC_UPLOAD_DIRECTORY: /uploads
      MAIN_URL: https://${POSTIZ_HOSTNAME}
      FRONTEND_URL: https://${POSTIZ_HOSTNAME}
      NEXT_PUBLIC_BACKEND_URL: https://${POSTIZ_HOSTNAME}/api
      BACKEND_INTERNAL_URL: http://localhost:3000
      DATABASE_URL: postgres://postiz:${DB_PASSWORD}@db:5432/postiz
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      DISABLE_REGISTRATION: "false"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - postiz-uploads:/uploads
      - postiz-config:/config
    labels:
      - "vps.route.host=${DOMAIN_HOST}"
      - "vps.route.port=5000"
      - "vps.route.service=postiz"
      - "vps.auth.mode=public"
      - "vps.auto-update=patch"
    networks:
      catena-network:
        aliases:
          - postiz
      default: {}

  db:
    image: postgres:18.4-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: postiz
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: postiz
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postiz"]
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
  postiz-uploads:
  postiz-config:
  db-data:

networks:
  catena-network:
    external: true
```

---

[<- Back to all pre-configured apps](/en/apps/)
