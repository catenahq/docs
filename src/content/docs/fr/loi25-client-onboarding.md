---
title: "Loi 25 -- la liste de contrôle de votre organisation"
description: "Ce que votre organisation doit faire à l'interne pour être conforme à la Loi 25, une fois l'infrastructure livrée par Catena. Catena couvre la couche technique; votre responsable de la protection des renseignements personnels (RPRP) couvre la couche organisationnelle."
---

Votre Suite Catena est livrée avec les contrôles Loi 25 au niveau de l'infrastructure -- résidence canadienne, sous-traitants documentés, sauvegardes immuables, MFA, chiffrement, journalisation. C'est nécessaire, mais pas suffisant. **La Loi 25 exige aussi des mesures organisationnelles à l'interne que Catena ne peut pas prendre à votre place.** Cette page est votre liste de contrôle.

> La Loi 25 (la *Loi modernisant des dispositions législatives en matière de protection des renseignements personnels*) exige que le responsable de la protection des renseignements personnels (RPRP) soit une personne à l'interne de votre organisation. Votre opérateur ne peut pas légalement être votre RPRP -- mais il peut livrer tout le reste.

---

## Jour 1 -- désigner

- [ ] **Désigner un RPRP** -- généralement la personne ayant la plus haute autorité OU un délégué avec la compétence et le pouvoir décisionnel requis (ligne directrice de la CAI). Une personne, nommée par écrit.
- [ ] **Publier les coordonnées du RPRP** sur votre site web (votre page de politique de confidentialité, déployée par Catena, a déjà l'emplacement prévu -- voir [où sont mes données](/fr/where-is-my-data/) pour savoir où elle vit).
- [ ] **Signer le contrat de traitement des données (DPA)** avec Catena (il fait partie de l'entente-cadre; vous l'avez signé à l'intégration -- vérifiez votre lettre d'engagement pour confirmer).
- [ ] **Adopter les quatre politiques internes** rédigées par Catena pour vous :
   1. Politique interne de protection des RP (interne)
   2. Politique de confidentialité (publique, sur le site web)
   3. Politique de sécurité de l'information (audience mixte)
   4. Politique de gestion des incidents (interne)

Le RPRP révise et signe chacune. Elles deviennent exécutoires dans votre organisation à la signature.

## Jours 1 à 30 -- inventorier

- [ ] **Inventorier vos renseignements personnels** -- le RPRP liste chaque catégorie de renseignements personnels que votre organisation recueille, où elle est stockée (quelle application de la Suite Catena, plus tout système externe), pourquoi, et combien de temps elle est conservée. Catena préremplit l'inventaire pour la couche Suite Catena; vous ajoutez tout ce qui est à l'extérieur (dossiers papier, SaaS externes, dossiers RH).
- [ ] **Coter la sensibilité de chaque catégorie** -- santé, biométrie, judiciaire, financier sensible = « élevée ». Les catégories de sensibilité élevée déclenchent une EFVP et peuvent justifier des contrôles additionnels.
- [ ] **Confirmer ou ajuster les périodes de conservation par défaut** dans l'EFVP -- la base Catena convient à la plupart des PME, mais votre secteur peut exiger plus long (obligations d'audit, ordres professionnels).

## Jours 1 à 60 -- former

- [ ] **Former tout le personnel** qui manipule des renseignements personnels. Le RPRP organise; Catena ne donne pas la formation aux employés. Sujets : qu'est-ce qu'un renseignement personnel, quelle est la politique, quand signaler un incident, à qui le rapporter.
- [ ] **Confirmer que tout le monde a le MFA activé** dans Keycloak. Le RPRP peut demander le rapport `users-without-mfa` à l'opérateur.
- [ ] **Définir les accès internes par rôle** -- qui a besoin de Nextcloud, qui a besoin d'EspoCRM, etc. Principe du moindre privilège. L'opérateur implante les règles d'accès dans Keycloak selon votre liste.

## Jours 1 à 90 -- communiquer

- [ ] **Ajouter la case de consentement à chaque formulaire** qui recueille des renseignements personnels. Catena livre les intégrations standard (réservation Easy!Appointments, formulaire de contact EspoCRM) avec l'emplacement de consentement prévu; vous rédigez le texte de consentement dans vos mots.
- [ ] **Ajouter le lien vers l'avis de confidentialité** à vos signatures de courriel et à toute correspondance imprimée.
- [ ] **Confirmer que la politique de confidentialité publique** reflète votre pratique réelle -- l'ébauche de Catena est générique pour la base; révisez et ajustez la section des catégories de données, la section des témoins (cookies) et toute spécificité sectorielle.

## En continu -- opérer

- [ ] **Tenir le registre des incidents.** Vide, c'est correct; absent, c'est non conforme. Le RPRP le tient (gabarit dans votre trousse documentaire livrée par l'opérateur).
- [ ] **Répondre aux demandes des personnes concernées** dans les 30 jours. Le RPRP reçoit les demandes à l'adresse publiée et coordonne l'exécution technique avec l'opérateur (exports, suppressions). Documenter chaque demande dans le registre des demandes.
- [ ] **Révision annuelle** de l'EFVP et des quatre politiques. Coordonnée avec le maintien Loi 25 annuel de Catena si vous y êtes abonné (sinon faites-la vous-même -- Catena peut la coter à la pièce).
- [ ] **Révision trimestrielle des accès** -- le RPRP, avec Catena, révise qui a accès à quoi et révoque les accès périmés.

## Quand un incident survient

1. Aviser le RPRP immédiatement (et l'opérateur : `hello@catena.run` ou votre ligne directe).
2. L'opérateur fait le triage en 4 h et vous fait rapport.
3. L'opérateur livre un rapport technique en 72 h.
4. **Le RPRP décide** s'il faut aviser la CAI et les personnes concernées (l'opérateur rédige le texte d'avis; le RPRP signe et transmet).
5. Inscrire au registre des incidents.

Le détail est dans votre politique de gestion des incidents.

## Ce que l'opérateur ne fait PAS

Pour éviter les surprises :

- L'opérateur n'est PAS votre RPRP. Le RPRP est à l'interne de votre organisation. La Loi 25 l'exige.
- L'opérateur ne forme PAS votre personnel. La formation vous revient (Catena peut référer des formateurs).
- L'opérateur ne gère PAS vos postes de travail, imprimantes, Microsoft 365 ni votre réseau de bureau. C'est hors périmètre. Un technicien local s'en occupe.
- L'opérateur ne communique PAS avec la CAI en votre nom. La CAI voit vous, le responsable du traitement.

Ce que l'opérateur FAIT : chaque contrôle technique de cette page, chaque artefact que le RPRP doit signer, chaque triage d'incident et chaque ébauche d'avis.

## Besoin d'aide

- [Contactez votre opérateur](mailto:hello@catena.run) pour toute question technique.
- [Commission d'accès à l'information du Québec](https://www.cai.gouv.qc.ca) pour toute question réglementaire.

---

*Page maintenue dans le cadre de la documentation de votre Suite Catena. Dernière révision : 2026-07-09.*
