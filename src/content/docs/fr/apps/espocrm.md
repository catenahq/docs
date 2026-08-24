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
2. Visitez le domaine EspoCRM. Connexion avec `ESPOCRM_ADMIN_USERNAME` / `ESPOCRM_ADMIN_PASSWORD` de l'onglet Environment.
3. *(Optionnel)* Activez Keycloak SSO : **Administration** -> **Authentication** -> réglez **Method** sur **OIDC** -> collez :
   - **Client ID :** `OIDC_CLIENT_ID` depuis Environment (`espocrm`)
   - **Client Secret :** `OIDC_CLIENT_SECRET` depuis Environment (généré côté Keycloak sur demande lorsqu'il est vide)
   - **Authorization Endpoint :** `<OIDC_ISSUER_URL>/protocol/openid-connect/auth`
   - **Token Endpoint :** `<OIDC_ISSUER_URL>/protocol/openid-connect/token`
   - **JSON Web Key Set Endpoint :** `<OIDC_ISSUER_URL>/protocol/openid-connect/certs`
   - **Username Claim :** `preferred_username`
   - Validez. La page de connexion affiche **Sign in with Keycloak**. La connexion admin locale continue de fonctionner comme issue de secours.

### Pourquoi EspoCRM est le CRM par défaut

C'est le seul CRM entièrement open-source du catalogue avec OIDC natif en édition communautaire (sans palier Pro), des apps mobiles existantes et un historique stable de mises à jour. Twenty est l'alternative pour une UI moderne façon Notion ; les deux restent au catalogue pour laisser le choix ouvert.

### Ressources

EspoCRM tourne en PHP-Apache + MariaDB + un cron sidecar. Prévoyez ~1 GB RAM au repos, ~2 GB sous import en masse ou envoi mass-email.

## Variables d'environnement

Ces valeurs sont les champs à remplir au déploiement du template
depuis le panneau **App Templates** du serveur (Portainer). Les
secrets aléatoires sont générés automatiquement au premier semis du
template : aucun n'est à générer à la main.

| Variable | Valeur par défaut |
|---|---|
| `DOMAIN_HOST` | `crm.yourdomain.com` |
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

Le nom d'hôte est attaché automatiquement au déploiement du template.
Un autre nom se convient avant le déploiement, sur demande.

## Fichier compose

Pour référence -- c'est ce que le template déploie. **Ne collez ceci
nulle part.** Le compose est semé dans Portainer automatiquement ; les
ajustements côté client se font dans les champs d'environnement du
formulaire de déploiement (décrits plus haut), jamais dans le compose
lui-même.

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
    deploy:
      restart_policy:
        condition: any
      placement:
        constraints:
          - node.labels.catena.role==data
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
    labels:
      - "vps.route.host=${DOMAIN_HOST}"
      - "vps.route.port=80"
      - "vps.route.service=espocrm"
      - "vps.auth.mode=public"
      - "vps.auth.oidc=true"
      - "vps.auth.groups=staff"
      - "vps.auth.oidc.redirect_uris=https://${ESPOCRM_HOSTNAME}/oauth-callback.php"
      - "vps.auth.oidc.scopes=openid email profile"
      - "vps.auto-update=patch"
      - "vps.app=catena-espocrm"
      - "vps.component=espocrm"
    networks:
      catena-network:
        aliases:
          - catena-espocrm
      default: {}

  cron:
    image: espocrm/espocrm:9.3.6
    deploy:
      restart_policy:
        condition: any
      placement:
        constraints:
          - node.labels.catena.role==data
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
    labels:
      - "vps.auto-update=patch"
      - "vps.app=catena-espocrm"
      - "vps.component=cron"
    networks:
      - default

  db:
    image: mariadb:11.8.6
    deploy:
      restart_policy:
        condition: any
      placement:
        constraints:
          - node.labels.catena.role==data
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
      - "vps.app=catena-espocrm"
      - "vps.component=db"
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
