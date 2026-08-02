---
title: What we test
description: The live, generated list of what the Catena suite's automated rehearsals cover.
---

<!-- Generated file. Do not hand-edit: the maintainers' tooling
     regenerates it and the build fails on drift. -->

This page is **generated, not written**: it is rendered from the same machine-checked manifest that classifies every source file and every test scenario of the Catena product, and the build fails whenever this page drifts from that manifest. What it claims is what is enforced.

Catena is exercised end-to-end by automated rehearsals: each one provisions disposable virtual servers, drives the real product (install, back up, break, restore) and checks the outcome -- including deliberately injected failures. The counts below are the rehearsals whose last recorded result was a pass. A rehearsal that exists but has not passed yet is not counted.

## Included in Community

### Encrypted backups to storage you own (10 rehearsals)

A scheduled weekly backup plus manual backups any time. Backups are encrypted on the server before leaving it and land in object storage the client owns; snapshots can be listed, browsed and exported without a restore. Daily and sub-daily cadence is a Catena Pro feature.

### Single sign-on across the suite (10 rehearsals)

One account signs in to every application, with per-application access control and staff/administrator separation enforced in front of the applications, not inside each one.

### Administration dashboard (4 rehearsals)

A web dashboard with role-aware access (staff see status, administrators also get maintenance actions). Every action a button triggers is logged in the server's system journal.

### Installation and application deployment (15 rehearsals)

Prepares a fresh server, installs the platform, and deploys the selected applications. Re-running the same managed operation converges the server back to its declared configuration, so a drifted or half-configured server is repaired, not rebuilt by hand.

### Application catalog and suite integrations (2 rehearsals)

Per-application deployment plus the wiring that makes the suite feel like one product: email, chat and video calling, file/office integration, antivirus watch and delivery canaries.

### Self-hosted monitoring (1 rehearsal)

On-server status pages, resource monitoring, a disk-space watchdog and an always-fresh report of which installed applications have updates available -- all hosted on the client's own server.

### Private networking and hardened public access (13 rehearsals)

All web traffic reaches the server through an encrypted tunnel, so no web port is ever open on the machine itself; remote administration rides a private peer-to-peer network, and audio/video calls get their own dedicated relay.

### Disaster recovery and restore (14 rehearsals)

A whole server can be rebuilt from nothing but the backup endpoint and its key, and a live server can be restored in place. Databases and applications come back as one coordinated operation, consistent with each other rather than each from its own moment in time. Both paths are rehearsed continuously, including across operating-system and database major versions.

### No lock-in, ever (2 rehearsals)

Delete the admin panel and everything you own keeps working: backups run, restores work, and every application stays online, using only standard tools and the settings stored on your own server. Leaving costs you convenience, never your data.

### Automated health and exposure checks (3 rehearsals)

A validation pass proves both directions: every service answers where it should (on-server and through the private network), and an external scan confirms nothing is reachable that should not be.

## Catena Pro

Catena Pro features are exercised by the same rehearsal suite; the counts come from the same manifest.

### Signed monthly compliance attestation (1 rehearsal)

A monthly, cryptographically signed report (uptime, backups, restore test, patching, identity posture, audit events) suitable for an insurer or auditor, verifiable against tampering.

### Tamper-evident central audit trail (1 rehearsal)

Every administrative action on the server is also shipped off the machine to central audit storage, so the trail survives even if the server itself is lost or tampered with.

### Offsite immutable backup copy (5 rehearsals)

A second backup copy at a different provider, write-locked so that even a compromised server cannot alter or delete it, with recurring verification that both copies actually restore.

### Vulnerability scanning (1 rehearsal)

Recurring scans of the installed software and its containers for known vulnerabilities, with findings fed into the maintenance and attestation reporting.

### Automated daily maintenance (13 rehearsals)

A supervised daily routine on the server: hourly backups, package and health checks, and an ordered maintenance chain that resumes safely after interruption.

### Managed lifecycle operations (migration, decommission) (rehearsed as a managed operation)

Whole-server migration between providers, orderly decommission with data handback, and fleet-wide pause/stop -- performed for the client as managed operations and rehearsed regularly.

### Licensed feature activation (6 rehearsals)

Pro features activate through a cryptographically signed license and deactivate cleanly when it lapses; the Community base keeps working either way.

### Identity posture monitoring (rehearsal written, not yet passing)

Recurring checks that the account structure stays healthy: enforced multi-factor authentication, the agreed group model, and no unexpected administrator accounts -- with drift raised as an alert.

### Managed updates with automatic rollback (9 rehearsals)

Applications and system components update on a managed schedule; a failed update is detected and rolled back to the last working version without intervention.

### External availability monitoring (rehearsal written, not yet passing)

Independent monitoring from outside the server, including a dead-man switch: silence itself raises an alert, so a server that goes dark cannot go unnoticed.

### Multiple domains, each with its own private sign-on (1 rehearsal)

On paid plans a single server can host several separate, unlinked domains, each with its own private sign-on so people using one domain never see another domain's login. Shared dashboards stay on the first (primary) domain.

### A move you can call off (1 rehearsal)

Moving to another server copies almost everything while the old one is still serving, so the time your applications are unavailable is measured in minutes rather than hours. Up to the last check the move can be called off and the old server puts itself back into service on its own. Past that point it keeps answering one request -- put yourself back in service -- even after everything else on it has stopped, and its own backups are left untouched as the way back. That request travels over your own private network and works only while you have opened a window from the server itself and copied a one-time code it shows you once.

Full technical detail (implementation paths and scenario names for the Community edition) lives in the public [validation sheet on GitHub](https://github.com/catenahq/catena-ce/blob/main/VALIDATION.md).
