---
title: "Manage users and roles"
description: "Create staff and client accounts in Keycloak and assign the roles that decide which apps each person can reach."
---

Everyone who signs in to any of your apps has one account in
**Keycloak**, your identity server at `auth.yourdomain.com`. The role
(Keycloak group) you put them in decides which apps they can reach --
[app access is gated by group](/en/manage-apps/), so getting the role
right here is what opens or closes the door everywhere else.

Sign in at `auth.yourdomain.com` with your administrator account to
manage people.

## Add a person

1. **Admin interface -> Directory -> Users -> Create.**
2. Fill in username + email. Either set a strong password, or leave it
   blank and send an invite -- Keycloak emails a set-password link
   (this needs the outbound email sender to be wired; it is, once the
   install meeting is done).
3. Assign the role (group). See below.
4. The person can now sign in at any app subdomain
   (`dash.yourdomain.com`, `monitor.yourdomain.com`, and the rest)
   with their email + password.

## The roles

Roles are Keycloak groups. Four tiers, widest access at the bottom:

| Role | Who it is | Default access |
|---|---|---|
| `client` | Your external users (customers, partners) | Only apps explicitly opened to `client`. New accounts land here. |
| `staff` | Your employees | Every app opened to `staff`. The baseline for anyone on your team. |
| Department subgroup of `staff` (e.g. `accounting`, `engineering`) | A team within your staff | Apps opened to that department only. Use these for finer-grained access. |
| `admin` | Whoever runs the server (you, and anyone you trust with full control) | Everything, always. Assign deliberately -- never by default. |

- A regular employee goes in `staff`.
- Someone who should only see one department's apps goes in the
  matching department subgroup instead of (or in addition to) `staff`.
- An external user stays in `client`.
- Leave `admin` alone unless you have a specific reason.

To change someone's access, add or remove them from a group under
**Directory -> Groups**. The change takes effect the next time they
sign in.

## What people can do without you

These flows work on their own, no request needed:

- Password reset (email link from the sign-in page).
- Profile edits (display name, email).
- Turning on multi-factor authentication for their own account.

## Removing someone

Disable or delete the account under **Directory -> Users**. Disabling
keeps the record but blocks sign-in immediately across every app --
the safer choice when someone leaves, because it is reversible and
preserves any per-app history tied to the account.
