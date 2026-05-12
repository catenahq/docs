---
title: "ERPNext"
description: "Suite ERP open-source complète — comptabilité, inventaire, RH/paie, CRM, production, projets, et un module site web / e-commerce intégré."
---

Suite ERP open-source complète — comptabilité, inventaire, RH/paie, CRM, production, projets, et un module site web / e-commerce intégré.

- **Projet original :** <https://erpnext.com/>
- **Remplace :** **SAP Business One**, **Odoo**, **Oracle NetSuite**
- **Connexion (SSO) :** À activer via l'interface admin — collez les valeurs `OIDC_*` depuis l'onglet Environment une fois.

## Étapes de configuration

1. Cliquez **Deploy**. Le premier démarrage dure 5-10 min — le site est créé, MariaDB initialisé, les apps Python installées. Consultez les logs du conteneur `create-site` dans Dokploy si vous voulez suivre.
2. Visitez votre domaine ERPNext. Connectez-vous avec `Administrator` / `ERPNEXT_ADMIN_PASSWORD` de l'onglet Environment.
3. Complétez l'assistant : nom de société, exercice fiscal, devise, plan comptable.
4. *(Optionnel)* Activez Keycloak SSO : **Integrations** → **Social Login Keys** → **New** → **Provider: OpenID Connect**. Remplissez :
   - **Client ID :** `OIDC_CLIENT_ID` depuis Environment
   - **Client Secret :** `OIDC_CLIENT_SECRET`
   - **Base URL :** `OIDC_ISSUER_URL`
   - Validez. La page de connexion affiche **Login with OpenID Connect**.

**Ressources.** ERPNext est lourd — 10+ conteneurs, minimum ~3 GB RAM + 2 CPUs recommandés. Envisagez un VPS dédié si vous déployez aussi Nextcloud + chat + autres apps en parallèle.

**Montées de version.** Les bumps majeurs (v15 → v16) nécessitent `bench migrate`. Le template laisse `vps.auto-update=patch` sur chaque service : les mises à jour hebdomadaires automatiques restent en v15.x.x — les majeurs sont une action opérateur délibérée, pas une auto-update à 3 h du matin.

## Variables d'environnement

Ces valeurs se trouvent dans l'onglet **Environment** du compose
Dokploy. Les secrets aléatoires sont générés automatiquement au
premier semi du template — vous n'avez pas à les générer vous-même.

| Variable | Valeur par défaut |
|---|---|
| `ERPNEXT_HOSTNAME` | `erp.yourdomain.com` |
| `ERPNEXT_ADMIN_PASSWORD` | _valeur aléatoire auto-générée_ |
| `DB_ROOT_PASSWORD` | _valeur aléatoire auto-générée_ |

## Domaine

- **Service et port :** `frontend:8080`
- **Nom d'hôte :** `erp.yourdomain.com`

Le nom d'hôte est attaché automatiquement au semi du template ;
modifiez-le dans l'onglet **Domains** avant de cliquer Deploy si
vous souhaitez autre chose.

## Fichier compose

Pour référence — c'est ce que le template déploie. **Ne collez ceci
nulle part.** Le compose est semé dans Dokploy automatiquement ; les
ajustements côté client se font dans les onglets Environment et
Domains (décrits plus haut), jamais dans le compose lui-même.

```yaml
# ERPNext — full ERP suite (accounting, inventory, HR, CRM, manufacturing,
# website). Multi-service stack based on the Frappe framework: web
# frontend (nginx) + Python backend + websocket + celery workers +
# scheduler + MariaDB + two Redis instances. Plus two one-shot init
# containers that bootstrap the site on first deploy.
#
# SSO via admin UI post-deploy: sign in as Administrator →
# Integrations → Social Login Keys → Add → OpenID Connect → paste the
# OIDC_* values from the Environment tab.
#
# Heavy: plan for ≥4 GB VPS RAM and 2 CPUs.

x-common: &frappe-env
  SITE_NAME: ${ERPNEXT_HOSTNAME}
  DB_HOST: db
  DB_PORT: "3306"
  REDIS_CACHE: redis-cache:6379
  REDIS_QUEUE: redis-queue:6379

services:
  # One-shot: render common_site_config.json from the env above.
  configurator:
    image: frappe/erpnext:v15.107.0
    restart: "no"
    entrypoint:
      - bash
      - -c
    command:
      # Idempotent: bail early if common_site_config.json already has db_host
      # so a redeploy / host reboot doesn't rewrite the same values.
      - >
        ls -1 apps > sites/apps.txt;
        [[ -n `grep -hs ^ sites/common_site_config.json | jq -r ".db_host // empty"` ]] && echo "configurator: already done" && exit 0;
        bench set-config -g db_host $$DB_HOST;
        bench set-config -gp db_port $$DB_PORT;
        bench set-config -g redis_cache "redis://$$REDIS_CACHE";
        bench set-config -g redis_queue "redis://$$REDIS_QUEUE";
        bench set-config -g redis_socketio "redis://$$REDIS_QUEUE";
        bench set-config -gp socketio_port 9000;
    environment: *frappe-env
    volumes:
      - sites:/home/frappe/frappe-bench/sites
      - logs:/home/frappe/frappe-bench/logs
    depends_on:
      db:
        condition: service_healthy

  # One-shot: create the ERPNext site on first run (idempotent: bench
  # new-site no-ops when the site already exists).
  create-site:
    image: frappe/erpnext:v15.107.0
    restart: "no"
    entrypoint:
      - bash
      - -c
    command:
      - >
        wait-for-it -t 120 db:3306;
        wait-for-it -t 120 redis-cache:6379;
        wait-for-it -t 120 redis-queue:6379;
        until ls sites/common_site_config.json; do sleep 1; done;
        if [ ! -d "sites/${ERPNEXT_HOSTNAME}" ]; then
          bench new-site --mariadb-user-host-login-scope='%'
          --admin-password=${ERPNEXT_ADMIN_PASSWORD}
          --db-root-username=root
          --db-root-password=${DB_ROOT_PASSWORD}
          --install-app erpnext
          --set-default ${ERPNEXT_HOSTNAME};
        fi
    environment:
      <<: *frappe-env
      ERPNEXT_ADMIN_PASSWORD: ${ERPNEXT_ADMIN_PASSWORD}
      DB_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
    volumes:
      - sites:/home/frappe/frappe-bench/sites
      - logs:/home/frappe/frappe-bench/logs
    depends_on:
      - configurator

  backend:
    image: frappe/erpnext:v15.107.0
    restart: unless-stopped
    environment: *frappe-env
    volumes:
      - sites:/home/frappe/frappe-bench/sites
      - logs:/home/frappe/frappe-bench/logs
    depends_on:
      - create-site
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  frontend:
    image: frappe/erpnext:v15.107.0
    restart: unless-stopped
    command: ["nginx-entrypoint.sh"]
    environment:
      BACKEND: backend:8000
      SOCKETIO: websocket:9000
      FRAPPE_SITE_NAME_HEADER: ${ERPNEXT_HOSTNAME}
      UPSTREAM_REAL_IP_ADDRESS: 0.0.0.0/0
      UPSTREAM_REAL_IP_HEADER: X-Forwarded-For
      UPSTREAM_REAL_IP_RECURSIVE: "On"
      PROXY_READ_TIMEOUT: "120"
      CLIENT_MAX_BODY_SIZE: 50m
    volumes:
      - sites:/home/frappe/frappe-bench/sites
      - logs:/home/frappe/frappe-bench/logs
    depends_on:
      - backend
      - websocket
    labels:
      - "vps.auth.mode=public"
      - "vps.auto-update=patch"
    networks:
      dokploy-network:
        aliases:
          - erpnext
      default: {}

  websocket:
    image: frappe/erpnext:v15.107.0
    restart: unless-stopped
    command: ["node", "/home/frappe/frappe-bench/apps/frappe/socketio.js"]
    environment: *frappe-env
    volumes:
      - sites:/home/frappe/frappe-bench/sites
      - logs:/home/frappe/frappe-bench/logs
    depends_on:
      - create-site
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  queue-default:
    image: frappe/erpnext:v15.107.0
    restart: unless-stopped
    command: ["bench", "worker", "--queue", "default"]
    environment: *frappe-env
    volumes:
      - sites:/home/frappe/frappe-bench/sites
      - logs:/home/frappe/frappe-bench/logs
    depends_on:
      - create-site
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  queue-short:
    image: frappe/erpnext:v15.107.0
    restart: unless-stopped
    command: ["bench", "worker", "--queue", "short,default"]
    environment: *frappe-env
    volumes:
      - sites:/home/frappe/frappe-bench/sites
      - logs:/home/frappe/frappe-bench/logs
    depends_on:
      - create-site
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  queue-long:
    image: frappe/erpnext:v15.107.0
    restart: unless-stopped
    command: ["bench", "worker", "--queue", "long,default,short"]
    environment: *frappe-env
    volumes:
      - sites:/home/frappe/frappe-bench/sites
      - logs:/home/frappe/frappe-bench/logs
    depends_on:
      - create-site
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  scheduler:
    image: frappe/erpnext:v15.107.0
    restart: unless-stopped
    command: ["bench", "schedule"]
    environment: *frappe-env
    volumes:
      - sites:/home/frappe/frappe-bench/sites
      - logs:/home/frappe/frappe-bench/logs
    depends_on:
      - create-site
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  db:
    image: mariadb:11.8.6
    restart: unless-stopped
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
      - --skip-character-set-client-handshake
      - --skip-innodb-read-only-compressed
    environment:
      MARIADB_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
    volumes:
      - db-data:/var/lib/mysql
    healthcheck:
      test: ["CMD-SHELL", "mariadb-admin ping -h localhost -u root -p$${MARIADB_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  redis-cache:
    image: redis:8.6.3-alpine3.23
    restart: unless-stopped
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  redis-queue:
    image: redis:8.6.3-alpine3.23
    restart: unless-stopped
    volumes:
      - redis-queue-data:/data
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

volumes:
  sites:
  logs:
  db-data:
  redis-queue-data:

networks:
  dokploy-network:
    external: true
```

---

[← Retour au catalogue des applications pré-configurées](/docs/apps/)
