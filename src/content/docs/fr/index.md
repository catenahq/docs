---
title: Documentation de référence du VPS
description: Documentation de référence publique pour la suite logicielle auto-hébergée catena.
---

Voici la documentation de référence publique pour la suite logicielle
catena telle que déployée sur un VPS. Chaque page s'applique à
**toute installation catena** ; les spécificités par-installation
(noms de domaine, hôte d'inventaire, seau S3) sont celles avec
lesquelles ce déploiement précis a été configuré.

Pour une évaluation,
[Comment fonctionne cette suite logicielle](/fr/how-this-stack-works/)
est la visite en langage clair.

## Par où commencer

- **[Comment fonctionne cette suite logicielle](/fr/how-this-stack-works/)** --
  une visite en langage clair des services et de comment ils
  s'assemblent. Le point de départ à la première lecture.
- **[Où vivent les données](/fr/where-is-my-data/)** -- ce qui est
  sur le VPS, ce qui est dans le seau S3, ce qui est perdu si le
  VPS prend feu.
- **[Fichiers à ne pas modifier](/fr/do-not-touch/)** -- le VPS opère
  la machine entière et gère ses propres fichiers. Une seule règle
  suffit.

## Au quotidien

- **[Gérer les utilisateurs et les rôles](/fr/manage-users-and-roles/)**
  -- créer les comptes dans Keycloak et attribuer le rôle qui décide
  des applications accessibles à chaque personne.
- **[Gérer les applications](/fr/manage-apps/)** -- déployer de
  nouvelles applications et poser les étiquettes qui filtrent l'accès
  et publient l'URL.
- **[Ce que couvre le panneau d'administration](/fr/self-service/)** --
  tâches quotidiennes qui n'ont jamais besoin de nous joindre.

## Tâches

- **[Tâches récurrentes](/fr/disaster-prevention/)** -- la courte
  liste à faire à l'intégration, une fois par mois et une fois par
  an pour que la reprise reste toujours possible.
- **[Se remettre d'une panne](/fr/disaster-recovery/)** -- ce qui se
  passe, et ce qu'il faut faire, quand le VPS est perdu.
- **[Reconstruire un serveur à partir de la sauvegarde](/fr/self-restore/)**
  -- le flux à un script qui démarre un remplacement.

## Les sous-domaines

Chaque installation catena publie le même ensemble de sous-domaines
sous sa zone. La forme :

| Service | Sous-domaine |
|---|---|
| Keycloak (identité + SSO) | `auth.yourdomain.com` |
| Portainer (déploiement d'applications) | `portainer.yourdomain.com` |
| Gatus (santé des services) | `monitor.yourdomain.com` |
| catena-admin (tableau de bord + actions à un clic) | `dash.yourdomain.com` |
| Healthchecks (cron / homme mort) | `heartbeat.yourdomain.com` |

> **Note :** Dans toute la documentation, `yourdomain.com` représente
> le domaine d'entreprise fourni à l'intégration -- la pastille en
> haut de cette page réécrit chaque occurrence à la volée afin que
> les URL affichées correspondent à l'installation décrite.
