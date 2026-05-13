---
title: "OnlyOffice"
description: "Collaborative DOCX/XLSX/PPTX editing -- bolts into Nextcloud for real-time co-editing with high MS Office fidelity."
---

Collaborative DOCX/XLSX/PPTX editing -- bolts into Nextcloud for real-time co-editing with high MS Office fidelity.

- **Upstream project:** <https://www.onlyoffice.com/>
- **Replaces:** **Microsoft Office Online**, **Google Docs (as embedded editor)**
- **Sign-in (SSO):** Not applicable -- this template has no user-facing login (server-to-server usage only).

## Setup steps

1. Click **Deploy**. Wait ~1 min for the document server to boot.
2. From the operator dashboard, click the **Wire Nextcloud OnlyOffice** button. The button installs the Nextcloud OnlyOffice app, reads the JWT secret from this template, points the app at this server, and -- if you previously had Collabora wired -- removes the Collabora Nextcloud app cleanly.
3. Open any DOCX/XLSX/PPTX file in Nextcloud. It opens in the embedded OnlyOffice editor.

Switching to Collabora later is one click: stop this OnlyOffice compose, deploy `collabora`, then click the **Wire Nextcloud Collabora** button.

Don't visit the OnlyOffice domain directly in a browser -- it has no UI of its own. Users only ever see it through Nextcloud when they open a document.



## Environment variables

These values live in the Dokploy compose's **Environment** tab. Random
secrets are minted automatically when the template is first seeded --
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

For reference -- this is what the template deploys. **Do not paste this
anywhere.** The compose is seeded into Dokploy automatically; the
client-facing adjustments you make happen in the Environment and
Domains tabs (described above), never in the compose itself.

```yaml
# OnlyOffice Document Server -- collaborative DOCX/XLSX/PPTX editing,
# bolted into Nextcloud via the "ONLYOFFICE" app (admin -> Apps -> search
# ONLYOFFICE -> Install -> settings -> enter the domain below + JWT secret).
#
# Server-to-server auth is JWT-protected (JWT_ENABLED=true). The UI is
# iframe-embedded inside Nextcloud; forward-auth MUST be disabled on
# this route (vps.auth.mode=public) because the iframe would otherwise
# redirect to Keycloak and break the editor.
#
# Don't expose this to end users directly -- they only ever see it
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

[<- Back to all pre-configured apps](/docs/en/apps/)
