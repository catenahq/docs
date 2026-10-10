---
title: "Restore and migrate"
description: "Putting data back from a backup, rebuilding a lost server on a new machine, and moving a running server to another one."
---

You handle three situations from the **Restore** page of the panel: your server runs but its data is wrong, your server is gone and a new machine replaces it, and you are replacing a working server with another. The first two use backups; the third copies a live server and has a way back until the last few minutes. Backups themselves are set up on the [Backups and S3 storage](/en/configuration/backups/) page.

## Prerequisites

- A whole-server restore and the receiving side of a migration work in every edition.
- Restoring a single application, the restore report, and the source side of a migration need Catena Pro or Catena Business (see the [edition comparison](https://catena.run/en/#pricing)).
- You have the panel open as an administrator.

## Restore on a running server

The restore replaces data and nothing else. Applications are stopped while their data is put back, then started again with it. The panel, the sign-in and the connection carrying the page stay up throughout, so you can follow the restore from start to finish. There is no rebuild and nothing for you to reconfigure afterwards.

1. Open **Restore**.
2. Under **Which backups to restore from**, keep **This server's backups** and press **Show the backups**.
3. Under **Choose a backup**, select one row. Columns are **Taken**, **Server**, **Size** and **Labels**. Each row is a complete restore point; pick the most recent one taken before the problem started. When the repository holds backups from more than one server, the page warns that selecting by timestamp alone can restore another server's data over this one: the **Server** column says which server wrote each snapshot.
4. Under **How much to put back**, choose the scope:
   - **Everything on this server** returns every application to the selected backup.
   - **Only the applications selected below** (Catena Pro) returns only the ticked applications. Only those are stopped; every other application, the sign-in and the panel keep running. An application comes back with the data and the version recorded in the backup. Its settings are not rolled back, because they are shared with the rest of the server.

   Without a Pro subscription the scope choice is not shown, and a single-application request is refused with "Restoring a single application is not available on this plan."
5. Under **Start the restore**, tick "I understand my applications will be unavailable during the restore." The duration scales with the amount of data.
6. Press **Restore the selected backup**.

The option "Copy the data only, without starting anything. Used to prepare a move to another server." copies the data and stops, leaving every application switched off. Leave it unticked for an ordinary restore. A migration does this staging by itself, so the box is not needed for one.

### Progress

The **Current restore** section names the step in progress, in this order: Checks before anything is touched (this includes the version rule below), Recording what is running now, Stopping the applications, Copying data back, Fetching application images, Adopting the saved configuration, Starting the core services, Applying the saved configuration to this server, Bringing the applications back, Restoring the databases, Bringing the applications up to date, Checking the stored files, Final checks, and Finished.

### A restore that stops part-way

The section reads "The restore stopped at:" followed by the step. Every step can be run again, so there are two ways forward:

- **Carry on:** choose the same backup and start it again; it continues from where it stopped. A different backup or scope is refused.
- **Start over:** press **Clear the stopped restore**, then start again from the beginning.

A second restore is refused while one runs ("A restore is already running on this server."), and a running restore cannot be cleared.

### Version rule

Each backup records the Catena version that made it. The restore compares it with the version the server runs:

- A snapshot **newer** than the server is refused, because newer database files do not open under an older database. Bring the server to the snapshot's version first, then retry the restore.
- A snapshot **older** than the server needs an explicit upgrade choice. Without it the restore is refused and nothing is changed.
- Two versions that cannot be put in order are refused.

A refusal happens in the first step, before anything is touched.

## Restore from another backup repository

Restore from a backup repository other than the one this server backs up to: the old server's repository when a new machine replaces one that is gone, or a copy of this server's backups, such as its [offsite copy](/en/configuration/backups/#offsite-copies), when the backup repository itself is damaged, encrypted or gone. The repository is read where it is: reading it writes nothing to it, so a locked copy stays locked and a key that can only read is enough. An offsite copy keeps every backup ever copied to it, and a backup older than the copy's lock period may be incomplete.

You need the repository's address, its password (the backup encryption password), and an access key and secret key that can read its bucket. To rebuild a lost server, all four are in the recovery keyset (see [Backups and S3 storage](/en/configuration/backups/#disaster-recovery-keyset)): first install Catena on the new server (see [Installation](/en/installation/)). The installer takes the newest release.

1. Open **Restore**.
2. Under **Which backups to restore from**, choose **Another backup repository**. The choice is offered once the server's installed components support it (see Troubleshooting).
3. Under **Another backup repository**, fill in:

   | Field | Value |
   |---|---|
   | **Repository address** | The repository address, `s3:https://<endpoint>/<bucket>`. The addresses of this server's offsite copies are suggested. |
   | **Repository password** | The backup encryption password |
   | **Storage access key** | The S3 access key |
   | **Storage secret key** | The S3 secret key |

   Only the fields the storage provider issued need values, but the address and the password are always required ("Both a repository address and its password are needed.").
4. Press **Save these credentials**. They are held in memory only, and removed when a restore from that repository finishes, after 24 hours, or when the server restarts. A restore that stops part-way keeps them so you can start it again. A move to this server that has not finished 24 hours after you saved them needs them saved again. **Forget the saved credentials** erases them at once. The backups of that repository are then listed under **Choose a backup**.
5. Select the backup (after ransomware or a compromise, one taken before the incident), then continue with steps 4 to 6 of [Restore on a running server](#restore-on-a-running-server). The [version rule](#version-rule) applies.

When the restore finishes, the server has the data and stored configuration of the selected backup.

After a restore from a copy of this server's backups, backups stop until a backup repository exists at the destination: a backup never creates one. Save a backup destination in **Settings**, under **Backup**, preferably a new bucket with new keys, since the old one may be in an attacker's hands; saving it creates a new repository there.

## Put a bucket back from its offsite copy

This copies a bucket's offsite copy back into the bucket it was copied from. It works for the backup repository and for any other bucket declared under **Offsite copies**, in every edition. The repair only adds: whatever is missing or different is copied back, and nothing is deleted on either side. The offsite copy is only read.

1. Open **Restore** and go to **Put a bucket back from its offsite copy**. The section is shown once the server's installed components support it (see Troubleshooting). Without a declared copy it reads "No offsite copy is declared on this server. Offsite copies are declared in Settings, under Offsite copies."
2. Under **Offsite copy to put back**, choose the copy. Each entry shows its name and the address of the bucket it puts back.
3. Enter **Access key that reads the offsite copy** and **Secret key that reads the offsite copy**. They are used for this run only and kept nowhere.
4. Optional: under **Application that keeps its files in this bucket**, choose the application when the bucket holds its files, such as Nextcloud. It is put in its backup mode while its files are copied back, then its stored files are checked against its database. Keep **None, as for the backup repository** for any other bucket.
5. Optional: under **As it was at (UTC, optional)**, enter a date and time to put back the files as the offsite copy held them at that moment, such as before they were encrypted or overwritten. The access key then needs the right to read earlier versions. Left blank, the latest versions are put back.
6. Tick "I understand the bucket is written to while it is put back." and press **Put the bucket back**.

The section follows the repair step by step: Waiting for the backup, the offsite copy or an update to finish, Reaching both buckets, Checking the bucket can take the copy back, Putting the application in its backup mode, Copying the files back, Taking the application out of its backup mode, Checking the stored files, and Finished. When you chose no application, the three steps that involve one (backup mode in, backup mode out, checking the stored files) pass without doing anything.

The copy writes into the bucket while it runs. A large bucket takes hours, and the storage provider may charge for the data read.

If the repair stops, the section reads "Putting the bucket back stopped at:" followed by the step. Press **Put the bucket back** again with the same entries: starting again copies only what is still missing. A repair that puts the backup repository back is refused at the check step when the bucket already holds a different backup repository, such as one created in place of the lost one, because copying would mix the two. Nothing is copied. Empty the bucket, then start again.

### Order after a restore from the offsite copy

After a restore from the offsite copy, backups wait for a backup destination saved in **Settings** (see [Restore from another backup repository](#restore-from-another-backup-repository)). The offsite copy then stops rather than mix the new repository into the locked bucket that holds the old one: declare a new locked bucket for it under **Offsite copies**. A repair and a restore do not run together: each is refused while the other runs.

## Restore report

The **Restore report** panel (Catena Pro) shows evidence that backups restore: a local restore test with its recovery time, and the state of the offsite copy. The nightly maintenance runs the local test each night it is on; **Verify my backup can be restored** under **Actions** runs it on demand. A link to the report appears in the Current restore section.

## Migrate to another server

A migration copies almost everything while the old server keeps serving. Only the last few minutes are unavailable to the people using it, and that part does not grow with the amount of data. You start the move from the new server, after the old server has opened a time-limited window.

### Prerequisites

- The old server has Catena Pro or Catena Business. The new server needs no subscription of its own: the subscription key moves with the data.
- Both servers are on the same Catena version. A move between different versions is refused before anything is touched.
- The new server reaches the old one's SSH port 22: on its public address, or on its private network once its public SSH is closed (see [Admin access and tailnet](/en/configuration/admin-access/#close-ssh-on-public-port-22)).
- The old server's backup repository is saved on the new server (steps 2 to 4 of [Restore from another backup repository](#restore-from-another-backup-repository)).
- You have not entered a Cloudflare token on the new server. The move brings the old server's token, and a token entered first would take the old server's web address before the move starts.

### On the old server

1. Open the **Migration** panel.
2. Press **Allow this server to be migrated**. Three fields appear below the button, once: the **Migration ticket**, with a **Copy** button, the **Pairing code**, and **Migration window closes at**, the time the window closes in the server's time zone. Neither the ticket nor the code is stored, and neither is shown again.
3. Pass both to whoever runs the move by two different channels: copy the ticket with **Copy**, and read the code aloud.

The window closes on its own after 4 hours, five wrong codes close it too, and **Stop allowing migration** closes it at once. Replace a lost ticket or code by pressing the button again, which mints a new pair and stops the old ones. The window also closes once the move has handed the subscription key over.

### On the new server

1. Open **Restore** and go to **Move another server here**.
2. Paste the **Migration ticket**.
3. Enter the **Pairing code**.
4. Leave **The other server's address (optional)** empty to use the address in the ticket, or enter another IP address, for example the old server's private-network address once its public SSH is closed. Never use its web address: that is what moves at the end, so it cannot reach the old server during the move.
5. Set **Preparation passes** (1 to 5, default 1). Each extra pass copies only what changed since the previous one, which shortens the final unavailable period. One pass is enough unless you expect a long delay before the cut-over.
6. Tick "I understand the other server will be taken out of service and that this one will take over its web address." and press **Start the move**.

### What happens

1. Reaching the other server.
2. Copying the data across, and Getting this server ready to receive traffic. The old server still serves.
3. Pausing the other server's applications. The short unavailable window begins.
4. Taking its final backup, then Checking that backup. This is the last reversible step.
5. Taking the other server out of service. From here the old server does not put itself back.
6. Putting the data in place here, then Moving the web address here (the cut-over).
7. Final checks.

After the final checks the old server frees its activation of the subscription key, the new server activates it and then brings itself up to date, which turns on what the key unlocks (extra domains, schedules). Some services restart during that. **Settings** > **Subscription** shows the result. If freeing the old activation fails, free it in Polar's customer portal and save the key again on the new server.

### Calling it off

- Up to and including "Checking that backup", stopping the move puts the old server back into service by itself. Nothing has started on the new server and the web address still points at the old one.
- After "Taking the other server out of service", that no longer happens on its own, because the new server may already hold part of the data and starting both would have two servers writing to the same storage. The page reports that the old server is out of service and offers two ways: fix what failed and start the move again (it continues without copying everything a second time), or put the old server back.
- To put the old server back, use **Put it back into service** under **Put the other server back into service** on the new server's Restore page (enter the ticket, the pairing code and, if needed, the address again), or **Put this server back into service** in the old server's own **Migration** panel. Its web address still points there, so it serves again as soon as it comes up.
- **Forget this move** clears the record of an unfinished move and changes nothing on either server.

After a completed move the old server is stopped, not erased. Its data and backups are untouched, so you can keep it until the new server has proven itself. Retiring it is a separate step that nothing in the move performs.

## Troubleshooting

| Message | Meaning |
|---|---|
| "Choose a backup to restore." | You have not selected a row. |
| "Confirm that applications may be unavailable before starting." | You have not ticked the confirmation box. |
| "Select at least one application, or choose to restore everything." | The scope is limited to applications and you have ticked none. |
| "A restore is running on this server. Wait for it to finish before moving another server here." | A migration cannot start during a restore. |
| "A move is already running on this server." | Wait for it, or use **Forget this move** if it is unfinished. |
| "The move could not be started." | The request was not accepted. Check the ticket, the pairing code and the address (an IP address, not a name), and that the window is open on the old server. |
| The source refused the ticket: its window is closed, it was armed again since, or the ticket is not this server's | The old server did not accept the ticket. Open a new window on the old server, then use its new ticket and code. |
| The server at that address is not the one that minted the ticket | The address reaches another server, or the old server's SSH host key changed after a reinstall or a restore. Check the address; after a reinstall or a restore, open a new window on the old server and use its new ticket. |
| "The credentials were refused." | The repository details were not accepted. Check them against the recovery keyset. |
| "A bucket is being put back from its offsite copy. Wait for it to finish before starting a restore." | A bucket repair is running. A restore starts only after it finishes, and a repair is refused the same way while a restore runs ("A restore is running on this server. Wait for it to finish before putting a bucket back."). |
| "Restoring from another backup repository is not available on this server yet: its installed components are older than this panel. Bring this server up to date in Settings, under Server configuration, then try again." or "Putting a bucket back is not available on this server yet: its installed components are older than this panel." | The server's installed components predate the feature. Open **Settings**, go to **Server configuration**, press **Bring this server up to date**, and try again once it finishes. |
| Log: the restore left `<app>` stopped | The backup was taken while its saved definition named an image its services did not run. Set the definition to the versions the services ran and deploy it from Portainer. |
