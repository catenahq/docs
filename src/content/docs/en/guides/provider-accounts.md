---
title: Create your provider accounts
description: Create the external accounts a catena deployment relies on -- a VPS, Cloudflare, Tailscale, S3 backup storage, and an SMTP relay -- all kept in your name.
---

A catena deployment leans on a handful of external accounts that stay
in **your** name and billing. You own them, and the installer wires
them into the server for you -- you just create the accounts first and
feed their credentials to the install.

As you go, record each credential in your password manager. The exact
values the install needs are listed under each step and gathered in
[Credentials to record](#credentials-to-record) at the end.

## 1. Rent a VPS

The server that runs everything. Order one in your business name from a
provider you are comfortable with:

- **[Hetzner](https://www.hetzner.com/cloud)** -- low cost, EU + US
  regions.
- **[OVHcloud](https://www.ovhcloud.com/en-ca/vps/)** -- flat pricing,
  Beauharnois (Quebec) keeps data in Canada.
- **[Servarica](https://servarica.com/)** -- Canadian-owned, generous
  disk.
- **[DigitalOcean](https://www.digitalocean.com/products/droplets)** --
  simple console, wide region choice.

Pick a region in the jurisdiction your data should stay in. Size it for
your headcount and the apps you plan to run -- most providers let you
resize the VPS later if you outgrow it.

*Record: the provider login, the server's public IP, and the SSH
access details (or the root password if that is all the provider
gives you at first).*

## 2. Cloudflare: account + API token

Cloudflare is your public front door and issues the private tunnel that
keeps the server's real address hidden.

1. [Sign up](https://dash.cloudflare.com/sign-up) with the email you
   want on the invoice.
2. Add your business domain to Cloudflare DNS (the free tier is
   enough).
3. Create an API token scoped to your zone so the install can publish
   DNS records and the tunnel on your behalf.

Cloudflare's own guide walks through token creation:
[Create an API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/).

*Record: the API token.*

## 3. Tailscale: OAuth client

Tailscale is the private network we use to reach the server for updates
and maintenance. Public SSH stays closed.

1. [Start a tailnet](https://login.tailscale.com/start) using SSO from
   an identity you already have (Google, Microsoft, GitHub).
2. Create an OAuth client so the install can join the new server to
   your network without you sharing a personal login.

Tailscale's own guide:
[OAuth clients](https://tailscale.com/kb/1215/oauth-clients/).

*Record: the OAuth client ID and secret.*

## 4. S3 backup storage

Your off-site, encrypted backups land in an object-storage bucket you
own -- separate provider from the VPS, so one outage can't take out
both. **The bucket must support S3 Object Lock and versioning** so a
snapshot cannot be silently deleted or overwritten, even by someone
with valid keys.

Providers that support Object Lock + versioning:

- **[eazybackup](https://eazybackup.ca/)** -- Canadian-owned, keeps
  offsite backups in Canada. Default recommendation when the VPS is
  also Canadian.
- **[Backblaze B2](https://www.backblaze.com/cloud-storage)** -- low
  cost, S3-compatible, US-based.
- **[IDrive e2](https://www.idrive.com/e2/)** -- S3-compatible,
  competitive pricing, multiple regions.
- **[Cloudflare R2](https://www.cloudflare.com/developer-platform/products/r2/)**
  -- no egress fees, US-based.

Create the bucket with **Object Lock and versioning enabled at
creation** (most providers gate this behind a checkbox you cannot tick
later). Keep it in a different city -- ideally a different country --
from your server.

*Record: the endpoint URL, the bucket name, the access key, and the
secret key.*

## 5. SMTP relay for automated email

Two different things get called "email", and they need different setup:

- **Mailboxes** (the inbox your team reads and replies from). You can
  run a mail server as one of the apps, or integrate the provider you
  already use. Either way is fine.
- **Automated sending** (password-reset links, calendar invites,
  ticket notifications, campaign email). This is where an **external,
  independent SMTP sending service is required.** A VPS sending its own
  transactional mail lands in spam -- deliverability depends on a
  dedicated sender's reputation, so catena always relays automated
  email through one.

Pick a transactional sender and add your domain to it:

- **[Resend](https://resend.com/)** -- default. Add your domain, drop
  the DNS records it gives you into Cloudflare, generate an API key.
  Guide: [Resend domains](https://resend.com/docs/dashboard/domains/introduction).
- **[Brevo](https://www.brevo.com/)** -- generous free tier.
- Or your existing transactional-email provider, if you already have
  one.

*Record: the SMTP host, port (usually 587), username, password or API
key, and the from-address you verified.*

## Credentials to record

Before you run the install, have these in your password manager, each
as its own entry -- the install prompts for them:

| Account | What to record |
|---|---|
| VPS | provider login, server IP, SSH access |
| Cloudflare | API token |
| Tailscale | OAuth client ID + secret |
| S3 backup | endpoint, bucket, access key, secret key |
| SMTP relay | host, port, username, password/API key, from-address |

With all of these in hand the install runs start to finish on its own.
Prefer a hand walking through it? Reach your Catena contact -- it is an
option, not a requirement.
