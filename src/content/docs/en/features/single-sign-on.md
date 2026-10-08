---
title: "Single sign-on"
description: "One account for every app, with groups deciding who can open what, enforced in front of the apps."
---

One account signs in to every app. Groups decide who can open what, and the check happens in front of each app by a gate, so apps with no login of their own are still protected. Staff see only the apps they may open; administrators see everything.

## How it works

- **Keycloak** holds a single realm and is the only login page, at `auth.yourdomain.com`. Registration is off, the email address is the username, duplicate emails and username edits are refused, and brute-force protection is on.
- **Groups.** `admin` is appended to every gated app's allow-list. `staff` holds departments as subgroups. `client` is the default group for new accounts. `visitor` is a label meaning public and never appears in a sign-in token. The panel's own admin check is the `admin` group.
- **Per-app gate.** Each gated app gets its own sign-in proxy with its own allowed groups. One session is shared, so a person signs in once and moves between apps. An app with no declared access is denied to everyone except administrators.
- **Catalog apps** come with their Keycloak client already made. For an app outside the catalog that needs native OIDC login, you create a client by hand in Keycloak and give the app its id and secret through its own environment. The `vps.auth.oidc` labels only add an OIDC badge to the app's tile (see [Configure an app for Catena](/en/configure-apps/)).
- **Second factor.** **Settings** > **Sign-in requirements** switches between **Password only** and **Password and an authenticator app**. The default is password only, and the change applies to existing accounts at their next sign-in.
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
