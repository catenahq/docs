---
title: "Single sign-on"
description: "One account for every app, with groups deciding who can open what, enforced in front of the apps."
---

One account signs in to every app. Groups decide who can open what, and the check happens in front of each app by a gate, so apps with no login of their own are still protected. Staff see only the apps they may open; administrators see everything.

## How it works

- **Keycloak** holds a single realm and is the only login page, at `auth.yourdomain.com`. Registration is off, the email address is the username, duplicate emails and username edits are refused, and brute-force protection is on.
- **Groups.** `admin` is appended to every gated app's allow-list. `staff` holds departments as subgroups. `client` is the default group for new accounts. `visitor` is a label meaning public and never appears in a sign-in token. The panel's own admin check is the `admin` group.
- **Per-app gate.** Each gated app, and each admin tool (Portainer, the status page, the job monitor, the resource graphs), gets its own sign-in proxy with its own allowed groups and its own session cookie, kept on that address alone. A cookie seen by one app or tool opens no other. A person still enters the password once: each new app or tool sends the browser through Keycloak, which recognises the open session. An app with no declared access is denied to everyone except administrators.
- **Catalog apps.** Outline, Rocket.Chat, EspoCRM, Zammad, Immich and Element offer **Sign in with Keycloak** with no step to take: within a few minutes of the first deploy, Catena creates the app's own sign-in entry in Keycloak and the app restarts once with it. Nextcloud gets its entry the same way and is then wired with the **Wire Nextcloud OIDC** action. The mail server's webmail is set up with the server. Windshift gets its sign-in entry the same way, and its administrator adds the provider once in Windshift's own admin screen. DocuSeal, Plane and Twenty have no single sign-on in their free editions and keep their own login. Each app's template page lists its steps. Who may sign in through an app's own button follows the app's groups: administrators only, staff and administrators, or every account when the `client` group is allowed.
- **Apps outside the catalog.** For an app that needs native OIDC login, you set the `vps.auth.oidc` labels in its compose file: Catena then creates the app's own sign-in entry in Keycloak and puts its id, secret and issuer in the app's environment (see [Sign in with Catena accounts](/en/configure-apps/#sign-in-with-catena-accounts-optional)). On the app's tile, you see whether that sign-in is ready, waiting or failed; staff see an OIDC badge.
- **Second factor.** **Settings** > **Sign-in requirements** switches between **Password only** and **Password and an authenticator app**. The default is password only, and the change applies to existing accounts at their next sign-in.
- **Keycloak's own console.** The admin of `auth.yourdomain.com/admin` sets up a one-time code at first sign-in and enters it every time after; repeated wrong passwords lock the account for up to 15 minutes. A `vps` realm you switch off stays off across updates. See [Sign-in and people](/en/configuration/sign-in-and-people/).
- **Email.** Password reset and invitations need **Settings** > **Outgoing mail** (Resend, Brevo or a custom SMTP server). With no outgoing mail, password-reset email is off.
- **Panel sign-in.** You sign in to the panel with the local admin email and the admin password shown once at install, in addition to the gate.

## People and audit trail

The **People** panel manages accounts and groups from the admin panel: create, rename and delete groups, add people, disable accounts. Before a group is renamed or deleted, the panel lists every app it would stop admitting people to and who holds it, and the confirmation matches the impact shown. Every administrative action is written to a hash-chained, signed log on the server; the **Audit log** panel shows, exports and verifies it.

## What each edition adds

Single sign-on, groups and the chain-writing audit trail are in Community. Catena Pro adds the **People** panel and several domains, each with its own sign-on. Catena Business adds the **Audit log** panel. See the [edition comparison](https://catena.run/en/#pricing).

## Limits

- Users and groups are your data: a server configuration update never re-imports them.
- Renaming a group in Keycloak without the **People** panel gives no impact preview.
- Panel sign-in is the local admin account, not a Keycloak user.

## Configuration

- [Sign-in and people](/en/configuration/sign-in-and-people/)
- [Outgoing email](/en/configuration/email/)
- [Subscription](/en/configuration/subscription/)
