---
title: "Server settings"
description: "Time zone and locale, the bulk storage share account, bringing the server up to date with its stored configuration, and where the disaster-recovery keyset lives."
---

## Time zone and locale

**Settings** > **Time zone and locale** sets the server's clock zone and the locale of its command-line sessions. They decide what logs and scheduled jobs are stamped with. They do not change the language of the panel, which each visitor picks.

| Field | Content |
|---|---|
| **Time zone** | A zone from the server's list. Default `America/Toronto`. |
| **Locale** | Default `en_CA.UTF-8`. Options: English (Canada), French (Canada), English (United States), English (United Kingdom), French (France), German (Germany), Spanish (Spain), Italian (Italy), Dutch (Netherlands), Portuguese (Brazil), Neutral (C). |

The section ends with **Save and apply**. A name that is not a time zone is refused: "A time zone name such as America/Toronto." Schedules follow the server's time zone, so a change here shifts the clock time at which they run. See [Schedules](/en/configuration/schedules/).

## Bulk storage share

**Settings** > **Bulk storage share (Windows/CIFS)** is for a server set up at install to mount a bulk storage share from a NAS over CIFS, the Windows file-sharing protocol. It holds the account that opens the share:

- **Bulk storage username (Windows share)**
- **Bulk storage password (Windows share)**

A share mounted over NFS needs none, and a server with no share leaves both blank. The mount itself is part of the server's installation, so a change here takes effect when the installation is applied again (`uvx catena-installer install --inventory <name>`, safe to rerun). The section has a plain **Save**; nothing restarts. The password is stored and never shown again.

## Server configuration

**Settings** > **Server configuration** brings the server back to the configuration it was set up with. Anything that has drifted since is put back; anything already correct is left alone. Data is not touched.

### What it shows

- **Last brought up to date**: a timestamp, or "not yet".
- **On a schedule**: "Yes, on the schedule set in Schedules." or "No. It happens when started here."
- While running: "Bringing this server up to date." Some services restart meanwhile, so parts of the server may be briefly unavailable. The work continues even if the page is closed.
- "This server is paused for maintenance, so it was left as it is. It resumes on its own once the maintenance ends."
- After a failure: "The last attempt did not finish. This server is still running on the configuration it had before, and nothing was left half-applied." A log of the attempt is folded under "What the server recorded during this attempt".

### Run it

1. Read the warning: "Services restart as they are brought back to their intended configuration, so parts of this server are briefly unavailable. Data is not touched."
2. Tick "I understand that services restart and are briefly unavailable."
3. Press **Bring this server up to date**.

The form is hidden while a run is in progress or when the server cannot be asked.

### When to use it

- After a section reports "Saved, but applying it did not start, most likely because the server is already updating its configuration."
- After attaching or removing an extra domain, or after a subscription starts or lapses, so that what it unlocks is switched on or off.
- When the People panel reports it has no directory credential yet.
- To repair a drifted service without reinstalling.

### Files managed by Catena

Files that Catena manages on the server are put back to their intended content on every run, so hand edits to them do not survive. Settings meant to be changed are changed in the panel instead, where the value is stored and survives the run. Lines added by hand to the `ops` account's authorized SSH keys are the exception: they stay. See [Admin access and tailnet](/en/configuration/admin-access/).

The run is not limited to the panel: the same configuration can also run on a schedule. See [Schedules](/en/configuration/schedules/).

## Disaster-recovery keyset

The keyset (backup repository address, storage keys and backup encryption password) that rebuilds the server on a new machine is shown and managed on the backups page: see [Backups and S3 storage](/en/configuration/backups/). Viewing it is recorded in the server's administrative log.

## Troubleshooting

- A section reports that applying did not start: another configuration run is in progress. Wait for it to finish, then press **Bring this server up to date**.
- The last attempt failed: read the log under "What the server recorded during this attempt". The server keeps its previous configuration, and running again is safe.
- A time zone is refused: use the exact name, for example `America/Toronto`.
