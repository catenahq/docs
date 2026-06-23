---
title: "Zammad"
description: "Ticket-first help desk. Email, Telegram, social channels, SLAs, knowledge base. Native OIDC."
---

Ticket-first help desk. Email, Telegram, social channels, SLAs, knowledge base. Native OIDC.

- **Upstream project:** <https://zammad.com/>
- **Replaces:** **Zendesk**, **Freshdesk**, **Jira Service Desk**
- **Sign-in (SSO):** Enable via the app's admin UI -- paste the `OIDC_*` values from the Environment tab once.

## Setup steps

1. Click **Deploy**. First boot is slow (2-3 min) -- Elasticsearch and Rails migrations run on startup.
2. Visit your Zammad domain. Complete the setup wizard (admin account, organization name).
3. *(Optional)* Enable Keycloak SSO: **Settings** -> **Security** -> **Third-party authentication** -> **OpenID Connect** -> paste `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, `OIDC_ISSUER_URL` from the Environment tab. Save.

**Resource note:** Zammad bundles Elasticsearch which reserves ~1.5 GB RAM. Plan for a ≥4 GB VPS if you run Zammad alongside other apps.

## Environment variables

These values live in the Dokploy compose's **Environment** tab. Random
secrets are minted automatically when the template is first seeded --
you don't need to generate them yourself.

| Variable | Default |
|---|---|
| `ZAMMAD_HOSTNAME` | `help.yourdomain.com` |
| `DB_PASSWORD` | _auto-generated random value_ |

## Domain

- **Service and port:** `zammad-nginx:8080`
- **Hostname:** `help.yourdomain.com`

The hostname is attached automatically when the template is seeded;
change it in the **Domains** tab before clicking Deploy if you want
something else.

## Compose file

For reference -- this is what the template deploys. **Do not paste this
anywhere.** The compose is seeded into Dokploy automatically; the
client-facing adjustments you make happen in the Environment and
Domains tabs (described above), never in the compose itself.

```yaml
# Zammad -- ticket-first help desk / omnichannel support. Native OIDC
# support (configured in Settings -> Security -> Third-party
# authentication -> OIDC after first admin sign-in).
#
# Heavier than Chatwoot: bundles Elasticsearch (needs ~1.5 GB RAM), a
# dedicated scheduler, websocket process, nginx front-end, + the usual
# postgres/redis/memcached. Plan for a 4+ GB VPS tier.

x-zammad-env: &zammad-env
  POSTGRESQL_HOST: db
  POSTGRESQL_PORT: "5432"
  POSTGRESQL_DB: zammad_production
  POSTGRESQL_USER: zammad
  POSTGRESQL_PASS: ${DB_PASSWORD}
  REDIS_URL: redis://redis:6379
  MEMCACHE_SERVERS: memcached:11211
  ELASTICSEARCH_SCHEMA: http
  ELASTICSEARCH_HOST: elasticsearch
  ELASTICSEARCH_PORT: "9200"
  ELASTICSEARCH_NAMESPACE: zammad

services:
  zammad-init:
    image: zammad/zammad:7.0.1-0035
    restart: on-failure
    command: ["zammad-init"]
    environment: *zammad-env
    volumes:
      - zammad-storage:/opt/zammad/storage
    depends_on:
      db:
        condition: service_healthy
      elasticsearch:
        condition: service_healthy
    networks:
      - default

  zammad-railsserver:
    image: zammad/zammad:7.0.1-0035
    restart: unless-stopped
    command: ["zammad-railsserver"]
    environment: *zammad-env
    volumes:
      - zammad-storage:/opt/zammad/storage
    depends_on:
      - zammad-init
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  zammad-websocket:
    image: zammad/zammad:7.0.1-0035
    restart: unless-stopped
    command: ["zammad-websocket"]
    environment: *zammad-env
    depends_on:
      - zammad-init
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  zammad-scheduler:
    image: zammad/zammad:7.0.1-0035
    restart: unless-stopped
    command: ["zammad-scheduler"]
    environment: *zammad-env
    volumes:
      - zammad-storage:/opt/zammad/storage
    depends_on:
      - zammad-init
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  # Public-facing: fronts railsserver + websocket under a single vhost.
  zammad-nginx:
    image: zammad/zammad:7.0.1-0035
    restart: unless-stopped
    command: ["zammad-nginx"]
    environment:
      <<: *zammad-env
      NGINX_SERVER_NAME: ${ZAMMAD_HOSTNAME}
      NGINX_CLIENT_MAX_BODY_SIZE: 50M
    depends_on:
      - zammad-railsserver
      - zammad-websocket
    labels:
      - "vps.auth.mode=public"
      - "vps.auth.oidc=true"
      - "vps.auth.groups=staff"
      - "vps.auth.oidc.redirect_uris=https://${ZAMMAD_HOSTNAME}/auth/openid_connect/callback"
      - "vps.auth.oidc.scopes=openid email profile"
      - "vps.auto-update=patch"
    networks:
      dokploy-network:
        aliases:
          - zammad
      default: {}

  db:
    image: postgres:16.13-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: zammad
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: zammad_production
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U zammad"]
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

  memcached:
    image: memcached:1.6.41-alpine3.23
    restart: unless-stopped
    command: ["memcached", "-m", "256"]
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.19.15
    restart: unless-stopped
    environment:
      discovery.type: single-node
      xpack.security.enabled: "false"
      ES_JAVA_OPTS: "-Xms512m -Xmx1024m"
    volumes:
      - es-data:/usr/share/elasticsearch/data
    healthcheck:
      test: ["CMD-SHELL", "curl -sf http://localhost:9200/_cluster/health | grep -qE '\"status\":\"(green|yellow)\"'"]
      interval: 15s
      timeout: 10s
      retries: 10
      start_period: 60s
    labels:
      - "vps.auto-update=off"
    networks:
      - default

volumes:
  zammad-storage:
  db-data:
  es-data:

networks:
  dokploy-network:
    external: true
```

---

[<- Back to all pre-configured apps](/apps/)
