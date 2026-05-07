---
title: "DocuSeal"
description: "Application de signature électronique par défaut de la suite (remplace Documenso). Téléversez un PDF, placez les champs de signature, envoyez pour signature."
---

Application de signature électronique par défaut de la suite (remplace Documenso). Téléversez un PDF, placez les champs de signature, envoyez pour signature. Piste d'audit + génération de PDF signé intégrées.

- **Projet original :** <https://www.docuseal.com/>
- **Remplace :** **DocuSign**, **HelloSign**, **PandaDoc**, **Adobe Sign**
- **Connexion (SSO) :** À activer via l'interface admin — collez les valeurs `OIDC_*` depuis l'onglet Environment une fois.

## Étapes de configuration

1. Cliquez **Deploy**. Patientez ~1 min pour le premier démarrage.
2. Visitez votre domaine DocuSeal et complétez l'assistant initial (création du compte admin).
3. *(Optionnel)* Activez Keycloak SSO : **Settings** → **SSO** → choisissez **OpenID Connect** → collez :
   - **Client ID :** `OIDC_CLIENT_ID` depuis Environment (`docuseal`)
   - **Client Secret :** `OIDC_CLIENT_SECRET` depuis Environment (demandez à votre opérateur de le générer côté Keycloak si vide)
   - **Issuer URL :** `OIDC_ISSUER_URL`
   - Validez. La page de connexion affiche **Sign in with Keycloak**. La connexion admin locale continue de fonctionner comme issue de secours.
4. *(Optionnel)* Configurez SMTP pour les e-mails de demande de signature : remplissez `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM_ADDRESS` dans l'onglet Environment puis redéployez. Sans SMTP, les destinataires ne voient que les demandes en attente dans leur tableau de bord.

### Pourquoi DocuSeal est par défaut

DocuSeal remplace Documenso (toujours au catalogue avec un bandeau de dépréciation). Démarrage plus rapide, gestion du certificat de signature simplifiée (pas d'étape PKCS12 au premier déploiement), et apps iOS/Android maintenues. Documenso reste au catalogue le temps que les clients existants migrent.

### Certificat de signature

DocuSeal génère des PDF signés d'emblée sans étape de génération de certificat. Adobe Acrobat affiche la signature comme cryptographiquement valide mais avec un avertissement « racine auto-signée » par défaut — même limite que Documenso. Pour des signatures à valeur légale, contactez votre opérateur pour installer un certificat émis par une AC via l'UI admin DocuSeal (Settings → Signature → Certificates).

### SMTP

Sans SMTP configuré, les e-mails de demande de signature ne sont pas envoyés. Les destinataires voient les demandes en attente dans leur tableau de bord. Pour activer les e-mails, renseignez les variables `SMTP_*` dans l'onglet Environment.

## Variables d'environnement

Ces valeurs se trouvent dans l'onglet **Environment** du compose
Dokploy. Les secrets aléatoires sont générés automatiquement au
premier semi du template — vous n'avez pas à les générer vous-même.

| Variable | Valeur par défaut |
|---|---|
| `DOCUSEAL_HOSTNAME` | `sign.yourdomain.com` |
| `SECRET_KEY_BASE` | _valeur aléatoire auto-générée_ |
| `DB_PASSWORD` | _valeur aléatoire auto-générée_ |
| `SMTP_HOST` | _(à définir avant déploiement)_ |
| `SMTP_PORT` | `587` |
| `SMTP_USERNAME` | _(à définir avant déploiement)_ |
| `SMTP_PASSWORD` | _(à définir avant déploiement)_ |
| `SMTP_FROM_ADDRESS` | _(à définir avant déploiement)_ |
| `SMTP_AUTH` | `plain` |
| `OIDC_CLIENT_ID` | `docuseal` |
| `OIDC_CLIENT_SECRET` | _(à définir avant déploiement)_ |
| `OIDC_ISSUER_URL` | `https://auth.yourdomain.com/realms/catena` |

## Domaine

- **Service et port :** `docuseal:3000`
- **Nom d'hôte :** `sign.yourdomain.com`

Le nom d'hôte est attaché automatiquement au semi du template ;
modifiez-le dans l'onglet **Domains** avant de cliquer Deploy si
vous souhaitez autre chose.

## Fichier compose

Pour référence — c'est ce que le template déploie. **Ne collez ceci
nulle part.** Le compose est semé dans Dokploy automatiquement ; les
ajustements côté client se font dans les onglets Environment et
Domains (décrits plus haut), jamais dans le compose lui-même.

```yaml
# DocuSeal -- open-source document signing. Replaces Documenso in this
# stack as of 2026-04-29 (F5a decision); Documenso is kept in catalog
# under a deprecation banner for the migration window.
#
# Auth: DocuSeal community edition has admin-UI SSO config (Settings ->
# SSO). Marked sso_mode=post-deploy-ui in the catalog -- after first
# deploy, an admin pastes OIDC_* values from the Environment tab into
# the SSO settings page. The local admin login keeps working as a
# break-glass.
#
# Storage: docuseal-data holds uploaded PDFs, signature images, and
# generated signed PDFs. Picked up by restic via /var/lib/docker/volumes.
# Postgres holds metadata + audit trail.

services:
  docuseal:
    image: docuseal/docuseal:1.8.4
    restart: unless-stopped
    environment:
      HOST: https://${DOCUSEAL_HOSTNAME}
      FORCE_SSL: "true"
      DATABASE_URL: postgres://docuseal:${DB_PASSWORD}@db:5432/docuseal
      SECRET_KEY_BASE: ${SECRET_KEY_BASE}

      # SMTP -- DocuSeal uses SMTP_* env vars. Optional; when unset,
      # signature-request emails are not delivered (recipients still
      # see pending requests in their dashboard if they sign in).
      SMTP_ADDRESS: ${SMTP_HOST:-}
      SMTP_PORT: ${SMTP_PORT:-587}
      SMTP_USERNAME: ${SMTP_USERNAME:-}
      SMTP_PASSWORD: ${SMTP_PASSWORD:-}
      SMTP_FROM: ${SMTP_FROM_ADDRESS:-}
      SMTP_AUTHENTICATION: ${SMTP_AUTH:-plain}

      # Exposed for operator reference (Settings -> SSO) but not
      # consumed by DocuSeal directly at boot. Operator pastes these
      # in the admin UI once after first sign-in.
      OIDC_CLIENT_ID: ${OIDC_CLIENT_ID}
      OIDC_CLIENT_SECRET: ${OIDC_CLIENT_SECRET}
      OIDC_ISSUER_URL: ${OIDC_ISSUER_URL}
    volumes:
      - docuseal-data:/data
    depends_on:
      db:
        condition: service_healthy
    labels:
      - "vps.auth.mode=public"
      - "vps.auth.oidc=true"
      - "vps.auth.groups=client-staff"
      - "vps.auth.oidc.redirect_uris=https://${DOCUSEAL_HOSTNAME}/users/auth/openid_connect/callback"
      - "vps.auth.oidc.scopes=openid email profile"
      - "vps.auto-update=patch"
    networks:
      dokploy-network:
        aliases:
          - docuseal
      default: {}

  db:
    image: postgres:16.13-alpine3.22
    restart: unless-stopped
    environment:
      POSTGRES_USER: docuseal
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: docuseal
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U docuseal"]
      interval: 10s
      timeout: 5s
      retries: 5
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

volumes:
  docuseal-data:
  db-data:

networks:
  dokploy-network:
    external: true
```

---

[← Retour au catalogue des applications pré-configurées](./)
