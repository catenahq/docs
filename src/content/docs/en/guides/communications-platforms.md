---
title: Choosing a communications platform
description: Compare Nextcloud Talk, Rocket.Chat, Element, and Linphone -- what each one brings, what each one lacks, what runs on your own server at no extra cost, and which combinations fit which situations.
---

No single tool covers everything a business needs for communication. Internal team chat, video meetings, customer-support inboxes, and regular phone calls each work best on a different platform. This page shows what each option does well, where it falls short, and which combinations fit common situations.

## What runs on your server, what costs extra

Almost everything below runs on the server your operator already manages for you. Nothing on this page charges per user per month -- with one specific, optional exception. The only recurring outside costs are the ones the rest of the world makes mandatory: a phone provider (if you want to dial or receive regular phone numbers) and the regulatory 9-1-1 fee that goes with it.

| What | Where it runs | Recurring cost beyond what your operator already runs |
| --- | --- | --- |
| Nextcloud Talk | Your server | None |
| Rocket.Chat (Community Edition) | Your server | None |
| Rocket.Chat Premium + Voice add-on (in-window phone calls) | Your server, but feature-gated by Rocket.Chat's license | Paid, per user, per month, set directly by Rocket.Chat. The other options on this page avoid this fee. |
| Element / Matrix | Your server | None |
| Linphone (softphone app per staff member) | Each staff member's computer or phone | None |
| FreeSWITCH / Asterisk (if you want a full phone system with hunt groups, voicemail, IVR) | Your server | None |
| SIP trunk + phone numbers (DIDs) | External phone provider | Per number, per month + per minute or flat-rate bundle. Mandatory if you want regular phone calls at all. |
| 9-1-1 fee | Billed by the phone provider | Per number, per month. CRTC-mandated in Canada. |

The takeaway: the chat, meeting, and voice software is yours. The phone line and emergency-services routing come from a phone company because that is how the public phone network works.

## The four building blocks

**[Nextcloud Talk](/docs/nextcloud-apps-vs-suite/)** is included with the Nextcloud suite on your server at no extra cost. It covers internal team chat, voice and video meetings between staff, and dial-in to those meetings from a regular phone when paired with a phone provider. It does not include a customer-support inbox or extension-style phone calls.

**[Rocket.Chat](/docs/apps/rocketchat-oidc/)** is a richer team chat platform with mature mobile apps and a built-in Omnichannel module that turns a single inbox into the place your staff handle webchat, email, social, and SMS conversations from customers. Internal voice and video work out of the box (the meeting button opens a Jitsi room). The "make and receive regular phone calls from inside the chat window" feature, however, is gated behind a paid Premium plan plus a Voice add-on. That price is per user, per month, set directly by Rocket.Chat with their sales team, and is the one paid subscription called out on this page. The Community Edition that runs on your server without that subscription covers everything else.

**Element** is a chat platform built on the open Matrix protocol. Its strength is native phone integration: calls to and from regular phone numbers happen inside the same window as the chat, with no paid add-on. Element also supports federation (your team can chat with anyone on any other Matrix server) and end-to-end encryption on direct messages by default. It does not include an Omnichannel customer-support inbox.

**Linphone** is a free, open-source softphone app -- a desktop or mobile application that turns your computer or phone into an office line. It is not a competing chat platform; it is the piece that fills the regular-phone gap when you keep Talk or Rocket.Chat as your chat tool. Each staff member installs Linphone, signs in once with credentials your operator provisions, and gets an extension number, voicemail, and the ability to make and receive calls. The trade-off is one extra window during the workday: chat stays in Talk or Rocket.Chat, the actual call audio happens in Linphone.

## Where they overlap, where they differ

|                                                              | Nextcloud Talk            | Rocket.Chat                                | Element                              | Linphone               |
| ------------------------------------------------------------ | ------------------------- | ------------------------------------------ | ------------------------------------ | ---------------------- |
| Internal team chat                                           | yes                       | yes                                        | yes                                  | no                     |
| Group video meetings                                         | yes                       | yes (via the meeting button)               | yes                                  | no                     |
| Phone dial-in to scheduled meetings                          | yes (with a phone provider) | yes (with a phone provider)              | yes (with a phone provider)          | n/a                    |
| Customer-support Omnichannel inbox                           | no                        | yes                                        | no                                   | no                     |
| Regular phone calls from inside the chat window              | no                        | paid add-on (Premium + Voice)              | yes                                  | n/a (it is the phone)  |
| Mobile apps (iOS / Android)                                  | yes                       | yes                                        | yes                                  | yes                    |
| End-to-end encryption on direct messages                     | yes                       | optional                                   | yes (default)                        | optional               |
| Federation with other organizations on the same platform     | limited                   | limited                                    | yes                                  | yes (via SIP)          |
| Runs on your server with no per-user fee                     | yes                       | yes (in-window phone is the paid exception) | yes                                  | yes (one install per staff member) |

## Pick by situation

### Small team, internal communication only, no public phone number

**Recommended:** [Nextcloud Talk](/docs/nextcloud-apps-vs-suite/) alone.

Talk is already on your server, costs nothing extra, and covers chat, meetings, and phone dial-in to those meetings when you need it.

### Team chat plus customer support across web, email, social, or SMS

**Recommended:** [Rocket.Chat](/docs/apps/rocketchat-oidc/) for the inbox; Linphone for outbound phone work.

Rocket.Chat's Omnichannel module is the reason to pick it. One inbox covers webchat, email-to-ticket, and SMS-to-conversation (through your phone provider's API). Your staff handle customer conversations from a single window. Outbound and inbound regular phone calls happen in Linphone alongside. Rocket.Chat itself stays on the Community Edition; no Premium subscription needed for this combination.

### Team chat plus regular phone calls in one window

**Recommended:** Element.

Element is the only option that combines business chat and regular phone calls in the same client without a paid add-on. Useful if your team's day is half phone, half chat, and switching windows feels wrong.

### Customer-support inbox AND regular phone calls in one window

**Recommended:** there is no clean single-window option today. Pick Rocket.Chat for the inbox and accept Linphone for the phone, or pick Element for the phone and handle customer-support tickets in a separate tool. The other path -- paying for Rocket.Chat Premium + Voice -- collapses both into the Rocket.Chat window, but moves you to a per-user monthly subscription set by Rocket.Chat.

### Mixed needs across a multi-team business

**Recommended:** Talk for casual internal chat, Rocket.Chat for the customer-support team, Linphone for anyone who needs a phone extension.

Each tool handles what it does best. Staff who only chat internally stay in Talk. Staff who handle customers live in Rocket.Chat. Staff who need a phone extension also install Linphone. This is the most common arrangement for businesses that combine internal collaboration and external customer-facing workflows.

## What none of these gives you on its own

- A regular phone number that customers can dial. That comes from a phone provider; your operator can recommend one that fits your jurisdiction.
- 9-1-1 outbound calling. Provided by the phone provider and billed by them; mandatory in Canada.
- Voicemail-to-email, hunt groups (one phone number rings several people), or an auto-attendant ("Press 1 for sales"). These come from an open-source phone system (FreeSWITCH or Asterisk) that your operator can add alongside any of the chat platforms above. Talk to your operator if you need a full phone system, not just a softphone.

If you are not sure which combination fits your business, contact your operator. A short call sorts the lane faster than a checklist.
