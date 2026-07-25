---
title: "Moving to another server"
description: "Move your applications and data onto a new server, with the old one still serving until the last few minutes, and a way back the whole time."
---

Servers get replaced. You outgrow the one you have, your provider
changes their pricing, you want your data in a different country, or a
machine has been running long enough that you would rather start fresh.

Moving is a paid-plan feature, and the admin panel does it from the
**Restore** page, under **Move another server here**. You run it on the
NEW server. It reaches back to the old one, brings its data across, and
takes over its web address.

## What actually happens, and when you are down

Almost all the work happens while the old server is still serving every
request. That is the whole design:

1. **Before anything stops.** The new server copies the bulk of your
   data across, fetches every application image it will need, and
   registers itself with the network that will route to it. Your users
   notice nothing. This is the part that takes hours if you have a lot
   of data.
2. **The short window.** The old server pauses its applications, takes
   one final backup, and that backup is checked. Then it goes out of
   service, the new server puts the last few minutes of changes in
   place, and the web address moves over.
3. **After.** The new server serves your applications with your data.
   The old one is stopped but intact.

So the time your applications are unavailable is the second part only:
the changes since the copy, plus one address change. Minutes, not
hours, and it does not grow with how much data you have -- only with
how much changed while you waited.

## What you need first

- **Both servers on the same version.** The move refuses to start if
  they were installed from different versions, before it touches
  anything. Update the older one first; the panel tells you which is
  which.
- **The old server's private-network address.** Not its web address.
  Its web address is exactly what is about to point at the new server,
  so it cannot be used to reach the old one during the move. You will
  find the private address in your Tailscale device list.
- **The old server's backup keys**, entered on the new server's Restore
  page under **Another server's backups**. Same values as
  [Rebuilding your server from backup](/en/self-restore/). They are
  held in memory only.
- **A window opened on the old server.** See below.

## Giving permission, on the old server

Nothing can move your server without someone opening the door on it
first. On the OLD server's admin panel, open the **Migration** page and
allow a migration. It shows you a short code, once.

That code is the permission. The new server cannot do a single thing to
the old one without it -- not pause it, not stop it, not read its
state. The old server keeps only a scrambled form of the code, so a
copy of its backups carries no way in.

Two things worth knowing about it:

- **The window closes on its own** after a few hours if nobody uses it,
  and closing it stops the old server listening at all.
- **Repeated wrong codes close it too**, rather than slowing down. If
  you lose the code, allow a migration again: that mints a new one and
  invalidates the old.

Requests between the two servers travel over your own private network
and nowhere else. The old server will not answer anything it cannot
name as one of your own devices.

## Running the move

On the NEW server:

1. Open the admin panel, go to **Restore**, and enter the old server's
   backup keys under **Another server's backups**.
2. Under **Move another server here**, enter the old server's
   private-network address and the code it showed you.
3. Leave **Preparation passes** at 1 unless you expect a long wait
   before you are ready to switch over. Each extra pass copies only
   what changed since the one before it, so more passes make the final
   unavailable period shorter and cost bandwidth to do it.
4. Read the warning, confirm, and start.

The progress view names the step it is on. Everything up to **Checking
that backup** is reversible; after **Taking the other server out of
service** it is not, and the page says so before you start.

## Calling it off

Up to and including the check on the final backup, stopping the move
puts the old server back into service by itself. Nothing has started on
the new server, your web address still points at the old one, and its
applications come back. You can retry whenever you like.

After the old server has been taken out of service, that no longer
happens automatically, and the reason matters: the new server may
already hold part of the old one's data and its settings. Starting both
at once would have two servers writing to the same storage and sending
mail as the same domain, quietly corrupting each other. So the move
stops, tells you the old server is out of service and was not put back,
and gives you the choice:

- **Fix what failed and run the move again.** It carries on from where
  it stopped and does not copy everything a second time.
- **Put the old server back into service.** The page has a button for
  it, on the same page. Your web address still points there, so your
  users are served again as soon as it comes up.

The way back keeps working even after the old server has stopped
everything else. That is deliberate: the one request it still answers
is the one that puts it back.

## After the move

The old server is stopped, not erased. Its data is untouched and its
place in the network is still registered, which is what makes going
back a single change rather than a rebuild. Keep it that way until you
are satisfied with the new server -- a day, a week, whatever you are
comfortable with.

Its backups are also untouched, so even after you take the machine
away, the data it held is still restorable onto anything.

When you are ready to be rid of it, retiring a server is a separate,
deliberate act. It is not part of the move, and nothing in the move
does it for you.

## Which page do I want?

- Moving to a new server: **this page.**
- The server is running and its data is wrong:
  [Restoring your data](/en/restore-data/).
- The server is gone: [Rebuilding your server from
  backup](/en/self-restore/).
- Not sure what broke: [Recovering from a
  failure](/en/disaster-recovery/) maps each situation to its path.
