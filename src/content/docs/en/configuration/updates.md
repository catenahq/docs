---
title: "Updates"
description: "What a Catena server updates on its own, what needs a decision, and how an update is gated, rolled back and recorded."
---

A Catena server has five layers that update independently: the operating system, the control panel, the Docker engine, Catena's own services and the applications. This page lists what moves on its own, what needs a click, and what Catena Pro adds.

| Layer | How it updates | Edition |
|---|---|---|
| Operating system | Security updates apply automatically; the restart is a decision. | All |
| Control panel | **Update this panel**, or the monthly **Control panel updates** job. | Button: all. Job: Catena Pro or Catena Business |
| Docker engine | **Upgrade Docker**, or a step of the nightly maintenance. | Button: all. Step: Catena Pro or Catena Business |
| Catena's own services | Patch releases by the nightly maintenance; newer versions arrive with a control panel update (see [Catena's own services](#catenas-own-services)). | Catena Pro or Catena Business |
| Applications | The nightly maintenance, behind a waiting period, a vulnerability check and a rollback. | Catena Pro or Catena Business |

On Community, no application is offered or given an update (see [Community: applications](#community-applications)). The [edition comparison](https://catena.run/en/#pricing) lists the editions.

## Operating system

Debian's automatic security updates run on every server, in every edition. They cover the security suite, stable updates, point releases and the private-network client's own repository. They never restart the server by themselves.

A restart is needed when an update replaces something that is already running. Once an hour the server checks whether one is due. While it is due, every admin page shows "An installed update takes effect only after this server restarts. Restart it from the System page." and the **System** page lists what asked for it and which services still run on replaced libraries.

To restart:

1. Open **System** > **Restart**.
2. Tick "I understand this stops every application on this server for about a minute."
3. Press **Restart this server**.

When the nightly maintenance and its **Restart** step are on, its last step restarts the server when one is due and then checks that every service came back. The **System** page reports "Last restart by the nightly maintenance" and its outcome, and the Log records it. Restarting is otherwise left to you because the downtime is a decision.

Under **Actions** > **Ops**, **Pending apt updates** lists what is waiting and **Recent auto-upgrade log** shows what the automatic updates did.

## Control panel version

Open **Settings** > **Control panel version**.

1. **Running now** shows the version the server runs.
2. Pick the target under **Version to install**. The list holds the published versions of this same panel. When the list cannot be fetched, the field becomes a text box and you type the version (for example `v1.2.3`); only a version of this same panel is accepted.
3. Tick "I understand the panel restarts and is briefly unavailable."
4. Press **Update this panel**.

The section follows the update through Downloading, Installing, Restarting, Checking health and Applying its configuration. While it downloads, the section shows the layers done and the MiB downloaded, refreshed every 5 seconds. The panel is unreachable for about a minute while it restarts and returns on its own; the update continues on the server even if you close the page. Everything else keeps running.

An update brings the newer versions of Catena's own services that were tested together with it (see [Catena's own services](#catenas-own-services)). It checks the server's health again after applying its configuration, and one that makes the server less healthy than before is put back automatically, along with the data copied for it (see [Rollback and quarantine](#rollback-and-quarantine)). The section then reads "The last attempt did not finish. This server put the previous version back and is running normally on it, one version behind." with the server's log of the attempt folded below.

The button works in every edition. The **Control panel updates** job on the [Schedules](/en/configuration/schedules/) page (monthly by default, Catena Pro or Catena Business) does the same on a schedule, through the same checks.

### When the panel cannot update itself

If the panel is unavailable or its update cannot run, run the install command again from your admin computer with the target release (see [Installation](/en/installation/)):

```sh
uvx catena-installer install --inventory <name> --release v1.2.3
```

The server moves to that release with that release's own code, the same end state as the panel update. After you have closed public SSH, add `--address <tailnet-ip>` for that run. Without `--release` the command re-applies the release the server already records.

## Docker engine

Open **System** > **Docker engine**.

1. Tick "I understand every application restarts for about a minute."
2. Press **Upgrade Docker**.

This moves Docker to the version the panel carries, then checks that every service came back; if one did not, the previous version is put back. A new major version is not installed by that button. When the panel carries one, a second box appears: tick "I understand this moves Docker to a new major version, and every application restarts." and press **Upgrade to the new major version**.

The nightly maintenance upgrades Docker the same way within the current major version. The result shows in the **Last upgrade** line of the section.

## Catena's own services

Catena's own services are the sign-in service, the reverse proxy, the monitoring services, the shared database and the helpers of the server dashboard.

- **Patch releases, by themselves.** On Catena Pro and Catena Business, the nightly maintenance moves each of them to its newest patch release. For the shared database, a minor release counts as a patch.
- **Newer minor and major versions, with a control panel update.** They arrive only with a control panel update (see [Control panel version](#control-panel-version)), after they were tested together before release. The control panel's own update takes any newer version.
- **The tunnel connector.** It is the one exception: after the waiting period and the vulnerability check, it takes any newer release by itself. The move stands only once the new connector reconnects to Cloudflare; otherwise the server puts the previous one back by itself.

The **Infrastructure** list on the **System** page shows beside each service what applies: "The nightly maintenance moves it to `<version>`" for a patch release, or "`<version>` arrives with a control panel update".

A service that keeps data has it copied before it moves, and put back if the move rolls back (see [Rollback and quarantine](#rollback-and-quarantine)).

## Applications (Catena Pro)

The nightly maintenance updates every application on the **Apps** page, and Catena's own services as described in [Catena's own services](#catenas-own-services). It first takes a backup and verifies it, and stops before any update if that fails, unless you left the backup step out (see [Schedules](/en/configuration/schedules/#nightly-maintenance)). You can leave out any step, and Catena warns when the combination is unsafe (see [Choosing the steps](/en/configuration/schedules/#choosing-the-steps)).

An application is updated in two ways, and the nightly maintenance does both: it moves an application to a newer version of itself from its repository, then moves the images inside each application file to newer tags.

### Apps added from a repository

You add an application from a repository on the server's list (see [Add an app from a repository](/en/configure-apps/#add-an-app-from-a-repository)). The repository publishes each version of an application as a tag, written `<app>/<version>-<revision>`, and the **Apps** page shows the one an application runs as "Version `<tag>` from `<repository>`". A newer version is a newer tag of the same application.

1. **Waiting period.** A tag is taken only after Catena has seen it for the waiting period (7 days by default, the same setting as for images: see [Waiting period and vulnerability gate](#waiting-period-and-vulnerability-gate)). The count starts the night Catena first sees the tag. When the newest tag has not waited long enough, the newest one that has is taken.
2. **Trusted repository.** The update applies by itself. Catena's catalog is trusted. A repository you add is trusted only if you tick **Trusted: apply its updates by themselves**.
3. **Repository that is not trusted.** The update is offered and waits for you. The application's card on the **Apps** page reads "Version `<tag>` is available (now `<current>`)." and the tile shows "Update `<tag>` offered". Tick "Move to version `<tag>` now" and press **Update**. The update then runs as a night's would, without the waiting period, and **Progress** opens under the form as it does when you add an app (see [Add an app from a repository](/en/configure-apps/#add-an-app-from-a-repository)).
4. **Version older than 12 months.** When the version an application runs dates from more than 12 months ago, an update to a newer one is only offered, even from a trusted repository.

A version whose content changes after Catena first saw it is refused and set aside. When the application declares versions it must pass through, the update goes through each of them in turn.

Every update first holds the application: its address answers a bare 503 (service unavailable) until the update stands or its rollback is complete, with no page that says why, and the application's writers are kept still with its own backup mode or update steps when it declares them (see [Declare the backup mode and update steps](/en/configure-apps/#declare-the-backup-mode-and-update-steps-optional)). The update takes a copy of the application's databases and data first, then checks the application's health, and rolls back by itself when the application is less healthy than before (see [Rollback and quarantine](#rollback-and-quarantine)).

### Revert an update

After an update stands, Catena keeps the application's previous files and the copies of its data for 14 days and until a backup taken after the update has succeeded, whichever is later. While they exist, an administrator can put the application back as it was before the update, on every edition:

1. On the **Apps** page, find the application's card. While the copies exist it offers "Put back the previous version", with a note that the files and data go back to how they were before the update.
2. Tick "Put `<app>` back to what it ran before its last update".
3. Press **Put back the previous version**.

The revert stops the application, puts back its previous files and data and starts it. The page then reads "`<app>` was put back to what it ran before its last update." and says what the revert dropped. The data written since the update is dropped, and the databases are copied as they are now and kept like the other copies. The version the application ran is set aside, so the nightly maintenance does not apply it again. When the server refuses, the page reads "The server refused the revert: the application was not updated by Catena, or the copies kept for it are gone."; an application changed outside Catena is refused too.

### Apps changed outside Catena

Catena updates an application only while its files and its services are what Catena last deployed. The **Apps** page says when they are not, with a badge on the application's card:

| Badge | Meaning |
|---|---|
| **Files changed by hand** | The compose file or the settings file in the application's folder differs from what Catena last deployed. |
| **Changed outside Catena** | A service of the application differs from the deploy, is missing, or a new one appeared, for example after a change in Docker or in another container manager. |
| **Own version of the file** | The files and services are as deployed, but the compose file is not that of a version of a repository. |
| **Stopped** | The application is stopped. |

The nightly maintenance leaves such an application alone, and a revert refuses it. A service that runs on the server without having been added by Catena is listed under **Outside Catena** and is never updated. Portainer and Arcane are optional apps of the catalog. The applications you deploy with them are in this group: Catena gives them routes, sign-in, monitoring and backups of their data through their labels, and their updates are that manager's job. Catena updates Portainer and Arcane themselves.

### Which images are eligible

Only images pinned to a full version tag are updated automatically: `1.2.3`, `v1.2.3`, or those with a suffix such as `1.2.3-alpine`. Partial tags (`18`, `1.2`) and floating tags (`latest`, `stable`, `main`) are never touched, whatever the label says. Images from registries other than Docker Hub and GitHub's container registry are not listed for updates.

### The vps.auto-update label

An application's `vps.auto-update` label sets how far its tag may move, from `off` to `major`; its values are in the [label reference](/en/configure-apps/#updates). Applications default to `patch`, which keeps the major and minor numbers; Catena's own services follow the rule in [Catena's own services](#catenas-own-services). Services that share one image take the most restrictive label.

### Waiting period and vulnerability gate

A new release is only adopted after it has waited a number of days, 7 by default. To change it, set **Days a new version waits before the nightly update takes it** (0 to 90, where 0 means no wait) beside **Updates** on the **Schedules** page (see [Choosing the steps](/en/configuration/schedules/#choosing-the-steps)). A release no source can date is adopted only when its scan is clean.

Before an update, the candidate releases are scanned for known vulnerabilities (Trivy, high and critical severities, up to four candidates):

- A release that adds a new high or critical vulnerability is skipped in favour of a lower clean one, or the update waits.
- A newer release that removes a high or critical vulnerability present in the running one is applied without the waiting period.

Without a scanner the vulnerability check is off and the waiting period still applies. See [Vulnerabilities](/en/configuration/vulnerabilities/). A vulnerability the vulnerability watch finds can also be patched on demand, or automatically when CISA lists it as exploited, without the waiting period (see [Patch a vulnerability](/en/configuration/vulnerabilities/#patch-a-vulnerability)).

### Rollback and quarantine

After each update the server compares its health with the state before. If it is worse, the previous version is put back and the failed tag is quarantined, so the next run tries the next version up instead of the same one. An application with a database gets a dump taken before the update, put back on rollback. When the new version of an application also upgrades its code, configuration and add-ons in place, as Nextcloud does, a copy of those is taken before the update too and put back on rollback while the application is stopped; its users' files are never put back. The copies are deleted once the update is kept or the rollback completes. A rollback that cannot finish keeps them on the server.

Before one of Catena's own services that keeps data moves to a new version, its data is copied, and the service is held for the copy. This covers the sign-in service and the stores of the monitoring services. If the move rolls back, or a control panel update does, the copied data and the previous versions are put back. Anything written between the copy and the rollback is lost, a few minutes at most.

### Services kept off the automatic updates

A catalog app's template can set `vps.auto-update=off` on a service whose files a new version may rewrite past what the version before it reads. The nightly maintenance never moves such a service. Two catalog services are kept off this way: Plane's object storage and Zammad's search index (Elasticsearch).

On Catena Pro, the nightly maintenance checks each of these services for a newer version. When it finds one, the app's tile on the **Apps** tab shows a notice that only administrators see:

- "`<service>` is kept off the automatic updates. Version `<new>` is available; it runs `<current>`." names the service, the version it runs and the version found.
- A second line says what is known of the vulnerabilities. It reads "Not checked for known vulnerabilities." when the scanner is off or could not read the running version, and "The running version has no known high or critical vulnerability with a fix." when it is clean. Otherwise it counts the high or critical vulnerabilities of the running version that have a fix. A newer version is checked only once it is on the server, so until then the line adds "Whether `<new>` fixes them is not known". Once it is on the server, the line reads "`<new>` fixes `<n>` of the `<m>` known high or critical vulnerabilities of the running version and brings `<k>` new ones.", and the confirmation page lists them under **Fixed:** and **New:**.

The notice disappears when the nightly check has not reported for two days, so it never names a version nothing has checked since.

To apply the update:

1. On the **Apps** tab, press **Update `<service>`** on the notice.
2. Read the page **Update a service kept off the automatic updates**. It names the service, the version it runs and the version offered.
3. Tick "I understand that `<service>` pauses while its data is copied, then restarts on the new version, and that the application stops for a few minutes if the update has to be rolled back."
4. Press **Update `<service>` to `<new>`**.

The page then reads "Update started. It continues on the server even if this page closes; this page and the Apps tab say where it got to." The update:

1. Copies the data of the service, pausing the service for the copy.
2. Moves the service to the new version.
3. Checks that the server is as healthy as before.
4. If it is not, puts the service back on its previous version with its data as it was, and does not offer the failed version again.

The service stays off the automatic updates afterwards, and its next version is offered the same way. Only one such update runs at a time ("An update of a service kept off the automatic updates is already running."). If another night's check has replaced the offered version while the page was open, nothing starts and the page shows the current one.

The tile and the page report where the update got to: "Updating `<service>` to `<new>`.", "`<service>` was updated to `<new>`.", or, when it did not hold, "The update of `<service>` to `<new>` did not hold and was rolled back" with the reason. A rollback that could not finish cleanly needs your attention; the **Log** tab and the server's update log say how far it got.

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
| The nightly maintenance completed, or did not complete cleanly and the step that failed. |
| A combination of steps chosen on the Schedules page is unsafe (see [Choosing the steps](/en/configuration/schedules/#choosing-the-steps)). |
| `<app>` was updated to `<version>` but the update could not be recorded, so bringing the server up to date puts the previous version back. |
| The update of `<app>` to `<version>` was rolled back but its record could not be cleared, so bringing the server up to date may install `<version>` again. |
| The nightly update leaves `<app>` alone: a service of it is not running. Its updates resume once the service runs. |

## Community: applications

Without the nightly maintenance, Catena looks for no newer version of your applications, offers none and applies none: an application stays on the version you added. The **Update** button on an application's card applies an offer on any edition, but only a night's run makes an offer, so a Community server shows none. The security alerts tell you when an application carries an exploited vulnerability, or a critical one with a fixed version (see [Security alerts](/en/configuration/vulnerabilities/#security-alerts-every-edition)). The **Upgrades** category of **Actions** is empty on Community: its buttons arrive with a subscription.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| An application never updates | Its tag is partial or floating, its label is `off` (see [Services kept off the automatic updates](#services-kept-off-the-automatic-updates)), or its newest release is younger than 7 days or adds a vulnerability. |
| "The last attempt did not finish." under **Control panel version** | The update was put back. Read the log in the section, then retry. |
| The restart banner stays | Restart from **System** > **Restart**, or let the nightly maintenance do it. |
| The version list is replaced by a text box | The registry could not be reached; type the version. |
| An application is never updated, though its repository has newer versions | The **Apps** page shows why on its card: a badge such as **Files changed by hand** (see [Apps changed outside Catena](#apps-changed-outside-catena)), or an offer waiting for you because the repository is not trusted. |
| The nightly update leaves an application alone | Fix the service that is down. The next nightly update takes the application again once every service runs. |
