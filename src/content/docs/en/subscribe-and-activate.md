---
title: "Subscribe and activate"
description: "What Catena Pro and Catena Business unlock, where the subscription key is, how to save it in the admin panel, what each status means, and what happens when a subscription lapses."
---

Catena Community is free and runs every application with all of its
data. Catena Pro and Catena Business add features to the admin panel. A
subscription comes with a subscription key, which is saved in the admin
panel's **Settings** page and checked with Polar, the service that sells
the subscriptions.

## What each edition unlocks

Catena Business includes everything in Catena Pro.

| Admin panel feature | What it does | Edition |
|---|---|---|
| **Managed updates** | The nightly maintenance: back up the server, check the backup, copy it offsite, then move components and applications to newer versions, putting one back if it makes the server less healthy than it was. A run can also be started on demand. | Catena Pro |
| **Domains** | Attaches more Cloudflare domains to the server, each with its own separate sign-in, so one server can serve several organizations or brands. | Catena Pro |
| **People** | Create, rename and delete the groups that decide which applications people reach, add people to them and disable accounts. The panel shows who would lose access before a group changes. | Catena Pro |
| **Migration** | Moves the server's applications and data to another Catena server, or another server's onto this one. See [Moving to another server](/en/move-server/). | Catena Pro |
| **Restore report** | Proof that the backups restore: a daily restore test into a scratch area, the offsite copy verification, the recovery time, and a restore test on demand. | Catena Pro |
| **Audit log** | Every administrative action taken on the server, kept in a chain where any later change shows, exportable to a file. | Catena Business |
| **Compliance report** | A print-ready report on where the data lives, the subprocessors, the latest restore test and the exposed ports, with a Law 25 readiness checklist. | Catena Business |

Either subscription also allows turning on schedules, and runs the
copy of every backup bucket into offsite storage.

## Licences unlock panel features only

Applications and their data keep running without a subscription, and
after one ends. Backups, restores and updates started by hand keep
working too. A missing, refused or unconfirmed key leaves the server on
Catena Community with a stated reason; it never blocks installation and
never blocks access to the data.

## Buying a subscription

The pricing section of the website lists the editions:
[Catena pricing](https://catena.run/en/#pricing). A paid feature that a
server's subscription does not include is greyed in the admin panel's
menu, under Catena Pro or Catena Business. It opens a short explanation
of what the feature does, which edition includes it, and a **Subscribe**
button to the same pricing section.

## Where the key is

The subscription key is in Polar's customer portal. The **Settings**
page links to it under **Subscription**: **Manage the subscription in
Polar's customer portal**.

## Saving the key

In the admin panel, **Settings**, section **Subscription**, the
**Subscription key** field takes the key. The key is never shown again
once saved; the section shows a short fingerprint of it instead, with
the licensee name, the edition and the status. Leaving the field blank
keeps the saved key.

Saving stores the key on the server and asks Polar about it at once,
which takes the server's seat if the key holds none here. A new or
renewed key takes effect as soon as it is saved, and the features it
unlocks appear without waiting for the hourly check. The section then
reports one of four results:

- "Saved. Polar confirmed the key on this server."
- "Saved. Polar could not be reached to check the key; the server asks
  again every hour."
- "Saved. The key unlocks no paid feature on this server; the reason is
  below."
- "Saved. The check with Polar did not finish; the server asks again
  every hour."

## What each status means

The **Status** line of the section says one of the following sentences.
The bold names are labels used on this page, and text in square
brackets is filled in with the date from the server.

- **No key saved:** "No subscription key is saved. The paid features
  are off."
- **Waiting for Polar:** "The key is saved and Polar has not answered
  about it for this server yet. The paid features stay off until it
  does; the server asks every hour, and saving the key asks at once."
- **Active:** "Active. Polar last confirmed the key on this server at
  [date of the last confirmation]."
- **Active within the grace period:** "Active within the grace period:
  Polar has not been reachable since [date of the last confirmation].
  The paid features stay on until [end of the grace period], and the
  server keeps asking every hour."
- **Not granted:** "Polar does not grant this key on this server: the
  subscription was cancelled or has lapsed, the key was revoked or
  replaced, or this server's activation was freed in the customer
  portal. The paid features are off. Once the subscription is active,
  saving the key again activates it here."
- **Refused:** "Polar refused to activate this key on this server: it
  is active on another server (a key is active on one server at a
  time), or it is revoked, disabled or expired. Freeing the other
  activation in Polar's customer portal and saving the key again here
  activates it on this server."
- **No known edition:** "Polar grants this key, but it belongs to no
  Catena edition this panel knows. The paid features are off. Support
  can check which product the key was issued for."
- **Unreachable:** "Polar has not been reachable since [date of the last
  confirmation], beyond the 48-hour grace. The paid features are off
  until Polar answers again; the server keeps asking every hour."
- **Clock behind:** "This server's clock is behind the date of its last
  licence check. The paid features are off until the clock is right
  again; once it is, saving the key unlocks them at once."

The **Last error** line gives the reason in the server's words when the
last check got no answer from Polar, or the server's own files could not
be read.

## One server per key

A key is active on one server at a time. The server's activation is
bound to its hardware identity, so a clone of a server, or a restore
onto other hardware, is a different server to Polar and is refused while
the key's seat is taken.

Moving a key to another server takes two steps:

1. Free the seat held by the old server, in Polar's customer portal.
2. Save the key on the new server, in **Settings**, section
   **Subscription**.

The old server finds out at its next hourly check: its status becomes
Not granted and its paid features lock. A key whose seat was
freed is not taken back by the old server on its own.

## The hourly check and the grace period

Every server asks Polar about its saved key once an hour, at its own
fixed offset into the hour. A server with no saved key asks nothing.
Between checks, the features follow the last answer, with no network
needed.

- When Polar refuses the key, the paid features lock at once.
- When Polar cannot be reached (network failure, a server error from
  Polar, or a rate limit), the paid features stay on for 48 hours after
  the last confirmation. The status is Active within the grace period
  and shows when the grace ends. Past 48 hours the status is
  Unreachable and the features lock until Polar answers again.

## What locks on a lapse

When a subscription lapses, or Polar refuses the key, or the grace
period ends:

- The paid panels turn into the greyed explanations described above.
- A banner on every admin page links to the **Subscription** section,
  which gives the reason.
- Paid actions are refused, and the paid scheduled lanes (managed
  updates, the offsite copy, the migration lane) are skipped. "Schedules
  can be turned on with a Catena license"; until then every job can
  still be run by hand from the **Actions** page.
- Applications, their data, and backups, restores and updates started
  by hand keep working.

The server unlocks the features at the first check where Polar grants
the key again, or at once when the key is saved again.

## The lock email

The first time a check locks a server that had a paid edition, the admin
receives one email, in English then French in the same message. It
names the server's domain and says:

- that the paid administration features are locked;
- why: the subscription was cancelled or lapsed, the key was revoked or
  replaced, or the activation was freed in the customer portal; or
  Polar refused to activate the key on this server; or Polar has not
  been reachable since a given date and the 48-hour grace is over;
- that only the administration features are locked, and applications,
  their data, backups, restores and manual updates keep working;
- the link to Polar's customer portal;
- that the server checks the key every hour and unlocks the features as
  soon as Polar grants it again, and that a key whose activation was
  freed is activated again by saving it in **Settings**.

The email goes to the administrator email set at install, through the
mail relay configured in **Settings**. The next check finds the server
already locked and sends nothing more. The lock is also recorded in the
admin panel's **Log**, in the language of the page. With no mail relay
configured, the log entry and the banner are the only notices.
