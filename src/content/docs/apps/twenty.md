---
title: "Twenty"
description: "CRM moderne open-source. Contacts, entreprises, opportunités, synchronisation email, pipelines. Alternative à EspoCRM (le CRM par défaut)."
---

CRM moderne open-source. Contacts, entreprises, opportunités, synchronisation email, pipelines. Alternative à EspoCRM (le CRM par défaut).

- **Projet original :** <https://twenty.com/>
- **Remplace :** **Salesforce**, **HubSpot**, **Pipedrive**
- **Connexion (SSO) :** À activer via l'interface admin -- collez les valeurs `OIDC_*` depuis l'onglet Environment une fois.

## Étapes de configuration

1. Cliquez **Deploy**. Patientez ~1 min.
2. Visitez votre domaine Twenty et créez le compte initial (workspace + admin).
3. *(Optionnel)* Activez Keycloak SSO : **Settings** -> **Security** -> **Single sign-on** -> collez `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, `OIDC_ISSUER_URL` depuis l'onglet Environment. Validez.

**EspoCRM vs Twenty.** EspoCRM est le CRM par défaut de cette stack (mature, OIDC natif, apps mobiles). Twenty est offert comme alternative pour les clients qui préfèrent son UI façon Notion ; les deux peuvent cohabiter. Le domaine par défaut `crm.<votre-domaine>` est réservé à EspoCRM -- Twenty utilise par défaut `twenty.<votre-domaine>`.

## Variables d'environnement

Ces valeurs se trouvent dans l'onglet **Environment** du compose
Dokploy. Les secrets aléatoires sont générés automatiquement au
premier semi du template -- vous n'avez pas à les générer vous-même.

| Variable | Valeur par défaut |
|---|---|
| `TWENTY_HOSTNAME` | `twenty.yourdomain.com` |
| `TWENTY_APP_SECRET` | _valeur aléatoire auto-générée_ |
| `DB_PASSWORD` | _valeur aléatoire auto-générée_ |

## Domaine

- **Service et port :** `server:3000`
- **Nom d'hôte :** `twenty.yourdomain.com`

Le nom d'hôte est attaché automatiquement au semi du template ;
modifiez-le dans l'onglet **Domains** avant de cliquer Deploy si
vous souhaitez autre chose.

## Fichier compose

Pour référence -- c'est ce que le template déploie. **Ne collez ceci
nulle part.** Le compose est semé dans Dokploy automatiquement ; les
ajustements côté client se font dans les onglets Environment et
Domains (décrits plus haut), jamais dans le compose lui-même.

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

[<- Retour au catalogue des applications pré-configurées](/docs/apps/)
