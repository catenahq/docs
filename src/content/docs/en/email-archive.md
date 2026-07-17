---
title: "Email archive"
description: "How your email, calendar, and contacts are captured from your provider into your own backups -- what it protects against, and how to switch it on."
---

Your email lives at your mail provider, and you keep using it the way
you always have -- webmail, your phone app, your desktop client.
Nothing about your day-to-day changes. The archive is a safety net that
sits behind it.

## How it works

Once you connect a mailbox (see [How to set it up](#how-to-set-it-up)),
your VPS pulls a copy of every message, calendar event, and contact
from your provider into the same backup pipeline that protects the rest
of your data. It refreshes with each backup.

The archive is **append-only**: once a message has been pulled, it
stays in the archive even if you later delete it at the provider. That
is deliberate -- a backup is useless if normal use can wipe it. Because
it rides in the same encrypted backup as everything else, it comes back
automatically in a full restore.

## What it protects against

- **Account take-over.** Someone steals your password and clears out
  the mailbox. The archive still holds everything captured as of the
  most recent backup.
- **Billing dispute / account locked.** The provider closes your
  account before you have exported anything. The archive doesn't go
  away.
- **Accidental delete.** Someone empties the trash to free up space.
  The archive keeps it.

## What it is not

- **It is not your inbox.** You read and reply through the provider the
  way you always have. The archive is a safety net, not a mail client.
- **It is not real-time.** The mirror refreshes with each backup, not
  the instant mail arrives. A message that lands and is deleted between
  two backups is not captured. Don't treat the archive as a "trash
  can".
- **It is not browsable in Nextcloud Files yet.** The archive lives in
  a part of your VPS that isn't directly browsable today. To retrieve a
  specific message from it, [pull it from a backup
  snapshot](#restoring-a-message). Direct browsing lands in a later
  release.

## How to set it up

One-time, per person on the team:

1. Open **Nextcloud**, click the top-right menu, then **Mail**.
2. Click **Add account** and fill in the connection details for your
   mailbox (host, port, and your address -- from your mail provider).
3. **Important:** use an **application password**, not your main
   account password. Your provider has a screen for generating them;
   check its docs for the exact page.
4. Once Nextcloud Mail can connect and see your inbox, you're done. The
   next backup picks the account up.

Turn on multi-factor authentication at your mail provider before you
switch the archive on -- an archived account with a weak password is a
liability, not a safety net.

## Restoring a message

Until in-Files browsing ships, retrieve it yourself from a backup
snapshot in the catena-admin panel: open **Actions -> Browse past
snapshots**, pick a point in time, and read the archived message
straight out of the read-only mount. To pull more than one thing at
once, use **Export snapshot** and open the download.

For full disaster recovery -- provider gone, VPS gone, both at once --
the [Recovering from a failure](/en/disaster-recovery/) page covers the
path. The archive comes back as part of that flow because it sits in
the same backup as everything else.

## Shared mailboxes (`info@`, `billing@`, `support@`)

These work best routed into your team chat or your help-desk app
(`Rocket.Chat Omnichannel`, `Zammad`, or an `n8n` flow) rather than
archived as raw email. Each conversation then lives in an app whose
database your VPS already backs up. Set this up when you deploy those
apps.
