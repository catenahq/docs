---
title: "Rebuilding a server from backup"
description: "A lost server can be rebuilt from its backup using only the recovery keyset."
---

If a server is ever lost -- hardware failure, a datacentre
incident, an accidental wipe, ransomware -- it can be rebuilt from
its latest backup. Nothing has to be reassembled by hand, and none of
the internal settings or passwords the applications use have to be
remembered.

## The one thing to keep: the recovery keyset

Everything needed to bring a server back comes down to three
items. They belong in a password manager, each as its own clearly
labelled entry:

- The **backup repository location** -- the address of the backup
  storage plus the bucket name (where the backups live).
- The **storage keys** for that bucket -- an access key and a secret
  key, paired.
- The **backup encryption password** -- the key that unlocks the
  encrypted backup.

That is the whole keyset. As long as those three survive somewhere
other than the server itself, the data is recoverable.

## Everything else comes back on its own

The backup is encrypted end to end and carries far more than files.
Every internal setting and every secret the applications rely on --
database passwords, sign-in configuration, mail settings -- is inside
that encrypted backup. When the data is restored, all of it returns
automatically. There is nothing to re-enter and no list of credentials
to type back in.

That is why the keyset is short: the three items above are the only
things that live *outside* the backup, so they are the only things
that have to be kept separately.

## How a rebuild happens

The rebuild runs from a single command, and it is quick:

1. Rent a fresh VPS (any provider).
2. From a Catena checkout, run `catena recover`. It prompts for the
   recovery keyset, then prepares the box, restores the latest
   snapshot, brings the apps back, and validates.
3. The applications come back with their data and settings intact.

The only work ahead of time is keeping the recovery keyset safe. The
rebuild can start the moment the server is known to be gone -- it is a
routine command, not a special project. A hand on the first run is
available from the Catena contact -- optional, not required.

## Why each part of the keyset matters

The backup is protected so that only the keyset holders can read it:

- The **encryption password** unlocks the data.
- The **storage keys** let the restore read the bucket.
- The **repository location** says where to look.

All three are required together. Without the encryption password,
the backup is unreadable ciphertext to anyone -- which is exactly
why it is client-held, and why losing it is the one case that cannot
be recovered. [Recurring tasks](/en/disaster-prevention/) walks
through how to store the keyset so this never happens.

## What comes back, and what may be lost

Restored automatically from the backup: the databases, the
application settings, the files most applications store locally, and
the underlying system configuration.

The only thing at risk is whatever changed between the last backup
and the moment the server was lost -- minutes to a day, depending on
the backup schedule. [Where the data lives](/en/where-is-my-data/)
explains exactly what sits where, and the
[Recovering from a failure](/en/disaster-recovery/) page maps each "what
broke" situation to its recovery path.

## Nextcloud with S3 file storage

Some file-heavy setups keep Nextcloud's uploaded files in their own
storage bucket, separate from the backup. That bucket survives
independently of the server: if the server is lost, the files are
still in the bucket, and when the rebuilt Nextcloud reconnects to
the same bucket, every file is there.
[Where the data lives](/en/where-is-my-data/) covers this in detail.

## Keep an offline copy

A documentation site does not help during an incident if it sits on
the path that is down. The pages worth having locally -- this one plus
[Recovering from a failure](/en/disaster-recovery/) and
[Where the data lives](/en/where-is-my-data/) -- save from a browser's
"Save Page As..." (or print to PDF) at hand-off, and the copy is worth
refreshing once a year.

If the server is still running and only its data is wrong, none of
this applies: put the data back from the admin panel instead. See
[Restoring data from the admin panel](/en/restore-data/).

For file-level restores and backup commands that work without the admin
panel at all, see [Leaving Catena](/en/leaving/).
