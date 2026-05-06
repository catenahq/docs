---
title: "Nextcloud"
description: "Partage de fichiers et collaboration auto-hébergés — le hub auquel d'autres templates se connectent."
---

Partage de fichiers et collaboration auto-hébergés — le hub auquel d'autres templates se connectent.

- **Projet original :** <https://nextcloud.com>
- **Remplace :** **Google Drive**, **Dropbox**, **OneDrive Entreprise**
- **Connexion (SSO) :** Câblé automatiquement — la convergence de votre opérateur exécute un hook CLI idempotent qui enregistre Keycloak dans l'app à chaque passage. Aucune étape post-déploiement côté client.

## Étapes de configuration

1. Ouvrez l'onglet **Environment** et remplissez `S3_BUCKET`, `S3_REGION`, `S3_HOST`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` avec les coordonnées de votre seau S3. (Le reste est pré-rempli — `NEXTCLOUD_HOSTNAME`, identifiants admin/DB, variables d'intégration OIDC.)
2. Cliquez **Deploy**. Patientez ~2 min pour le premier démarrage.
3. Câblez le SSO : ouvrez `actions.<votre-domaine>` puis cliquez **Câbler l'OIDC pour Nextcloud**. Le bouton enregistre Keycloak comme fournisseur OIDC à l'intérieur de Nextcloud (idempotent — peut être recliqué sans risque après un redéploiement ou une rotation de secret).
4. Connectez-vous sur votre domaine Nextcloud avec **Se connecter avec keycloak** (utilise votre identité gérée par l'opérateur), ou repli sur `NEXTCLOUD_ADMIN_USER` / `NEXTCLOUD_ADMIN_PASSWORD` de l'onglet Environment.

### Connexion avec Keycloak — câblée par le bouton OliveTin

Après le premier déploiement de Nextcloud, vous cliquez
**Câbler l'OIDC pour Nextcloud** sur
`actions.<votre-domaine>`. Le bouton active l'application
`user_oidc` de Nextcloud et enregistre un fournisseur
`keycloak` avec les valeurs OIDC de l'onglet Environment. La
page de connexion Nextcloud affiche alors **Se connecter
avec keycloak** à votre prochaine visite. La connexion admin
locale (`NEXTCLOUD_ADMIN_USER` / `NEXTCLOUD_ADMIN_PASSWORD`)
continue de fonctionner en parallèle comme issue de secours.

Recliquez le bouton chaque fois que la configuration OIDC
dérive (après une rotation de secret, un redéploiement
destructif, etc.). Il est idempotent — relancer ne fait que
rafraîchir l'enregistrement du fournisseur.

### Le partage de fichiers par lien courriel fonctionne toujours

L'authentification Keycloak gouverne la **connexion des
utilisateurs** à Nextcloud. Elle ne restreint **pas** les
liens de partage publics anonymes — les URL
`/s/<jeton>` que votre équipe génère depuis Nextcloud
restent accessibles aux destinataires qui n'ont pas de
compte Keycloak.

Le flux courant fonctionne donc tel quel :

1. Un membre de votre équipe (utilisateur connecté) crée un
   lien de partage dans Nextcloud, avec un mot de passe et
   une date d'expiration s'il le souhaite.
2. Nextcloud envoie le lien par courriel au destinataire.
3. Le destinataire clique le lien. Cloudflare Tunnel
   achemine la requête directement à Nextcloud ; Nextcloud
   sert la page de partage publique (ou l'invite de mot de
   passe, si vous en avez défini un). Pas de redirection
   Keycloak, pas de connexion requise.

Cela fonctionne parce que Nextcloud est atteint via son
propre code d'authentification, pas via un proxy
forward-auth. Le module `user_oidc` ne gère que le flux de
connexion pour *les membres de votre équipe* ; les points
d'accès des partages publics restent anonymes par
conception.

Si vous souhaitez verrouiller complètement les partages
publics, le bon contrôle est à l'intérieur de Nextcloud
(Paramètres → Partage → « Autoriser le partage par lien
public »), pas au niveau réseau.

## Variables d'environnement

Ces valeurs se trouvent dans l'onglet **Environment** du compose
Dokploy. Les secrets aléatoires sont générés automatiquement au
premier semi du template — vous n'avez pas à les générer vous-même.

| Variable | Valeur par défaut |
|---|---|
| `NEXTCLOUD_HOSTNAME` | `nextcloud.yourdomain.com` |
| `NEXTCLOUD_ADMIN_USER` | `admin` |
| `NEXTCLOUD_ADMIN_PASSWORD` | _valeur aléatoire auto-générée_ |
| `DB_PASSWORD` | _valeur aléatoire auto-générée_ |
| `S3_BUCKET` | _(à définir avant déploiement)_ |
| `S3_REGION` | `bhs` |
| `S3_HOST` | `s3.bhs.io.cloud.ovh.net` |
| `S3_ACCESS_KEY` | _(à définir avant déploiement)_ |
| `S3_SECRET_KEY` | _(à définir avant déploiement)_ |
| `OIDC_CLIENT_ID` | `nextcloud` |
| `OIDC_CLIENT_SECRET` | `<your-nextcloud_oidc_client_secret>` |
| `OIDC_DISCOVERY_URL` | `https://auth.yourdomain.com/realms/catena/.well-known/openid-configuration` |
| `OIDC_ISSUER_URL` | `https://auth.yourdomain.com/realms/catena` |
| `OIDC_REDIRECT_URL` | `https://nextcloud.yourdomain.com/apps/user_oidc/code` |

## Domaine

- **Service et port :** `app:80`
- **Nom d'hôte :** `nextcloud.yourdomain.com`

Le nom d'hôte est attaché automatiquement au semi du template ;
modifiez-le dans l'onglet **Domains** avant de cliquer Deploy si
vous souhaitez autre chose.

## Fichier compose

Pour référence — c'est ce que le template déploie. **Ne collez ceci
nulle part.** Le compose est semé dans Dokploy automatiquement ; les
ajustements côté client se font dans les onglets Environment et
Domains (décrits plus haut), jamais dans le compose lui-même.

```yaml
# Nextcloud — S3 primary storage + Keycloak SSO.
#
# All values come from the Environment tab: hostname, S3 credentials,
# admin password, DB password, OIDC coordinates (auto-injected). The
# compose itself is not edited per deploy.

services:
  app:
    image: nextcloud:33.0.2-apache
    restart: unless-stopped
    environment:
      NEXTCLOUD_TRUSTED_DOMAINS: ${NEXTCLOUD_HOSTNAME}
      NEXTCLOUD_ADMIN_USER: ${NEXTCLOUD_ADMIN_USER}
      NEXTCLOUD_ADMIN_PASSWORD: ${NEXTCLOUD_ADMIN_PASSWORD}

      # TLS is terminated upstream (Cloudflare Tunnel → Traefik). Force
      # Nextcloud to render https:// links + trust the reverse-proxy
      # Forwarded headers so user_oidc's HTTPS precondition check passes.
      OVERWRITEPROTOCOL: https
      OVERWRITEHOST: ${NEXTCLOUD_HOSTNAME}
      OVERWRITECLIURL: https://${NEXTCLOUD_HOSTNAME}
      TRUSTED_PROXIES: 10.0.0.0/8 172.16.0.0/12 192.168.0.0/16

      POSTGRES_HOST: db
      POSTGRES_DB: nextcloud
      POSTGRES_USER: nextcloud
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: redis

      OBJECTSTORE_S3_BUCKET: ${S3_BUCKET}
      OBJECTSTORE_S3_REGION: ${S3_REGION}
      OBJECTSTORE_S3_HOST: ${S3_HOST}
      OBJECTSTORE_S3_PORT: "443"
      OBJECTSTORE_S3_SSL: "true"
      OBJECTSTORE_S3_USEPATH_STYLE: "true"
      OBJECTSTORE_S3_AUTOCREATE: "false"
      OBJECTSTORE_S3_KEY: ${S3_ACCESS_KEY}
      OBJECTSTORE_S3_SECRET: ${S3_SECRET_KEY}

      NEXTCLOUD_OIDC_CLIENT_ID: ${OIDC_CLIENT_ID}
      NEXTCLOUD_OIDC_CLIENT_SECRET: ${OIDC_CLIENT_SECRET}
      NEXTCLOUD_OIDC_ISSUER_URL: ${OIDC_ISSUER_URL}
      NEXTCLOUD_OIDC_REDIRECT_URL: ${OIDC_REDIRECT_URL}
    volumes:
      - nc-config:/var/www/html/config
      - nc-apps:/var/www/html/custom_apps
      # Even with S3 primary storage, /var/www/html/data still holds
      # appdata_<instance>/ residue, nextcloud.log, audit.log, .ocdata,
      # sqlite caches for some apps -- everything Nextcloud writes
      # outside the objectstore driver. Explicit named volume so the
      # path lives at /mnt/data/docker/volumes/<compose>_nc-data/_data
      # (predictable, visible in `docker volume ls`, captured by
      # restic's docker/volumes/ rule). Without this mount, Docker
      # creates an anonymous volume from the image's VOLUME directive
      # -- still backed up but with an opaque sha256 name.
      - nc-data:/var/www/html/data
    configs:
      - source: nc_loglevel_hook
        target: /docker-entrypoint-hooks.d/before-starting/zz-loglevel.sh
        mode: 0755
    labels:
      - "vps.auth.mode=public"
      - "vps.auth.oidc=true"
      - "vps.auth.groups=client-staff"
      - "vps.auth.oidc.redirect_uris=https://${NEXTCLOUD_HOSTNAME}/apps/user_oidc/code"
      - "vps.auth.oidc.scopes=openid email profile groups"
      - "vps.auto-update=patch"
    networks:
      dokploy-network:
        aliases:
          - nextcloud
      default: {}

  db:
    image: postgres:16.13-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: nextcloud
      POSTGRES_USER: nextcloud
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db-data:/var/lib/postgresql/data
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  redis:
    image: redis:7.4.8-alpine
    restart: unless-stopped
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  cron:
    image: nextcloud:33.0.2-apache
    restart: unless-stopped
    entrypoint: /cron.sh
    environment:
      POSTGRES_HOST: db
      POSTGRES_DB: nextcloud
      POSTGRES_USER: nextcloud
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: redis
      OBJECTSTORE_S3_BUCKET: ${S3_BUCKET}
      OBJECTSTORE_S3_REGION: ${S3_REGION}
      OBJECTSTORE_S3_HOST: ${S3_HOST}
      OBJECTSTORE_S3_PORT: "443"
      OBJECTSTORE_S3_SSL: "true"
      OBJECTSTORE_S3_USEPATH_STYLE: "true"
      OBJECTSTORE_S3_KEY: ${S3_ACCESS_KEY}
      OBJECTSTORE_S3_SECRET: ${S3_SECRET_KEY}
    volumes:
      - nc-config:/var/www/html/config
      - nc-apps:/var/www/html/custom_apps
      # Cron and app must share the data volume -- background jobs
      # (file scanning, preview generation, etc.) write to the same
      # /var/www/html/data tree the app reads from.
      - nc-data:/var/www/html/data
    # No command override on cron: it runs /cron.sh as its entrypoint,
    # which is a thin runner for occ background-jobs. The app service
    # writes zz-loglevel.config.php into the shared nc-config volume
    # on its own startup; cron picks it up via the shared mount.
    networks:
      - default

volumes:
  nc-config:
  nc-apps:
  nc-data:
  db-data:

configs:
  # Default Nextcloud loglevel = info (1). 0=debug 1=info 2=warning
  # 3=error 4=fatal. Nextcloud's config loader merges any *.config.php
  # sibling of config.php at /var/www/html/config/.
  #
  # Delivered as a before-starting hook script (NOT a direct mount of
  # the .config.php file): mounting a single config file into the
  # nc-config NAMED VOLUME left the volume containing only the
  # mounted file at runtime, breaking Nextcloud's first-install. The
  # hook lives at /docker-entrypoint-hooks.d/before-starting/, a pure
  # image path with no volume interaction; it runs AFTER the upstream
  # entrypoint's populate step and BEFORE Apache binds the listen
  # socket, so the file lands in a fully-installed config dir on
  # every container start.
  #
  # Heredoc-free body: a previous version used `cat > file <<'EOF'`,
  # and the hook runner reported `Exit code: 2` with no output from
  # the leading echo -- a shell parse failure somewhere in the
  # heredoc-via-compose-config pipeline. The brace-group + echo
  # form is straight POSIX.
  #
  # `$$CONFIG` -> `$CONFIG` after compose interpolation; single-quoted
  # echo arg preserves the literal `$` at runtime.
  # MINIMAL DIAGNOSTIC HOOK -- if this exits 2 we know the failure is
  # in compose's content-delivery pipeline, not in our script body.
  # Restore the real loglevel-writing script once delivery is verified.
  nc_loglevel_hook:
    content: |
      #!/bin/sh
      echo "loglevel hook ran" >&2
      exit 0

networks:
  dokploy-network:
    external: true
```

---

[← Retour au catalogue des applications pré-configurées](./)
