---
title: "Serveur de courriel + webmail"
description: "Courriel auto-hébergé -- stockage des boîtes sur votre VPS (Postfix + Dovecot + Rspamd) avec le webmail Roundcube et l'authentification unique Keycloak."
---

Courriel auto-hébergé -- stockage des boîtes sur votre VPS (Postfix + Dovecot + Rspamd) avec le webmail Roundcube et l'authentification unique Keycloak. L'envoi requiert un relais SMTP via un fournisseur réputé (configuré avant le déploiement) pour éviter le classement en pourriel.

- **Projet original :** <https://docker-mailserver.github.io/>
- **Remplace :** **Google Workspace (Gmail)**, **Microsoft 365 (Exchange Online)**
- **Connexion (SSO) :** Câblé automatiquement -- la convergence de votre opérateur exécute un hook CLI idempotent qui enregistre Keycloak dans l'app à chaque passage. Aucune étape post-déploiement côté client.

## Étapes de configuration

1. **Avant le déploiement -- DNS + relais.** Le courriel nécessite des enregistrements DNS et un relais d'envoi configurés au préalable. Votre contact s'occupe des enregistrements MX, SPF, DKIM, DMARC, DNS inverse, et MTA-STS / TLS-RPT, et colle les identifiants du relais. Voir le guide de l'exploitant.
2. Cliquez **Deploy**. Patientez ~3 minutes pour le premier démarrage (services de courriel + Roundcube).
3. Connectez-vous à votre domaine webmail (`webmail.<votre-domaine>`). La connexion passe par Keycloak -- un seul compte pour toutes les applications de la suite. Aucun mot de passe de courriel distinct.
4. Les boîtes sont créées automatiquement pour vos utilisateurs staff et client depuis Keycloak. Un nouvel utilisateur peut se connecter au webmail dès que son compte existe.

### Fonctionnement de la connexion

Roundcube vous redirige vers Keycloak pour vous connecter, puis accède à votre boîte en votre nom à l'aide d'un jeton d'authentification unique. Vous ne saisissez jamais de mot de passe de courriel distinct, et aucun n'est stocké. Comme cela exige un onglet de navigateur standard, le webmail s'ouvre dans son propre onglet depuis le menu de la suite plutôt qu'intégré dans une autre application.

### Applications de bureau et mobiles

Ce modèle vise le **webmail**. Les clients de bureau classiques (Thunderbird, Apple Mail) et les apps Mail des téléphones ne peuvent pas utiliser l'authentification unique Keycloak avec un serveur auto-hébergé ; ils ne sont donc pas pris en charge ici -- utilisez Roundcube dans le navigateur.

### Pourquoi l'envoi passe par un relais

Envoyer du courriel directement depuis un VPS finit en pourriel : les grands fournisseurs se méfient des nouvelles IP de serveur. L'envoi passe par un fournisseur réputé pour que vos messages soient livrés, tandis que votre boîte et vos données restent sur votre VPS. Ce relais est distinct du courriel de notification de la suite.

### Analyse antipourriel et antivirus

Le courriel entrant est vérifié contre le pourriel (réputation de l'expéditeur, pointage du contenu) et chaque pièce jointe est analysée contre les virus avant d'atteindre votre boîte, la même protection qu'une suite hébergée. L'antivirus est partagé avec Nextcloud lorsque les deux sont déployés, donc les fichiers que vous y téléversez sont analysés par le même moteur.

## Variables d'environnement

Ces valeurs se trouvent dans l'onglet **Environment** du compose
Dokploy. Les secrets aléatoires sont générés automatiquement au
premier semi du template -- vous n'avez pas à les générer vous-même.

| Variable | Valeur par défaut |
|---|---|
| `MAIL_HOSTNAME` | `mail.yourdomain.com` |
| `MAIL_DOMAIN` | `yourdomain.com` |
| `WEBMAIL_HOSTNAME` | `webmail.yourdomain.com` |
| `OIDC_INTROSPECTION_URL` | `https://auth.yourdomain.com/realms/catena/protocol/openid-connect/token/introspect` |
| `RELAY_HOST` | _(à définir avant déploiement)_ |
| `RELAY_PORT` | `587` |
| `RELAY_USER` | _(à définir avant déploiement)_ |
| `RELAY_PASSWORD` | `<your-mailserver_relay_password>` |

## Domaine

- **Service et port :** `roundcube:80`
- **Nom d'hôte :** `webmail.yourdomain.com`

Le nom d'hôte est attaché automatiquement au semi du template ;
modifiez-le dans l'onglet **Domains** avant de cliquer Deploy si
vous souhaitez autre chose.

## Fichier compose

Pour référence -- c'est ce que le template déploie. **Ne collez ceci
nulle part.** Le compose est semé dans Dokploy automatiquement ; les
ajustements côté client se font dans les onglets Environment et
Domains (décrits plus haut), jamais dans le compose lui-même.

```yaml
# Self-hosted mailserver -- docker-mailserver (Postfix + Dovecot + Rspamd)
# + standalone Roundcube webmail, with Keycloak SSO (OAuth2 / XOAUTH2) and
# NO password store.
#
# Mail plane (25/465/587/993) cannot ride the Cloudflare HTTP tunnel, so it
# binds directly to the VPS public IP. Those ports are declared through the
# Catena public-port registry via the `vps.expose.tcp` label -- the host
# reconciler opens them on deploy and closes them on teardown. Roundcube is
# HTTP and rides Traefik + the tunnel like every other app.
#
# Outbound leaves via a RELAY smarthost (operator pastes creds), so the VPS
# IP only RECEIVES on 25 and send-reputation is the relay's job. This relay
# is SEPARATE from the transactional SMTP_* used by Keycloak/Healthchecks.
#
# OPERATOR-WIRED (the ops/ converge owns these; sentinels until then):
#   - OIDC_CLIENT_SECRET + the introspection service-client come from the
#     Keycloak realm (roles/keycloak realm-roundcube.yaml.j2). ENABLE_OAUTH2
#     + OAUTH2_INTROSPECTION_URL point Dovecot/Postfix at Keycloak. The
#     introspection endpoint needs client auth (RFC 7662), so ops drops a
#     dovecot-oauth2.conf.ext into the dms-config volume.
#   - Roundcube's OAuth2 (oauth_*) config is dropped into roundcube-config
#     by ops (the official image has no oauth_* env). Roundcube does its own
#     Keycloak auth-code login and XOAUTH2s to dms -- no password stored.
#   - RELAY_* outbound smarthost creds: operator pastes in the Environment
#     tab.
#   - Mailboxes must pre-exist (OAuth2 only authenticates); dashboard-sync
#     provisions them from Keycloak /staff + /client membership.

services:
  dms:
    image: ghcr.io/docker-mailserver/docker-mailserver:15.1.0
    hostname: ${MAIL_HOSTNAME}
    restart: unless-stopped
    environment:
      # Inbound + storage on this host; outbound relayed.
      POSTMASTER_ADDRESS: postmaster@${MAIL_DOMAIN}
      # TLS via the mounted cert (ops issues + injects it like coturn).
      # Path lives UNDER the mounted mail-config volume so an injected
      # cert survives container recreate (ops mailserver_cert.yml writes
      # here via docker cp + deploy hook).
      SSL_TYPE: manual
      SSL_CERT_PATH: /tmp/docker-mailserver/custom-certs/fullchain.pem
      SSL_KEY_PATH: /tmp/docker-mailserver/custom-certs/privkey.pem
      # Spam via rspamd. ClamAV is NOT the DMS-bundled one: a shared
      # clamd (ops-managed, on the catena-clamav network) is scanned by
      # rspamd over TCP -- see ops rspamd antivirus.conf + force_actions.
      # The same clamd serves Nextcloud, so keep the bundled one off.
      ENABLE_RSPAMD: "1"
      ENABLE_CLAMAV: "0"
      ENABLE_FAIL2BAN: "1"
      # Keycloak SSO: validate access tokens via introspection. The
      # introspection client secret is wired by ops into
      # dovecot-oauth2.conf.ext (RFC 7662 requires caller auth).
      ENABLE_OAUTH2: "1"
      OAUTH2_INTROSPECTION_URL: ${OIDC_INTROSPECTION_URL}
      # Outbound smarthost (separate from transactional SMTP_*).
      RELAY_HOST: ${RELAY_HOST}
      RELAY_PORT: ${RELAY_PORT}
      RELAY_USER: ${RELAY_USER}
      RELAY_PASSWORD: ${RELAY_PASSWORD}
    # Mail plane published directly on the host; opened via the registry.
    ports:
      - "25:25"
      - "465:465"
      - "587:587"
      - "993:993"
    volumes:
      - mail-data:/var/mail
      - mail-state:/var/mail-state
      - mail-logs:/var/log/mail
      # ops drops dovecot-oauth2.conf.ext (introspection creds), DKIM keys,
      # and the TLS cert under here.
      - mail-config:/tmp/docker-mailserver
    cap_add:
      - NET_ADMIN  # fail2ban
    healthcheck:
      test: ["CMD-SHELL", "ss -lntp | grep -E ':(25|993)\\b' || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s
    labels:
      # Mail ports -> public-port registry (host reconciler applies ufw).
      - "vps.expose.tcp=25,465,587,993"
      - "vps.auto-update=patch"
    networks:
      default: {}
      # Shared antivirus: rspamd reaches the ops-managed clamd at
      # clamav:3310 over this dedicated network (also joined by the
      # Nextcloud app service). External so it spans composes.
      catena-clamav: {}

  roundcube:
    image: roundcube/roundcubemail:1.7.1-apache
    restart: unless-stopped
    environment:
      # IMAP/SMTP target = the dms service (implicit TLS).
      ROUNDCUBEMAIL_DEFAULT_HOST: ssl://dms
      ROUNDCUBEMAIL_DEFAULT_PORT: "993"
      ROUNDCUBEMAIL_SMTP_SERVER: tls://dms
      ROUNDCUBEMAIL_SMTP_PORT: "587"
      # SQLite local store (per-mailbox prefs only; mail lives on dms).
      ROUNDCUBEMAIL_DB_TYPE: sqlite
      ROUNDCUBEMAIL_ASPELL_DICTS: en,fr
    volumes:
      - roundcube-db:/var/roundcube/db
      # ops drops oauth.inc.php (Keycloak oauth_provider config) here.
      - roundcube-config:/var/roundcube/config
    depends_on:
      - dms
    healthcheck:
      test: ["CMD-SHELL", "curl -fsS http://localhost/ >/dev/null || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s
    labels:
      # Roundcube does its OWN Keycloak login (not behind oauth2-proxy);
      # public at the proxy layer, OIDC enforced by the app.
      - "vps.auth.mode=public"
      - "vps.auth.oidc=true"
      - "vps.auth.oidc.redirect_uris=https://${WEBMAIL_HOSTNAME}/index.php/login/oauth"
      - "vps.auth.oidc.scopes=openid email profile groups"
      - "vps.auto-update=patch"
    networks:
      catena-network:
        aliases:
          - roundcube
      default: {}

  # MTA-STS policy host. docker-mailserver serves no HTTPS, so this tiny
  # nginx publishes the RFC 8461 policy at
  # mta-sts.<zone>/.well-known/mta-sts.txt. Routed via Traefik + the
  # tunnel like any HTTP app (catalog extra_domains adds the router).
  # The policy is baked from MAIL_HOSTNAME at container start.
  mta-sts:
    image: nginx:1.27-alpine
    restart: unless-stopped
    entrypoint:
      - /bin/sh
      - -ec
      - |
        mkdir -p /usr/share/nginx/html/.well-known
        cat > /usr/share/nginx/html/.well-known/mta-sts.txt <<EOF
        version: STSv1
        mode: enforce
        mx: ${MAIL_HOSTNAME}
        max_age: 604800
        EOF
        cat > /etc/nginx/conf.d/default.conf <<'EOF'
        server {
          listen 80;
          root /usr/share/nginx/html;
          location = /.well-known/mta-sts.txt {
            default_type text/plain;
            add_header Cache-Control "max-age=604800";
          }
          location / { return 404; }
        }
        EOF
        exec nginx -g 'daemon off;'
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost/.well-known/mta-sts.txt >/dev/null || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 10s
    labels:
      - "vps.auth.mode=public"
      - "vps.auto-update=patch"
    networks:
      catena-network:
        aliases:
          - mta-sts
      default: {}

volumes:
  mail-data:
  mail-state:
  mail-logs:
  mail-config:
  roundcube-db:
  roundcube-config:

networks:
  catena-network:
    external: true
  # Shared antivirus network (clamd), created + owned by ops. External
  # so dms here and the Nextcloud app service share one clamd.
  catena-clamav:
    external: true
```

---

[<- Retour au catalogue des applications pré-configurées](/fr/apps/)
