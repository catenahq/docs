---
title: "OnlyOffice"
description: "Édition collaborative DOCX/XLSX/PPTX — s'intègre à Nextcloud pour la co-édition temps réel avec une haute fidélité aux formats MS Office."
---

Édition collaborative DOCX/XLSX/PPTX — s'intègre à Nextcloud pour la co-édition temps réel avec une haute fidélité aux formats MS Office.

- **Projet original :** <https://www.onlyoffice.com/>
- **Remplace :** **Microsoft Office Online**, **Google Docs (éditeur embarqué)**
- **Connexion (SSO) :** Sans objet — ce template n'a pas de connexion utilisateur (usage serveur-à-serveur uniquement).

## Étapes de configuration

1. Cliquez **Deploy**. Patientez ~1 min le démarrage du Document Server.
2. Depuis le tableau de bord opérateur, cliquez le bouton **Wire Nextcloud OnlyOffice**. Le bouton installe l'application Nextcloud OnlyOffice, lit la clé JWT depuis ce template, pointe l'application vers ce serveur, et -- si Collabora était précédemment câblé -- retire proprement l'application Nextcloud Collabora.
3. Ouvrez n'importe quel fichier DOCX/XLSX/PPTX dans Nextcloud. Il s'ouvre dans l'éditeur OnlyOffice embarqué.

Pour passer à Collabora plus tard : arrêtez ce conteneur OnlyOffice, déployez `collabora`, puis cliquez le bouton **Wire Nextcloud Collabora**.

N'accédez pas au domaine OnlyOffice directement dans un navigateur — il n'a pas d'interface utilisateur. Les utilisateurs ne le voient qu'à travers Nextcloud.



## Variables d'environnement

Ces valeurs se trouvent dans l'onglet **Environment** du compose
Dokploy. Les secrets aléatoires sont générés automatiquement au
premier semi du template — vous n'avez pas à les générer vous-même.

| Variable | Valeur par défaut |
|---|---|
| `JWT_SECRET` | _valeur aléatoire auto-générée_ |

## Domaine

- **Service et port :** `documentserver:80`
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

[← Retour au catalogue des applications pré-configurées](/docs/apps/)
