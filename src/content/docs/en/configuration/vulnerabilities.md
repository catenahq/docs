---
title: "Vulnerabilities"
description: "Where known vulnerabilities show on a Catena server, how they are found, alerted on and patched, the software inventory, and how the control panel image is verified."
---

A server reports known vulnerabilities (published CVEs) in two places: the software in the running application images, and the packages of the host operating system. Findings are informational: they never stop the nightly maintenance by themselves. The update engine uses the same scans to avoid adopting a release that makes things worse.

## Prerequisites

- Scans run as part of the nightly maintenance, which needs Catena Pro or Catena Business (see [Schedules](/en/configuration/schedules/) and the [edition comparison](https://catena.run/en/#pricing)). Until a scan has run, the figures read "Not measured yet".
- The scanner ships with the server. If the scan reports it missing, run **Install managed engines on this server** (see [Updates](/en/configuration/updates/#managed-updates-panel)) to restore it.

## Where findings show

### Known vulnerabilities card

On the **System** page, the **Known vulnerabilities** card gives two counts, labelled "critical / high in running apps". They come from a Trivy scan of every image of a running container, at high and critical severity, counting only vulnerabilities for which a fix has been published. A finding therefore means a fixed version exists upstream, even if the application's image does not carry it yet.

Each report lists at most 200 findings. On the first of each month it is archived, and the last three monthly archives are kept on the server.

### Log events

The **Log** page records changes in the advisories, from both scans:

| Event | Source |
|---|---|
| `<count>` security advisory(ies) flagged in host packages; tracked for the next update cycle. | Operating system packages |
| Security advisories in host packages cleared. | Operating system packages |
| `<count>` security advisory(ies) flagged in application images; tracked for the next update cycle. | Application images |
| Security advisories in application images cleared. | Application images |
| `<app>` carries `<vulnerability>` (`<severity>`) in `<packages>`, which the vulnerability watch alerts on. | Vulnerability watch |
| `<app>` no longer carries `<vulnerability>`. | Vulnerability watch |
| `<app>` was moved from `<from>` to `<to>` to patch `<vulnerability>`. | Patch |
| The patch of `<app>` to `<version>` against `<vulnerability>` did not hold and was rolled back. | Patch |

## How the scans run

Two steps of the nightly maintenance produce the findings:

1. **Host vulnerabilities.** The list of security advisories that apply to the packages installed on the host.
2. **Image vulnerability scan.** Runs after the application updates, so it reflects the state after any update. The scanner's vulnerability database is refreshed at each run, and the cached copy is used if that fails.

Both are informational and never abort the chain. Only a failing backup, backup verification or status check stops it (see [Schedules](/en/configuration/schedules/#nightly-maintenance)).

## How the update engine uses the scans

Before an application update, the candidate releases are scanned the same way:

- A release that adds a new high or critical vulnerability is never adopted. The engine falls back to a lower clean release, or the update waits.
- A newer release that removes a high or critical vulnerability from the running one is applied without the usual 7-day waiting period.

The rules for tags, labels and rollback are on the [Updates](/en/configuration/updates/) page.

## What to do about a finding

1. Open the **Log** and the **System** page to see which side the finding is on: an application image or a host package.
2. For an application image, a newer release usually removes it. The nightly maintenance applies such a release by itself, without the 7-day wait, unless the application is labelled `vps.auto-update=off` or its tag is not a full version tag. Otherwise change the tag by hand: open Portainer, open **Stacks**, select the application, edit the image tag to the fixed release and press the update button.
3. For a host package, the automatic security updates apply the fix. If the **System** page shows a restart is pending, restart from **System** > **Restart**. **Pending apt updates** under **Actions** > **Ops** lists what is waiting.
4. If no newer release exists yet, the finding stays until the image is rebuilt upstream. The next nightly scan reports it as cleared in the Log once it is gone.

## Vulnerabilities page (Catena Pro)

The vulnerability watch checks the software of every application and service on the server against a vulnerability database that it refreshes when the one in use is six hours old, and against CISA's list of vulnerabilities attackers are actively exploiting. The server downloads both as data and checks locally: no list of your software leaves it.

**Vulnerabilities** lists, per application, each high or critical known vulnerability and each one CISA lists as exploited, with its package, installed and fixed version, and when it was first seen. A vulnerability CISA lists carries an "exploited" badge with the dates CISA gives and, when it applies, a "ransomware" badge. A vulnerability with no fixed version reads "no fix published yet".

To open the page, open the **Managed updates** panel and follow **Vulnerabilities**. It needs Catena Pro and an administrator account. An application's tile on the **Apps** tab shows administrators "Vulnerabilities to act on" and, when CISA lists some, "Exploited by attackers" counts, and the **Known vulnerabilities** card on **System** adds the count of exploited vulnerabilities in the software running there.

The page shows when the findings were made, the age of the vulnerability database and the version of CISA's list in use. It warns when the watch cannot do its job: no scanner installed, no database yet, a database over 48 hours old, CISA's list not read for over 7 days, or the list of running images unreadable. Findings not renewed for over 26 hours are marked "out of date" and offer no patch. Running services whose image has no software list yet appear under **Not checked**.

### Turn the watch on

The watch is a scheduled job, **Vulnerability watch**, switched off until you turn it on (see [Schedules](/en/configuration/schedules/)). It needs Catena Pro. While it is off, the page says so and its findings are renewed only when you press **Check now**.

**Check now** runs the watch in the background: a fresh database when the one in use is six hours old, CISA's list, then a check of every application. The page shows the findings a few minutes later.

### Alerts

The watch raises one alert for each vulnerability that CISA lists as exploited, or that is critical and was published in the last 30 days. It keeps alerting on it, whatever its age, while anything on the server carries it. The alert goes to the admin email and to every channel set up in Healthchecks (see [Alerts](/en/configuration/alerts/)), and it names the vulnerability, each application and package carrying it, and the fixed version. It is one alert for the vulnerability, however many applications carry it; the text is updated when another application comes to carry it. When no application carries the vulnerability any more, the alert resolves.

A second alert, **CVE watch**, fires when the watch itself cannot check: the same causes the page warns about.

### Patch a vulnerability

1. On **Vulnerabilities**, press **Patch** beside the vulnerability.
2. Read the page **Patch a vulnerability**. It lists the application services carrying it and what the patch does. A patch moves at most 20 services; the others stay listed for the next one. The server's own infrastructure services are listed apart: its updates move them, so they are not patched from here.
3. Tick "I understand that each service listed restarts on its new version, and that a service whose move does not hold goes back to the version it runs now."
4. Press **Patch `<vulnerability>`**.

The patch moves each service to the oldest version that its update policy allows and that a scan on the server shows free of the vulnerability, even when that version is newer than the usual waiting period (see [Updates](/en/configuration/updates/#waiting-period-and-vulnerability-gate)). Before the move it copies the service's database and data. It then checks that the server is as healthy as before and puts everything back if it is not, the same way every update does. It scans the new image again and starts the watch, so the alert resolves once the vulnerability is gone.

A service kept off the automatic updates is moved too when you confirm, with its data copied first; its label stays as it is. The patch never moves a service to a version outside its update policy: when only a newer version is free of the vulnerability, nothing moves and the page names that version, so you can widen the service's `vps.auto-update` label (see the [label reference](/en/configure-apps/#updates)) and patch again.

A scan finds what the scanner can identify. Code that an application's authors copied into it can escape the scan, and so escapes this check.

The patch continues on the server if you close the page. **Last patch** on the **Vulnerabilities** page says where each service got to:

| Result | Meaning | What to do |
|---|---|---|
| Moved from `<a>` to `<b>`. The scan after the move no longer finds the vulnerability. | The patch worked. | Nothing. |
| Moved from `<a>` to `<b>`, but the scan after the move still finds the vulnerability, or could not be made: not verified. | The service stays on the new version and the scanner still finds the vulnerability. | Check the reason shown, then watch for a later release. |
| The move did not hold and was rolled back; the version is not offered again. | The health check failed and the service is back on its previous version with its data. | Read the reason shown. |
| The move could not be rolled back cleanly and needs attention. | The rollback did not finish. | Check the **Log** tab and the server's update log. |
| Not moved: no version its update policy allows is free of the vulnerability. `<version>`, past that policy, is. | Only a newer version is free of it. | Change the service's `vps.auto-update` label, then patch again. |
| Not moved: no published version newer than `<a>` that was scanned is free of the vulnerability yet, or every version free of it brings a new high or critical one. | Upstream has no usable fix yet. | Wait for a new release; the alert stays. |
| Not moved: a scan of the image it runs does not find the vulnerability. | The findings were out of date. | Press **Check now**. |
| Not moved: its label keeps it off the automatic updates. | The automatic patch never moves such a service. | Patch it from this page. |
| Not run: the updates are paused on this server. | The automatic patch waits while updates are paused. | Patch from this page, which a pause does not stop. |
| Not moved: the images could not be scanned, there is no scanner or database yet, the application is stopped, the application or service is no longer deployed, the versions of its image cannot be listed, or the service runs a version on a naming scheme its publisher has left. | The reason follows the message. | Fix the cause it names, press **Check now**, and patch again. |

### Automatic patch

Under **Settings** > **Vulnerabilities**, the **Automatic patch** field chooses what the server does about an exploited vulnerability:

- **Off: a person confirms each patch** (the default).
- **Patch exploited vulnerabilities automatically**: each time the watch finds a vulnerability CISA lists as exploited in an application service, the server patches that service as a confirmed patch would, with the same copy, health check and rollback.

The automatic patch never moves a service kept off the automatic updates, and it waits while updates are paused. It asks about one service and vulnerability at most once a day, so a version published later is still taken. It needs Catena Pro: the setting can be saved without it, and nothing is patched until the subscription includes it. **Last patch** says "Started by the automatic patch" for its runs.

## Software inventory (Catena Pro)

**Software inventory** lists every running service's image with its software bill of materials (SBOM, CycloneDX format) to download, and finds which services carry a package, searched by name or `name@version`. The server makes each SBOM itself, without downloading anything. Open it from the **Managed updates** panel, or from the link at the foot of **Vulnerabilities**.

- **Find a package**: type a name, for example `openssl`, or `openssl@3.0.15` for one version. The results list each matching package, its version and the services running it. Only the first matches are listed; a longer name narrows the search.
- **Running images**: each service with its application, image, package count and an SBOM to download, for an auditor or another scanner. An image with no SBOM shows why.

The list is empty until the watch or the nightly scan has listed the images.

## Verifying the panel image

The control panel runs from a public image, `ghcr.io/catenahq/catena-admin`, pulled without credentials. Each release is published in this order, and the version tag and `latest` are added only at the end, so no tag a server resolves points at an image that failed a step:

1. The image is built for x86_64 and pushed under a commit tag.
2. The exact image digest is scanned with Trivy at high and critical severity, fixable findings only. A finding fails the release.
3. A CycloneDX SBOM (software bill of materials) is generated from that digest.
4. The image is signed with a keyless Sigstore signature, bound to the identity of the publishing workflow and recorded in the public Rekor log. The SBOM is attached to the image as a signed attestation.
5. The version tag and `latest` are pointed at that same digest.

The release workflow also builds the panel binary twice and fails if the two builds differ.

To scan the published image with any scanner, resolve the digest of a version tag, then scan the digest. With Trivy, add `--skip-version-check` and `--disable-telemetry` so the scan does not report to the scanner's maker:

```sh
docker buildx imagetools inspect ghcr.io/catenahq/catena-admin:<tag> --format '{{.Manifest.Digest}}'
trivy image --skip-version-check --disable-telemetry ghcr.io/catenahq/catena-admin@sha256:<digest>
```

To check the signature and read the SBOM with `cosign`:

```sh
IMAGE=ghcr.io/catenahq/catena-admin@sha256:<digest>
cosign verify "$IMAGE" \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp '^https://github.com/catenahq/catena-admin/\.github/workflows/publish-image\.yml@refs/tags/v'
cosign verify-attestation --type cyclonedx "$IMAGE" \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp '^https://github.com/catenahq/catena-admin/\.github/workflows/publish-image\.yml@refs/tags/v'
```

Security reports go to security@catena.run.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| The card reads "Not measured yet" | No scan has run: the nightly maintenance is off or has not reached the scan step. Run it from **Actions** with **Run managed-update chain now** once your subscription is active. |
| A finding stays after an update | The image maintainers have not published a fixed rebuild, or the application is held by its label or tag. See the steps above. |
| Counts differ from another scanner | The panel counts only high and critical findings with a published fix, across the images of running containers. |
