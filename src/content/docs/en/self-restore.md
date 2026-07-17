---
title: "Rebuilding your server from backup"
description: "If your server is lost, it can be rebuilt from your backup using only your recovery keyset."
---

If your server is ever lost -- hardware failure, a datacentre
incident, an accidental wipe, ransomware -- it can be rebuilt from
your latest backup. You do not have to reassemble anything by hand,
and you do not have to remember any of the internal settings or
passwords your applications use.

## The one thing you keep: your recovery keyset

Everything needed to bring your server back comes down to three
items. Keep them in your password manager, each as its own clearly
labelled entry:

- The **backup repository location** -- the address of your backup
  storage plus the bucket name (where your backups live).
- The **storage keys** for that bucket -- an access key and a secret
  key, paired.
- Your **backup encryption password** -- the key that unlocks the
  encrypted backup.

That is the whole keyset. As long as those three survive somewhere
other than the server itself, your data is recoverable.

## Everything else comes back on its own

Your backup is encrypted end to end and carries far more than your
files. Every internal setting and every secret your applications
rely on -- database passwords, sign-in configuration, mail settings --
is inside that encrypted backup. When your data is restored, all of
it returns automatically. There is nothing to re-enter and no list
of credentials to type back in.

That is why the keyset is short: the three items above are the only
things that live *outside* the backup, so they are the only things
you have to keep yourself.

## How a rebuild happens

You run the rebuild yourself with a single command, and it is quick:

1. Rent a fresh VPS (any provider).
2. From your Catena checkout, run `catena recover`. It prompts for your
   recovery keyset, then prepares the box, restores your latest
   snapshot, brings the apps back, and validates.
3. Your applications come back with their data and settings intact.

Your only job ahead of time is keeping your recovery keyset safe. The
moment you realize the server is gone, you can start the rebuild -- it
is a routine command, not a special project. Prefer a hand the first
time you run it? Reach your Catena contact -- optional, not required.

## Why each part of the keyset matters

The backup is protected so that only you (and the people you trust
with the keyset) can read it:

- The **encryption password** unlocks the data.
- The **storage keys** let the restore read your bucket.
- The **repository location** says where to look.

All three are required together. Without the encryption password,
the backup is unreadable ciphertext to anyone -- which is exactly
why you hold it, and why losing it is the one case that cannot be
recovered. [Recurring tasks](/en/disaster-prevention/) walks
through how to store the keyset so this never happens.

## What comes back, and what you might lose

Restored automatically from the backup: your databases, your
application settings, the files most applications store locally, and
the underlying system configuration.

The only thing at risk is whatever changed between the last backup
and the moment the server was lost -- minutes to a day, depending on
your backup schedule. [Where is my data](/en/where-is-my-data/)
explains exactly what lives where, and the
[Recovering from a failure](/en/disaster-recovery/) page maps each "what
broke" situation to its recovery path.

## If you use Nextcloud with S3 file storage

Some file-heavy setups keep Nextcloud's uploaded files in their own
storage bucket, separate from the backup. That bucket survives
independently of the server: if the server is lost, the files are
still in the bucket, and when the rebuilt Nextcloud reconnects to
the same bucket, every file is there.
[Where is my data](/en/where-is-my-data/) covers this in detail.

## Keep an offline copy

If your server is down and you need these instructions to bring it
back, the documentation site will not help you if it is on the same
path. Save the pages you would want during an incident -- this one
plus [Recovering from a failure](/en/disaster-recovery/) and
[Where is my data](/en/where-is-my-data/) -- to your laptop with your
browser's "Save Page As..." (or print them to PDF) at hand-off, and
refresh the copy once a year.
