---
title: "Server settings"
description: "Time zone and locale, the bulk storage share account, applying the saved settings to the server, and where the disaster-recovery keyset lives."
---

## Time zone and locale

**Settings** > **Time zone and locale** sets the server's clock zone and the locale of its command-line sessions. They decide what logs and scheduled jobs are stamped with. They do not change the language of the panel, which each visitor picks.

| Field | Content |
|---|---|
| **Time zone** | A zone from the server's list. Default `America/Toronto`. |
| **Locale** | Default `en_CA.UTF-8`. Options: English (Canada), French (Canada), English (United States), English (United Kingdom), French (France), German (Germany), Spanish (Spain), Italian (Italy), Dutch (Netherlands), Portuguese (Brazil), Neutral (C). |

The section ends with **Save and apply**. A name that is not a time zone is refused: "A time zone name such as America/Toronto." Schedules follow the server's time zone, so a change here shifts the clock time at which they run. See [Schedules](/en/configuration/schedules/).

## Bulk storage share

**Settings** > **Bulk storage share (Windows/CIFS)** is for a server you set up at install to mount a bulk storage share from a NAS over CIFS, the Windows file-sharing protocol. It holds the account that opens the share:

- **Bulk storage username (Windows share)**
- **Bulk storage password (Windows share)**

A share mounted over NFS needs none, and a server with no share leaves both blank. The mount itself is part of the server's installation, so a change here takes effect when you apply the installation again (`uvx catena-installer install --inventory <name>`, safe to rerun). The section has a plain **Save**; nothing restarts. The password is stored and never shown again.

## Server configuration

**Settings** > **Server configuration** applies the settings saved on this page to the server, and puts back anything that changed on the server since. Settings already in place are left alone. The settings sections that need it start this by themselves when saved.

### What it shows

- **Last applied**: a timestamp, or "not yet".
- **On a schedule**: "Yes, on the schedule set in Schedules." or "No. It happens when started here."
- While running: "Applying the saved settings to the server." Some services restart meanwhile, so parts of the server may be briefly unavailable. The work continues even if you close the page.
- While the server checks itself after applying: "The settings are applied. The server is checking itself; other changes wait until it ends."
- After that check fails: "The settings were applied, and the check of the server afterwards failed at: {step}. The sections it concerns read Failed; the log is below. Applying again checks it again."
- After a failure: "The last attempt stopped at: {step}. What it applied before that step stays applied, and the log is below. Applying again is safe." When no step is known, the text reads "The last attempt did not finish. What it applied before that stays applied, and the log is below. Applying again is safe." A log of the attempt is folded under "What the server recorded during this attempt".
- While a later run is in progress, the step and the log of the last failed attempt stay shown under "The previous attempt stopped at this step:" and "What the server recorded during the previous attempt".

### Run it

1. Read the warning: "Services restart as they are brought back to their intended configuration, so parts of this server are briefly unavailable. Data is not touched."
2. Tick "I understand that services restart and are briefly unavailable."
3. Press **Apply the saved settings**.

The form is hidden while a run is in progress or when the server cannot be asked.

### When to use it

- After a section reports "Saved, but applying it did not start, most likely because the server is already updating its configuration."
- After you attach or remove an extra domain, or after your subscription starts or lapses, so that what it unlocks is switched on or off.
- When the People panel reports it has no directory credential yet.
- To repair a drifted service without reinstalling.

### Files managed by Catena

Files that Catena manages on the server are put back to their intended content on every run, so hand edits to them do not survive. Change settings meant to be changed in the panel instead, where the value is stored and survives the run. Lines you add by hand to the `ops` account's authorized SSH keys are the exception: they stay. See [Admin access and tailnet](/en/configuration/admin-access/).

The run is not limited to the panel: the same configuration can also run on a schedule. See [Schedules](/en/configuration/schedules/).

## Disaster-recovery keyset

The keyset (backup repository address, storage keys and backup encryption password) that rebuilds the server on a new machine is shown and managed on the backups page: see [Backups and S3 storage](/en/configuration/backups/). Viewing it is recorded in the server's administrative log.

## Troubleshooting

- A section reports that it will apply the change as soon as the running update finishes: nothing to do, the server applies it in one more run right after.
- A section reports that applying did not start: it could be neither started nor queued behind the configuration run in progress. Wait for that run to finish, then press **Apply the saved settings**.
- The last attempt failed: read the step and the log under "What the server recorded during this attempt". What it applied before the step stays applied, and applying again is safe.
- A section reads Failed and its hint links here: the server's check of that section failed after the last run. The step and the log are in this section; applying again checks it again.
- A time zone is refused: use the exact name, for example `America/Toronto`.
