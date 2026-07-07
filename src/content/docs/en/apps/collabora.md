---
title: "Collabora Online (CODE)"
description: "Collaborative ODT/DOCX/XLSX/PPTX editing -- bolts into Nextcloud for real-time co-editing."
---

Collaborative ODT/DOCX/XLSX/PPTX editing -- bolts into Nextcloud for real-time co-editing. LibreOffice-based; lighter than OnlyOffice; better fidelity for ODF formats.

- **Upstream project:** <https://www.collaboraonline.com/>
- **Replaces:** **Microsoft Office Online**, **Google Docs (as embedded editor)**
- **Sign-in (SSO):** Not applicable -- this template has no user-facing login (server-to-server usage only).

## Setup steps

1. Click **Deploy**. Wait ~30 s for the document server to boot.
2. From the operator dashboard, click the **Wire Nextcloud Collabora** button. The button installs the Nextcloud Office app, points it at this server, and -- if you previously had OnlyOffice wired -- removes the OnlyOffice Nextcloud app cleanly.
3. Open any DOCX/XLSX/PPTX/ODT file in Nextcloud. It opens in the embedded Collabora editor.

Switching back to OnlyOffice later is one click: stop this Collabora compose, deploy `onlyoffice`, then click the **Wire Nextcloud OnlyOffice** button.

Don't visit the Collabora domain directly in a browser -- it has no UI of its own. Users only ever see it through Nextcloud when they open a document.



## Environment variables

These values live in the Dokploy compose's **Environment** tab. Random
secrets are minted automatically when the template is first seeded --
you don't need to generate them yourself.

_(no environment variables to configure)_

## Domain

- **Service and port:** `collabora:9980`
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
# Collabora CODE -- collaborative editing for ODT/DOCX/XLSX/PPTX,
# bolted into Nextcloud via the "Nextcloud Office" app (richdocuments).
# Lighter alternative to OnlyOffice; better fidelity for ODF formats,
# acceptable fidelity for MS Office formats.
#
# Server-to-server auth uses Collabora's WOPI host allow-list (the
# `domain` env), not a JWT. Any WOPI host whose FQDN matches the regex
# below is allowed; we restrict to `nextcloud.*` because each catena
# VPS has at most one Nextcloud and that label is reserved.
#
# The UI is iframe-embedded inside Nextcloud; forward-auth MUST be
# disabled on this route (vps.auth.mode=public) because the iframe
# would otherwise redirect to Keycloak and break the editor. Browser
# users never visit this domain directly -- they only see it through
# Nextcloud when they open a document.

services:
  collabora:
    image: collabora/code:25.04.9.4.1
    restart: unless-stopped
    environment:
      # Regex of WOPI hosts allowed to use this CODE instance. The
      # `nextcloud\..*` pattern matches any `nextcloud.<zone>` FQDN;
      # one Nextcloud per VPS makes this precise enough.
      domain: 'nextcloud\..*'
      # Traefik (Cloudflare Tunnel upstream) terminates TLS; coolwsd
      # speaks plain HTTP on 9980 inside the catena-network. The
      # ssl.termination flag tells coolwsd to emit https:// URLs in
      # its discovery XML even though it itself is listening on http.
      extra_params: --o:ssl.enable=false --o:ssl.termination=true
    labels:
      - "vps.auth.mode=public"
      - "vps.auto-update=patch"
    networks:
      catena-network:
        aliases:
          - collabora
      default: {}

networks:
  catena-network:
    external: true
```

---

[<- Back to all pre-configured apps](/en/apps/)
