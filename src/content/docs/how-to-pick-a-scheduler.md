---
title: "How to pick a scheduler"
description: "Decision tree for picking the right open-source scheduling app for your business: customer bookings, resource booking, group polls, public events, class signups, or internal staff calendar."
---

Scheduling needs are too varied for a single default app to fit every
business. This guide walks you through a short decision tree, then
recommends one app you can deploy on your server. v1 ships
**Easy!Appointments** for customer bookings; the other branches are
coming as real client demand surfaces.

## What are you scheduling?

Pick the line that matches your situation. Each branch lands on a
recommended app + a setup guide.

### Customers booking time with my team (clinic, salon, repair shop, lessons)

**Recommended:** [Easy!Appointments](/docs/apps/easyappointments/) (shipped).

One public booking page; independent provider calendars; email
reminders; ICS export. Local staff sign-in (no SSO yet upstream).

### Just me taking bookings (one provider, paid or unpaid)

**Recommended:** Easy!Appointments single-provider (shipped; paid
bookings on roadmap).

Same app, configured for one provider. Stripe-paid bookings ride a
small bridge until cal.diy upstream stabilizes; talk to your operator
if paid is blocking your launch.

### Reserving rooms, equipment, or other shared resources

**Recommended:** LibreBooking (coming when a real client asks).

Resource booking is a narrow lane in the SMB segment. Reach out if
you have a concrete need; the picker will route you here once the
catalog entry lands.

### Finding a meeting time across N people, one-shot

**Recommended:** Rallly (coming when a real client asks).

For internal team polls, Nextcloud Polls already covers this. Rallly
fills the gap when external participants without accounts need to
vote on a meeting time.

### Public event RSVP / community events listing

**Recommended:** Mobilizon or Gancio (coming when a real client asks).

Two candidates: Mobilizon for federated multi-region orgs; Gancio for
hyperlocal listings. Reach out so the picker can ship the right fit.

### Class / cohort signups (yoga, lessons, fitness)

**Recommended:** [Easy!Appointments group sessions](/docs/apps/easyappointments/) (shipped).

Easy!Appointments supports group-session scheduling out of the box;
same setup as the customer-bookings flow with capacity per slot.

### Internal staff calendar only (no customer-facing page)

**Recommended:** [EspoCRM calendar](/docs/apps/espocrm/) (shipped).

Already in the suite as part of the CRM. No separate scheduler
needed.

### Not sure / none of the above

Talk to your operator. Scheduling needs vary; a 30-minute call sorts
which lane your business falls in faster than a checklist.
