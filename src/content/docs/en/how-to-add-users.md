---
title: "How to add users"
description: "TODO -- Keycloak UI walkthrough with screenshots."
---

TODO -- Keycloak UI walkthrough with screenshots.

Short version:

1. Go to `https://auth.yourdomain.com` and log in as admin.
2. Admin interface -> Directory -> Users -> "Create"
3. Fill in username + email. Set a strong password OR send an invite
   (Keycloak emails a set-password link via SMTP -- requires operator
   to have wired up SMTP).
4. Pick the user's tier. New users land in `client` (your external
   users) by default. For an employee, also add them to `staff` (your
   team's baseline access). For finer-grained access, add a per-
   department subgroup of staff (e.g. `accounting`, `engineering`).
   `admin` is the operator tier -- assign it deliberately, never by
   default.
5. User can now log in at any app subdomain (`admin.yourdomain.com`,
   `monitor.yourdomain.com`,
   `actions.yourdomain.com`,
   `dash.yourdomain.com`) with their email + password.

Self-service flows that work without operator involvement:

- Password reset (email link)
- Profile edits (display name, email)
- Enabling MFA on own account
