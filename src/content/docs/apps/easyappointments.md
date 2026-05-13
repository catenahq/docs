---
title: "Easy!Appointments"
description: "Application de réservation côté client pour un ou plusieurs prestataires (clinique, salon, cours, atelier de réparation)."
---

Application de réservation côté client pour un ou plusieurs prestataires (clinique, salon, cours, atelier de réparation). Page de réservation publique ; calendriers du personnel ; rappels courriel + SMS ; export ICS.

- **Projet original :** <https://easyappointments.org/>
- **Remplace :** **Calendly**, **Acuity**, **SimplyBook**, **Setmore**
- **Connexion (SSO) :** Non disponible -- l'édition communautaire de cette app ne supporte pas OIDC. Les utilisateurs gardent un email/mot de passe par app.

## Étapes de configuration

1. Cliquez **Deploy**. Patientez ~1 min pour le premier démarrage (la base de données s'initialise au premier lancement).
2. Visitez votre domaine Easy!Appointments et complétez l'assistant initial (compte admin, nom de l'entreprise, heures d'ouverture).
3. Ajoutez les prestataires (membres du personnel avec calendriers réservables), les services (durées + prix), et les clients au besoin.
4. *(Optionnel)* Configurez SMTP sous **Settings** -> **Business Logic** -> **Email** pour envoyer les confirmations et rappels de rendez-vous. Sans SMTP, les clients et le personnel voient les réservations dans l'application, mais aucun courriel n'est envoyé.
5. *(Optionnel)* Intégrez la page de réservation à votre site web : copiez l'URL publique depuis **Settings** -> **Booking Settings** et liez-la depuis votre site ou vos fiches d'établissement.

### Authentification

Easy!Appointments v1.5.2 utilise une connexion locale par courriel/mot de passe pour le personnel. Pas d'OIDC natif dans la version upstream. La page de réservation côté client est publique par conception -- les visiteurs réservent un créneau sans compte, en fournissant seulement leur nom, courriel et téléphone. L'absence de SSO ne touche donc que la connexion du personnel et reste gérable pour les petites équipes (1 à 10 personnes) ciblées par l'application.

Si un SSO unifié pour le personnel est requis, contactez votre opérateur pour discuter d'un proxy oauth2 en façade ; le déploiement par défaut utilise des comptes locaux.

### Rappels courriel + SMS

Les rappels par courriel fonctionnent dès que SMTP est configuré. Les rappels SMS nécessitent un compte Twilio (configuré sous **Settings** -> **Notifications** -> **SMS**). Les SMS sont consentis par le client au moment de la réservation.

### URL de réservation publique

L'URL publique par défaut est `https://book.<votre-domaine>/`. Partagez-la directement avec vos clients, intégrez-la comme bouton sur votre site web, ou listez-la sur votre fiche Google Business.

## Variables d'environnement

Ces valeurs se trouvent dans l'onglet **Environment** du compose
Dokploy. Les secrets aléatoires sont générés automatiquement au
premier semi du template -- vous n'avez pas à les générer vous-même.

| Variable | Valeur par défaut |
|---|---|
| `EASYAPPOINTMENTS_HOSTNAME` | `book.yourdomain.com` |
| `DB_PASSWORD` | _valeur aléatoire auto-générée_ |
| `DB_ROOT_PASSWORD` | _valeur aléatoire auto-générée_ |

## Domaine

- **Service et port :** `easyappointments:80`
- **Nom d'hôte :** `book.yourdomain.com`

Le nom d'hôte est attaché automatiquement au semi du template ;
modifiez-le dans l'onglet **Domains** avant de cliquer Deploy si
vous souhaitez autre chose.

## Fichier compose

Pour référence -- c'est ce que le template déploie. **Ne collez ceci
nulle part.** Le compose est semé dans Dokploy automatiquement ; les
ajustements côté client se font dans les onglets Environment et
Domains (décrits plus haut), jamais dans le compose lui-même.

```yaml
# Easy!Appointments -- open-source customer-facing booking app. F11 v1
# pick for Branch A multi-provider (clinic / salon / repair shop) as of
# 2026-05-06. cal.diy covers Branch A single-provider with native Stripe
# paid bookings; pick on a per-client basis at deploy time.
#
# Auth: Easy!Appointments v1.5.2 has no native OIDC. Login is local
# email/password (or optional Google OAuth at the EA level). The booking
# page itself is public-by-design (customers book without an account),
# so the SSO gap only affects staff/provider sign-in. Marked
# sso_mode=none in the catalog for honesty; revisit once upstream
# adds OIDC support.
#
# Storage: server-data volume holds EA's storage/ dir (uploaded
# avatars + generated ICS files + cache). db-data holds MariaDB.
# Both restic-backed via /var/lib/docker/volumes.

services:
  easyappointments:
    image: alextselegidis/easyappointments:1.5.2
    restart: unless-stopped
    environment:
      BASE_URL: https://${EASYAPPOINTMENTS_HOSTNAME}
      DB_HOST: db
      DB_NAME: easyappointments
      DB_USERNAME: easyappointments
      DB_PASSWORD: ${DB_PASSWORD}
      DEBUG_MODE: "FALSE"
    volumes:
      - server-data:/var/www/html/storage
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "curl -fsS http://localhost/ >/dev/null || exit 1"]
      interval: 15s
      timeout: 5s
      retries: 10
      start_period: 30s
    labels:
      - "vps.auth.mode=public"
      - "vps.auto-update=patch"
    networks:
      dokploy-network:
        aliases:
          - easyappointments
      default: {}

  db:
    image: mariadb:11.8.6
    restart: unless-stopped
    environment:
      MARIADB_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MARIADB_DATABASE: easyappointments
      MARIADB_USER: easyappointments
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
  dokploy-network:
    external: true
```

---

[<- Retour au catalogue des applications pré-configurées](/docs/apps/)
