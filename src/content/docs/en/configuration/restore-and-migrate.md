---
title: "Restore and migrate"
description: "Putting data back from a backup, rebuilding a lost server on a new machine, and moving a running server to another one."
---

Three situations are handled from the **Restore** page of the panel: the server runs but its data is wrong, the server is gone and a new machine replaces it, and a working server is being replaced by another. The first two use backups; the third copies a live server and has a way back until the last few minutes. Backups themselves are set up on the [Backups and S3 storage](/en/configuration/backups/) page.

## Prerequisites

- A whole-server restore and the receiving side of a migration work in every edition.
- Restoring a single application, the restore report, and the source side of a migration need Catena Pro or Catena Business (see the [edition comparison](https://catena.run/en/#pricing)).
- The panel is open as an administrator.

## Restore on a running server

The restore replaces data and nothing else. Applications are stopped while their data is put back, then started again with it. The panel, the sign-in and the connection carrying the page stay up throughout, so the restore can be followed from start to finish. There is no rebuild and nothing to reconfigure afterwards.

1. Open **Restore**.
2. Under **Which backups to restore from**, keep **This server's own backups** and press **Show the backups**.
3. Under **Choose a backup**, select one row. Columns are **Taken**, **Server**, **Size** and **Labels**. Each row is a complete restore point; the one to pick is the most recent taken before the problem started. When the repository holds backups from more than one server, the page warns that selecting by timestamp alone can restore another server's data over this one: the **Server** column says which server wrote each snapshot.
4. Under **How much to put back**, choose the scope:
   - **Everything on this server** returns every application to the selected backup.
   - **Only the applications selected below** (Catena Pro) returns only the ticked applications. Only those are stopped; every other application, the sign-in and the panel keep running. An application comes back with the data and the version recorded in the backup. Its settings are not rolled back, because they are shared with the rest of the server.

   Without a Pro subscription the scope choice is not shown, and a single-application request is refused with "Restoring a single application is not available on this plan."
5. Under **Start the restore**, tick "I understand my applications will be unavailable during the restore." The duration scales with the amount of data.
6. Press **Restore the selected backup**.

The option "Copy the data only, without starting anything. Used to prepare a move to another server." copies the data and stops, leaving every application switched off. It stays unticked for an ordinary restore. A migration does this staging by itself, so the box is not needed for one.

### Progress

The **Current restore** section names the step in progress, in this order: Checks before anything is touched (this includes the version rule below), Recording what is running now, Stopping the applications, Copying data back, Fetching application images, Adopting the saved configuration, Starting the core services, Applying the saved configuration to this server, Bringing the applications back, Restoring the databases, Bringing the applications up to date, Checking the stored files, Final checks, and Finished.

### A restore that stops part-way

The section reads "The restore stopped at:" followed by the step. Every step can be run again, so there are two ways forward:

- **Carry on:** choose the same backup and start it again; it continues from where it stopped. A different backup or scope is refused.
- **Start over:** press **Clear the stopped restore**, then start again from the beginning.

A second restore is refused while one runs ("A restore is already running on this server."), and a running restore cannot be cleared.

### Version rule

Each backup records the Catena version that made it. The restore compares it with the version the server runs:

- A snapshot **newer** than the server is refused, because newer database files do not open under an older database. The server is brought to the snapshot's version first, then the restore is retried.
- A snapshot **older** than the server needs an explicit upgrade choice. Without it the restore is refused and nothing is changed.
- Two versions that cannot be put in order are refused.

A refusal happens in the first step, before anything is touched.

## Rebuild a lost server on a new machine

When the original server is gone, a new server restores from the old server's backups. Only the recovery keyset is needed (see [Backups and S3 storage](/en/configuration/backups/#disaster-recovery-keyset)).

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

## Restore report

The **Restore report** panel (Catena Pro) shows evidence that backups restore: a local restore test with its recovery time, and the state of the offsite copy. The nightly maintenance runs the local test each night it is on; **Verify my backup can be restored** under **Actions** runs it on demand. A link to the report appears in the Current restore section.

## Migrate to another server

A migration copies almost everything while the old server keeps serving. Only the last few minutes are unavailable to the people using it, and that part does not grow with the amount of data. The move is started from the new server, after the old server has opened a time-limited window.

### Prerequisites

- The old server has Catena Pro or Catena Business. The new server needs no subscription of its own: the subscription key moves with the data.
- Both servers are on the same Catena version. A move between different versions is refused before anything is touched.
- Both servers are on the same private network (see [Admin access and tailnet](/en/configuration/admin-access/)). The move travels over it only.
- The old server's backup repository is saved on the new server (steps 3 to 5 of the previous section).
- No Cloudflare token has been entered on the new server. The move brings the old server's token, and a token entered first would take the old server's web address before the move starts.

### On the old server

1. Open the **Migration** panel.
2. Press **Allow this server to be migrated**. A one-time code appears below the button, once. It is not stored and cannot be shown again.
3. Pass the code to whoever runs the move.

The window closes on its own after 4 hours, five wrong codes close it too, and **Stop allowing migration** closes it at once. A lost code is replaced by pressing the button again, which also invalidates the old code. The window also closes once the move has handed the subscription key over.

### On the new server

1. Open **Restore** and go to **Move another server here**.
2. Enter **The other server's private-network address**: its address on the private network (an IP address), not its web address. The web address is what moves at the end, so it cannot reach the old server during the move.
3. Enter the **Pairing code**.
4. Set **Preparation passes** (1 to 5, default 1). Each extra pass copies only what changed since the previous one, which shortens the final unavailable period. One pass is enough unless a long delay is expected before the cut-over.
5. Tick "I understand the other server will be taken out of service and that this one will take over its web address." and press **Start the move**.

### What happens

1. Reaching the other server.
2. Copying the data across, and Getting this server ready to receive traffic. The old server still serves.
3. Pausing the other server's applications. The short unavailable window begins.
4. Taking its final backup, then Checking that backup. This is the last reversible step.
5. Taking the other server out of service. From here the old server does not put itself back.
6. Putting the data in place here, then Moving the web address here (the cut-over).
7. Final checks.

After the final checks the old server frees its activation of the subscription key, the new server activates it and then brings itself up to date, which turns on what the key unlocks (extra domains, schedules). Some services restart during that. **Settings** > **Subscription** shows the result. If freeing the old activation fails, it is freed in Polar's customer portal and the key is saved again on the new server.

### Calling it off

- Up to and including "Checking that backup", stopping the move puts the old server back into service by itself. Nothing has started on the new server and the web address still points at the old one.
- After "Taking the other server out of service", that no longer happens on its own, because the new server may already hold part of the data and starting both would have two servers writing to the same storage. The page reports that the old server is out of service and offers two ways: fix what failed and start the move again (it continues without copying everything a second time), or put the old server back.
- To put the old server back, use **Put it back into service** under **Put the other server back into service** on the new server's Restore page (the address and the pairing code are entered again), or **Put this server back into service** in the old server's own **Migration** panel. Its web address still points there, so it serves again as soon as it comes up.
- **Forget this move** clears the record of an unfinished move and changes nothing on either server.

After a completed move the old server is stopped, not erased. Its data and backups are untouched, so it can be kept until the new server has proven itself. Retiring it is a separate step that nothing in the move performs.

## Troubleshooting

| Message | Meaning |
|---|---|
| "Choose a backup to restore." | No row is selected. |
| "Confirm that applications may be unavailable before starting." | The confirmation box is not ticked. |
| "Select at least one application, or choose to restore everything." | Scope is limited to applications and none is ticked. |
| "A restore is running on this server. Wait for it to finish before moving another server here." | A migration cannot start during a restore. |
| "A move is already running on this server." | Wait for it, or use **Forget this move** if it is unfinished. |
| "The move could not be started." | The request was not accepted. Check the address (an IP address, not a name) and the pairing code, and that the window is open on the old server. |
| "The credentials were refused." | The repository details were not accepted. Check them against the recovery keyset. |
