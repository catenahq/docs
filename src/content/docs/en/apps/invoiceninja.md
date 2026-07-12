---
title: "Invoice Ninja"
description: "Open-source invoicing with Stripe + PayPal payment gateways, recurring billing, expense tracking, client portal for online payment."
---

Open-source invoicing with Stripe + PayPal payment gateways, recurring billing, expense tracking, client portal for online payment. Self-hosted gets all Pro + Enterprise features.

- **Upstream project:** <https://www.invoiceninja.com/>
- **Replaces:** **FreshBooks**, **QuickBooks (invoicing module)**, **Zoho Invoice**, **Harvest (invoicing)**
- **Sign-in (SSO):** Enable via the app's admin UI -- paste the `OIDC_*` values from the Environment tab once.

## Setup steps

1. Click **Deploy**. Wait ~2 min for the first boot (Laravel migrations + admin user seeding via `init.sh`).
2. **One-time: generate APP_KEY**. From a shell on your VPS:
   ```
   docker exec $(docker ps --filter name=invoiceninja-app --format '{{.Names}}' | head -1) \
     runuser -u www-data -- php artisan key:generate --show --no-interaction
   ```
   Copy the `base64:...` output. In Portainer: edit the **Environment variables** -> set `INVOICENINJA_APP_KEY` to the copied value, then click **Update the stack** to redeploy.
3. Visit your Invoice Ninja domain. Sign in as `INVOICENINJA_ADMIN_EMAIL` / `INVOICENINJA_ADMIN_PASSWORD` from the Environment tab.
4. Configure your **company profile** (Settings -> Company Details): logo, address, tax IDs (GST/QST for Canada), default currency.
5. Wire **Stripe**: Settings -> Online Payments -> Add Gateway -> Stripe. Paste your Stripe publishable + secret keys. The client portal will accept card payments after this.
6. *(Optional)* Configure SMTP: paste `INVOICENINJA_SMTP_*` in the Environment tab, click Redeploy. Mail send fails silently into the queue until SMTP is wired.

### Invoicing in the Catena suite

Invoice Ninja is the invoicing master in the Catena suite. Hours from Kimai (the time-tracking master) flow into Invoice Ninja invoices via the operator's monthly sync, and paid invoices from Invoice Ninja flow into ERPNext (the accounting master) via the operator's month-end close action. Clients in Invoice Ninja carry an `espo_account_id` custom field so each invoice ties back to the EspoCRM Account.

### License

Invoice Ninja's self-hosted edition ships under the Elastic License 2.0. Two practical implications:
- Hosting Invoice Ninja for your business on your VPS, and your operator hosting it for you and billing for the hosting service, are both explicitly within the license terms.
- Reselling Invoice Ninja as a SaaS product, or bundling it into another SaaS, requires a commercial license from Invoice Ninja LLC. Catena's deployment model is "we deploy onto your VPS; you own the deployment" -- the licensed-and-permitted hosting path.
- The free self-hosted edition shows "Powered by Invoice Ninja" branding on client-facing surfaces. A US$40/year white-label license removes this. Recommended once you're invoicing real clients.

### Authentication

Native OIDC for self-hosted is an open feature request upstream. Until it ships, Invoice Ninja uses local username/password. The Keycloak `staff` group gates access at the Traefik edge via oauth2-proxy before traffic reaches Invoice Ninja, so people outside your staff group cannot reach the login page.

### Payment processing

Invoice Ninja handles the client-payment side. When a client pays via the portal, Stripe processes the card and Invoice Ninja marks the invoice paid + records the payment. The amount is settled into your Stripe account (under your name, your tax ID); Catena does not route payments through any operator-owned account.

### Resource note

Invoice Ninja runs as PHP-FPM + nginx + MariaDB + Redis -- four containers. Plan for ~400 MB RAM at idle, ~800 MB under bulk-invoice generation or queue backlog catch-up. PDF rendering for invoices uses bundled Chromium and spikes briefly during multi-page exports.

## Environment variables

These values are the fields you fill in when deploying the template
from your server's **App Templates** panel (Portainer). Random
secrets are minted automatically when the template is first seeded --
you don't need to generate them yourself.

| Variable | Default |
|---|---|
| `DOMAIN_HOST` | `invoice.yourdomain.com` |
| `INVOICENINJA_HOSTNAME` | `invoice.yourdomain.com` |
| `INVOICENINJA_APP_KEY` | _(set before deploy)_ |
| `INVOICENINJA_ADMIN_EMAIL` | `admin@yourdomain.com` |
| `INVOICENINJA_ADMIN_PASSWORD` | _auto-generated random value_ |
| `DB_PASSWORD` | _auto-generated random value_ |
| `DB_ROOT_PASSWORD` | _auto-generated random value_ |
| `INVOICENINJA_SMTP_HOST` | _(set before deploy)_ |
| `INVOICENINJA_SMTP_PORT` | `587` |
| `INVOICENINJA_SMTP_USERNAME` | _(set before deploy)_ |
| `INVOICENINJA_SMTP_PASSWORD` | _(set before deploy)_ |
| `INVOICENINJA_MAIL_FROM` | `invoice@yourdomain.com` |
| `INVOICENINJA_MAIL_FROM_NAME` | `Invoicing` |

## Domain

- **Service and port:** `nginx:80`
- **Hostname:** `invoice.yourdomain.com`

The hostname is attached automatically when the template is deployed;
talk to your contact before deploying if you want something else.

## Compose file

For reference -- this is what the template deploys. **Do not paste this
anywhere.** The compose is seeded into Portainer automatically; the
client-facing adjustments you make happen in the deploy form's
environment fields (described above), never in the compose itself.

```yaml
# Invoice Ninja -- invoicing + Stripe payments + recurring billing +
# client portal. Picked 2026-05-21 as the invoicing master in the
# Path E composition (EspoCRM -> Kimai -> Invoice Ninja -> ERPNext).
# License: Elastic License 2.0; hosting on third-party infrastructure
# and billing clients for the service is explicitly permitted. Chosen
# over Akaunting (BSL revenue cap) and Crater (stale).
#
# Topology (mirrors upstream github.com/invoiceninja/dockerfiles/debian
# adapted to Catena's MariaDB + 4-service convention):
#   nginx (front door, exposes :80)
#     -> app (php-fpm via fastcgi, supervisord runs queue + scheduler)
#     -> db (mariadb 11.8) + redis (cache + session + queue backend)
#
# Auth: native OIDC for self-hosted is an open feature request
# (github.com/invoiceninja/invoiceninja/issues/10839). Until upstream
# ships it, sso_mode=post-deploy-ui means the operator uses local
# Invoice Ninja credentials; oauth2-proxy at the Traefik edge gates
# access via the Keycloak staff group, so people outside the
# group never reach the Invoice Ninja login page.
#
# Storage layout:
#   app_public  -- /var/www/html/public, served read-only by nginx
#   app_storage -- /var/www/html/storage, Laravel's writable area
#                  (PDF cache, logs, queued attachments)
#   db-data     -- /var/lib/mysql (Catena's standard MariaDB volume name)
#   redis-data  -- /data (Redis AOF/RDB persistence)
#
# APP_KEY: Laravel boots with Application Error 500 if APP_KEY is empty
# or not formatted as base64:<44-char-base64-string>. Portainer App
# Templates have no per-deploy secret generator, and APP_KEY needs a
# valid base64 form, so we cannot pre-generate it in env_defaults.
# Operator generates it once post-deploy via `docker exec` +
# `php artisan key:generate --show`, pastes the base64:... output into
# the Portainer stack env, and updates the stack.
# See setup_steps in catalog.yml.

services:
  app:
    image: invoiceninja/invoiceninja-debian:5
    restart: unless-stopped
    environment:
      APP_ENV: production
      APP_DEBUG: "false"
      APP_KEY: ${INVOICENINJA_APP_KEY}
      APP_URL: https://${INVOICENINJA_HOSTNAME}
      REQUIRE_HTTPS: "true"
      TRUSTED_PROXIES: "*"
      DB_CONNECTION: mysql
      DB_HOST: db
      DB_PORT: "3306"
      DB_DATABASE: invoiceninja
      DB_USERNAME: invoiceninja
      DB_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: redis
      REDIS_PORT: "6379"
      QUEUE_CONNECTION: redis
      CACHE_DRIVER: redis
      SESSION_DRIVER: redis
      # First-run bootstrap: init.sh's ninja:create-account step
      # consumes these to create the initial admin user. After first
      # boot the values are no-ops; the operator can rotate the admin
      # password from the in-app Settings -> Account Management page.
      IN_USER_EMAIL: ${INVOICENINJA_ADMIN_EMAIL}
      IN_PASSWORD: ${INVOICENINJA_ADMIN_PASSWORD}
      # SMTP. Operator pastes managed-relay creds here.
      MAIL_MAILER: smtp
      MAIL_HOST: ${INVOICENINJA_SMTP_HOST}
      MAIL_PORT: ${INVOICENINJA_SMTP_PORT}
      MAIL_USERNAME: ${INVOICENINJA_SMTP_USERNAME}
      MAIL_PASSWORD: ${INVOICENINJA_SMTP_PASSWORD}
      MAIL_ENCRYPTION: tls
      MAIL_FROM_ADDRESS: ${INVOICENINJA_MAIL_FROM}
      MAIL_FROM_NAME: ${INVOICENINJA_MAIL_FROM_NAME}
    volumes:
      - app_public:/var/www/html/public
      - app_storage:/var/www/html/storage
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  nginx:
    image: nginx:1.29.8-alpine
    restart: unless-stopped
    volumes:
      - app_public:/var/www/html/public:ro
      - app_storage:/var/www/html/storage:ro
    configs:
      - source: invoiceninja_nginx_conf
        target: /etc/nginx/conf.d/default.conf
    depends_on:
      app:
        condition: service_started
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
      - "vps.auth.groups=staff"
      - "vps.auto-update=patch"
    networks:
      catena-network:
        aliases:
          - invoiceninja
      default: {}

  db:
    image: mariadb:11.8.6
    restart: unless-stopped
    environment:
      MARIADB_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MARIADB_DATABASE: invoiceninja
      MARIADB_USER: invoiceninja
      MARIADB_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
      interval: 10s
      timeout: 5s
      retries: 10
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

  redis:
    image: redis:7.4.9-alpine
    restart: unless-stopped
    volumes:
      - redis-data:/data
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
  app_public:
  app_storage:
  db-data:
  redis-data:

configs:
  invoiceninja_nginx_conf:
    file: ./invoiceninja-nginx.conf

networks:
  catena-network:
    external: true
```

---

[<- Back to all pre-configured apps](/en/apps/)
