---
title: "Backup, restore, and migrate"
description: "Encrypted backups to storage you own, restores from the panel, moving to another server, and leaving Catena with standard tools."
---

Encrypted copies of all app data and of the server's own configuration go to S3 storage you own. You can rebuild a lost server on a new machine from the backup address, the storage keys and the backup password alone. You can roll back a running server from the panel, and move a whole server to another with minutes of downtime.

## How backups work

- **Storage and encryption.** restic encrypts on the server before anything is uploaded. The repository is one address, written `s3:https://<endpoint>/<bucket>`, which you enter in **Settings** > **Backup repository** with its two S3 keys. The server generates the backup password in **Settings** > **Backup password**, shows it once and holds it nowhere else, so save it in a password manager. You can check it against the repository or change it, which re-keys the repository.
- **What is included.** App data and volumes, the server's configuration (including `/etc/catena/config.json`) and the audit trail. You declare extra folders in **Other folders to back up**; a container that mounts a path outside the backup set makes the run fail rather than silently skip it.
- **Databases.** Before each snapshot, every running container whose image is a PostgreSQL one, its name holding `postgres` or starting with `postgis`, `timescale` or `pgvector`, is exported with `pg_dumpall`, and every MariaDB or MySQL container is exported too (it needs `MARIADB_ROOT_PASSWORD` or `MYSQL_ROOT_PASSWORD` in its environment). Exports are plain SQL files, one per database server, compressed by the backup storage, so each backup after the first sends only what changed. A failed export of a running database fails the backup. A backup waits up to ten minutes for each application's database to run; one still down after that is left out and the run is reported as failed, naming the application. The databases of the monitoring services (Gatus, Healthchecks and Beszel) are copied whole before each snapshot while they run, a copy that fails fails the backup, and a restore of the whole server starts each service on its copy. Other engines, such as MongoDB or an application's own SQLite file, get no automatic export.
- **Retention.** The defaults keep 24 hourly, 7 daily, 4 weekly and 6 monthly snapshots, which you can edit on the **Schedules** page. Backups past these numbers are removed once a day, and before each offsite copy. Until then every backup stays listed and restorable.
- **Cadence.** A backup button is always available in **Actions**. A backup schedule (Sunday at 03:00 by default) is off until you turn it on. Without a paid subscription it runs at most once a week, on the day and time you choose; Catena Pro and Catena Business add daily and custom cadences. Healthchecks receives a ping after each run.
- **Browsing.** You can list snapshots, browse them read-only and export them to an archive from **Actions** without a restore.

## Restore

The **Restore** page restores everything from this server's backups, or from another backup repository (another server's, or a copy such as the offsite copy), given its address, backup password and storage keys, held in memory only. The panel, sign-in and the connection stay up while applications are replaced. You can resume an interrupted restore with the same backup. A backup newer than the running version is refused. The applications a restore brings back stay stopped until you start them from the **Restore** page, and a move starts them with the server. After a rebuild or a move, the previous server's audit trail is kept beside the new one, and every export carries it. See [Restore and migrate](/en/configuration/restore-and-migrate/).

## Migration

A new server pulls from the old one with **Move another server here**. The old server's **Migration** panel opens a 4-hour window and shows a one-time migration ticket and pairing code, and the new server reaches the old one over SSH with them. Most data is copied while the old server keeps serving. Up to the final backup check you can call off the move and the old server puts itself back in service. Both servers must run the same version. The subscription key moves with the data.

## Offsite copies

**Offsite copies** copies each declared bucket to a locked bucket (Object Lock) at a different provider, additively: nothing is ever deleted. You can restore from a copy where it is, or put a bucket back from it.

## What each edition adds

Community has manual backups, a scheduled backup at most once a week, snapshot browsing, whole-server restore and rebuild, and the receiving side of a migration. Catena Pro adds daily and custom backup schedules, the other schedules, restoring a single app, the restore report and the source side of a migration, and Catena Business adds offsite copies. See the [edition comparison](https://catena.run/en/#pricing).

## Limits

- You need an S3-compatible repository, and if you lose the backup password the backups become unreadable.
- A file bucket copied offsite is restorable only together with a database snapshot from the same moment.
- Restoring one app does not roll back the server's settings.
- A backup the **Backup** job runs on its own schedule brings an app's database and the files on its volumes back to that backup's moment, with no maintenance mode around it. Files an app keeps in its own storage bucket come back as the bucket holds them, or as of its last offsite copy. Apps are put in maintenance mode only for the nightly maintenance's backup.

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

After a restore, the applications it brought back stay stopped. Start them without the panel with the command below, repeating `-app` for each application. The name is the application's name as Docker lists it, such as `catena-nextcloud`. A name the restore did not leave stopped is refused, and the refusal lists the ones it did. It runs the same start as the **Restore** page: the database check and the release from backup mode. The start ends there, without a configuration update.

```sh
sudo catena-recovery start-apps -app <name>
```

Apps run under Docker's own orchestrator, so standard Docker commands let you list them and stop or start any one of them:

```sh
docker service ls
docker service scale <name>=0
docker service scale <name>=1
```

Scaling to zero is the stop, and back to one is the start. An application a restore left stopped has no service until it is started, so `docker service scale` does not start it. You rebuild a whole server from the keyset by following [Restore and migrate](/en/configuration/restore-and-migrate/), which works without the admin panel.

### Restore one app on any machine

You can bring one app back on any machine that has Docker and restic, without Catena. The backup keeps each app in a folder named after it, holding its compose file (`docker-compose.yml`), its settings in `.env` and a note of where the file came from. Its data lives in Docker volumes that carry its name. Before you start, set `RESTIC_REPOSITORY`, `RESTIC_PASSWORD`, `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in your shell from the keyset. On the server itself, load them as shown above.

1. Restore the app's folder and its volumes into an empty directory. Replace `<app>` with the app's name and `<volume>` with each of its volumes (`docker volume ls` on the server lists them):

   ```sh
   restic restore latest --target /recovered \
     --include /srv/catena/compose/<app> \
     --include /srv/catena/docker/volumes/<volume>
   ```

2. Create each volume and copy its data in:

   ```sh
   docker volume create <volume>
   sudo cp -a /recovered/srv/catena/docker/volumes/<volume>/_data/. \
     /var/lib/docker/volumes/<volume>/_data/
   ```

3. On a machine that does not run Docker swarm yet, prepare it once. Catena's apps run as swarm services on a network named `catena-network`, on a node labelled `catena.role=data`:

   ```sh
   docker swarm init
   docker network create --driver overlay catena-network
   docker node update --label-add catena.role=data self
   ```

4. Start the app from its folder, with the settings in `.env` loaded:

   ```sh
   cd /recovered/srv/catena/compose/<app>
   set -a; . ./.env; set +a
   docker stack deploy -c docker-compose.yml <app>
   ```

The compose file names the exact image versions that were running, so the app comes back at the version its data expects.

To move away entirely:

1. Export what you need with each app's own tools.
2. Point your domain elsewhere at your DNS provider whenever the time comes; nothing on the server depends on Catena to keep serving until then.
3. Keep the backups: the restic repository stays readable with restic alone for as long as you keep the keyset.

Deleting the admin panel changes nothing about the data or the running apps. What you give up is the automation and convenience: one-command recovery, monitoring wiring, managed updates and the panel itself. Never the data.
