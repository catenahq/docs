---
title: "Collabora Online (CODE)"
description: "Édition collaborative ODT/DOCX/XLSX/PPTX -- s'intègre à Nextcloud pour la co-édition temps réel."
---

Édition collaborative ODT/DOCX/XLSX/PPTX -- s'intègre à Nextcloud pour la co-édition temps réel. Basé sur LibreOffice ; plus léger qu'OnlyOffice ; meilleure fidélité pour les formats ODF.

- **Projet original :** <https://www.collaboraonline.com/>
- **Remplace :** **Microsoft Office Online**, **Google Docs (éditeur embarqué)**
- **Connexion (SSO) :** Sans objet -- ce template n'a pas de connexion utilisateur (usage serveur-à-serveur uniquement).

## Étapes de configuration

1. Cliquez **Deploy**. Patientez ~30 s le démarrage du serveur d'édition.
2. Depuis le tableau de bord opérateur, cliquez le bouton **Wire Nextcloud Collabora**. Le bouton installe l'application Nextcloud Office, la pointe vers ce serveur, et -- si OnlyOffice était précédemment câblé -- retire proprement l'application Nextcloud OnlyOffice.
3. Ouvrez n'importe quel fichier DOCX/XLSX/PPTX/ODT dans Nextcloud. Il s'ouvre dans l'éditeur Collabora embarqué.

Pour revenir à OnlyOffice plus tard : arrêtez ce conteneur Collabora, déployez `onlyoffice`, puis cliquez le bouton **Wire Nextcloud OnlyOffice**.

N'accédez pas au domaine Collabora directement dans un navigateur -- il n'a pas d'interface utilisateur. Les utilisateurs ne le voient qu'à travers Nextcloud.



## Variables d'environnement

Ces valeurs sont les champs à remplir au déploiement du template
depuis le panneau **App Templates** du serveur (Portainer). Les
secrets aléatoires sont générés automatiquement au premier semis du
template : aucun n'est à générer à la main.

| Variable | Valeur par défaut |
|---|---|
| `DOMAIN_HOST` | `office.yourdomain.com` |

## Domaine

- **Service et port :** `collabora:9980`
- **Nom d'hôte :** `office.yourdomain.com`

Le nom d'hôte est attaché automatiquement au déploiement du template.
Un autre nom se convient avant le déploiement, sur demande.

## Fichier compose

Pour référence -- c'est ce que le template déploie. **Ne collez ceci
nulle part.** Le compose est semé dans Portainer automatiquement ; les
ajustements côté client se font dans les champs d'environnement du
formulaire de déploiement (décrits plus haut), jamais dans le compose
lui-même.

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
# The UI is iframe-embedded inside Nextcloud; this route MUST have no
# auth proxy in front of it (vps.auth.mode=public) because the iframe
# would otherwise redirect to Keycloak and break the editor. Browser
# users never visit this domain directly -- they only see it through
# Nextcloud when they open a document.

services:
  collabora:
    image: collabora/code:25.04.9.4.1
    deploy:
      restart_policy:
        condition: any
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
      - "vps.route.host=${DOMAIN_HOST}"
      - "vps.route.port=9980"
      - "vps.route.service=collabora"
      - "vps.auth.mode=public"
      - "vps.auto-update=patch"
      - "vps.app=catena-collabora"
      - "vps.component=collabora"
    networks:
      catena-network:
        aliases:
          - catena-collabora
      default: {}

networks:
  catena-network:
    external: true
```

---

[<- Retour au catalogue des applications pré-configurées](/fr/apps/)
