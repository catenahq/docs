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
2. Visitez le domaine Twenty et créez le compte initial (workspace + admin).
3. *(Optionnel)* Activez Keycloak SSO : **Settings** -> **Security** -> **Single sign-on** -> collez `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`, `OIDC_ISSUER_URL` depuis l'onglet Environment. Validez.

**EspoCRM vs Twenty.** EspoCRM est le CRM par défaut de cette stack (mature, OIDC natif, apps mobiles). Twenty est offert comme alternative pour les clients qui préfèrent son UI façon Notion ; les deux peuvent cohabiter. Le domaine par défaut `crm.<votre-domaine>` est réservé à EspoCRM -- Twenty utilise par défaut `twenty.<votre-domaine>`.

## Variables d'environnement

Ces valeurs sont les champs à remplir au déploiement du template
depuis le panneau **App Templates** du serveur (Portainer). Les
secrets aléatoires sont générés automatiquement au premier semis du
template : aucun n'est à générer à la main.

| Variable | Valeur par défaut |
|---|---|
| `DOMAIN_HOST` | `twenty.yourdomain.com` |
| `TWENTY_HOSTNAME` | `twenty.yourdomain.com` |
| `TWENTY_APP_SECRET` | _valeur aléatoire auto-générée_ |
| `DB_PASSWORD` | _valeur aléatoire auto-générée_ |

## Domaine

- **Service et port :** `server:3000`
- **Nom d'hôte :** `twenty.yourdomain.com`

Le nom d'hôte est attaché automatiquement au déploiement du template.
Un autre nom se convient avant le déploiement, sur demande.

## Fichier compose

Pour référence -- c'est ce que le template déploie. **Ne collez ceci
nulle part.** Le compose est semé dans Portainer automatiquement ; les
ajustements côté client se font dans les champs d'environnement du
formulaire de déploiement (décrits plus haut), jamais dans le compose
lui-même.

```yaml
# Twenty -- modern open-source CRM. Email/password login out of the box;
# to enable Keycloak SSO, go to Settings -> Security -> Single sign-on
# (OIDC) after first deploy and paste the OIDC_* values from
# the Environment tab. Workspace-level config -- not env-driven in the
# community edition.

services:
  server:
    image: twentycrm/twenty:v2.3.2
    deploy:
      restart_policy:
        condition: any
      placement:
        constraints:
          - node.labels.catena.role==data
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
    labels:
      - "vps.route.host=${DOMAIN_HOST}"
      - "vps.route.port=3000"
      - "vps.route.service=server"
      - "vps.auth.mode=public"
      - "vps.auth.oidc=true"
      - "vps.auth.groups=staff"
      - "vps.auth.oidc.redirect_uris=https://${TWENTY_HOSTNAME}/auth/oidc/callback"
      - "vps.auth.oidc.scopes=openid email profile"
      - "vps.auto-update=patch"
      - "vps.app=catena-twenty"
      - "vps.component=server"
    networks:
      catena-network:
        aliases:
          - catena-twenty
      default: {}

  worker:
    image: twentycrm/twenty:v2.3.2
    deploy:
      restart_policy:
        condition: any
      placement:
        constraints:
          - node.labels.catena.role==data
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
    labels:
      - "vps.auto-update=patch"
      - "vps.app=catena-twenty"
      - "vps.component=worker"
    networks:
      - default

  db:
    image: postgres:18.4-alpine
    deploy:
      restart_policy:
        condition: any
      placement:
        constraints:
          - node.labels.catena.role==data
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: default
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    labels:
      - "vps.auto-update=patch"
      - "vps.app=catena-twenty"
      - "vps.component=db"
    networks:
      - default

  redis:
    image: redis:8.6.3-alpine3.23
    deploy:
      restart_policy:
        condition: any
    labels:
      - "vps.auto-update=patch"
      - "vps.app=catena-twenty"
      - "vps.component=redis"
    networks:
      - default

volumes:
  server-data:
  db-data:

networks:
  catena-network:
    external: true
```

---

[<- Retour au catalogue des applications pré-configurées](/fr/apps/)
