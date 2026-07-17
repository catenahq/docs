---
title: "Recovering from a failure"
description: "Something is already broken and you need to fix it. This page is the"
---

Something is already broken and you need to fix it. This page is the
map of "what can go wrong" + "what still works when it does" + "how to
get back from each situation." If you're reading this **before** an
incident, the companion page is [Recurring tasks](/en/disaster-prevention/)
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
| **I deleted a file by accident** (one user, one file/folder) | Try the app's own trash. If empty, browse a backup snapshot in catena-admin (**Actions -> Browse past snapshots**) and pull the file out. | Recovery map ("one app's data") |
| **I lost my password or my 2FA** (just me) | Self-service password reset from the sign-in page. For 2FA, another admin clears it in Keycloak. | [Manage users and roles](/en/manage-users-and-roles/) |
| **All admins are locked out at once** (sign-in broken, nobody can open the dashboard) | Use your Tailscale access -- SSH into the box, where you can restart or re-provision the sign-in service. | [Regaining admin access](#regaining-admin-access) below |
| **The whole server is encrypted by ransomware** | Rebuild from your last clean snapshot (before the ransomware), with `catena recover` onto a fresh box. | Recovery map ("entire server disk") |
| **The server itself is compromised** | Wipe and rebuild from a pre-compromise snapshot (`catena recover --snapshot <id>`), then rotate every external credential. | Recovery map ("entire server disk") |
| **Your provider's datacentre burns down** (or hardware failure) | Rebuild on a fresh server at any provider from the off-site backup (`catena recover`). | [Rebuilding your server from backup](/en/self-restore/) |
| **Your provider gives 48h notice / suspends the account** | Rent a VPS elsewhere and `catena recover` onto it; expect ~30-60 min of public-URL downtime during cutover. | Recovery map ("provider goes bankrupt") |
| **Backup provider gives 48h notice** | Point backups at a new bucket in catena-admin **Settings**; server data is unaffected. | Recovery map ("backup provider goes bankrupt") |
| **I think someone else has my password / API token** | Don't wait -- rotate the credential in its console now (and `catena rotate-tunnel` / `catena rotate-tailscale` for those two). | Recovery map (per-credential rows) |

The recovery map below has the full table including infrastructure
edges (Cloudflare token rotation, Tailscale account, etc.) -- keep
reading.

## If your whole server is lost

When the server itself is gone -- destroyed, wiped, or encrypted by
ransomware -- it is rebuilt from your latest backup. The only thing
you need to have kept is your **recovery keyset**:

- the **backup repository location** (where your backups live),
- the **storage keys** for that bucket, and
- your **backup encryption password**.

[Recurring tasks](/en/disaster-prevention/) covers how to store
those three safely. Everything else -- every internal setting and
secret your applications use -- is inside the encrypted backup and
returns automatically with your data; there is nothing to re-enter.
The [Rebuilding your server from backup](/en/self-restore/) page
walks through what a rebuild looks like.

You run the rebuild yourself with `catena recover`: it prompts for the
keyset, restores your latest snapshot onto the new box, and brings
every app back with its data and settings. Your only job ahead of time
is keeping the keyset safe.

A few credentials do not live on your server at all -- they sit in
other companies' admin consoles: Cloudflare (DNS + tunnel), Tailscale
(remote access), and Portainer (container management). If one of those
is ever lost, you regenerate it in that provider's console and
re-install it (`catena rotate-tunnel` / `catena rotate-tailscale`, or
by re-running the install). The recovery map below lists each.

## Recovery map -- what breaks and what to do

| What you lose | What still works | How to recover |
|---|---|---|
| **Your laptop** (the device you work from) | Your server, your apps, your backups | Nothing is lost as long as your recovery keyset is saved in your password manager, not only on the laptop. Set up a new device, restore the keyset, and carry on |
| **SSH private key** | Your server, your apps, the dashboard | Boot **Provider rescue mode** (below), mount the disk, and add a fresh public key to the `ops` account; then re-run the install so it sticks |
| **Dashboard access (sign-in broken, sign-in service down)** | Your apps (their own logins still work), your data | SSH in over Tailscale and restart the sign-in service, or re-provision it with `catena converge`. See [Regaining admin access](#regaining-admin-access) |
| **One app's data (you deleted something)** | Everything else | Try the app's own trash first; if empty, open catena-admin **Actions -> Browse past snapshots**, pick a point in time, and copy the file out of the read-only mount |
| **Entire server disk (corruption, accidental wipe)** | Backups (in your storage bucket) | Rebuild from your backup with `catena recover` -- see [Rebuilding your server from backup](/en/self-restore/) |
| **Cloudflare API token (accidentally rotated)** | Your tunnel keeps running. Public apps stay up. **Functionality only**, not backup. | Generate a new API token at [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) and set it in catena-admin **Settings**. Apps stay reachable throughout |
| **Cloudflare tunnel token (rotated or leaked)** | Existing tunnel keeps running until it next reconnects, then drops. Public apps go dark until rotation completes. **Functionality**, not backup. | Run `catena rotate-tunnel` -- it mints a fresh tunnel and installs it. (The token itself lives under [dash.cloudflare.com](https://dash.cloudflare.com) -> your zone -> **Zero Trust** -> **Networks** -> **Tunnels** -> your tunnel -> **Configure**, NOT the "API Tokens" page.) Expect 5-15 minutes of public-app downtime during the swap |
| **Tailscale OAuth client (accidentally rotated)** | Your server's remote access keeps working. Remote administration stays up | Generate a new OAuth client in the Tailscale console, then `catena rotate-tailscale` to re-auth the node |
| **Portainer API key (accidentally rotated)** | All your apps keep running | Generate a new key in the Portainer UI and set it in catena-admin **Settings** (or re-run the install so the services pick it up) |
| **Cloudflare account terminated** | Your server, your apps (internally), your data | Create a new Cloudflare account, point your domain to it, and re-run the install against it; your apps are down only during DNS propagation |
| **Tailscale account terminated** | Your server, your apps, your public path (the tunnel) | Tailscale is only the admin path, not the public serving path. Re-join the node from a new tailnet (`catena rotate-tailscale`), or reach the box via **Provider rescue mode** |
| **Your provider goes bankrupt / shuts down** | Your backup bucket (different company) | [Rebuild from your backup](/en/self-restore/) (`catena recover`) at a different provider |
| **Your provider's datacentre burns down (OVH Strasbourg 2021)** | Your backup bucket (different region, different city) | Same as above -- `catena recover` on a fresh server at another provider or region |
| **Your backup provider goes bankrupt / shuts down** | Your server and its data | You still have the data -- point backups at a new bucket in catena-admin **Settings** *before* the provider's deadline. If you set up a secondary backup (see [Recurring tasks](/en/disaster-prevention/)), it's already safe |
| **Backup bucket accidentally deleted** | Your server and its data | Same -- recreate the bucket and repoint backups in catena-admin **Settings**. Some providers keep deleted objects for a retention window, which might buy you time |
| **Provider AND backup provider outage at the same time** | Last weekly off-site copy (if you set one up -- see [Recurring tasks](/en/disaster-prevention/)) | `catena recover` from the off-site copy on any fresh cloud |
| **Your server is dead AND your saved logins are gone** | Your backup bucket | As long as your recovery keyset (repository location + storage keys + encryption password) is in your password manager, the backup can still be read and your server rebuilt -- `catena recover`, see [Rebuilding your server from backup](/en/self-restore/) |
| **Your server is dead AND your backup encryption password is lost** | Your bucket exists but every byte in it is ciphertext you can't open | **Data loss.** This is the one unrecoverable case, and exactly why [Recurring tasks](/en/disaster-prevention/) says to store your encryption password separately and safely |

## Regaining admin access

If sign-in breaks for everyone -- Keycloak is down, or every admin
account is locked out -- the web dashboards are unreachable, but your
**Tailscale access is not**. That is the way back in:

1. From a machine on your tailnet, SSH into the box
   (`ssh ops@<your-tailnet-ip>`).
2. From that shell you can restart the sign-in service (Keycloak),
   reset the admin credential, or re-provision the whole realm with
   `catena converge` -- which re-imports users, clients, and groups.
3. If Keycloak's database is damaged rather than just misbehaving,
   `catena restore` brings it back from your last snapshot.

Public SSH is closed, so Tailscale is the only remote way onto the box.
That is exactly why [Recurring tasks](/en/disaster-prevention/) tells
you to keep your Tailscale access -- and a copy of your SSH key --
somewhere other than one laptop. If Tailscale itself is unreachable,
fall back to **Provider rescue mode** below.

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

The steps are the same across providers, just different UI labels.

**Your Tailscale SSH and the provider's rescue console are two ways
onto the box.** Use Tailscale normally. If SSH itself is broken, or
Tailscale is down, the rescue console gives you the same root-level
access to the disk -- either path gets you back to a working server.
Reach for whichever is in front of you; don't wait on one when the
other is available.

## How this plays out in practice

Most "I lost X" situations are nowhere near as bad as they feel in the
first five minutes. The site keeps serving traffic. Your database is
fine. You have 24-72 hours to handle the recovery without pressure --
everything but total disaster is survivable on a weekday morning with
a coffee.

Between your Tailscale access, the recovery keyset, and `catena
recover`, every path on this page is one you can run yourself. Prefer
a second pair of eyes in a live incident? Reach your Catena contact --
it is an option, not a requirement.
