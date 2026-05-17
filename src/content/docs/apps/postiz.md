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
2. Visitez votre domaine Postiz et créez le compte admin.
3. Ajoutez les identifiants d'application de chaque réseau : **Settings** -> choisissez le réseau -> collez le client ID + secret de votre app développeur depuis le portail du réseau. Une fois par réseau.

**À propos de la connexion :** Postiz utilise un email/mot de passe local. Pas d'OIDC natif dans la version communautaire actuelle. Le nombre d'utilisateurs pour cet outil est typiquement de 1 à 3 personnes en marketing, donc l'absence de SSO est moins impactante que pour les outils de chat / helpdesk.

## Variables d'environnement

Ces valeurs se trouvent dans l'onglet **Environment** du compose
Dokploy. Les secrets aléatoires sont générés automatiquement au
premier semi du template -- vous n'avez pas à les générer vous-même.

| Variable | Valeur par défaut |
|---|---|
| `POSTIZ_HOSTNAME` | `social.yourdomain.com` |
| `JWT_SECRET` | _valeur aléatoire auto-générée_ |
| `DB_PASSWORD` | _valeur aléatoire auto-générée_ |

## Domaine

- **Service et port :** `postiz:5000`
- **Nom d'hôte :** `social.yourdomain.com`

Le nom d'hôte est attaché automatiquement au semi du template ;
modifiez-le dans l'onglet **Domains** avant de cliquer Deploy si
vous souhaitez autre chose.

## Fichier compose

Pour référence -- c'est ce que le template déploie. **Ne collez ceci
nulle part.** Le compose est semé dans Dokploy automatiquement ; les
ajustements côté client se font dans les onglets Environment et
Domains (décrits plus haut), jamais dans le compose lui-même.

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
      - "vps.auth.mode=public"
      - "vps.auto-update=patch"
    networks:
      dokploy-network:
        aliases:
          - postiz
      default: {}

  db:
    image: postgres:16.13-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: postiz
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: postiz
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
  dokploy-network:
    external: true
```

---

[<- Retour au catalogue des applications pré-configurées](/apps/)
