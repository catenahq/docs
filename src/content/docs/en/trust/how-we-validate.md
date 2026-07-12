---
title: How we validate
description: The three layers that keep the product honest - automated rehearsals, security scanning gates, and drift gates.
---

Three independent layers keep Catena honest. Each one is automated and
blocking: when a layer fails, the change does not ship.

## 1. Automated rehearsals

Every meaningful behaviour -- install, re-configure, back up, break,
restore, recover a whole server -- is rehearsed by an automated suite
that provisions disposable virtual servers and drives the real
product, not a simulation. Rehearsals include deliberate failure
injection: services crashed mid-operation, full disks, unreachable
storage, expired certificates, network partitions. A restore that has
never been rehearsed is treated as broken.

The live list of covered features is on
[What we test](/en/trust/what-we-test/); the technical sheet with
scenario names is in the
[public repository](https://github.com/catenahq/catena-ce/blob/main/VALIDATION.md).

## 2. Security scanning gates

Every change to every repository passes through the same battery of
scanners before it can merge: secret detection over the full history,
known-vulnerability checks on all dependencies and container images,
and static analysis of the source. The scanners run in public CI on the
public repositories -- the results are not a claim, they are visible
runs.

## 3. Drift gates

The specification and validation sheets you can read are **generated
from the same machine-checked manifest that classifies the source
code**, and the build fails whenever a sheet drifts from reality. A
promise whose enforcement disappears breaks the build; a feature that
gains code but no rehearsal is flagged as unclassified. That is why the
sheets can be trusted at the exact version that ships:

- [SPEC.md](https://github.com/catenahq/catena-ce/blob/main/SPEC.md) --
  the hand-written promise, where every invariant points at the exact
  gate that enforces it, and every pointer is machine-resolved.
- [VALIDATION.md](https://github.com/catenahq/catena-ce/blob/main/VALIDATION.md) --
  the generated coverage sheet.
- The same pattern covers the
  [application catalog](https://github.com/catenahq/catena-templates/blob/main/SPEC.md)
  and the [legal and pricing facts](https://github.com/catenahq/contracts).
