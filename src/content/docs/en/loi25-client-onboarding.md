---
title: "Loi 25 -- your organization's checklist"
description: "What your organization must do internally to be Law-25-compliant. The Catena Suite provides the technical controls; you operate them, and your designated Privacy Officer (RPP) owns the organizational layer."
---

Your Catena Suite ships configured with infrastructure-level Loi 25 controls -- Canadian residency, documented subprocessors, immutable backups, MFA, encryption, logging. That's necessary but not sufficient. **Loi 25 also requires organizational measures inside your organization that Catena cannot provide on your behalf.** This page is your checklist.

> Loi 25 (the *Loi modernisant des dispositions législatives en matière de protection des renseignements personnels*) requires the "responsable de la protection des renseignements personnels" (RPP) to be a person inside your organization. No vendor or software can legally be your RPP -- but the Catena Suite gives you every technical control the rest of this page relies on.

---

## Day 1 -- designate

- [ ] **Designate a Privacy Officer (RPP)** -- typically the senior-most authority OR a delegate with required competence and decision-making power (CAI guideline). One person, named in writing.
- [ ] **Publish RPP coordinates** on your website (your privacy policy page, deployed by Catena, already has the slot -- see [where-is-my-data](/en/where-is-my-data/) for where it lives).
- [ ] **Sign the DPA** with Catena (it's part of the master agreement; you signed it at onboarding -- check your engagement letter to confirm).
- [ ] **Adopt the four internal policies** Catena drafted for you:
   1. Politique interne de protection des RP (internal)
   2. Politique de confidentialité (public, on website)
   3. Politique de sécurité de l'information (mixed audience)
   4. Politique de gestion des incidents (internal)

The RPP reviews + signs each. They become enforceable in your organization at signature.

## Day 1-30 -- inventory

- [ ] **Inventory your personal information** -- the RPP lists every category of personal info your organization collects, where it's stored (which app in the Catena Suite, plus any external system), why, and how long it's retained. Catena pre-fills the inventory with the Suite-Catena layer; you add anything outside (paper files, external SaaS, HR records).
- [ ] **Rate each category's sensitivity** -- health, biometric, judicial, financial-sensitive = "high". High-sensitivity categories trigger an ÉFVP and may warrant additional controls.
- [ ] **Confirm or adjust default retention periods** in the EFVP -- the Catena baseline is reasonable for most SMBs but your sector may need longer (audit obligations, professional orders).

## Day 1-60 -- train

- [ ] **Train all staff** who handle personal information. The RPP organizes; Catena does not deliver employee training. Topics: what is a personal info, what's the policy, when to flag an incident, who to report to.
- [ ] **Confirm everyone has MFA enabled** in Keycloak. The RPP can request the `users-without-mfa` report from Catena.
- [ ] **Define internal access by role** -- who needs Nextcloud access, who needs EspoCRM, etc. Principle of least privilege. Catena implements the access rules in Keycloak per your roster.

## Day 1-90 -- communicate

- [ ] **Add the consent checkbox to every form** that collects personal info. Catena ships standard embeds (Easy!Appointments booking, EspoCRM contact form) with the consent slot; you write the consent text in your language.
- [ ] **Add the privacy notice link** to your email signatures and any printed correspondence.
- [ ] **Confirm the public privacy policy** reflects your actual practice -- Catena's draft is generic across the baseline; review and adjust the data-categories section, the cookies section, and any per-sector specifics.

## Ongoing -- operate

- [ ] **Maintain the incident register**. Empty is fine; absent is non-compliant. The RPP keeps it (template in your Catena documentation pack).
- [ ] **Respond to data subject requests** within 30 days. The RPP receives requests at the published email and runs the technical execution (exports, deletions) from the apps' own admin tools. Document each in the requests register.
- [ ] **Annual review** of the EFVP and the four policies. Do it yourself; optional paid review is available if you'd rather have a second set of eyes.
- [ ] **Quarterly access review** -- the RPP reviews who has access to what in Keycloak (see [Manage users and roles](/en/manage-users-and-roles/)) and revokes stale access.

## When an incident happens

1. Notify the RPP immediately.
2. Contain and triage the technical side yourself -- [Recovering from a failure](/en/disaster-recovery/) maps each incident to its response (isolate the box over Tailscale, rotate credentials, restore from a clean snapshot).
3. Assess the scope: what happened, when, and whose personal information was affected.
4. **The RPP decides** whether to notify the CAI and the affected individuals, drafts the notice, signs, and submits.
5. Inscribe in the incident register.

Prefer a hand triaging a live incident? Optional support is available via your Catena contact -- it is not required for compliance. Detail in your incident-management policy.

## What the software does NOT do for you

So you're not surprised:

- The Catena Suite is NOT your RPP. The RPP is a person inside your organization. Loi 25 requires that.
- It does NOT train your staff. Training is your responsibility (ask your Catena contact for a trainer referral).
- It does NOT manage your endpoints, printers, Microsoft 365, or office network. Those are out of scope. A local technician handles them.
- It does NOT communicate with the CAI on your behalf. The CAI sees you, the data controller.

What the Suite DOES give you: every technical control on this page, and the tools to produce every artifact the RPP signs and to run every incident response yourself.

## Need help

- Start with the docs -- [Recovering from a failure](/en/disaster-recovery/) for incidents, [Manage users and roles](/en/manage-users-and-roles/) for access.
- Prefer human help on a technical question? [Reach your Catena contact](mailto:hello@catena.run) -- optional, not required.
- [Commission d'accès à l'information du Québec](https://www.cai.gouv.qc.ca) for any regulatory question.

---

*Page maintained as part of your Catena Suite documentation. Last reviewed: 2026-05-11.*
