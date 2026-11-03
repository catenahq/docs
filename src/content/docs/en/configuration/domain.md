---
title: "Domain and Cloudflare"
description: "Connecting your server to a Cloudflare domain: the API token and its permissions, applying the domain, renaming the infrastructure subdomains and attaching extra domains."
---

Every public address of the server is a name under one domain, served through a Cloudflare tunnel. Until you apply a domain, the server runs without public addresses, and you reach the panel through the SSH forward described in [Installation](/en/installation/).

## Prerequisites

- A Cloudflare account, with your domain added to Cloudflare and using Cloudflare's name servers (the free plan is enough).
- A Cloudflare API token with the permissions below.
- The panel open on **Settings** > **Domain**.

## The API token

You create the token in the Cloudflare dashboard (API tokens), and it must be active. The server manages the tunnel and DNS records with it, so it needs, on the target zone:

- **Zone:DNS:Edit**
- **Account:Cloudflare Tunnel:Edit**

The panel checks the token with Cloudflare before storing anything: it must verify as active and must reach at least one domain. A domain the token cannot reach is not offered.

:::note
Community attaches a single domain. A token that reaches several domains lists them all, and you choose one. Scope the token to the one domain to keep its reach minimal.
:::

## Apply a domain

1. Open **Settings** > **Domain**.
2. Paste the token in **Cloudflare API token**. As soon as you type it, the domains it reaches fill the list. Until then the list reads "Enter a Cloudflare API token to list its domains".
3. Choose the domain in **Domain**.
4. Read the warning, then press **Apply**.

When a token is already stored, you can leave the field blank: the stored token is used.

The warning reads: "Applying replaces this server's Cloudflare tunnel with a new one: the current tunnel is dropped, and the applications are unavailable for a few minutes while the saved settings are applied under the domain." Applying stores the token and the domain, replaces the tunnel and then applies the saved settings to the server. The section follows the progress: "Applying the domain: the tunnel is being replaced, then the saved settings are applied under it. The public addresses are unreachable for a few minutes, and this section follows the progress." Its badge turns **Applied** by itself when the run ends, without a reload.

The same **Apply** repairs a leaked or broken tunnel: press it with the domain already in use to create a fresh tunnel and drop the old one.

While an apply runs, a second **Apply** saves nothing and the section reads: "The server is still applying the last change, shown below. Nothing new was saved." Press it again once the run ends.

### What moves to the new domain

The panel and the applications whose address the panel manages move to the new domain. An application that has its address built in, typed in its own settings, stays on its old name until you move it.

The mail server application is one of these. It keeps its own name until you move it, and its certificate and its DNS records stay with that name: its certificate is issued for it, and its address record (A) and its MTA-STS and TLS-RPT records are published under the zones of that name when the Cloudflare token reaches them. When the token does not reach a zone, Catena keeps the certificate or records that exist and reports the name it left alone. Webmail checks the mail server's certificate against this name, so it keeps working after the domain change.

### Messages

| Message | Meaning |
|---|---|
| "Cloudflare API token rejected: ..." | The token is not active, the listing of domains failed, or it reaches no domain. The reason from Cloudflare follows. |
| "Enter a Cloudflare API token first: the domains offered are the ones it reaches." | No token is typed and none is stored. |
| "Choose a domain." | No domain is selected. |
| "The Cloudflare token cannot reach that domain. Choose one from the list." | The selected domain is not among the domains the token reaches. |
| "A domain name such as example.com." | The domain is not a valid name. |

### The sign-in page name

After a domain change, the name shown on the sign-in page at `auth.yourdomain.com` follows the new domain. If you renamed the sign-in page by hand in Keycloak's realm settings, your name stays and is never replaced. See [Sign-in and people](/en/configuration/sign-in-and-people/).

## Infrastructure app subdomains

**Settings** > **Infrastructure app subdomains** sets the name each of the server's own services answers on, under the domain. Each field shows the name in use.

| Field | Service | Default | Address |
|---|---|---|---|
| **Keycloak (sign-in)** | Keycloak | `auth` | `auth.yourdomain.com` |
| **Catena admin (this panel)** | This panel | `dash` | `dash.yourdomain.com` |

Gatus (`gatus`), Healthchecks (`healthchecks`) and Beszel (`beszel`) are installed by default as applications, so each one's address is a setting of its application: open **Apps**, then the application's page with the gear on its card, and change the name there. The server moves every address of the application to the new name when it next applies its configuration (**Apply the saved settings** in [Server settings](/en/configuration/server/)).

Rules, for the fields above and the same for an application's name:

- One name per field, without the domain: `auth`, not `auth.yourdomain.com`. The message otherwise is "One name only, such as auth: the domain is added to it."
- Lower-case letters, digits and hyphens; no leading or trailing hyphen; 63 characters at most.
- A blank field keeps the name in use. To return to a default, type the default name.
- The section ends with **Save and apply**: the saved settings are applied and the services behind the renamed addresses restart briefly.

When the panel's own name changes, **Server configuration** first shows "This dashboard moves to {address} once the server serves the new domain. The link to it appears here as soon as it does.", with the new address in place of `{address}`. Once the server serves the new domain, it shows "This dashboard moves to a new address once the configuration is applied. It opens there on its own as soon as the new address answers; until then, the address is:" followed by a link to the new address, which opens as soon as it answers. Your bookmarks to the old address stop working.

## Extra domains

A server on Catena Pro or Catena Business can serve several unlinked domains. Each one is a separate sign-on island: people using one domain never see another domain's login. Shared dashboards stay on the first (primary) domain. The editions are compared at [catena.run](https://catena.run/en/#pricing).

1. In Cloudflare, create a token with **Zone:DNS:Edit** scoped to the one domain to attach.
2. Open the **Domains** panel in the menu.
3. Paste the token in **Cloudflare API token (one domain)** and press **Attach domain**.
4. Changes apply on the next configuration run: press **Apply the saved settings** in [Server settings](/en/configuration/server/).

The token must reach exactly one domain, the one being attached. The table lists each domain with its role, Primary or Secondary. A primary domain cannot be removed while secondary ones exist ("remove the others first"); every other row has a **Remove** button. When a subscription lapses, secondary domains stay stored but are no longer served. See [Subscription](/en/configuration/subscription/).

## Troubleshooting

- "Cloudflare API token rejected": confirm in Cloudflare that the token is active and was created with the permissions above, on the right account.
- The domain is missing from the list: the token does not reach it. Create the token on the zone, or add the zone to the token.
- Public addresses stay unreachable well beyond a few minutes: open **Server configuration** in **Settings** and read the last attempt's log. Running the **Apply** again is safe.
