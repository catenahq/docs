---
title: "Updates"
description: "What a Catena server updates on its own, what needs a decision, and how an update is gated, rolled back and recorded."
---

A Catena server has four layers that update independently: the operating system, the control panel, the Docker engine and the applications. This page lists what moves on its own, what needs a click, and what Catena Pro adds.

| Layer | How it updates | Edition |
|---|---|---|
| Operating system | Security updates apply automatically; the restart is a decision. | All |
| Control panel | **Update this panel**, or the monthly **Control panel updates** job. | Button: all. Job: Catena Pro or Catena Business |
| Docker engine | **Upgrade Docker**, or a step of the nightly maintenance. | Button: all. Step: Catena Pro or Catena Business |
| Applications and Catena's own services | The nightly maintenance, behind a waiting period, a vulnerability check and a rollback. | Catena Pro or Catena Business |

On Community, applications are updated by hand (see [Community: update an application](#community-update-an-application)). The [edition comparison](https://catena.run/en/#pricing) lists the editions.

## Operating system

Debian's automatic security updates run on every server, in every edition. They cover the security suite, stable updates, point releases and the private-network client's own repository. They never restart the server by themselves.

A restart is needed when an update replaces something that is already running. Once an hour the server checks whether one is due. While it is due, every admin page shows "An installed update takes effect only after this server restarts. Restart it from the System page." and the **System** page lists what asked for it and which services still run on replaced libraries.

To restart:

1. Open **System** > **Restart**.
2. Tick "I understand this stops every application on this server for about a minute."
3. Press **Restart this server**.

When the nightly maintenance is on, its last step restarts the server when one is due and then checks that every service came back. The **System** page reports "Last restart by the nightly maintenance" and its outcome, and the Log records it. Restarting is otherwise left to the administrator because the downtime is a decision.

Under **Actions** > **Ops**, **Pending apt updates** lists what is waiting and **Recent auto-upgrade log** shows what the automatic updates did.

## Control panel version

Open **Settings** > **Control panel version**.

1. **Running now** shows the version the server runs.
2. Pick the target under **Version to install**. The list holds the published versions of this same panel. When the list cannot be fetched, the field becomes a text box and the version is typed (for example `v1.2.3`); only a version of this same panel is accepted.
3. Tick "I understand the panel restarts and is briefly unavailable."
4. Press **Update this panel**.

The section follows the update through Downloading (with a layer count), Installing, Restarting, Checking health and Applying its configuration. The panel is unreachable for about a minute while it restarts and returns on its own; the update continues on the server even if the page is closed. Everything else keeps running.

An update that makes the server less healthy than before is put back automatically. The section then reads "The last attempt did not finish. This server put the previous version back and is running normally on it, one version behind." with the server's log of the attempt folded below.

The button works in every edition. The **Control panel updates** job on the [Schedules](/en/configuration/schedules/) page (monthly by default, Catena Pro or Catena Business) does the same on a schedule, through the same checks.

### When the panel cannot update itself

If the panel is unavailable or its update cannot run, the install command is run again from the admin computer with the target release (see [Installation](/en/installation/)):

```sh
uvx catena-installer install --inventory <name> --release v1.2.3
```

The server moves to that release with that release's own code, the same end state as the panel update. After public SSH has been closed, `--address <tailnet-ip>` is added for that run. Without `--release` the command re-applies the release the server already records.

## Docker engine

Open **System** > **Docker engine**.

1. Tick "I understand every application restarts for about a minute."
2. Press **Upgrade Docker**.

This moves Docker to the version the panel carries, then checks that every service came back; if one did not, the previous version is put back. A new major version is not installed by that button. When the panel carries one, a second box appears: tick "I understand this moves Docker to a new major version, and every application restarts." and press **Upgrade to the new major version**.

The nightly maintenance upgrades Docker the same way within the current major version. The result shows in the **Last upgrade** line of the section.

## Applications (Catena Pro)

The nightly maintenance updates Catena's own services and every application deployed from Portainer. It first takes a backup and verifies it, and stops before any update if that fails (see [Schedules](/en/configuration/schedules/#nightly-maintenance)).

### Which images are eligible

Only images pinned to a full version tag are updated automatically: `1.2.3`, `v1.2.3`, or those with a suffix such as `1.2.3-alpine`. Partial tags (`18`, `1.2`) and floating tags (`latest`, `stable`, `main`) are never touched, whatever the label says. Images from registries other than Docker Hub and GitHub's container registry are not listed for updates.

### The vps.auto-update label

An application's `vps.auto-update` label sets how far its tag may move:

| Value | Moves to |
|---|---|
| `off` | nothing; the application is left alone |
| `patch` | newer releases with the same major and minor number |
| `minor` | newer releases with the same major number |
| `major` | any newer release |

`patch+minor` is also accepted and, like `minor`, keeps the major number fixed. Applications default to `patch`; so does a missing or invalid value. Catena's own services default to `patch+minor`. Services that share one image take the most restrictive label. Labels are set in the application's compose file (see [Configure an app for Catena](/en/configure-apps/)).

### Waiting period and vulnerability gate

A new release is only adopted after it has existed for 7 days. A release no source can date is adopted only when its scan is clean.

Before an update, the candidate releases are scanned for known vulnerabilities (Trivy, high and critical severities, up to four candidates):

- A release that adds a new high or critical vulnerability is skipped in favour of a lower clean one, or the update waits.
- A newer release that removes a high or critical vulnerability present in the running one is applied without the 7-day waiting period.

Without a scanner the vulnerability check is off and the waiting period still applies. See [Vulnerabilities](/en/configuration/vulnerabilities/).

### Rollback and quarantine

After each update the server compares its health with the state before. If it is worse, the previous version is put back and the failed tag is quarantined, so the next run tries the next version up instead of the same one. An application with a database gets a dump taken before the update, put back on rollback.

### Managed updates panel

The **Managed updates** panel (Catena Pro) shows "Current state:" (IDLE when nothing runs) and a table of the last 14 runs with **Time**, **Terminal state** and **Result**. It reads "No managed-update runs recorded yet." until one has run. Three actions drive it:

| Action | Effect |
|---|---|
| **Run managed-update chain now** | Runs the whole nightly maintenance immediately, backup first. |
| **Show managed-update status** | Prints the current state of the chain. |
| **Install managed engines on this server** | Reinstalls the host-side update tools from the image the panel runs; used after a panel update. |

## Log events

The **Log** page records every update decision, among them:

| Event |
|---|
| Security updates installed. |
| `<count>` non-security update(s) available; scheduled for the next maintenance window. |
| `<app>` updated from `<from>` to `<to>`. |
| The update of `<app>` to `<version>` did not complete and was rolled back. |
| Host restarted during the nightly maintenance, or the restart did not go as expected. |
| Security advisories flagged in host packages or application images, and cleared. |
| No backup is configured; nightly updates run without one. |

## Community: update an application

Without the nightly maintenance, an application is updated by changing its image tag:

1. Open Portainer (`https://portainer.yourdomain.com`, or through the SSH forward before a domain exists).
2. Open **Stacks** and select the application.
3. In the editor, change the image tag to the new full version tag.
4. Press the update button under the editor.

A backup beforehand is advised (**Actions** > **Backups** > **Trigger backup now**). The **Upgrades** category of **Actions** is empty on Community: its buttons arrive with a subscription.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| An application never updates | Its tag is partial or floating, its label is `off`, or its newest release is younger than 7 days or adds a vulnerability. |
| "The last attempt did not finish." under **Control panel version** | The update was put back. Read the log in the section, then retry. |
| The restart banner stays | Restart from **System** > **Restart**, or let the nightly maintenance do it. |
| The version list is replaced by a text box | The registry could not be reached; type the version. |
