---
title: "WordPress"
description: "Production-ready public CMS / website platform with FastCGI cache, Redis object cache, and a curated free-tier plugin set pre-installed."
---

Production-ready public CMS / website platform with FastCGI cache, Redis object cache, and a curated free-tier plugin set pre-installed. The site serves anonymously; admin sign-in runs on /wp-admin and can be wired to Keycloak via a plugin.

- **Upstream project:** <https://wordpress.org/>
- **Replaces:** **Wix**, **Squarespace**, **self-hosted Drupal**
- **Sign-in (SSO):** Enable via the app's admin UI -- paste the `OIDC_*` values from the Environment tab once.

## Setup steps

1. Click **Deploy**. Wait ~1 min for MariaDB + Redis + nginx + WordPress to initialize.
2. Visit your WordPress domain. Run through the install wizard (site title, admin username, admin password, email).
3. After the install wizard completes, the next operator converge auto-installs and configures the curated plugin set: kadence-blocks, performance-lab + its seven feature modules (auto-sizes, dominant-color-images, embed-optimizer, image-prioritizer, optimization-detective, speculation-rules, webp-uploads), nginx-cache-purge-and-preload (NPP -- purges + re-warms the FastCGI cache via your Rank Math sitemap), redis-cache (wired to the bundled Redis), wp-mail-smtp (wired to your operator-configured SMTP), wp-mail-logging, complianz-gdpr, wp-consent-api, seo-by-rank-math, and Fluent Forms.
4. Visit `/wp-admin/admin.php?page=rank-math` and `/wp-admin/admin.php?page=cmplz-wizard` to run the Rank Math + Complianz first-run wizards. Their answers are site-specific (industry, EU/non-EU, etc.) and intentionally not pre-filled.
5. *(Optional)* Wire `/wp-admin` login to Keycloak: **Plugins** -> **Add New** -> search `OpenID Connect Generic` -> **Install** -> **Activate**. Go to **Settings** -> **OpenID Connect Client** and fill:
   - **Client ID:** `OIDC_CLIENT_ID` from Environment
   - **Client Secret:** `OIDC_CLIENT_SECRET`
   - **Login Endpoint URL:** `<OIDC_ISSUER_URL>/authorize/`
   - **Userinfo Endpoint URL:** `<OIDC_ISSUER_URL>/userinfo/`
   - **Token Validation Endpoint URL:** `<OIDC_ISSUER_URL>/token/`
   - **Identity Key:** `preferred_username`
   - **Link Existing Users:** ✔

   Save. The login page gains a **Login with OpenID Connect** button. The public-facing site stays anonymous and indexable.

**Stack.** WordPress runs as nginx + php-fpm + MariaDB + Redis. Nginx serves static assets directly, caches PHP responses with FastCGI cache (purged automatically by NPP on edit/publish, then re-warmed via your sitemap), and proxies the rest to php-fpm. Redis backs the WordPress object cache. Sized for a single-VPS deploy; for traffic spikes scale vertically.

**Split-auth note.** Public pages (the website itself) are served anonymously -- search engines crawl normally, visitors don't see Keycloak. Only `/wp-admin` goes through the optional OIDC plugin for admin/editor logins. That's what makes WordPress on this stack a hybrid: reader-facing but SSO-managed for staff.

## Environment variables

These values live in the Dokploy compose's **Environment** tab. Random
secrets are minted automatically when the template is first seeded --
you don't need to generate them yourself.

| Variable | Default |
|---|---|
| `WORDPRESS_HOSTNAME` | `www.yourdomain.com` |
| `WPMS_SMTP_PASS` | `<your-smtp_password>` |
| `DB_PASSWORD` | _auto-generated random value_ |
| `DB_ROOT_PASSWORD` | _auto-generated random value_ |

## Domain

- **Service and port:** `nginx:80`
- **Hostname:** `www.yourdomain.com`

The hostname is attached automatically when the template is seeded;
change it in the **Domains** tab before clicking Deploy if you want
something else.

## Compose file

For reference -- this is what the template deploys. **Do not paste this
anywhere.** The compose is seeded into Dokploy automatically; the
client-facing adjustments you make happen in the Environment and
Domains tabs (described above), never in the compose itself.

```yaml
# WordPress -- production-ready stack with FastCGI cache + Redis object
# cache. Public site serves anonymously; admin sign-in (/wp-admin) runs
# through WordPress own login. To add Keycloak SSO on the admin backend,
# install the OpenID Connect Generic plugin post-deploy and paste the
# OIDC values from the Environment tab (see catalog setup_steps).
#
# Stack:
#   nginx (front door, FastCGI cache)
#     -> wp (php-fpm-alpine)
#     -> db (mariadb) + redis (object cache)
#
# Plugin curation runs post-deploy via your operator's automation
# (idempotent; safe to re-converge). The plugin set is opinionated;
# contact your operator if you want to add or drop one.
#
# UID alignment: nginx workers + php-fpm workers BOTH run as www-data
# (uid 82). The wp image already does that; the nginx entrypoint below
# adds www-data:82 before nginx starts so its workers also drop to 82.
# Result: NPP cache-purge under php-fpm can unlink files written by
# nginx workers.

services:
  wp:
    image: wordpress:6.9.4-fpm-alpine
    restart: unless-stopped
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: ${DB_PASSWORD}
      WORDPRESS_DB_NAME: wordpress
      WORDPRESS_TABLE_PREFIX: wp_
      WORDPRESS_DEBUG: "0"
      # Behind Traefik -- WP must honor X-Forwarded-Proto to build
      # HTTPS URLs. Redis + cache-key salt wire the redis-cache plugin
      # to the redis service; one site per hostname so two installs
      # cannot collide on shared object-cache keys.
      # Plugin password is exposed only when WPMS_SMTP_PASS env is set
      # (operator-configured SMTP). When unset/empty, wp-mail-smtp
      # falls back to its option-stored password (also empty until the
      # task wires it up). Defining the constant unconditionally would
      # masquerade an empty constant as a "configured" credential.
      WPMS_SMTP_PASS: ${WPMS_SMTP_PASS}
      WORDPRESS_CONFIG_EXTRA: |
        define( 'FORCE_SSL_ADMIN', true );
        if ( isset( $$_SERVER['HTTP_X_FORWARDED_PROTO'] ) && $$_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https' ) {
            $$_SERVER['HTTPS'] = 'on';
        }
        define( 'WP_REDIS_HOST', 'redis' );
        define( 'WP_REDIS_PORT', 6379 );
        define( 'WP_REDIS_DATABASE', 0 );
        define( 'WP_CACHE_KEY_SALT', '${WORDPRESS_HOSTNAME}_' );
        $$_wpms_smtp_pass = getenv( 'WPMS_SMTP_PASS' );
        if ( $$_wpms_smtp_pass !== false && $$_wpms_smtp_pass !== '' ) {
            define( 'WPMS_SMTP_PASS', $$_wpms_smtp_pass );
        }
    volumes:
      - wp-files:/var/www/html
      - wp-cache:/var/cache/nginx/fastcgi
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "test -f /var/www/html/wp-load.php"]
      interval: 5s
      timeout: 3s
      retries: 30
      start_period: 60s
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  nginx:
    image: nginx:1.29.8-alpine
    restart: unless-stopped
    # Add www-data uid 82 (matches php-fpm-alpine) before starting nginx
    # so workers can read/write the FastCGI cache that NPP unlinks from
    # php-fpm. Ensure the cache dir is owned by www-data on first boot.
    command:
      - /bin/sh
      - -c
      - |
        addgroup -g 82 -S www-data 2>/dev/null || true
        adduser -u 82 -D -S -G www-data www-data 2>/dev/null || true
        mkdir -p /var/cache/nginx/fastcgi /var/log/nginx
        chown -R www-data:www-data /var/cache/nginx/fastcgi /var/log/nginx
        exec nginx -g 'daemon off;'
    volumes:
      - wp-files:/var/www/html:ro
      - wp-cache:/var/cache/nginx/fastcgi
    configs:
      - source: wp_nginx_conf
        target: /etc/nginx/nginx.conf
    depends_on:
      wp:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget --quiet --tries=1 --spider http://localhost/ || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5
    labels:
      - "vps.auth.mode=public"
      - "vps.auto-update=patch"
    networks:
      catena-network:
        aliases:
          - wordpress
      default: {}

  db:
    image: mariadb:11.8.6
    restart: unless-stopped
    environment:
      MARIADB_DATABASE: wordpress
      MARIADB_USER: wordpress
      MARIADB_PASSWORD: ${DB_PASSWORD}
      MARIADB_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
    volumes:
      - db-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
      interval: 10s
      timeout: 5s
      retries: 5
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  redis:
    image: redis:7.4.9-alpine
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

volumes:
  wp-files:
  wp-cache:
  db-data:

configs:
  wp_nginx_conf:
    file: ./wordpress-nginx.conf

networks:
  catena-network:
    external: true
```

---

[<- Back to all pre-configured apps](/en/apps/)
