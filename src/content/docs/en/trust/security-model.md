---
title: Security model
description: The boundaries the suite defends, what we guarantee at each one, and what we deliberately leave out of scope.
---

This is the public summary of the threat model we maintain internally.
It states what we defend against and how, without publishing a map of
the attack surface. Each guarantee is exercised by the
[automated rehearsals](/en/trust/what-we-test/) and the gates described
in [How we validate](/en/trust/how-we-validate/).

## Who holds the keys

You do. Backups are encrypted **on your server, before anything leaves
it**, and land in object storage under your own account. The recovery
keyset (a handful of credentials documented at onboarding) lives in
your password manager -- with it, your whole server can be rebuilt
from scratch; without it, nobody can read your backups, including us.
The keyset is deliberately zero-knowledge: losing it while the server
is also gone is unrecoverable by design, which is why onboarding
insists on the password manager.

## What the server exposes

Nothing it does not have to. Web traffic enters through an encrypted
tunnel, so the machine itself has no open web port; remote
administration rides a private network, not the public internet; the
one exception is the audio/video media relay, which needs direct
packet paths to work. An external scan runs as part of validation and
fails it if anything unexpected answers.

## Who can log in where

One account per person, through the suite-wide login, with
multi-factor authentication available and per-application access
control enforced **in front of** the applications. Administrative
surfaces additionally require the administrator role; staff accounts
cannot reach them, and rehearsals check exactly that.

## What ransomware can and cannot do

An attacker who fully controls your server holds credentials for the
live backup storage -- so the design assumes that copy can be
destroyed. The offsite second copy (Catena Pro) is written additively
to a different provider with write-locking enabled: nothing that
happens on the server can alter or delete what is already there, and
both copies are verified restorable on a schedule.

## What happens if the worst happens

Recovery is a rehearsed procedure, not an improvisation: rebuild the
server from the backup and the keyset, restore in place, or migrate to
another provider entirely. All three paths are exercised continuously,
including across operating-system and database major versions.

## What we do not claim

Honesty about scope is part of the model. We do not defend against a
compromise of the underlying cloud vendors themselves (mitigated by
splitting providers, accepted as residual risk), and legal-compliance
adherence is audited by people, not enforced by code. When a control
is policy rather than software, we say so.
