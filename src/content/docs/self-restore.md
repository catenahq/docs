---
title: "Restore to a fresh VPS (without the operator)"
description: "If your operator is unavailable and you need to move your software suite to a"
---

If your operator is unavailable and you need to move your software suite to a
different VPS, this page walks you through doing it manually with the
same building blocks your operator uses. It takes a few hours. You own
your data; this is the fallback path.

## Fast path — automated recovery script

If you have the credentials listed in the next section ready, you can
skip the manual steps below and run a single script that does steps 1
through 7 in sequence. From the fresh VPS as root:

```
curl -fsSLo restore.sh https://docs.yourdomain.com/restore.sh
chmod +x restore.sh
sudo ./restore.sh
```

The script prompts for each credential, checks the restic repo is
reachable, restores the latest snapshot, installs Dokploy, replays
per-app Postgres dumps, and (optionally) installs cloudflared with
your tunnel token. Idempotent on partial failures — re-run after
fixing whatever broke and it picks up where it left off.

If you prefer to walk through the steps by hand (or you hit
something the script doesn't handle cleanly), the manual procedure
follows.

## What you need before you start

- A fresh VPS (any provider — OVH, Hetzner, DigitalOcean, AWS). 2 vCPU /
  6 GB RAM / 40 GB disk matches the starting tier and runs the base
  suite. With more services deployed or under sustained load, step up
  to 4 vCPU / 8 GB RAM / 80 GB disk. Heavy apps like ERPNext want the
  larger tier on their own.
- Root SSH access to that VPS.
- From your password manager or your operator:
  - the **restic repository encryption password**
  - the **S3 access key** and **secret key** that point to the backup bucket
  - the restic repo URL (looks like
    `s3:s3.<region>.provider.example/<bucket>`)
- Familiarity with SSH + a terminal. No Ansible required.

## Step 1 — Prepare the new VPS

```bash
ssh root@NEW-VPS-IP
apt update && apt upgrade -y
apt install -y restic curl ca-certificates
mkdir -p /mnt/data
```

Don't install Docker here — Step 4 below runs Dokploy's official
installer (`curl -sSL https://dokploy.com/install.sh | sh`) which
installs the correct Docker version, initializes Docker Swarm, and
brings up Traefik in one shot. Installing Docker first leads to a
mismatched setup that Dokploy then has to fight.

If your backup set expects `/mnt/data` to be on a separate volume, attach
one via your provider's console and mount it there. Otherwise a
directory on root works.

## Step 2 — Configure restic credentials

```bash
export RESTIC_REPOSITORY='s3:s3.<region>.provider.example/<bucket>'
export RESTIC_PASSWORD='<repository-encryption-password>'
export AWS_ACCESS_KEY_ID='<s3-access-key>'
export AWS_SECRET_ACCESS_KEY='<s3-secret-key>'
```

Verify the repo is reachable:

```bash
restic snapshots --latest 5
```

You should see a list of snapshots (one per night). If not, check that
the repository URL and password match what the operator gave you.

## Step 3 — Restore the latest snapshot

```bash
restic restore latest --target /
```

This walks every file in the snapshot back into its original path on the
new host. Expect 5–30 minutes depending on bucket size and bandwidth.

After it finishes, your VPS has:

- `/etc/dokploy/` — Dokploy configuration
- `/mnt/data/docker/volumes/` — every app's persistent data (Postgres
  databases, Redis, uploads)
- `/mnt/data/apps/` — per-app compose project files
- `/mnt/data/backup-staging/pg/` — nightly SQL dumps, one per Postgres
  container
- `/etc/ssh`, `/etc/ufw`, `/etc/fstab` — system configuration
- `/etc`, `/var/lib/dpkg`, `/usr/local/bin` — package state + helper
  scripts

## Step 4 — Install Dokploy

Follow Dokploy's own install instructions:
<https://dokploy.com/docs/core/installation>. In short:

```bash
curl -sSL https://dokploy.com/install.sh | sh
```

It initializes Docker Swarm, deploys Traefik, and brings up the Dokploy
control plane. Port 3000 is the admin UI.

Because `/etc/dokploy/` and `/mnt/data/docker/volumes/` are already
restored, Dokploy will reconnect to the existing Postgres volume on
startup.

!!! warning "Postgres password"
    Dokploy's install script generates a new random password for its
    internal Postgres. The restored database has the OLD password baked
    in. If login fails, align them with:

    ```bash
    PG_CTR=$(docker ps --format '{{.Names}}' | grep dokploy-postgres | head -1)
    NEW_PW=$(docker exec "$PG_CTR" cat /run/secrets/postgres_password)
    docker exec -u postgres "$PG_CTR" psql -U dokploy -d postgres \
        -c "ALTER USER dokploy WITH PASSWORD '$NEW_PW';"
    ```

    (Your operator's automation avoids this step by pre-seeding the
    secret from their vault.)

## Step 5 — Replay per-app Postgres dumps

Each app's database was also dumped as SQL nightly and restored in step
3. For each application container that runs Postgres, once the
container is up via Dokploy:

```bash
for dump in /mnt/data/backup-staging/pg/*.sql.gz; do
    ctr=$(basename "$dump" | sed -E 's/-[0-9]+T[0-9]+Z\.sql\.gz$//')
    if docker ps --format '{{.Names}}' | grep -Fxq "$ctr"; then
        echo "Replaying $dump into $ctr"
        zcat "$dump" | docker exec -i "$ctr" psql -U postgres -v ON_ERROR_STOP=0
    fi
done
```

The raw volume in `/mnt/data/docker/volumes/` is usually sufficient; the
SQL dumps are a fallback for the "raw volume is corrupt or from a
different Postgres version" case.

## Step 6 — Reprovision the public gateway

The Cloudflare Tunnel's **tunnel ID + credentials** are not in the
restic backup (they bind to a specific server at provisioning time).
Recreate:

1. In the Cloudflare dashboard, delete the old tunnel for this zone.
2. Create a new tunnel, copy the token.
3. Point the DNS CNAMEs (`auth.<zone>`, `apps.<zone>`, `monitor.<zone>`,
   etc.) at the new tunnel's public hostname.
4. Install `cloudflared` on the new VPS and start it with the token:

    ```bash
    cloudflared service install <token>
    ```

If you prefer the Swarm-deployed `cloudflared` your operator uses,
consult `/root/README.md` on the restored VPS — it has the exact command
baked in. Note that the Swarm-deployed variant runs as a Docker service
attached to the `dokploy-network` so it can reach your apps' internal
hostnames; the standalone `cloudflared service install <token>` above
runs as a system service and reaches them via the host network. Either
works; the Swarm version is what your operator's automation rebuilds and
the one to pick if you plan to hand the server back to them later.

## Step 7 — Sanity check

Visit:

- `https://auth.<zone>` → Keycloak login page, your existing users
  should work
- `https://apps.<zone>` → Dokploy dashboard, all your compose projects
  visible (may show "stopped" — click Deploy on each once to start them)
- `https://<your-app>.<zone>` → the app itself

If all three load, you have your data back.

## If you use Nextcloud with S3 storage

Some file-heavy apps — Nextcloud being the common one — store their
files in a separate S3 bucket, not in the restic repo. If your
operator deployed Nextcloud this way:

- The restic tarball **does not contain your Nextcloud files**. It
  contains the Nextcloud app code, config, and database, but the file
  bytes live in the S3 bucket your operator provisioned in your
  cloud account.
- When the restored Nextcloud container starts up, it reconnects to
  the same bucket using credentials stored in the configuration — no
  separate restore needed.
- If you intentionally rotated the S3 credentials after the backup,
  update the Nextcloud env vars in Dokploy's environment UI before
  deploying, otherwise the app will come up but every file will
  appear broken.
- The bucket itself survives independently of the VPS. If you ever
  wanted to download every file manually, the bucket is readable
  with any S3-compatible tool (`aws s3 sync`, `rclone`) using those
  same credentials.

## When in doubt — call your operator back

This page exists so you are never stuck. But the scripted flow
(`./catena restore && ./catena site`) your operator runs replaces every
step above with a single two-command sequence and handles the
Postgres-password alignment, the Dokploy redeploys, and the Cloudflare
tunnel re-provisioning automatically. If you can reach your operator,
their automation is faster and less error-prone than the manual path.

## Keep an offline copy

If your server is down and you need this page to bring it back up, the
docs site won't help. Save the pages you'd want during a
disaster (this one + [Disaster recovery](/docs/disaster-recovery/) +
[Where is my data](/docs/where-is-my-data/)) to your laptop with
your browser's "Save Page As..." (or print them to PDF) at hand-off
and refresh once a year.
