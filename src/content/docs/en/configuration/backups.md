---
title: "Backups and S3 storage"
description: "Where backups are written, how they are encrypted, what they contain, and how the recovery keyset and offsite copies protect them."
---

Backups are encrypted on the server before they leave it and are written to an S3-compatible bucket that you own. Catena holds no copy of the data. This page covers the storage settings, the backup password, the recovery keyset, offsite copies, and running a backup by hand. When backups run on their own, and how many are kept, is set on the [Schedules](/en/configuration/schedules/) page.

## Prerequisites

- A bucket at an S3-compatible storage provider, and an access key and secret key pair that can read, write and delete objects in that bucket.
- A provider, or at least a region, other than the one hosting the server. A single outage or incident then cannot take out both the server and its backups.
- Access to the panel as an administrator (see [Admin access and tailnet](/en/configuration/admin-access/)).

The bucket is an ordinary bucket: backups past the retention numbers on the Schedules page are removed once a day, and before each offsite copy. Object Lock and versioning belong on the destination of an [offsite copy](#offsite-copies), not on this bucket.

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
| **Other folders to back up (separated by commas)** | Optional. Extra locations on the server to include (see [What a backup contains](#what-a-backup-contains) and [Keep an application's files on a disk you attach](#keep-an-applications-files-on-a-disk-you-attach)). |

Leave a key field blank to keep the current value; type a value to replace it. **Save** stores the values on the server. No restart or reconfiguration follows: the next backup reads them.

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

Generation is refused when a password already exists, or when the repository already holds backups under another password. The reason appears in the same section. Do not reuse a repository that holds another server's backups for a new server: use a new, empty bucket instead.

Once a password exists, the section offers two tools:

- **Check a password** > **Check**: tests a password you type against the repository. The replies are "That password opens the backup repository.", "That password does NOT open the backup repository." and "Could not reach the backup repository to check the password."
- **New backup password** > **Change password**: re-keys the repository under a new password. Tick the box "I understand this re-keys the repository: every backup becomes unreadable without the new password." Success reads "Backup password changed. The new password belongs in a password manager now."; a failure reads "Could not change the backup password. The repository was not re-keyed." Replace the saved copy in your password manager the same day.

## Disaster-recovery keyset

The **Disaster-recovery keyset** section lists the four values that alone rebuild the server on a fresh machine:

- the backup repository address,
- the S3 access key,
- the S3 secret key,
- the backup encryption password.

Everything else, including every internal setting and secret the applications use, is inside the encrypted backup. The values stay hidden on the page because it is reachable from anywhere, and displaying them would put them in browser history and screenshots.

**Show the values** displays them once. The viewing is recorded in the server's administrative log with the account and the time: "Shown once, and recorded: this viewing is now a row in this server's administrative log, with the account and the time. Reloading the page hides them again." Until the backup credentials are set, the section reads "The recovery keyset appears once the backup credentials above are set."

Keep the four values in a password manager as separate entries, outside the server and outside the bucket. Rebuilding a server from them is described on the [Restore and migrate](/en/configuration/restore-and-migrate/) page.

## Offsite copies

An offsite copy keeps a write-once copy of your backup repository in a locked bucket at a different provider. It protects against a compromised server or account: the destination cannot be altered or deleted by anyone holding valid keys, until the lock expires. A row can name any other bucket: that is a plain scheduled copy of the bucket, and no restore matches it to an application. Offsite copies need Catena Business; the [edition comparison](https://catena.run/en/#pricing) has the details.

### Prerequisites

- A destination bucket at a provider other than the one holding the source, created with **Object Lock** and **versioning** enabled (see [Create the destination bucket](#create-the-destination-bucket)).
- An access key pair for the destination (see [Keys for the destination](#keys-for-the-destination)) and, for the source, the keys of the bucket being copied.

### Create the destination bucket

A copy cannot go into the backup bucket itself, because backups are pruned there and a lock would block the pruning. Each source bucket gets its own destination bucket.

1. Choose a provider that supports Object Lock and is not the one holding the source:

   | Provider | Notes |
   |---|---|
   | eazybackup (Canada) | Canadian-owned, S3-compatible with Object Lock and versioning, no egress fees. |
   | Backblaze B2 | Object Lock supported; US-owned; egress fees above a monthly allowance. |
   | AWS S3 | Compliance mode is enforced strictly; US-owned. |
   | OVHcloud Object Storage | Object Lock is turned on when the bucket is created, which also turns on versioning. Not available on the Cold Archive storage class. |

   Cloudflare R2 cannot hold a destination: it offers neither Object Lock nor versioning. Its bucket locks stop objects from being deleted or overwritten, but keep no earlier version to put back.
2. Create a new bucket, one per source bucket. Do not share a destination bucket between copies.
3. Enable **versioning**. It keeps the earlier version of an object that is overwritten or deleted.
4. Enable **Object Lock** at creation, with a default retention of at least 30 days (90 days recommended). Choose **Compliance** mode when the provider offers it: nobody, not even the bucket owner, can shorten it. **Governance** mode is the fallback when Compliance is not available to you.
5. Note the endpoint and the bucket name. The panel takes them as one address, `s3:https://<endpoint>/<bucket>`.

Versions that are no longer current keep using storage until the lock expires. For a bucket with much change, plan for two to five times the size of the source in the first year, and set a lifecycle rule at the provider that expires non-current versions after the retention period. A lifecycle rule runs at the provider and needs no delete right on the key you give Catena.

### Keys for the destination

Make one key pair per destination bucket, so a leak of one cannot reach another bucket. Keep three roles apart:

| Key | Rights | Where it lives |
|---|---|---|
| Copy key | Write and read, never delete: `s3:PutObject`, `s3:GetObject`, `s3:GetObjectVersion`, `s3:ListBucket`, `s3:GetBucketLocation`, `s3:AbortMultipartUpload`, `s3:ListMultipartUploadParts`. Leave out `s3:DeleteObject`, `s3:DeleteObjectVersion`, `s3:PutObjectRetention` and `s3:BypassGovernanceRetention`. | In the **Destination S3 access key** and **Destination S3 secret key** fields of the row. |
| Restore key | Read only: list the bucket, read objects (earlier versions too, to restore a past moment), and find the bucket's location (`s3:ListBucket`, `s3:GetObject`, `s3:GetObjectVersion`, `s3:GetBucketLocation`). | In a password manager. You type it on the **Restore** page when you need it (see [Restore another server's backup](/en/configuration/restore-and-migrate/#restore-another-servers-backup)); it is not stored on the server. |
| Prune key | The copy key's rights plus `s3:DeleteObject` and `s3:DeleteObjectVersion`. | Never on the server. In a password manager, used from your own computer only when the provider has no lifecycle rule and you must delete old versions by hand. |

A copy key without delete rights means no delete request from the server can ever reach the destination, and any delete in the provider's access log is not from Catena. Some providers also need the delete right to clean up unfinished uploads; add it only if copies fail on that.

How each provider expresses "no delete":

- **eazybackup and other MinIO-compatible providers:** attach a policy that allows the actions above to the key's user.
- **AWS S3:** attach the same policy, with the bucket's ARN, to an IAM user.
- **Backblaze B2:** when creating the application key, tick `listBuckets`, `listFiles`, `readFiles` and `writeFiles`, and leave `deleteFiles` unticked.
- **OVH Object Storage:** give the key the read and write role, not the administrator role.

To replace a key: enter the new one in the row, wait for one scheduled run to succeed, then delete the old key at the provider. No other step is needed.

### Steps

1. Open **Settings** > **Offsite copies**. The section needs Catena Business. Without it the section reads "Available with a Catena Business licence." with a link to **Subscription**, and shows no form. When copies are already declared, it says how many, and they run again once the licence includes Business.
2. Under **Add a copy**, fill in one row:

| Field | Content |
|---|---|
| **Name** | Lowercase letters, digits and hyphens; 40 characters at most; unique. |
| **Source repository URL** | The bucket to copy, as `s3:https://<endpoint>/<bucket>`. |
| **Source S3 access key**, **Source S3 secret key** | Keys for the source. |
| **Destination repository URL** | The locked bucket, in the same address format. |
| **Destination S3 access key**, **Destination S3 secret key** | Keys for the destination. |

3. Press **Save offsite copies**. The page replies "Offsite copies saved." Remove a row with **Remove this copy on save (the copies already made are kept)**.

Enter both sets of keys in the row, even for the backup repository, whose keys are also stored under **Backup repository**: this list owns what gets copied where. Source and destination must be different buckets, and you can add at most 32 rows. Leave the secret blank on an existing row to keep the stored one. Until a row exists the section reads "No offsite copies are declared, so nothing is copied offsite."

The copies run on the **Offsite copy** job of the [Schedules](/en/configuration/schedules/) page, which ships switched off: turn it on there once the row is saved. They also run as a step of the maintenance. An unreachable or unconfigured destination is recorded as skipped and does not stop backups.

### How the copy behaves

- Before each copy, the backups past the retention numbers are removed from the backup repository and the repository is checked, so the write-once storage receives only the backups you keep. While an offsite copy exists, this clean-up only deletes data that no kept backup uses and never rewrites partly used storage, so the write-once storage holds each piece of data once.
- A copy only ever adds. Nothing it has written is changed or deleted afterwards. A bucket removed from the list keeps every copy already made, and the storage cost grows with churn.
- A locked copy is read where it is. The **Restore** page restores the server from the offsite copy of its backup repository and puts any declared bucket back from its copy (see [Restore another server's backup](/en/configuration/restore-and-migrate/#restore-another-servers-backup) and [Put a bucket back from its offsite copy](/en/configuration/restore-and-migrate/#put-a-bucket-back-from-its-offsite-copy)).
- A copy of a bucket other than the backup repository is a plain scheduled copy of that bucket. No restore matches it to an application.

## What a backup contains

Included:

- the data of every application, including its Docker volumes and the folders kept under the server's application storage, and the history kept by the status page, the heartbeat monitor and the resource monitor;
- an export of each database taken just before the snapshot (below);
- the server's own configuration: system files, SSH and firewall settings, the settings and secrets stored by Catena, and the administrative log;
- every folder listed under **Other folders to back up**.

Excluded: container image layers (they are pulled again), antivirus signature databases, logs and temporary folders.

Not included: data an application keeps outside this server, such as in a bucket you set it up to use. A bucket is copied only when you declare it under **Offsite copies**, as a plain copy (see [Offsite copies](#offsite-copies)).

Database exports are automatic for every running container whose image is a PostgreSQL one, its name holding `postgres` or starting with `postgis`, `timescale` or `pgvector`, or a MariaDB or MySQL one. PostgreSQL is exported with `pg_dumpall`. MariaDB and MySQL need `MARIADB_ROOT_PASSWORD` or `MYSQL_ROOT_PASSWORD` in the container's environment. Each export is a plain SQL file, one per database server, and the backup storage compresses it, so each backup after the first sends only what changed. A failed export of a running database fails the whole backup. A database that is not running yet is another case: a backup waits up to ten minutes for every deployed application's database to run before exporting it, and a database still down after that is left out of that backup, the backup of everything else goes ahead, and the run is reported as failed, naming the application. Other engines, such as MongoDB or SQLite, get no automatic export.

Every backup puts each application that declares a backup mode in it: a catalog application whose entry asks for it, such as Nextcloud, is put in maintenance mode while the backup runs and taken out of it right after the snapshot, even when the backup fails. This holds for the backup the maintenance takes, for the one the **Backup** job runs on its own schedule and for **Trigger backup now**. An application that declares no backup mode keeps running: its database exports are consistent, and its files on disk are as they were while in use. A restore takes the applications it puts back out of maintenance mode.

After each snapshot the server checks every running container for folders mounted from outside the backup set. A backup fails when it finds one that is not listed under **Other folders to back up**; the **Check backup coverage** action runs the same check on demand.

## Keep an application's files on a disk you attach

An application keeps its files in a Docker volume on the server's own disk unless you point it elsewhere. For a large set of files, or to keep them apart from the system disk, attach a volume at your provider and have the application keep its files there. Catena mounts no disk itself: you attach, format and mount the disk, list its mount point in Catena, and point the application at a folder on it. The steps use `/mnt/data` as the mount point and `my-app` as the application's folder; replace both. Run the commands as root over SSH.

### Prepare the disk

1. Attach a volume to the server in your provider's console. Encrypting the volume is the provider's option, where one is offered (see [Encryption of the disk and of the files](#encryption-of-the-disk-and-of-the-files)). Run `lsblk` to find the device name it gets, such as `/dev/sdb`.
2. Format it once. This erases everything on the volume:

   ```sh
   mkfs.ext4 /dev/sdb
   ```

3. Create the mount point and read the volume's UUID:

   ```sh
   mkdir -p /mnt/data
   blkid /dev/sdb
   ```

4. Add one line to `/etc/fstab`, with the UUID that `blkid` printed. A UUID stays the same when the device name changes, and `nofail` lets the server start when the disk is missing:

   ```text
   UUID=<uuid> /mnt/data ext4 defaults,nofail 0 2
   ```

5. Mount the disk and check it:

   ```sh
   systemctl daemon-reload
   mount /mnt/data
   df -h /mnt/data
   ```

6. Make Docker wait for the disk at start-up. Create the file `/etc/systemd/system/docker.service.d/40-data-disk.conf` with this content, then run `systemctl daemon-reload`:

   ```ini
   [Unit]
   WantsMountsFor=/mnt/data
   ```

   Docker then starts after the disk is mounted when the disk is there, and still starts when it is missing, so the other applications keep running. Do not use `RequiresMountsFor=`: it keeps Docker, and with it every application, down while the disk is missing.
7. Create an empty folder on the disk for the application:

   ```sh
   mkdir /mnt/data/my-app
   ```

   Never give an application the disk's top folder, `/mnt/data`. While the disk is missing, the folder inside it does not exist, so the application does not start and writes nothing onto the system disk, whereas the top folder exists with or without the disk. The application check refuses a bind of the top folder (see rule [X17](/en/configure-apps/#x17)). The application's own notes say whether the folder needs a particular owner (see [Settings, deploy, take down and delete](/en/configure-apps/#settings-deploy-take-down-and-delete)).

### Tell Catena and the application

1. Open **Settings** > **Backup repository**, add the mount point, `/mnt/data`, to **Other folders to back up (separated by commas)** and save. Everything under it goes in every backup. A bind outside the application's own folder is accepted only under a folder listed here, so do this first.
2. Add the application, and open its page. Set the setting that says where it keeps its files to the folder you made, `/mnt/data/my-app`. The application's setup steps name the setting. It is read at the first start and locked after it (see [Declare the settings](/en/configure-apps/#declare-the-settings-optional)), so set it before the first deploy.
3. Press **Deploy application**.

### What Catena checks

Each backup records which listed folders lie on a mounted disk, and Catena watches those disks while it works:

- **Backup.** When a disk that was mounted at the last backup is not mounted now, the backup stops before it saves anything, so it never records an empty folder in place of the disk's files. The **Log** page reads "The backup did not run: `<folder>` was a mounted disk at the last backup and is not mounted now." Mount the disk at the same path and run the backup again. If you took the disk out on purpose, remove the folder from **Other folders to back up**, which ends the check. A different disk mounted at the same path does not stop the backup: the backup log says the disk changed. A listed folder that lies inside a disk mounted elsewhere is checked through that disk.
- **Deploy, start and update.** An application whose files are on a disk that is not mounted is not deployed, started or updated. The page names the folder to mount.
- **Server start-up.** An application whose disk is missing cannot start, because its folder does not exist, and Catena stops it at start-up. The **Log** page reads "`<app>` was stopped at start-up: it keeps its files in `<folder>`, a disk that is not mounted." Mount the disk. The application comes back by itself at the next start-up of the server, or at once when you deploy it from the **Apps** page. An application you stopped yourself stays stopped.
- **Restore.** A restore refuses before it touches anything when a disk it writes to is not mounted or lacks room (see [Disks a restore writes to](/en/configuration/restore-and-migrate/#disks-a-restore-writes-to)).

### Backup and restore

- The backup grows with the disk. Everything under a listed folder is in every backup, so the repository holds as much as the disk does, and a restore needs the same room on the disk.
- A restore of a single application brings back that application's folder on the disk and nothing else of the disk (see [Restore on a running server](/en/configuration/restore-and-migrate/#restore-on-a-running-server)).
- On a new server, mount a disk at the same path before you start the restore: follow [Prepare the disk](#prepare-the-disk) up to step 6, and skip step 2 when the disk already holds files, because formatting erases it. The restore writes the listed folders onto the disk, but it does not write the server's `/etc`, so you make the `/etc/fstab` line and the Docker file again by hand.

### Encryption of the disk and of the files

Catena sets up no encryption of an application's files. Two separate options exist:

- **The provider's volume encryption**, where your provider offers it, is turned on when you create or attach the volume. The server sees the disk decrypted while it is attached, and Catena neither manages nor shows the provider's key. It protects the volume's content at the provider, not against someone who reaches the running server.
- **An application's own encryption of its files at rest**, where the application offers it, is a setting of the application. The application's notes on its page, under **More about this application** (see [Settings, deploy, take down and delete](/en/configure-apps/#settings-deploy-take-down-and-delete)), say how to turn it on, what it covers, where its keys live and what is lost without them. It works the same on a volume and on an attached disk.

Catena encrypts the backups itself, before they leave the server, with the backup password, whichever option you choose.

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

Every admin page shows the banner "No backup is configured: updates run with nothing to return to. Configure one in Settings." The maintenance still applies updates in that state, and records a Log event saying so. When the maintenance changes nothing (it is off, or [Updates and Docker engine upgrade](/en/configuration/schedules/#choosing-the-steps) are both left out), the banner is shortened to "No backup is configured. Configure one in Settings." The banner stays until a repository is configured.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Backup actions are missing from **Actions** | You have not stored the repository address or a key yet. |
| "Endpoint valid, but its contents could not be read." | Wrong key pair, no list right on the bucket, or a wrong bucket name in the address. Correct it and save again. |
| **Generate backup encryption password** is refused | A password already exists, or the bucket holds backups under another password. Use an empty bucket. |
| A backup fails on coverage | A container mounts a folder outside the backup set. List it under **Other folders to back up**. |
| A backup fails on a database export | A MariaDB or MySQL container without `MARIADB_ROOT_PASSWORD` or `MYSQL_ROOT_PASSWORD`, a database that could not be exported, or an application whose database was still down after ten minutes. The run names the application, and the backup log gives the reason. |
| A backup does not run, and the **Log** page reads "The backup did not run: ... is not mounted now." | A listed folder was on a mounted disk at the last backup, and the disk is not mounted. Mount it at the same path, or remove the folder from **Other folders to back up** if you took the disk out (see [Keep an application's files on a disk you attach](#keep-an-applications-files-on-a-disk-you-attach)). |
| An application is stopped, and the **Log** page reads "... was stopped at start-up: ..." | Its disk is not mounted. Mount it, then deploy the application from the **Apps** page, or restart the server. |
| You have lost the saved password | While the server runs, **Show the values** in **Disaster-recovery keyset** displays it again. With the server gone too, the backups cannot be read by any means. |

The **Log** page records each completed backup with its size; the [Updates](/en/configuration/updates/) page describes the other events recorded there.
