---
title: "Manage users and roles"
description: "Create staff and client accounts in Keycloak and assign the roles that decide which apps each person can reach."
---

Everyone who signs in to any app on the server has one account in
**Keycloak**, the identity server at `auth.yourdomain.com`. The role
(Keycloak group) they belong to decides which apps they can reach --
[app access is gated by group](/en/manage-apps/), so getting the role
right here is what opens or closes the door everywhere else.

People are managed by signing in at `auth.yourdomain.com` with an
administrator account.

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
| `client` | External users (customers, partners) | Only apps explicitly opened to `client`. New accounts land here. |
| `staff` | Employees | Every app opened to `staff`. The baseline for anyone on the team. |
| Department subgroup of `staff` (e.g. `accounting`, `engineering`) | A team within staff | Apps opened to that department only. These give finer-grained access. |
| `admin` | Whoever runs the server, and anyone trusted with full control | Everything, always. Assigned deliberately -- never by default. |

- A regular employee goes in `staff`.
- Someone who should only see one department's apps goes in the
  matching department subgroup instead of (or in addition to) `staff`.
- An external user stays in `client`.
- `admin` stays untouched without a specific reason.

Access changes by adding or removing the account from a group under
**Directory -> Groups**. The change takes effect the next time that
person signs in.

## What people can do unassisted

These flows work on their own, no request needed:

- Password reset (email link from the sign-in page).
- Profile edits (display name, email).
- Turning on multi-factor authentication for their own account.

## Removing someone

Disable or delete the account under **Directory -> Users**. Disabling
keeps the record but blocks sign-in immediately across every app --
the safer choice when someone leaves, because it is reversible and
preserves any per-app history tied to the account.
