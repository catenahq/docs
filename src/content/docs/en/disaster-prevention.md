---
title: "Disaster prevention: what to set up so recovery is possible"
description: "This page is a checklist of things to do **before** anything goes"
---

This page is a checklist of things to do **before** anything goes
wrong, so that if something does, you're on the "annoying Tuesday"
side of the line instead of the "data loss" side. The companion page
is [Disaster recovery](/docs/en/disaster-recovery/), which covers what to do
once something has broken.

The two pages are written to be read in order -- prevention first, then
recovery so you know what the prevention is protecting you against.

> This page is written for non-technical readers -- owners, managers,
> office staff. No terminal commands required outside the optional
> "test it once" step. The companion
> [Disaster recovery](/docs/en/disaster-recovery/) and
> [Restore to a fresh VPS](/docs/en/self-restore/) pages assume more
> technical comfort and step into command-line territory.

## The principle: two independent paths, two independent backups

Your software suite is designed so that the **public path** (Cloudflare Tunnel
-> your apps) and the **ops path** (Tailscale -> SSH) are independent
of each other. Breaking one doesn't break the other. Similarly, your
**VPS** and your **backup bucket** should be at different companies,
so a single provider outage can't take both down. (Setting that up is
a one-time hand-off step -- confirm with your operator that it's in
place if you're not sure.) Prevention is mostly
about **not collapsing those independences**.

## Checklist -- do these at hand-off, then once a year

### 1. Save the recovery credentials your operator handed you

At hand-off your operator gave you a small kit of credentials. The
exact contents depend on whether your operator is also managing the
suite day-to-day, but every kit includes these four:

- The **restic repository encryption password** -- without it, every
  byte in your backup bucket is unreadable ciphertext.
- The **S3 access key + secret** that point at your backup bucket
  (one access key string + one secret-key string, paired).
- A **copy of the SSH private key** the operator uses to log into
  your VPS -- your fallback if the operator becomes unreachable.
- The **address of your backup bucket** (the URL or "endpoint" of
  the S3 service plus the bucket name).

Some kits also include a **vault password** (also called a "master
password" in older docs). That one only matters if your operator has
also given you the encrypted secret file itself -- most clients do
not have that file directly, because the recovery flow today uses
the [Export recovery secrets](/docs/en/disaster-recovery/) button instead,
which lets you re-export an encrypted bundle on demand and protect
it with a passphrase you choose at click time. If your kit does not
include a vault password, you do not need one -- the export-button
flow has you covered.

Put each credential in your password manager, labelled clearly
("VPS -- backup encryption", "VPS -- S3 access key", "VPS -- SSH
private key", "VPS -- bucket URL"). **Save them as separate entries**
even though it feels redundant -- losing any of them costs you a
recovery path. The restic password decrypts the data, the S3 keys
let you read the bucket, the SSH key lets you log into the server,
and the bucket URL tells you where to look.

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

### 3. Confirm your backup bucket is in a different city from your VPS

A datacenter fire (OVH Strasbourg 2021) can take out every machine in
one building at once. If your VPS lives in Beauharnois, your backup
bucket should be in Toronto, Montreal-West, Frankfurt, or any other
location that would survive the same local disaster.

If you're not sure where your backup bucket is, ask your operator.
This is a one-time question with a simple answer ("eu-west-1" /
"us-east-005" / etc.).

### 4. Confirm your software suite has a weekly immutable-bucket snapshot

If a ransomware attack reaches your VPS, the attacker has access
to the same restic password and S3 keys the nightly backup uses.
With those, they could in principle issue a `forget --prune` and
delete your historical snapshots before encrypting the live disk
-- turning a recoverable incident into an unrecoverable one.

The defence: your software suite ships a **weekly mirror** that copies
your live (mutable) backup bucket to a SEPARATE bucket with
Object Lock / WORM enabled. The live bucket stays normal so the
nightly backup's prune step works without interference; the
weekly mirror takes a snapshot of the bucket at sync time and
stores it where it cannot be deleted or overwritten until the
retention window (typically 30 days) expires.

The result: even if the attacker successfully wipes everything
in the live bucket, last week's mirror is still in WORM storage,
recoverable to your last good week. Worst case data-loss window
is one week, not "everything."

Ask your operator to confirm two things:

1. The weekly WORM mirror is configured (the systemd timer
   `catena-restic-mirror.timer` is enabled, the WORM bucket has
   credentials in vault, and last week's healthcheck pinged
   green).
2. The WORM bucket lives at a **different provider** from the
   live backup bucket. If the live bucket's provider is the one
   compromised, putting the WORM at the same place defeats the
   point.

The mirror runs once a week, before any update window, on a
fixed schedule that does not depend on whether updates fire that
week. It is fail-soft: a misconfigured WORM bucket cannot block
the daily backup -- the daily run only touches the live bucket.

### 5. Optional -- add a client-owned second backup bucket

The WORM mirror in section 4 is configured and run by your operator
on a fixed schedule. If you want a second backup line that **you**
own outright -- separate billing, separate provider, credentials in
your own custody -- you can add a second backup bucket yourself.

This is overkill for most deployments (the operator-managed WORM
mirror in section 4 already protects against ransomware and
account-takeover). Worth doing when:

- You want the encryption password and S3 credentials entirely in
  your custody, with no operator involvement in the recovery path.
- Compliance or contractual obligations require an explicitly
  client-owned off-site copy.
- You want geographic redundancy beyond the WORM mirror's provider
  (e.g. one bucket in Canada, one in the EU, one in the US).

**Pick a provider that supports Object Lock.** The provider must
support **S3 Object Lock + versioning**. Snapshots written to an
Object Lock bucket cannot be deleted or overwritten before the
retention window expires, even by someone with valid credentials --
the same line of defense the section 4 WORM mirror relies on.

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

- A bucket name (e.g. `acme-vps-backup-2`).
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
different country -- from your VPS and your primary backup bucket.

**Hand the credentials to your operator** through whatever
encrypted channel you've used before (do not paste them in plain
email or Slack). Your operator wires the second bucket into the
backup schedule and confirms the next run is writing to it.

**Save the credentials in your password manager**, alongside the
primary bucket entry, labelled clearly. Use the same restic
encryption password as the primary bucket -- a single password
unlocking both is enough.

**Once a year**, confirm: the second bucket is still receiving
snapshots, your stored credentials match what's installed on the
VPS, and the provider has not changed Object Lock behaviour or
pricing in a way that matters.

If you ever need to restore from the secondary bucket, the
[Restore to a fresh VPS](/docs/en/self-restore/) page covers it -- same
procedure, just with the secondary's credentials in the environment
variables.

### 6. Run the "Export recovery secrets" button proactively

On [actions.yourdomain.com](https://actions.yourdomain.com/),
in the **Ops** section, there's a button called **"Export recovery
secrets (encrypted)"** (🔐). Most of the time it's used when something
has already gone wrong -- but it also works as prevention.

Every quarter:

1. Click the button, type a strong passphrase (your password manager
   can generate one).
2. Open [recovery.yourdomain.com](https://recovery.yourdomain.com/)
   in your browser, sign in as an administrator, and download the
   newest `secrets-*.yml.gpg` file to your laptop.
3. Store the `.gpg` file + the passphrase used to encrypt it in your
   password manager (attach the file; save the passphrase as a
   separate entry).

That gives you a **pre-made recovery bundle** ready to use if you
ever lose your master password file. You still need the passphrase to
decrypt it, but you chose the passphrase yourself and you saved it in
a place you control.

### 7. Test your recovery path once

At some quiet point in the first six months, do a "does this
work end-to-end" dry run:

- Pick a throwaway directory on your laptop.
- Decrypt one of the proactive exports from step 5 -- pick the command
  that matches your OS:

    - **Linux** (Ubuntu / Debian / Fedora -- `gpg` is preinstalled, or
      `sudo apt install gnupg`):

        ```
        gpg --pinentry-mode loopback -o vault-test.yml -d secrets-*.yml.gpg
        ```

    - **macOS** (Homebrew: `brew install gnupg`, then):

        ```
        gpg --pinentry-mode loopback -o vault-test.yml -d secrets-*.yml.gpg
        ```

    - **Windows** -- install [Gpg4win](https://www.gpg4win.org/) (the
      Kleopatra GUI is the easiest path). Open Kleopatra, drag the
      `.gpg` file onto its window, type the passphrase you chose,
      Kleopatra writes the decrypted `vault-test.yml` next to it.
      Power users can also run `gpg.exe` from PowerShell using the
      same command line as macOS / Linux above.

- Verify that the file contents look like a real secret file (you'll
  see entries like `vault_dokploy_postgres_password: "..."`).
- Delete `vault-test.yml` when you're done.

If anything about this doesn't work -- wrong passphrase, corrupted
file, etc. -- you want to find out now, not during an incident. It's
worth 15 minutes of calm time.

## Recap -- what "done" looks like

When prevention is in place, a three-month-from-now you can answer
"yes" to all of these:

- [ ] My restic repository password is in my password manager,
      labelled clearly.
- [ ] My S3 access key + secret are in my password manager, as a
      separate entry from the restic password.
- [ ] My backup bucket's URL/endpoint and bucket name are in my
      password manager, with the credentials.
- [ ] I have a copy of my SSH private key somewhere other than my
      current laptop.
- [ ] (If my operator handed me a vault password, it is in my
      password manager -- separate entry. If not, I'm relying on
      the **Export recovery secrets** button instead, which is
      fine.)
- [ ] I know which city my backup bucket lives in (and it's not the
      same city as my VPS).
- [ ] My software suite has a weekly WORM-bucket mirror configured (separate
      provider from the live backup bucket, last weekly run pinged
      green) -- confirmed with my operator.
- [ ] I have decided whether I need a second backup location -- if yes,
      my operator has set it up.
- [ ] I've run the "Export recovery secrets" button at least once
      and the decrypted output looks sensible.

If any of those are "no," work on them this week. The
[Disaster recovery](/docs/en/disaster-recovery/) page walks through what to
do once prevention paid off.
