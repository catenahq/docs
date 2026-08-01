---
title: "Loi 25 -- the organization's checklist"
description: "What an organization must do internally to be Law-25-compliant. The Catena Suite provides the technical controls; the organization operates them, and its designated Privacy Officer (RPP) owns the organizational layer."
---

The Catena Suite ships configured with infrastructure-level Loi 25 controls -- Canadian residency, documented subprocessors, immutable backups, MFA, encryption, logging. That is necessary but not sufficient. **Loi 25 also requires organizational measures inside the client organization that Catena cannot provide on its behalf.** This page is that checklist.

> Loi 25 (the *Loi modernisant des dispositions législatives en matière de protection des renseignements personnels*) requires the "responsable de la protection des renseignements personnels" (RPP) to be a person inside the organization. No vendor or software can legally hold that role -- but the Catena Suite provides every technical control the rest of this page relies on.

---

## Day 1 -- designate

- [ ] **Designate a Privacy Officer (RPP)** -- typically the senior-most authority OR a delegate with required competence and decision-making power (CAI guideline). One person, named in writing.
- [ ] **Publish RPP coordinates** on the organization's website (the privacy policy page deployed by Catena already has the slot -- see [Where the data lives](/en/where-is-my-data/) for where it lives).
- [ ] **Sign the DPA** with Catena (it is part of the master agreement, signed at onboarding -- the engagement letter confirms it).
- [ ] **Adopt the four internal policies** Catena drafted:
   1. Politique interne de protection des RP (internal)
   2. Politique de confidentialité (public, on website)
   3. Politique de sécurité de l'information (mixed audience)
   4. Politique de gestion des incidents (internal)

The RPP reviews and signs each. They become enforceable in the organization at signature.

## Day 1-30 -- inventory

- [ ] **Inventory the personal information** -- the RPP lists every category of personal info the organization collects, where it is stored (which app in the Catena Suite, plus any external system), why, and how long it is retained. Catena pre-fills the inventory with the Suite-Catena layer; anything outside it (paper files, external SaaS, HR records) is added by the organization.
- [ ] **Rate each category's sensitivity** -- health, biometric, judicial, financial-sensitive = "high". High-sensitivity categories trigger an ÉFVP and may warrant additional controls.
- [ ] **Confirm or adjust default retention periods** in the EFVP -- the Catena baseline is reasonable for most SMBs, though a given sector may need longer (audit obligations, professional orders).

## Day 1-60 -- train

- [ ] **Train all staff** who handle personal information. The RPP organizes; Catena does not deliver employee training. Topics: what counts as personal info, what the policy says, when to flag an incident, who to report to.
- [ ] **Confirm everyone has MFA enabled** in Keycloak. The RPP can request the `users-without-mfa` report from Catena.
- [ ] **Define internal access by role** -- who needs Nextcloud access, who needs EspoCRM, and so on. Principle of least privilege. Catena implements the access rules in Keycloak from the roster.

## Day 1-90 -- communicate

- [ ] **Add the consent checkbox to every form** that collects personal info. Catena ships standard embeds (Easy!Appointments booking, EspoCRM contact form) with the consent slot; the consent text is written by the organization, in its own language.
- [ ] **Add the privacy notice link** to email signatures and any printed correspondence.
- [ ] **Confirm the public privacy policy** reflects actual practice -- Catena's draft is generic across the baseline; the data-categories section, the cookies section, and any per-sector specifics need review.

## Ongoing -- operate

- [ ] **Maintain the incident register**. Empty is fine; absent is non-compliant. The RPP keeps it (template in the Catena documentation pack).
- [ ] **Respond to data subject requests** within 30 days. The RPP receives requests at the published email and runs the technical execution (exports, deletions) from the apps' own admin tools. Each is documented in the requests register.
- [ ] **Annual review** of the EFVP and the four policies. Run internally; an optional paid review is available for a second set of eyes.
- [ ] **Quarterly access review** -- the RPP reviews who has access to what in Keycloak (see [Manage users and roles](/en/manage-users-and-roles/)) and revokes stale access.

## When an incident happens

1. Notify the RPP immediately.
2. Contain and triage the technical side internally -- [Recovering from a failure](/en/disaster-recovery/) maps each incident to its response (isolate the box over Tailscale, rotate credentials, restore from a clean snapshot).
3. Assess the scope: what happened, when, and whose personal information was affected.
4. **The RPP decides** whether to notify the CAI and the affected individuals, drafts the notice, signs, and submits.
5. Inscribe in the incident register.

Optional support for triaging a live incident is available via the Catena contact -- it is not required for compliance. Detail in the incident-management policy.

## What the software does NOT do

Stated plainly, so nothing comes as a surprise:

- The Catena Suite is NOT the RPP. The RPP is a person inside the organization. Loi 25 requires that.
- It does NOT train staff. Training is the organization's responsibility (the Catena contact can refer a trainer).
- It does NOT manage endpoints, printers, Microsoft 365, or the office network. Those are out of scope. A local technician handles them.
- It does NOT communicate with the CAI on anyone's behalf. The CAI deals with the data controller.

What the Suite DOES provide: every technical control on this page, and the tools to produce every artifact the RPP signs and to run every incident response internally.

## Where to get help

- Start with the docs -- [Recovering from a failure](/en/disaster-recovery/) for incidents, [Manage users and roles](/en/manage-users-and-roles/) for access.
- Human help on a technical question: [reach the Catena contact](mailto:hello@catena.run) -- optional, not required.
- [Commission d'accès à l'information du Québec](https://www.cai.gouv.qc.ca) for any regulatory question.

---

*Page maintained as part of the Catena Suite documentation. Last reviewed: 2026-05-11.*
