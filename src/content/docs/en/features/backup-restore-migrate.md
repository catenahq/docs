---
title: "Backup, restore, and migrate"
description: "Encrypted backups to storage you own, restores from the panel, moving to another server, and leaving Catena with standard tools."
---

Encrypted copies of all app data and of the server's own configuration go to S3 storage you own. You can rebuild a lost server on a new machine from the backup address, the storage keys and the backup password alone. You can roll back a running server from the panel, and move a whole server to another with minutes of downtime.

## How backups work

- **Storage and encryption.** restic encrypts on the server before anything is uploaded. The repository is one address, written `s3:https://<endpoint>/<bucket>`, which you enter in **Settings** > **Backup repository** with its two S3 keys. The server generates the backup password in **Settings** > **Backup password**, shows it once and holds it nowhere else, so save it in a password manager. You can check it against the repository or change it, which re-keys the repository.
- **What is included.** App data and volumes, the server's configuration (including `/etc/catena/config.json`) and the audit trail. You declare extra folders in **Other folders to back up**; a container that mounts a path outside the backup set makes the run fail rather than silently skip it.
- **Databases.** Before each snapshot, every running container whose image name contains `postgres` is dumped with `pg_dumpall`, and every `mariadb` or `mysql` container is dumped too (it needs `MARIADB_ROOT_PASSWORD` or `MYSQL_ROOT_PASSWORD` in its environment). A failed dump fails the backup. Other engines such as MongoDB or SQLite get no automatic dump, and apps are not paused around a backup.
- **Retention.** The defaults keep 24 hourly, 7 daily, 4 weekly and 6 monthly snapshots, which you can edit on the **Schedules** page.
- **Cadence.** A backup button is always available in **Actions**. A backup schedule (Sunday at 03:00 by default, any cadence allowed) is off until you turn it on, which needs Catena Pro or Catena Business. Healthchecks receives a ping after each run.
- **Browsing.** You can list snapshots, browse them read-only and export them to an archive from **Actions** without a restore.

## Restore

The **Restore** page restores everything from the server's own backups, or from another server's backups when a machine replaces one that is gone (repository address, backup password and storage keys, held in memory only). The panel, sign-in and the connection stay up while applications are replaced. You can resume an interrupted restore with the same backup. A backup newer than the running version is refused. See [Restore and migrate](/en/configuration/restore-and-migrate/).

## Migration

A new server pulls from the old one with **Move another server here**. The old server's **Migration** panel opens a 4-hour window and shows a one-time pairing code, and the traffic uses the tailnet only. Most data is copied while the old server keeps serving. Up to the final backup check you can call off the move and the old server puts itself back in service. Both servers must run the same version. The subscription key moves with the data.

## Offsite copies

**Offsite copies** copies each declared bucket to a locked bucket (Object Lock) at a different provider, additively: nothing is ever deleted. To recover from it, first copy the locked bucket out to a fresh bucket.

## What each edition adds

Community has manual backups, snapshot browsing, whole-server restore and rebuild, and the receiving side of a migration. Catena Pro adds schedules, restoring a single app, the restore report and the source side of a migration, and Catena Business adds offsite copies. See the [edition comparison](https://catena.run/en/#pricing).

## Limits

- You need an S3-compatible repository, and if you lose the backup password the backups become unreadable.
- A file bucket copied offsite is restorable only together with a database snapshot from the same moment.
- Restoring one app does not roll back the server's settings.

## Configuration

- [Backups and S3 storage](/en/configuration/backups/)
- [Schedules](/en/configuration/schedules/)
- [Restore and migrate](/en/configuration/restore-and-migrate/)

## Leaving Catena

Catena is a convenience layer over standard, open tools. Everything on the server lives in formats those tools can read and restore, so leaving costs convenience, never data. The commands below are the ones Catena runs behind its buttons.

What you own, and where it lives:

- **Application data**: each app keeps its database and files on the server in its own standard format.
- **Backups**: a standard [restic](https://restic.net/) repository in a bucket you own, readable by any computer with restic.
- **Settings and internal credentials**: a readable file at `/etc/catena/config.json`, included in every backup.
- **Sign-on accounts**: stored by Keycloak in its own database on the server and exportable with Keycloak's tools.

Three items must live outside the server: the backup repository address, the storage access keys and the backup password (all visible in **Settings** > **Disaster-recovery keyset**). With those and any computer, you can recover the data, with or without Catena.

Back up without the panel. The panel's button starts a system service, which you can also start by hand:

```sh
sudo systemctl start catena-backup.service
```

To work with the repository directly, load the connection settings the server already stores, then use plain restic:

```sh
sudo bash -c 'set -a; . /etc/catena/backup.env; set +a; restic snapshots'
```

Restore without the panel. You can restore any file or folder from the latest snapshot:

```sh
sudo bash -c 'set -a; . /etc/catena/backup.env; set +a; \
  restic restore latest --target / --include /path/to/restore'
```

Apps run under Docker's own orchestrator, so standard Docker commands let you list them and stop or start any one of them:

```sh
docker service ls
docker service scale <name>=0
docker service scale <name>=1
```

Scaling to zero is the stop, and back to one is the start. You rebuild a whole server from the keyset by following [Restore and migrate](/en/configuration/restore-and-migrate/), which works without the admin panel.

To move away entirely:

1. Export what you need with each app's own tools.
2. Point your domain elsewhere at your DNS provider whenever the time comes; nothing on the server depends on Catena to keep serving until then.
3. Keep the backups: the restic repository stays readable with restic alone for as long as you keep the keyset.

Deleting the admin panel changes nothing about the data or the running apps. What you give up is the automation and convenience: one-command recovery, monitoring wiring, managed updates and the panel itself. Never the data.
