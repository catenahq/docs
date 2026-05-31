---
title: "Plane"
description: "Gestion de projet open-source -- issues, cycles, modules, pages, workspaces."
---

Gestion de projet open-source -- issues, cycles, modules, pages, workspaces.

- **Projet original :** <https://plane.so/>
- **Remplace :** **Jira**, **Linear**, **Asana**, **ClickUp**
- **Connexion (SSO) :** À activer via l'interface admin -- collez les valeurs `OIDC_*` depuis l'onglet Environment une fois.

## Étapes de configuration

1. Cliquez **Deploy**. Patientez ~2-3 min (pile multi-services avec MinIO).
2. Visitez votre domaine Plane et créez le compte admin initial + le premier workspace.
3. *(Optionnel)* Activez Keycloak SSO : une fois connecté, visitez `https://projects.<votre-domaine>/god-mode` -> **Authentication** -> **OpenID Connect** -> collez `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, `OIDC_ISSUER_URL` depuis l'onglet Environment. Validez.



## Variables d'environnement

Ces valeurs se trouvent dans l'onglet **Environment** du compose
Dokploy. Les secrets aléatoires sont générés automatiquement au
premier semi du template -- vous n'avez pas à les générer vous-même.

| Variable | Valeur par défaut |
|---|---|
| `PLANE_HOSTNAME` | `projects.yourdomain.com` |
| `PLANE_SECRET_KEY` | _valeur aléatoire auto-générée_ |
| `DB_PASSWORD` | _valeur aléatoire auto-générée_ |
| `PLANE_MINIO_ACCESS_KEY` | _valeur aléatoire auto-générée_ |
| `PLANE_MINIO_SECRET_KEY` | _valeur aléatoire auto-générée_ |

## Domaine

- **Service et port :** `proxy:80`
- **Nom d'hôte :** `projects.yourdomain.com`

Le nom d'hôte est attaché automatiquement au semi du template ;
modifiez-le dans l'onglet **Domains** avant de cliquer Deploy si
vous souhaitez autre chose.

## Fichier compose

Pour référence -- c'est ce que le template déploie. **Ne collez ceci
nulle part.** Le compose est semé dans Dokploy automatiquement ; les
ajustements côté client se font dans les onglets Environment et
Domains (décrits plus haut), jamais dans le compose lui-même.

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
      - "vps.auth.groups=staff"
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

[<- Retour au catalogue des applications pré-configurées](/apps/)
