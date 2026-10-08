---
title: "Domain and Cloudflare"
description: "Connecting the server to a Cloudflare domain: the API token and its permissions, applying the domain, renaming the infrastructure subdomains and attaching extra domains."
---

Every public address of the server is a name under one domain, served through a Cloudflare tunnel. Until a domain is applied the server runs without public addresses, and the panel stays reachable through the SSH forward described in [Installation](/en/installation/).

## Prerequisites

- A Cloudflare account, with the domain added to Cloudflare and using Cloudflare's name servers (the free plan is enough).
- A Cloudflare API token with the permissions below.
- The panel open on **Settings** > **Domain**.

## The API token

The token is created in the Cloudflare dashboard (API tokens) and must be active. The tunnel and DNS records are managed with it, so it needs, on the target zone:

- **Zone:DNS:Edit**
- **Account:Cloudflare Tunnel:Edit**

The panel checks the token with Cloudflare before storing anything: it must verify as active and must reach at least one domain. A domain the token cannot reach is not offered.

:::note
Community attaches a single domain. A token that reaches several domains lists them all, and one is chosen. Scoping the token to the one domain keeps its reach minimal.
:::

## Apply a domain

1. Open **Settings** > **Domain**.
2. Paste the token in **Cloudflare API token**. As soon as it is typed, the domains it reaches fill the list. Until then the list reads "Enter a Cloudflare API token to list its domains".
3. Choose the domain in **Domain**.
4. Read the warning, then press **Apply**.

When a token is already stored, the field can stay blank: the stored token is used.

The warning reads: "Applying replaces this server's Cloudflare tunnel with a new one: the current tunnel is dropped, and the applications are unavailable for a few minutes while the server is brought up to date under the domain." Applying stores the token and the domain, replaces the tunnel and then runs a full configuration of the server. The section follows the progress: "Applying the domain: the tunnel is being replaced, then the server is brought up to date under it. The public addresses are unreachable for a few minutes, and this section follows the progress."

The same **Apply** repairs a leaked or broken tunnel: pressing it with the domain already in use creates a fresh tunnel and drops the old one.

### Messages

| Message | Meaning |
|---|---|
| "Cloudflare API token rejected: ..." | The token is not active, the listing of domains failed, or it reaches no domain. The reason from Cloudflare follows. |
| "Enter a Cloudflare API token first: the domains offered are the ones it reaches." | No token is typed and none is stored. |
| "Choose a domain." | No domain is selected. |
| "The Cloudflare token cannot reach that domain. Choose one from the list." | The selected domain is not among the domains the token reaches. |
| "A domain name such as example.com." | The domain is not a valid name. |

## Infrastructure app subdomains

**Settings** > **Infrastructure app subdomains** sets the name each of the server's own services answers on, under the domain. Each field shows the name in use.

| Field | Service | Default | Address |
|---|---|---|---|
| **Portainer (application manager)** | Portainer | `portainer` | `portainer.yourdomain.com` |
| **Keycloak (sign-in)** | Keycloak | `auth` | `auth.yourdomain.com` |
| **Catena admin (this panel)** | This panel | `dash` | `dash.yourdomain.com` |
| **Gatus (status page)** | Gatus | `gatus` | `gatus.yourdomain.com` |
| **Healthchecks (scheduled-job monitor)** | Healthchecks | `healthchecks` | `healthchecks.yourdomain.com` |
| **Beszel (server metrics)** | Beszel | `beszel` | `beszel.yourdomain.com` |

Rules:

- One name per field, without the domain: `auth`, not `auth.yourdomain.com`. The message otherwise is "One name only, such as auth: the domain is added to it."
- Lower-case letters, digits and hyphens; no leading or trailing hyphen; 63 characters at most.
- A blank field keeps the name in use. To return to a default, the default name is typed.
- The section ends with **Save and apply**: the server is brought up to date and the services behind the renamed addresses restart briefly.

When the panel's own name changes, **Server configuration** shows "This dashboard moves to a new address once the configuration is applied. It opens there on its own as soon as the new address answers; until then, the address is:" followed by the old address. Bookmarks to the old address stop working.

## Extra domains

A server on Catena Pro or Catena Business can serve several unlinked domains. Each one is a separate sign-on island: people using one domain never see another domain's login. Shared dashboards stay on the first (primary) domain. The editions are compared at [catena.run](https://catena.run/en/#pricing).

1. In Cloudflare, create a token with **Zone:DNS:Edit** scoped to the one domain to attach.
2. Open the **Domains** panel in the menu.
3. Paste the token in **Cloudflare API token (one domain)** and press **Attach domain**.
4. Changes apply on the next configuration run: press **Bring this server up to date** in [Server settings](/en/configuration/server/).

The token must reach exactly one domain, the one being attached. The table lists each domain with its role, Primary or Secondary. A primary domain cannot be removed while secondary ones exist ("remove the others first"); every other row has a **Remove** button. When a subscription lapses, secondary domains stay stored but are no longer served. See [Subscription](/en/configuration/subscription/).

## Troubleshooting

- "Cloudflare API token rejected": confirm in Cloudflare that the token is active and was created with the permissions above, on the right account.
- The domain is missing from the list: the token does not reach it. Create the token on the zone, or add the zone to the token.
- Public addresses stay unreachable well beyond a few minutes: open **Server configuration** in **Settings** and read the last attempt's log. Running the **Apply** again is safe.
