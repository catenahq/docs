---
title: "Where is my data?"
description: "Plain-language answer to \"if the VPS burns down, what's lost and"
---

Plain-language answer to "if the VPS burns down, what's lost and
what's recoverable?" Read this once at hand-off so you have a
mental map before anything goes wrong; the
[Recurring tasks](/en/disaster-prevention/) and
[Recovering from a failure](/en/disaster-recovery/) pages assume you know
where things live.

## The short version

Your data lives in **at least two places**, and possibly three:

1. **On the VPS itself** -- running databases, app config, file
   uploads for most apps.
2. **In your restic backup bucket** -- an encrypted off-site snapshot
   of the VPS, written with each backup, in a different city (and
   ideally a different country) from the VPS.
3. **In your Nextcloud-S3 bucket** *(only if you use Nextcloud with
   S3 storage)* -- the actual files Nextcloud users upload, in their
   own bucket separate from restic.

Anything stored only on the VPS is at risk; the VPS can fail or
be destroyed. Anything in restic + on the VPS is safe against any
single thing breaking. Anything in restic *or* Nextcloud-S3
specifically can also fail -- but those are independent failures
covered by [Recurring tasks](/en/disaster-prevention/).

## On the VPS

The day-to-day data that makes your apps work:

- **Postgres databases** -- every app's records (Nextcloud users,
  Outline pages, Easy!Appointments bookings, etc.) live in a Postgres
  database inside a Docker volume on the VPS.
- **App config** -- what's configured, who has access, custom
  branding. Lives in app-specific Docker volumes.
- **File uploads** -- for apps that store files locally (Outline
  attachments, Rocket.Chat uploads, n8n workflow data). Lives in
  Docker volumes.
- **Postgres dumps** -- a plain-SQL copy of every database, staged on
  the VPS just before each backup runs. A safety net if the raw
  database volume is corrupted between backups.

## In your restic backup bucket

With each backup, everything in the previous section (plus VPS system
files like SSH host keys and firewall config) is encrypted and
uploaded to **your** S3 bucket -- not ours. You own the
bucket, you pay the bill, you control retention.

Default retention: 7 daily, 4 weekly, 6 monthly snapshots. Anything
older expires automatically.

The bucket is encrypted end-to-end with your **backup encryption
password** -- one of the three items in your recovery keyset (see
[Recurring tasks](/en/disaster-prevention/)). Without that
password, the bucket is unreadable ciphertext -- even to us. With it,
your server can be rebuilt on any cloud, any time.

## In your Nextcloud-S3 bucket (if applicable)

If your Nextcloud was deployed with S3 primary storage (the
"big files" pattern, normally used when you'll store more than
~20 GB), the **actual file contents your users upload to Nextcloud
do not live in restic**. They live in a separate S3 bucket that is
also yours.

Why this matters:

- The restic snapshot stays small even if your Nextcloud holds
  terabytes -- restic only carries Nextcloud's app code + its
  database, not the file bytes.
- You access those files via Nextcloud's UI normally, and via any
  S3-compatible tool (`rclone`, `aws s3 sync`) directly if you ever
  need to.
- The bucket survives independently of the VPS. If the VPS burns
  down, the files are still in the bucket. When a new VPS comes up
  and reconnects to the same bucket, every file is there.
- The bucket also fails independently of the VPS. Provider outages,
  bucket deletion, credential leaks affect the Nextcloud-S3 bucket
  *without* affecting the VPS or the restic bucket. See the
  Nextcloud-S3 risk section below.

If you do **not** use Nextcloud with S3 (for example: small
Nextcloud install with default local storage, or no Nextcloud at
all), this whole section does not apply -- your Nextcloud files, if
any, live on the VPS and ride the restic backup like everything
else.

### Nextcloud-S3 specific data-loss scenarios

Independent failure means independent worry. Each row below is a
separate "what if" plus the mitigation already in place.

| What happens | What's lost | What's already in place | What you can do |
|---|---|---|---|
| Your Nextcloud-S3 bucket has a multi-day provider outage | Read/write of files (the server is fine; only file open/upload fails) | Gatus probes flag the failure as bucket-level, not server-level | Wait it out -- the files come back when the provider recovers; tell your team uploads are paused |
| Bucket credentials leaked, attacker writes/deletes objects | Some or all files in the bucket | Object versioning + 30-day retention rule on the bucket means deleted objects are recoverable for 30 days | Rotate the bucket keys in the provider console and update them in catena-admin Settings, then roll the affected objects back to a pre-attack version |
| You accidentally delete the bucket from the provider console | Everything in the bucket once the provider's grace period ends | Most providers have a 7-90 day account-level grace period | Contact provider support immediately to recover the bucket within the grace window |
| Nextcloud database (on the server) is restored from yesterday's backup but bucket has today's writes | New files added today appear as orphans in the bucket | Nextcloud's `occ files:scan` rebuilds the database-to-file mapping from what's in the bucket | Run `occ files:scan` from a shell on the box (SSH in over Tailscale) to re-link the orphans |
| Provider terminates your account | Everything in that bucket | Only a second backup bucket at a different provider protects you here | If you've set up a [second backup bucket](/en/disaster-prevention/#5-optional--add-a-client-owned-second-backup-bucket), you're covered. If not -- this is the worst case |

The takeaway: the Nextcloud-S3 bucket is independent of the VPS,
which is good (the VPS dying doesn't take it with) and risky (the
bucket can fail without the VPS noticing). The mitigations above
cover the common cases; the catastrophic cases (bucket deletion,
account termination) are exactly what the **second backup bucket**
pattern in [Recurring tasks](/en/disaster-prevention/) is for.

## Externally hosted (not on your VPS, not in your buckets)

A few small things live in third-party admin consoles instead of
on your VPS:

- **DNS records** -- at Cloudflare, in your DNS account.
- **Cloudflare tunnel configuration** -- at Cloudflare, in your CF
  account.
- **Tailscale tenant + ACL rules** -- at Tailscale, in the Tailscale
  account you own -- your persistent administration path onto the box,
  see [How this software suite works](/en/how-this-stack-works/).
- **SMTP provider account** -- at your transactional email provider
  (Resend / Brevo / etc.) -- controls who can send mail "from" your
  domain.

These are recreated easily if any one of them fails -- you log in to
the third-party console and click. The
[Recovering from a failure](/en/disaster-recovery/) page lists the recovery
path for each.

## Not backed up (by design)

These are intentionally NOT in the restic snapshot:

- `/var/log/` -- ephemeral, app logs rotate; not worth the storage.
- Container image layers -- re-pullable from the upstream registry,
  no need to hoard.
- Temporary directories (`/tmp`, `/var/tmp`) -- ephemeral by
  definition.

If you ever wonder "did this end up in backup?", the rule of thumb
is: **state your apps need to come back exactly as they were**, yes;
**state that's regenerated automatically on first boot**, no.

## What's lost if the VPS burns down

Worst-case scenario: physical destruction of the VPS, no warning.

- **VPS state since the last backup** -- anything created or
  modified between the latest backup snapshot and the moment of
  destruction. Depending on your backup schedule, that's 1-24
  hours. Apps held idle during that window lose nothing; apps
  receiving heavy writes (a busy Rocket.Chat, real-time editing in
  Outline) lose the most recent edits.
- **Anything in `/tmp` or container memory** -- that's not a real
  loss; nothing important should live there.
- **Nothing else.** Restic + (optional) Nextcloud-S3 + Cloudflare
  + Tailscale carry the rest.

The [Rebuilding your server from backup](/en/self-restore/) page
covers what "come back" looks like in practice.
