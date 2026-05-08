---
title: "n8n"
description: "Workflow automation — visually chain hundreds of integrations (APIs, apps, databases) into no-code/low-code workflows."
---

Workflow automation — visually chain hundreds of integrations (APIs, apps, databases) into no-code/low-code workflows.

- **Upstream project:** <https://n8n.io/>
- **Replaces:** **Zapier**, **Make (Integromat)**, **Tray.io**
- **Sign-in (SSO):** Not available — this app's community edition doesn't support OIDC. Users keep a per-app email/password login.

## Setup steps

1. Click **Deploy**. Wait ~1 min for Postgres + n8n to initialize.
2. Visit your n8n domain and create the owner account via the setup wizard.
3. Invite additional users: **Settings** → **Users** → **Invite**. Each user receives an email invite.
4. Start building workflows: **Workflows** → **+ Add Workflow**. Browse the integrations library for pre-built nodes.

**Note on sign-in.** n8n's community edition uses email/password user management with invite flows. OIDC and SAML are enterprise-gated, so SSO isn't available here — each user maintains a per-app login. Fine for an automation team of 1-5 people.

## Environment variables

These values live in the Dokploy compose's **Environment** tab. Random
secrets are minted automatically when the template is first seeded —
you don't need to generate them yourself.

| Variable | Default |
|---|---|
| `N8N_HOSTNAME` | `automate.yourdomain.com` |
| `N8N_TIMEZONE` | `UTC` |
| `N8N_ENCRYPTION_KEY` | _auto-generated random value_ |
| `N8N_JWT_SECRET` | _auto-generated random value_ |
| `DB_PASSWORD` | _auto-generated random value_ |

## Domain

- **Service and port:** `n8n:5678`
- **Hostname:** `automate.yourdomain.com`

The hostname is attached automatically when the template is seeded;
change it in the **Domains** tab before clicking Deploy if you want
something else.

## Compose file

For reference — this is what the template deploys. **Do not paste this
anywhere.** The compose is seeded into Dokploy automatically; the
client-facing adjustments you make happen in the Environment and
Domains tabs (described above), never in the compose itself.

```yaml
# n8n — workflow automation (Zapier / Make alternative). Community
# edition uses local email/password user management. OIDC/SAML are
# enterprise-only, so per-user app-local logins here.

services:
  n8n:
    image: n8nio/n8n:2.19.5
    restart: unless-stopped
    environment:
      N8N_HOST: ${N8N_HOSTNAME}
      WEBHOOK_URL: https://${N8N_HOSTNAME}/
      N8N_EDITOR_BASE_URL: https://${N8N_HOSTNAME}/
      N8N_PROTOCOL: https
      N8N_PORT: "5678"
      N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY}
      N8N_USER_MANAGEMENT_JWT_SECRET: ${N8N_JWT_SECRET}
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: db
      DB_POSTGRESDB_PORT: "5432"
      DB_POSTGRESDB_DATABASE: n8n
      DB_POSTGRESDB_USER: n8n
      DB_POSTGRESDB_PASSWORD: ${DB_PASSWORD}
      GENERIC_TIMEZONE: ${N8N_TIMEZONE}
      N8N_DIAGNOSTICS_ENABLED: "false"
      N8N_HIRING_BANNER_ENABLED: "false"
      N8N_RUNNERS_ENABLED: "true"
    volumes:
      - n8n-data:/home/node/.n8n
    depends_on:
      db:
        condition: service_healthy
    labels:
      - "vps.auth.mode=public"
      - "vps.auto-update=patch"
    networks:
      dokploy-network:
        aliases:
          - n8n
      default: {}

  db:
    image: postgres:16.13-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: n8n
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: n8n
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U n8n"]
      interval: 10s
      timeout: 5s
      retries: 5
    labels:
      - "vps.auto-update=patch"
    networks:
      - default

volumes:
  n8n-data:
  db-data:

networks:
  dokploy-network:
    external: true
```

---

[← Back to all pre-configured apps](./)
