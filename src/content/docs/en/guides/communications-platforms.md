---
title: Choosing a communications platform
description: Compare Nextcloud Talk, Rocket.Chat, Element, and Linphone -- what each one brings, what each one lacks, what runs on your own server at no extra cost, and which combinations fit which situations.
---

No single tool covers everything a business needs for communication. Internal team chat, video meetings, customer-support inboxes, and regular phone calls each work best on a different platform. The table below shows what each option does well and where it falls short.

## Feature comparison

|                                                                | Nextcloud Talk | Rocket.Chat | Element | Linphone            |
| -------------------------------------------------------------- | :------------: | :---------: | :-----: | :-----------------: |
| Internal team chat                                              |       ✅       |     ✅      |   ✅    |         n/a         |
| Group video meetings                                            |       ✅       |     ✅      |   ✅    |         n/a         |
| Phone dial-in to scheduled meetings [^1]                        |       ✅       |     ✅      |   ✅    |         n/a         |
| Customer-support inbox (web, email, social, SMS)                |       ❌       |     ✅      |   ❌    |         n/a         |
| Regular phone calls from inside the chat window                 |       ❌       | paid [^2]   |   ✅    | (it is the phone)   |
| Mobile apps (iOS / Android)                                     |       ✅       |     ✅      |   ✅    |          ✅         |
| End-to-end encryption on direct messages                        |       ✅       |  optional   | ✅ (default) |    optional     |
| Federation with another organization on the same platform       |     limited    |   limited   |   ✅    |         ✅          |
| Free on your server, no monthly per-user fee                    |       ✅       |   ✅ [^3]   |   ✅    |         ✅          |

[^1]: Requires a phone-service subscription. See [What runs on your server, what costs extra](#what-runs-on-your-server-what-costs-extra) below.
[^2]: Rocket.Chat sells this feature as a Premium plan plus a Voice add-on, priced per user per month, negotiated directly with their sales team. The other options on this page avoid this fee.
[^3]: Rocket.Chat Community Edition (free) covers everything in the table except in-window phone calls.

## Pick by situation

- **Small team, internal communication only.** [Nextcloud Talk](/docs/nextcloud-apps-vs-suite/) alone.
- **Team chat plus a customer-support inbox across web, email, social, and SMS.** [Rocket.Chat](/docs/apps/rocketchat-oidc/) for the inbox; Linphone for outbound phone work.
- **Team chat plus regular phone calls in the same window.** Element.
- **Customer-support inbox AND regular phone calls in one window.** No clean single-window option; pick Rocket.Chat plus Linphone, or Element plus a separate ticketing tool.
- **Mixed needs across several teams.** Talk for internal chat, Rocket.Chat for the customer-support team, Linphone for anyone needing a phone extension.

## The four building blocks

**[Nextcloud Talk](/docs/nextcloud-apps-vs-suite/)** is included with the Nextcloud suite already on your server. Internal team chat, voice and video meetings, and phone dial-in to those meetings when you sign up with a phone service. No customer-support inbox; no extension-style office phone.

**[Rocket.Chat](/docs/apps/rocketchat-oidc/)** is a richer team chat platform with strong mobile apps and a customer-support inbox that pulls webchat, email, social, and SMS into one place. Internal voice and video work out of the box. Making and receiving regular phone calls from inside the chat window requires a paid Rocket.Chat subscription; everything else stays free on your server.

**Element** handles regular phone calls in the same window as the chat with no paid add-on, and lets your team chat with anyone on another organization's Element server. It does not include a customer-support inbox.

**Linphone** is a free phone app for desktop and mobile that gives each staff member an office extension number, a voicemail box, and the ability to make and receive regular phone calls. It is not a chat platform; it is the piece you add when you keep Talk or Rocket.Chat as your chat tool and still need a real office phone. The trade-off: one extra window during the workday.

## What runs on your server, what costs extra

Everything above -- Talk, Rocket.Chat, Element, Linphone -- runs on the server your operator already manages for you, with no monthly per-user fee (the one exception is Rocket.Chat's optional in-window phone subscription noted in the table). The recurring outside costs only apply when you want a real phone number that customers can dial. They come from a phone service provider, not from Rocket.Chat, Nextcloud, Element, or your operator.

| What                                                                  | Typical cost in Canada [^4]                                                                                |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Your business phone number                                            | About $1 to $3 per month, per number                                                                       |
| Outgoing calls                                                        | About $0.01 per minute, OR a flat-rate bundle around $5 to $10 per month for unlimited North America        |
| 9-1-1 emergency-services fee (required by Canadian law)               | About $1.50 per month, per number                                                                          |

[^4]: Approximate at the time of writing. Examples of providers that offer this kind of pay-as-you-go phone service in Canada: VoIP.ms, Babytel, Twilio. Your operator confirms live numbers and helps you sign up the day we quote. You pay the phone provider directly; your operator does not mark these up.

If you are not sure which combination fits your business, contact your operator. A short call sorts it faster than a checklist.
