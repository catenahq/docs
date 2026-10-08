---
title: "Subscription"
description: "Saving the Polar subscription key, what each status means, how a key moves between servers, and what locks or keeps working when a subscription lapses."
---

Catena Community is free and needs no key. Catena Pro and Catena Business unlock additional admin panel features with a subscription key sold through Polar. The key is saved in **Settings** > **Subscription**. The editions are compared at [catena.run](https://catena.run/en/#pricing).

## Prerequisites

- A subscription key from Polar.
- The server must be able to reach Polar over HTTPS.

## Save the key

1. Open **Settings** and go to **Subscription**.
2. Paste the key in **Subscription key** and press **Save**.

The key is stored on the server and never shown again. The section then shows:

| Line | Content |
|---|---|
| **Saved key** | A short fingerprint of the key and the licensee name. |
| **Edition** | Catena Community, Catena Pro or Catena Business. |
| **Status** | One of the sentences below. |
| **Unanswered activation** | Shown only when an activation sent to Polar got no answer: Polar may hold an activation for this server that the server never learned of (see [Troubleshooting](#troubleshooting)). |
| **Last error** | The reason, when the last check got no answer from Polar or the server's own files could not be read. |

A blank field keeps the saved key. A new or renewed key takes effect as soon as it is saved, without waiting for the hourly check. Saving asks Polar at once (the request stops waiting after 60 seconds) and reports one of four results:

- "Saved. Polar confirmed the key on this server."
- "Saved. Polar could not be reached to check the key; the server asks again every hour."
- "Saved. The key unlocks no paid feature on this server; the reason is below."
- "Saved. The check with Polar did not finish; the server asks again every hour."

The section also links to **Manage the subscription in Polar's customer portal**, where the key itself and the server activations are managed.

## One server per key

A key is active on one server at a time. The activation is bound to the machine's hardware identity (its hardware UUID, or the machine id when none is available). A clone of the server, or a restore onto other hardware, counts as a different server and is refused while the key's seat is taken.

To move a key to another server:

1. Free the seat held by the old server in the customer portal.
2. Save the key on the new server, in **Settings** > **Subscription**.

The old server learns of it at its next hourly check, its status changes to the "Polar does not grant this key" sentence below and its paid features lock. A move done with [Restore and migrate](/en/configuration/restore-and-migrate/) frees the old seat and activates the key on the new server automatically.

## The hourly check and the grace period

Each server asks Polar about its saved key once an hour, at a fixed offset of its own within the hour. A server with no saved key asks nothing. Between checks the features follow the last answer, with no network needed.

- When Polar refuses the key, the paid features lock at once.
- When Polar cannot be reached (network failure, a server error from Polar, or a rate limit), the paid features stay on for 48 hours after the last confirmation. Past 48 hours they lock until Polar answers again.

## Status sentences

The **Status** line shows one of these. Text in braces is filled in with a date.

| Situation | Sentence | What to do |
|---|---|---|
| No key | "No subscription key is saved. The paid features are off." | Save a key if paid features are wanted. |
| Waiting | "The key is saved and Polar has not answered about it for this server yet. The paid features stay off until it does; the server asks every hour, and saving the key asks at once." | Wait for the next check, or save the key again to ask at once. |
| Active | "Active. Polar last confirmed the key on this server at {date}." | Nothing. |
| Grace | "Active within the grace period: Polar has not been reachable since {date}. The paid features stay on until {date}, and the server keeps asking every hour." | Check the server's outbound network and DNS. |
| Not granted | "Polar does not grant this key on this server: the subscription was cancelled or has lapsed, the key was revoked or replaced, or this server's activation was freed in the customer portal. The paid features are off. Once the subscription is active, saving the key again activates it here." | Renew the subscription, or save the key again once it is active. |
| Refused | "Polar refused to activate this key on this server: it is active on another server (a key is active on one server at a time), or it is revoked, disabled or expired. Freeing the other activation in Polar's customer portal and saving the key again here activates it on this server." | Free the other activation in the portal, then save the key again. |
| No known edition | "Polar grants this key, but it belongs to no Catena edition this panel knows. The paid features are off." | Check which product the key was issued for in the portal. |
| Unreachable | "Polar has not been reachable since {date}, beyond the 48-hour grace. The paid features are off until Polar answers again; the server keeps asking every hour." | Restore outbound access to Polar; the features return at the first successful check. |
| Clock behind | "This server's clock is behind the date of its last licence check. The paid features are off until the clock is right again; once it is, saving the key unlocks them at once." | Correct the server's clock, then save the key. |

## What locks on a lapse, and what never does

When Polar stops granting the key, or the grace period ends:

- The paid panels turn into greyed entries under **Catena Pro** or **Catena Business**. Each opens an explanation of the feature, the edition that includes it and a **Subscribe** button.
- Every schedule is turned off, since turning one on needs a paid edition. The saved choices are kept and return with the subscription.
- Paid actions are refused, and extra domains beyond the primary one stop being served (they stay stored).
- A banner on every admin page links to the **Subscription** section with the reason, one entry is added to the **Log**, and one email goes to the admin address through the configured mail service (English then French). With no mail service set, the banner and the log entry are the only notices. See [Outgoing email](/en/configuration/email/).

What never locks: applications and their data, manual backups, whole-server restores, updates started by hand, single sign-on and monitoring. A missing, refused or unconfirmed key leaves the server on Catena Community and never blocks an installation or access to data.

## Troubleshooting

- The status stays on "Waiting": check that the server can reach Polar over HTTPS, then save the key again to ask at once.
- "Refused" right after a rebuild or restore: the new machine is a different server to Polar. Free the old activation in the customer portal first.
- A panel is still greyed after saving: the saved edition does not include it. The **Edition** line shows what the key grants.
- An **Unanswered activation** line is shown: an activation reached Polar but its answer was lost, so Polar may count this server's seat as taken while the server does not know it. Free this server's activation, labelled with its domain, in Polar's customer portal, then save the key again.
