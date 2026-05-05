---
title: "Add a second backup bucket"
description: "A second backup bucket is the difference between \"bad day\" and \"very"
---

A second backup bucket is the difference between "bad day" and "very
bad weekend" if your primary backup provider has a multi-day outage,
terminates your account, or is simply unreachable when you need
your data. The point is **two providers, two physical locations**:
if either one disappears, the other still has your data.

This is opt-in. Most clients do fine with a single bucket — but for
deployments where losing a week of data would be genuinely painful
(client billing data, signed contracts, irreplaceable creative
work), the cost of a second bucket (~$5-15/month) is small relative
to the value protected.

## What you do, what your operator does

| Step | Who |
|---|---|
| Decide whether you need this | You |
| Pick the second provider (different company from your primary) | You |
| Create an account + bucket at the second provider | You |
| Mint S3 access credentials scoped to the new bucket | You |
| Hand the credentials to your operator | You |
| Configure the stack to back up to both | Your operator |
| Verify both buckets are receiving snapshots | Your operator |
| Save the new credentials in your password manager | You (afterwards) |

You own the second bucket the same way you own the first — different
provider, your billing, your account, your credentials. Your operator
just configures the stack to write to both.

## Step 1 — Pick a second provider

Pick a provider that is **not the same company** as your primary
bucket. If your primary is Backblaze B2, a good second is OVH Object
Storage, AWS S3, or Cloudflare R2. The point is to survive any
single provider's bad day.

A few decent options, in no particular order:

- **OVH Object Storage** — French/EU-based, S3-compatible,
  flat pricing. Good if your primary is at a US-based provider.
- **Backblaze B2** — US-based, S3-compatible, very cheap storage,
  has a free tier (10 GB). Good if your primary is in Europe.
- **AWS S3** — US-based, S3-compatible, the most expensive of the
  bunch but the most battle-tested.
- **Cloudflare R2** — US-based, S3-compatible, no egress fees. Good
  for one-off restores where you'd be downloading a lot at once.

What to avoid: putting both buckets at the same parent company
(e.g. AWS S3 + AWS Glacier — same outage, same account-suspension
risk).

## Step 2 — Create a bucket at the second provider

The provider's documentation walks you through this; the exact
clicks vary. What you need to end up with:

- One **bucket name** (a string, often something like
  `acme-vps-backup-2`).
- One **region** (the provider's location code, e.g. `us-east-005`,
  `eu-west-1`, `gra`).
- One **endpoint URL** (the address where the S3 API lives for your
  region — the provider's docs will list it; e.g.
  `s3.us-east-005.backblazeb2.com`).
- One **access key + secret** scoped to write into this bucket
  (the provider's docs will call this an "Application Key,"
  "IAM User," or similar).

**Make sure the bucket is in a different city** (and ideally a
different country) from both your VPS and your primary backup
bucket. The whole point of a second bucket is geographic
independence.

## Step 3 — Hand the credentials to your operator

Send your operator a secure message containing:

- Provider name (Backblaze B2, OVH, etc.)
- Bucket name
- Region
- Endpoint URL
- Access key
- Secret key

Use whatever channel you've used for credentials before — operator
should have given you a way to send secrets safely (encrypted email,
1Password sharing link, signed message, etc.). **Do not paste these
in plain email or Slack.**

Your operator wires the second bucket into the stack's backup
schedule. The next nightly backup writes to both buckets; the
operator confirms the second bucket is receiving data and reports
back.

## Step 4 — Save the new credentials in your password manager

Add a new entry alongside your primary bucket credentials, labelled
clearly ("VPS — secondary backup encryption", "VPS — secondary S3
access key", "VPS — secondary bucket URL"). Use the same restic
encryption password as the primary bucket — a single password that
unlocks either bucket is enough; using different passwords for each
bucket adds cost without adding security.

If you ever need to restore from the secondary bucket (your primary
is unreachable), the [Restore to a fresh VPS](/self-restore/) page
covers it — same procedure as the primary, just with the
secondary's credentials in the environment variables.

## What this protects you against, and what it doesn't

**Protects against:**

- Primary backup provider's multi-day outage.
- Primary backup provider terminating your account.
- Primary backup provider going out of business.
- Accidental deletion of the primary bucket.
- Datacenter fire affecting the primary bucket's region.

**Does NOT protect against:**

- A laptop with both sets of credentials being stolen — both bucket
  passwords are now compromised. Mitigation: store them in a
  password manager, use the manager's 2FA.
- Someone with operator access deleting both buckets at once.
  Mitigation: this is what bucket versioning + delete protection at
  each provider is for; ask your operator to enable both.
- A bug in restic that corrupts a snapshot — the corruption gets
  written to both buckets. Mitigation: the daily verify-backup task
  checks restic snapshots for integrity; failures show up on
  [`monitor.yourdomain.com`](https://monitor.yourdomain.com).

## When to revisit

Once a year (same cadence as the rest of [Disaster prevention](/disaster-prevention/)).
Confirm:

- The second bucket is still receiving snapshots (ask your operator
  for a one-line "yes, last snapshot was 24h ago").
- The credentials in your password manager still match what's
  installed on the VPS — your operator's quarterly migration drill
  catches drift, but a manual check is cheap.
- The provider hasn't changed pricing in a way that matters to you.
