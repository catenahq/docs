---
title: "Qu'est-ce que Catena?"
description: "Catena est une suite logicielle installée sur un serveur qui vous appartient : les applications dont votre entreprise dépend, et l'environnement qui les garde accessibles, protégées par une connexion, sauvegardées, à jour et surveillées."
---

Catena est une suite logicielle installée sur un serveur qui vous appartient. Elle réunit deux choses : les applications dont votre entreprise dépend (fichiers, courriel, clavardage, réservation, CRM et plus), et l'environnement qui les garde accessibles, protégées par une connexion, sauvegardées, à jour et surveillées. Tout tourne sur votre propre serveur et vos propres comptes.

## À qui elle s'adresse

Aux petites et moyennes organisations qui veulent posséder les logiciels dont elles dépendent, avec une personne administratrice à l'aise avec SSH et Portainer. Catena est entièrement auto-hébergée : vous possédez et exploitez le serveur, et vous faites chaque tâche depuis le panneau d'administration ou avec des outils standards.

## Ce qui est installé

| Composant | Rôle |
|---|---|
| Tunnel Cloudflare | Achemine tout le trafic web vers le serveur : aucun port web n'est ouvert sur la machine. |
| Traefik | Dirige chaque adresse vers la bonne application. |
| Keycloak | Une seule connexion pour toutes les applications, des groupes décidant qui peut ouvrir quoi. |
| Portainer | Déploie et gère les applications. |
| catena-admin | Le panneau d'administration : état, actions, restauration, horaires et paramètres. |
| Sauvegardes restic | Sauvegardes chiffrées envoyées vers un stockage S3 qui vous appartient. |
| Gatus, Healthchecks, Beszel | Page d'état, alarmes de tâches manquées et graphiques de ressources du serveur. |
| Tailnet (facultatif) | Un réseau privé pour l'administration. |

## Adresses publiées par le serveur

Une fois votre domaine appliqué, chaque service répond sur son propre sous-domaine de `yourdomain.com` :

| Sous-domaine | Service |
|---|---|
| `auth.yourdomain.com` | Connexion Keycloak |
| `dash.yourdomain.com` | Le panneau d'administration |
| `portainer.yourdomain.com` | Portainer |
| `gatus.yourdomain.com` | Page d'état Gatus |
| `healthchecks.yourdomain.com` | Healthchecks |
| `beszel.yourdomain.com` | Graphiques de ressources Beszel |
| `turn.yourdomain.com` | Relais des appels audio et vidéo (pas une page web) |

Vous pouvez changer chaque nom dans **Paramètres** > **Sous-domaines des applications d'infrastructure**. Tant que vous n'avez appliqué aucun domaine, rien n'est publié et vous atteignez le panneau par un transfert de port SSH (voir [Installation](/fr/installation/)).

## Éditions

Communauté est gratuite et pleinement fonctionnelle : applications, authentification unique, sauvegardes manuelles, restauration du serveur entier, mises à jour manuelles et surveillance. Catena Pro et Catena Business débloquent d'autres fonctions du panneau et d'automatisation, comme les horaires, les mises à jour gérées, Personnes et les copies hors site, au moyen d'une clé d'abonnement. Vos applications et vos données ne sont jamais verrouillées. La comparaison se trouve sur la [page des tarifs](https://catena.run/fr/#pricing).

## Propriété des données

Le serveur, le domaine, le compte Cloudflare, le stockage de sauvegarde et les comptes de connexion vous appartiennent tous. Les sauvegardes sont des dépôts restic standards que n'importe quel ordinateur peut lire avec votre mot de passe de sauvegarde, et vous pouvez retirer le panneau sans toucher aux applications. Voir [Sauvegarde, restauration et migration](/fr/features/backup-restore-migrate/).

## Par où commencer

1. [Installation](/fr/installation/) : exigences et installateur.
2. [Vue d'ensemble de la configuration](/fr/configuration/) : l'ordre de la première configuration.
3. Fonctions : [Connexions sécurisées](/fr/features/secure-connections/), [Sauvegarde, restauration et migration](/fr/features/backup-restore-migrate/), [Authentification unique](/fr/features/single-sign-on/), [Mises à jour sûres](/fr/features/safe-updates/), [Tableau de bord d'administration](/fr/features/admin-dashboard/), [Supervision et alertes](/fr/features/monitoring-alerts/).
4. [Configurer une application pour Catena](/fr/configure-apps/) : routage, accès et mises à jour d'une application déployée depuis Portainer.
