---
title: "Invoice Ninja"
description: "Facturation open-source avec passerelles de paiement Stripe + PayPal, facturation récurrente, suivi des dépenses, portail client pour paiement en ligne."
---

Facturation open-source avec passerelles de paiement Stripe + PayPal, facturation récurrente, suivi des dépenses, portail client pour paiement en ligne. L'auto-hébergement débloque toutes les fonctionnalités Pro + Enterprise.

- **Projet original :** <https://www.invoiceninja.com/>
- **Remplace :** **FreshBooks**, **QuickBooks (module facturation)**, **Zoho Invoice**, **Harvest (facturation)**
- **Connexion (SSO) :** À activer via l'interface admin -- collez les valeurs `OIDC_*` depuis l'onglet Environment une fois.

## Étapes de configuration

1. Cliquez **Deploy**. Patientez ~2 min pour le premier démarrage (migrations Laravel + création de l'admin par `init.sh`).
2. **Une seule fois : générez APP_KEY**. Depuis un terminal sur votre VPS :
   ```
   docker exec $(docker ps --filter name=invoiceninja-app --format '{{.Names}}' | head -1) \
     runuser -u www-data -- php artisan key:generate --show --no-interaction
   ```
   Copiez la sortie `base64:...`. Dans Dokploy : **Environment** -> réglez `INVOICENINJA_APP_KEY` à la valeur copiée. Cliquez **Redeploy**.
3. Visitez votre domaine Invoice Ninja. Connectez-vous avec `INVOICENINJA_ADMIN_EMAIL` / `INVOICENINJA_ADMIN_PASSWORD` de l'onglet Environment.
4. Configurez votre **profil d'entreprise** (Settings -> Company Details) : logo, adresse, identifiants fiscaux (TPS/TVQ au Canada), devise par défaut.
5. Connectez **Stripe** : Settings -> Online Payments -> Add Gateway -> Stripe. Collez vos clés publishable + secret. Le portail client accepte les paiements par carte après cela.
6. *(Optionnel)* Configurez SMTP : collez `INVOICENINJA_SMTP_*` dans l'onglet Environment, cliquez Redeploy. L'envoi de courriel reste en file d'attente silencieusement tant que SMTP n'est pas câblé.

### Facturation dans la suite Catena

Invoice Ninja est le maître de la facturation dans la suite Catena. Les heures depuis Kimai (maître du suivi du temps) alimentent les factures Invoice Ninja via la synchronisation mensuelle de votre contact, et les factures payées depuis Invoice Ninja alimentent ERPNext (maître de la comptabilité) via l'action de fin de mois de votre contact. Les clients dans Invoice Ninja portent un champ personnalisé `espo_account_id` afin que chaque facture soit liée au compte EspoCRM correspondant.

### Licence

L'édition auto-hébergée d'Invoice Ninja est sous Elastic License 2.0. Deux implications pratiques :
- Héberger Invoice Ninja pour votre entreprise sur votre VPS, et votre contact qui l'héberge pour vous et facture pour le service d'hébergement, sont explicitement autorisés par la licence.
- Revendre Invoice Ninja comme SaaS, ou l'intégrer comme partie d'un autre SaaS, requiert une licence commerciale d'Invoice Ninja LLC. Le modèle Catena est "nous déployons sur votre VPS ; vous possédez le déploiement" -- c'est la voie d'hébergement autorisée.
- L'édition gratuite affiche un bandeau "Powered by Invoice Ninja" sur les surfaces client. Une licence white-label à 40 USD/an le retire. Recommandé dès que vous facturez de vrais clients.

### Authentification

OIDC natif en auto-hébergement est une demande ouverte côté upstream. En attendant, Invoice Ninja utilise un identifiant local. Le groupe Keycloak `staff` filtre l'accès au bord Traefik via oauth2-proxy avant que le trafic n'atteigne Invoice Ninja, donc les personnes hors de votre équipe ne peuvent pas atteindre la page de connexion.

### Traitement des paiements

Invoice Ninja gère le côté paiement client. Quand un client paie via le portail, Stripe traite la carte et Invoice Ninja marque la facture payée + enregistre le paiement. Le montant est versé sur votre compte Stripe (à votre nom, votre identifiant fiscal) ; Catena ne fait transiter aucun paiement par un compte appartenant au contact.

### Ressources

Invoice Ninja tourne en PHP-FPM + nginx + MariaDB + Redis -- quatre conteneurs. Prévoyez ~400 Mo de RAM au repos, ~800 Mo en génération de factures en masse ou rattrapage de file. Le rendu PDF utilise Chromium intégré et a des pointes brèves lors d'exports multi-pages.

## Variables d'environnement

Ces valeurs se trouvent dans l'onglet **Environment** du compose
Dokploy. Les secrets aléatoires sont générés automatiquement au
premier semi du template -- vous n'avez pas à les générer vous-même.

| Variable | Valeur par défaut |
|---|---|
| `INVOICENINJA_HOSTNAME` | `invoice.yourdomain.com` |
| `INVOICENINJA_APP_KEY` | _(à définir avant déploiement)_ |
| `INVOICENINJA_ADMIN_EMAIL` | `admin@yourdomain.com` |
| `INVOICENINJA_ADMIN_PASSWORD` | _valeur aléatoire auto-générée_ |
| `DB_PASSWORD` | _valeur aléatoire auto-générée_ |
| `DB_ROOT_PASSWORD` | _valeur aléatoire auto-générée_ |
| `INVOICENINJA_SMTP_HOST` | _(à définir avant déploiement)_ |
| `INVOICENINJA_SMTP_PORT` | `587` |
| `INVOICENINJA_SMTP_USERNAME` | _(à définir avant déploiement)_ |
| `INVOICENINJA_SMTP_PASSWORD` | _(à définir avant déploiement)_ |
| `INVOICENINJA_MAIL_FROM` | `invoice@yourdomain.com` |
| `INVOICENINJA_MAIL_FROM_NAME` | `Invoicing` |

## Domaine

- **Service et port :** `nginx:80`
- **Nom d'hôte :** `invoice.yourdomain.com`

Le nom d'hôte est attaché automatiquement au semi du template ;
modifiez-le dans l'onglet **Domains** avant de cliquer Deploy si
vous souhaitez autre chose.

## Fichier compose

Pour référence -- c'est ce que le template déploie. **Ne collez ceci
nulle part.** Le compose est semé dans Dokploy automatiquement ; les
ajustements côté client se font dans les onglets Environment et
Domains (décrits plus haut), jamais dans le compose lui-même.

```yaml
# Invoice Ninja -- invoicing + Stripe payments + recurring billing +
# client portal. Picked 2026-05-21 as the invoicing master in the
# Path E composition (EspoCRM -> Kimai -> Invoice Ninja -> ERPNext).
# License: Elastic License 2.0; hosting on third-party infrastructure
# and billing clients for the service is explicitly permitted. Chosen
# over Akaunting (BSL revenue cap) and Crater (stale).
#
# Topology (mirrors upstream github.com/invoiceninja/dockerfiles/debian
# adapted to Catena's MariaDB + 4-service convention):
#   nginx (front door, exposes :80)
#     -> app (php-fpm via fastcgi, supervisord runs queue + scheduler)
#     -> db (mariadb 11.8) + redis (cache + session + queue backend)
#
# Auth: native OIDC for self-hosted is an open feature request
# (github.com/invoiceninja/invoiceninja/issues/10839). Until upstream
# ships it, sso_mode=post-deploy-ui means the operator uses local
# Invoice Ninja credentials; oauth2-proxy at the Traefik edge gates
# access via the Keycloak staff group, so people outside the
# group never reach the Invoice Ninja login page.
#
# Storage layout:
#   app_public  -- /var/www/html/public, served read-only by nginx
#   app_storage -- /var/www/html/storage, Laravel's writable area
#                  (PDF cache, logs, queued attachments)
#   db-data     -- /var/lib/mysql (Catena's standard MariaDB volume name)
#   redis-data  -- /data (Redis AOF/RDB persistence)
#
# APP_KEY: Laravel boots with Application Error 500 if APP_KEY is empty
# or not formatted as base64:<44-char-base64-string>. The Dokploy
# ${password:N} helper produces alphanumeric chars (not base64), so we
# cannot pre-generate APP_KEY in env_defaults. Operator generates it
# once post-deploy via `docker exec` + `php artisan key:generate --show`,
# pastes the base64:... output into the Environment tab, and redeploys.
# See setup_steps in catalog.yml.

services:
  app:
    image: invoiceninja/invoiceninja-debian:5
    restart: unless-stopped
    environment:
      APP_ENV: production
      APP_DEBUG: "false"
      APP_KEY: ${INVOICENINJA_APP_KEY}
      APP_URL: https://${INVOICENINJA_HOSTNAME}
      REQUIRE_HTTPS: "true"
      TRUSTED_PROXIES: "*"
      DB_CONNECTION: mysql
      DB_HOST: db
      DB_PORT: "3306"
      DB_DATABASE: invoiceninja
      DB_USERNAME: invoiceninja
      DB_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: redis
      REDIS_PORT: "6379"
      QUEUE_CONNECTION: redis
      CACHE_DRIVER: redis
      SESSION_DRIVER: redis
      # First-run bootstrap: init.sh's ninja:create-account step
      # consumes these to create the initial admin user. After first
      # boot the values are no-ops; the operator can rotate the admin
      # password from the in-app Settings -> Account Management page.
      IN_USER_EMAIL: ${INVOICENINJA_ADMIN_EMAIL}
      IN_PASSWORD: ${INVOICENINJA_ADMIN_PASSWORD}
      # SMTP. Operator pastes managed-relay creds here.
      MAIL_MAILER: smtp
      MAIL_HOST: ${INVOICENINJA_SMTP_HOST}
      MAIL_PORT: ${INVOICENINJA_SMTP_PORT}
      MAIL_USERNAME: ${INVOICENINJA_SMTP_USERNAME}
      MAIL_PASSWORD: ${INVOICENINJA_SMTP_PASSWORD}
      MAIL_ENCRYPTION: tls
      MAIL_FROM_ADDRESS: ${INVOICENINJA_MAIL_FROM}
      MAIL_FROM_NAME: ${INVOICENINJA_MAIL_FROM_NAME}
    volumes:
      - app_public:/var/www/html/public
      - app_storage:/var/www/html/storage
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  nginx:
    image: nginx:1.29.8-alpine
    restart: unless-stopped
    volumes:
      - app_public:/var/www/html/public:ro
      - app_storage:/var/www/html/storage:ro
    configs:
      - source: invoiceninja_nginx_conf
        target: /etc/nginx/conf.d/default.conf
    depends_on:
      app:
        condition: service_started
    healthcheck:
      test: ["CMD-SHELL", "wget --quiet --tries=1 --spider http://localhost/ || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5
    labels:
      - "vps.auth.mode=public"
      - "vps.auth.groups=staff"
      - "vps.auto-update=patch"
    networks:
      dokploy-network:
        aliases:
          - invoiceninja
      default: {}

  db:
    image: mariadb:11.8.6
    restart: unless-stopped
    environment:
      MARIADB_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MARIADB_DATABASE: invoiceninja
      MARIADB_USER: invoiceninja
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

  redis:
    image: redis:7.4.9-alpine
    restart: unless-stopped
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

volumes:
  app_public:
  app_storage:
  db-data:
  redis-data:

configs:
  invoiceninja_nginx_conf:
    file: ./invoiceninja-nginx.conf

networks:
  dokploy-network:
    external: true
```

---

[<- Retour au catalogue des applications pré-configurées](/apps/)
