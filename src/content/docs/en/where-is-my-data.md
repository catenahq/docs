---
title: "Where the data lives"
description: "Plain-language answer to \"if the VPS burns down, what's lost and"
---

Plain-language answer to "if the VPS burns down, what's lost and
what's recoverable?" Worth one read at hand-off, so the mental map
exists before anything goes wrong; the
[Recurring tasks](/en/disaster-prevention/) and
[Recovering from a failure](/en/disaster-recovery/) pages assume that map.

## The short version

Data lives in **at least two places**, and possibly three:

1. **On the VPS itself** -- running databases, app config, file
   uploads for most apps.
2. **In the restic backup bucket** -- an encrypted off-site snapshot
   of the VPS, written with each backup, in a different city (and
   ideally a different country) from the VPS.
3. **In the Nextcloud-S3 bucket** *(only where Nextcloud runs with
   S3 storage)* -- the actual files Nextcloud users upload, in their
   own bucket separate from restic.

Anything stored only on the VPS is at risk; the VPS can fail or
be destroyed. Anything in restic + on the VPS is safe against any
single thing breaking. Anything in restic *or* Nextcloud-S3
specifically can also fail -- but those are independent failures
covered by [Recurring tasks](/en/disaster-prevention/).

## On the VPS

The day-to-day data that makes the apps work:

- **Postgres databases** -- every app's records (Nextcloud users,
  Outline pages, Easy!Appointments bookings, and the rest) live in a
  Postgres database inside a Docker volume on the VPS.
- **App config** -- what is configured, who has access, custom
  branding. Lives in app-specific Docker volumes.
- **File uploads** -- for apps that store files locally (Outline
  attachments, Rocket.Chat uploads, n8n workflow data). Lives in
  Docker volumes.
- **Postgres dumps** -- a plain-SQL copy of every database, staged on
  the VPS just before each backup runs. A safety net if the raw
  database volume is corrupted between backups.

## In the restic backup bucket

With each backup, everything in the previous section (plus VPS system
files like SSH host keys and firewall config) is encrypted and
uploaded to a **client-owned** S3 bucket -- not ours. The bucket, the
bill and the retention policy all belong to the client.

Default retention: 7 daily, 4 weekly, 6 monthly snapshots. Anything
older expires automatically.

The bucket is encrypted end-to-end with the **backup encryption
password** -- one of the three items in the recovery keyset (see
[Recurring tasks](/en/disaster-prevention/)). Without that
password, the bucket is unreadable ciphertext -- even to us. With it,
the server can be rebuilt on any cloud, any time.

## In the Nextcloud-S3 bucket (if applicable)

Where Nextcloud was deployed with S3 primary storage (the
"big files" pattern, normally used past ~20 GB), the **actual file
contents users upload to Nextcloud do not live in restic**. They live
in a separate S3 bucket that is also client-owned.

Why this matters:

- The restic snapshot stays small even when Nextcloud holds
  terabytes -- restic only carries Nextcloud's app code + its
  database, not the file bytes.
- Those files are reachable through Nextcloud's UI normally, and
  through any S3-compatible tool (`rclone`, `aws s3 sync`) directly
  when needed.
- The bucket survives independently of the VPS. If the VPS burns
  down, the files are still in the bucket. When a new VPS comes up
  and reconnects to the same bucket, every file is there.
- The bucket also fails independently of the VPS. Provider outages,
  bucket deletion, credential leaks affect the Nextcloud-S3 bucket
  *without* affecting the VPS or the restic bucket. See the
  Nextcloud-S3 risk section below.

Without Nextcloud-on-S3 (for example: a small Nextcloud install with
default local storage, or no Nextcloud at all), this whole section
does not apply -- Nextcloud files, if any, live on the VPS and ride
the restic backup like everything else.

### Nextcloud-S3 specific data-loss scenarios

Independent failure means independent worry. Each row below is a
separate "what if" plus the mitigation already in place.

| What happens | What's lost | What's already in place | The response |
|---|---|---|---|
| The Nextcloud-S3 bucket has a multi-day provider outage | Read/write of files (the server is fine; only file open/upload fails) | Gatus probes flag the failure as bucket-level, not server-level | Wait it out -- the files come back when the provider recovers; the team hears that uploads are paused |
| Bucket credentials leaked, attacker writes/deletes objects | Some or all files in the bucket | Object versioning + 30-day retention rule on the bucket means deleted objects are recoverable for 30 days | Rotate the bucket keys in the provider console, update them in catena-admin Settings, then roll the affected objects back to a pre-attack version |
| The bucket is deleted from the provider console by accident | Everything in the bucket once the provider's grace period ends | Most providers have a 7-90 day account-level grace period | Contact provider support immediately to recover the bucket within the grace window |
| Nextcloud database (on the server) is restored from yesterday's backup but bucket has today's writes | New files added today appear as orphans in the bucket | Nextcloud's `occ files:scan` rebuilds the database-to-file mapping from what's in the bucket | Run `occ files:scan` from a shell on the box (SSH in over Tailscale) to re-link the orphans |
| The provider terminates the account | Everything in that bucket | Only a second backup bucket at a different provider protects against this | With a [second backup bucket](/en/disaster-prevention/#5-optional--add-a-client-owned-second-backup-bucket) in place, the data is covered. Without one, this is the worst case |

The takeaway: the Nextcloud-S3 bucket is independent of the VPS,
which is good (the VPS dying does not take it along) and risky (the
bucket can fail without the VPS noticing). The mitigations above
cover the common cases; the catastrophic cases (bucket deletion,
account termination) are exactly what the **second backup bucket**
pattern in [Recurring tasks](/en/disaster-prevention/) is for.

## Externally hosted (not on the VPS, not in the buckets)

A few small things live in third-party admin consoles instead of
on the VPS:

- **DNS records** -- at Cloudflare, in the client's DNS account.
- **Cloudflare tunnel configuration** -- at Cloudflare, in the same
  account.
- **Tailscale tenant + ACL rules** -- at Tailscale, in a client-owned
  account -- the persistent administration path onto the box,
  see [How this software suite works](/en/how-this-stack-works/).
- **SMTP provider account** -- at the transactional email provider
  (Resend / Brevo / and so on) -- controls who can send mail "from"
  the domain.

These are recreated easily if any one of them fails -- a login to the
third-party console and a few clicks. The
[Recovering from a failure](/en/disaster-recovery/) page lists the recovery
path for each.

## Not backed up (by design)

These are intentionally NOT in the restic snapshot:

- `/var/log/` -- ephemeral, app logs rotate; not worth the storage.
- Container image layers -- re-pullable from the upstream registry,
  no need to hoard.
- Temporary directories (`/tmp`, `/var/tmp`) -- ephemeral by
  definition.

The rule of thumb for "did this end up in backup?" is: **state the
apps need to come back exactly as they were**, yes; **state that is
regenerated automatically on first boot**, no.

## What is lost if the VPS burns down

Worst-case scenario: physical destruction of the VPS, no warning.

- **VPS state since the last backup** -- anything created or
  modified between the latest backup snapshot and the moment of
  destruction. Depending on the backup schedule, that is 1-24
  hours. Apps held idle during that window lose nothing; apps
  receiving heavy writes (a busy Rocket.Chat, real-time editing in
  Outline) lose the most recent edits.
- **Anything in `/tmp` or container memory** -- not a real loss;
  nothing important lives there.
- **Nothing else.** Restic + (optional) Nextcloud-S3 + Cloudflare
  + Tailscale carry the rest.

The [Rebuilding a server from backup](/en/self-restore/) page
covers what "come back" looks like in practice.

Running all of this without Catena - or moving away entirely - is
covered by [Leaving Catena](/en/leaving/): every piece above stays
usable with standard tools alone.
