---
title: "Email archive"
description: "How your email, calendar, and contacts are backed up from your external provider."
---

Your email lives at the provider your operator picked during setup
(Migadu, Mailbox.org, Hostpoint, Infomaniak, or OVH). You keep using
it the way you always have — webmail, your phone app, your desktop
client. Nothing changes there.

What's new: each night, your VPS pulls a copy of every message,
calendar event, and contact from your provider into the same backup
pipeline that protects the rest of your data. If your provider
account ever goes wrong — compromised, billing dispute, accidental
delete — the history is still in your operator's keeping.

## What this protects against

- **Account take-over.** Someone steals your password and clears
  out the mailbox. The archive holds everything that was there at
  the most recent nightly run.
- **Billing dispute / account locked.** The provider closes your
  account before you've exported anything. The archive doesn't go
  away.
- **Accidental delete.** Someone empties the trash to free up space.
  The archive keeps it.

The archive is **append-only**: once we've pulled a message, it stays
in the archive even if you delete it at the provider. This is
deliberate. Backups are useless if normal use can wipe them.

## What this is NOT

- **It is not your inbox.** You read and reply through the provider
  the way you always have. The archive is a safety net.
- **It is not real-time.** The mirror runs once a night. A message
  that arrives at 11pm and gets deleted at 7am the next morning,
  before the 3am run, is not in the archive. Don't rely on the
  archive as a "trash can".
- **It is not visible in Nextcloud Files today.** The archive lives
  in a part of your VPS that's not directly browsable yet. If you
  ever need to retrieve a specific message or calendar entry from
  the archive, contact your operator and they will pull it out.
  We'll add direct browsing in a later release.

## How to set it up

One-time, per person on the team:

1. Open **Nextcloud** and click the top-right menu, then **Mail**.
2. Click **Add account** and fill in the connection details your
   operator gave you during onboarding.
3. **Important**: use an **application password**, not your main
   account password. Your provider has a screen for generating
   them (your operator will point you at the right page for your
   specific provider).
4. Once Nextcloud Mail can connect and see your inbox, you're done.
   The next nightly run picks the account up.

Multi-factor authentication on the provider account is part of the
onboarding checklist; your operator confirms it's on before flipping
this archive on.

## Restoring a message

Until in-Files browsing ships, recovery is a one-line conversation
with your operator: tell them roughly when the message was sent or
received and to whom, and they pull it from the archive.

For full disaster recovery — provider gone, VPS gone, both at the
same time — the [Disaster recovery](/disaster-recovery/) page covers
the path. The archive comes back as part of that flow because it
sits in the same backup as everything else.

## Shared mailboxes (`info@`, `billing@`, `support@`)

These work best routed into your team chat or your help-desk app
(`Rocket.Chat Omnichannel`, `Zammad`, or an `n8n` flow) rather than
archived as raw email. Each conversation then lives in an app whose
database your VPS already backs up. Your operator sets this up at
onboarding.
