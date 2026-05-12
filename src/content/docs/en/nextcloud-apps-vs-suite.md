---
title: "Nextcloud apps vs other suite apps"
description: "Side-by-side comparison of bundled Nextcloud apps (Talk, Tasks, Deck, Collective, Calendar, Contacts, etc.) and the dedicated apps in the catena suite, with guidance on which to enable for which use case."
---

Nextcloud ships with a large catalog of first-party apps, several of
which overlap with dedicated tools in your catena software suite (Rocket.Chat,
Plane, Outline, Easy!Appointments, EspoCRM). Both can be installed at
the same time, but you usually want to pick **one app per job** so
your team is not split across two tools.

This page compares the most common Nextcloud apps to their suite
counterparts and recommends which to enable.

## Featured Nextcloud apps in this guide

Nextcloud apps live under **Apps → Your apps** inside Nextcloud. The
ones covered on this page:

- [Talk](https://nextcloud.com/talk/) — chat, voice and video calls
- [Tasks](https://apps.nextcloud.com/apps/tasks) — to-do lists tied
  to your CalDAV calendar
- [Deck](https://apps.nextcloud.com/apps/deck) — kanban boards
- [Collectives](https://apps.nextcloud.com/apps/collectives) —
  collaborative wiki backed by Markdown files
- [Notes](https://apps.nextcloud.com/apps/notes) — per-user
  note-taking with mobile sync
- [Appointments](https://www.srgdev.com/lab/nextcloud-appointments/)
  — public booking pages tied to a user's calendar
- [Forms](https://apps.nextcloud.com/apps/forms) — internal surveys
  and intake forms
- [Contacts](https://apps.nextcloud.com/apps/contacts) — personal
  and shared address books over CardDAV
- [Mail](https://apps.nextcloud.com/apps/mail) — IMAP / SMTP client
  inside Nextcloud
- [Calendar](https://apps.nextcloud.com/apps/calendar) — staff and
  shared calendars over CalDAV
- [Attendance](https://apps.nextcloud.com/apps/attendance) —
  clock-in / clock-out time tracking
- [Memories](https://apps.nextcloud.com/apps/memories) /
  [Photos](https://apps.nextcloud.com/apps/photos) — photo timeline
  and album browser
- [Bookmarks](https://apps.nextcloud.com/apps/bookmarks) — shared
  bookmarks
- [Polls](https://apps.nextcloud.com/apps/polls) — group polls and
  date pickers
- [News](https://apps.nextcloud.com/apps/news) — RSS reader

## How to read this page

For each capability:

- **Try the Nextcloud app first** if the feature is unclear or the
  use case is light. Lighter footprint, no extra template to deploy,
  and you can switch to the dedicated suite app later if you outgrow
  it.
- **Use the dedicated suite app** when the Nextcloud app's limits
  start to bite, or when the capability is core to your team's
  daily work and you need more features, speed, or integrations.
- **Use both** is rarely a good idea. The exceptions are called out
  explicitly below.

Your operator can pre-enable a starting set during deployment; you
can enable or disable any Nextcloud app yourself afterwards from the
same screen.

## Chat and video calls

Both can host channels, direct messages, calls, and file sharing.
The interesting axes are where they diverge:

| Axis | Nextcloud Talk | Rocket.Chat |
|---|---|---|
| Deployment | Bundled inside Nextcloud, no extra container | Separate template, own database, own domain |
| Designed for | Small teams where chat is a side channel next to files | Larger rosters where chat is the primary collaboration surface |
| Mobile experience | Lives inside the Nextcloud mobile app | Dedicated iOS / Android apps with native push notifications |
| Integrations | Tightly bound to Nextcloud (Files, Calendar, Deck, Contacts, share-from-app) | Marketplace of apps + channel bridges (Telegram, SMS, Matrix, etc.) |
| Customer-facing channels | None | Built-in livechat widget for website support and omnichannel |
| Federation | Federation across Nextcloud servers (Federated Cloud Sharing) | Matrix federation across organizations |
| Identity | Tied to Nextcloud accounts (Nextcloud itself can chain to Keycloak SSO) | First-class Keycloak SSO out of the box |
| Admin granularity | Inherited from Nextcloud's roles | Per-channel roles, retention policies, audit logs |

**Use Nextcloud Talk** for small teams (under 10 people) where chat is
a side channel next to file collaboration.

**Use Rocket.Chat** when chat is the primary collaboration surface,
when you need a public livechat widget, when you want a polished
dedicated mobile app, or when fine-grained admin controls matter.

**Use both** only during a migration window. Otherwise turn off Talk
when Rocket.Chat is your team chat.

Reference: [Nextcloud Talk overview](https://nextcloud.com/talk/) ·
[Rocket.Chat platform overview](https://www.rocket.chat/platform-overview).

## Tasks and project management

| Nextcloud Tasks + Deck | Plane |
|---|---|
| Tasks: simple to-do lists tied to your CalDAV calendar | Issues, cycles, modules, sub-issues, custom fields |
| Deck: kanban boards, lightweight Trello-equivalent | Kanban, list, calendar, gantt, sprints |
| Personal or small-shared lists | Cross-team workspaces, roadmaps, milestones |
| No estimates, no roadmap, no automation | Estimates, automations, GitHub/GitLab links |

**Use Nextcloud Tasks** for personal to-dos that sync to the same
calendar your CalDAV clients see.

**Use Nextcloud Deck** for small kanban boards (5-10 cards) shared
inside a department.

**Use Plane** for any work tracked across multiple people, sprints,
or external dependencies. Plane is the recommended project-management
tool in the suite.

Reference: [Nextcloud Tasks](https://apps.nextcloud.com/apps/tasks) ·
[Nextcloud Deck](https://apps.nextcloud.com/apps/deck) ·
[Plane](https://plane.so/).

## Wiki and shared documents

| Nextcloud Collective + Notes | Outline |
|---|---|
| Collective: collaborative wiki backed by Markdown files in a folder | Database-backed wiki, Notion-style pages |
| Notes: per-user note-taking, syncs to mobile via Notes apps | Hierarchical collections, nested docs |
| Lives next to your files (one URL, one login) | Separate domain, Keycloak SSO, faster search |
| Versioning via Nextcloud file history | Built-in revision history, comments, mentions |

**Use Nextcloud Collective** for low-volume internal pages where
everything else lives in Nextcloud already.

**Use Nextcloud Notes** for personal notes that sync with mobile.

**Use Outline** for company-wide knowledge bases, onboarding
documentation, or anything that needs strong search and a polished
reading experience.

Reference: [Nextcloud Collectives](https://apps.nextcloud.com/apps/collectives) ·
[Nextcloud Notes](https://apps.nextcloud.com/apps/notes) ·
[Outline](https://www.getoutline.com/).

## Public booking pages

Both let customers book time slots without a Nextcloud account. They
differ in deployment shape and team support:

| Axis | [Nextcloud Appointments](https://www.srgdev.com/lab/nextcloud-appointments/) | Easy!Appointments |
|---|---|---|
| Deployment | A Nextcloud app, runs inside Nextcloud | Separate template, own database, own domain |
| Provider model | One Nextcloud user per booking page (up to 10 pages per user) | Many providers, services, locations managed from one dashboard |
| Calendar | Tied to that user's CalDAV calendar (any CalDAV calendar works) | Per-provider calendars, syncable via ICS |
| Customer flow | Embeddable form; two-way email confirm/cancel via emailed links | Public booking page hosted at the app's domain; email + SMS reminders |
| Best for | Solo practitioners, freelancers, anyone whose schedule already lives in Nextcloud | Multi-staff businesses (clinics, salons, repair shops) |
| Payments | None | None natively (Stripe via a small bridge in the suite) |

**Use Nextcloud Appointments** when you are a one-person operation
and your calendar already lives in Nextcloud — it is the lightest
possible setup, no separate deploy.

**Use Easy!Appointments** when several staff need their own
schedules, when you want a dedicated booking domain, or when you
need services / capacity / multi-location modeling.

See [How to pick a scheduler](/docs/en/how-to-pick-a-scheduler/) for the
full decision tree across all booking patterns.

Nextcloud Calendar (the staff CalDAV calendar) is complementary to
both — it covers internal calendars and meeting rooms, not customer
bookings. See the Nextcloud-only list below.

Reference: [Nextcloud Appointments](https://www.srgdev.com/lab/nextcloud-appointments/) ·
[Easy!Appointments](https://easyappointments.org/).

## Forms and surveys

The suite does not ship a dedicated forms app, so **Nextcloud Forms**
is the recommended path for any inner-company forms — HR check-ins,
event RSVPs, intake questionnaires, internal surveys. Enable it in
Nextcloud under Apps → Your apps.

| Use case | Recommended app |
|---|---|
| Internal forms (HR, RSVPs, surveys, intake) | Nextcloud Forms |
| Form input that triggers a workflow (auto-create CRM contact, send email, post to chat) | [n8n](/docs/en/apps/n8n/) Form Trigger node |
| Customer-facing lead capture tied to a sales pipeline | EspoCRM web-to-lead form |
| Document-signing flow | [DocuSeal](/docs/en/apps/docuseal/) |

For most inner-company needs, Nextcloud Forms is the right answer:
results land in a Nextcloud spreadsheet, the form lives at a public
or staff-only URL, and you do not need a separate deployment. Reach
for n8n only when the form must trigger an automated downstream
action.

Reference: [Nextcloud Forms](https://apps.nextcloud.com/apps/forms) ·
[n8n](https://n8n.io/) ·
[EspoCRM](https://www.espocrm.com/) ·
[DocuSeal](https://www.docuseal.com/).

## Contacts and CRM

| Nextcloud Contacts | EspoCRM (or Twenty) |
|---|---|
| Personal and shared address books (CardDAV) | Sales pipeline: leads, accounts, opportunities |
| Phone, email, postal address, notes | Activity history, tasks, calls, deals, reports |
| Meant to feed your phone and email client | Meant to track sales motions over time |

**Use Nextcloud Contacts** for the staff phonebook and shared address
books that sync to phones via CardDAV.

**Use EspoCRM** when you need to track customer relationships, sales
opportunities, and activity history. EspoCRM is the default CRM in
the suite.

These two are complementary. Run Nextcloud Contacts for the directory,
EspoCRM for sales. Avoid duplicating the same person in both unless
you have a specific reason.

Reference: [Nextcloud Contacts](https://apps.nextcloud.com/apps/contacts) ·
[EspoCRM](https://www.espocrm.com/) ·
[Twenty](https://twenty.com/).

## Mail

Nextcloud Mail is an **IMAP/SMTP client**, not a mail server. catena
does not host email. Nextcloud Mail can connect to your existing
email provider (Microsoft 365, Google Workspace, mailbox.org, etc.) so
your team reads and sends mail inside Nextcloud.

Reference: [Nextcloud Mail](https://apps.nextcloud.com/apps/mail).

## Nextcloud-only apps worth knowing

These have no direct equivalent in the suite. Enable them in Nextcloud
(Apps → Your apps) when relevant.

- **[Calendar](https://apps.nextcloud.com/apps/calendar)** — staff and
  shared calendars over CalDAV. The default for internal scheduling,
  meeting rooms, and team availability.
- **[Attendance](https://apps.nextcloud.com/apps/attendance)** —
  clock-in / clock-out time tracking. Useful for small businesses that
  need a simple staff-attendance log without pulling in a full HR /
  payroll system.
- **[Memories](https://apps.nextcloud.com/apps/memories) /
  [Photos](https://apps.nextcloud.com/apps/photos)** — photo timeline
  and album browser for image files in your Nextcloud. Useful if your
  business stores a lot of visual assets.
- **[Bookmarks](https://apps.nextcloud.com/apps/bookmarks)** — shared
  bookmarks across your team. Useful for curated link collections.
- **[Polls](https://apps.nextcloud.com/apps/polls)** — quick group
  polls (date pickers, multiple choice). Lightweight Doodle
  equivalent.
- **[News](https://apps.nextcloud.com/apps/news)** — RSS reader. Niche
  but solid.

## When in doubt, start with the Nextcloud app

The Nextcloud apps above are free to enable, light on resources, and
easy to turn off if they don't fit. **If you are not sure whether
your team needs the dedicated suite app, try the Nextcloud version
first** — for a week or two, with the actual people who will use it.
You will quickly know whether it covers the use case or whether the
limits start to bite.

If the Nextcloud app is enough, you save a deployment, a domain, and
a separate login surface. If it is not enough, the dedicated suite
app is one operator request away — and your data on the Nextcloud
side stays in place during the switch.

Talk to your operator any time you want to enable, disable, or swap
which app handles a given capability. They can adjust the enabled
list in one batch.
