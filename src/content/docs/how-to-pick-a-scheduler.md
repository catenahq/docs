---
title: "How to pick a scheduler"
description: "Decision tree for picking the right open-source scheduling app for your business: customer bookings, resource booking, group polls, public events, class signups, or internal staff calendar."
---

Scheduling needs are too varied for a single default app to fit every
business. This guide walks you through a short decision tree, then
recommends one app you can deploy on your server.

## What are you scheduling?

Pick the line that matches your situation. Each branch lands on a
recommended app + a setup guide.

### Customers booking time with my team (clinic, salon, repair shop, lessons)

**Recommended:** [Easy!Appointments](/docs/apps/easyappointments/).

One public booking page; independent provider calendars; email
reminders; ICS export. Local staff sign-in (no SSO yet upstream).

### Just me taking bookings (one provider, paid or unpaid)

**Recommended:** [cal.diy](/docs/apps/cal-com/).

Single-provider booking page with native Stripe-paid bookings, a
calendar app store (Google / Outlook / Apple / CalDAV), and a
polished customer-facing booking flow. Self-hosted build of
Cal.com.

### Reserving rooms, equipment, or other shared resources

**Recommended:** LibreBooking.

Resource booking is a narrow lane in the SMB segment. Reach out to
your operator with the concrete need so the picker can route you
here.

### Finding a meeting time across N people, one-shot

**Recommended:** [Nextcloud Polls](/docs/nextcloud-apps-vs-suite/).

Nextcloud Polls covers this — date pickers and multiple-choice polls
with a public link, no account required for participants. Enable it
under Apps → Your apps inside Nextcloud.

### Public event RSVP / community events listing

**Recommended:** Mobilizon or Gancio.

Two candidates: Mobilizon for federated multi-region orgs; Gancio for
hyperlocal listings. Reach out to your operator so the picker can
ship the right fit.

### Class / cohort signups (yoga, lessons, fitness)

**Recommended:** [Easy!Appointments group sessions](/docs/apps/easyappointments/).

Easy!Appointments supports group-session scheduling out of the box;
same setup as the customer-bookings flow with capacity per slot.

### Internal staff calendar only (no customer-facing page)

**Recommended:** [EspoCRM calendar](/docs/apps/espocrm/).

Already in the suite as part of the CRM. No separate scheduler
needed.

### Not sure / none of the above

Talk to your operator. Scheduling needs vary; a 30-minute call sorts
which lane your business falls in faster than a checklist.
