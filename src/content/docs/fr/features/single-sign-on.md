---
title: "Authentification unique"
description: "Un seul compte pour toutes les applications, des groupes décidant qui peut ouvrir quoi, appliqué en amont des applications."
---

Un seul compte ouvre toutes les applications. Les groupes décident qui peut ouvrir quoi, et la vérification se fait en amont de chaque application par une barrière : les applications sans connexion propre sont donc protégées elles aussi. Le personnel ne voit que les applications qu'il peut ouvrir; les administrateurs voient tout.

## Fonctionnement

- **Keycloak** tient un seul domaine d'authentification et constitue l'unique page de connexion, à `auth.yourdomain.com`. L'inscription est désactivée, l'adresse courriel sert de nom d'utilisateur, les courriels en double et les modifications du nom d'utilisateur sont refusés, et la protection contre la force brute est active.
- **Groupes.** `admin` est ajouté à la liste d'autorisation de chaque application protégée. `staff` contient les départements comme sous-groupes. `client` est le groupe par défaut des nouveaux comptes. `visitor` est une étiquette signifiant public et n'apparaît jamais dans un jeton de connexion. La vérification d'administrateur du panneau est le groupe `admin`.
- **Barrière par application.** Chaque application protégée, et chaque outil d'administration (Portainer, la page d'état, le moniteur de tâches, les graphiques de ressources), a son propre mandataire de connexion avec ses propres groupes autorisés et son propre témoin de session, limité à cette adresse. Un témoin vu par une application ou un outil n'en ouvre aucun autre. Une personne saisit tout de même son mot de passe une seule fois : chaque nouvelle application ou nouvel outil renvoie le navigateur vers Keycloak, qui reconnaît la session ouverte. Une application sans accès déclaré est refusée à tous sauf aux administrateurs.
- **Applications du catalogue.** Outline, Rocket.Chat, EspoCRM, Zammad, Immich et Element proposent **Sign in with Keycloak** sans aucune étape : dans les minutes qui suivent le premier déploiement, Catena crée l'entrée de connexion propre à l'application dans Keycloak et l'application redémarre une fois avec elle. Nextcloud reçoit son entrée de la même façon, puis se raccorde avec l'action **Wire Nextcloud OIDC**. Le webmail du serveur de courriel est configuré avec le serveur. Windshift reçoit son entrée de connexion de la même façon, et son administrateur ajoute le fournisseur une fois dans l'écran d'administration de Windshift. DocuSeal, Plane et Twenty n'ont pas d'authentification unique dans leurs éditions gratuites et gardent leur propre connexion. La page de modèle de chaque application liste ses étapes. Qui peut se connecter par le bouton propre à l'application suit les groupes de l'application : les administrateurs seulement, le personnel et les administrateurs, ou tous les comptes quand le groupe `client` est autorisé.
- **Applications hors catalogue.** Pour une application qui veut une connexion OIDC native, vous posez les étiquettes `vps.auth.oidc` dans son fichier compose : Catena crée alors l'entrée de connexion propre à l'application dans Keycloak et place son identifiant, son secret et son émetteur dans l'environnement de l'application (voir [Connexion avec les comptes Catena](/fr/configure-apps/#connexion-avec-les-comptes-catena-facultatif)). Sur la tuile de l'application, vous voyez si cette connexion est prête, en attente ou en échec; le personnel voit un badge OIDC.
- **Deuxième facteur.** **Paramètres** > **Exigences de connexion** bascule entre **Mot de passe seulement** et **Mot de passe et application d'authentification**. Le défaut est le mot de passe seulement, et le changement s'applique aux comptes existants à leur prochaine connexion.
- **Console propre à Keycloak.** L'administrateur de `auth.yourdomain.com/admin` configure un code à usage unique à sa première connexion et le saisit ensuite à chaque fois; des mots de passe erronés répétés verrouillent le compte jusqu'à 15 minutes. Un domaine de sécurité `vps` que vous désactivez reste désactivé après les mises à jour. Voir [Connexion et personnes](/fr/configuration/sign-in-and-people/).
- **Courriel.** La réinitialisation de mot de passe et les invitations exigent **Paramètres** > **Courriel sortant** (Resend, Brevo ou un serveur SMTP personnalisé). Sans courriel sortant, le courriel de réinitialisation est désactivé.
- **Connexion au panneau.** Vous vous connectez au panneau avec le courriel administrateur local et le mot de passe affiché une seule fois à l'installation, en plus de la barrière.

## Personnes et piste d'audit

Le panneau **Personnes** gère les comptes et les groupes depuis le panneau d'administration : créer, renommer et supprimer des groupes, y ajouter des personnes, désactiver des comptes. Avant qu'un groupe soit renommé ou supprimé, le panneau liste chaque application qui cesserait d'admettre des gens, et qui détient ce groupe; la confirmation correspond à l'impact affiché. Chaque action administrative est écrite dans un journal signé à chaîne de hachage sur le serveur; le panneau **Journal d'audit** l'affiche, l'exporte et le vérifie.

## Ce qu'ajoute chaque édition

L'authentification unique, les groupes et l'écriture de la piste d'audit sont dans Communauté. Catena Pro ajoute le panneau **Personnes** et plusieurs domaines, chacun avec sa propre connexion. Catena Business ajoute le panneau **Journal d'audit**. Voir la [comparaison des éditions](https://catena.run/fr/#pricing).

## Limites

- Les utilisateurs et les groupes sont vos données : une mise à jour de la configuration du serveur ne les réimporte jamais.
- Renommer un groupe dans Keycloak sans le panneau **Personnes** ne donne aucun aperçu de l'impact.
- La connexion au panneau est le compte administrateur local, pas un utilisateur Keycloak.

## Configuration

- [Connexion et personnes](/fr/configuration/sign-in-and-people/)
- [Courriel sortant](/fr/configuration/email/)
- [Abonnement](/fr/configuration/subscription/)
