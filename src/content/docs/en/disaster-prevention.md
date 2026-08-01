---
title: "Recurring tasks"
description: "The short checklist of what to do at onboarding, once a month, and once a year so recovery is always possible."
---

These are the tasks that keep a deployment recoverable. They belong
**before** anything goes wrong, so that when something does, the day
lands on the "annoying Tuesday" side of the line instead of the "data
loss" side. The companion page,
[Recovering from a failure](/en/disaster-recovery/), covers what to do
once something has broken.

**When to do each:**

- **At onboarding (once):** save the recovery keyset (1), get the SSH
  key off the laptop (2), confirm bucket location (3) and the
  immutable mirror (4), decide on a second backup bucket (5), and
  confirm the recovery path end to end (7).
- **Once a month:** a quick glance that backups are still landing and
  nothing in the keyset has drifted.
- **Once a year:** re-confirm the immutable mirror, the second bucket
  (where there is one), and that the saved keyset still matches what is
  installed (6).

> This page is written for non-technical readers -- owners, managers,
> office staff. No terminal commands required. The companion
> [Recovering from a failure](/en/disaster-recovery/) and
> [Rebuilding a server from backup](/en/self-restore/) pages map
> each incident to its recovery path.

## The principle: two independent paths, two independent backups

The software suite is designed so that the **public path** (Cloudflare
Tunnel -> the apps) and the **admin path** (Tailscale -> SSH) are
independent of each other. Breaking one does not break the other.
Similarly, the **server** and the **backup bucket** belong at different
companies, so a single provider outage cannot take both down. (That is
set up at install; the backup repo endpoint is shown in the
catena-admin Settings panel for anyone unsure it is in place.)
Prevention is mostly about **not collapsing those independences**.

## Checklist -- do these at hand-off, then once a year

### 1. Save the recovery keyset

The install surfaces a small set of credentials once (and they are
re-viewable any time from the catena-admin recovery-keyset panel).
Three of them make up the **recovery keyset** -- the only things needed
to rebuild a server from backup, and the only things that live
*outside* the encrypted backup:

- The **backup repository location** -- the address ("endpoint") of
  the backup storage plus the bucket name (where the backups live).
- The **storage keys** for that bucket -- one access key and one
  secret key, paired.
- The **backup encryption password** -- without it, every byte in
  the backup bucket is unreadable ciphertext.

Everything else -- every internal setting and every secret the
applications use -- is inside the encrypted backup and returns
automatically when the data is restored. There is nothing else to
keep and nothing to re-enter; the three items above are enough to
bring the whole server back.

One more item is worth keeping alongside the keyset, though it is
about *access* rather than *recovery*:

- A **copy of the SSH private key** used to sign in to the server --
  the fallback for direct access when we cannot be reached
  (see section 2).

Each item belongs in a password manager, labelled clearly ("server --
backup encryption", "server -- storage keys", "server -- backup
location", "server -- SSH private key"). **As separate entries** even
though it feels redundant -- losing any one of the keyset items costs
the recovery path. The encryption password unlocks the data, the
storage keys let the restore read the bucket, and the backup location
says where to look.

### 2. Keep the SSH private key off the laptop

A laptop dying without a backup SSH key means losing remote access
until provider rescue mode restores it. A few ways to avoid
that:

- Copy the private key to an encrypted USB stick kept in a safe or at
  a different address.
- Use a hardware token (YubiKey) -- the key material never leaves the
  device.
- Use a password manager that stores attachments (1Password, Bitwarden
  paid) and put the private key there.

One of the three, today.

### 3. Confirm the backup bucket is in a different city from the server

A datacentre fire (OVH Strasbourg 2021) can take out every machine in
one building at once. A server in Beauharnois wants its backup
bucket in Toronto, Montreal-West, Frankfurt, or any other location
that would survive the same local disaster.

The bucket's location is in catena-admin Settings -- the backup repo
endpoint and region are shown there ("eu-west-1" / "us-east-005" /
and so on).

### 4. Confirm the software suite has a weekly immutable-bucket snapshot

If a ransomware attack reaches the server, the attacker has access
to the same backup encryption password and storage keys each backup
uses. With those, they could in principle delete the
historical snapshots before encrypting the live disk -- turning a
recoverable incident into an unrecoverable one.

The defence: the software suite ships a **weekly mirror** that copies
the live (mutable) backup bucket to a SEPARATE bucket with
Object Lock / WORM enabled. The live bucket stays normal so each
backup's clean-up step works without interference; the
weekly mirror takes a snapshot of the live bucket at sync time and
stores it where it cannot be deleted or overwritten until the
retention window (typically 30 days) expires.

The result: even if the attacker successfully wipes everything
in the live bucket, last week's mirror is still in immutable
storage, recoverable to the last good week. Worst-case data-loss
window is one week, not "everything."

Two things to confirm directly:

1. The weekly immutable mirror is running -- catena-admin
   **Actions -> Check backup coverage** shows whether last week's copy
   completed.
2. The immutable bucket lives at a **different provider** from the
   live backup bucket. Both were set by the client, so this is a check
   against those records. If the live bucket's provider is the one
   compromised, putting the mirror at the same place defeats the point.

The mirror runs once a week, before any update window, on a
fixed schedule that does not depend on whether updates fire that
week. It is fail-soft: a misconfigured immutable bucket cannot block
the backups -- the backup run only touches the live bucket.

### 5. Optional -- add a client-owned second backup bucket

The immutable mirror in section 4 runs on a fixed schedule set at
install. A second backup line owned outright by the client --
separate billing, separate provider, credentials in client custody --
can be added on top of it.

This is overkill for most deployments (the managed immutable mirror
in section 4 already protects against ransomware and
account-takeover). Worth doing when:

- The encryption password and storage keys should sit entirely in
  client custody, on a backup line nobody else has ever touched.
- Compliance or contractual obligations require an explicitly
  client-owned off-site copy.
- Geographic redundancy beyond the mirror's provider is wanted
  (one bucket in Canada, one in the EU, one in the US, say).

**Pick a provider that supports Object Lock.** The provider must
support **S3 Object Lock + versioning**. Snapshots written to an
Object Lock bucket cannot be deleted or overwritten before the
retention window expires, even by someone with valid credentials --
the same line of defence the section 4 mirror relies on.

Decent options:

- **eazybackup** -- Canadian-owned, ca-central-1, Object Lock +
  versioning supported. Default recommendation when the primary
  bucket is also Canadian and jurisdictional separation matters.
- **AWS S3** -- Object Lock + versioning, most battle-tested, most
  expensive.
- **OVH Object Storage** -- flat pricing, EU-based; Object Lock
  availability needs checking in the target region.
- **Cloudflare R2** -- no egress fees, Object Lock + versioning,
  US-based.

Avoid putting both buckets at the same parent company.

**Create the bucket.** The provider's docs cover the steps. End
state:

- A bucket name (e.g. `acme-server-backup-2`).
- A region code (e.g. `ca-central-1`).
- An endpoint URL (e.g. `s3.ca-central-1.amazonaws.com`).
- An access key + secret scoped to write into the bucket.
- **Object Lock enabled at creation** in compliance or governance
  mode (compliance is stronger -- even the bucket owner cannot
  shorten retention).
- **Object versioning enabled** (Object Lock requires it).
- A default retention period matching the snapshot retention
  (typical: 30-90 days).

Most providers gate Object Lock behind a checkbox at creation time.
An unticked box means deleting the bucket and starting over --
Object Lock cannot be enabled retroactively at most providers.

The bucket belongs in a different city -- and ideally a different
country -- from the server and the primary backup bucket.

**Add the second bucket in catena-admin Settings** (backup vendor
credentials + repo), then confirm the next run writes to it with
**Actions -> Check backup coverage**.

**Save the credentials in a password manager**, alongside the
primary bucket entry, labelled clearly. The same backup encryption
password as the primary bucket is fine -- a single password
unlocking both is enough.

**Once a year**, confirm: the second bucket is still receiving
snapshots, the stored credentials match what is installed on the
server, and the provider has not changed Object Lock behaviour or
pricing in a way that matters.

Rebuilding from the secondary bucket is covered by
[Rebuilding a server from backup](/en/self-restore/) -- the same path,
using the secondary bucket's keyset.

### 6. Keep the recovery keyset current

Once a quarter, two minutes confirm the recovery keyset is
still complete and correct in the password manager:

- the backup repository location,
- the storage keys, and
- the backup encryption password.

If any of them was rotated (for example with catena-admin's
rotate-backup-password action), the saved copy gets updated the same
day. A keyset that is out of date is as good as lost the day it is
needed.

### 7. Confirm the recovery path once

At some quiet point in the first six months, make sure the recovery
path actually works end to end -- before it is ever needed, not during
an incident:

- Check that all three keyset items are saved in the password
  manager, each as its own entry, and that each one actually opens.
- For the strongest assurance, run a restore drill:
  `catena recover` onto a throwaway VPS, and confirm the data comes
  back. See [Rebuilding a server from backup](/en/self-restore/).
  Once a year, and a real recovery is muscle memory rather than a
  first attempt.

Anything missing or uncertain is worth sorting out now -- 15 minutes
of calm time.

## Recap -- what "done" looks like

When prevention is in place, all of these are true three months from
now:

- [ ] The backup encryption password is in a password manager,
      labelled clearly.
- [ ] The storage keys (access key + secret) are in the password
      manager, as a separate entry from the encryption password.
- [ ] The backup location (endpoint + bucket name) is in the password
      manager, with the keys.
- [ ] A copy of the SSH private key exists somewhere other than the
      current laptop.
- [ ] The city the backup bucket lives in is known (and it is not the
      same city as the server).
- [ ] The software suite has a weekly immutable-bucket mirror configured
      (separate provider from the live backup bucket, last weekly run
      completed) -- confirmed in catena-admin.
- [ ] A decision has been made about a second backup location -- and
      if the answer was yes, it has been added.
- [ ] The recovery keyset has been confirmed complete in the password
      manager (and, for the strongest assurance, a restore drill has
      been run).

Any "no" is this week's work. The
[Disaster recovery](/en/disaster-recovery/) page walks through what to
do once prevention has paid off.
