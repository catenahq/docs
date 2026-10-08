---
title: "Outgoing email"
description: "Choosing the mail service the server sends through, the fields each service needs, what depends on it and the account-side steps for Resend and Brevo."
---

Everything on the server that sends automated email goes through one outside mail service: one choice, one sender address, one credential. A server sending its own transactional mail directly lands in spam, so a sending service is used.

## What uses it

- Password-reset emails and invitations from the sign-in service (Keycloak). See [Sign-in and people](/en/configuration/sign-in-and-people/).
- Alert emails, such as server-resource alerts. See [Alerts](/en/configuration/alerts/).
- The one-time email sent to the admin when a paid subscription locks. See [Subscription](/en/configuration/subscription/).

A mailbox application deployed on the server (a mail server app) keeps its own separate settings; this section does not configure it.

## Prerequisites

- An account with a sending service, and the sending domain verified there (see the account-side steps below), or an existing SMTP relay.
- An address on that domain to use as sender.

## Fields

In **Settings** > **Outgoing mail**, **Send mail through** offers:

| Option | Meaning |
|---|---|
| **No outgoing mail** | Mail is off. This also turns off password-reset email. |
| **Resend (API key)** | Resend knows its own host and port. |
| **Brevo (API key)** | Brevo knows its own host and port. |
| **Custom SMTP server** | Any SMTP relay. |

Only the fields the chosen option needs are shown:

| Field | Resend | Brevo | Custom |
|---|---|---|---|
| **Sender address** | yes | yes | yes |
| **SMTP server host** | no | no | yes |
| **SMTP server port** | no | no | yes (587 is the usual submission port) |
| **Username** | no | yes | yes |
| **API key or password** | yes | yes | yes |

The secret is stored and never shown again; a blank field keeps it. The provider choice is the only value the panel validates ("Choose one of the options offered."). The section ends with **Save and apply**: the services that send mail restart briefly.

## Account-side steps

### Resend

1. Create a Resend account and add the sending domain.
2. Add the DNS records Resend lists to the domain in Cloudflare, then wait for the domain to show as verified in Resend.
3. Create an API key.
4. In the panel, choose **Resend (API key)**, enter a sender address on the verified domain and the API key, then press **Save and apply**.

### Brevo

1. Create a Brevo account and add and authenticate the sending domain, using the DNS records Brevo lists.
2. In the Brevo account, find the SMTP login and create the key to use with the SMTP relay.
3. In the panel, choose **Brevo (API key)**, enter the sender address on the authenticated domain, the SMTP login in **Username** and the key in **API key or password**, then press **Save and apply**.

### Custom SMTP server

Enter the relay's host and port, its username and password, and a sender address the relay accepts.

## Check that it works

After saving, **Forgot password** on the sign-in page at `auth.yourdomain.com` sends a reset email to an existing account. If nothing arrives, check the spam folder, then the sender domain's verification state at the provider.

## Troubleshooting

- No reset emails after choosing **No outgoing mail**: expected, this option turns them off.
- The provider rejects the sender: the sender address must be on a domain verified at the provider.
- Mail worked and then stopped: the key may have been revoked or the provider account suspended. Create a new key and save it; a blank secret field keeps the old one, so the new value must be typed.
