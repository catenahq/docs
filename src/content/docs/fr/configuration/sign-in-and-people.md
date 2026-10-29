---
title: "Connexion et personnes"
description: "Le réglage d'exigence de connexion, le modèle de groupes qui décide qui accède à quelle application, la gestion des comptes dans Keycloak et le panneau Personnes."
---

Un seul compte ouvre toutes les applications du serveur. Les comptes vivent dans Keycloak, le service de connexion à `auth.yourdomain.com`, dans un unique domaine de sécurité (realm) nommé `vps`. Les groupes auxquels un compte appartient décident des applications qu'il peut ouvrir.

## Exigences de connexion

Dans **Paramètres** > **Exigences de connexion**, **Ce qu'exige la connexion** propose :

| Option | Effet |
|---|---|
| **Mot de passe seulement** | La valeur par défaut. |
| **Mot de passe et application d'authentification** | Chaque compte doit configurer une application d'authentification. |

Le réglage s'applique à tous les comptes, y compris ceux qui existent déjà : chaque personne doit configurer une application d'authentification à sa prochaine connexion, sans possibilité de reporter. Il couvre aussi les administrateurs de la console propre à Keycloak, décrite plus bas. La section se termine par **Enregistrer et appliquer**; le service de connexion redémarre brièvement.

Tant que le réglage est sur **Mot de passe seulement**, un avis en haut de chaque page d'administration recommande l'application d'authentification. **Fermer** le masque définitivement, et choisir **Mot de passe et application d'authentification** le masque aussi.

À chaque configuration, le domaine de sécurité maintient aussi ces règles : l'inscription libre est désactivée, le courriel sert d'identifiant, les courriels en double sont refusés, les noms d'utilisateur ne sont pas modifiables et la protection contre les attaques par force brute est active. Le refus d'un compte hors des groupes d'une application n'est pas une connexion échouée pour cette protection (voir [Groupes](#groupes)).

## Groupes

L'accès est décidé par les groupes Keycloak.

| Groupe | Sens |
|---|---|
| `admin` | Les personnes qui administrent le serveur. Ouvre toutes les applications et le panneau d'administration. Attribué délibérément, jamais par défaut. |
| `staff` | Le personnel. Les départements sont des sous-groupes de `staff` (par exemple `accounting`), pour un accès plus fin. |
| `client` | Les utilisateurs externes, comme les clients ou les partenaires. Les nouveaux comptes y arrivent. |
| `visitor` | Un mot-clé dans le réglage d'accès d'une application, qui signifie "tout le monde, connecté ou non". Ce n'est jamais un vrai groupe et il n'apparaît jamais dans un jeton de connexion. |

Une application liste les groupes autorisés à l'ouvrir; `admin` l'est toujours. Une application ouverte à un sous-groupe de département n'admet que ce département. Voir [Configurer une application pour Catena](/fr/configure-apps/) pour les étiquettes qui fixent cela.

Une application qui gère elle-même la connexion refuse un compte hors de ses groupes. Cela vaut aussi pour un compte qui se connecte par un fournisseur d'identité ajouté dans Keycloak, y compris celui d'une organisation. Ce refus ne compte jamais dans le verrouillage du compte (voir [Exigences de connexion](#exigences-de-connexion)).

Un changement de groupe prend effet à la prochaine connexion de la personne.

## Se connecter avec un code envoyé par courriel

La page de connexion tient sur un seul écran : une adresse ou un nom d'utilisateur, et un mot de passe. Un client qui préfère un code choisit **Essayer une autre méthode**, puis le code envoyé par courriel, saisit son adresse et reçoit un code valable 10 minutes. Le personnel et les administrateurs se connectent avec leur mot de passe. La page répond de la même façon pour toutes les adresses : elle ne révèle donc jamais si un compte existe. Personne ne reçoit de code tant que le serveur n'a pas de [Courriel sortant](/fr/configuration/email/).

## Gérer les personnes dans Keycloak (toutes les éditions)

Vous gérez tout en vous connectant à `auth.yourdomain.com` (domaine de sécurité `vps`) avec un compte administrateur. Dans la console d'administration :

- **Ajouter une personne** : créez l'utilisateur avec son nom d'utilisateur et son courriel, placez le compte dans le bon groupe, puis définissez un mot de passe ou laissez-le vide et envoyez une invitation (cela exige [Courriel sortant](/fr/configuration/email/)).
- **Changer l'accès** : ajoutez le compte à un groupe ou retirez-le de ce groupe.
- **Retirer quelqu'un** : désactivez le compte, ce qui bloque aussitôt la connexion à toutes les applications tout en gardant son dossier, ou supprimez-le.
- **Deuxième facteur perdu** : vous le réinitialisez sur le compte dans Keycloak, et la personne le configure de nouveau.

Chaque personne peut réinitialiser son mot de passe depuis la page de connexion, modifier son profil et configurer sa propre application d'authentification sans demande préalable.

:::note
La réinitialisation de mot de passe et les invitations envoient du courriel. Avec **Aucun courriel sortant**, ni l'une ni l'autre ne fonctionne.
:::

## La console d'administration propre à Keycloak

La console de premier niveau à `auth.yourdomain.com/admin` (le domaine de sécurité master) a son propre compte administrateur, distinct des personnes ci-dessus.

- À votre première connexion, Keycloak vous demande de configurer un code à usage unique dans une application d'authentification. Il vous le demande ensuite à chaque connexion.
- Avec **Mot de passe et application d'authentification** choisi dans les Paramètres, tout autre compte qui détient le rôle d'administrateur dans cette console, comme un compte de secours que vous avez créé, doit lui aussi configurer un code à usage unique à sa prochaine connexion. La configuration que lance **Enregistrer et appliquer** le lui demande; un compte qui a déjà un code est laissé tel quel. Le compte d'automatisation que le serveur utilise pour configurer Keycloak n'est pas le compte d'une personne et n'est pas sollicité.
- Après plusieurs mots de passe erronés, le compte est verrouillé pour une pause qui s'allonge à chaque échec, jusqu'à 15 minutes.

## Désactiver le service de connexion

Si vous désactivez le domaine de sécurité `vps` dans Keycloak, il reste désactivé. Les mises à jour et les configurations ne le réactivent jamais, et les applications qui se connectent par lui apparaissent en attente dans l'onglet **Applications** jusqu'à ce que vous le réactiviez.

## Le nom de la page de connexion

Le nom de la page de connexion suit le domaine du serveur : après un [changement de domaine](/fr/configuration/domain/), il prend le nouveau domaine. Un nom que vous avez défini vous-même dans les paramètres du domaine de sécurité reste.

## Panneau Personnes (Catena Pro)

Le panneau **Personnes** du menu gère les comptes et les groupes depuis le panneau d'administration. Les éditions sont comparées sur [catena.run](https://catena.run/fr/#pricing).

Il affiche **Groupes**, avec les applications que chacun ouvre, et **Personnes**, avec le nom d'utilisateur, le courriel et la mention "désactivé" pour les comptes désactivés. Il permet d'inviter des personnes, de créer, renommer et supprimer des groupes, d'y ajouter des personnes et de désactiver des comptes.

**Inviter une personne** demande une adresse courriel, un prénom, un nom et un groupe, et pour un client l'accès aux applications à donner. La personne reçoit un courriel du service de connexion avec un lien pour confirmer l'adresse et choisir un mot de passe; le lien fonctionne pendant 3 jours. **Envoyer un lien de mot de passe**, sur la ligne de la personne, en envoie un nouveau. Les invitations exigent un [Courriel sortant](/fr/configuration/email/).

L'accès aux applications est réservé aux clients; les rôles du personnel se donnent dans l'application. Retirer l'accès de quelqu'un ferme l'application pour cette personne à sa prochaine connexion.

Avant qu'un groupe soit renommé ou supprimé, le panneau affiche "Ce que ce changement touche" : les "Applications protégées par ce groupe" et les "Personnes actuellement dans ce groupe". Les applications qui n'auraient plus de groupe ne seraient ouvertes qu'aux administrateurs : "Ces applications ne seraient plus ouvertes qu'aux administrateurs. Elles continuent de fonctionner et cessent discrètement d'admettre tout le monde." La confirmation applique exactement le changement qui a été montré; si la liste a changé entre-temps, le panneau vous demande de la relire.

Chaque changement est consigné dans le journal administratif.

Si le panneau indique "Ce serveur n'a pas encore d'identifiant d'annuaire, la liste des personnes ne peut donc pas être lue. Il arrive à la prochaine configuration.", lancez **Remettre ce serveur à niveau** dans [Paramètres du serveur](/fr/configuration/server/) pour le fournir.

## Dépannage

- Une personne accède à une application qu'elle ne devrait pas ouvrir : vérifiez ses groupes dans Keycloak, puis les groupes que l'application liste.
- Une application n'admet que les administrateurs : son groupe a été supprimé ou renommé. L'aperçu des répercussions du panneau Personnes l'indique à l'avance.
- Aucun courriel de réinitialisation : voir [Courriel sortant](/fr/configuration/email/).
