---
title: What Catena promises
description: The product promise, in one page, with links to how each part is enforced and verified.
---

Catena is built around one promise:

> **Your server can be rebuilt from nothing but its backup storage and
> the backup key.**

Everything else follows from it. This page states the promise in
plain words; the two companion pages show [how we validate it](/en/trust/how-we-validate/)
and [what is tested right now](/en/trust/what-we-test/).

## The promise, spelled out

- **Your data sits in storage you own.** Backups are encrypted on the
  server before they leave it and land in object storage under your
  account, not ours. You can list, browse and export snapshots at any
  time.
- **Recovery is rehearsed, not assumed.** Full-server recovery and
  in-place restores run continuously against disposable servers,
  including deliberately injected failures, before any change ships.
- **The server exposes nothing it should not.** Web traffic enters
  through an encrypted tunnel; no web port is open on the machine
  itself, and an external scan verifies that on every validation pass.
- **One login for the whole suite**, with per-application access
  control in front of the applications.
- **A scheduled backup is included in every edition.** Community runs
  a weekly backup; daily and sub-daily cadence, managed updates and
  the offsite immutable copy are part of Catena Pro.

## Why you can check this instead of trusting us

Every claim above is tied to a machine-checked gate: an automated
rehearsal, a security scan, or a build rule that fails when
documentation drifts from the code. The specification and validation
sheets live in the public repositories, where you can read them at the
exact version that ships:

- [Catena Community specification (SPEC.md)](https://github.com/catenahq/catena-ce/blob/main/SPEC.md)
  and its [validation sheet](https://github.com/catenahq/catena-ce/blob/main/VALIDATION.md)
- [Application catalog specification](https://github.com/catenahq/catena-templates/blob/main/SPEC.md)
- [Legal terms, pricing and brand facts](https://github.com/catenahq/contracts) --
  the same versioned files rendered at [catena.run](https://catena.run/en/legal/master-agreement),
  so the text you accepted is verifiable at its exact revision.
