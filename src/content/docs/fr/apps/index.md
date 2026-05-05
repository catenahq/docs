---
title: "Applications pré-configurées à activer"
description: "Dokploy est livré avec un projet **Templates** sur votre VPS. Chaque"
---

Dokploy est livré avec un projet **Templates** sur votre VPS. Chaque
entrée est une application compose entièrement câblée, à l'état
non-déployé — authentification, réseau, SSO, stockage et SSL sont
pré-configurés.

Cliquez sur le projet **Templates** dans la barre latérale de Dokploy.
Pour chaque entrée :

- **Cliquez Deploy** → l'application démarre avec toutes les intégrations actives.
- **Cliquez Delete** → l'entrée est supprimée et reste supprimée. Une
  ré-exécution de l'installation ne recrée PAS les entrées supprimées.

Si un template ne vous est pas utile, un clic le fait disparaître.

## Templates disponibles

Listés dans l'ordre de déploiement suggéré — hubs en premier,
intégrations ensuite, indépendants à la fin. Chaque entrée pointe
vers une page de référence complète avec les étapes, les variables
d'environnement, le domaine et le fichier compose.

### 1. Nextcloud — remplace Google Drive, Dropbox, OneDrive Entreprise
Partage de fichiers et collaboration auto-hébergés — le hub auquel d'autres templates se connectent. [→ Voir les détails](/nextcloud-s3-oidc/)

### 2. OnlyOffice — remplace Microsoft Office Online, Google Docs (éditeur embarqué)
Édition collaborative DOCX/XLSX/PPTX — s'intègre à Nextcloud pour la co-édition temps réel avec une haute fidélité aux formats MS Office. [→ Voir les détails](/onlyoffice/)

### 3. Rocket.Chat — remplace Slack, Microsoft Teams, Discord (en usage pro)
Messagerie d'équipe — canaux, messages directs, partage de fichiers, apps mobiles, appels vidéo. Keycloak SSO pré-câblé. [→ Voir les détails](/rocketchat-oidc/)

### 4. DocuSeal — remplace DocuSign, HelloSign, PandaDoc, Adobe Sign
Application de signature électronique par défaut de la stack (remplace Documenso). Téléversez un PDF, placez les champs de signature, envoyez pour signature. Piste d'audit + génération de PDF signé intégrées. [→ Voir les détails](/docuseal/)

### 5. Documenso (déprécié) — remplace DocuSign, HelloSign, PandaDoc, Adobe Sign
**DÉPRÉCIÉ** depuis 2026-04-29 — conservé au catalogue le temps de la migration. Les nouveaux déploiements doivent utiliser **DocuSeal**. Signature électronique de documents open-source — téléversez un PDF, placez les champs de signature, envoyez pour signature. Keycloak SSO pré-câblé. [→ Voir les détails](/documenso/)

### 6. Outline — remplace Notion, Confluence, Google Sites
Wiki d'équipe / base de connaissances. Pages façon Notion, collections, documents imbriqués. Keycloak SSO pré-câblé. [→ Voir les détails](/outline/)

### 7. EspoCRM — remplace Salesforce, HubSpot, Zoho CRM, Pipedrive
CRM par défaut de la stack. Contacts, comptes, opportunités, prospects, calendrier, intégration email, mass mail, automatisation. OIDC natif via un bouton post-déploiement. [→ Voir les détails](/espocrm/)

### 8. Twenty — remplace Salesforce, HubSpot, Pipedrive
CRM moderne open-source. Contacts, entreprises, opportunités, synchronisation email, pipelines. Alternative à EspoCRM (le CRM par défaut). [→ Voir les détails](/twenty/)

### 9. Plane — remplace Jira, Linear, Asana, ClickUp
Gestion de projet open-source — issues, cycles, modules, pages, workspaces. [→ Voir les détails](/plane/)

### 10. Zammad — remplace Zendesk, Freshdesk, Jira Service Desk
Helpdesk orienté tickets. Email, Telegram, canaux sociaux, SLA, base de connaissances. OIDC natif. [→ Voir les détails](/zammad/)

### 11. Chatwoot — remplace Intercom, Front, Help Scout (canaux de chat)
Boîte de réception omnicanale orientée conversation. Email, widget de chat, WhatsApp, Facebook, Instagram, Twitter/X en une seule vue. [→ Voir les détails](/chatwoot/)

### 12. WordPress — remplace Wix, Squarespace, Drupal auto-hébergé
Plateforme CMS / site web public prête pour la production, avec cache FastCGI, cache d'objets Redis et un ensemble de plugins gratuits curatés pré-installés. Le site est accessible anonymement ; la connexion admin sur /wp-admin peut être câblée à Keycloak via un plugin. [→ Voir les détails](/wordpress/)

### 13. n8n — remplace Zapier, Make (Integromat), Tray.io
Automatisation de flux de travail — enchaînez visuellement des centaines d'intégrations (APIs, apps, bases de données) en workflows no-code/low-code. [→ Voir les détails](/n8n/)

### 14. ERPNext — remplace SAP Business One, Odoo, Oracle NetSuite
Suite ERP open-source complète — comptabilité, inventaire, RH/paie, CRM, production, projets, et un module site web / e-commerce intégré. [→ Voir les détails](/erpnext/)

### 15. Actual Budget — remplace YNAB (You Need A Budget), Mint, EveryDollar
Finances personnelles auto-hébergées. Budgétisation par enveloppes, synchro bancaire via SimpleFIN ou GoCardless, chiffré de bout en bout. [→ Voir les détails](/actualbudget/)

### 16. Postiz — remplace Buffer, Hootsuite, Later
Planifier et publier des posts sociaux sur Twitter/X, LinkedIn, Facebook, Instagram, YouTube, TikTok, et d'autres. [→ Voir les détails](/postiz/)

## À propos de la connexion (SSO)

La page de référence de chaque template indique son statut SSO (pré-câblé, via l'UI admin, curl unique, ou non disponible). Les apps sans OIDC natif signifient simplement que chaque utilisateur garde une connexion par app — l'app reste accessible, sauvegardée, et protégée par son propre écran de connexion. Elle ne participe simplement pas au flux « une connexion pour tout ».
