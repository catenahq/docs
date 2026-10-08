---
title: "Backups and S3 storage"
description: "Where backups are written, how they are encrypted, what they contain, and how the recovery keyset and offsite copies protect them."
---

Backups are encrypted on the server before they leave it and are written to an S3-compatible bucket owned by the server's admin. Catena holds no copy of the data. This page covers the storage settings, the backup password, the recovery keyset, offsite copies, and running a backup by hand. When backups run on their own, and how many are kept, is set on the [Schedules](/en/configuration/schedules/) page.

## Prerequisites

- A bucket at an S3-compatible storage provider, and an access key and secret key pair that can read, write and delete objects in that bucket.
- A provider, or at least a region, other than the one hosting the server. A single outage or incident then cannot take out both the server and its backups.
- Access to the panel as an administrator (see [Admin access and tailnet](/en/configuration/admin-access/)).

The bucket is an ordinary bucket: old backups are pruned according to the retention numbers on the Schedules page. Object Lock and versioning belong on the destination of an [offsite copy](#offsite-copies), not on this bucket.

## Backup repository

Open **Settings** > **Backup repository**. The repository is one address that already contains the endpoint and the bucket:

```text
s3:https://<endpoint>/<bucket>
```

For example, `s3:https://s3.bhs.io.cloud.ovh.net/acme-restic`. There is no separate bucket, endpoint or region field: the region is part of the endpoint name, and both are inside the one address.

| Field | Content |
|---|---|
| **Backup S3 access key** | The access key of the key pair. Stored, never shown back. |
| **Backup S3 secret key** | The secret key of the key pair. Stored, never shown back. |
| **Backup repository URL** | The address above. |
| **Other folders to back up (separated by commas)** | Optional. Extra locations on the server to include (see [What a backup contains](#what-a-backup-contains)). |

A blank key field keeps the current value; typing a value replaces it. **Save** stores the values on the server. No restart or reconfiguration follows: the next backup reads them.

### Endpoint check

After the values are stored, the panel checks the endpoint and shows one of these messages:

| Message | Meaning |
|---|---|
| Endpoint reachable; bucket contents readable. | The address parses, the endpoint answers and the bucket can be listed. |
| Endpoint valid, but its contents could not be read. | The endpoint answers but the bucket content could not be read. A fresh, empty bucket is not an error. |
| Backup endpoint rejected: `<reason>` | The address is malformed or the endpoint refused the connection. The values stay stored; correct them and save again. |

## Backup password

Backups are encrypted with a password that the server generates. It is shown once.

1. Store the repository address and both keys, as above. Until then the section reads "Enter the backup repository and both of its keys above first: the password is checked against the repository before it is kept."
2. Under **Backup password**, press **Generate backup encryption password**.
3. Copy the password into a password manager at once. The page confirms with "Backup encryption password generated and stored on this server." and "Save it in a password manager now. It is not shown again, and reloading this page hides it."

The server keeps the password to run backups, and Catena keeps no other copy. Without it, every byte in the bucket is unreadable. The password is also required to read these backups from another server (see [Restore and migrate](/en/configuration/restore-and-migrate/)).

Generation is refused when a password already exists, or when the repository already holds backups under another password. The reason appears in the same section. A repository that holds another server's backups is not reused for a new server: a new, empty bucket is used instead.

Once a password exists, the section offers two tools:

- **Check a password** > **Check**: tests a typed password against the repository. The replies are "That password opens the backup repository.", "That password does NOT open the backup repository." and "Could not reach the backup repository to check the password."
- **New backup password** > **Change password**: re-keys the repository under a new password. The box "I understand this re-keys the repository: every backup becomes unreadable without the new password." must be ticked. Success reads "Backup password changed. The new password belongs in a password manager now."; a failure reads "Could not change the backup password. The repository was not re-keyed." The saved copy in the password manager is replaced the same day.

## Disaster-recovery keyset

The **Disaster-recovery keyset** section lists the four values that alone rebuild the server on a fresh machine:

- the backup repository address,
- the S3 access key,
- the S3 secret key,
- the backup encryption password.

Everything else, including every internal setting and secret the applications use, is inside the encrypted backup. The values stay hidden on the page because it is reachable from anywhere, and displaying them would put them in browser history and screenshots.

**Show the values** displays them once. The viewing is recorded in the server's administrative log with the account and the time: "Shown once, and recorded: this viewing is now a row in this server's administrative log, with the account and the time. Reloading the page hides them again." Until the backup credentials are set, the section reads "The recovery keyset appears once the backup credentials above are set."

The four values belong in a password manager as separate entries, kept outside the server and outside the bucket. A server rebuilt from them is described on the [Restore and migrate](/en/configuration/restore-and-migrate/) page.

## Offsite copies

An offsite copy duplicates a bucket into a locked bucket at a different provider. It protects against a compromised server or account: the destination cannot be altered or deleted by anyone holding valid keys, until the lock expires. Offsite copies need Catena Business; the [edition comparison](https://catena.run/en/#pricing) has the details.

### Prerequisites

- A destination bucket at a provider other than the one holding the source, created with **Object Lock** and **versioning** enabled. Most providers allow Object Lock only at bucket creation.
- An access key pair for the destination and, if the source is not the main backup bucket, for the source.

### Steps

1. Open **Settings** > **Offsite copies**.
2. Under **Add a copy**, fill in one row:

| Field | Content |
|---|---|
| **Name** | Lowercase letters, digits and hyphens; 40 characters at most; unique. |
| **Source repository URL** | The bucket to copy, as `s3:https://<endpoint>/<bucket>`. |
| **Source S3 access key**, **Source S3 secret key** | Keys for the source. |
| **Destination repository URL** | The locked bucket, in the same address format. |
| **Destination S3 access key**, **Destination S3 secret key** | Keys for the destination. |

3. Press **Save offsite copies**. The page replies "Offsite copies saved." A row can be removed with **Remove this copy on save (the copies already made are kept)**.

Both sets of keys are entered here even when a bucket is configured elsewhere as well: an application owns where it stores its files, and this list owns what gets copied where. Source and destination must be different buckets, and at most 32 rows are accepted. A blank secret on an existing row keeps the stored one. Until a row exists the section reads "No offsite copies are declared, so nothing is copied offsite."

The copies run on the **Offsite copy** lane of the Schedules page (and as a step of the nightly maintenance). An unreachable or unconfigured destination is recorded as skipped and does not stop backups.

### How the copy behaves

- A copy only ever adds. Nothing it has written is changed or deleted afterwards. A bucket removed from the list keeps every copy already made, and the storage cost grows with churn.
- A locked bucket cannot be restored into directly. Recovering means copying it out to a fresh, unlocked bucket first and reading from that.
- A copy of an application's own file bucket is only restorable together with a same-moment copy of the database that indexes those files. That database is inside the backup snapshots, so a file bucket copied on its own is not a backup by itself.

## What a backup contains

Included:

- the data of every application, including its Docker volumes and the folders kept under the server's application storage;
- a dump of each database taken just before the snapshot (below);
- the server's own configuration: system files, SSH and firewall settings, the settings and secrets stored by Catena, and the administrative log;
- every folder listed under **Other folders to back up**.

Excluded: container image layers (they are pulled again), the history kept by the status page, the heartbeat monitor and the resource monitor, antivirus signature databases, logs and temporary folders.

Database dumps are automatic for every running container whose image name contains `postgres`, `mariadb` or `mysql`. PostgreSQL is dumped with `pg_dumpall`. MariaDB and MySQL need `MARIADB_ROOT_PASSWORD` or `MYSQL_ROOT_PASSWORD` in the container's environment. A failed dump fails the whole backup. Other engines, such as MongoDB or SQLite, get no automatic dump. Backups do not pause applications. In the nightly maintenance, a catalog application whose entry asks for it, such as Nextcloud, is put in maintenance mode while the backup runs and taken out of it afterwards, even when the backup fails; a backup started any other way leaves every application as it is. A restore takes the applications it puts back out of maintenance mode.

After each snapshot the server checks every running container for folders mounted from outside the backup set. A backup fails when it finds one that is not listed under **Other folders to back up**; the **Check backup coverage** action runs the same check on demand.

## Run a backup by hand

Manual backups are available in every edition. Open **Actions**; the **Backups** category appears once the repository address and both keys are stored (until then the page reads "Set up the backup repository" with a link to the settings). Press **Run** on:

| Action | Effect |
|---|---|
| **Trigger backup now** | Starts a backup in the background. |
| **Tail last backup log** | Shows the last lines of the backup log. |
| **List restic snapshots** | Lists the latest snapshots. |
| **Check backup coverage** | Warns about folders outside the backup set. |
| **Browse past snapshots (read-only)** | Mounts the snapshots read-only on the server, for copying single files out. The mount is released after one hour. |
| **Snapshot browser -- status** | Shows where the browser is mounted and what it holds. |
| **Unmount snapshot browser** | Releases the mount. |
| **Export latest snapshot (tar.gz)** | In the **Recovery** category: writes the latest snapshot to a downloadable archive without a restore. |

The exported archive is listed under **Available downloads** on the **Restore** page. Backup size and snapshot count show on the **System** page once a backup has run.

## When no backup is configured

Every admin page shows the banner "No backup is configured: updates run with nothing to return to. Configure one in Settings." The nightly maintenance still applies updates in that state, and records a Log event saying so. The banner stays until a repository is configured.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Backup actions are missing from **Actions** | The repository address or a key is not stored yet. |
| "Endpoint valid, but its contents could not be read." | Wrong key pair, no list right on the bucket, or a wrong bucket name in the address. Correct it and save again. |
| **Generate backup encryption password** is refused | A password already exists, or the bucket holds backups under another password. Use an empty bucket. |
| A backup fails on coverage | A container mounts a folder outside the backup set. List it under **Other folders to back up**. |
| A backup fails on a database dump | A MariaDB or MySQL container without `MARIADB_ROOT_PASSWORD` or `MYSQL_ROOT_PASSWORD`, or a database that could not be dumped. The backup log gives the reason. |
| The saved password is lost | While the server runs, **Show the values** in **Disaster-recovery keyset** displays it again. With the server gone too, the backups cannot be read by any means. |

The **Log** page records each completed backup with its size; the [Updates](/en/configuration/updates/) page describes the other events recorded there.
