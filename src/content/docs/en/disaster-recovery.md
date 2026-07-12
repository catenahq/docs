---
title: "Disaster recovery: what to do when things go wrong"
description: "Something is already broken and you need to fix it. This page is the"
---

Something is already broken and you need to fix it. This page is the
map of "what can go wrong" + "what still works when it does" + "how to
get back from each situation." If you're reading this **before** an
incident, the companion page is [Disaster prevention](/en/disaster-prevention/)
-- that's where the off-laptop backups, off-site bucket, and your
recovery keyset live.

The short version: your software suite is designed so that **no single
accidental click can lock you out**. It takes a combination of events
to lose access, and for every scenario there's a recovery
path.

## Data-loss scenarios -- quick FAQ

If you're skimming for the one thing that matches your current
situation, this is the index. Each entry links to the page or
section that walks the recovery in detail.

| Situation | First move | Where to read more |
|---|---|---|
| **I deleted a file by accident** (one user, one file/folder) | Try the app's own trash. If empty, get in touch. | Trash first; if empty, reach your Catena contact. |
| **I lost my password or my 2FA** (just me) | Self-service password reset; for 2FA, reach your Catena contact. | Self-service reset via the portal; 2FA goes through your Catena contact. |
| **All admins are locked out at once** (lost email, lost dashboard) | Get in touch -- there is a separate recovery path that doesn't depend on email or the dashboard. | Out-of-band path (not client-side). |
| **The whole server is encrypted by ransomware** | Get in touch immediately. Recovery is from your last clean backup, before the ransomware reached the disk. | Recovery map below ("Entire server disk") |
| **The server itself is compromised by malware / unauthorized access** | Get in touch. The path is wipe + rebuild from a pre-compromise backup + rotate every secret. We own this; you receive a status update at each phase. | Recovery map below ("Entire server disk") |
| **Your provider's datacentre burns down** (or hardware failure) | Get in touch. We rebuild your software suite on a fresh server at the same or a different provider, using the off-site backup. | Recovery map below ("Entire server disk") + [Rebuilding your server from backup](/en/self-restore/) |
| **Your provider gives 48h notice / suspends the account** | Get in touch. We migrate you to a new provider on a tight timeline; expect ~30-60 minutes of public-URL downtime during cutover. | Recovery map below ("Your provider goes bankrupt") |
| **Backup provider gives 48h notice** | Get in touch. We re-target backups at a new bucket; existing data on the server is unaffected. | Recovery map below ("Backup provider goes bankrupt") |
| **I think someone else has my password / API token** | Don't wait -- get in touch and rotate the credential. | Recovery map below (per-credential rows) |

The recovery map below has the full table including infrastructure
edges (Cloudflare token rotation, Tailscale account, etc.) -- keep
reading.

## If your whole server is lost

When the server itself is gone -- destroyed, wiped, or encrypted by
ransomware -- it is rebuilt from your nightly backup. The only thing
you need to have kept is your **recovery keyset**:

- the **backup repository location** (where your backups live),
- the **storage keys** for that bucket, and
- your **backup encryption password**.

[Disaster prevention](/en/disaster-prevention/) covers how to store
those three safely. Everything else -- every internal setting and
secret your applications use -- is inside the encrypted backup and
returns automatically with your data; there is nothing to re-enter.
The [Rebuilding your server from backup](/en/self-restore/) page
walks through what a rebuild looks like.

We run the rebuild with you. Your part is to have kept the keyset
safe and to get in touch when you need it.

A few credentials do not live on your server at all -- they sit in
other companies' admin consoles: Cloudflare (DNS + tunnel), Tailscale
(remote access), and Portainer (container management). If one of
those is ever lost, you regenerate it in that provider's console and
we install it. The recovery map below lists each.

## Recovery map -- what breaks and what to do

| What you lose | What still works | How to recover |
|---|---|---|
| **Your laptop** (the device you work from) | Your server, your apps, your backups | Nothing is lost as long as your recovery keyset is saved in your password manager, not only on the laptop. Set up a new device, restore the keyset, and carry on |
| **SSH private key** | Your server, your apps, the dashboard | We re-add a new public key via our own admin path; if we're unreachable, see "Provider rescue mode" below |
| **Dashboard access (sign-in broken, sign-in service down)** | Your apps (their own logins still work), your data | We sign in to fix; worst case, restart the sign-in service |
| **One app's data (you deleted something)** | Everything else | Try the app's own trash first; if empty, get in touch |
| **Entire server disk (corruption, accidental wipe)** | Backups (in your storage bucket) | Rebuild from your backup -- see [Rebuilding your server from backup](/en/self-restore/) |
| **Cloudflare API token (accidentally rotated)** | Your tunnel keeps running. Public apps stay up. **Functionality only**, not backup. | Generate a new API token at [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens), then **get in touch** with it -- we install the new token and confirm the tunnel still picks up DNS changes after rotation. Apps stay reachable while you wait |
| **Cloudflare tunnel token (rotated or leaked)** | Existing tunnel keeps running until it next reconnects, then drops. Public apps go dark until rotation completes. **Functionality**, not backup. | This is more disruptive than the API token: public traffic stops when the tunnel can't reauthenticate. **Get in touch immediately** so we can mint and install the replacement. Find the token under [dash.cloudflare.com](https://dash.cloudflare.com) -> your zone -> **Zero Trust** -> **Networks** -> **Tunnels** -> click your tunnel -> **Configure** -> reveal/rotate token. NOT in the "API Tokens" page. Expect 5-15 minutes of public-app downtime during install |
| **Tailscale OAuth client (accidentally rotated)** | Your server's remote access keeps working. Remote administration stays up | Generate a new OAuth client, then **get in touch** with the credentials so we install it |
| **Portainer API key (accidentally rotated)** | All your apps keep running | Generate a new key in the Portainer UI, then **get in touch** with it |
| **Cloudflare account terminated** | Your server, your apps (internally), your data | Create a new Cloudflare account, point your domain to it, we re-run setup; your apps experience downtime only during DNS propagation |
| **Tailscale account terminated** | Your server, your apps, your public path (the tunnel) | We switch to a different administration method; Tailscale is only the "admin back door," not part of the public serving path |
| **Your provider goes bankrupt / shuts down** | Your backup bucket (different company) | [Rebuild from your backup](/en/self-restore/) at a different provider |
| **Your provider's datacentre burns down (OVH Strasbourg 2021)** | Your backup bucket (different region, different city) | Same as above -- rebuild on a fresh server at the same or a different provider, different region |
| **Your backup provider goes bankrupt / shuts down** | Your server and its data | You still have the data -- copy your live server to a new backup bucket *before* the deadline the provider gives you. If you set up a secondary backup (see [Prevention](/en/disaster-prevention/)), it's already safe |
| **Backup bucket accidentally deleted** | Your server and its data | Same -- recreate the bucket and repoint backups. Some providers keep deleted objects for a retention window, which might buy you time |
| **Provider AND backup provider outage at the same time** | Last weekly off-site copy (if you set one up -- see [Prevention](/en/disaster-prevention/)) | Rebuild from the off-site copy on any fresh cloud |
| **Your server is dead AND your saved logins are gone** | Your backup bucket | As long as your recovery keyset (repository location + storage keys + encryption password) is in your password manager, the backup can still be read and your server rebuilt -- follow [Rebuilding your server from backup](/en/self-restore/) |
| **Your server is dead AND your backup encryption password is lost** | Your bucket exists but every byte in it is ciphertext you can't open | **Data loss.** This is the one unrecoverable case, and exactly why [Disaster prevention](/en/disaster-prevention/) says to store your encryption password separately and safely |

## Provider rescue mode -- when you've lost SSH

Every serious hosting provider offers a "rescue mode" that lets you boot a
temporary rescue image with your existing disk mounted, so you can add
a new SSH key or recover files without re-installing. A few examples:

- **OVH**: Control Panel -> your server -> **Rescue / rescue-customer**.
  Reboot into rescue, mount your disk, add your new public key to
  `/home/ops/.ssh/authorized_keys`, reboot normally.
- **Hetzner**: Robot -> Rescue system -> enable and reboot.
- **DigitalOcean / Linode / Vultr**: each has a recovery console
  (sometimes a VNC web terminal) -- look for "Recovery" / "Console" in
  the provider's sidebar.

We can walk you through this over a video call if needed; the steps
are the same across providers, just different UI labels.

**Our remote access and the provider's rescue console are equivalent
for your purposes.** If we're reachable, we sign in and fix things.
If we're not -- or if SSH itself is broken -- the provider's rescue
console gives you the same root-level access to the disk. Either path
gets you back to a working server; the rescue console is just the
fallback when the normal one is unavailable. Don't burn time waiting
on one if the other is in front of you.

## How this plays out in practice

Most "I lost X" situations are nowhere near as bad as they feel in the
first five minutes. The site keeps serving traffic. Your database is
fine. You have 24-72 hours to handle the recovery without pressure --
everything but total disaster is survivable on a weekday morning with
a coffee.

If something in the map above doesn't match your situation, get in
touch. The whole point of the hand-off kit + this page is to give
you every path we can, but nothing replaces a second pair of eyes in a
real incident.
