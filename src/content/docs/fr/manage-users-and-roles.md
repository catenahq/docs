---
title: "Gérer les utilisateurs et les rôles"
description: "Créer les comptes du personnel et des clients dans Keycloak et attribuer les rôles qui déterminent les applications accessibles à chaque personne."
---

Toute personne qui se connecte à une application du serveur possède un
seul compte dans **Keycloak**, le serveur d'identité à
`auth.yourdomain.com`. Le rôle (groupe Keycloak) auquel elle appartient
détermine les applications qu'elle peut atteindre --
[l'accès aux applications est filtré par groupe](/fr/manage-apps/),
alors définir le bon rôle ici est ce qui ouvre ou ferme la porte
partout ailleurs.

La gestion des personnes se fait en se connectant à
`auth.yourdomain.com` avec un compte administrateur.

## Ajouter une personne

1. **Interface d'administration -> Directory -> Users -> Create.**
2. Remplir le nom d'utilisateur et le courriel. Définir un mot de passe
   fort, ou le laisser vide et envoyer une invitation -- Keycloak
   expédie un lien pour définir le mot de passe (cela suppose que
   l'expéditeur de courriel sortant est configuré ; il l'est, une fois
   la rencontre d'installation terminée).
3. Attribuer le rôle (groupe). Voir plus bas.
4. La personne peut alors se connecter à n'importe quel sous-domaine
   d'application (`dash.yourdomain.com`, `monitor.yourdomain.com`, et
   les autres) avec son courriel et son mot de passe.

## Les rôles

Les rôles sont des groupes Keycloak. Quatre niveaux, l'accès le plus
large en bas :

| Rôle | Qui c'est | Accès par défaut |
|---|---|---|
| `client` | Les utilisateurs externes (clients, partenaires) | Seulement les applications explicitement ouvertes à `client`. Les nouveaux comptes atterrissent ici. |
| `staff` | Les employés | Toute application ouverte à `staff`. La base pour l'équipe. |
| Sous-groupe de `staff` (p. ex. `accounting`, `engineering`) | Une équipe au sein du personnel | Les applications ouvertes à ce département seulement. Pour un contrôle plus fin. |
| `admin` | Qui opère le serveur, et toute personne à qui le contrôle total est confié | Tout, toujours. À attribuer délibérément -- jamais par défaut. |

- Un employé régulier va dans `staff`.
- Une personne qui ne doit voir que les applications d'un département
  va dans le sous-groupe correspondant, plutôt qu'à (ou en plus de)
  `staff`.
- Un utilisateur externe reste dans `client`.
- `admin` reste intact sans raison précise.

L'accès se modifie en ajoutant ou en retirant le compte d'un groupe
sous **Directory -> Groups**. Le changement prend effet à la prochaine
connexion de cette personne.

## Ce que les gens peuvent faire sans assistance

Ces flux fonctionnent seuls, sans demande :

- Réinitialisation du mot de passe (lien par courriel depuis la page
  de connexion).
- Modification du profil (nom affiché, courriel).
- Activation de l'authentification multifacteur sur son propre compte.

## Retirer quelqu'un

Désactiver ou supprimer le compte sous **Directory -> Users**. La
désactivation conserve la fiche mais bloque la connexion
immédiatement dans toutes les applications -- le choix le plus sûr au
départ de quelqu'un, car c'est réversible et cela préserve l'historique
lié au compte dans chaque application.
