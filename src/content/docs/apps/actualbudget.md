---
title: "Actual Budget"
description: "Self-hosted personal finance. Envelope budgeting, bank account syncing via SimpleFIN or GoCardless, encrypted end-to-end."
---

Self-hosted personal finance. Envelope budgeting, bank account syncing via SimpleFIN or GoCardless, encrypted end-to-end.

- **Upstream project:** <https://actualbudget.org/>
- **Replaces:** **YNAB (You Need A Budget)**, **Mint**, **EveryDollar**
- **Sign-in (SSO):** Not available — this app's community edition doesn't support OIDC. Users keep a per-app email/password login.

## Setup steps

1. Click **Deploy**. Wait ~30 s.
2. Visit your Actual Budget domain. Set a server password on first visit (it's stored locally; remember it — no recovery).
3. Create a new budget or import an existing one (file menu → Import from YNAB4 / YNAB5 / nYNAB).
4. *(Optional)* Connect bank accounts via **Settings** → **Connected Accounts** → SimpleFIN (USD/CAD, paid) or GoCardless (EUR/GBP, free).

**Note on sign-in.** Actual Budget uses a single shared server password to unlock the UI, not per-user logins. Multi-user is supported at the budget level (share the budget file) but the server auth is a single secret. This matches how the upstream project is designed: typically one household per server. OIDC/SSO isn't supported.

## Environment variables

These values live in the Dokploy compose's **Environment** tab. Random
secrets are minted automatically when the template is first seeded —
you don't need to generate them yourself.

_(no environment variables to configure)_

## Domain

- **Service and port:** `actual:5006`
- **Hostname:** `budget.yourdomain.com`

The hostname is attached automatically when the template is seeded;
change it in the **Domains** tab before clicking Deploy if you want
something else.

## Compose file

For reference — this is what the template deploys. **Do not paste this
anywhere.** The compose is seeded into Dokploy automatically; the
client-facing adjustments you make happen in the Environment and
Domains tabs (described above), never in the compose itself.

```yaml
# Actual Budget — self-hosted personal finance (YNAB / Mint alternative).
# Single-container app with a local SQLite database + file storage.
# Server uses its own password login (set on first visit) — no OIDC
# support in the upstream project.

services:
  actual:
    image: actualbudget/actual-server:26.4.0-alpine
    restart: unless-stopped
    environment:
      ACTUAL_HTTPS: "false"               # TLS terminated by Traefik
      ACTUAL_TRUST_PROXY: "true"
      ACTUAL_PORT: "5006"
    volumes:
      - actual-data:/data
    labels:
      - "vps.auth.mode=public"
      - "vps.auto-update=patch"
    networks:
      dokploy-network:
        aliases:
          - actualbudget
      default: {}

volumes:
  actual-data:

networks:
  dokploy-network:
    external: true
```

---

[← Back to all pre-configured apps](./)
