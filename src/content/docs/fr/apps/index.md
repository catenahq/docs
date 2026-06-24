---
title: "Applications pré-configurées à activer"
description: "Catalogue d'applications à un clic que votre opérateur peut amorcer dans Dokploy : auth, réseau, SSO, stockage et SSL pré-configurés."
---

Dokploy est livré avec un projet **Templates** sur votre VPS. Chaque
entrée est une application compose entièrement câblée, à l'état
non-déployé -- authentification, réseau, SSO, stockage et SSL sont
pré-configurés.

Cliquez sur le projet **Templates** dans la barre latérale de Dokploy.
Pour chaque entrée :

- **Cliquez Deploy** -> l'application démarre avec toutes les intégrations actives.
- **Cliquez Delete** -> l'entrée est supprimée et reste supprimée. Une
  ré-exécution de l'installation ne recrée PAS les entrées supprimées.

Si un template ne vous est pas utile, un clic le fait disparaître.

## Templates disponibles

Listés dans l'ordre de déploiement suggéré -- hubs en premier,
intégrations ensuite, indépendants à la fin. Chaque entrée pointe
vers une page de référence complète avec les étapes, les variables
d'environnement, le domaine et le fichier compose.

### 1. Nextcloud -- remplace Google Drive, Dropbox, OneDrive Entreprise
Partage de fichiers et collaboration auto-hébergés -- le hub auquel d'autres templates se connectent. [-> Voir les détails](/fr/apps/nextcloud-s3-oidc/)

### 2. Collabora Online (CODE) -- remplace Microsoft Office Online, Google Docs (éditeur embarqué)
Édition collaborative ODT/DOCX/XLSX/PPTX -- s'intègre à Nextcloud pour la co-édition temps réel. Basé sur LibreOffice ; plus léger qu'OnlyOffice ; meilleure fidélité pour les formats ODF. [-> Voir les détails](/fr/apps/collabora/)

### 3. OnlyOffice -- remplace Microsoft Office Online, Google Docs (éditeur embarqué)
Édition collaborative DOCX/XLSX/PPTX -- s'intègre à Nextcloud pour la co-édition temps réel avec une haute fidélité aux formats MS Office. [-> Voir les détails](/fr/apps/onlyoffice/)

### 4. Rocket.Chat -- remplace Slack, Microsoft Teams, Discord (en usage pro)
Messagerie d'équipe -- canaux, messages directs, partage de fichiers, apps mobiles, appels vidéo. Keycloak SSO pré-câblé. [-> Voir les détails](/fr/apps/rocketchat-oidc/)

### 5. Element / Matrix -- remplace Slack, Microsoft Teams, Signal (en usage pro), Zoom (pour les petits appels de groupe)
Element + serveur Matrix auto-hébergés -- messagerie d'équipe avec chiffrement de bout en bout, voix, visio de groupe (Jitsi embarqué), et entrée SIP par téléphone. Fédération capable mais désactivée par défaut. [-> Voir les détails](/fr/apps/element/)

### 6. DocuSeal -- remplace DocuSign, HelloSign, PandaDoc, Adobe Sign
Application de signature électronique par défaut de la stack (remplace Documenso). Téléversez un PDF, placez les champs de signature, envoyez pour signature. Piste d'audit + génération de PDF signé intégrées. [-> Voir les détails](/fr/apps/docuseal/)

### 7. Outline -- remplace Notion, Confluence, Google Sites
Wiki d'équipe / base de connaissances. Pages façon Notion, collections, documents imbriqués. Keycloak SSO pré-câblé. [-> Voir les détails](/fr/apps/outline/)

### 8. EspoCRM -- remplace Salesforce, HubSpot, Zoho CRM, Pipedrive
CRM par défaut de la stack. Contacts, comptes, opportunités, prospects, calendrier, intégration email, mass mail, automatisation. OIDC natif via un bouton post-déploiement. [-> Voir les détails](/fr/apps/espocrm/)

### 9. Twenty -- remplace Salesforce, HubSpot, Pipedrive
CRM moderne open-source. Contacts, entreprises, opportunités, synchronisation email, pipelines. Alternative à EspoCRM (le CRM par défaut). [-> Voir les détails](/fr/apps/twenty/)

### 10. Plane -- remplace Jira, Linear, Asana, ClickUp
Gestion de projet open-source -- issues, cycles, modules, pages, workspaces. [-> Voir les détails](/fr/apps/plane/)

### 11. Zammad -- remplace Zendesk, Freshdesk, Jira Service Desk
Helpdesk orienté tickets. Email, Telegram, canaux sociaux, SLA, base de connaissances. OIDC natif. [-> Voir les détails](/fr/apps/zammad/)

### 12. Chatwoot -- remplace Intercom, Front, Help Scout (canaux de chat)
Boîte de réception omnicanale orientée conversation. Email, widget de chat, WhatsApp, Facebook, Instagram, Twitter/X en une seule vue. [-> Voir les détails](/fr/apps/chatwoot/)

### 13. WordPress -- remplace Wix, Squarespace, Drupal auto-hébergé
Plateforme CMS / site web public prête pour la production, avec cache FastCGI, cache d'objets Redis et un ensemble de plugins gratuits curatés pré-installés. Le site est accessible anonymement ; la connexion admin sur /wp-admin peut être câblée à Keycloak via un plugin. [-> Voir les détails](/fr/apps/wordpress/)

### 14. n8n -- remplace Zapier, Make (Integromat), Tray.io
Automatisation de flux de travail -- enchaînez visuellement des centaines d'intégrations (APIs, apps, bases de données) en workflows no-code/low-code. [-> Voir les détails](/fr/apps/n8n/)

### 15. ERPNext -- remplace SAP Business One, Odoo, Oracle NetSuite
Suite ERP open-source complète -- comptabilité, inventaire, RH/paie, CRM, production, projets, et un module site web / e-commerce intégré. [-> Voir les détails](/fr/apps/erpnext/)

### 16. Actual Budget -- remplace YNAB (You Need A Budget), Mint, EveryDollar
Finances personnelles auto-hébergées. Budgétisation par enveloppes, synchro bancaire via SimpleFIN ou GoCardless, chiffré de bout en bout. [-> Voir les détails](/fr/apps/actualbudget/)

### 17. Postiz -- remplace Buffer, Hootsuite, Later
Planifier et publier des posts sociaux sur Twitter/X, LinkedIn, Facebook, Instagram, YouTube, TikTok, et d'autres. [-> Voir les détails](/fr/apps/postiz/)

### 18. Easy!Appointments -- remplace Calendly, Acuity, SimplyBook, Setmore
Application de réservation côté client pour un ou plusieurs prestataires (clinique, salon, cours, atelier de réparation). Page de réservation publique ; calendriers du personnel ; rappels courriel + SMS ; export ICS. [-> Voir les détails](/fr/apps/easyappointments/)

### 19. Mautic -- remplace Mailchimp, ActiveCampaign, HubSpot Marketing, Brevo (Sendinblue)
Automatisation marketing open-source. Segments de contacts, campagnes courriel, séquences drip, pages de destination, formulaires, scoring de prospects. Remplace Mailchimp / ActiveCampaign / HubSpot Marketing. [-> Voir les détails](/fr/apps/mautic/)

### 20. Kimai -- remplace Toggl, Clockify, Harvest, TimeCamp
Suivi du temps open-source. Clients, projets, activités, feuilles de temps, équipes multi-utilisateur, facturation à partir du temps suivi. SAML fédère avec Keycloak via l'UI admin post-déploiement. [-> Voir les détails](/fr/apps/kimai/)

### 21. Invoice Ninja -- remplace FreshBooks, QuickBooks (module facturation), Zoho Invoice, Harvest (facturation)
Facturation open-source avec passerelles de paiement Stripe + PayPal, facturation récurrente, suivi des dépenses, portail client pour paiement en ligne. L'auto-hébergement débloque toutes les fonctionnalités Pro + Enterprise. [-> Voir les détails](/fr/apps/invoiceninja/)

### 22. Serveur de courriel + webmail -- remplace Google Workspace (Gmail), Microsoft 365 (Exchange Online)
Courriel auto-hébergé -- stockage des boîtes sur votre VPS (Postfix + Dovecot + Rspamd) avec le webmail Roundcube et l'authentification unique Keycloak. L'envoi requiert un relais SMTP via un fournisseur réputé (configuré avant le déploiement) pour éviter le classement en pourriel. [-> Voir les détails](/fr/apps/mailserver/)

## À propos de la connexion (SSO)

La page de référence de chaque template indique son statut SSO (pré-câblé, via l'UI admin, curl unique, ou non disponible). Les apps sans OIDC natif signifient simplement que chaque utilisateur garde une connexion par app -- l'app reste accessible, sauvegardée, et protégée par son propre écran de connexion. Elle ne participe simplement pas au flux "une connexion pour tout".
