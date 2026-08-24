---
title: "Windshift"
description: "Gestion du travail avec suites de tests, feuilles de temps et portails clients personnalisés."
---

Gestion du travail avec suites de tests, feuilles de temps et portails clients personnalisés.

- **Projet original :** <https://windshift.sh/>
- **Remplace :** **Jira**, **Jira Service Management**, **Tempo**, **Xray**
- **Connexion (SSO) :** À activer via l'interface admin -- collez les valeurs `OIDC_*` depuis l'onglet Environment une fois.

## Étapes de configuration

1. Cliquez **Deploy**. Patientez ~1 min (un binaire et sa base de données).
2. Visitez le domaine Windshift et créez le premier compte administrateur.
3. *(Optionnel)* Activez Keycloak SSO : **Admin** -> **Single Sign-On** -> ajoutez un fournisseur **OpenID Connect**. Nommez-le `keycloak` pour que l'URI de redirection pré-enregistrée corresponde, collez `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET` et `OIDC_ISSUER_URL` depuis l'onglet Environment, puis indiquez les scopes `openid email profile`. Avec un autre nom de fournisseur, copiez la **Callback URL** affichée dans la fenêtre vers les URI de redirection du fournisseur d'identité.
4. *(Optionnel)* Ajoutez un portail client depuis la zone d'administration. Les comptes de portail sont distincts des comptes internes, et chaque portail a son nom, son habillage, ses types de demandes et ses règles d'accès.

**Langue de l'interface :** Windshift est livré en anglais, allemand, espagnol, portugais, arabe et chinois. Aucune traduction française n'existe en amont à la version v0.8.4.

**Édition :** l'édition auto-hébergée est sous AGPL-3.0, sans limite d'utilisateurs ni d'espaces de travail. SAML 2.0, LDAP et le journal d'audit sont annoncés pour l'édition payante Windshift Pro ; OpenID Connect et les clés d'accès sont inclus ici.

## Variables d'environnement

Ces valeurs sont les champs à remplir au déploiement du template
depuis le panneau **App Templates** du serveur (Portainer). Les
secrets aléatoires sont générés automatiquement au premier semis du
template : aucun n'est à générer à la main.

| Variable | Valeur par défaut |
|---|---|
| `DOMAIN_HOST` | `work.yourdomain.com` |
| `WINDSHIFT_HOSTNAME` | `work.yourdomain.com` |
| `SSO_SECRET` | _valeur aléatoire auto-générée_ |
| `DB_PASSWORD` | _valeur aléatoire auto-générée_ |

## Domaine

- **Service et port :** `windshift:8080`
- **Nom d'hôte :** `work.yourdomain.com`

Le nom d'hôte est attaché automatiquement au déploiement du template.
Un autre nom se convient avant le déploiement, sur demande.

## Fichier compose

Pour référence -- c'est ce que le template déploie. **Ne collez ceci
nulle part.** Le compose est semé dans Portainer automatiquement ; les
ajustements côté client se font dans les champs d'environnement du
formulaire de déploiement (décrits plus haut), jamais dans le compose
lui-même.

```yaml
# Windshift -- self-hosted work management (Jira-shaped): work items,
# boards, backlogs, test management, time tracking, and branded customer
# portals. Single Go binary + Postgres.
#
# Auth: OIDC is configured in the admin panel (Admin -> Single Sign-On),
# never through env vars -- marked sso_mode=post-deploy-ui in the
# catalog. The callback URI is BASE_URL + /api/sso/callback/<slug>,
# where <slug> is the provider slug typed into that panel; the setup
# steps pin it to `keycloak` so the minted client's redirect URI matches
# the label below. WebAuthn/passkeys and password login are toggled from
# the same panel. SAML 2.0 and LDAP are Windshift Pro, not this edition.
#
# Storage: windshift-data holds attachments, plugins, and AI prompt
# overrides. Postgres holds every work item, test case/run, worklog,
# and portal request.
#
# The runtime image is FROM scratch (one static Go binary, USER 65534).
# There is no shell and no package manager in this container: anything
# that needs to run inside it goes through `/windshift <subcommand>`.

services:
  windshift:
    image: ghcr.io/windshiftapp/windshift:v0.8.4
    deploy:
      # Swarm starts every service at once, and this image has no shell to
      # wait for postgres with, so the ordering is the restart policy: the
      # binary exits when it cannot reach the database and swarm brings it
      # back until it can. Safe here because the schema migrations run in a
      # transaction, so a half-connected start leaves nothing behind.
      restart_policy:
        condition: any
      placement:
        constraints:
          - node.labels.catena.role==data
      resources:
        limits:
          memory: 2G
    environment:
      BASE_URL: https://${WINDSHIFT_HOSTNAME}
      PORT: "8080"
      # Behind Traefik + the Cloudflare tunnel, so the forwarded
      # proto/host headers are the only source of the real scheme.
      USE_PROXY: "true"
      SSO_SECRET: ${SSO_SECRET}
      # WebAuthn credentials are bound to this relying-party id. It must
      # equal the hostname users type; changing it invalidates every
      # passkey already registered.
      WEBAUTHN_RP_ID: ${WINDSHIFT_HOSTNAME}

      DB_TYPE: postgres
      POSTGRES_HOST: db
      POSTGRES_PORT: "5432"
      POSTGRES_USER: windshift
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: windshift
      POSTGRES_SSLMODE: disable

      ATTACHMENT_PATH: /data/attachments
      PLUGIN_DIR: /data/plugins
      LOG_LEVEL: info
      LOG_FORMAT: json
      # Process budget. Keep deploy.resources.limits.memory in step with it.
      WINDSHIFT_MEMORY_LIMIT_MB: "2048"
      # Scratch has no /tmp of its own; the windshift-tmp volume supplies it.
      TMPDIR: /tmp
      SQLITE_TMPDIR: /tmp
    volumes:
      - windshift-data:/data
      # /tmp needs exec: the temp dir backs SQLite WAL scratch files even in
      # postgres mode. A swarm tmpfs mount is always noexec and swarm offers
      # no way to ask otherwise, so this is a named volume rather than a
      # tmpfs. It holds scratch, so nothing here needs to survive -- but it
      # does, which is why the app's own TMPDIR cleanup is what keeps it
      # bounded.
      - windshift-tmp:/tmp
    # Every open item-detail view holds an SSE connection; the default
    # 1024 fd ceiling is the failure point near ~1000 concurrent streams.
    ulimits:
      nofile:
        soft: 65536
        hard: 65536
    healthcheck:
      test: ["CMD", "/windshift", "healthcheck"]
      interval: 15s
      timeout: 5s
      retries: 5
      start_period: 30s
    labels:
      - "vps.route.host=${DOMAIN_HOST}"
      - "vps.route.port=8080"
      - "vps.route.service=windshift"
      - "vps.auth.mode=public"
      - "vps.auth.oidc=true"
      - "vps.auth.groups=staff"
      - "vps.auth.oidc.redirect_uris=https://${WINDSHIFT_HOSTNAME}/api/sso/callback/keycloak"
      - "vps.auth.oidc.scopes=openid email profile"
      - "vps.auto-update=patch"
      - "vps.app=catena-windshift"
      - "vps.component=windshift"
    networks:
      catena-network:
        aliases:
          - catena-windshift
      default: {}

  db:
    image: postgres:18.4-alpine
    deploy:
      restart_policy:
        condition: any
      placement:
        constraints:
          - node.labels.catena.role==data
    environment:
      POSTGRES_USER: windshift
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: windshift
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U windshift"]
      interval: 10s
      timeout: 5s
      retries: 5
    labels:
      - "vps.auto-update=patch"
      - "vps.app=catena-windshift"
      - "vps.component=db"
    networks:
      - default

volumes:
  windshift-data:
  windshift-tmp:
  db-data:

networks:
  catena-network:
    external: true
```

---

[<- Retour au catalogue des applications pré-configurées](/fr/apps/)
