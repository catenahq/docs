---
title: "Mautic"
description: "Open-source marketing automation. Contact segments, email campaigns, drip sequences, landing pages, forms, lead scoring."
---

Open-source marketing automation. Contact segments, email campaigns, drip sequences, landing pages, forms, lead scoring. Replaces Mailchimp / ActiveCampaign / HubSpot Marketing.

- **Upstream project:** <https://www.mautic.org/>
- **Replaces:** **Mailchimp**, **ActiveCampaign**, **HubSpot Marketing**, **Brevo (Sendinblue)**
- **Sign-in (SSO):** Not available - this app's community edition doesn't support OIDC. Users keep a per-app email/password login.

## Setup steps

1. Click **Deploy**. Wait ~2 min for the first boot (database migrations run on first start).
2. Visit your Mautic domain and complete the first-run wizard:
   - **Database**: pre-filled (host `db`, name `mautic`, user `mautic`, password from the `DB_PASSWORD` env var).
   - **Admin user**: create your initial admin account.
   - **Email settings**: paste your managed-relay SMTP creds (host, port `587`, username, password, from-address). Skip if you'll do this later under **Settings** -> **Configuration** -> **Email Settings**.
3. Verify the cron + worker containers are running in Dokploy (Mautic needs `mautic_cron` for scheduled campaigns + `mautic_worker` for the email queue).
4. Build your first segment: **Segments** -> **New** -> filter by contact attribute.
5. Build your first email campaign: **Campaigns** -> **New** -> drag the **Send email** action onto a segment trigger.

### Authentication

Mautic community edition does not ship native OIDC. Local username/password is the default. SAML2 is supported upstream but requires per-deploy config; third-party generic-OAuth2 plugins exist. If single sign-on across the stack is required, contact your operator to add an oauth2-proxy front layer (Keycloak group `client-staff` gates access at the Traefik edge before traffic reaches Mautic).

### SMTP and sending reputation

Mautic does NOT send email directly. It hands every outbound to your managed SMTP relay (see the [email providers guide](/docs/en/guides/email-providers/) for recommended choices). Sending reputation, SPF/DKIM/DMARC, and bounce handling all live at the relay layer. Configure SMTP under **Settings** -> **Configuration** -> **Email Settings** with your relay's credentials before the first campaign goes out.

### Lead-magnet content and drip-campaign copy

The template ships the engine. Authoring the lead-magnet PDFs, drip-sequence copy, and email templates is your team's job (or your operator's, if they offer marketing-content services). Mautic itself does not ship pre-built campaigns.

### Resource note

Mautic runs as Apache + MariaDB + a worker sidecar + a cron sidecar. Plan for ~1.5 GB RAM at idle (worker + cron eat ~300 MB each), ~3 GB under campaign sends or segment rebuilds. Storage grows with media uploads and email-event history; budget ~10 GB after the first year of regular use.

## Environment variables

These values live in the Dokploy compose's **Environment** tab. Random secrets are minted automatically when the template is first seeded - you don't need to generate them yourself.

| Variable | Default |
|---|---|
| `MAUTIC_HOSTNAME` | `marketing.yourdomain.com` |
| `DB_PASSWORD` | _auto-generated random value_ |
| `DB_ROOT_PASSWORD` | _auto-generated random value_ |
| `SMTP_HOST` | _set before deploy_ |
| `SMTP_PORT` | `587` |
| `SMTP_USERNAME` | _set before deploy_ |
| `SMTP_PASSWORD` | _set before deploy_ |
| `SMTP_FROM_ADDRESS` | _set before deploy_ |

## Domain

- **Service and port:** `mautic_web:80`
- **Hostname:** `marketing.yourdomain.com`

The hostname is attached automatically when the template is seeded; change it in the **Domains** tab before clicking Deploy if you want something else.

---

[Back to all pre-configured apps](/docs/en/apps/)
