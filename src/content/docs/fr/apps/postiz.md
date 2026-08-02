---
title: "Postiz"
description: "Planifier et publier des posts sociaux sur Twitter/X, LinkedIn, Facebook, Instagram, YouTube, TikTok, et d'autres."
---

Planifier et publier des posts sociaux sur Twitter/X, LinkedIn, Facebook, Instagram, YouTube, TikTok, et d'autres.

- **Projet original :** <https://postiz.com/>
- **Remplace :** **Buffer**, **Hootsuite**, **Later**
- **Connexion (SSO) :** Non disponible -- l'édition communautaire de cette app ne supporte pas OIDC. Les utilisateurs gardent un email/mot de passe par app.

## Étapes de configuration

1. Cliquez **Deploy**. Patientez ~1 min.
2. Visitez le domaine Postiz et créez le compte admin.
3. Ajoutez les identifiants d'application de chaque réseau : **Settings** -> choisissez le réseau -> collez le client ID + secret de l'app développeur depuis le portail du réseau. Une fois par réseau.

**À propos de la connexion :** Postiz utilise un email/mot de passe local. Pas d'OIDC natif dans la version communautaire actuelle. Le nombre d'utilisateurs pour cet outil est typiquement de 1 à 3 personnes en marketing, donc l'absence de SSO est moins impactante que pour les outils de chat / helpdesk.

## Variables d'environnement

Ces valeurs sont les champs à remplir au déploiement du template
depuis le panneau **App Templates** du serveur (Portainer). Les
secrets aléatoires sont générés automatiquement au premier semis du
template : aucun n'est à générer à la main.

| Variable | Valeur par défaut |
|---|---|
| `DOMAIN_HOST` | `social.yourdomain.com` |
| `POSTIZ_HOSTNAME` | `social.yourdomain.com` |
| `JWT_SECRET` | _valeur aléatoire auto-générée_ |
| `DB_PASSWORD` | _valeur aléatoire auto-générée_ |

## Domaine

- **Service et port :** `postiz:5000`
- **Nom d'hôte :** `social.yourdomain.com`

Le nom d'hôte est attaché automatiquement au déploiement du template.
Un autre nom se convient avant le déploiement, sur demande.

## Fichier compose

Pour référence -- c'est ce que le template déploie. **Ne collez ceci
nulle part.** Le compose est semé dans Portainer automatiquement ; les
ajustements côté client se font dans les champs d'environnement du
formulaire de déploiement (décrits plus haut), jamais dans le compose
lui-même.

```yaml
# Postiz -- social media scheduling / posting across networks (Twitter/X,
# LinkedIn, Facebook, Instagram, YouTube, TikTok, ...). Login is local
# (email/password) + optional social OAuth buttons configured per-
# network. No native OIDC in the current community release.

services:
  postiz:
    image: ghcr.io/gitroomhq/postiz-app:v2.21.7
    restart: unless-stopped
    environment:
      NOT_SECURED: "false"
      IS_GENERAL: "true"
      STORAGE_PROVIDER: local
      UPLOAD_DIRECTORY: /uploads
      NEXT_PUBLIC_UPLOAD_DIRECTORY: /uploads
      MAIN_URL: https://${POSTIZ_HOSTNAME}
      FRONTEND_URL: https://${POSTIZ_HOSTNAME}
      NEXT_PUBLIC_BACKEND_URL: https://${POSTIZ_HOSTNAME}/api
      BACKEND_INTERNAL_URL: http://localhost:3000
      DATABASE_URL: postgres://postiz:${DB_PASSWORD}@db:5432/postiz
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      DISABLE_REGISTRATION: "false"
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - postiz-uploads:/uploads
      - postiz-config:/config
    labels:
      - "vps.route.host=${DOMAIN_HOST}"
      - "vps.route.port=5000"
      - "vps.route.service=postiz"
      - "vps.auth.mode=public"
      - "vps.auto-update=patch"
    networks:
      catena-network:
        aliases:
          - postiz
      default: {}

  db:
    image: postgres:18.4-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: postiz
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: postiz
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postiz"]
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
  postiz-uploads:
  postiz-config:
  db-data:

networks:
  catena-network:
    external: true
```

---

[<- Retour au catalogue des applications pré-configurées](/fr/apps/)
