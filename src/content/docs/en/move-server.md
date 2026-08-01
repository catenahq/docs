---
title: "Moving to another server"
description: "Move applications and data onto a new server, with the old one still serving until the last few minutes, and a way back the whole time."
---

Servers get replaced. A machine gets outgrown, a provider changes its
pricing, the data needs to sit in a different country, or a box has
been running long enough that starting fresh is preferable.

Moving is a paid-plan feature, and the admin panel does it from the
**Restore** page, under **Move another server here**. It runs on the
NEW server. It reaches back to the old one, brings its data across, and
takes over its web address.

## What actually happens, and when the applications are down

Almost all the work happens while the old server is still serving every
request. That is the whole design:

1. **Before anything stops.** The new server copies the bulk of the
   data across, fetches every application image it will need, and
   registers itself with the network that will route to it. Users
   notice nothing. This is the part that takes hours when there is a
   lot of data.
2. **The short window.** The old server pauses its applications, takes
   one final backup, and that backup is checked. Then it goes out of
   service, the new server puts the last few minutes of changes in
   place, and the web address moves over.
3. **After.** The new server serves the applications with the data.
   The old one is stopped but intact.

So the time the applications are unavailable is the second part only:
the changes since the copy, plus one address change. Minutes, not
hours, and it does not grow with the amount of data -- only with how
much changed during the wait.

## What is needed first

- **Both servers on the same version.** The move refuses to start if
  they were installed from different versions, before it touches
  anything. The older one is updated first; the panel says which is
  which.
- **The old server's private-network address.** Not its web address.
  Its web address is exactly what is about to point at the new server,
  so it cannot be used to reach the old one during the move. The
  private address is in the Tailscale device list.
- **The old server's backup keys**, entered on the new server's Restore
  page under **Another server's backups**. Same values as
  [Rebuilding a server from backup](/en/self-restore/). They are
  held in memory only.
- **A window opened on the old server.** See below.

## Giving permission, on the old server

Nothing can move a server without someone opening the door on it
first. On the OLD server's admin panel, the **Migration** page allows a
migration. It shows a short code, once.

That code is the permission. The new server cannot do a single thing to
the old one without it -- not pause it, not stop it, not read its
state. The old server keeps only a scrambled form of the code, so a
copy of its backups carries no way in.

Two things worth knowing about it:

- **The window closes on its own** after a few hours if nobody uses it,
  and closing it stops the old server listening at all.
- **Repeated wrong codes close it too**, rather than slowing down. A
  lost code is replaced by allowing a migration again: that mints a new
  one and invalidates the old.

Requests between the two servers travel over the client's own private
network and nowhere else. The old server will not answer anything it
cannot name as one of those devices.

## Running the move

On the NEW server:

1. Open the admin panel, go to **Restore**, and enter the old server's
   backup keys under **Another server's backups**.
2. Under **Move another server here**, enter the old server's
   private-network address and the code it showed.
3. Leave **Preparation passes** at 1 unless a long wait is expected
   before the switch-over. Each extra pass copies only what changed
   since the one before it, so more passes make the final unavailable
   period shorter and cost bandwidth to do it.
4. Read the warning, confirm, and start.

The progress view names the step it is on. Everything up to **Checking
that backup** is reversible; after **Taking the other server out of
service** it is not, and the page says so before the start.

## Calling it off

Up to and including the check on the final backup, stopping the move
puts the old server back into service by itself. Nothing has started on
the new server, the web address still points at the old one, and its
applications come back. A retry can follow at any time.

After the old server has been taken out of service, that no longer
happens automatically, and the reason matters: the new server may
already hold part of the old one's data and its settings. Starting both
at once would have two servers writing to the same storage and sending
mail as the same domain, quietly corrupting each other. So the move
stops, reports that the old server is out of service and was not put
back, and offers the choice:

- **Fix what failed and run the move again.** It carries on from where
  it stopped and does not copy everything a second time.
- **Put the old server back into service.** The page has a button for
  it, on the same page. The web address still points there, so users
  are served again as soon as it comes up.

The way back keeps working even after the old server has stopped
everything else. That is deliberate: the one request it still answers
is the one that puts it back.

## After the move

The old server is stopped, not erased. Its data is untouched and its
place in the network is still registered, which is what makes going
back a single change rather than a rebuild. It stays that way until the
new server has proven itself -- a day, a week, whatever feels right.

Its backups are also untouched, so even once the machine is gone, the
data it held is still restorable onto anything.

Retiring a server is a separate, deliberate act. It is not part of the
move, and nothing in the move does it.

## Which page covers which situation

- Moving to a new server: **this page.**
- The server is running and its data is wrong:
  [Restoring data](/en/restore-data/).
- The server is gone: [Rebuilding a server from
  backup](/en/self-restore/).
- The cause is unclear: [Recovering from a
  failure](/en/disaster-recovery/) maps each situation to its path.
