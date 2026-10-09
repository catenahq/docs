---
title: "Sign-in and people"
description: "The sign-in requirement setting, the group model that decides who reaches which application, managing accounts in Keycloak, and the People panel."
---

One account signs in to every application on the server. Accounts live in Keycloak, the sign-in service at `auth.yourdomain.com`, in a single realm named `vps`. The groups an account belongs to decide which applications it can open.

## Sign-in requirements

In **Settings** > **Sign-in requirements**, **What signing in requires** offers:

| Option | Effect |
|---|---|
| **Password only** | The default. |
| **Password and an authenticator app** | Every account must set up an authenticator app. |

The setting applies to every account, existing ones included: each person is asked to set up an authenticator app at the next sign-in and cannot skip it. The section ends with **Save and apply**; the sign-in service restarts briefly.

The realm also keeps these rules on every configuration run: self-registration is off, the email address is the username, duplicate emails are refused, usernames cannot be edited, and brute-force protection is on.

## Groups

Access is decided by Keycloak groups.

| Group | Meaning |
|---|---|
| `admin` | Whoever runs the server. Opens every application and the admin panel. Assigned deliberately, never by default. |
| `staff` | Employees. Departments are subgroups of `staff` (for example `accounting`), giving finer-grained access. |
| `client` | External users such as customers or partners. New accounts land here. |
| `visitor` | A keyword in an application's access setting meaning "anyone, signed in or not". It is never a real group and never appears in a sign-in token. |

An application lists the groups allowed to open it; `admin` is always allowed. An application opened to a department subgroup admits only that department. See [Configure an app for Catena](/en/configure-apps/) for the labels that set this.

A change of group takes effect the next time the person signs in.

## Manage people in Keycloak (every edition)

You manage everyone by signing in to `auth.yourdomain.com` (realm `vps`) with an admin account. From the administration console:

- **Add a person**: create the user with username and email, put the account in the right group, and either set a password or leave it blank and send an invitation (this needs [Outgoing email](/en/configuration/email/)).
- **Change access**: add or remove the account in a group.
- **Remove someone**: disable the account to block sign-in at once across every application while keeping its record, or delete it.
- **Lost second factor**: you clear it on the account in Keycloak, and the person sets it up again.

People can reset their own password from the sign-in page, edit their profile and set up their own authenticator app without any request.

:::note
Password reset and invitations send email. With **No outgoing mail** selected, neither works.
:::

## People panel (Catena Pro)

The **People** panel in the menu manages accounts and groups from the admin panel. The editions are compared at [catena.run](https://catena.run/en/#pricing).

It shows **Groups**, with the applications each one opens, and **People**, with username, email and a "disabled" marker for disabled accounts. It can create, rename and delete groups, add people to groups and disable accounts.

Before a group is renamed or deleted, the panel shows "What this change affects": the "Applications gated on this group" and the "People currently in this group". Applications left with no group would be open to administrators only: "These applications would be left open to administrators only. They keep running, and quietly stop admitting everyone else." Confirming applies exactly the change that was shown; if the list changed in the meantime, the panel asks you to read it again.

Every change is recorded in the administrative log.

If the panel reports "This server has no directory credential yet, so the list of people cannot be read. It arrives with the next configuration run.", run **Bring this server up to date** in [Server settings](/en/configuration/server/) to provide it.

## Troubleshooting

- A person reaches an application they should not: check their groups in Keycloak, then the groups the application lists.
- An application admits no one but admins: its group was deleted or renamed. The impact preview in the People panel shows this beforehand.
- No reset email: see [Outgoing email](/en/configuration/email/).
