---
title: "EspoCRM"
description: "CRM par défaut de la stack. Contacts, comptes, opportunités, prospects, calendrier, intégration email, mass mail, automatisation."
---

CRM par défaut de la stack. Contacts, comptes, opportunités, prospects, calendrier, intégration email, mass mail, automatisation. OIDC natif via un bouton post-déploiement.

- **Projet original :** <https://www.espocrm.com/>
- **Remplace :** **Salesforce**, **HubSpot**, **Zoho CRM**, **Pipedrive**
- **Connexion (SSO) :** À activer via l'interface admin -- collez les valeurs `OIDC_*` depuis l'onglet Environment une fois.

## Étapes de configuration

1. Cliquez **Deploy**. Patientez ~1 min.
2. Visitez votre domaine EspoCRM. Connectez-vous avec `ESPOCRM_ADMIN_USERNAME` / `ESPOCRM_ADMIN_PASSWORD` de l'onglet Environment.
3. *(Optionnel)* Activez Keycloak SSO : **Administration** -> **Authentication** -> réglez **Method** sur **OIDC** -> collez :
   - **Client ID :** `OIDC_CLIENT_ID` depuis Environment (`espocrm`)
   - **Client Secret :** `OIDC_CLIENT_SECRET` depuis Environment (demandez à votre opérateur de le générer côté Keycloak si vide)
   - **Authorization Endpoint :** `<OIDC_ISSUER_URL>/protocol/openid-connect/auth`
   - **Token Endpoint :** `<OIDC_ISSUER_URL>/protocol/openid-connect/token`
   - **JSON Web Key Set Endpoint :** `<OIDC_ISSUER_URL>/protocol/openid-connect/certs`
   - **Username Claim :** `preferred_username`
   - Validez. La page de connexion affiche **Sign in with Keycloak**. La connexion admin locale continue de fonctionner comme issue de secours.

### Pourquoi EspoCRM est le CRM par défaut

C'est le seul CRM entièrement open-source du catalogue avec OIDC natif en édition communautaire (sans palier Pro), des apps mobiles existantes et un historique stable de mises à jour. Twenty est l'alternative si vous préférez son UI moderne façon Notion ; les deux restent au catalogue pour vous laisser choisir.

### Ressources

EspoCRM tourne en PHP-Apache + MariaDB + un cron sidecar. Prévoyez ~1 GB RAM au repos, ~2 GB sous import en masse ou envoi mass-email.

## Variables d'environnement

Ces valeurs se trouvent dans l'onglet **Environment** du compose
Dokploy. Les secrets aléatoires sont générés automatiquement au
premier semi du template -- vous n'avez pas à les générer vous-même.

| Variable | Valeur par défaut |
|---|---|
| `ESPOCRM_HOSTNAME` | `crm.yourdomain.com` |
| `ESPOCRM_ADMIN_USERNAME` | `admin` |
| `ESPOCRM_ADMIN_PASSWORD` | _valeur aléatoire auto-générée_ |
| `DB_PASSWORD` | _valeur aléatoire auto-générée_ |
| `DB_ROOT_PASSWORD` | _valeur aléatoire auto-générée_ |
| `OIDC_CLIENT_ID` | `espocrm` |
| `OIDC_CLIENT_SECRET` | _(à définir avant déploiement)_ |
| `OIDC_ISSUER_URL` | `https://auth.yourdomain.com/realms/catena` |

## Domaine

- **Service et port :** `espocrm:80`
- **Nom d'hôte :** `crm.yourdomain.com`

Le nom d'hôte est attaché automatiquement au semi du template ;
modifiez-le dans l'onglet **Domains** avant de cliquer Deploy si
vous souhaitez autre chose.

## Fichier compose

Pour référence -- c'est ce que le template déploie. **Ne collez ceci
nulle part.** Le compose est semé dans Dokploy automatiquement ; les
ajustements côté client se font dans les onglets Environment et
Domains (décrits plus haut), jamais dans le compose lui-même.

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
      - "vps.auth.groups=staff"
      - "vps.auth.oidc.redirect_uris=https://${ESPOCRM_HOSTNAME}/oauth-callback.php"
      - "vps.auth.oidc.scopes=openid email profile"
      - "vps.auto-update=patch"
    networks:
      catena-network:
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
  catena-network:
    external: true
```

---

[<- Retour au catalogue des applications pré-configurées](/fr/apps/)
