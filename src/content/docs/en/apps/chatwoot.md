---
title: "Chatwoot"
description: "Conversation-first omnichannel inbox. Email, live-chat widget, WhatsApp, Facebook, Instagram, Twitter/X in one inbox."
---

Conversation-first omnichannel inbox. Email, live-chat widget, WhatsApp, Facebook, Instagram, Twitter/X in one inbox.

- **Upstream project:** <https://www.chatwoot.com/>
- **Replaces:** **Intercom**, **Front**, **Help Scout (for chat channels)**
- **Sign-in (SSO):** Not available -- this app's community edition doesn't support OIDC. Users keep a per-app email/password login.

## Setup steps

1. Click **Deploy**. Wait ~2 min for the first boot (Rails migrations).
2. Visit your Chatwoot domain. Complete the setup wizard to create the first admin account.
3. Add channels: **Settings** -> **Inboxes** -> **Add inbox**. Pick the channel (email, website widget, WhatsApp, etc.) and follow the per-channel instructions.

**Note on sign-in:** Chatwoot's community edition doesn't support OIDC/SSO -- agents keep per-app email/password logins. SAML/OIDC is enterprise-only. If SSO matters, consider Zammad instead (trade-off: ticket-first workflow vs Chatwoot's conversation-first inbox).

## Environment variables

These values live in the Dokploy compose's **Environment** tab. Random
secrets are minted automatically when the template is first seeded --
you don't need to generate them yourself.

| Variable | Default |
|---|---|
| `CHATWOOT_HOSTNAME` | `support.yourdomain.com` |
| `SECRET_KEY_BASE` | _auto-generated random value_ |
| `DB_PASSWORD` | _auto-generated random value_ |

## Domain

- **Service and port:** `rails:3000`
- **Hostname:** `support.yourdomain.com`

The hostname is attached automatically when the template is seeded;
change it in the **Domains** tab before clicking Deploy if you want
something else.

## Compose file

For reference -- this is what the template deploys. **Do not paste this
anywhere.** The compose is seeded into Dokploy automatically; the
client-facing adjustments you make happen in the Environment and
Domains tabs (described above), never in the compose itself.

```yaml
# Chatwoot -- customer support / omnichannel inbox (email, live chat,
# WhatsApp, Facebook, Instagram, Twitter, ...). Community edition uses
# email/password for agent login; SAML/OIDC SSO is enterprise-only.

services:
  rails:
    image: chatwoot/chatwoot:v4.13.0-ce
    restart: unless-stopped
    entrypoint: docker/entrypoints/rails.sh
    command: ["bundle", "exec", "rails", "s", "-p", "3000", "-b", "0.0.0.0"]
    environment:
      RAILS_ENV: production
      NODE_ENV: production
      SECRET_KEY_BASE: ${SECRET_KEY_BASE}
      FRONTEND_URL: https://${CHATWOOT_HOSTNAME}
      DEFAULT_LOCALE: en
      FORCE_SSL: "true"
      INSTALLATION_NAME: "Chatwoot"
      POSTGRES_HOST: db
      POSTGRES_DATABASE: chatwoot
      POSTGRES_USERNAME: chatwoot
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      REDIS_URL: redis://redis:6379
      RAILS_LOG_TO_STDOUT: "true"
      ACTIVE_STORAGE_SERVICE: local
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - storage-data:/app/storage
    labels:
      - "vps.auth.mode=public"
      - "vps.auto-update=patch"
    networks:
      catena-network:
        aliases:
          - chatwoot
      default: {}

  sidekiq:
    image: chatwoot/chatwoot:v4.13.0-ce
    restart: unless-stopped
    command: ["bundle", "exec", "sidekiq", "-C", "config/sidekiq.yml"]
    environment:
      RAILS_ENV: production
      NODE_ENV: production
      SECRET_KEY_BASE: ${SECRET_KEY_BASE}
      FRONTEND_URL: https://${CHATWOOT_HOSTNAME}
      POSTGRES_HOST: db
      POSTGRES_DATABASE: chatwoot
      POSTGRES_USERNAME: chatwoot
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      REDIS_URL: redis://redis:6379
      ACTIVE_STORAGE_SERVICE: local
    depends_on:
      - rails
    volumes:
      - storage-data:/app/storage
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  db:
    image: postgres:16.13-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: chatwoot
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: chatwoot
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U chatwoot"]
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
  storage-data:
  db-data:

networks:
  catena-network:
    external: true
```

---

[<- Back to all pre-configured apps](/en/apps/)
