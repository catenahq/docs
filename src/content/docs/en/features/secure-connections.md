---
title: "Secure connections"
description: "How web traffic, administration and calls reach the server without exposing web ports, and how the open ports are kept in check."
---

All web traffic reaches the server through an encrypted Cloudflare tunnel, so no web port is open on the machine itself. Cloudflare hides the server address, issues HTTPS certificates and absorbs bad traffic. Administration uses a separate, optional private network, and audio and video calls get their own relay.

## How it works

**App tunnel.** A tunnel service on the server connects out to Cloudflare. Requests for `yourdomain.com` addresses arrive through it, pass to Traefik, and then go to the app. Apps that are not public sit behind a per-app sign-in gate (see [Single sign-on](/en/features/single-sign-on/)).

**Domain changes.** Applying a domain in **Settings** > **Domain** replaces the tunnel with a new one. The applications are unavailable for a few minutes while the server is brought up to date under the domain. Until you apply a domain, nothing is published and you reach the panel over an SSH forward.

**Admin path.** The tailnet is optional. **Settings** > **Admin access tunnel** takes either a hosted Tailscale OAuth client or a self-hosted Headscale server. The credentials are checked on the server before they are stored. If you choose no private network, key-only SSH on the public address stays the way in.

**Public SSH.** SSH is always key-only: no root login and no passwords. Port 22 stays open until you tick **Close SSH on public port 22**, which is offered only while the tailnet is up. If the tailnet then stays down for more than 5 minutes, the host reopens the port, so a broken tailnet cannot lock you out.

**Port reconciliation.** The firewall denies everything by default. Ports are declared by the platform or by an app (the `vps.expose.*` labels, see [Configure an app for Catena](/en/configure-apps/)), and a reconciler merges them into the firewall rules every 5 minutes. Besides SSH, only the call relay (UDP) and ports that apps declare, such as mail, are open publicly. A validation pass checks that each service answers where expected, on the server and through the private network, and an external scan from your admin computer confirms that nothing undeclared is reachable.

**Calls.** The relay answers on `turn.yourdomain.com`. It is a UDP relay, not a web page.

## What each edition adds

Community includes both tunnels, Cloudflare DDoS protection and one domain. Catena Pro and Catena Business add serving several separate domains from one server, each with its own sign-on, through the **Domains** panel. If a subscription ends, the extra domains stay stored but are no longer served. See the [edition comparison](https://catena.run/en/#pricing).

## Limits

- You need a Cloudflare account and a domain for public apps.
- A Cloudflare token may reach several domains, but Community attaches only one.
- A domain change or a tunnel replacement causes a few minutes of downtime on public addresses.

## Configuration

- [Domain and Cloudflare](/en/configuration/domain/)
- [Admin access and tailnet](/en/configuration/admin-access/)
- [Server settings](/en/configuration/server/)
