---
title: "Leaving Catena"
description: "How to run, back up, and restore the suite without Catena, and how to move away entirely. The data is never locked in."
---

Catena is a convenience layer over standard, open tools. Everything on
the server lives in formats those tools alone can read and restore, so
leaving costs convenience, never data. This page shows exactly how, and
these are the same commands Catena itself runs behind the buttons.

<!-- Maintainers: the commands on this page are exercised verbatim by the
     sovereign_exit rehearsal. A command changed here is changed in the
     rehearsal in the same commit, and vice versa. -->

## What is owned, and where it lives

- **Application data** - each application keeps its data in its own
  standard format (its database and files) on the server, exactly as a
  standalone install of that application would. See
  [Where the data lives](/en/where-is-my-data/).
- **Backups** - a standard [restic](https://restic.net/) repository in
  a client-owned storage bucket. Any computer with restic installed can
  read it, forever.
- **Settings and internal credentials** - a readable file on the server
  at `/etc/catena/config.json`, included in every backup.
- **Sign-on accounts** - stored by Keycloak, the open-source sign-on
  service, in its own database on the server; exportable with
  Keycloak's own tools.

## The three things to keep

The [recovery keyset](/en/disaster-prevention/) is the only thing that
must live outside the server: the backup repository address, the
storage access keys, and the backup password. Those three items plus
any computer make the data recoverable - with or without Catena.

## Back up without the panel

The admin panel's backup button starts a system service on the server.
The same service starts by hand:

```sh
sudo systemctl start catena-backup.service
```

Working with the backup repository directly means loading the
connection settings the server already stores, then using plain restic:

```sh
sudo bash -c 'set -a; . /etc/catena/backup.env; set +a; restic snapshots'
```

## Restore without the panel

Any file or folder restores from the latest snapshot with plain restic,
using only the settings on the server:

```sh
sudo bash -c 'set -a; . /etc/catena/backup.env; set +a; \
  restic restore latest --target / --include /path/to/restore'
```

Applications are ordinary containers. Standard Docker commands show
what is running and start or stop anything:

```sh
docker ps
docker start <name>
```

A whole-server rebuild from the keyset alone follows
[Rebuilding a server from backup](/en/self-restore/). That flow uses the
freely available installer and works without the admin panel.

## Move away entirely

1. **Export what is needed** with each application's own tools (every
   application in the catalog has a standard export path; see its page
   under Applications).
2. **Point the domain elsewhere** at the DNS provider whenever the time
   comes; nothing on the server depends on Catena to keep serving until
   then.
3. **Keep the backups** - the restic repository in the bucket stays
   readable with restic alone, for as long as the keyset is kept.

Deleting the admin panel itself changes nothing about the data or the
running applications. It is a display and convenience layer; removing it
is rehearsed as part of Catena's [continuous validation](/en/trust/).

## What is given up

The automation and the convenience: one-command recovery, monitoring
wiring, managed updates, and the panel itself. Never the data, and
never the ability to run what is already there.
