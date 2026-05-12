---
title: "Loi 25 — your organization's checklist"
description: "What your organization must do internally to be Law-25-compliant, after Catena delivers the infrastructure. Catena handles the technical layer; your designated Privacy Officer (RPP) handles the organizational layer."
---

Your Catena Suite ships configured with infrastructure-level Loi 25 controls — Canadian residency, documented subprocessors, immutable backups, MFA, encryption, logging. That's necessary but not sufficient. **Loi 25 also requires organizational measures inside your organization that Catena cannot provide on your behalf.** This page is your checklist.

> Loi 25 (the *Loi modernisant des dispositions législatives en matière de protection des renseignements personnels*) requires the "responsable de la protection des renseignements personnels" (RPP) to be a person inside your organization. Your operator cannot legally be your RPP — but your operator can deliver everything else.

---

## Day 1 — designate

- [ ] **Designate a Privacy Officer (RPP)** — typically the senior-most authority OR a delegate with required competence and decision-making power (CAI guideline). One person, named in writing.
- [ ] **Publish RPP coordinates** on your website (your privacy policy page, deployed by Catena, already has the slot — see [where-is-my-data](/docs/en/where-is-my-data/) for where it lives).
- [ ] **Sign the DPA** with Catena (it's part of the master agreement; you signed it at onboarding — check your engagement letter to confirm).
- [ ] **Adopt the four internal policies** Catena drafted for you:
   1. Politique interne de protection des RP (internal)
   2. Politique de confidentialité (public, on website)
   3. Politique de sécurité de l'information (mixed audience)
   4. Politique de gestion des incidents (internal)

The RPP reviews + signs each. They become enforceable in your organization at signature.

## Day 1–30 — inventory

- [ ] **Inventory your personal information** — the RPP lists every category of personal info your organization collects, where it's stored (which app in the Catena Suite, plus any external system), why, and how long it's retained. Catena pre-fills the inventory with the Suite-Catena layer; you add anything outside (paper files, external SaaS, HR records).
- [ ] **Rate each category's sensitivity** — health, biometric, judicial, financial-sensitive = "high". High-sensitivity categories trigger an ÉFVP and may warrant additional controls.
- [ ] **Confirm or adjust default retention periods** in the EFVP — the Catena baseline is reasonable for most SMBs but your sector may need longer (audit obligations, professional orders).

## Day 1–60 — train

- [ ] **Train all staff** who handle personal information. The RPP organizes; Catena does not deliver employee training. Topics: what is a personal info, what's the policy, when to flag an incident, who to report to.
- [ ] **Confirm everyone has MFA enabled** in Keycloak. The RPP has the operator's `users-without-mfa` report on request.
- [ ] **Define internal access by role** — who needs Nextcloud access, who needs EspoCRM, etc. Principle of least privilege. The operator implements the access rules in Keycloak per your roster.

## Day 1–90 — communicate

- [ ] **Add the consent checkbox to every form** that collects personal info. Catena ships standard embeds (Cal.com booking, EspoCRM contact form) with the consent slot; you write the consent text in your language.
- [ ] **Add the privacy notice link** to your email signatures and any printed correspondence.
- [ ] **Confirm the public privacy policy** reflects your actual practice — Catena's draft is generic across the baseline; review and adjust the data-categories section, the cookies section, and any per-sector specifics.

## Ongoing — operate

- [ ] **Maintain the incident register**. Empty is fine; absent is non-compliant. The RPP keeps it (template in your operator-driven documentation pack).
- [ ] **Respond to data subject requests** within 30 days. The RPP receives requests at the published email and coordinates with the operator for technical execution (exports, deletions). Document each in the requests register.
- [ ] **Annual review** of the EFVP and the four policies. Coordinated with Catena's annual maintien Loi 25 if you've subscribed (otherwise do it yourself — Catena can quote it ad-hoc).
- [ ] **Quarterly access review** — the RPP, with Catena, reviews who has access to what and revokes stale access.

## When an incident happens

1. Notify the RPP immediately (and the operator: `hello@catena.run` or your direct line).
2. The operator triages within 4h and reports to you.
3. The operator delivers a technical report within 72h.
4. **The RPP decides** whether to notify the CAI and the affected individuals (the operator drafts the notification text; the RPP signs and submits).
5. Inscribe in the incident register.

Detail in your incident-management policy.

## What the operator does NOT do

So you're not surprised:

- The operator is NOT your RPP. The RPP is internal to your organization. Loi 25 requires that.
- The operator does NOT train your staff. Training is your responsibility (Catena can refer trainers).
- The operator does NOT manage your endpoints, printers, Microsoft 365, or office network. Those are out of scope. A local technician handles them.
- The operator does NOT communicate with the CAI on your behalf. The CAI sees you, the data controller.

What the operator DOES do: every technical control on this page, every artifact the RPP needs to sign, every incident triage and notification draft.

## Need help

- [Contact your operator](mailto:hello@catena.run) for any technical question.
- [Commission d'accès à l'information du Québec](https://www.cai.gouv.qc.ca) for any regulatory question.

---

*Page maintained as part of your Catena Suite documentation. Last reviewed: 2026-05-11.*
