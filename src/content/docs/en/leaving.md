---
title: "Leaving Catena"
description: "How to run, back up, and restore your suite without Catena, and how to move away entirely. Your data is never locked in."
---

Catena is a convenience layer over standard, open tools. Everything you
own lives in formats you can read and restore with those tools alone, so
leaving costs you convenience, never your data. This page shows exactly
how, and these are the same commands Catena itself runs behind the
buttons.

<!-- Maintainers: the commands on this page are exercised verbatim by the
     sovereign_exit rehearsal. If you change a command here, update the
     rehearsal in the same change, and vice versa. -->

## What you own and where it lives

- **Application data** - each application keeps its data in its own
  standard format (its database and files) on your server, exactly as a
  standalone install of that application would. See
  [Where is my data?](/en/where-is-my-data/).
- **Backups** - a standard [restic](https://restic.net/) repository in
  your own storage bucket. Any computer with restic installed can read
  it, forever.
- **Settings and internal credentials** - a readable file on your server
  at `/etc/catena/config.json`, included in every backup.
- **Sign-on accounts** - stored by Keycloak, the open-source sign-on
  service, in its own database on your server; exportable with
  Keycloak's own tools.

## The three things to keep

Your [recovery keyset](/en/disaster-prevention/) is the only thing that
must live outside your server: the backup repository address, the
storage access keys, and the backup password. With those three items and
any computer, your data is recoverable - with or without Catena.

## Back up without the panel

The admin panel's backup button starts a system service on your server.
You can start the same service yourself:

```sh
sudo systemctl start catena-backup.service
```

To work with the backup repository directly, load the connection
settings your server already stores, then use plain restic:

```sh
sudo bash -c 'set -a; . /etc/catena/backup.env; set +a; restic snapshots'
```

## Restore without the panel

Restore any file or folder from the latest snapshot with plain restic,
using only the settings on your server:

```sh
sudo bash -c 'set -a; . /etc/catena/backup.env; set +a; \
  restic restore latest --target / --include /path/to/restore'
```

Applications are ordinary containers. See what is running and start or
stop anything with standard Docker commands:

```sh
docker ps
docker start <name>
```

For a whole-server rebuild from your keyset alone, follow
[Restore your server yourself](/en/self-restore/). That flow uses the
freely available installer and works without the admin panel.

## Move away entirely

1. **Export what you need** with each application's own tools (every
   application in the catalog has a standard export path; see its page
   under Applications).
2. **Point your domain elsewhere** at your DNS provider whenever you are
   ready; nothing on the server depends on Catena to keep serving until
   you do.
3. **Keep your backups** - the restic repository in your bucket stays
   readable with restic alone, for as long as you keep the keyset.

Deleting the admin panel itself changes nothing about your data or your
running applications. It is a display and convenience layer; removing it
is rehearsed as part of Catena's [continuous validation](/en/trust/how-we-validate/).

## What you give up

The automation and the convenience: one-command recovery, monitoring
wiring, managed updates, and the panel itself. Never your data, and
never the ability to run what you already have.
