---
title: "Mail server + webmail"
description: "Self-hosted email -- inbox storage on your VPS (Postfix + Dovecot + Rspamd) with Roundcube webmail and Keycloak single sign-on."
---

Self-hosted email -- inbox storage on your VPS (Postfix + Dovecot + Rspamd) with Roundcube webmail and Keycloak single sign-on. Outbound requires an SMTP relay through a reputable provider (set up before deploy) so messages are not flagged as spam.

- **Upstream project:** <https://docker-mailserver.github.io/>
- **Replaces:** **Google Workspace (Gmail)**, **Microsoft 365 (Exchange Online)**
- **Sign-in (SSO):** Wired automatically -- your operator's converge runs an idempotent CLI hook that registers Keycloak inside the app on every run. Zero post-deploy step on the client side.

## Setup steps

1. **Before deploy -- DNS + relay.** Mail needs DNS records and an outbound relay set up first. Your contact handles the MX, SPF, DKIM, DMARC, and reverse-DNS records and pastes the relay credentials. See the operator runbook.
2. Click **Deploy**. Wait ~3 minutes for the first boot (mail services + Roundcube).
3. Sign in at your webmail domain (`webmail.<your-domain>`). The login goes through Keycloak -- one account for every app in the suite. There is no separate mail password.
4. Mailboxes are created automatically for your staff and client users from Keycloak. A new user can sign in to webmail as soon as their account exists.

### How sign-in works

Roundcube sends you to Keycloak to log in, then connects to your mailbox on your behalf using a single-sign-on token. You never type a separate email password, and nothing stores one. Because this needs a normal browser tab, webmail opens in its own tab from the suite menu rather than embedded inside another app.

### Desktop and phone mail apps

This template targets **webmail**. Standard desktop clients (Thunderbird, Apple Mail) and phone Mail apps cannot use Keycloak single sign-on with a self-hosted server, so they are not supported here -- use Roundcube in the browser.

### Why outbound goes through a relay

Sending mail straight from a VPS lands in spam: large providers distrust new server IPs. Outbound is relayed through a reputable provider so your messages are delivered, while your inbox and data stay on your VPS. This relay is separate from the suite's notification email.

## Environment variables

These values live in the Dokploy compose's **Environment** tab. Random
secrets are minted automatically when the template is first seeded --
you don't need to generate them yourself.

| Variable | Default |
|---|---|
| `MAIL_HOSTNAME` | `mail.yourdomain.com` |
| `MAIL_DOMAIN` | `yourdomain.com` |
| `WEBMAIL_HOSTNAME` | `webmail.yourdomain.com` |
| `OIDC_INTROSPECTION_URL` | `https://auth.yourdomain.com/realms/catena/protocol/openid-connect/token/introspect` |
| `RELAY_HOST` | _(set before deploy)_ |
| `RELAY_PORT` | `587` |
| `RELAY_USER` | _(set before deploy)_ |
| `RELAY_PASSWORD` | `<your-mailserver_relay_password>` |

## Domain

- **Service and port:** `roundcube:80`
- **Hostname:** `webmail.yourdomain.com`

The hostname is attached automatically when the template is seeded;
change it in the **Domains** tab before clicking Deploy if you want
something else.

## Compose file

For reference -- this is what the template deploys. **Do not paste this
anywhere.** The compose is seeded into Dokploy automatically; the
client-facing adjustments you make happen in the Environment and
Domains tabs (described above), never in the compose itself.

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
      # TLS via the mounted cert (ops manages issuance like coturn).
      SSL_TYPE: manual
      SSL_CERT_PATH: /tmp/dms/custom-certs/fullchain.pem
      SSL_KEY_PATH: /tmp/dms/custom-certs/privkey.pem
      # Spam/AV tuned for SMB volume.
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
      dokploy-network:
        aliases:
          - roundcube
      default: {}

volumes:
  mail-data:
  mail-state:
  mail-logs:
  mail-config:
  roundcube-db:
  roundcube-config:

networks:
  dokploy-network:
    external: true
```

---

[<- Back to all pre-configured apps](/en/apps/)
