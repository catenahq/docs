---
title: "Chatwoot"
description: "Boîte de réception omnicanale orientée conversation. Email, widget de chat, WhatsApp, Facebook, Instagram, Twitter/X en une seule vue."
---

Boîte de réception omnicanale orientée conversation. Email, widget de chat, WhatsApp, Facebook, Instagram, Twitter/X en une seule vue.

- **Projet original :** <https://www.chatwoot.com/>
- **Remplace :** **Intercom**, **Front**, **Help Scout (canaux de chat)**
- **Connexion (SSO) :** Non disponible -- l'édition communautaire de cette app ne supporte pas OIDC. Les utilisateurs gardent un email/mot de passe par app.

## Étapes de configuration

1. Cliquez **Deploy**. Patientez ~2 min le premier démarrage (migrations Rails).
2. Visitez votre domaine Chatwoot. Complétez l'assistant pour créer le premier admin.
3. Ajoutez des canaux : **Settings** -> **Inboxes** -> **Add inbox**. Choisissez le canal (email, widget, WhatsApp, etc.) et suivez les instructions.

**À propos de la connexion :** l'édition communautaire de Chatwoot ne supporte pas OIDC/SSO -- chaque agent garde un email/mot de passe spécifique à l'app. Le SSO SAML/OIDC est enterprise uniquement. Si le SSO est important, envisagez Zammad (compromis : flux orienté ticket au lieu de l'inbox orienté conversation de Chatwoot).

## Variables d'environnement

Ces valeurs sont les champs à remplir au déploiement du template
depuis le panneau **App Templates** de votre serveur (Portainer). Les
secrets aléatoires sont générés automatiquement au premier semi du
template -- vous n'avez pas à les générer vous-même.

| Variable | Valeur par défaut |
|---|---|
| `DOMAIN_HOST` | `support.yourdomain.com` |
| `CHATWOOT_HOSTNAME` | `support.yourdomain.com` |
| `SECRET_KEY_BASE` | _valeur aléatoire auto-générée_ |
| `DB_PASSWORD` | _valeur aléatoire auto-générée_ |

## Domaine

- **Service et port :** `rails:3000`
- **Nom d'hôte :** `support.yourdomain.com`

Le nom d'hôte est attaché automatiquement au déploiement du template ;
parlez-en à votre contact avant de déployer si vous souhaitez autre
chose.

## Fichier compose

Pour référence -- c'est ce que le template déploie. **Ne collez ceci
nulle part.** Le compose est semé dans Portainer automatiquement ; les
ajustements côté client se font dans les champs d'environnement du
formulaire de déploiement (décrits plus haut), jamais dans le compose
lui-même.

```yaml
# Chatwoot -- customer support / omnichannel inbox (email, live chat,
# WhatsApp, Facebook, Instagram, Twitter, ...). Community edition uses
# email/password for agent login; SAML/OIDC SSO is enterprise-only.

services:
  rails:
    image: chatwoot/chatwoot:v4.13.0-ce
    restart: unless-stopped
    entrypoint: docker/entrypoints/rails.sh
    command: ["bundle", "exec", "rails", "s", "-p", "3000", "-b", "0.0.0.0"]
    environment:
      RAILS_ENV: production
      NODE_ENV: production
      SECRET_KEY_BASE: ${SECRET_KEY_BASE}
      FRONTEND_URL: https://${CHATWOOT_HOSTNAME}
      DEFAULT_LOCALE: en
      FORCE_SSL: "true"
      INSTALLATION_NAME: "Chatwoot"
      POSTGRES_HOST: db
      POSTGRES_DATABASE: chatwoot
      POSTGRES_USERNAME: chatwoot
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      REDIS_URL: redis://redis:6379
      RAILS_LOG_TO_STDOUT: "true"
      ACTIVE_STORAGE_SERVICE: local
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - storage-data:/app/storage
    labels:
      - "vps.route.host=${DOMAIN_HOST}"
      - "vps.route.port=3000"
      - "vps.route.service=rails"
      - "vps.auth.mode=public"
      - "vps.auto-update=patch"
    networks:
      catena-network:
        aliases:
          - chatwoot
      default: {}

  sidekiq:
    image: chatwoot/chatwoot:v4.13.0-ce
    restart: unless-stopped
    command: ["bundle", "exec", "sidekiq", "-C", "config/sidekiq.yml"]
    environment:
      RAILS_ENV: production
      NODE_ENV: production
      SECRET_KEY_BASE: ${SECRET_KEY_BASE}
      FRONTEND_URL: https://${CHATWOOT_HOSTNAME}
      POSTGRES_HOST: db
      POSTGRES_DATABASE: chatwoot
      POSTGRES_USERNAME: chatwoot
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      REDIS_URL: redis://redis:6379
      ACTIVE_STORAGE_SERVICE: local
    depends_on:
      - rails
    volumes:
      - storage-data:/app/storage
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  db:
    image: postgres:16.13-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: chatwoot
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: chatwoot
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U chatwoot"]
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
  storage-data:
  db-data:

networks:
  catena-network:
    external: true
```

---

[<- Retour au catalogue des applications pré-configurées](/fr/apps/)
