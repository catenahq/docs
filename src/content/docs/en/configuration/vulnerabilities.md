---
title: "Vulnerabilities"
description: "Where known vulnerabilities show on a Catena server, how they are found and used by the update engine, and how the control panel image is verified."
---

A server reports known vulnerabilities (published CVEs) in two places: the software in the running application images, and the packages of the host operating system. Findings are informational: they never stop the nightly maintenance by themselves. The update engine uses the same scans to avoid adopting a release that makes things worse.

## Prerequisites

- Scans run as part of the nightly maintenance, which needs Catena Pro or Catena Business (see [Schedules](/en/configuration/schedules/) and the [edition comparison](https://catena.run/en/#pricing)). Until a scan has run, the figures read "Not measured yet".
- The scanner ships with the server. If the scan reports it missing, run **Install managed engines on this server** (see [Updates](/en/configuration/updates/#managed-updates-panel)) to restore it.

## Where findings show

### Known vulnerabilities card

On the **System** page, the **Known vulnerabilities** card gives two counts, labelled "critical / high in running apps". They come from a Trivy scan of every image of a running container, at high and critical severity, counting only vulnerabilities for which a fix has been published. A finding therefore means a fixed version exists upstream, even if the application's image does not carry it yet.

Each report lists at most 200 findings. On the first of each month it is archived, and the last three monthly archives are kept on the server.

The status page also carries a check on these findings: it fails when a critical finding exists or when more than ten high ones do.

### Log events

The **Log** page records changes in the advisories, from both scans:

| Event | Source |
|---|---|
| `<count>` security advisory(ies) flagged in host packages; tracked for the next update cycle. | Operating system packages |
| Security advisories in host packages cleared. | Operating system packages |
| `<count>` security advisory(ies) flagged in application images; tracked for the next update cycle. | Application images |
| Security advisories in application images cleared. | Application images |

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

## Verifying the panel image

The control panel runs from a public image, `ghcr.io/catenahq/catena-admin`, pulled without credentials. Each release is published in this order, and the version tag and `latest` are added only at the end, so no tag a server resolves points at an image that failed a step:

1. The image is built for x86_64 and pushed under a commit tag.
2. The exact image digest is scanned with Trivy at high and critical severity, fixable findings only. A finding fails the release.
3. A CycloneDX SBOM (software bill of materials) is generated from that digest.
4. The image is signed with a keyless Sigstore signature, bound to the identity of the publishing workflow and recorded in the public Rekor log. The SBOM is attached to the image as a signed attestation.
5. The version tag and `latest` are pointed at that same digest.

The release workflow also builds the panel binary twice and fails if the two builds differ.

To scan the published image with any scanner, resolve the digest of a version tag, then scan the digest:

```sh
docker buildx imagetools inspect ghcr.io/catenahq/catena-admin:<tag> --format '{{.Manifest.Digest}}'
trivy image ghcr.io/catenahq/catena-admin@sha256:<digest>
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
