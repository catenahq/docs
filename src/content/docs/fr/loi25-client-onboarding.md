---
title: "Loi 25 -- la liste de contrôle de l'organisation"
description: "Ce qu'une organisation doit faire à l'interne pour être conforme à la Loi 25. La Suite Catena fournit les contrôles techniques ; l'organisation les opère, et son responsable de la protection des renseignements personnels (RPRP) est responsable de la couche organisationnelle."
---

La Suite Catena est livrée avec les contrôles Loi 25 au niveau de l'infrastructure -- résidence canadienne, sous-traitants documentés, sauvegardes immuables, MFA, chiffrement, journalisation. C'est nécessaire, mais pas suffisant. **La Loi 25 exige aussi des mesures organisationnelles à l'interne que Catena ne peut pas prendre à la place de l'organisation cliente.** Cette page est cette liste de contrôle.

> La Loi 25 (la *Loi modernisant des dispositions législatives en matière de protection des renseignements personnels*) exige que le responsable de la protection des renseignements personnels (RPRP) soit une personne à l'interne de l'organisation. Aucun fournisseur ni logiciel ne peut légalement occuper ce rôle -- mais la Suite Catena fournit chaque contrôle technique sur lequel le reste de cette page s'appuie.

---

## Jour 1 -- désigner

- [ ] **Désigner un RPRP** -- généralement la personne ayant la plus haute autorité OU un délégué avec la compétence et le pouvoir décisionnel requis (ligne directrice de la CAI). Une personne, nommée par écrit.
- [ ] **Publier les coordonnées du RPRP** sur le site web de l'organisation (la page de politique de confidentialité déployée par Catena a déjà l'emplacement prévu -- voir [Où vivent les données](/fr/where-is-my-data/) pour savoir où elle vit).
- [ ] **Signer le contrat de traitement des données (DPA)** avec Catena (il fait partie de l'entente-cadre, signée à l'intégration -- la lettre d'engagement le confirme).
- [ ] **Adopter les quatre politiques internes** rédigées par Catena :
   1. Politique interne de protection des RP (interne)
   2. Politique de confidentialité (publique, sur le site web)
   3. Politique de sécurité de l'information (audience mixte)
   4. Politique de gestion des incidents (interne)

Le RPRP révise et signe chacune. Elles deviennent exécutoires dans l'organisation à la signature.

## Jours 1 à 30 -- inventorier

- [ ] **Inventorier les renseignements personnels** -- le RPRP liste chaque catégorie de renseignements personnels que l'organisation recueille, où elle est stockée (quelle application de la Suite Catena, plus tout système externe), pourquoi, et combien de temps elle est conservée. Catena préremplit l'inventaire pour la couche Suite Catena ; tout ce qui est à l'extérieur (dossiers papier, SaaS externes, dossiers RH) est ajouté par l'organisation.
- [ ] **Coter la sensibilité de chaque catégorie** -- santé, biométrie, judiciaire, financier sensible = "élevée". Les catégories de sensibilité élevée déclenchent une EFVP et peuvent justifier des contrôles additionnels.
- [ ] **Confirmer ou ajuster les périodes de conservation par défaut** dans l'EFVP -- la base Catena convient à la plupart des PME, mais un secteur donné peut exiger plus long (obligations d'audit, ordres professionnels).

## Jours 1 à 60 -- former

- [ ] **Former tout le personnel** qui manipule des renseignements personnels. Le RPRP organise ; Catena ne donne pas la formation aux employés. Sujets : qu'est-ce qu'un renseignement personnel, quelle est la politique, quand signaler un incident, à qui le rapporter.
- [ ] **Confirmer que tout le monde a le MFA activé** dans Keycloak. Le RPRP peut demander le rapport `users-without-mfa` à Catena.
- [ ] **Définir les accès internes par rôle** -- qui a besoin de Nextcloud, qui a besoin d'EspoCRM, et ainsi de suite. Principe du moindre privilège. Catena implante les règles d'accès dans Keycloak à partir de la liste fournie.

## Jours 1 à 90 -- communiquer

- [ ] **Ajouter la case de consentement à chaque formulaire** qui recueille des renseignements personnels. Catena livre les intégrations standard (réservation Easy!Appointments, formulaire de contact EspoCRM) avec l'emplacement de consentement prévu ; le texte de consentement est rédigé par l'organisation, dans ses mots.
- [ ] **Ajouter le lien vers l'avis de confidentialité** aux signatures de courriel et à toute correspondance imprimée.
- [ ] **Confirmer que la politique de confidentialité publique** reflète la pratique réelle -- l'ébauche de Catena est générique pour la base ; la section des catégories de données, la section des témoins (cookies) et toute spécificité sectorielle demandent une révision.

## En continu -- opérer

- [ ] **Tenir le registre des incidents.** Vide, c'est correct ; absent, c'est non conforme. Le RPRP le tient (gabarit dans la trousse documentaire livrée par Catena).
- [ ] **Répondre aux demandes des personnes concernées** dans les 30 jours. Le RPRP reçoit les demandes à l'adresse publiée et exécute la partie technique (exports, suppressions) depuis les outils d'administration des applications. Chaque demande est documentée dans le registre des demandes.
- [ ] **Révision annuelle** de l'EFVP et des quatre politiques. Menée à l'interne ; une révision payante optionnelle est disponible pour une seconde paire d'yeux.
- [ ] **Révision trimestrielle des accès** -- le RPRP révise qui a accès à quoi dans Keycloak (voir [Gérer les utilisateurs et les rôles](/fr/manage-users-and-roles/)) et révoque les accès périmés.

## Quand un incident survient

1. Aviser le RPRP immédiatement.
2. Contenir et trier la partie technique à l'interne -- [Se remettre d'une panne](/fr/disaster-recovery/) associe chaque incident à sa réponse (isoler la machine via Tailscale, faire tourner les identifiants, restaurer depuis un instantané sain).
3. Évaluer la portée : ce qui s'est passé, quand, et de qui les renseignements personnels sont touchés.
4. **Le RPRP décide** s'il faut aviser la CAI et les personnes concernées, rédige l'avis, signe et transmet.
5. Inscrire au registre des incidents.

Un soutien optionnel pour trier un incident en direct est disponible via le contact Catena -- ce n'est pas requis pour la conformité. Le détail est dans la politique de gestion des incidents.

## Ce que le logiciel ne fait PAS

Dit clairement, pour éviter les surprises :

- La Suite Catena n'est PAS le RPRP. Le RPRP est une personne à l'interne de l'organisation. La Loi 25 l'exige.
- Elle ne forme PAS le personnel. La formation revient à l'organisation (le contact Catena peut référer un formateur).
- Elle ne gère PAS les postes de travail, imprimantes, Microsoft 365 ni le réseau de bureau. C'est hors périmètre. Un technicien local s'en occupe.
- Elle ne communique PAS avec la CAI au nom de qui que ce soit. La CAI traite avec le responsable du traitement.

Ce que la Suite FOURNIT : chaque contrôle technique de cette page, et les outils pour produire chaque artefact que le RPRP signe et pour mener chaque réponse à incident à l'interne.

## Où trouver de l'aide

- Commencer par la documentation -- [Se remettre d'une panne](/fr/disaster-recovery/) pour les incidents, [Gérer les utilisateurs et les rôles](/fr/manage-users-and-roles/) pour les accès.
- Aide humaine sur une question technique : [joindre le contact Catena](mailto:hello@catena.run) -- optionnel, pas obligatoire.
- [Commission d'accès à l'information du Québec](https://www.cai.gouv.qc.ca) pour toute question réglementaire.

---

*Page maintenue dans le cadre de la documentation de la Suite Catena. Dernière révision : 2026-07-09.*
