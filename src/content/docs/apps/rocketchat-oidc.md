---
title: "Rocket.Chat"
description: "Team chat — channels, direct messages, file sharing, mobile apps, and video calls. Keycloak SSO pre-wired."
---

Team chat — channels, direct messages, file sharing, mobile apps, and video calls. Keycloak SSO pre-wired.

- **Upstream project:** <https://www.rocket.chat/>
- **Replaces:** **Slack**, **Microsoft Teams**, **Discord (for work)**
- **Sign-in (SSO):** Pre-wired — the login page shows 'Sign in with Keycloak' out of the box, no post-deploy step.

## Setup steps

1. Click **Deploy**. Nothing to fill in the Environment tab unless you want a different hostname.
2. Wait ~5 minutes for the first sync. The login page will show **Sign in with Keycloak**.
3. Sign in. The first user becomes the workspace admin.
4. *(Optional, ~30 s)* Attach Nextcloud files in chats: Administration → Apps → Marketplace → search `Nextcloud` → install → set your Nextcloud domain in the app settings. Users can then type `/nextcloud` in any chat to browse and attach files.

### Mobile apps

Rocket.Chat's iOS and Android apps connect straight to your server. Users paste `https://chat.<your-domain>` into the app on first launch and sign in via Keycloak.

## Environment variables

These values live in the Dokploy compose's **Environment** tab. Random
secrets are minted automatically when the template is first seeded —
you don't need to generate them yourself.

| Variable | Default |
|---|---|
| `ROCKETCHAT_HOSTNAME` | `chat.yourdomain.com` |
| `OIDC_BASE_URL` | `https://auth.yourdomain.com` |

## Domain

- **Service and port:** `rocketchat:3000`
- **Hostname:** `chat.yourdomain.com`

The hostname is attached automatically when the template is seeded;
change it in the **Domains** tab before clicking Deploy if you want
something else.

## Compose file

For reference — this is what the template deploys. **Do not paste this
anywhere.** The compose is seeded into Dokploy automatically; the
client-facing adjustments you make happen in the Environment and
Domains tabs (described above), never in the compose itself.

```yaml
# Rocket.Chat — team chat + Keycloak SSO.
#
# All values come from the Environment tab. Sign-in with Keycloak
# is pre-wired via OVERWRITE_SETTING_* env vars; no admin-UI steps
# needed after deploy (unlike Nextcloud's user_oidc which needs the
# DB-stored config).

services:
  mongodb:
    image: mongo:7.0.31
    restart: unless-stopped
    # Rocket.Chat tails the oplog, which requires a replica set. Starting
    # mongod with --replSet enables the rs; the healthcheck calls
    # rs.initiate() on first boot (idempotent: subsequent runs hit the
    # catch branch and just report status). Single-node rs is fine for
    # small SMB deployments.
    command: ["mongod", "--replSet", "rs0", "--bind_ip_all", "--oplogSize", "128"]
    healthcheck:
      test: |
        mongosh --quiet --eval "
          try { rs.status().ok }
          catch (e) {
            rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'mongodb:27017'}]}).ok
          }
        "
      interval: 10s
      start_period: 30s
      timeout: 10s
      retries: 5
    volumes:
      - mongodb-data:/data/db
      - mongodb-config:/data/configdb
    labels:
      - "vps.auto-update=patch"
    networks:
      default:
        aliases:
          - mongodb

  rocketchat:
    image: docker.io/rocketchat/rocket.chat:8.3.2
    restart: unless-stopped
    environment:
      ROOT_URL: https://${ROCKETCHAT_HOSTNAME}
      PORT: "3000"
      MONGO_URL: mongodb://mongodb:27017/rocketchat?replicaSet=rs0
      MONGO_OPLOG_URL: mongodb://mongodb:27017/local?replicaSet=rs0
      DEPLOY_METHOD: docker

      # Keycloak OIDC, wired via OVERWRITE_SETTING_* env vars. Rocket.Chat
      # reads these on boot and writes them into its Settings collection,
      # overriding any admin-UI changes — lets us ship a working SSO out of
      # the box without a post-deploy config step. To take manual control
      # after deploy, remove the relevant OVERWRITE_SETTING_* line here.
      OVERWRITE_SETTING_Accounts_OAuth_Custom-keycloak: "true"
      OVERWRITE_SETTING_Accounts_OAuth_Custom-keycloak-url: ${OIDC_BASE_URL}
      OVERWRITE_SETTING_Accounts_OAuth_Custom-keycloak-authorize_path: "/realms/vps/protocol/openid-connect/auth"
      OVERWRITE_SETTING_Accounts_OAuth_Custom-keycloak-token_path: "/realms/vps/protocol/openid-connect/token"
      OVERWRITE_SETTING_Accounts_OAuth_Custom-keycloak-identity_path: "/realms/vps/protocol/openid-connect/userinfo"
      OVERWRITE_SETTING_Accounts_OAuth_Custom-keycloak-scope: "openid email profile groups"
      OVERWRITE_SETTING_Accounts_OAuth_Custom-keycloak-id: ${OIDC_CLIENT_ID}
      OVERWRITE_SETTING_Accounts_OAuth_Custom-keycloak-secret: ${OIDC_CLIENT_SECRET}
      OVERWRITE_SETTING_Accounts_OAuth_Custom-keycloak-login_style: "redirect"
      OVERWRITE_SETTING_Accounts_OAuth_Custom-keycloak-button_label_text: "Sign in with Keycloak"
      OVERWRITE_SETTING_Accounts_OAuth_Custom-keycloak-username_field: "preferred_username"
      OVERWRITE_SETTING_Accounts_OAuth_Custom-keycloak-email_field: "email"
      OVERWRITE_SETTING_Accounts_OAuth_Custom-keycloak-name_field: "name"
      OVERWRITE_SETTING_Accounts_OAuth_Custom-keycloak-groups_claim: "groups"
      OVERWRITE_SETTING_Accounts_OAuth_Custom-keycloak-merge_users: "true"
    depends_on:
      mongodb:
        condition: service_healthy
    labels:
      - "vps.auth.mode=public"
      - "vps.auth.oidc=true"
      - "vps.auth.groups=client-staff"
      - "vps.auth.oidc.redirect_uris=https://${ROCKETCHAT_HOSTNAME}/_oauth/keycloak"
      - "vps.auth.oidc.scopes=openid email profile groups"
      - "vps.auto-update=patch"
    networks:
      dokploy-network:
        aliases:
          - rocketchat
      default: {}

volumes:
  mongodb-data:
  mongodb-config:

networks:
  dokploy-network:
    external: true
```

---

[← Back to all pre-configured apps](./)
