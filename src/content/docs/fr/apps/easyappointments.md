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
2. Visitez le domaine Easy!Appointments et complétez l'assistant initial (compte admin, nom de l'entreprise, heures d'ouverture).
3. Ajoutez les prestataires (membres du personnel avec calendriers réservables), les services (durées + prix), et les clients au besoin.
4. *(Optionnel)* Configurez SMTP sous **Settings** -> **Business Logic** -> **Email** pour envoyer les confirmations et rappels de rendez-vous. Sans SMTP, les clients et le personnel voient les réservations dans l'application, mais aucun courriel n'est envoyé.
5. *(Optionnel)* Intégrez la page de réservation à un site web : copiez l'URL publique depuis **Settings** -> **Booking Settings** et liez-la depuis le site ou une fiche d'établissement.

### Authentification

Easy!Appointments v1.5.2 utilise une connexion locale par courriel/mot de passe pour le personnel. Pas d'OIDC natif dans la version upstream. La page de réservation côté client est publique par conception -- les visiteurs réservent un créneau sans compte, en fournissant seulement leur nom, courriel et téléphone. L'absence de SSO ne touche donc que la connexion du personnel et reste gérable pour les petites équipes (1 à 10 personnes) ciblées par l'application.

Un SSO unifié pour le personnel est disponible sur demande sous forme de proxy oauth2 en façade ; le déploiement par défaut utilise des comptes locaux.

### Rappels courriel + SMS

Les rappels par courriel fonctionnent dès que SMTP est configuré. Les rappels SMS nécessitent un compte Twilio (configuré sous **Settings** -> **Notifications** -> **SMS**). Les SMS sont consentis par le client au moment de la réservation.

### URL de réservation publique

L'URL publique par défaut est `https://book.<votre-domaine>/`. Elle peut être partagée directement avec les clients, intégrée comme bouton sur un site web, ou listée sur une fiche Google Business.

## Variables d'environnement

Ces valeurs sont les champs à remplir au déploiement du template
depuis le panneau **App Templates** du serveur (Portainer). Les
secrets aléatoires sont générés automatiquement au premier semis du
template : aucun n'est à générer à la main.

| Variable | Valeur par défaut |
|---|---|
| `DOMAIN_HOST` | `book.yourdomain.com` |
| `EASYAPPOINTMENTS_HOSTNAME` | `book.yourdomain.com` |
| `DB_PASSWORD` | _valeur aléatoire auto-générée_ |
| `DB_ROOT_PASSWORD` | _valeur aléatoire auto-générée_ |

## Domaine

- **Service et port :** `easyappointments:80`
- **Nom d'hôte :** `book.yourdomain.com`

Le nom d'hôte est attaché automatiquement au déploiement du template.
Un autre nom se convient avant le déploiement, sur demande.

## Fichier compose

Pour référence -- c'est ce que le template déploie. **Ne collez ceci
nulle part.** Le compose est semé dans Portainer automatiquement ; les
ajustements côté client se font dans les champs d'environnement du
formulaire de déploiement (décrits plus haut), jamais dans le compose
lui-même.

```yaml
# Easy!Appointments -- open-source customer-facing booking app. Sole
# shipped scheduler in the Catena catalog as of 2026-05-22; covers
# Branch A (multi-provider) and the solo-provider branch.
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
    deploy:
      restart_policy:
        condition: any
      placement:
        constraints:
          - node.labels.catena.role==data
    environment:
      BASE_URL: https://${EASYAPPOINTMENTS_HOSTNAME}
      DB_HOST: db
      DB_NAME: easyappointments
      DB_USERNAME: easyappointments
      DB_PASSWORD: ${DB_PASSWORD}
      DEBUG_MODE: "FALSE"
    volumes:
      - server-data:/var/www/html/storage
    healthcheck:
      test: ["CMD-SHELL", "curl -fsS http://localhost/ >/dev/null || exit 1"]
      interval: 15s
      timeout: 5s
      retries: 10
      start_period: 30s
    labels:
      - "vps.route.host=${DOMAIN_HOST}"
      - "vps.route.port=80"
      - "vps.route.service=easyappointments"
      - "vps.auth.mode=public"
      - "vps.auto-update=patch"
      - "vps.app=catena-easyappointments"
      - "vps.component=easyappointments"
    networks:
      catena-network:
        aliases:
          - catena-easyappointments
      default: {}

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
      - "vps.app=catena-easyappointments"
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
