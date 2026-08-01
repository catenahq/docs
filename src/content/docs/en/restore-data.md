---
title: "Restoring data from the admin panel"
description: "The server is running but its data is wrong: choose a backup in the admin panel and put it back, without rebuilding anything."
---

Sometimes the server is fine and the data is not. Someone deleted a
shared folder, an application update went wrong, a database ended up
in a state nobody wants. The server itself is healthy, so rebuilding
it would be the wrong tool.

For that case the admin panel has a **Restore** page: choose one of
the backups, confirm, and watch the data go back.

## What it does, and what it leaves alone

The restore replaces data and nothing else. The applications are
stopped while their data is put back, then started again with it.

What stays up the whole time: the admin panel showing the progress,
the sign-in behind it, and the connection carrying the page. That is
deliberate -- a restore is meant to be followed from start to finish
without losing the page. Read over Tailscale access or over the web,
either one keeps working.

What does not change: the server itself. There is no rebuild, no
re-installation, and nothing to re-apply afterwards.

## Running one

1. Open the admin panel and go to **Restore**.
2. Leave the source on **This server's own backups**.
3. Pick a backup from the list. Each row shows when it was taken,
   which server took it, and how big it was.
4. Read the warning, check the confirmation box, and start it.
5. Watch the progress view. It names the step it is on -- checks,
   stopping the applications, copying the data, restoring the
   databases, final checks -- and finishes with a completed message.

How long it takes depends on how much data there is, not on how
complicated the setup is. A small suite is minutes.

## Choosing which backup

The list is newest first, and every entry is a complete restore point:
there is no such thing as a partial backup in the list. The one to
pick is the most recent taken **before** the problem started.

When the backup storage holds backups from more than one server, the
page says so and shows a **Server** column. It is worth checking
before choosing: restoring another server's data over this one is the
one mistake this page cannot undo.

## Restoring onto a replacement server

When the original server is gone and a new one stands in its place,
the Restore page can read the old server's backups directly. Switch
the source to **Another server's backups** and enter that repository's
address, its password, and its storage keys -- the same recovery
keyset described in
[Rebuilding a server from backup](/en/self-restore/).

Those values are held in memory only. They are gone when the server
restarts, which is the right lifetime for something typed in to
recover one machine once. Nothing is written down anywhere that needs
cleaning up afterwards.

When the restore finishes, the new server has the old one's data and
the old one's settings. Nothing to re-enter.

## If a restore stops part-way

It will say so, and it will name the step it stopped on. Every step
can be run again, so there are two ways forward:

- **Carry on:** choose the same backup and start it again. It picks up
  where it stopped.
- **Start over:** clear the stopped restore first, then start again
  from the beginning.

The page refuses to start a second restore while one is running, and
refuses to clear one that is still going. Both refusals exist for the
same reason: two restores writing the same data at once is worse than
either problem being fixed.

## Which page covers which situation

- The server is running, the data is wrong: **this page.**
- The server is gone: [Rebuilding a server from
  backup](/en/self-restore/).
- A server that still works is being replaced: [Moving to another
  server](/en/move-server/).
- The cause is unclear: [Recovering from a
  failure](/en/disaster-recovery/) maps each situation to its path.
- Standard tools and no panel at all:
  [Leaving Catena](/en/leaving/).

## Staging a move to another server

The Restore page has one more option: **copy the data only, without
starting anything**. It puts the data on the server and stops there,
leaving every application switched off.

That is not a restore worth running by itself. It exists so a move to
another server can copy the bulk of the data ahead of time, while the
old server is still serving, and leave only the recent changes for the
short window of the switch-over. It stays unchecked for an ordinary
restore.

On a paid plan that option is not run by hand: [Moving to another
server](/en/move-server/) does the copy, the switch-over and the way
back as one operation.
