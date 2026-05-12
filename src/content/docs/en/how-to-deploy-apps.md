---
title: "How to deploy apps (with per-department access control)"
description: "When you deploy a new app through Dokploy, you can control who can reach"
---

When you deploy a new app through Dokploy, you can control who can reach
it by adding labels to the compose file. The suite reads those labels
and provisions the right Keycloak groups + policies automatically —
you never touch Keycloak's API directly.

## What can I deploy?

Anything that ships a Docker Compose file works. Two good catalogs to
browse when you're deciding what to self-host:

- **[templates.dokploy.com](https://templates.dokploy.com)** — Dokploy's
  own catalog of one-click templates (install directly from Dokploy's
  UI by pasting the template ID). Curated, tested against Dokploy,
  actively maintained. Start here for common apps.
- **[openalternative.co](https://openalternative.co)** — a directory of
  open-source alternatives to popular SaaS (e.g., "Notion alternatives,"
  "Slack alternatives"). Each entry links to the project's repo + its
  self-hosting instructions. Wider selection but you do more vetting.
- **[awweso.me](https://awweso.me)** — a browsable, filterable front-end
  for the `awesome-selfhosted` GitHub list (1300+ projects). Shows
  GitHub-stars + recent-activity per entry, so you can tell at a glance
  which projects are healthy + popular. Broadest of the three.

Whatever you pick, the suite's labels (`vps.auth.groups`,
`vps.auth.mode`, `vps.auth.oidc`, `vps.auto-update`, `vps.homepage.*`)
apply on top — they gate access, wire SSO, tag updates, and populate
the dashboard regardless of where the compose came from.

Before deploying something new, check the **Templates** project in
Dokploy — we pre-seed a few fully-wired apps (see "Pre-configured
apps you can enable" below) that may already cover your need.

## Quick start

Deploying a new app (say, Paperless for your accounting team):

1. Log in to `admin.yourdomain.com` (Dokploy).
2. Create a new Application. Paste your compose file.
3. Add a `labels:` block (for access control) AND a `networks:` alias
   matching your Dokploy appName in lowercase-with-dashes form
   (`paperless` → `paperless`, `MyApp` → `myapp`, `My-App` → `my-app`).
   Traefik uses this alias to reach your container; without it the
   service returns 502.

   ```yaml
   services:
     paperless:
       image: paperlessngx/paperless-ngx:latest
       labels:
         - "vps.auth.groups=accounting"
       networks:
         dokploy-network:
           aliases:
             - paperless        # must match your Dokploy appName, lowercased
   networks:
     dokploy-network:
       external: true
   ```

4. Set the domain (e.g., `paperless.yourdomain.com`) in the Domains tab.
5. Deploy.

Within 5 minutes, `dashboard-sync` picks up the new app, creates the
`accounting` group in Keycloak (if it doesn't exist), wires the
forward-auth middleware, and makes the app reachable — but only for
users in `accounting`.

## Pre-configured apps you can enable

Dokploy ships with a **Templates** project on your VPS containing
ready-to-deploy apps that are wired correctly from the start —
authentication, SSO, storage, networking, labels, SSL are all
pre-configured. Click Deploy on the ones you want, Delete on the rest.

Full catalog with per-app notes: **[Pre-configured templates](/docs/en/apps/)**.

## Multi-container apps (example: Nextcloud)

A single-image app just needs the `dokploy-network` attachment shown
above. Once you have **more than one service** in the compose — a real
app like Nextcloud bundles Postgres and Redis alongside the web
process — the networking rule is:

- **Only the public-facing service** (the one Traefik should route to)
  joins `dokploy-network`. Adding it also to the compose's `default`
  network lets it talk to its siblings.
- **Internal services** (database, cache, cron worker) stay on the
  `default` network only. They don't need to be reachable by Traefik
  and putting them on `dokploy-network` would expose them to every
  other project on the host.

Worked example — Nextcloud with its own Postgres, Redis, and cron
sidecar:

```yaml
services:
  app:
    image: nextcloud:33.0.3-apache
    environment:
      POSTGRES_HOST: db
      POSTGRES_DB: nextcloud
      POSTGRES_USER: nextcloud
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: redis
      NEXTCLOUD_TRUSTED_DOMAINS: nextcloud.yourdomain.com
    volumes:
      - nc-data:/var/www/html
    labels:
      - "vps.auth.mode=private"
      - "vps.auth.groups=staff"
    networks:
      dokploy-network:          # Traefik reaches it here
        aliases:
          - nextcloud           # must match your Dokploy appName
      default: {}               # reach db, redis, cron via sibling names

  db:
    image: postgres:16.13-alpine
    environment:
      POSTGRES_DB: nextcloud
      POSTGRES_USER: nextcloud
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - default                 # NOT on dokploy-network — internal only

  redis:
    image: redis:7.4.9-alpine
    networks:
      - default

  cron:
    image: nextcloud:33.0.3-apache
    entrypoint: /cron.sh        # runs php -f cron.php every 5 min
    volumes:
      - nc-data:/var/www/html
    networks:
      - default

volumes:
  nc-data:
  db-data:

networks:
  dokploy-network:
    external: true
  # `default` is implicit and per-project; no top-level declaration needed.
```

**Why two networks on `app`, not just one**: if `app` joined only
`dokploy-network`, it could reach Traefik but not `db`, `redis`, or
`cron`. If it joined only `default`, Traefik couldn't see it and would
return 502. It needs both.

**Why `db`, `redis`, `cron` stay off `dokploy-network`**: every project
on this host shares that network. Keeping internal services on the
project's own `default` network means another project's containers
can't reach your Nextcloud database by guessing the service name —
Docker's network isolation does the work.

**Sibling addressing**: inside `app`, Postgres is reachable at
`db:5432` and Redis at `redis:6379` (this is why the env uses
`POSTGRES_HOST: db` and `REDIS_HOST: redis`). Docker's built-in DNS
resolves service names on the `default` network automatically.

## Apps that store lots of files

A few apps — Nextcloud is the canonical example — exist specifically to
hold large amounts of user data. A team using Nextcloud as a
workstation-sync replacement can easily accumulate hundreds of GB or
more.

That becomes a problem for backups. The nightly backup copies every
byte of app data into the off-site repository. At TB scale this takes
hours, costs real money in storage + egress, and makes a full restore
painfully slow.

For this class of app, ask the operator to deploy the **S3-backed
variant**: files live directly in an object-storage bucket you own,
not in a local volume on the VPS. The nightly backup only copies the
app's code and config (a few hundred MB), and the bucket handles file
history on its own.

What that changes for you:

- **Nothing in the app UI.** From your users' perspective the app
  looks exactly the same. Same login, same file browser, same
  everything.
- **Your backup is two things, not one.** The code + config + database
  still live in the operator's nightly backup; the files live in the
  S3 bucket (with 30-day undelete history built in). Both are things
  you own.
- **Restore is faster.** If the VPS burns down, your files survive
  independently — the new VPS just reconnects to the same bucket and
  every file is already there.

You don't provision any of this yourself; ask the operator when you're
planning a file-heavy deployment and they'll set it up following a
documented internal pattern.

## Keeping your apps up to date

Once a week, your VPS checks for newer versions of every image you've
deployed, pulls the ones that meet your policy, redeploys them, runs a
health check, and rolls back if the health check fails. You don't do
anything — it runs at 3 a.m., alerts the operator only if something
broke.

**But only apps pinned to a full version are managed.** The suite
refuses to touch anything where the image tag doesn't fully specify a
version. That's deliberate: an auto-update that can't roll back to a
known-good value is worse than no auto-update.

### Tag form determines eligibility

| Image tag                                    | Managed? |
|----------------------------------------------|----------|
| `nextcloud:30.0.2-apache`                    | ✓ yes    |
| `nextcloud:v30.0.2` (with or without `v`)    | ✓ yes    |
| `postgres:16.4.2-alpine`                     | ✓ yes    |
| `redis:7.4`                                  | ✗ no (partial pin) |
| `postgres:16-alpine`                         | ✗ no (partial pin) |
| `nginx:alpine`                               | ✗ no (floating) |
| `ubuntu:latest`                              | ✗ no (floating) |
| `myapp` (no tag)                             | ✗ no (floating, defaults to `latest`) |

If your tag is in the ✗ column, the image you deployed is the image
you'll keep running until you redeploy by hand. No security patches,
no bug fixes — and also no surprise rollback the night a bad release
ships. You own the upgrade schedule entirely.

### Choosing how aggressive updates are

On each public-facing service, the `vps.auto-update` label picks the
envelope of version changes the updater is allowed to apply:

```yaml
labels:
  - "vps.auto-update=patch"     # default — 1.2.3 → 1.2.9 (bug fixes only)
  - "vps.auto-update=minor"     # 1.2.3 → 1.9.0 (new features OK)
  - "vps.auto-update=major"     # 1.2.3 → 2.0.0 (breaking changes OK)
  - "vps.auto-update=off"       # freeze on whatever tag was deployed
```

Defaults, by service kind:

- **Client apps** (yours): `patch`. Conservative — bug fixes and
  security releases, no behavior change.
- **Operator infrastructure** (Keycloak, Dokploy, Traefik, Gatus,
  etc.): `patch+minor`. Operator watches these daily.

Unless you have a reason to change it, leaving the label unset on
your apps is the right call. You'll get security patches
automatically.

### What "auto-rollback" does in practice

After each bumped service, the updater runs a health baseline (same
check the nightly drill uses): is the container responding, is the
page returning 2xx/3xx, did the request time stay reasonable. If
anything fails, the tag is reverted to the prior good version,
redeployed, and the operator gets a ntfy alert with the service name
and the bad version. Next week's run remembers the bad version and
skips it — you won't rattle into the same broken release repeatedly.

If you want to see what's pending / what rolled back / what's
quarantined: the Gatus status dashboard shows the running version
on every service card, so a stale pin is visible at a glance.
OliveTin has `Show managed-update status` for the full rollup
(failed bumps, quarantined versions, next scheduled run).

### When all of this matters

Ship a real `X.Y.Z` tag on every public-facing service. If your
upstream only publishes `:latest` or `:stable`, either pin to a
digest + bump manually, or accept that you're opting out of the
safety net. The suite's `compose-lint` catches non-semver tags at
deploy time and reminds you; the Gatus status page shows the
concrete running version per service so drift is easy to spot.

## The `vps.auth.*` label reference

### `vps.auth.groups=<csv>`

Comma-separated list of Keycloak group names that can access the app.
Any user in ANY listed group passes (OR semantics, matches the
`app_proxy_gate` helper).

**Examples:**

```yaml
labels:
  - "vps.auth.groups=accounting"                    # only accounting
  - "vps.auth.groups=accounting,engineering"        # either department
  - "vps.auth.groups=administrators"                # admins only (equivalent to vps.auth.mode=admin-only)
  - "vps.auth.groups=client-staff"                  # everyone in client-staff (baseline)
```

**Auto-creation.** If a group name is not yet in Keycloak, dashboard-sync
creates it (empty) on next run. Operator (or anyone with Keycloak admin
access) adds members via the Keycloak UI. The app will 403 until at
least one user is assigned.

**Removal.** If you delete an app from Dokploy, dashboard-sync removes
its Keycloak provider + application + policybindings. Groups with
members are preserved; empty groups with no app references are cleaned
up.

### `vps.auth.mode=<mode>`

Pick the access posture. Mutually exclusive with `vps.auth.groups` on
the same service (use one OR the other).

| Mode | Meaning |
|---|---|
| `private` | Gate behind Keycloak; users in `client-staff` can reach. Default if unset. |
| `admin-only` | Gate behind Keycloak; users in `administrators` can reach. Equivalent to `vps.auth.groups=administrators`. |
| `public` | Skip Keycloak entirely. App is reachable by anyone with the URL. Use ONLY for truly-public services (marketing site, landing page). |

**Default posture (no labels).** An app deployed without `vps.auth.*`
labels falls through to the domain catchall, which is bound to the
`administrators` group. In practice this means: *unlabeled apps are
admin-only, not everyone-who-logged-in.* This is secure-by-default —
you have to explicitly opt in to wider access.

**Why `mode=private` differs from "no labels".** With no labels at all,
the app has no per-app Keycloak application/provider; it falls through
to the catchall (admins only). With `vps.auth.mode=private`, dashboard-
sync creates a dedicated Keycloak app + provider + binding to
`client-staff`, so anyone in `client-staff` can reach it. Pick `private`
(or an explicit `vps.auth.groups=...`) the moment a non-admin needs
access.

## What dashboard-sync does for you

Every 5 minutes (via systemd timer), `dashboard-sync.service`:

1. Queries Dokploy's API for all running apps with domains.
2. For each app, parses its compose labels.
3. Reconciles Keycloak:
   - Ensures the listed groups exist.
   - Ensures the app has a `forward_single` proxy provider + Application.
   - Ensures policy bindings match the current `vps.auth.groups` list.
   - Attaches the provider to the embedded outpost.
4. Writes the Traefik dynamic route file (`*-auto-keycloak.yml`) LAST,
   so if any Keycloak step fails, the route is not written and the app
   remains unreachable (fail-closed, not fail-open).

## Failure modes worth knowing

- **Keycloak API unreachable during sync.** Dashboard-sync logs the
  error, does not write the Traefik route, tries again next tick. App
  stays 404 until Keycloak recovers.
- **You typo'd a group name.** A group with that name gets auto-created
  (empty). You'll notice because the app 403s. Fix: rename the group in
  Keycloak UI, or fix the label in Dokploy and re-deploy.
- **You removed the label but kept the app.** On next sync, policy
  bindings collapse to `administrators` (catchall). No one except admins
  can reach it. Intentional — failing closed.
- **Two apps with the same hostname but different groups.** The last-
  written policy binding wins. Don't do this; give each app a unique
  hostname.

## Self-service sanity checks

- `https://auth.yourdomain.com` → Directory → Groups. Your defined
  groups show here. Add/remove members through the UI.
- `https://admin.yourdomain.com` → your app → Logs. After deploy,
  logs show Keycloak forward-auth hits (203 → inject headers → upstream).
- `https://monitor.yourdomain.com` (Gatus). Your app gets
  an entry in the `client-apps` group within ~5 min, probed every 60s.
  If it's red, either the app is down OR the sync hasn't run yet.

## Out of scope

These labels control *authentication* (who can reach the app). They do
NOT control *authorization* (what users can do within the app). Apps
that support their own permission model (Paperless users, Dokploy
roles, etc.) keep using that model; Keycloak just gates the door.

## Forward-auth vs. OIDC

The labels above (`vps.auth.groups`, `vps.auth.mode`) wire
**forward-auth**: Keycloak sits in front of your app at the
Traefik layer and only passes signed-in users through. The app
itself doesn't need to know about Keycloak — it just receives
authenticated traffic. This is the **default, always-on** path
and works for any app.

Apps that speak **OIDC natively** (Grafana, Gitea, n8n, Keycloak,
Vault, Nextcloud, Harbor, and many others) can additionally read
the signed-in user's identity and group memberships directly from
Keycloak. This unlocks per-user permissions *inside* the app — who
can edit vs. view a dashboard, who can approve a PR, etc. — and
proper sign-out.

**OIDC is additive, not a replacement.** When you enable it:
- Forward-auth stays in front of the app (the security gate doesn't
  change).
- An OIDC client is additionally provisioned so the app can ask
  Keycloak "who is this signed-in user?" once the user is through
  the gate.
- If you get OIDC wiring wrong, the gate still holds — at worst the
  app's "Sign in with Keycloak" button doesn't appear or fails,
  but the app stays reachable and protected.

The rest of this section walks through the full process.

### Enabling OIDC: step-by-step

#### 1. Look up your app's OIDC requirements

Two pieces of information, pulled from **your app's own
documentation**:

- **Redirect URI (callback path):** the URL your app redirects
  users to after Keycloak signs them in. App-specific.

  | App | Typical callback path |
  |---|---|
  | Grafana | `/login/generic_oauth` |
  | Gitea | `/user/oauth2/<provider-name>/callback` |
  | n8n | `/rest/sso/oauth2/callback` |
  | Harbor | `/c/oidc/callback` |
  | Vault | `/ui/vault/auth/oidc/oidc/callback` |
  | Keycloak (federating Keycloak) | `/auth/realms/<realm>/broker/<alias>/endpoint` |

- **OIDC environment variable names your app reads.** Every app
  names its OIDC env vars differently. Some prefix examples:

  | App | OIDC env var prefix |
  |---|---|
  | Grafana | `GF_AUTH_GENERIC_OAUTH_*` |
  | n8n | `N8N_SSO_OIDC_*` |
  | Harbor | `HARBOR_OIDC_*` (plus server config) |
  | Gitea | CLI-based, no env vars |

  If your app doesn't appear above, search its documentation for
  "OIDC" or "OpenID Connect" — the env var names are usually listed
  on its auth-configuration page.

#### 2. Add three labels to your compose service

```yaml
labels:
  - "vps.auth.oidc=true"
  - "vps.auth.groups=staff"       # who can sign in via this app
  - "vps.auth.oidc.redirect_uris=https://myapp.yourdomain.com/login/generic_oauth"
```

- `vps.auth.oidc=true` — enables OIDC provisioning for this
  service.
- `vps.auth.groups=<csv>` — same label as forward-auth. Defines
  who can sign in via OIDC (reuses the existing group semantics).
- `vps.auth.oidc.redirect_uris=<url>` — the callback URL you
  looked up in step 1. Required; without it, OIDC isn't
  provisioned. Multiple comma-separated URLs are allowed if your
  app needs more than one.

#### 3. Map injected variables to your app's env var names

Within the next ~5 minutes, `dashboard-sync` will:

- Create an OAuth2 client application in Keycloak.
- Mint a client ID + client secret.
- Inject these four variables into your compose's environment:
  - `OIDC_CLIENT_ID`
  - `OIDC_CLIENT_SECRET`
  - `OIDC_ISSUER_URL`
  - `OIDC_REDIRECT_URL`

These are **deliberate, operator-controlled variable names** — not
a standard your app will read directly. You need to add lines to
your service's `environment:` block that map these to whatever
your app expects, using Docker Compose's `${...}` substitution.

Here's the complete Grafana compose as a reference:

```yaml
services:
  app:
    image: grafana/grafana:12.0.0
    labels:
      - "vps.auth.oidc=true"
      - "vps.auth.groups=staff"
      - "vps.auth.oidc.redirect_uris=https://grafana.yourdomain.com/login/generic_oauth"
      - "vps.auto-update=patch"
    environment:
      # Grafana's own OIDC config, sourced from the sync-injected vars:
      GF_AUTH_GENERIC_OAUTH_ENABLED: "true"
      GF_AUTH_GENERIC_OAUTH_NAME: Keycloak
      GF_AUTH_GENERIC_OAUTH_ALLOW_SIGN_UP: "true"
      GF_AUTH_GENERIC_OAUTH_CLIENT_ID: ${OIDC_CLIENT_ID}
      GF_AUTH_GENERIC_OAUTH_CLIENT_SECRET: ${OIDC_CLIENT_SECRET}
      GF_AUTH_GENERIC_OAUTH_AUTH_URL: ${OIDC_ISSUER_URL}authorize/
      GF_AUTH_GENERIC_OAUTH_TOKEN_URL: ${OIDC_ISSUER_URL}token/
      GF_AUTH_GENERIC_OAUTH_API_URL: ${OIDC_ISSUER_URL}userinfo/
      GF_AUTH_GENERIC_OAUTH_SCOPES: "openid email profile groups"
    networks:
      dokploy-network:
        aliases: [grafana]
networks:
  dokploy-network:
    external: true
```

The `${...}` syntax is standard Docker Compose variable
substitution. Docker reads the value from the compose's env block
(populated by dashboard-sync) and substitutes it into the
container's environment at start time.

#### 4. Save + wait for redeploy

Saving the compose in Dokploy triggers a redeploy. On the next
sync tick, dashboard-sync updates the env block and Dokploy
redeploys the app one more time with the populated values. After
that, sign into the app's front page — you should see a "Sign in
with Keycloak" button (label app-specific). Click it, authorize,
you're in.

### Verifying it works

- **App UI:** the app shows an SSO button and clicking it signs you
  in without a second prompt (assuming you already signed in to
  another app this session — Keycloak keeps you signed in across
  apps).
- **Keycloak admin UI** (`auth.yourdomain.com`) → Directory →
  Applications: you'll see two entries per OIDC-enabled app — one
  for the forward-auth gate, and `<name> (OIDC)` for the OIDC
  client.

### Common mistakes

- **Forgot the `${...}` substitution.** The sync injects the vars,
  but your app doesn't see them because your service environment
  doesn't reference them. Symptom: no SSO button appears in the
  app. `compose-lint` warns about this at deploy time.
- **Wrong `redirect_uris` value.** Keycloak shows "Invalid
  redirect_uri" mid-flow. Fix: re-check your app's docs for the
  exact callback path, update the label, save.
- **User not in `vps.auth.groups`.** Keycloak shows "Permission
  denied" during the consent screen. Fix: add the user to the
  group in Keycloak's Directory → Groups, or widen the label's
  groups list.
- **Hardcoding values instead of using `${...}`.** If you paste
  the actual client_id/secret directly into your service
  environment instead of referencing them, your app will work
  once but break on secret rotation. Always use the `${...}`
  form.

### Disabling OIDC

Remove the `vps.auth.oidc=true` label (the other two OIDC labels
can stay — they're harmless without the switch). On the next
sync tick, dashboard-sync tears down the Keycloak OIDC
application + provider, stops injecting the env vars, and the app
reverts to forward-auth-only. You can then remove the
`${OIDC_*}` lines from your service environment.

### Out of scope

Apps that configure OIDC through **config-file edits** rather
than env vars — OliveTin (YAML), Nextcloud (`config.php`),
Jellyfin (XML plugin config), Vaultwarden (hashed-file) — aren't
covered by this label flow. For those, ask your operator to wire
them manually.

## Customize how your app appears on the dashboard

The Homepage dashboard at
[`dash.yourdomain.com`](https://dash.yourdomain.com)
gets a tile for every deployed app. Four optional labels let you
tweak presentation without operator involvement:

```yaml
services:
  myapp:
    image: myapp:1.2.3
    labels:
      - "vps.homepage.name=Staff portal"
      - "vps.homepage.icon=mdi-briefcase"
      - "vps.homepage.description=Client-facing case tracker"
      - "vps.homepage.hidden=false"
```

- **`vps.homepage.name`** — tile label. Defaults to the app's
  Dokploy name if unset.
- **`vps.homepage.icon`** — any [Material Design Icon](https://pictogrammers.com/library/mdi/)
  name (prefix `mdi-`) or a full URL to an image.
- **`vps.homepage.description`** — one-line tagline under the name.
- **`vps.homepage.hidden=true`** — hide the app from the dashboard
  entirely (still deployed, still works at its URL — just not
  listed). Useful for background services you don't want staff to
  click on.

Changes apply on the next dashboard-sync run (every 5 minutes), or
click "Sync all" in OliveTin to force a refresh immediately.

That's the whole customization surface by design. If you need more
than this — a different group, a custom URL, per-user visibility —
ask your operator; those need operator-side configuration.

## Override how your app appears on the Gatus status page

By default, the Gatus card for your app shows the container image's
short name plus its version — e.g., `paperless-ngx 2.12.3`. When the
image's short name doesn't reflect what your app *is*
(common when a container wraps something else — e.g., nginx serving a
pre-rendered static site), set a compose label:

```yaml
services:
  myapp:
    image: nginx:1.29.8-alpine
    labels:
      - "vps.display-name=my-static-site"
```

The Gatus card title becomes `my-static-site`, keeping the
`group • domain` subtitle line unchanged. The override is purely
for the visible name; it does not affect the version-check or
auto-update machinery.
