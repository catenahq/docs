---
title: "Nextcloud"
description: "Self-hosted file sharing and collaboration — the file hub that other templates plug into."
---

Self-hosted file sharing and collaboration — the file hub that other templates plug into.

- **Upstream project:** <https://nextcloud.com>
- **Replaces:** **Google Drive**, **Dropbox**, **OneDrive for Business**
- **Sign-in (SSO):** Wired automatically — your operator's converge runs an idempotent CLI hook that registers Keycloak inside the app on every run. Zero post-deploy step on the client side.

## Setup steps

1. Open the **Environment** tab and fill `S3_BUCKET`, `S3_REGION`, `S3_HOST`, `S3_ACCESS_KEY`, `S3_SECRET_KEY` with your bucket's coordinates. (Everything else is pre-filled — `NEXTCLOUD_HOSTNAME`, admin/DB credentials, OIDC integration vars.)
2. Click **Deploy**. Wait ~2 minutes for the first boot.
3. Wire SSO: open `actions.<your-domain>` and click **Wire Nextcloud OIDC**. The button registers Keycloak as an OIDC provider inside Nextcloud (idempotent — safe to re-click after redeploys or secret rotations).
4. Sign in at your Nextcloud domain with **Log in with keycloak** (uses your operator-managed identity), or fall back to `NEXTCLOUD_ADMIN_USER` / `NEXTCLOUD_ADMIN_PASSWORD` from the Environment tab.

### Sign-in with Keycloak — wired by the OliveTin button

After Nextcloud's first deploy you click **Wire Nextcloud
OIDC** at `actions.<your-domain>`. The button enables
Nextcloud's `user_oidc` app and registers a `keycloak`
provider with the OIDC fields from the Environment tab. The
Nextcloud login page then shows **Log in with keycloak** the
next time you visit. Local admin login (`NEXTCLOUD_ADMIN_USER`
/ `NEXTCLOUD_ADMIN_PASSWORD`) keeps working alongside SSO as
a break-glass.

Re-click the button any time the OIDC configuration drifts
(after a secret rotation, a destructive redeploy, etc.). It
is idempotent — re-running just refreshes the provider
record.

### Sharing files by email link still works

Keycloak SSO governs **user login** to Nextcloud. It does
**not** restrict anonymous public share links —
`/s/<token>` URLs your team generates from inside Nextcloud
are reachable by recipients who have no Keycloak account.

So the common workflow stays intact:

1. A signed-in user (your team member) creates a share link
   in Nextcloud, optionally with a password and expiry date.
2. Nextcloud emails the link to the recipient.
3. The recipient clicks the link. Cloudflare Tunnel routes
   the request straight to Nextcloud; Nextcloud serves the
   public share page (or the password prompt, if you set
   one). No Keycloak redirect, no login required.

This works because Nextcloud is reached via Nextcloud's own
auth code, not a forward-auth proxy. The `user_oidc` plugin
only handles the login flow for *your team members*; the
public-share endpoints remain anonymous-by-design.

If you ever need to lock down public shares entirely, the
right control is inside Nextcloud (Settings → Sharing →
"Allow share via public link"), not at the network layer.

## Environment variables

These values live in the Dokploy compose's **Environment** tab. Random
secrets are minted automatically when the template is first seeded —
you don't need to generate them yourself.

| Variable | Default |
|---|---|
| `NEXTCLOUD_HOSTNAME` | `nextcloud.yourdomain.com` |
| `NEXTCLOUD_ADMIN_USER` | `admin` |
| `NEXTCLOUD_ADMIN_PASSWORD` | _auto-generated random value_ |
| `DB_PASSWORD` | _auto-generated random value_ |
| `S3_BUCKET` | _(set before deploy)_ |
| `S3_REGION` | `bhs` |
| `S3_HOST` | `s3.bhs.io.cloud.ovh.net` |
| `S3_ACCESS_KEY` | _(set before deploy)_ |
| `S3_SECRET_KEY` | _(set before deploy)_ |
| `OIDC_CLIENT_ID` | `nextcloud` |
| `OIDC_CLIENT_SECRET` | `<your-nextcloud_oidc_client_secret>` |
| `OIDC_DISCOVERY_URL` | `https://auth.yourdomain.com/realms/catena/.well-known/openid-configuration` |
| `OIDC_ISSUER_URL` | `https://auth.yourdomain.com/realms/catena` |
| `OIDC_REDIRECT_URL` | `https://nextcloud.yourdomain.com/apps/user_oidc/code` |

## Domain

- **Service and port:** `app:80`
- **Hostname:** `nextcloud.yourdomain.com`

The hostname is attached automatically when the template is seeded;
change it in the **Domains** tab before clicking Deploy if you want
something else.

## Compose file

For reference — this is what the template deploys. **Do not paste this
anywhere.** The compose is seeded into Dokploy automatically; the
client-facing adjustments you make happen in the Environment and
Domains tabs (described above), never in the compose itself.

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
    # Two-stage delivery for the loglevel override:
    #
    #   1. The entrypoint wrapper writes a `before-starting` hook
    #      script into the container's writable layer (image-baked
    #      path /docker-entrypoint-hooks.d/before-starting/).
    #   2. Wrapper exec's the upstream /entrypoint.sh apache2-foreground.
    #   3. Upstream entrypoint populates /var/www/html/config (rsync
    #      from /usr/src/nextcloud/config/), runs occ install / occ
    #      upgrade, then iterates `before-starting/*.sh` -- our hook
    #      runs as www-data and drops zz-loglevel.config.php into the
    #      already-populated config dir.
    #
    # Why this dance instead of writing the .config.php from the
    # wrapper directly? Upstream's populate.sh skips rsync'ing
    # /var/www/html/config when the dir is already non-empty
    # (`directory_empty` check). A wrapper that writes our file in
    # /var/www/html/config BEFORE the upstream runs makes the dir
    # non-empty -> populate skips -> autoconfig.php / redis.config.php
    # / s3.config.php / etc. never land in the volume -> Apache 503s.
    # Running our writer in a before-starting HOOK sidesteps that
    # check entirely.
    #
    # Why not the compose-v2 `configs:` block? Through Dokploy the
    # inline content-delivery pipeline produced a script that exited 2
    # with no script-side stderr on every start. Materializing the
    # hook ourselves via the wrapper bypasses that delivery path.
    #
    # `$$CONFIG` / `$$@` -> `$CONFIG` / `$@` after compose
    # interpolation. The outer `<<'HOOK'` and inner `<<'PHP'` are
    # both single-quoted heredoc tags, so neither shell expansion
    # round mangles the literal `$CONFIG`.
    entrypoint:
      - /bin/sh
      - -ec
      - |
        cat > /docker-entrypoint-hooks.d/before-starting/zz-loglevel.sh <<'HOOK'
        #!/bin/sh
        set -e
        cat > /var/www/html/config/zz-loglevel.config.php <<'PHP'
        <?php
        $$CONFIG = [
          'loglevel' => 1,
        ];
        PHP
        HOOK
        chmod 0755 /docker-entrypoint-hooks.d/before-starting/zz-loglevel.sh
        exec /entrypoint.sh "$$@"
      - --
    command: ["apache2-foreground"]
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

networks:
  dokploy-network:
    external: true
```

---

[← Back to all pre-configured apps](./)
