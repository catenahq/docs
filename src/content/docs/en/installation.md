---
title: "Installation"
description: "How to install Catena on a fresh server from Windows, macOS or Linux, the first sign-in, and the installer messages that need attention."
---

Catena is installed from the admin computer with a small tool, `catena-installer`, that reaches the server over SSH. The installer asks only how to reach the server and the admin email. The domain, Cloudflare, backups, email and the private network are set afterwards in the panel (see [Configuration overview](/en/configuration/)).

## Requirements

### Server

| Item | Requirement |
|---|---|
| Server | A fresh server (VPS or dedicated) running the current Debian stable release. Other distributions, Ubuntu included, are refused. |
| Architecture | x86_64 (amd64) only. |
| Network | A public IPv4 address and outbound internet access (the server downloads Catena, Debian packages and the container engine over HTTPS). |
| Access | SSH, with a key or with the provider's password for the first login. A non-root initial user (`debian`, `ubuntu`, ...) needs passwordless sudo. |
| Memory | 4 GB minimum. 6 GB recommended for light apps with few users. 8 GB for heavier apps such as Nextcloud and ERPNext with many users. Catena's own services take about 2 GB of that. |
| Disk | No fixed minimum. App data and the space backups use while they are prepared grow with the amount of data, so the disk is sized for the data plus comfortable headroom. A configuration run refuses a disk that is 90% full or more. |

### Admin computer

- Windows, macOS or Linux.
- **uv**, which runs the installer (next section).
- An OpenSSH client, which provides `ssh` and `ssh-keygen`. `ssh-keygen` is needed to create a key pair and to forget an old host key; it ships with current Windows, macOS and Linux.
- An SSH key pair without a passphrase. The installer logs in unattended and refuses a key protected by a passphrase. It can create the pair (default `~/.ssh/catena_ed25519`).

### Accounts needed later, in the panel

None of these is needed at install time.

- A Cloudflare account and a domain: [Domain and Cloudflare](/en/configuration/domain/).
- An S3-compatible storage bucket for backups: [Backups and S3 storage](/en/configuration/backups/).
- Optionally, Tailscale or Headscale for a private administration network: [Admin access and tailnet](/en/configuration/admin-access/).
- An email sending service: [Outgoing email](/en/configuration/email/).

## Install uv

uv is installed once per admin computer. More options are in the [uv documentation](https://docs.astral.sh/uv/).

Linux and macOS:

```sh
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Windows (PowerShell):

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

A new terminal window is opened afterwards so that `uv` and `uvx` are found.

## Run the installer

```sh
uvx catena-installer
```

The command serves a page on the admin computer and opens it in the browser, at `http://127.0.0.1:8765/`. The page is in English or French depending on the browser language; the console output is English only. Closing the browser tab changes nothing; closing the terminal window stops the install and the panel forward.

Each server has an inventory, a folder holding its non-secret settings. The **Inventory** tab lists the inventories and creates one (lower-case letters, digits, dashes and underscores, for example `prod`). The **Installation** tab then asks for:

| Field | Meaning |
|---|---|
| **Host public IP** | The server's public IPv4 address, as given by the provider. |
| **Host private SSH address** | Optional. **Install over a private IP** replaces the public IP for SSH only, for example a tailnet address when port 22 is not reachable from the public IP. |
| **Host SSH port** | The port SSH answers on, usually 22. |
| **Host initial user** | The login the provider gave, such as `root`, `debian` or `ubuntu`. |
| **Host initial user's password** | Optional. Needed only when the server does not accept the SSH key yet: the install uses it once to add the key. It is kept in memory only and never written to disk. |
| **Admin email** | The panel login. |
| **SSH key file** | The private key (its `.pub` file must sit next to it). The box **Create this SSH key pair now** creates a missing pair. |

The initial user can no longer sign in over SSH once Catena is installed. A new user, `ops`, is created to administer the server.

### Pre-checks

The button **Verify configuration and start installation** first runs checks and sends nothing to the server unless none blocks:

- an SSH server answers at the address and port;
- the host key matches the one already trusted for that address;
- the key pair exists on the admin computer;
- the key opens the initial login (or `ops`), or the provider's password does.

### The install

The install runs for several minutes, and tens of minutes is possible. Its output shows on the page. In order, the installer logs in, has the server fetch the Catena release and install itself, logs in again as `ops` with the key before anything is closed, and finally checks the server from the admin computer (a scan of the public ports).

A few minutes in, the **Catena server access** section shows three secrets, and shows them again when the install ends:

| Secret | Use |
|---|---|
| Admin password | Panel and Portainer sign-in. |
| Console password for `ops` | Works only at the provider's web console (KVM or serial) or on a physical keyboard, never over SSH. It is the way in when SSH is unavailable. |
| Journal verification key | Proves the server's log of administrative actions was not altered. Shown once, on the first install only. |

:::caution
These values are shown once and Catena keeps no other copy. They must be saved in a password manager before the page is closed.
:::

### Console mode

The same install can run without the browser page:

```sh
uvx catena-installer init --inventory prod
```

This writes the inventory and its `.env` with every setting at its default and explained. After the `.env` is filled in:

```sh
uvx catena-installer install --inventory prod
```

The console asks for the provider's password only when the key does not open the initial login already, and asks `Was the server reinstalled? [y/N]:` only when a host key has changed.

## First sign-in

Public SSH stays open after the install, and no domain exists yet, so the panel and Portainer are reached through an SSH forward. The installer page keeps it open while its window is open. It is opened again at any time with:

```sh
uvx catena-installer connect --inventory prod
```

From a computer without the installer, the same forward is:

```sh
ssh -N -L 9010:127.0.0.1:9010 -L 9000:127.0.0.1:9000 panel@<server-address>
```

The `panel` account can do nothing but forward these two ports. The server address is the public IP, or the tailnet IP once public SSH has been closed. While the forward is open:

| Tool | Address | Sign-in |
|---|---|---|
| Catena panel | `http://localhost:9010` | **Admin email** and **Password**: the admin email given at install and the admin password shown once. |
| Portainer | `http://localhost:9000` | User name `admin` (not an email) and the same admin password. |

After a domain is applied, the same tools are at `https://dash.yourdomain.com` and `https://portainer.yourdomain.com`.

The next step is the [Configuration overview](/en/configuration/), which gives the order for setting up the domain, backups, schedules and the rest in **Settings**.

## Common issues

The installer prints its messages in English in both locales. Messages are quoted here as they appear (`<...>` stands for a value).

| Message | Cause | Remedy |
|---|---|---|
| `nothing accepted a connection. A server still being delivered is the ordinary reason, and this section is where a run waits for it` | Nothing answers SSH at the IP and port yet. | Wait for the provider to finish delivering the server, then check again. Confirm the IP, the port and the provider's firewall. |
| `nothing answers SSH at <host>:<port>: <err>` | The TCP connection failed (15 second timeout). | Check the IP address, the SSH port and any firewall at the provider. |
| `<host> presents another host key than the one this machine trusts for it (trusted: ...; offered: ...). A reinstalled server presents a new key; if this one was not reinstalled, another machine may be answering at this address.` | The server was rebuilt on the same address, or another machine answers there. Nothing is sent to that server. | If the server was reinstalled: tick **This server was reinstalled: trust its new host key** on the page, or add `--reinstalled` in console mode. Otherwise stop and check the address. |
| `the server does not accept this key yet` | The key is not on the initial login. | Enter the provider's password for the initial user: the install adds the key with it. Alternatively, give the public key to the provider and check again. |
| `the password was refused`, or `<user>@<host> refused the password` | Wrong provider password. | Re-enter it as given by the provider. |
| `<user>@<host> refused the key <path>` | Wrong key file or wrong initial user. | Check the **SSH key file** and **Host initial user** fields. |
| `<path> or its .pub is missing. Tick the box below to create the pair there, or name a pair this machine has` | The key pair does not exist. | Tick **Create this SSH key pair now**, or point at an existing pair. |
| `... is protected by a passphrase; the installer logs in unattended and needs a key without one` | The key has a passphrase. | Use a key without a passphrase, for example a new pair created by the installer. |
| `ssh-keygen is not installed: it ships with OpenSSH` | No OpenSSH client on the admin computer. | Install the OpenSSH client for the operating system, or use a key pair created elsewhere. |
| `this server is not Debian; ...` | The server runs another distribution (Ubuntu included). | Reinstall the server with the current Debian stable release. |
| `no catena-admin build for a <machine> machine; pass --platform` | The server is not x86_64 (for example arm64). | Order an x86_64 server. |
| `run as root` | The initial user is neither root nor allowed passwordless sudo. | Use `root`, or a user with passwordless sudo. |
| `Disk preflight: <mount> is N% full (X GiB free), at or above the 90% converge ceiling. Free space before re-running -- a converge onto a full disk fails mid-role with no space left on device.` | The disk is 90% full or more. | Free space or enlarge the disk, then run the install again. |
| `fetch-release: <url>: HTTP <code> <reason>` | The server cannot reach the container registry that publishes Catena releases. | Check outbound HTTPS from the server (provider firewall, DNS), then run the install again. |
| `apt update failed and no APT_PROXY_URL is configured, so there is nothing to bypass. Real apt-get error: ...` | The Debian package mirror is unreachable from the server. | Check the server's network and DNS, then run the install again. |
| `catena-installer: SECURITY REGRESSION: <ip> answers on [...], which nothing declares (expected open: [...]). Check ufw, docker's iptables rules and the provider's firewall.` | A port is open that Catena does not declare, often a rule at the provider. | Close that port in the provider's firewall, or remove whatever service listens on it. |
| `catena-installer: the panel forward did not open: <problem>` | The SSH forward to the panel could not start. | Run `uvx catena-installer connect --inventory prod`. If a local port is busy, the installer prints another address. |
| `refusing to continue: this session did not prove that ops opens with its key` | The second login was not an `ops` key login, so nothing was closed. | Run the install again from the installer. |
| `the passwords could not be shown; running the install again shows them` | The passwords were not displayed. | Run the install again (the journal verification key is shown only on the first install). |
| `The installation stopped. The output says where.` | The install failed. | Read the output for the failing step, fix the cause, and run the install again. |

The console exits with 0 when installed, 1 when the install failed, 3 when it finished and a check failed, and 4 when the server refused the second login.

A public port scan reported as skipped (`public port scan SKIPPED`) only means the IP is not a routable address; it is not a failure.

## Re-run, upgrade and uninstall

**Re-run.** Running the install again on an installed server is safe. It asks nothing, re-applies everything with the release the server records, validates the server and shows the passwords again (the journal verification key is shown once). It is also the way in when the panel is unavailable, for example after a full disk.

```sh
uvx catena-installer install --inventory prod
```

**Upgrade.** A release is chosen with `--release`. The server moves to that release, with that release's own code, and records it. Without `--release`, an installed server keeps its recorded release and a new server gets the newest one. This is the way forward when the panel's own update cannot run; otherwise updates are made in the panel.

```sh
uvx catena-installer install --inventory prod --release vX.Y.Z
```

**After public SSH is closed.** Once **Close SSH on public port 22** is ticked in **Settings** > **Admin access tunnel**, the installer reaches the server on its tailnet address for that run:

```sh
uvx catena-installer install --inventory prod --address <tailnet-ip>
```

Setting `HOST_SSH_ADDRESS` in the inventory `.env` keeps using that address.

**Uninstall.** The command hands operating system updates back to Debian and removes nothing else:

```sh
uvx catena-installer uninstall --inventory prod
```

It unmasks the Debian update timers, removes Catena's automatic-update origins and restart policy, and releases the hold on the container engine packages. It leaves in place, to be removed deliberately:

- the apps and their data, and Portainer (removed from Portainer or with Docker);
- the accounts created on the server;
- the Cloudflare tunnel and DNS records (deleted in the Cloudflare dashboard);
- the Tailscale node (removed in the Tailscale admin console);
- the backups in the S3 storage, which stay until the bucket content is deleted.
