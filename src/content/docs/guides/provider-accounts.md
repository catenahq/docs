---
title: Create your provider accounts
description: Step-by-step -- create the external provider accounts (email, Cloudflare, Tailscale, OVH, eazybackup, Resend) that a typical catena deployment needs.
---

A typical catena deployment leans on a handful of external accounts that stay in your name. Walk through what you can; we will cover the rest together at the install meeting.

## 1. Email provider: choose one

Catena does not host email; it integrates with the provider you pick. Open the [email provider comparison](/guides/email-providers/) and choose one of the five we recommend (Migadu, Mailbox.org, Infomaniak, OVH Pro Mail, Mailfence), then create the account in your business name. Pick the mailbox plan that matches your team size; we wire the DNS records and the transactional sender for you at install.

*Time: 15-30 minutes (account creation + initial domain verification).*

[![Email provider selection walkthrough screenshot](/img/guides/provider-accounts/email.en.png)](/img/guides/provider-accounts/email.en.png)

[Compare the six providers ->](/guides/email-providers/)

## 2. Cloudflare: create an API key

[Sign up](https://dash.cloudflare.com/sign-up) with the email address you want on the invoice and add your business domain to Cloudflare DNS (free tier is enough). Then create an API token scoped to your zone so the install can publish DNS records and the public tunnel on your behalf.

*Time: 10-15 minutes (DNS propagation).*

[![Cloudflare API token walkthrough screenshot](/img/guides/provider-accounts/cloudflare.en.png)](/img/guides/provider-accounts/cloudflare.en.png)

[Full Cloudflare docs ->](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)

## 3. Tailscale: create an OAuth client ID

[Start a tailnet](https://login.tailscale.com/start) using SSO from your existing email provider (Google, Microsoft, GitHub). Then create an OAuth client so the install can add the new server to your private network without you sharing a personal login.

*Time: 5-10 minutes.*

[![Tailscale OAuth client walkthrough screenshot](/img/guides/provider-accounts/tailscale.en.png)](/img/guides/provider-accounts/tailscale.en.png)

[Full Tailscale docs ->](https://tailscale.com/kb/1215/oauth-clients)

## 4. OVH (or another VPS provider): rent a VPS

[Create an OVH account](https://www.ovhcloud.com/en-ca/vps/) and order a VPS in your name. Not sure which size fits your team? See the [sizing guide](/sizing/) for a quick recommendation by headcount and workload. Beauharnois (Quebec) is the default region so your data stays in Canada.

*Time: 30 minutes (account verification can stretch on first sign-up).*

[![OVH VPS order walkthrough screenshot](/img/guides/provider-accounts/ovh.en.png)](/img/guides/provider-accounts/ovh.en.png)

[Full OVH docs ->](https://help.ovhcloud.com/csm/en-ca-vps-getting-started?id=kb_article_view&sysparm_article=KB0047708)

## 5. eazybackup: create immutable S3 backup storage

[Open an eazybackup account](https://eazybackup.ca/) and create an S3-compatible bucket with Object Lock and versioning turned on. eazybackup is Canadian-owned and runs in Ottawa, so your offsite backups stay in Canada and cannot be silently overwritten or deleted.

*Time: 15 minutes.*

[![eazybackup signup walkthrough screenshot](/img/guides/provider-accounts/eazybackup.en.png)](/img/guides/provider-accounts/eazybackup.en.png)

[Full eazybackup docs ->](https://eazybackup.ca/)

## 6. SMTP relay: configure a sender for automated email

Catena does not run a mail server; it relays automated email (password resets, calendar invites, ticket notifications) through a sender of your choice. Default: [Resend](https://resend.com/) (one-click setup -- add your domain, drop the DNS records into Cloudflare, generate an API key). Alternatives: [Brevo](https://www.brevo.com/) (generous free tier), or your existing transactional-email provider.

*Time: 10-20 minutes with Resend (DNS verification round-trip).*

[![Resend domain + API key walkthrough screenshot](/img/guides/provider-accounts/resend.en.png)](/img/guides/provider-accounts/resend.en.png)

[Full Resend docs ->](https://resend.com/docs/dashboard/domains/introduction)

---

The further you get through this list, the faster the install meeting goes. If you only have time to create the accounts before we meet, that is fine too: we will walk through every step together on the call.
