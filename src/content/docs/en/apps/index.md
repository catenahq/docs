---
title: "Pre-configured apps you can enable"
description: "Catalog of one-click apps available in your server's Portainer panel: each is fully wired (auth, networking, SSO, storage, SSL)."
---

Your server's **Portainer** panel includes an **App Templates**
catalog. Each entry is a fully-wired application -- authentication,
networking, SSO hooks, storage, and SSL are pre-configured.

Open **App Templates** in Portainer's sidebar. For each entry:

- **Click Deploy** -> the app starts with all integrations active.
- To remove an app later, delete it from Portainer's **Stacks** view.
  It stays removed; nothing reinstalls it without you.

If a template isn't useful for you, it simply stays un-deployed.

## Available templates

Listed in suggested deployment order -- hubs first, integrations next,
independents last. Each entry links to a full reference page with the
setup steps, environment variables, domain, and compose file.

### 1. Nextcloud -- replaces Google Drive, Dropbox, OneDrive for Business
Self-hosted file sharing and collaboration -- the file hub that other templates plug into. [-> Full details](/en/apps/nextcloud-s3-oidc/)

### 2. Collabora Online (CODE) -- replaces Microsoft Office Online, Google Docs (as embedded editor)
Collaborative ODT/DOCX/XLSX/PPTX editing -- bolts into Nextcloud for real-time co-editing. LibreOffice-based; lighter than OnlyOffice; better fidelity for ODF formats. [-> Full details](/en/apps/collabora/)

### 3. OnlyOffice -- replaces Microsoft Office Online, Google Docs (as embedded editor)
Collaborative DOCX/XLSX/PPTX editing -- bolts into Nextcloud for real-time co-editing with high MS Office fidelity. [-> Full details](/en/apps/onlyoffice/)

### 4. Rocket.Chat -- replaces Slack, Microsoft Teams, Discord (for work)
Team chat -- channels, direct messages, file sharing, mobile apps, and video calls. Keycloak SSO pre-wired. [-> Full details](/en/apps/rocketchat-oidc/)

### 5. Element / Matrix -- replaces Slack, Microsoft Teams, Signal (for team use), Zoom (for small group calls)
Self-hosted Element + Matrix homeserver -- federated-capable team chat with end-to-end encryption, voice, group video (bundled Jitsi), and SIP dial-in. [-> Full details](/en/apps/element/)

### 6. DocuSeal -- replaces DocuSign, HelloSign, PandaDoc, Adobe Sign
Default document-signing app in the stack (replaces Documenso). Upload a PDF, place signature fields, send for signature. Audit trail + signed-PDF generation built-in. [-> Full details](/en/apps/docuseal/)

### 7. Outline -- replaces Notion, Confluence, Google Sites
Team wiki / knowledge base. Notion-style pages, collections, nested docs. Keycloak SSO pre-wired. [-> Full details](/en/apps/outline/)

### 8. EspoCRM -- replaces Salesforce, HubSpot, Zoho CRM, Pipedrive
Default CRM in the stack. Contacts, accounts, opportunities, leads, calendar, email integration, mass mail, workflow automation. Native OIDC via post-deploy toggle. [-> Full details](/en/apps/espocrm/)

### 9. Twenty -- replaces Salesforce, HubSpot, Pipedrive
Modern open-source CRM. Contacts, companies, opportunities, email sync, pipelines. Alternative to EspoCRM (the default CRM). [-> Full details](/en/apps/twenty/)

### 10. Plane -- replaces Jira, Linear, Asana, ClickUp
Open-source project management -- issues, cycles, modules, pages, workspaces. [-> Full details](/en/apps/plane/)

### 11. Zammad -- replaces Zendesk, Freshdesk, Jira Service Desk
Ticket-first help desk. Email, Telegram, social channels, SLAs, knowledge base. Native OIDC. [-> Full details](/en/apps/zammad/)

### 12. Chatwoot -- replaces Intercom, Front, Help Scout (for chat channels)
Conversation-first omnichannel inbox. Email, live-chat widget, WhatsApp, Facebook, Instagram, Twitter/X in one inbox. [-> Full details](/en/apps/chatwoot/)

### 13. WordPress -- replaces Wix, Squarespace, self-hosted Drupal
Production-ready public CMS / website platform with FastCGI cache, Redis object cache, and a curated free-tier plugin set pre-installed. The site serves anonymously; admin sign-in runs on /wp-admin and can be wired to Keycloak via a plugin. [-> Full details](/en/apps/wordpress/)

### 14. n8n -- replaces Zapier, Make (Integromat), Tray.io
Workflow automation -- visually chain hundreds of integrations (APIs, apps, databases) into no-code/low-code workflows. [-> Full details](/en/apps/n8n/)

### 15. ERPNext -- replaces SAP Business One, Odoo, Oracle NetSuite
Full open-source ERP suite -- accounting, inventory, HR/payroll, CRM, manufacturing, projects, and a built-in website/e-commerce module. [-> Full details](/en/apps/erpnext/)

### 16. Actual Budget -- replaces YNAB (You Need A Budget), Mint, EveryDollar
Self-hosted personal finance. Envelope budgeting, bank account syncing via SimpleFIN or GoCardless, encrypted end-to-end. [-> Full details](/en/apps/actualbudget/)

### 17. Postiz -- replaces Buffer, Hootsuite, Later
Schedule and publish social media posts across Twitter/X, LinkedIn, Facebook, Instagram, YouTube, TikTok, and more. [-> Full details](/en/apps/postiz/)

### 18. Easy!Appointments -- replaces Calendly, Acuity, SimplyBook, Setmore
Customer-facing booking app for one or many providers (clinic, salon, lessons, repair shop). Public booking page; staff calendars; email + SMS reminders; ICS export. [-> Full details](/en/apps/easyappointments/)

### 19. Mautic -- replaces Mailchimp, ActiveCampaign, HubSpot Marketing, Brevo (Sendinblue)
Open-source marketing automation. Contact segments, email campaigns, drip sequences, landing pages, forms, lead scoring. Replaces Mailchimp / ActiveCampaign / HubSpot Marketing. [-> Full details](/en/apps/mautic/)

### 20. Kimai -- replaces Toggl, Clockify, Harvest, TimeCamp
Open-source time tracker. Customers, projects, activities, timesheets, multi-user teams, invoice generation from tracked time. SAML federates with Keycloak via the post-deploy admin UI. [-> Full details](/en/apps/kimai/)

### 21. Invoice Ninja -- replaces FreshBooks, QuickBooks (invoicing module), Zoho Invoice, Harvest (invoicing)
Open-source invoicing with Stripe + PayPal payment gateways, recurring billing, expense tracking, client portal for online payment. Self-hosted gets all Pro + Enterprise features. [-> Full details](/en/apps/invoiceninja/)

### 22. Mail server + webmail -- replaces Google Workspace (Gmail), Microsoft 365 (Exchange Online)
Self-hosted email -- inbox storage on your VPS (Postfix + Dovecot + Rspamd) with Roundcube webmail and Keycloak single sign-on. Outbound requires an SMTP relay through a reputable provider (set up before deploy) so messages are not flagged as spam. [-> Full details](/en/apps/mailserver/)

## A note on sign-in (SSO)

Each template's reference page declares its SSO status (pre-wired, post-deploy UI, one-time curl, or not available). Apps without native OIDC just mean each user maintains a per-app login -- the app itself is still reachable, backed up, and secured by its own login wall. It just doesn't participate in the "one login for everything" flow.
