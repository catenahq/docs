---
title: "Plane"
description: "Open-source project management -- issues, cycles, modules, pages, workspaces."
---

Open-source project management -- issues, cycles, modules, pages, workspaces.

- **Upstream project:** <https://plane.so/>
- **Replaces:** **Jira**, **Linear**, **Asana**, **ClickUp**
- **Sign-in (SSO):** Enable via the app's admin UI -- paste the `OIDC_*` values from the Environment tab once.

## Setup steps

1. Click **Deploy**. Wait ~2-3 min (multi-service stack with MinIO).
2. Visit your Plane domain and sign up to create the instance admin + first workspace.
3. *(Optional)* Enable Keycloak SSO: while signed in, visit `https://projects.<your-domain>/god-mode` -> **Authentication** -> **OpenID Connect** -> paste `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, `OIDC_ISSUER_URL` from the Environment tab. Save.



## Environment variables

These values live in the Dokploy compose's **Environment** tab. Random
secrets are minted automatically when the template is first seeded --
you don't need to generate them yourself.

| Variable | Default |
|---|---|
| `PLANE_HOSTNAME` | `projects.yourdomain.com` |
| `PLANE_SECRET_KEY` | _auto-generated random value_ |
| `DB_PASSWORD` | _auto-generated random value_ |
| `PLANE_MINIO_ACCESS_KEY` | _auto-generated random value_ |
| `PLANE_MINIO_SECRET_KEY` | _auto-generated random value_ |

## Domain

- **Service and port:** `proxy:80`
- **Hostname:** `projects.yourdomain.com`

The hostname is attached automatically when the template is seeded;
change it in the **Domains** tab before clicking Deploy if you want
something else.

## Compose file

For reference -- this is what the template deploys. **Do not paste this
anywhere.** The compose is seeded into Dokploy automatically; the
client-facing adjustments you make happen in the Environment and
Domains tabs (described above), never in the compose itself.

```yaml
# Plane -- open-source project management (Jira/Linear alternative).
# Multi-service stack: web/api/worker/admin/space/live behind an nginx
# proxy, backed by postgres + redis + minio (object storage for
# attachments). OIDC SSO is post-deploy: sign in as the first user,
# visit God-mode (/god-mode) -> Authentication -> OpenID Connect ->
# paste the OIDC_* values from the Environment tab.

services:
  web:
    image: makeplane/plane-frontend:v1.3.0
    restart: unless-stopped
    environment:
      NEXT_PUBLIC_API_BASE_URL: ""
    depends_on:
      - api
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  space:
    image: makeplane/plane-space:v1.3.0
    restart: unless-stopped
    environment:
      NEXT_PUBLIC_API_BASE_URL: ""
    depends_on:
      - api
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  admin:
    image: makeplane/plane-admin:v1.3.0
    restart: unless-stopped
    environment:
      NEXT_PUBLIC_API_BASE_URL: ""
    depends_on:
      - api
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  api:
    image: makeplane/plane-backend:v1.3.0
    restart: unless-stopped
    command: ./bin/docker-entrypoint-api.sh
    environment: &backend-env
      DEBUG: "0"
      SECRET_KEY: ${PLANE_SECRET_KEY}
      WEB_URL: https://${PLANE_HOSTNAME}
      CORS_ALLOWED_ORIGINS: https://${PLANE_HOSTNAME}
      DOCKERIZED: "1"
      GUNICORN_WORKERS: "2"
      POSTGRES_USER: plane
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: plane
      POSTGRES_HOST: db
      POSTGRES_PORT: "5432"
      DATABASE_URL: postgresql://plane:${DB_PASSWORD}@db:5432/plane
      REDIS_HOST: redis
      REDIS_PORT: "6379"
      REDIS_URL: redis://redis:6379/
      AWS_REGION: ""
      AWS_ACCESS_KEY_ID: ${PLANE_MINIO_ACCESS_KEY}
      AWS_SECRET_ACCESS_KEY: ${PLANE_MINIO_SECRET_KEY}
      AWS_S3_ENDPOINT_URL: http://minio:9000
      AWS_S3_BUCKET_NAME: uploads
      USE_MINIO: "1"
      FILE_SIZE_LIMIT: "5242880"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
      minio:
        condition: service_started
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  worker:
    image: makeplane/plane-backend:v1.3.0
    restart: unless-stopped
    command: ./bin/docker-entrypoint-worker.sh
    environment: *backend-env
    depends_on:
      - api
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  beat-worker:
    image: makeplane/plane-backend:v1.3.0
    restart: unless-stopped
    command: ./bin/docker-entrypoint-beat.sh
    environment: *backend-env
    depends_on:
      - api
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  live:
    image: makeplane/plane-live:v1.3.0
    restart: unless-stopped
    environment:
      API_BASE_URL: http://api:8000
    depends_on:
      - api
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  proxy:
    image: makeplane/plane-proxy:v1.3.0
    restart: unless-stopped
    environment:
      FILE_SIZE_LIMIT: "5242880"
      BUCKET_NAME: uploads
    depends_on:
      - web
      - api
      - space
      - admin
    labels:
      - "vps.auth.mode=public"
      - "vps.auth.oidc=true"
      - "vps.auth.groups=client-staff"
      - "vps.auth.oidc.redirect_uris=https://${PLANE_HOSTNAME}/auth/oidc/callback/"
      - "vps.auth.oidc.scopes=openid email profile"
      - "vps.auto-update=patch"
    networks:
      dokploy-network:
        aliases:
          - plane
      default: {}

  db:
    image: postgres:16.13-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: plane
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: plane
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U plane"]
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
    volumes:
      - redis-data:/data
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  minio:
    image: minio/minio:RELEASE.2025-09-07T16-13-09Z
    restart: unless-stopped
    command: server /export --console-address ":9090"
    environment:
      MINIO_ROOT_USER: ${PLANE_MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${PLANE_MINIO_SECRET_KEY}
    volumes:
      - minio-data:/export
    labels:
      - "vps.auto-update=off"
    networks:
      - default

volumes:
  db-data:
  redis-data:
  minio-data:

networks:
  dokploy-network:
    external: true
```

---

[<- Back to all pre-configured apps](./)
