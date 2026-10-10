---
title: "Admin access and tailnet"
description: "The optional private network used to administer the server, the credentials it needs, closing public SSH, rejoining the network and connecting to the server over SSH."
---

You can administer the server over a private network (a tailnet) instead of the public address. The tailnet is optional: with **No private network**, key-only SSH on the public address stays the way in. Web traffic to the applications is unrelated to this section; it always uses the Cloudflare tunnel, see [Domain and Cloudflare](/en/configuration/domain/).

SSH on the server is always key-only, with no root login and no passwords. Public port 22 stays open until you tick **Close SSH on public port 22**, which needs a working tailnet.

## Choose a control plane

In **Settings** > **Admin access tunnel**, **Private network control plane** offers:

| Option | Meaning |
|---|---|
| **No private network** | No tailnet. Public key-only SSH remains the way in. |
| **Tailscale (hosted)** | The tailnet runs on Tailscale's service. |
| **Headscale (self-hosted)** | The tailnet runs on a Headscale server. |

Only the fields the chosen control plane needs are shown. Changing the choice moves the server onto a different private network, or off one, and public SSH stays as it is until the box described below says otherwise.

### Tailscale

Prerequisite: a tailnet and an OAuth client in the Tailscale admin console.

| Field | Content |
|---|---|
| **Tailscale OAuth client ID** | Required. |
| **Tailscale OAuth client secret** | Required, stored and never shown again. |
| **Private network tags** | Required for Tailscale, for example `tag:vps`. Comma-separated. |

The OAuth client needs the **Auth Keys** write scope, with the tags used, and the **Devices** > **Core** read scope. The tags must be declared in the tailnet policy and the client must be allowed to use them. The first scope lets the server mint a short-lived key under those tags to join; the second lets the server ask Tailscale whether it is connected before public SSH is closed.

### Headscale

| Field | Content |
|---|---|
| **Headscale server address** | Starts with `http://` or `https://`. |
| **Headscale user** | The user the server's keys belong to. Required when an API key is given, and the user must exist. |
| **Headscale API key** | Optional. Preferred: the server mints a fresh key at each join. |
| **Headscale pre-authentication key** | Optional. Used when no API key is stored; it is long-lived. |
| **Private network tags** | Comma-separated, for example `tag:vps`. |

One of the two keys is required. You must create a static pre-authentication key with the same tags, because a node joining with a pre-authentication key takes the tags from the key. The Headscale server must be recent enough; an older one is refused with the minimum release named in the message.

## Save and join

When you press **Save**, the panel checks the settings with the provider before anything is stored. A failure reads "Private network settings refused, and nothing was saved: ..." followed by the reason, for example that the OAuth client cannot create keys under the tags, cannot read devices, or that the Headscale user does not exist. When the check passes, the values are stored and the server joins the network. The notice reads: "Saved. The server is joining the private network, and this section shows how it goes. Public SSH stays as it is."

A status block under the section polls every 5 seconds:

- **Public SSH (port 22)**: "Closed: reachable over the tailnet only" or "Open".
- **Last change**: a timestamp, or "not yet".
- While running: "Changing this server's access." The maintenance connection may drop meanwhile; the work continues even if the page is closed.
- "What the server recorded during this attempt" holds the log of the last attempt.
- After a failure: "The last attempt did not finish. The maintenance port was left as it was, so nothing was closed off."
- If another change is running, the save reports that it did not start. You only need to save again once the other change finishes.

## Close SSH on public port 22

The checkbox **Close SSH on public port 22** appears once a control plane is set and the tailnet is up (or SSH is already closed). The warning reads: "Closing SSH on public port 22 means this machine can only be accessed via the tailnet. This action can only be taken when a valid tailnet connection is up. The port will automatically be re-opened if the tailnet connection is down for more than 5 minutes." While the tailnet is down the section says "The tailnet connection is not up right now, so the port cannot be closed yet."

The server, not the panel, decides whether the port may close. Before closing it proves that:

- the control server shows the server as connected;
- another device on the tailnet, one not carrying the server's tags, reaches it;
- the tailnet policy lets such a device open TCP port 22 on the server;
- the server's own firewall lets SSH in over the tailnet interface.

A refusal leaves port 22 open and the reason in the attempt log. On success the notice reads "Saved. Public SSH closes once the server has proven the tailnet reaches it, and this section follows it." If you untick the box again, the port reopens ("Saved. Public SSH is opening again, and this section follows it.").

If the tailnet stays down for more than 5 minutes after closing, the server reopens port 22 on its own so the key over public SSH works again.

Once public SSH is closed, a [move to another server](/en/configuration/restore-and-migrate/#migrate-to-another-server) reaches this server over the private network: enter its private-network address on the new server.

:::caution
Before you close it, confirm from a second device that SSH over the tailnet address works. Prove the tailnet before you remove the old path.
:::

## Re-join the private network

When a provider is set and the server has dropped off the tailnet, or its tags changed, a form appears: "This server is not on its private network right now. Signing it in again with a fresh key brings it back, for a server that dropped off it or whose tags changed." Tick "I understand that the private network connection drops for a moment." and press **Re-join the private network**. Save new tailnet credentials first when you rotate or replace the OAuth client or Headscale key: that is how the server takes them into use.

## SSH to the server as ops

The administration account is `ops`, which you reach with the SSH key you gave to the installer.

- While public port 22 is open: `ssh ops@<server-public-ip>`
- After it is closed: `ssh ops@<tailnet-ip>`, from a device on the same tailnet.

`ops` has passwordless sudo. A separate `panel` account exists only to forward the panel and Portainer ports and cannot open a shell.

### Add an SSH key for ops

From an existing session as `ops`, append the new public key to the account's authorized keys:

```bash
echo 'ssh-ed25519 AAAA... name' >> ~/.ssh/authorized_keys
```

Lines you add by hand stay in place when the server's configuration is applied again. Without any working session, you can use the provider's rescue mode to mount the disk and add the key to `/home/ops/.ssh/authorized_keys`.

## Troubleshooting

- "Tailscale refused the OAuth client": the client ID or secret is wrong, or the client was revoked.
- "The OAuth client cannot create keys tagged ...": the client lacks the **Auth Keys** write scope or the tags, or the tags are not declared in the tailnet policy.
- The close box never appears: the tailnet is not up. Use **Re-join the private network** and check the status block.
- Public port 22 reopened by itself: the tailnet was down for more than 5 minutes. Fix the tailnet, then close again.
