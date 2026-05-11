---
title: "Collabora Online (CODE)"
description: "Édition collaborative ODT/DOCX/XLSX/PPTX — s'intègre à Nextcloud pour la co-édition temps réel."
---

Édition collaborative ODT/DOCX/XLSX/PPTX — s'intègre à Nextcloud pour la co-édition temps réel. Basé sur LibreOffice ; plus léger qu'OnlyOffice ; meilleure fidélité pour les formats ODF.

- **Projet original :** <https://www.collaboraonline.com/>
- **Remplace :** **Microsoft Office Online**, **Google Docs (éditeur embarqué)**
- **Connexion (SSO) :** Sans objet — ce template n'a pas de connexion utilisateur (usage serveur-à-serveur uniquement).

## Étapes de configuration

1. Cliquez **Deploy**. Patientez ~30 s le démarrage du serveur d'édition.
2. Depuis le tableau de bord opérateur, cliquez le bouton **Wire Nextcloud Collabora**. Le bouton installe l'application Nextcloud Office, la pointe vers ce serveur, et -- si OnlyOffice était précédemment câblé -- retire proprement l'application Nextcloud OnlyOffice.
3. Ouvrez n'importe quel fichier DOCX/XLSX/PPTX/ODT dans Nextcloud. Il s'ouvre dans l'éditeur Collabora embarqué.

Pour revenir à OnlyOffice plus tard : arrêtez ce conteneur Collabora, déployez `onlyoffice`, puis cliquez le bouton **Wire Nextcloud OnlyOffice**.

N'accédez pas au domaine Collabora directement dans un navigateur — il n'a pas d'interface utilisateur. Les utilisateurs ne le voient qu'à travers Nextcloud.



## Variables d'environnement

Ces valeurs se trouvent dans l'onglet **Environment** du compose
Dokploy. Les secrets aléatoires sont générés automatiquement au
premier semi du template — vous n'avez pas à les générer vous-même.

_(aucune variable d'environnement à configurer)_

## Domaine

- **Service et port :** `collabora:9980`
- **Nom d'hôte :** `office.yourdomain.com`

Le nom d'hôte est attaché automatiquement au semi du template ;
modifiez-le dans l'onglet **Domains** avant de cliquer Deploy si
vous souhaitez autre chose.

## Fichier compose

Pour référence — c'est ce que le template déploie. **Ne collez ceci
nulle part.** Le compose est semé dans Dokploy automatiquement ; les
ajustements côté client se font dans les onglets Environment et
Domains (décrits plus haut), jamais dans le compose lui-même.

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
      # speaks plain HTTP on 9980 inside the dokploy-network. The
      # ssl.termination flag tells coolwsd to emit https:// URLs in
      # its discovery XML even though it itself is listening on http.
      extra_params: --o:ssl.enable=false --o:ssl.termination=true
    labels:
      - "vps.auth.mode=public"
      - "vps.auto-update=patch"
    networks:
      dokploy-network:
        aliases:
          - collabora
      default: {}

networks:
  dokploy-network:
    external: true
```

---

[← Retour au catalogue des applications pré-configurées](./)
