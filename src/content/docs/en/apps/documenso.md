---
title: "Documenso (deprecated)"
description: "**DEPRECATED** as of 2026-04-29 -- kept in catalog for the migration window. New deploys should use **DocuSeal** instead."
---

**DEPRECATED** as of 2026-04-29 -- kept in catalog for the migration window. New deploys should use **DocuSeal** instead. Open-source document signing -- upload a PDF, place signature fields, send for signature. Keycloak SSO pre-wired.

- **Upstream project:** <https://documenso.com/>
- **Replaces:** **DocuSign**, **HelloSign**, **PandaDoc**, **Adobe Sign**
- **Sign-in (SSO):** Pre-wired -- the login page shows 'Sign in with Keycloak' out of the box, no post-deploy step.

## Setup steps

> **Deprecated:** new deploys should use **DocuSeal** at `sign.<your-domain>`. This entry is retained at `sign-legacy.<your-domain>` for the migration window. To migrate, deploy DocuSeal, recreate your templates there, then delete this Documenso compose.

1. Click **Deploy**. Environment defaults are pre-filled; the first boot mints a self-signed signing certificate automatically (~30 s).
2. Visit your Documenso domain -> click **Sign in with Keycloak**. The first user to sign in becomes the team admin.
3. *(Optional)* Replace the auto-generated signing certificate with one issued by a trusted Certificate Authority for legally-binding signatures. Until then, signed PDFs render correctly but Adobe / Acrobat / browsers will mark the signature as "issued by an untrusted root." Contact your operator to install a real cert into the `documenso-signing` Docker volume.

### Self-signed cert vs trusted-CA cert

The first deploy mints a 10-year self-signed PKCS12 cert so
Documenso starts out of the box. Documents you sign with this
cert are cryptographically valid (the math works) but the
signing identity is **your VPS hostname**, not your business
identity, and Adobe Acrobat / browsers display a yellow
warning banner ("not from a trusted root CA") on every
verification.

For internal-only workflows (HR forms, vendor intake, NDAs
between parties who already trust each other), the self-
signed cert is fine. For client-facing signed contracts,
contact your operator to install a CA-issued cert. The
upgrade is non-disruptive -- replace `cert.p12` in the
`documenso-signing` volume, restart the Documenso container.

### SMTP

Without SMTP configured, signature-request emails are not
sent. Recipients still see pending requests in their
Documenso dashboard if they sign in. To enable email, fill
the `SMTP_*` env vars (your transactional-email provider's
documentation has the host/port/credentials).

## Environment variables

These values live in the Dokploy compose's **Environment** tab. Random
secrets are minted automatically when the template is first seeded --
you don't need to generate them yourself.

| Variable | Default |
|---|---|
| `DOCUMENSO_HOSTNAME` | `sign.yourdomain.com` |
| `NEXTAUTH_SECRET` | _auto-generated random value_ |
| `DB_PASSWORD` | _auto-generated random value_ |
| `SIGNING_PASSPHRASE` | _auto-generated random value_ |
| `SMTP_TRANSPORT` | _(set before deploy)_ |
| `SMTP_HOST` | _(set before deploy)_ |
| `SMTP_PORT` | `587` |
| `SMTP_USERNAME` | _(set before deploy)_ |
| `SMTP_PASSWORD` | _(set before deploy)_ |
| `SMTP_FROM_NAME` | `Documenso` |
| `SMTP_FROM_ADDRESS` | _(set before deploy)_ |

## Domain

- **Service and port:** `documenso:3000`
- **Hostname:** `sign-legacy.yourdomain.com`

The hostname is attached automatically when the template is seeded;
change it in the **Domains** tab before clicking Deploy if you want
something else.

## Compose file

For reference -- this is what the template deploys. **Do not paste this
anywhere.** The compose is seeded into Dokploy automatically; the
client-facing adjustments you make happen in the Environment and
Domains tabs (described above), never in the compose itself.

```yaml
# DEPRECATED 2026-04-29 (F5a). New deploys should use DocuSeal instead;
# this file is kept in tree for the migration window so existing
# clients can continue running Documenso until they cut over. The
# catalog entry's setup_steps section also surfaces the deprecation.
#
# Documenso -- open-source document signing (DocuSign / HelloSign / PandaDoc
# replacement). Keycloak SSO pre-wired via env-based OIDC; the operator's
# automation mints the realm client + populates OIDC_* env on first
# converge.
#
# Signing certificate: an init container generates a self-signed PKCS12
# cert at first boot so "click Deploy" works out of the box. For
# legally-binding signatures, ask your operator to install a CA-issued
# cert into the signing volume; upstream's signing-cert docs are at
# https://docs.documenso.com/developers/local-development/signing-certificate
# for the volume layout.

services:
  cert-init:
    # One-shot init: if the signing cert volume is empty, mint a
    # self-signed PKCS12 cert with a known passphrase. Idempotent --
    # exits 0 immediately if /signing/cert.p12 already exists, so an
    # operator who replaced the cert with a real CA-issued one is not
    # overwritten.
    image: alpine:3.23
    restart: "no"
    command: >-
      sh -c "set -eu;
      if [ -f /signing/cert.p12 ]; then
        echo 'cert.p12 already present, skipping mint';
        exit 0;
      fi;
      apk add --no-cache openssl > /dev/null;
      openssl req -x509 -newkey rsa:4096 -keyout /tmp/key.pem -out /tmp/cert.pem
        -days 3650 -nodes -subj '/CN=${DOCUMENSO_HOSTNAME}'
        -addext 'keyUsage=digitalSignature,nonRepudiation' > /dev/null 2>&1;
      openssl pkcs12 -export -out /signing/cert.p12 -inkey /tmp/key.pem
        -in /tmp/cert.pem -passout pass:${SIGNING_PASSPHRASE} > /dev/null 2>&1;
      chmod 600 /signing/cert.p12;
      echo 'self-signed cert.p12 minted at /signing/cert.p12';"
    volumes:
      - documenso-signing:/signing
    networks:
      - default

  documenso:
    image: documenso/documenso:v2.10.1
    restart: unless-stopped
    environment:
      PORT: "3000"
      NEXTAUTH_URL: https://${DOCUMENSO_HOSTNAME}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXT_PUBLIC_WEBAPP_URL: https://${DOCUMENSO_HOSTNAME}
      NEXT_PUBLIC_UPLOAD_TRANSPORT: database
      NEXT_PRIVATE_DATABASE_URL: postgres://documenso:${DB_PASSWORD}@db:5432/documenso
      NEXT_PRIVATE_DIRECT_DATABASE_URL: postgres://documenso:${DB_PASSWORD}@db:5432/documenso
      NEXT_PRIVATE_SIGNING_TRANSPORT: local
      NEXT_PRIVATE_SIGNING_LOCAL_FILE_PATH: /opt/documenso/cert.p12
      NEXT_PRIVATE_SIGNING_PASSPHRASE: ${SIGNING_PASSPHRASE}

      # Keycloak OIDC -- populated by dashboard-sync after first deploy.
      # Documenso's own env-var names are NEXT_PRIVATE_OIDC_*; we
      # remap from the generic OIDC_* keys dashboard-sync writes into
      # Dokploy's env, matching the pattern in outline.compose.yml.
      NEXT_PRIVATE_OIDC_WELL_KNOWN: ${OIDC_DISCOVERY_URL}
      NEXT_PRIVATE_OIDC_CLIENT_ID: ${OIDC_CLIENT_ID}
      NEXT_PRIVATE_OIDC_CLIENT_SECRET: ${OIDC_CLIENT_SECRET}
      NEXT_PRIVATE_OIDC_PROVIDER_LABEL: Keycloak
      NEXT_PRIVATE_OIDC_ALLOW_SIGNUP: "true"

      # SMTP -- Documenso uses NEXT_PRIVATE_SMTP_* names. Optional;
      # when unset, in-app invitations and signature requests do not
      # email users (they still appear in the dashboard for a
      # logged-in user to act on, just no email).
      NEXT_PRIVATE_SMTP_TRANSPORT: ${SMTP_TRANSPORT:-}
      NEXT_PRIVATE_SMTP_HOST: ${SMTP_HOST:-}
      NEXT_PRIVATE_SMTP_PORT: ${SMTP_PORT:-587}
      NEXT_PRIVATE_SMTP_USERNAME: ${SMTP_USERNAME:-}
      NEXT_PRIVATE_SMTP_PASSWORD: ${SMTP_PASSWORD:-}
      NEXT_PRIVATE_SMTP_FROM_NAME: ${SMTP_FROM_NAME:-Documenso}
      NEXT_PRIVATE_SMTP_FROM_ADDRESS: ${SMTP_FROM_ADDRESS:-}
    volumes:
      - documenso-signing:/opt/documenso:ro
    depends_on:
      db:
        condition: service_healthy
      cert-init:
        condition: service_completed_successfully
    labels:
      - "vps.auth.mode=public"
      - "vps.auth.oidc=true"
      - "vps.auth.groups=client-staff"
      - "vps.auth.oidc.redirect_uris=https://${DOCUMENSO_HOSTNAME}/api/auth/callback/oidc"
      - "vps.auth.oidc.scopes=openid email profile"
      - "vps.auto-update=patch"
    networks:
      dokploy-network:
        aliases:
          - documenso
      default: {}

  db:
    image: postgres:16.13-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: documenso
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: documenso
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U documenso"]
      interval: 10s
      timeout: 5s
      retries: 5
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

volumes:
  documenso-signing:
  db-data:

networks:
  dokploy-network:
    external: true
```

---

[<- Back to all pre-configured apps](/en/apps/)
