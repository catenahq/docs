---
title: "n8n"
description: "Automatisation de flux de travail -- enchaînez visuellement des centaines d'intégrations (APIs, apps, bases de données) en workflows no-code/low-code."
---

Automatisation de flux de travail -- enchaînez visuellement des centaines d'intégrations (APIs, apps, bases de données) en workflows no-code/low-code.

- **Projet original :** <https://n8n.io/>
- **Remplace :** **Zapier**, **Make (Integromat)**, **Tray.io**
- **Connexion (SSO) :** Non disponible -- l'édition communautaire de cette app ne supporte pas OIDC. Les utilisateurs gardent un email/mot de passe par app.

## Étapes de configuration

1. Cliquez **Deploy**. Patientez ~1 min le temps que Postgres + n8n s'initialisent.
2. Visitez votre domaine n8n et créez le compte propriétaire via l'assistant.
3. Invitez d'autres utilisateurs : **Settings** -> **Users** -> **Invite**. Chaque utilisateur reçoit une invitation par courriel.
4. Créez des workflows : **Workflows** -> **+ Add Workflow**. Parcourez la bibliothèque d'intégrations pour les nœuds prêts à l'emploi.

**À propos de la connexion.** L'édition communautaire de n8n utilise email/mot de passe avec des invitations. OIDC et SAML sont enterprise, donc le SSO n'est pas disponible ici -- chaque utilisateur garde une connexion spécifique. Convient à une équipe d'automatisation de 1-5 personnes.

## Variables d'environnement

Ces valeurs se trouvent dans l'onglet **Environment** du compose
Dokploy. Les secrets aléatoires sont générés automatiquement au
premier semi du template -- vous n'avez pas à les générer vous-même.

| Variable | Valeur par défaut |
|---|---|
| `N8N_HOSTNAME` | `automate.yourdomain.com` |
| `N8N_TIMEZONE` | `UTC` |
| `N8N_ENCRYPTION_KEY` | _valeur aléatoire auto-générée_ |
| `N8N_JWT_SECRET` | _valeur aléatoire auto-générée_ |
| `DB_PASSWORD` | _valeur aléatoire auto-générée_ |

## Domaine

- **Service et port :** `n8n:5678`
- **Nom d'hôte :** `automate.yourdomain.com`

Le nom d'hôte est attaché automatiquement au semi du template ;
modifiez-le dans l'onglet **Domains** avant de cliquer Deploy si
vous souhaitez autre chose.

## Fichier compose

Pour référence -- c'est ce que le template déploie. **Ne collez ceci
nulle part.** Le compose est semé dans Dokploy automatiquement ; les
ajustements côté client se font dans les onglets Environment et
Domains (décrits plus haut), jamais dans le compose lui-même.

```yaml
# n8n -- workflow automation (Zapier / Make alternative). Community
# edition uses local email/password user management. OIDC/SAML are
# enterprise-only, so per-user app-local logins here.

services:
  n8n:
    image: n8nio/n8n:2.19.5
    restart: unless-stopped
    environment:
      N8N_HOST: ${N8N_HOSTNAME}
      WEBHOOK_URL: https://${N8N_HOSTNAME}/
      N8N_EDITOR_BASE_URL: https://${N8N_HOSTNAME}/
      N8N_PROTOCOL: https
      N8N_PORT: "5678"
      N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY}
      N8N_USER_MANAGEMENT_JWT_SECRET: ${N8N_JWT_SECRET}
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: db
      DB_POSTGRESDB_PORT: "5432"
      DB_POSTGRESDB_DATABASE: n8n
      DB_POSTGRESDB_USER: n8n
      DB_POSTGRESDB_PASSWORD: ${DB_PASSWORD}
      GENERIC_TIMEZONE: ${N8N_TIMEZONE}
      N8N_DIAGNOSTICS_ENABLED: "false"
      N8N_HIRING_BANNER_ENABLED: "false"
      N8N_RUNNERS_ENABLED: "true"
    volumes:
      - n8n-data:/home/node/.n8n
    depends_on:
      db:
        condition: service_healthy
    labels:
      - "vps.auth.mode=public"
      - "vps.auto-update=patch"
    networks:
      dokploy-network:
        aliases:
          - n8n
      default: {}

  db:
    image: postgres:16.13-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: n8n
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U n8n"]
      interval: 10s
      timeout: 5s
      retries: 5
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

volumes:
  n8n-data:
  db-data:

networks:
  dokploy-network:
    external: true
```

---

[<- Retour au catalogue des applications pré-configurées](/apps/)
