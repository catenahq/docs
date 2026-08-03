---
title: "Sizing a VPS"
description: "Per-app resource footprint for sizing a VPS. Last measured: 2026-04-29."
---

Resource footprint of every pre-configured app, for picking a VPS
tier that matches the intended deployment.

**Last measured:** 2026-04-29
**Measured on:** dev1 (1 vCPU / 2 GB OVH VPS)

## Footprint table

| Template | RAM (idle) | RAM (peak) | CPU (idle) | CPU (peak) | Disk (baseline) |
|---|---|---|---|---|---|
| Nextcloud | 420 MB | 880 MB | 2% | 65% | 320 MB |
| Rocket.Chat | 520 MB | 720 MB | 3% | 35% | 180 MB |
| OnlyOffice | 380 MB | 620 MB | 1% | 80% | 90 MB |
| Outline | 280 MB | 420 MB | 1% | 25% | 110 MB |
| EspoCRM | 240 MB | 480 MB | 1% | 40% | 200 MB |
| Twenty | 580 MB | 920 MB | 4% | 55% | 220 MB |
| Plane | 720 MB | 1040 MB | 4% | 50% | 380 MB |
| Windshift | _n/a_ | 2300 MB | _n/a_ | _n/a_ | _n/a_ |
| WordPress | 320 MB | 600 MB | 1% | 70% | 180 MB |
| n8n | 280 MB | 700 MB | 2% | 80% | 150 MB |
| ERPNext | 2100 MB | 2900 MB | 8% | 90% | 850 MB |
| Actual Budget | 80 MB | 180 MB | 1% | 15% | 30 MB |
| Postiz | 480 MB | 680 MB | 2% | 35% | 200 MB |
| DocuSeal | 320 MB | 540 MB | 1% | 35% | 140 MB |
| Mautic | 1500 MB | 3000 MB | 3% | 75% | 420 MB |
| Collabora Online (CODE) | _n/a_ | 1024 MB | _n/a_ | _n/a_ | _n/a_ |
| Element / Matrix | _n/a_ | 1536 MB | _n/a_ | _n/a_ | _n/a_ |
| Zammad | _n/a_ | 1536 MB | _n/a_ | _n/a_ | _n/a_ |
| Chatwoot | _n/a_ | 768 MB | _n/a_ | _n/a_ | _n/a_ |
| Easy!Appointments | _n/a_ | 384 MB | _n/a_ | _n/a_ | _n/a_ |
| Kimai | 250 MB | 500 MB | 1% | 35% | 180 MB |
| Invoice Ninja | 400 MB | 800 MB | 2% | 45% | 350 MB |
| Mail server + webmail | 520 MB | 900 MB | 3% | 40% | 600 MB |

CPU is normalized to one core: 100% means one full vCPU is busy. Peak
values are what we observed while exercising the app the way the
[setup steps](/en/apps/) describe (the first mass-upload to
Nextcloud, the first wizard pass on ERPNext, etc.).

## Tier guidance

These are starting points. Real numbers depend on how many users log
in and how heavy the workload is.

- **6 GB VPS (starting tier):** comfortable for the productivity bundle
  (Nextcloud + EspoCRM + Rocket.Chat + Outline) plus one mid-weight
  template (Plane, Twenty, Postiz, Outline). Don't run ERPNext on
  this tier.
- **8 GB VPS:** required for ERPNext beside one other meaningful
  template, or for any combination that adds a second mid-weight
  template to the productivity bundle.
- **12 GB+ VPS:** ERPNext alongside the full productivity bundle, or
  any combination of two heavy templates.

## Notes per template

### Nextcloud

The app + db + redis + cron stack idles at ~420 MB. Heaviest single
service is `app` (PHP-FPM) at ~280 MB idle, ~600 MB during the
first user's mass-upload pass. With S3 primary storage configured,
disk on the VPS stays roughly constant -- bucket grows instead.
Antivirus (files_antivirus, Daemon mode) is wired by ops to the
SHARED ops-managed clamd (catena-clamav network, ~1.5 GB resident),
NOT counted in these figures -- it is base infra shared with the
mail server; budget it once at the VPS level.
### Rocket.Chat

MongoDB replica set + Rocket.Chat node process. MongoDB's WiredTiger
cache is the dominant cost; default settings fit comfortably on the
6 GB starting tier.
### OnlyOffice

Idle is light; a single editing session spawns per-document worker
processes. Three concurrent editors push CPU to 80% on a single
vCPU. Pair with Nextcloud (it's a backend, no direct UI).
### Outline

Node app + Postgres + Redis. Lightweight in steady state; the
collaborative-editor websocket layer adds ~50 MB per simultaneous
editor.
### EspoCRM

PHP-Apache + MariaDB + cron sidecar. Lightweight day-to-day; mass
email or bulk import pushes peak RAM to ~480 MB and CPU to ~40%
on one vCPU.
### Twenty

Server + worker + Postgres + Redis -- four containers; idle RAM is
higher than EspoCRM. Choose Twenty for the modern UI; choose
EspoCRM for tighter footprint.
### Plane

Multi-container stack (api + worker + beat + frontend + space +
MinIO + Postgres + Redis). Heavy idle RAM; budget 1 GB
headroom over the rest of the suite.
### Windshift

NOT MEASURED. peak_ram_mb here is a declared budget, not an
observation: 2048 MB is the process budget Windshift ships as its
own default (WINDSHIFT_MEMORY_LIMIT_MB, matched by mem_limit: 2g
in the compose), plus ~250 MB for the Postgres side. The bench
scheduler needs a positive int, and over-declaring only costs
parallel slots. Replace all five numbers on the first measured
run and drop this paragraph.
### WordPress

nginx + php-fpm + MariaDB + Redis. FastCGI cache absorbs
anonymous traffic; PHP only fires on cache misses + admin sessions.
A burst of editor logins or a plugin install spikes CPU.
### n8n

Lightweight at rest; a workflow run spawns Node child processes
per node and can spike RAM/CPU sharply. Heavy automation users
should size for the peak, not the idle.
### ERPNext

~10 containers. Heaviest template in the catalog. Plan for a
dedicated 8 GB+ VPS; co-locating ERPNext with the full productivity
bundle wants a 12 GB tier.
### Actual Budget

Single Node container, sqlite-backed. Negligible footprint;
effectively free to add.
### Postiz

Postiz + Postgres + Redis. Mid-weight; image-heavy posts push the
Sharp library hard during scheduling.
### DocuSeal

Rails + Postgres. Light at idle; signing flow's PDF cert-stamping
is the peak workload.
### Mautic

Three Apache/PHP containers (web + worker + cron) on top of
MariaDB. Idle RAM is dominated by the worker and cron sidecars
(~300 MB each, even at rest). Campaign sends and segment rebuilds
push peak RAM near 3 GB and CPU above 75% on one vCPU. Plan for
a 6 GB tier if Mautic is co-located with Nextcloud + Rocket.Chat;
otherwise a 4 GB tier holds for low-volume sending.
### Collabora Online (CODE)

Stateless document editor backed by Nextcloud. Sizing is dominated
by per-document worker processes spawned during active editing;
idle footprint is small. The peak figure above is a conservative
pre-launch estimate, not yet a measured value.
### Element / Matrix

Element (Synapse + Postgres + Redis) is memory-hungry during the
first federation sync; the value above is a launch-day floor.
Conservative pre-launch estimate, not yet a measured value.
### Zammad

Zammad (Rails + Postgres + Elasticsearch + Redis) sizes around the
Elastic JVM heap; budget room for it. Conservative pre-launch
estimate, not yet a measured value.
### Chatwoot

Chatwoot (Rails + Postgres + Redis + Sidekiq); peak grows with
active conversation count. Conservative pre-launch estimate, not
yet a measured value.
### Easy!Appointments

PHP-Apache + MariaDB; lightweight footprint dominated by the
database. Conservative pre-launch estimate, not yet a measured
value.
### Kimai

PHP-Apache + MariaDB. Idle is comparable to EspoCRM. Bulk
timesheet export or end-of-month invoice rendering pushes peak
RAM to ~500 MB and CPU briefly to ~35% on one vCPU. Conservative
pre-launch estimate, not yet a measured value.
### Invoice Ninja

Four containers: PHP-FPM + nginx + MariaDB + Redis. Idle RAM
higher than Kimai because supervisord runs both the queue worker
and the scheduler inside the app container. Peak occurs during
bulk-invoice generation or queue-catch-up after a network outage
(bundled Chromium spins up for PDF rendering). Conservative
pre-launch estimate, not yet a measured value.
### Mail server + webmail

docker-mailserver (Postfix + Dovecot + Rspamd + Fail2ban) is the
dominant cost; Rspamd and its Redis-backed stats account for most
of the idle footprint. Roundcube (Apache + PHP, SQLite prefs) adds
~120 MB; the mta-sts nginx is negligible (~5 MB). Peak is during a
mailbox sync + spam-scan burst on a busy inbound window. Disk
baseline excludes stored mail (grows with the mailboxes).
IMPORTANT base-infra cost NOT counted here: the bundled ClamAV is
OFF; antivirus is the SHARED ops-managed clamd (catena-clamav
network), which holds the signature DB resident at ~1.5 GB. That
clamd is a separate service (not in this compose), so it does not
appear in these per-template figures -- budget it once at the VPS
level. The same clamd also serves Nextcloud, so co-deploying the
two is a net saving vs two clamds. Conservative pre-launch
estimate, not yet measured.

---

A tier other than the one initially provisioned is available on
request -- a tier change is a one-command migration to a fresh VPS
with the same data.
