---
title: "Gérer les utilisateurs et les rôles"
description: "Créez les comptes du personnel et des clients dans Keycloak et attribuez les rôles qui déterminent les applications accessibles à chaque personne."
---

Toute personne qui se connecte à l'une de vos applications possède un
seul compte dans **Keycloak**, votre serveur d'identité à
`auth.yourdomain.com`. Le rôle (groupe Keycloak) dans lequel vous la
placez détermine les applications qu'elle peut atteindre --
[l'accès aux applications est filtré par groupe](/fr/manage-apps/),
alors définir le bon rôle ici est ce qui ouvre ou ferme la porte
partout ailleurs.

Connectez-vous à `auth.yourdomain.com` avec votre compte
administrateur pour gérer les personnes.

## Ajouter une personne

1. **Interface d'administration -> Directory -> Users -> Create.**
2. Remplissez le nom d'utilisateur et le courriel. Définissez un mot
   de passe fort, ou laissez-le vide et envoyez une invitation --
   Keycloak expédie un lien pour définir le mot de passe (cela suppose
   que l'expéditeur de courriel sortant est configuré ; il l'est, une
   fois la rencontre d'installation terminée).
3. Attribuez le rôle (groupe). Voir plus bas.
4. La personne peut alors se connecter à n'importe quel sous-domaine
   d'application (`dash.yourdomain.com`, `monitor.yourdomain.com`, et
   les autres) avec son courriel et son mot de passe.

## Les rôles

Les rôles sont des groupes Keycloak. Quatre niveaux, l'accès le plus
large en bas :

| Rôle | Qui c'est | Accès par défaut |
|---|---|---|
| `client` | Vos utilisateurs externes (clients, partenaires) | Seulement les applications explicitement ouvertes à `client`. Les nouveaux comptes atterrissent ici. |
| `staff` | Vos employés | Toute application ouverte à `staff`. La base pour votre équipe. |
| Sous-groupe de `staff` (p. ex. `accounting`, `engineering`) | Une équipe au sein du personnel | Les applications ouvertes à ce département seulement. Pour un contrôle plus fin. |
| `admin` | Qui opère le serveur (vous, et toute personne à qui vous confiez le contrôle total) | Tout, toujours. À attribuer délibérément -- jamais par défaut. |

- Un employé régulier va dans `staff`.
- Une personne qui ne doit voir que les applications d'un département
  va dans le sous-groupe correspondant, plutôt qu'à (ou en plus de)
  `staff`.
- Un utilisateur externe reste dans `client`.
- Ne touchez pas à `admin` sans raison précise.

Pour modifier l'accès de quelqu'un, ajoutez-le ou retirez-le d'un
groupe sous **Directory -> Groups**. Le changement prend effet à sa
prochaine connexion.

## Ce que les gens peuvent faire sans vous

Ces flux fonctionnent seuls, sans demande :

- Réinitialisation du mot de passe (lien par courriel depuis la page
  de connexion).
- Modification du profil (nom affiché, courriel).
- Activation de l'authentification multifacteur sur son propre compte.

## Retirer quelqu'un

Désactivez ou supprimez le compte sous **Directory -> Users**. La
désactivation conserve la fiche mais bloque la connexion
immédiatement dans toutes les applications -- le choix le plus sûr au
départ de quelqu'un, car c'est réversible et cela préserve l'historique
lié au compte dans chaque application.
