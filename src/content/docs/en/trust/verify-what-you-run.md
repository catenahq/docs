---
title: Verify what you run
description: Check the signature, read the component inventory, and scan the admin panel image yourself - no credentials, no permission needed.
---

The administration panel is the one piece of Catena whose source is not
published. That is a fair thing to be uneasy about, so it ships in a form
you can inspect: a **public container image, built plain**. Nothing is
obfuscated, nothing is stripped to make it unreadable, and every release
publishes the evidence you need to check it.

You do not need an account, a credential, or anyone's cooperation to run
any of the checks below.

:::note
The signature, the component inventory and the published digest arrive
with the first release cut from the current pipeline. If a check below
reports nothing to verify, your server is running an image published
before it.
:::

## 1. Find out exactly what your server runs

On your server:

```sh
sudo docker image inspect --format '{{index .RepoDigests 0}}' \
  ghcr.io/catenahq/catena-admin:latest
```

That prints an immutable reference, `ghcr.io/catenahq/catena-admin@sha256:...`.
A tag can be moved to point at different bytes later; a digest cannot. Use
this digest for everything that follows.

To see which build is answering, ask the panel itself:

```sh
sudo docker run --rm --network catena-network busybox \
  wget -qO- http://catena-admin:8000/health
```

It reports the release version and the exact commit the image was built
from, so a moving tag can never leave you guessing.

## 2. Verify the signature

Install [cosign](https://github.com/sigstore/cosign), then:

```sh
cosign verify ghcr.io/catenahq/catena-admin@sha256:<digest> \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp '^https://github.com/catenahq/catena-admin/\.github/workflows/publish-image\.yml@refs/tags/v'
```

This proves the image was published by the release workflow on a version
tag, and by nothing else. The signature and its certificate live in
Sigstore's public transparency log, so the check is against public
infrastructure rather than against a claim.

Releases also carry a second signature made with an ordinary key, for
networks that cannot reach Sigstore. Verifying it needs the public half
of that key, published alongside the release:

```sh
cosign verify --key <published-key> ghcr.io/catenahq/catena-admin@sha256:<digest>
```

## 3. Read the component inventory

Every release publishes a CycloneDX SBOM: the full list of software
components inside the image, with versions. Two ways to get it:

```sh
cosign verify-attestation --type cyclonedx \
  ghcr.io/catenahq/catena-admin@sha256:<digest>
```

or download `sbom.cdx.json` from the
[release page](https://github.com/catenahq/catena-admin/releases). The
release also carries `image-digest.txt`, the digest that release
published, so you can confirm the reference your server reports is the
one that was signed.

## 4. Scan it yourself

The inventory is only useful if you can act on it. Point any scanner at
the same digest:

```sh
trivy image ghcr.io/catenahq/catena-admin@sha256:<digest>
```

You should expect a clean result at HIGH and CRITICAL: the release
pipeline scans that exact digest before the `latest` tag is allowed to
move to it, and the published image is re-scanned on a schedule so a
vulnerability disclosed after release is caught rather than waited out.
If you find something that is not already suppressed with a documented
reason, report it to security@catena.run.

## What this does and does not prove

It proves the image you run was published by the Catena release pipeline,
that its component inventory is complete and checkable, and that you can
audit it for known vulnerabilities on your own schedule with your own
tools.

It does not prove the panel's source does what the published binary does,
because that source is not public. Nobody can verify that from outside.
What is published instead is the property that makes the claim testable
at all: the build is deterministic, and the release pipeline rebuilds the
same tree twice and fails if the two results differ.

Everything else in Catena -- the installer, the automation that prepares
your server, the recovery path -- is
[public source](https://github.com/catenahq/catena-ce) you can read
directly. The promises those repositories make, and the gates that
enforce them, are listed in
[SPEC.md](https://github.com/catenahq/catena-ce/blob/main/SPEC.md) and
described in [How we validate](/en/trust/how-we-validate/).
