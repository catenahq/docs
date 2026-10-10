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
2. Under **Which backups to restore from**, keep **This server's own backups** and press **Show the backups**.
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

## Rebuild a lost server on a new machine

When your original server is gone, a new server restores from the old server's backups. You need only the recovery keyset (see [Backups and S3 storage](/en/configuration/backups/#disaster-recovery-keyset)).

1. Install Catena on the new server (see [Installation](/en/installation/)). The installer takes the newest release.
2. Open the new server's panel and go to **Restore**.
3. Under **Which backups to restore from**, choose **Another server's backups**.
4. Under **Another server's backup repository**, fill in:

   | Field | Value from the recovery keyset |
   |---|---|
   | **Repository address** | The repository address, `s3:https://<endpoint>/<bucket>` |
   | **Repository password** | The backup encryption password |
   | **Storage access key** | The S3 access key |
   | **Storage secret key** | The S3 secret key |

   Only the fields the storage provider issued need values, but the address and the password are always required ("Both a repository address and its password are needed.").
5. Press **Save these credentials**. They are held in memory only: the address and keys are gone after the server restarts, and **Forget the saved credentials** erases them at once. The backups of that repository are then listed under **Choose a backup**.
6. Select the backup (for ransomware or a compromise, one taken before the incident), then continue with steps 4 to 6 of the previous section.

When the restore finishes, the new server has the old one's data and stored configuration.

## Restore from the offsite copy

When the backup repository itself is damaged, encrypted or gone, restore from its [offsite copy](/en/configuration/backups/#offsite-copies) instead. The copy is read where it is: reading it writes nothing to it, and it stays locked. It keeps every backup ever copied to it, and a backup older than the copy's lock period may be incomplete.

You need the offsite copy's address, the backup encryption password (see [Backups and S3 storage](/en/configuration/backups/#disaster-recovery-keyset)), and an access key and secret key that can read the copy's bucket.

1. Open **Restore**.
2. Under **Which backups to restore from**, choose **This server's offsite copy**. The choice is offered once the server's installed components support it (see Troubleshooting).
3. Under **This server's offsite copy**, fill in:

   | Field | Value |
   |---|---|
   | **Offsite copy address** | The address of the copy's bucket. It is filled in from the offsite copy of the backup repository declared under **Offsite copies** in **Settings**; on a new machine, enter it. |
   | **Backup encryption password** | The password of the backup repository |
   | **Access key that reads the offsite copy** | The access key |
   | **Secret key that reads the offsite copy** | The secret key |

4. Press **Save these keys**. They are held in memory only and removed when a restore from the copy finishes, or after 24 hours, whichever comes first. A restore that stops part-way keeps them so you can start it again. **Forget these keys now** erases them at once. The backups of the copy are then listed under **Choose a backup**.
5. Select the backup, then continue with steps 4 to 6 of [Restore on a running server](#restore-on-a-running-server). The [version rule](#version-rule) applies.

When the restore finishes, the server has the data and stored configuration of the selected backup. Backups stop until a backup repository exists at the destination: a backup never creates one. Save a backup destination in **Settings**, under **Backup**, preferably a new bucket with new keys, since the old one may be in an attacker's hands; saving it creates a new repository there.

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

After a restore from the offsite copy, backups wait for a backup destination saved in **Settings** (see [Restore from the offsite copy](#restore-from-the-offsite-copy)). The offsite copy then stops rather than mix the new repository into the locked bucket that holds the old one: declare a new locked bucket for it under **Offsite copies**. A repair and a restore do not run together: each is refused while the other runs.

## Restore report

The **Restore report** panel (Catena Pro) shows evidence that backups restore: a local restore test with its recovery time, and the state of the offsite copy. The nightly maintenance runs the local test each night it is on; **Verify my backup can be restored** under **Actions** runs it on demand. A link to the report appears in the Current restore section.

## Migrate to another server

A migration copies almost everything while the old server keeps serving. Only the last few minutes are unavailable to the people using it, and that part does not grow with the amount of data. You start the move from the new server, after the old server has opened a time-limited window.

### Prerequisites

- The old server has Catena Pro or Catena Business. The new server needs no subscription of its own: the subscription key moves with the data.
- Both servers are on the same Catena version. A move between different versions is refused before anything is touched.
- Both servers are on the same private network (see [Admin access and tailnet](/en/configuration/admin-access/)). The move travels over it only.
- The old server's backup repository is saved on the new server (steps 3 to 5 of the previous section).
- You have not entered a Cloudflare token on the new server. The move brings the old server's token, and a token entered first would take the old server's web address before the move starts.

### On the old server

1. Open the **Migration** panel.
2. Press **Allow this server to be migrated**. A one-time code appears below the button, once. It is not stored and cannot be shown again.
3. Pass the code to whoever runs the move.

The window closes on its own after 4 hours, five wrong codes close it too, and **Stop allowing migration** closes it at once. Replace a lost code by pressing the button again, which also invalidates the old code. The window also closes once the move has handed the subscription key over.

### On the new server

1. Open **Restore** and go to **Move another server here**.
2. Enter **The other server's private-network address**: its address on the private network (an IP address), not its web address. The web address is what moves at the end, so it cannot reach the old server during the move.
3. Enter the **Pairing code**.
4. Set **Preparation passes** (1 to 5, default 1). Each extra pass copies only what changed since the previous one, which shortens the final unavailable period. One pass is enough unless you expect a long delay before the cut-over.
5. Tick "I understand the other server will be taken out of service and that this one will take over its web address." and press **Start the move**.

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
- To put the old server back, use **Put it back into service** under **Put the other server back into service** on the new server's Restore page (enter the address and the pairing code again), or **Put this server back into service** in the old server's own **Migration** panel. Its web address still points there, so it serves again as soon as it comes up.
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
| "The move could not be started." | The request was not accepted. Check the address (an IP address, not a name) and the pairing code, and that the window is open on the old server. |
| "The credentials were refused." | The repository details were not accepted. Check them against the recovery keyset. |
| "A bucket is being put back from its offsite copy. Wait for it to finish before starting a restore." | A bucket repair is running. A restore starts only after it finishes, and a repair is refused the same way while a restore runs ("A restore is running on this server. Wait for it to finish before putting a bucket back."). |
| "Restoring from the offsite copy is not available on this server yet: its installed components are older than this panel." or "Putting a bucket back is not available on this server yet: its installed components are older than this panel." | The server's installed components predate the feature. Open **Settings**, go to **Server configuration**, press **Bring this server up to date**, and try again once it finishes. |
| Log: the restore left `<app>` stopped | The backup was taken while its saved definition named an image its services did not run. Set the definition to the versions the services ran and deploy it from Portainer. |
