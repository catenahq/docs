---
title: "WordPress"
description: "Plateforme CMS / site web public prête pour la production, avec cache FastCGI, cache d'objets Redis et un ensemble de plugins gratuits curatés pré-installés."
---

Plateforme CMS / site web public prête pour la production, avec cache FastCGI, cache d'objets Redis et un ensemble de plugins gratuits curatés pré-installés. Le site est accessible anonymement ; la connexion admin sur /wp-admin peut être câblée à Keycloak via un plugin.

- **Projet original :** <https://wordpress.org/>
- **Remplace :** **Wix**, **Squarespace**, **Drupal auto-hébergé**
- **Connexion (SSO) :** À activer via l'interface admin -- collez les valeurs `OIDC_*` depuis l'onglet Environment une fois.

## Étapes de configuration

1. Cliquez **Deploy**. Patientez ~1 min le temps que MariaDB + Redis + nginx + WordPress s'initialisent.
2. Visitez le domaine WordPress. Suivez l'assistant d'installation (titre du site, admin, mot de passe, email).
3. Une fois l'assistant terminé, le prochain converge opérateur installe et configure automatiquement la liste curatée : kadence-blocks, performance-lab et ses sept modules (auto-sizes, dominant-color-images, embed-optimizer, image-prioritizer, optimization-detective, speculation-rules, webp-uploads), nginx-cache-purge-and-preload (NPP -- purge le cache FastCGI à la publication puis le réchauffe via le sitemap Rank Math), redis-cache (câblé au Redis embarqué), wp-mail-smtp (câblé au SMTP configuré côté opérateur), wp-mail-logging, complianz-gdpr, wp-consent-api, seo-by-rank-math, et Fluent Forms.
4. Visitez `/wp-admin/admin.php?page=rank-math` et `/wp-admin/admin.php?page=cmplz-wizard` pour exécuter les assistants de première utilisation Rank Math + Complianz. Leurs réponses dépendent du site (secteur, UE / hors-UE, etc.) et ne sont volontairement pas pré-remplies.
5. *(Optionnel)* Connectez `/wp-admin` à Keycloak : **Extensions** -> **Ajouter** -> chercher `OpenID Connect Generic` -> **Installer** -> **Activer**. Puis **Réglages** -> **OpenID Connect Client** et remplissez :
   - **Client ID :** `OIDC_CLIENT_ID` depuis Environment
   - **Client Secret :** `OIDC_CLIENT_SECRET`
   - **Login Endpoint URL :** `<OIDC_ISSUER_URL>/authorize/`
   - **Userinfo Endpoint URL :** `<OIDC_ISSUER_URL>/userinfo/`
   - **Token Validation Endpoint URL :** `<OIDC_ISSUER_URL>/token/`
   - **Identity Key :** `preferred_username`
   - **Link Existing Users :** ✔

   Validez. La page de connexion affiche un bouton **Login with OpenID Connect**. Le site public reste accessible anonymement et indexable.

**Stack.** WordPress tourne en nginx + php-fpm + MariaDB + Redis. Nginx sert directement les ressources statiques, met en cache les réponses PHP avec son cache FastCGI (purgé automatiquement par NPP à chaque édition / publication, puis réchauffé via le sitemap), et délègue le reste à php-fpm. Redis sert de cache d'objets WordPress. Dimensionné pour un VPS unique ; pour absorber un pic de trafic, scaler verticalement.

**Auth mixte.** Les pages publiques du site sont servies anonymement -- les moteurs de recherche crawlent normalement, les visiteurs ne voient pas Keycloak. Seul `/wp-admin` passe par le plugin OIDC optionnel pour les connexions admin/éditeur. C'est ce qui rend WordPress sur cette stack hybride : tourné vers les lecteurs mais administré en SSO.

## Variables d'environnement

Ces valeurs sont les champs à remplir au déploiement du template
depuis le panneau **App Templates** du serveur (Portainer). Les
secrets aléatoires sont générés automatiquement au premier semis du
template : aucun n'est à générer à la main.

| Variable | Valeur par défaut |
|---|---|
| `DOMAIN_HOST` | `www.yourdomain.com` |
| `WORDPRESS_HOSTNAME` | `www.yourdomain.com` |
| `WPMS_SMTP_PASS` | `<your-smtp_password>` |
| `DB_PASSWORD` | _valeur aléatoire auto-générée_ |
| `DB_ROOT_PASSWORD` | _valeur aléatoire auto-générée_ |

## Domaine

- **Service et port :** `nginx:80`
- **Nom d'hôte :** `www.yourdomain.com`

Le nom d'hôte est attaché automatiquement au déploiement du template.
Un autre nom se convient avant le déploiement, sur demande.

## Fichier compose

Pour référence -- c'est ce que le template déploie. **Ne collez ceci
nulle part.** Le compose est semé dans Portainer automatiquement ; les
ajustements côté client se font dans les champs d'environnement du
formulaire de déploiement (décrits plus haut), jamais dans le compose
lui-même.

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
      - "vps.route.host=${DOMAIN_HOST}"
      - "vps.route.port=80"
      - "vps.route.service=nginx"
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

[<- Retour au catalogue des applications pré-configurées](/fr/apps/)
