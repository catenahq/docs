---
title: "Kimai"
description: "Suivi du temps open-source. Clients, projets, activités, feuilles de temps, équipes multi-utilisateur, facturation à partir du temps suivi."
---

Suivi du temps open-source. Clients, projets, activités, feuilles de temps, équipes multi-utilisateur, facturation à partir du temps suivi. SAML fédère avec Keycloak via l'UI admin post-déploiement.

- **Projet original :** <https://www.kimai.org/>
- **Remplace :** **Toggl**, **Clockify**, **Harvest**, **TimeCamp**
- **Connexion (SSO) :** À activer via l'interface admin -- collez les valeurs `OIDC_*` depuis l'onglet Environment une fois.

## Étapes de configuration

1. Cliquez **Deploy**. Patientez ~1 min pour le premier démarrage (les migrations de base s'exécutent au premier lancement).
2. Visitez votre domaine Kimai. Connectez-vous avec `KIMAI_ADMIN_EMAIL` / `KIMAI_ADMIN_PASSWORD` de l'onglet Environment.
3. *(Optionnel)* Activez Keycloak SAML SSO : **System** -> **Settings** -> **SAML** -> activez et collez :
   - **Identity Provider Entity ID :** `<OIDC_ISSUER_URL>/protocol/saml/descriptor` (votre contact peut générer un client SAML dans Keycloak)
   - **URL de connexion unique :** `<OIDC_ISSUER_URL>/protocol/saml`
   - **Certificat X.509 :** tiré des métadonnées du realm Keycloak
   - **Attribut nom d'utilisateur :** `username` (ou `email`)
   - Validez. La connexion admin locale continue de fonctionner comme issue de secours.
4. Configurez votre modèle de facture par défaut sous **Invoices** -> **Templates** -> choisissez-en un (DOCX / HTML / PDF). Réglez le logo, l'adresse et les taux de taxe sous **System** -> **Configuration**.

### Suivi du temps dans la suite Catena

Kimai est le maître du suivi du temps dans la suite Catena. Les heures saisies ici alimentent votre application de facturation (Invoice Ninja) via la synchronisation mensuelle de votre contact (demandez-lui de l'automatiser si vous le souhaitez). Les fiches clients dans Kimai portent un champ personnalisé `espo_account_id` afin que chaque feuille de temps soit liée au compte EspoCRM correspondant.

### Facturation intégrée

Kimai peut générer des factures PDF directement depuis le temps suivi. Utilisez cette voie si votre flux de facturation est "envoyer un PDF, le client paie par virement Interac ou bancaire". Si vous avez besoin de paiements en ligne via Stripe, d'un portail client ou de facturation récurrente, demandez à votre contact de déployer Invoice Ninja et la suite acheminera les factures à travers lui.

### Authentification

Tant que SAML n'est pas câblé (étape 3 ci-dessus), Kimai utilise un identifiant local. Même après SAML, la connexion admin locale continue de fonctionner comme issue de secours. Le groupe Keycloak `staff` filtre l'accès au bord Traefik via oauth2-proxy avant que le trafic n'atteigne Kimai, donc les personnes hors de votre équipe ne peuvent pas atteindre la page de connexion.

### Ressources

Kimai tourne en PHP-Apache + MariaDB. Prévoyez ~250 Mo de RAM au repos, ~500 Mo lors d'exports en masse ou de rendu de factures en fin de mois chargée.

## Variables d'environnement

Ces valeurs se trouvent dans l'onglet **Environment** du compose
Dokploy. Les secrets aléatoires sont générés automatiquement au
premier semi du template -- vous n'avez pas à les générer vous-même.

| Variable | Valeur par défaut |
|---|---|
| `KIMAI_HOSTNAME` | `time.yourdomain.com` |
| `KIMAI_ADMIN_EMAIL` | `admin@yourdomain.com` |
| `KIMAI_ADMIN_PASSWORD` | _valeur aléatoire auto-générée_ |
| `KIMAI_APP_SECRET` | _valeur aléatoire auto-générée_ |
| `DB_PASSWORD` | _valeur aléatoire auto-générée_ |
| `DB_ROOT_PASSWORD` | _valeur aléatoire auto-générée_ |
| `KIMAI_MAIL_FROM` | `time@yourdomain.com` |
| `KIMAI_MAIL_URL` | `null://localhost` |

## Domaine

- **Service et port :** `kimai:8001`
- **Nom d'hôte :** `time.yourdomain.com`

Le nom d'hôte est attaché automatiquement au semi du template ;
modifiez-le dans l'onglet **Domains** avant de cliquer Deploy si
vous souhaitez autre chose.

## Fichier compose

Pour référence -- c'est ce que le template déploie. **Ne collez ceci
nulle part.** Le compose est semé dans Dokploy automatiquement ; les
ajustements côté client se font dans les onglets Environment et
Domains (décrits plus haut), jamais dans le compose lui-même.

```yaml
# Kimai -- open-source time tracker. Picked 2026-05-21 as the time-
# tracking master in the Path E composition (Kimai -> Invoice Ninja
# -> ERPNext, anchored on EspoCRM as customer master).
#
# Auth: Kimai 2.x supports SAML in self-hosted (LDAP + database too).
# Marked sso_mode=post-deploy-ui in the catalog -- the operator wires
# Keycloak SAML federation from the Kimai admin UI after first deploy.
# Until SAML is wired, oauth2-proxy at the Traefik edge gates access
# via the Keycloak `staff` group; local Kimai auth still works
# as a break-glass.
#
# Storage: kimai-data volume holds /opt/kimai/var (Symfony var/ dir
# including user uploads, exports, generated invoice PDFs, and
# cache). db-data holds MariaDB. Both are picked up by restic via
# /var/lib/docker/volumes.
#
# Image: kimai/kimai2:stable (the `:apache` tag is deprecated upstream
# in favour of `:stable`; see https://www.kimai.org/documentation/docker.html).

services:
  kimai:
    image: kimai/kimai2:stable
    restart: unless-stopped
    environment:
      DATABASE_URL: "mysql://kimai:${DB_PASSWORD}@db:3306/kimai?charset=utf8mb4&serverVersion=11.8.6-MariaDB"
      APP_SECRET: ${KIMAI_APP_SECRET}
      ADMINMAIL: ${KIMAI_ADMIN_EMAIL}
      ADMINPASS: ${KIMAI_ADMIN_PASSWORD}
      TRUSTED_PROXIES: "0.0.0.0/0"
      TRUSTED_HOSTS: "localhost,${KIMAI_HOSTNAME}"
      MAILER_FROM: ${KIMAI_MAIL_FROM}
      MAILER_URL: ${KIMAI_MAIL_URL}
      memory_limit: "512M"
    volumes:
      - kimai-data:/opt/kimai/var
    depends_on:
      db:
        condition: service_healthy
    labels:
      - "vps.auth.mode=public"
      - "vps.auth.groups=staff"
      - "vps.auto-update=patch"
    networks:
      catena-network:
        aliases:
          - kimai
      default: {}

  db:
    image: mariadb:11.8.6
    restart: unless-stopped
    environment:
      MARIADB_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MARIADB_DATABASE: kimai
      MARIADB_USER: kimai
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
  kimai-data:
  db-data:

networks:
  catena-network:
    external: true
```

---

[<- Retour au catalogue des applications pré-configurées](/fr/apps/)
