---
title: "Recovering from a failure"
description: "Something is already broken and needs fixing. This page is the"
---

Something is already broken and needs fixing. This page is the
map of "what can go wrong" + "what still works when it does" + "how to
get back from each situation." Read **before** an incident, the
companion page is [Recurring tasks](/en/disaster-prevention/)
-- that is where the off-laptop backups, off-site bucket, and the
recovery keyset live.

The short version: the software suite is designed so that **no single
accidental click can lock anyone out**. It takes a combination of
events to lose access, and every scenario has a recovery path.

## Data-loss scenarios -- quick FAQ

For skimming straight to the matching situation, this is the index.
Each entry links to the page or section that walks the recovery in
detail.

| Situation | First move | Where to read more |
|---|---|---|
| **A file was deleted by accident** (one user, one file/folder) | Try the app's own trash. If empty, browse a backup snapshot in catena-admin (**Actions -> Browse past snapshots**) and pull the file out. | Recovery map ("one app's data") |
| **An application's data is wrong** (a bad update, a bulk deletion, a database in a state nobody wants) | The server is fine, so put the data back rather than rebuilding: pick a backup on the admin panel's **Restore** page. | [Restoring data from the admin panel](/en/restore-data/) |
| **A password or 2FA is lost** (one person) | Self-service password reset from the sign-in page. For 2FA, another admin clears it in Keycloak. | [Manage users and roles](/en/manage-users-and-roles/) |
| **All admins are locked out at once** (sign-in broken, nobody can open the dashboard) | Tailscale access is the way in -- SSH into the box and restart or re-provision the sign-in service. | [Regaining admin access](#regaining-admin-access) below |
| **The whole server is encrypted by ransomware** | Rebuild from the last clean snapshot (before the ransomware) on a fresh server: install Catena there, then restore from the old server's backups in the new server's admin panel. | [Rebuilding a server from backup](/en/self-restore/) |
| **The server itself is compromised** | Wipe and rebuild on a fresh server, restoring a pre-compromise snapshot from the old server's backups in the new server's admin panel, then rotate every external credential. | [Rebuilding a server from backup](/en/self-restore/) |
| **The provider's datacentre burns down** (or hardware failure) | Rebuild on a fresh server at any provider from the off-site backup, restoring from the old server's backups in the new server's admin panel. | [Rebuilding a server from backup](/en/self-restore/) |
| **The provider gives 48h notice / suspends the account** | Rent a VPS elsewhere, install Catena, and restore from the old server's backups; expect ~30-60 min of public-URL downtime during cutover. | [Rebuilding a server from backup](/en/self-restore/) |
| **Backup provider gives 48h notice** | Point backups at a new bucket in catena-admin **Settings**; server data is unaffected. | Recovery map ("backup provider goes bankrupt") |
| **A password or API token may have leaked** | Do not wait -- rotate the credential in its console now. For the Cloudflare tunnel, press **Apply** under catena-admin **Settings -> Domain**; for Tailscale, save the new credential in **Settings** and press **Re-join the private network**. | Recovery map (per-credential rows) |

The recovery map below has the full table including infrastructure
edges (Cloudflare token rotation, Tailscale account, and the rest) --
keep reading.

## If the whole server is lost

When the server itself is gone -- destroyed, wiped, or encrypted by
ransomware -- it is rebuilt from the latest backup. The only thing
that has to have been kept is the **recovery keyset**:

- the **backup repository location** (where the backups live),
- the **storage keys** for that bucket, and
- the **backup encryption password**.

[Recurring tasks](/en/disaster-prevention/) covers how to store
those three safely. Everything else -- every internal setting and
secret the applications use -- is inside the encrypted backup and
returns automatically with the data; there is nothing to re-enter.
The [Rebuilding a server from backup](/en/self-restore/) page
walks through what a rebuild looks like.

The rebuild installs Catena on a new server, then restores from the
old server's backups in the new server's admin panel (the **Restore**
page, **Another server's backups**), using the keyset. The data, the
applications and the stored configuration come back. The only work
ahead of time is keeping the keyset safe.

A few credentials do not live on the server at all -- they sit in
other companies' admin consoles: Cloudflare (DNS + tunnel), Tailscale
(remote access), and Portainer (container management). If one of those
is ever lost, it is regenerated in that provider's console and saved
in catena-admin **Settings**, or the install is re-run
(`catena-cli install` is safe to rerun). The recovery map below lists
each.

## Recovery map -- what breaks and what to do

| What is lost | What still works | How to recover |
|---|---|---|
| **The laptop** (the device the work happens from) | The server, the apps, the backups | Nothing is lost as long as the recovery keyset is saved in a password manager, not only on the laptop. Set up a new device, restore the keyset, and carry on |
| **SSH private key** | The server, the apps, the dashboard | Boot **Provider rescue mode** (below), mount the disk, and add a fresh public key to the `ops` account; then re-run the install so it sticks |
| **Dashboard access (sign-in broken, sign-in service down)** | The apps (their own logins still work), the data | SSH in over Tailscale and restart the sign-in service, or re-provision it with **Bring this server up to date** in catena-admin **Settings**. See [Regaining admin access](#regaining-admin-access) |
| **One app's data (something was deleted)** | Everything else | Try the app's own trash first; if empty, open catena-admin **Actions -> Browse past snapshots**, pick a point in time, and copy the file out of the read-only mount |
| **Entire server disk (corruption, accidental wipe)** | Backups (in the storage bucket) | Install Catena on a new server and restore from the old server's backups -- see [Rebuilding a server from backup](/en/self-restore/) |
| **Cloudflare API token (accidentally rotated)** | The tunnel keeps running. Public apps stay up. **Functionality only**, not backup. | Generate a new API token at [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) and set it in catena-admin **Settings**. Apps stay reachable throughout |
| **Cloudflare tunnel token (rotated or leaked)** | Existing tunnel keeps running until it next reconnects, then drops. Public apps go dark until rotation completes. **Functionality**, not backup. | In catena-admin **Settings -> Domain**, press **Apply** with the domain already in use -- it mints a fresh tunnel, repoints DNS, deletes the old tunnel, then brings the server up to date. If the Cloudflare API token itself leaked, create a new one in the Cloudflare console and type it into the Domain section first (with no token typed, the stored one is used). (The token itself lives under [dash.cloudflare.com](https://dash.cloudflare.com) -> the zone -> **Zero Trust** -> **Networks** -> **Tunnels** -> the tunnel -> **Configure**, NOT the "API Tokens" page.) Public addresses are unreachable for a few minutes during the swap |
| **Tailscale OAuth client (accidentally rotated)** | The server's remote access keeps working. Remote administration stays up | Generate a new OAuth client in the Tailscale console, save it in catena-admin **Settings** (Admin access tunnel section), then press **Re-join the private network** to sign the server in again with a fresh key |
| **Portainer API key (accidentally rotated)** | Every app keeps running | Generate a new key in the Portainer UI and set it in catena-admin **Settings** (or re-run the install so the services pick it up) |
| **Cloudflare account terminated** | The server, the apps (internally), the data | Create a new Cloudflare account, point the domain to it, and re-run the install against it; the apps are down only during DNS propagation |
| **Tailscale account terminated** | The server, the apps, the public path (the tunnel) | Tailscale is only the admin path, not the public serving path. Save the new tailnet's credential in catena-admin **Settings** and press **Re-join the private network**, or reach the box via **Provider rescue mode** |
| **The VPS provider goes bankrupt / shuts down** | The backup bucket (different company) | [Rebuild from the backup](/en/self-restore/) at a different provider |
| **The provider's datacentre burns down (OVH Strasbourg 2021)** | The backup bucket (different region, different city) | Same as above, on a fresh server at another provider or region |
| **The backup provider goes bankrupt / shuts down** | The server and its data | The data is still there -- point backups at a new bucket in catena-admin **Settings** *before* the provider's deadline. With a secondary backup already set up (see [Recurring tasks](/en/disaster-prevention/)), it is already safe |
| **Backup bucket accidentally deleted** | The server and its data | Same -- recreate the bucket and repoint backups in catena-admin **Settings**. Some providers keep deleted objects for a retention window, which can buy time |
| **Provider AND backup provider outage at the same time** | Last weekly off-site copy (where one was set up -- see [Recurring tasks](/en/disaster-prevention/)) | Install Catena on any fresh cloud server and restore from the off-site copy ([Rebuilding a server from backup](/en/self-restore/)) |
| **The server is dead AND the saved logins are gone** | The backup bucket | As long as the recovery keyset (repository location + storage keys + encryption password) is in a password manager, the backup can still be read and the server rebuilt -- see [Rebuilding a server from backup](/en/self-restore/) |
| **The server is dead AND the backup encryption password is lost** | The bucket exists but every byte in it is ciphertext nothing can open | **Data loss.** This is the one unrecoverable case, and exactly why [Recurring tasks](/en/disaster-prevention/) says to store the encryption password separately and safely |

## Regaining admin access

If sign-in breaks for everyone -- Keycloak is down, or every admin
account is locked out -- the web dashboards are unreachable, but
**SSH access is not**. That is the way back in:

1. SSH into the box with the key. SSH is key-only (no root login, no
   password login). With public port 22 open (the default), connect to
   the server's public address (`ssh ops@<the-public-ip>`). With public
   port 22 closed, connect over the tailnet from a machine on it
   (`ssh ops@<the-tailnet-ip>`).
2. That shell can restart the sign-in service (Keycloak),
   reset the admin credential, or re-provision the whole realm with
   **Bring this server up to date** in catena-admin **Settings** --
   which re-imports users, clients, and groups.
3. If Keycloak's database is damaged rather than just misbehaving, the
   admin panel's **Restore** page brings it back from the last
   snapshot ([Restoring data from the admin panel](/en/restore-data/)).

Public port 22 closes only when an admin ticks **Close SSH on public
port 22** in catena-admin **Settings**, section **Admin access tunnel**,
which is possible only while a valid tailnet connection is up. Once
closed, the server is reachable over the tailnet only, and the port
reopens automatically if the tailnet connection stays down for more than
5 minutes, so the key over public SSH works again. That is exactly why
[Recurring tasks](/en/disaster-prevention/) calls for keeping a copy of
the SSH key -- and the tailnet access -- somewhere other than one
laptop. If SSH itself is gone (for example a lost key), **Provider
rescue mode** below is the fallback.

## Provider rescue mode -- when SSH is gone

Every serious hosting provider offers a "rescue mode" that boots a
temporary rescue image with the existing disk mounted, so a new SSH key
can be added or files recovered without re-installing. A few examples:

- **OVH**: Control Panel -> the server -> **Rescue / rescue-customer**.
  Reboot into rescue, mount the disk, add the new public key to
  `/home/ops/.ssh/authorized_keys`, reboot normally.
- **Hetzner**: Robot -> Rescue system -> enable and reboot.
- **DigitalOcean / Linode / Vultr**: each has a recovery console
  (sometimes a VNC web terminal) -- look for "Recovery" / "Console" in
  the provider's sidebar.

The steps are the same across providers, just different UI labels.

**Tailscale SSH and the provider's rescue console are two ways
onto the box.** Tailscale is the normal one. If SSH itself is broken,
or Tailscale is down, the rescue console gives the same root-level
access to the disk -- either path leads back to a working server.
Whichever is at hand is the right one; waiting on one while the other
is available costs time for nothing.

## How this plays out in practice

Most "X is lost" situations are nowhere near as bad as they feel in the
first five minutes. The site keeps serving traffic. The database is
fine. There are 24-72 hours to handle the recovery without pressure --
everything but total disaster is survivable on a weekday morning with
a coffee.

Between Tailscale access, the recovery keyset, and the admin
panel's **Restore** page, every path on this page runs with no outside help. A second pair of
eyes in a live incident is available from the Catena contact -- an
option, not a requirement.
