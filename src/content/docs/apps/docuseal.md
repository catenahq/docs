---
title: "DocuSeal"
description: "Default document-signing app in the suite (replaces Documenso). Upload a PDF, place signature fields, send for signature."
---

Default document-signing app in the suite (replaces Documenso). Upload a PDF, place signature fields, send for signature. Audit trail + signed-PDF generation built-in.

- **Upstream project:** <https://www.docuseal.com/>
- **Replaces:** **DocuSign**, **HelloSign**, **PandaDoc**, **Adobe Sign**
- **Sign-in (SSO):** Enable via the app's admin UI — paste the `OIDC_*` values from the Environment tab once.

## Setup steps

1. Click **Deploy**. Wait ~1 min for the first boot.
2. Visit your DocuSeal domain and complete the first-run wizard (creates the initial admin account).
3. *(Optional)* Enable Keycloak SSO: **Settings** → **SSO** → choose **OpenID Connect** → paste:
   - **Client ID:** `OIDC_CLIENT_ID` from Environment (`docuseal`)
   - **Client Secret:** `OIDC_CLIENT_SECRET` from Environment (ask your operator to mint one in Keycloak if blank)
   - **Issuer URL:** `OIDC_ISSUER_URL`
   - Save. The login page gains a **Sign in with Keycloak** button. Local admin login keeps working as a break-glass.
4. *(Optional)* Configure SMTP for signature-request emails: fill `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM_ADDRESS` in the Environment tab and redeploy. Without SMTP, recipients only see pending requests in their DocuSeal dashboard.

### Why DocuSeal is the default

DocuSeal supersedes Documenso (still in the catalog under a deprecation banner). Faster boot, simpler signing-cert handling (no PKCS12 mint step on first deploy), and a maintained iOS/Android app. Documenso remains in catalog while existing clients migrate.

### Signing certificate

DocuSeal generates signed PDFs out of the box without a separate signing-cert mint step. Adobe Acrobat shows the signature as cryptographically valid but with a "self-signed root" warning by default — same caveat as Documenso. For legally-binding signatures, contact your operator to install a CA-issued cert via DocuSeal's admin UI (Settings → Signature → Certificates).

### SMTP

Without SMTP configured, signature-request emails are not delivered. Recipients still see pending requests in their dashboard. To enable email, fill the `SMTP_*` env vars in the Environment tab.

## Environment variables

These values live in the Dokploy compose's **Environment** tab. Random
secrets are minted automatically when the template is first seeded —
you don't need to generate them yourself.

| Variable | Default |
|---|---|
| `DOCUSEAL_HOSTNAME` | `sign.yourdomain.com` |
| `SECRET_KEY_BASE` | _auto-generated random value_ |
| `DB_PASSWORD` | _auto-generated random value_ |
| `SMTP_HOST` | _(set before deploy)_ |
| `SMTP_PORT` | `587` |
| `SMTP_USERNAME` | _(set before deploy)_ |
| `SMTP_PASSWORD` | _(set before deploy)_ |
| `SMTP_FROM_ADDRESS` | _(set before deploy)_ |
| `SMTP_AUTH` | `plain` |
| `OIDC_CLIENT_ID` | `docuseal` |
| `OIDC_CLIENT_SECRET` | _(set before deploy)_ |
| `OIDC_ISSUER_URL` | `https://auth.yourdomain.com/realms/catena` |

## Domain

- **Service and port:** `docuseal:3000`
- **Hostname:** `sign.yourdomain.com`

The hostname is attached automatically when the template is seeded;
change it in the **Domains** tab before clicking Deploy if you want
something else.

## Compose file

For reference — this is what the template deploys. **Do not paste this
anywhere.** The compose is seeded into Dokploy automatically; the
client-facing adjustments you make happen in the Environment and
Domains tabs (described above), never in the compose itself.

```yaml
# DocuSeal -- open-source document signing. Replaces Documenso in this
# stack as of 2026-04-29 (F5a decision); Documenso is kept in catalog
# under a deprecation banner for the migration window.
#
# Auth: DocuSeal community edition has admin-UI SSO config (Settings ->
# SSO). Marked sso_mode=post-deploy-ui in the catalog -- after first
# deploy, an admin pastes OIDC_* values from the Environment tab into
# the SSO settings page. The local admin login keeps working as a
# break-glass.
#
# Storage: docuseal-data holds uploaded PDFs, signature images, and
# generated signed PDFs. Picked up by restic via /var/lib/docker/volumes.
# Postgres holds metadata + audit trail.

services:
  docuseal:
    image: docuseal/docuseal:1.8.4
    restart: unless-stopped
    environment:
      HOST: https://${DOCUSEAL_HOSTNAME}
      FORCE_SSL: "true"
      DATABASE_URL: postgres://docuseal:${DB_PASSWORD}@db:5432/docuseal
      SECRET_KEY_BASE: ${SECRET_KEY_BASE}

      # SMTP -- DocuSeal uses SMTP_* env vars. Optional; when unset,
      # signature-request emails are not delivered (recipients still
      # see pending requests in their dashboard if they sign in).
      SMTP_ADDRESS: ${SMTP_HOST:-}
      SMTP_PORT: ${SMTP_PORT:-587}
      SMTP_USERNAME: ${SMTP_USERNAME:-}
      SMTP_PASSWORD: ${SMTP_PASSWORD:-}
      SMTP_FROM: ${SMTP_FROM_ADDRESS:-}
      SMTP_AUTHENTICATION: ${SMTP_AUTH:-plain}

      # Exposed for operator reference (Settings -> SSO) but not
      # consumed by DocuSeal directly at boot. Operator pastes these
      # in the admin UI once after first sign-in.
      OIDC_CLIENT_ID: ${OIDC_CLIENT_ID}
      OIDC_CLIENT_SECRET: ${OIDC_CLIENT_SECRET}
      OIDC_ISSUER_URL: ${OIDC_ISSUER_URL}
    volumes:
      - docuseal-data:/data
    depends_on:
      db:
        condition: service_healthy
    labels:
      - "vps.auth.mode=public"
      - "vps.auth.oidc=true"
      - "vps.auth.groups=client-staff"
      - "vps.auth.oidc.redirect_uris=https://${DOCUSEAL_HOSTNAME}/users/auth/openid_connect/callback"
      - "vps.auth.oidc.scopes=openid email profile"
      - "vps.auto-update=patch"
    networks:
      dokploy-network:
        aliases:
          - docuseal
      default: {}

  db:
    image: postgres:16.13-alpine3.22
    restart: unless-stopped
    environment:
      POSTGRES_USER: docuseal
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: docuseal
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U docuseal"]
      interval: 10s
      timeout: 5s
      retries: 5
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

volumes:
  docuseal-data:
  db-data:

networks:
  dokploy-network:
    external: true
```

---

[← Back to all pre-configured apps](./)
