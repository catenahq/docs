---
title: "Recurring tasks"
description: "The short checklist of what to do at onboarding, once a month, and once a year so recovery is always possible."
---

These are the tasks that keep your setup recoverable. Do them
**before** anything goes wrong, so that if something does, you're on
the "annoying Tuesday" side of the line instead of the "data loss"
side. The companion page, [Recovering from a failure](/en/disaster-recovery/),
covers what to do once something has broken.

**When to do each:**

- **At onboarding (once):** save your recovery keyset (1), get your SSH
  key off your laptop (2), confirm bucket location (3) and the
  immutable mirror (4), decide on a second backup bucket (5), and
  confirm the recovery path end to end (7).
- **Once a month:** a quick glance that backups are still landing and
  nothing in your keyset has drifted.
- **Once a year:** re-confirm the immutable mirror, the second bucket
  (if you have one), and that your saved keyset still matches what is
  installed (6).

> This page is written for non-technical readers -- owners, managers,
> office staff. No terminal commands required. The companion
> [Recovering from a failure](/en/disaster-recovery/) and
> [Rebuilding your server from backup](/en/self-restore/) pages map
> each incident to its recovery path.

## The principle: two independent paths, two independent backups

Your software suite is designed so that the **public path** (Cloudflare Tunnel
-> your apps) and the **admin path** (Tailscale -> SSH) are independent
of each other. Breaking one doesn't break the other. Similarly, your
**server** and your **backup bucket** should be at different companies,
so a single provider outage can't take both down. (You set that up at
install; if you're not sure it's in place, the backup repo endpoint is
shown in the catena-admin Settings panel.) Prevention is mostly
about **not collapsing those independences**.

## Checklist -- do these at hand-off, then once a year

### 1. Save your recovery keyset

The install surfaces a small set of credentials once (and they are
re-viewable any time from the catena-admin recovery-keyset panel).
Three of them make up your **recovery keyset** -- the only things needed to rebuild
your server from backup, and the only things that live *outside* the
encrypted backup:

- The **backup repository location** -- the address ("endpoint") of
  your backup storage plus the bucket name (where your backups live).
- The **storage keys** for that bucket -- one access key and one
  secret key, paired.
- The **backup encryption password** -- without it, every byte in
  your backup bucket is unreadable ciphertext.

Everything else -- every internal setting and every secret your
applications use -- is inside the encrypted backup and returns
automatically when your data is restored. There is nothing else to
keep and nothing to re-enter; the three items above are enough to
bring the whole server back.

One more item is worth keeping alongside the keyset, though it is
about *access* rather than *recovery*:

- A **copy of the SSH private key** used to sign in to your server --
  your fallback if you ever need direct access and can't reach us
  (see section 2).

Put each item in your password manager, labelled clearly ("server --
backup encryption", "server -- storage keys", "server -- backup
location", "server -- SSH private key"). **Save them as separate
entries** even though it feels redundant -- losing any one of the
keyset items costs you the recovery path. The encryption password
unlocks the data, the storage keys let the restore read the bucket,
and the backup location says where to look.

### 2. Keep your SSH private key off your laptop

Your laptop dying without a backup SSH key means losing remote access
until provider rescue mode gets you back in. A few ways to avoid
that:

- Copy the private key to an encrypted USB stick kept in a safe or at
  a different address.
- Use a hardware token (YubiKey) -- the key material never leaves the
  device.
- Use a password manager that stores attachments (1Password, Bitwarden
  paid) and put the private key there.

Pick one. Do it today.

### 3. Confirm your backup bucket is in a different city from your server

A datacentre fire (OVH Strasbourg 2021) can take out every machine in
one building at once. If your server lives in Beauharnois, your backup
bucket should be in Toronto, Montreal-West, Frankfurt, or any other
location that would survive the same local disaster.

If you're not sure where your backup bucket is, check catena-admin
Settings -- the backup repo endpoint and region are shown there
("eu-west-1" / "us-east-005" / etc.).

### 4. Confirm your software suite has a weekly immutable-bucket snapshot

If a ransomware attack reaches your server, the attacker has access
to the same backup encryption password and storage keys each backup
uses. With those, they could in principle delete your
historical snapshots before encrypting the live disk -- turning a
recoverable incident into an unrecoverable one.

The defence: your software suite ships a **weekly mirror** that copies
your live (mutable) backup bucket to a SEPARATE bucket with
Object Lock / WORM enabled. The live bucket stays normal so each
backup's clean-up step works without interference; the
weekly mirror takes a snapshot of the live bucket at sync time and
stores it where it cannot be deleted or overwritten until the
retention window (typically 30 days) expires.

The result: even if the attacker successfully wipes everything
in the live bucket, last week's mirror is still in immutable
storage, recoverable to your last good week. Worst-case data-loss
window is one week, not "everything."

Confirm two things yourself:

1. The weekly immutable mirror is running -- catena-admin
   **Actions -> Check backup coverage** shows whether last week's copy
   completed.
2. The immutable bucket lives at a **different provider** from the
   live backup bucket. You set both, so this is a check against your
   own records. If the live bucket's provider is the one compromised,
   putting the mirror at the same place defeats the point.

The mirror runs once a week, before any update window, on a
fixed schedule that does not depend on whether updates fire that
week. It is fail-soft: a misconfigured immutable bucket cannot block
your backups -- the backup run only touches the live bucket.

### 5. Optional -- add a client-owned second backup bucket

The immutable mirror in section 4 runs on a fixed schedule set at
install. If you want a second backup line that **you** own
outright -- separate billing, separate provider, credentials in your
own custody -- you can add a second backup bucket yourself.

This is overkill for most deployments (the managed immutable mirror
in section 4 already protects against ransomware and
account-takeover). Worth doing when:

- You want the encryption password and storage keys entirely in
  your custody, on a backup line nobody else has ever touched.
- Compliance or contractual obligations require an explicitly
  client-owned off-site copy.
- You want geographic redundancy beyond the mirror's provider
  (e.g. one bucket in Canada, one in the EU, one in the US).

**Pick a provider that supports Object Lock.** The provider must
support **S3 Object Lock + versioning**. Snapshots written to an
Object Lock bucket cannot be deleted or overwritten before the
retention window expires, even by someone with valid credentials --
the same line of defence the section 4 mirror relies on.

Decent options:

- **eazybackup** -- Canadian-owned, ca-central-1, Object Lock +
  versioning supported. Default recommendation when the primary
  bucket is also Canadian and you want jurisdictional separation.
- **AWS S3** -- Object Lock + versioning, most battle-tested, most
  expensive.
- **OVH Object Storage** -- flat pricing, EU-based; verify Object
  Lock availability in your target region.
- **Cloudflare R2** -- no egress fees, Object Lock + versioning,
  US-based.

Avoid putting both buckets at the same parent company.

**Create the bucket.** The provider's docs walk you through it. End
state:

- A bucket name (e.g. `acme-server-backup-2`).
- A region code (e.g. `ca-central-1`).
- An endpoint URL (e.g. `s3.ca-central-1.amazonaws.com`).
- An access key + secret scoped to write into the bucket.
- **Object Lock enabled at creation** in compliance or governance
  mode (compliance is stronger -- even the bucket owner cannot
  shorten retention).
- **Object versioning enabled** (Object Lock requires it).
- A default retention period matching your snapshot retention
  (typical: 30-90 days).

Most providers gate Object Lock behind a checkbox at creation time.
If you forget to tick it, you have to delete the bucket and start
over -- Object Lock cannot be enabled retroactively at most
providers.

Make sure the bucket lives in a different city -- and ideally a
different country -- from your server and your primary backup bucket.

**Add the second bucket in catena-admin Settings** (backup vendor
credentials + repo), then confirm the next run writes to it with
**Actions -> Check backup coverage**.

**Save the credentials in your password manager**, alongside the
primary bucket entry, labelled clearly. Use the same backup
encryption password as the primary bucket -- a single password
unlocking both is enough.

**Once a year**, confirm: the second bucket is still receiving
snapshots, your stored credentials match what's installed on the
server, and the provider has not changed Object Lock behaviour or
pricing in a way that matters.

If you ever need to rebuild from the secondary bucket,
[Rebuilding your server from backup](/en/self-restore/) covers it --
the same path, using the secondary bucket's keyset.

### 6. Keep your recovery keyset current

Once a quarter, take two minutes to confirm your recovery keyset is
still complete and correct in your password manager:

- the backup repository location,
- the storage keys, and
- the backup encryption password.

If any of them was rotated (for example with catena-admin's
rotate-backup-password action), update the saved copy the same day. A
keyset that is out of date is as good as lost the day you need it.

### 7. Confirm your recovery path once

At some quiet point in the first six months, make sure the recovery
path actually works end to end -- before you ever need it, not during
an incident:

- Check that all three keyset items are saved in your password
  manager, each as its own entry, and that you can actually open
  them.
- For the strongest assurance, run a restore drill yourself:
  `catena recover` onto a throwaway VPS and confirm your data comes
  back. See [Rebuilding your server from backup](/en/self-restore/).
  Do this once a year and a real recovery is muscle memory, not a
  first attempt.

If anything is missing or you're unsure, sort it out now -- it's
worth 15 minutes of calm time.

## Recap -- what "done" looks like

When prevention is in place, a three-month-from-now you can answer
"yes" to all of these:

- [ ] My backup encryption password is in my password manager,
      labelled clearly.
- [ ] My storage keys (access key + secret) are in my password
      manager, as a separate entry from the encryption password.
- [ ] My backup location (endpoint + bucket name) is in my password
      manager, with the keys.
- [ ] I have a copy of my SSH private key somewhere other than my
      current laptop.
- [ ] I know which city my backup bucket lives in (and it's not the
      same city as my server).
- [ ] My software suite has a weekly immutable-bucket mirror configured
      (separate provider from the live backup bucket, last weekly run
      completed) -- confirmed in catena-admin.
- [ ] I have decided whether I need a second backup location -- if yes,
      I've added it.
- [ ] I've confirmed my recovery keyset is complete in my password
      manager (and, if I wanted the strongest assurance, ran a
      restore drill).

If any of those are "no," work on them this week. The
[Disaster recovery](/en/disaster-recovery/) page walks through what to
do once prevention paid off.
