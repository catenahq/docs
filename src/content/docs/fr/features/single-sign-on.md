---
title: "Authentification unique"
description: "Un seul compte pour toutes les applications, des groupes décidant qui peut ouvrir quoi, appliqué en amont des applications."
---

Un seul compte ouvre toutes les applications. Les groupes décident qui peut ouvrir quoi, et la vérification se fait en amont de chaque application par une barrière : les applications sans connexion propre sont donc protégées elles aussi. Le personnel ne voit que les applications qu'il peut ouvrir; les administrateurs voient tout.

## Fonctionnement

- **Keycloak** tient un seul domaine d'authentification et constitue l'unique page de connexion, à `auth.yourdomain.com`. L'inscription est désactivée, l'adresse courriel sert de nom d'utilisateur, les courriels en double et les modifications du nom d'utilisateur sont refusés, et la protection contre la force brute est active.
- **Groupes.** `admin` est ajouté à la liste d'autorisation de chaque application protégée. `staff` contient les départements comme sous-groupes. `client` est le groupe par défaut des nouveaux comptes. `visitor` est une étiquette signifiant public et n'apparaît jamais dans un jeton de connexion. La vérification d'administrateur du panneau est le groupe `admin`.
- **Barrière par application.** Chaque application protégée a son propre mandataire de connexion avec ses propres groupes autorisés. La session est partagée : une personne se connecte une fois et passe d'une application à l'autre. Une application sans accès déclaré est refusée à tous sauf aux administrateurs.
- **Applications du catalogue** : leur client Keycloak est déjà créé. Pour une application hors catalogue qui veut une connexion OIDC native, vous créez un client à la main dans Keycloak et donnez à l'application son identifiant et son secret par son propre environnement. Les étiquettes `vps.auth.oidc` n'ajoutent qu'un badge OIDC à la tuile de l'application (voir [Configurer une application pour Catena](/fr/configure-apps/)).
- **Deuxième facteur.** **Paramètres** > **Exigences de connexion** bascule entre **Mot de passe seulement** et **Mot de passe et application d'authentification**. Le défaut est le mot de passe seulement, et le changement s'applique aux comptes existants à leur prochaine connexion.
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
