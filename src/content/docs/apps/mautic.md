---
title: "Mautic"
description: "Automatisation marketing open-source. Segments de contacts, campagnes courriel, séquences drip, pages de destination, formulaires, scoring de prospects."
---

Automatisation marketing open-source. Segments de contacts, campagnes courriel, séquences drip, pages de destination, formulaires, scoring de prospects. Remplace Mailchimp / ActiveCampaign / HubSpot Marketing.

- **Projet original :** <https://www.mautic.org/>
- **Remplace :** **Mailchimp**, **ActiveCampaign**, **HubSpot Marketing**, **Brevo (Sendinblue)**
- **Connexion (SSO) :** Non disponible -- l'édition communautaire de cette app ne supporte pas OIDC. Les utilisateurs gardent un email/mot de passe par app.

## Étapes de configuration

1. Cliquez **Deploy**. Patientez ~2 min pour le premier démarrage (les migrations de base s'exécutent au premier lancement).
2. Visitez votre domaine Mautic et complétez l'assistant initial :
   - **Base de données** : pré-remplie (hôte `db`, nom `mautic`, utilisateur `mautic`, mot de passe depuis la variable `DB_PASSWORD`).
   - **Utilisateur admin** : créez votre compte admin initial.
   - **Paramètres courriel** : collez les identifiants SMTP de votre relais géré (hôte, port `587`, nom d'utilisateur, mot de passe, adresse expéditeur). Sautez cette étape si vous préférez la configurer plus tard sous **Settings** -> **Configuration** -> **Email Settings**.
3. Vérifiez que les conteneurs cron + worker tournent dans Dokploy (Mautic a besoin de `mautic_cron` pour les campagnes planifiées + `mautic_worker` pour la file d'envoi).
4. Créez votre premier segment : **Segments** -> **New** -> filtrez par attribut de contact.
5. Créez votre première campagne : **Campaigns** -> **New** -> glissez l'action **Send email** sur un déclencheur de segment.

### Authentification

Mautic édition communautaire ne fournit pas d'OIDC natif. Connexion locale par nom d'utilisateur/mot de passe par défaut. SAML2 est supporté en amont mais demande une configuration par déploiement ; des plugins OAuth2 génériques tiers existent. Si un SSO unifié pour la stack est requis, contactez votre opérateur pour ajouter une couche oauth2-proxy en façade (le groupe Keycloak `staff` filtre l'accès au niveau Traefik avant que le trafic n'atteigne Mautic).

### SMTP et réputation d'envoi

Mautic n'envoie PAS directement les courriels. Il remet chaque envoi à votre relais SMTP géré (voir le [guide des fournisseurs courriel](/guides/email-providers/) pour les choix recommandés). Réputation d'envoi, SPF/DKIM/DMARC, et gestion des rebonds vivent au niveau du relais. Configurez SMTP sous **Settings** -> **Configuration** -> **Email Settings** avec les identifiants de votre relais avant la première campagne.

### Contenu d'aimant à prospects et copie des séquences drip

Le template fournit le moteur. La rédaction des PDF d'aimants, des séquences drip et des modèles d'envoi est le travail de votre équipe (ou de votre opérateur, s'il offre des services de contenu marketing). Mautic lui-même ne livre aucune campagne pré-bâtie.

### Ressources

Mautic tourne en Apache + MariaDB + un worker sidecar + un cron sidecar. Prévoyez ~1.5 GB RAM au repos (worker + cron consomment ~300 MB chacun), ~3 GB sous envois de campagne ou reconstruction de segments. Le stockage croît avec les uploads de médias et l'historique des événements courriel ; budgétez ~10 GB après la première année d'usage régulier.

## Variables d'environnement

Ces valeurs se trouvent dans l'onglet **Environment** du compose
Dokploy. Les secrets aléatoires sont générés automatiquement au
premier semi du template -- vous n'avez pas à les générer vous-même.

| Variable | Valeur par défaut |
|---|---|
| `MAUTIC_HOSTNAME` | `marketing.yourdomain.com` |
| `DB_PASSWORD` | _valeur aléatoire auto-générée_ |
| `DB_ROOT_PASSWORD` | _valeur aléatoire auto-générée_ |
| `SMTP_HOST` | _(à définir avant déploiement)_ |
| `SMTP_PORT` | `587` |
| `SMTP_USERNAME` | _(à définir avant déploiement)_ |
| `SMTP_PASSWORD` | _(à définir avant déploiement)_ |
| `SMTP_FROM_ADDRESS` | _(à définir avant déploiement)_ |

## Domaine

- **Service et port :** `mautic_web:80`
- **Nom d'hôte :** `marketing.yourdomain.com`

Le nom d'hôte est attaché automatiquement au semi du template ;
modifiez-le dans l'onglet **Domains** avant de cliquer Deploy si
vous souhaitez autre chose.

## Fichier compose

Pour référence -- c'est ce que le template déploie. **Ne collez ceci
nulle part.** Le compose est semé dans Dokploy automatiquement ; les
ajustements côté client se font dans les onglets Environment et
Domains (décrits plus haut), jamais dans le compose lui-même.

```yaml
# Mautic -- open-source marketing automation (Mailchimp / ActiveCampaign /
# HubSpot Marketing replacement). Three-process layout per upstream
# docker-mautic example:
#
#   - mautic_web    -- the Apache web container the client browser hits
#   - mautic_worker -- Symfony Messenger consumer (emails, hits, failed)
#   - mautic_cron   -- scheduled tasks (campaign triggers, segment
#                      rebuilds, retention pruning)
#
# All three share the same image + named volumes so the docroot, config,
# and logs stay coherent across roles.
#
# Auth: Mautic community edition has no native OIDC. SAML2 is supported
# upstream but requires per-deploy config; third-party OAuth2 plugins
# exist but are not first-party. Marked sso_mode=none for honesty; the
# operator can wire SAML or a generic-OAuth2 plugin per client request.
# Local username/password login is the default; pair with oauth2-proxy
# in front if a single-sign-on layer is required.
#
# Storage:
#   - config-data  -> /var/www/html/config        (local.php, plugin config)
#   - logs-data    -> /var/www/html/var/logs      (Symfony logs)
#   - media-data   -> /var/www/html/docroot/media (uploaded files + images)
#   - db-data      -> /var/lib/mysql              (MariaDB)
# All four volumes ride restic via /var/lib/docker/volumes.
#
# SMTP: Mautic stores SMTP settings in its own DB-backed config after
# the first-run wizard. The SMTP_* env vars below are exposed for the
# operator to paste into Settings -> Configuration -> Email Settings
# post-deploy; Mautic does NOT consume them at boot.

services:
  mautic_web:
    image: mautic/mautic:7.1.1-apache
    restart: unless-stopped
    environment:
      MAUTIC_DB_HOST: db
      MAUTIC_DB_PORT: "3306"
      MAUTIC_DB_DATABASE: mautic
      MAUTIC_DB_USER: mautic
      MAUTIC_DB_PASSWORD: ${DB_PASSWORD}
      DOCKER_MAUTIC_RUN_MIGRATIONS: "true"
      # Doctrine-backed Messenger transport (no RabbitMQ dependency).
      MAUTIC_MESSENGER_DSN_EMAIL: doctrine://default
      MAUTIC_MESSENGER_DSN_HIT: doctrine://default
      PHP_INI_VALUE_MEMORY_LIMIT: 512M
      PHP_INI_VALUE_UPLOAD_MAX_FILESIZE: 64M
      PHP_INI_VALUE_POST_MAX_SIZE: 64M
      # Exposed for operator reference. Mautic persists SMTP settings
      # in its DB-backed config once the admin saves them in the UI.
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT}
      SMTP_USERNAME: ${SMTP_USERNAME}
      SMTP_PASSWORD: ${SMTP_PASSWORD}
      SMTP_FROM_ADDRESS: ${SMTP_FROM_ADDRESS}
    volumes:
      - config-data:/var/www/html/config
      - logs-data:/var/www/html/var/logs
      - media-data:/var/www/html/docroot/media
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "curl -fsS http://localhost/ >/dev/null || exit 1"]
      interval: 15s
      timeout: 5s
      retries: 10
      start_period: 60s
    labels:
      - "vps.auth.mode=public"
      - "vps.auto-update=patch"
    networks:
      dokploy-network:
        aliases:
          - mautic
      default: {}

  mautic_worker:
    image: mautic/mautic:7.1.1-apache
    restart: unless-stopped
    environment:
      DOCKER_MAUTIC_ROLE: mautic_worker
      MAUTIC_DB_HOST: db
      MAUTIC_DB_PORT: "3306"
      MAUTIC_DB_DATABASE: mautic
      MAUTIC_DB_USER: mautic
      MAUTIC_DB_PASSWORD: ${DB_PASSWORD}
      MAUTIC_MESSENGER_DSN_EMAIL: doctrine://default
      MAUTIC_MESSENGER_DSN_HIT: doctrine://default
    volumes:
      - config-data:/var/www/html/config
      - logs-data:/var/www/html/var/logs
      - media-data:/var/www/html/docroot/media
    depends_on:
      mautic_web:
        condition: service_healthy
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  mautic_cron:
    image: mautic/mautic:7.1.1-apache
    restart: unless-stopped
    environment:
      DOCKER_MAUTIC_ROLE: mautic_cron
      MAUTIC_DB_HOST: db
      MAUTIC_DB_PORT: "3306"
      MAUTIC_DB_DATABASE: mautic
      MAUTIC_DB_USER: mautic
      MAUTIC_DB_PASSWORD: ${DB_PASSWORD}
    volumes:
      - config-data:/var/www/html/config
      - logs-data:/var/www/html/var/logs
      - media-data:/var/www/html/docroot/media
    depends_on:
      mautic_web:
        condition: service_healthy
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  db:
    image: mariadb:11.8.6
    restart: unless-stopped
    environment:
      MARIADB_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MARIADB_DATABASE: mautic
      MARIADB_USER: mautic
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
  config-data:
  logs-data:
  media-data:
  db-data:

networks:
  dokploy-network:
    external: true
```

---

[<- Retour au catalogue des applications pré-configurées](/apps/)
