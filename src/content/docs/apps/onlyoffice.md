---
title: "OnlyOffice"
description: "Collaborative DOCX/XLSX/PPTX editing — bolts into Nextcloud for real-time co-editing with high MS Office fidelity."
---

Collaborative DOCX/XLSX/PPTX editing — bolts into Nextcloud for real-time co-editing with high MS Office fidelity.

- **Upstream project:** <https://www.onlyoffice.com/>
- **Replaces:** **Microsoft Office Online**, **Google Docs (as embedded editor)**
- **Sign-in (SSO):** Not applicable — this template has no user-facing login (server-to-server usage only).

## Setup steps

1. Click **Deploy**. Wait ~1 min for the document server to boot.
2. Sign in to Nextcloud as admin → **Apps** → search `ONLYOFFICE` → **Install**.
3. **Admin settings** → **ONLYOFFICE**. Set:
   - **Document Editing Service address:** `https://office.<your-domain>`
   - **Secret key (leave blank for unsecure):** paste `JWT_SECRET` from this template's Environment tab
4. Save. Nextcloud now opens DOCX/XLSX/PPTX files in the embedded OnlyOffice editor.

Don't visit the OnlyOffice domain directly in a browser — it has no UI of its own. Users only ever see it through Nextcloud when they open a document.



## Environment variables

These values live in the Dokploy compose's **Environment** tab. Random
secrets are minted automatically when the template is first seeded —
you don't need to generate them yourself.

| Variable | Default |
|---|---|
| `JWT_SECRET` | _auto-generated random value_ |

## Domain

- **Service and port:** `documentserver:80`
- **Hostname:** `office.yourdomain.com`

The hostname is attached automatically when the template is seeded;
change it in the **Domains** tab before clicking Deploy if you want
something else.

## Compose file

For reference — this is what the template deploys. **Do not paste this
anywhere.** The compose is seeded into Dokploy automatically; the
client-facing adjustments you make happen in the Environment and
Domains tabs (described above), never in the compose itself.

```yaml
# OnlyOffice Document Server — collaborative DOCX/XLSX/PPTX editing,
# bolted into Nextcloud via the "ONLYOFFICE" app (admin → Apps → search
# ONLYOFFICE → Install → settings → enter the domain below + JWT secret).
#
# Server-to-server auth is JWT-protected (JWT_ENABLED=true). The UI is
# iframe-embedded inside Nextcloud; forward-auth MUST be disabled on
# this route (vps.auth.mode=public) because the iframe would otherwise
# redirect to Keycloak and break the editor.
#
# Don't expose this to end users directly — they only ever see it
# through Nextcloud.

services:
  documentserver:
    image: onlyoffice/documentserver:9.3.1
    restart: unless-stopped
    environment:
      JWT_ENABLED: "true"
      JWT_SECRET: ${JWT_SECRET}
      JWT_HEADER: Authorization
      JWT_IN_BODY: "true"
      USE_UNAUTHORIZED_STORAGE: "false"
    volumes:
      - ds-data:/var/www/onlyoffice/Data
      - ds-log:/var/log/onlyoffice
      - ds-cache:/var/lib/onlyoffice
      - ds-postgresql:/var/lib/postgresql
      - ds-rabbitmq:/var/lib/rabbitmq
      - ds-redis:/var/lib/redis
    labels:
      - "vps.auth.mode=public"
      - "vps.auto-update=patch"
    networks:
      dokploy-network:
        aliases:
          - onlyoffice
      default: {}

volumes:
  ds-data:
  ds-log:
  ds-cache:
  ds-postgresql:
  ds-rabbitmq:
  ds-redis:

networks:
  dokploy-network:
    external: true
```

---

[← Back to all pre-configured apps](./)
