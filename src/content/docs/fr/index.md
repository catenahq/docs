---
title: Votre VPS, votre documentation
description: Documentation de référence publique pour la suite logicielle auto-hébergée catena. Les spécificités par-VPS vivent dans le portail client.
---

Voici la documentation de référence publique pour la suite logicielle
catena telle que déployée sur votre VPS. Chaque page s'applique à
**toute installation catena** ; les spécificités par-installation
(vos noms de domaine, votre hôte d'inventaire, votre seau S3)
apparaissent dans le [portail client](https://app.catena.run).

Si vous évaluez catena, commencez par
[Comment fonctionne cette suite logicielle](/fr/how-this-stack-works/)
pour la visite en langage clair. Si vous êtes déjà client, votre
portail vous renvoie ici en contexte pour les tâches opérationnelles
du quotidien.

## Par où commencer

- **[Comment fonctionne cette suite logicielle](/fr/how-this-stack-works/)** --
  une visite en langage clair des services et de comment ils
  s'assemblent. Commencez ici si c'est votre première fois.
- **[Où vivent vos données](/fr/where-is-my-data/)** -- ce qui est
  sur le VPS, ce qui est dans votre seau S3, ce qui est perdu si le
  VPS prend feu.
- **[Fichiers à ne pas toucher](/fr/do-not-touch/)** -- le VPS opère
  la machine entière et gère ses propres fichiers. Voici la seule
  règle à suivre.

## Au quotidien

- **[Gérer les utilisateurs et les rôles](/fr/manage-users-and-roles/)**
  -- créez les comptes dans Keycloak et attribuez le rôle qui décide
  des applications accessibles à chaque personne.
- **[Gérer les applications](/fr/manage-apps/)** -- déployez de
  nouvelles applications et posez les étiquettes qui filtrent l'accès
  et publient l'URL.
- **[Ce que vous pouvez faire vous-même](/fr/self-service/)** --
  tâches quotidiennes qui n'ont jamais besoin de nous joindre.

## Tâches

- **[Tâches récurrentes](/fr/disaster-prevention/)** -- la courte
  liste à faire à l'intégration, une fois par mois et une fois par
  an pour que la reprise reste toujours possible.
- **[Se remettre d'une panne](/fr/disaster-recovery/)** -- ce qui se
  passe, et ce que vous faites, quand le VPS est perdu.
- **[Reconstruire votre serveur vous-même](/fr/self-restore/)** -- le
  flux à un script que vous pouvez lancer pour démarrer un
  remplacement.
- **[Archive courriel](/fr/email-archive/)** -- comment l'historique
  de vos courriels est capté dans vos sauvegardes, et comment
  l'activer.

## Vos sous-domaines

Chaque installation catena publie le même ensemble de sous-domaines
sous votre zone. Votre portail affiche les valeurs réelles pour
**votre** déploiement. La forme :

| Service | Sous-domaine |
|---|---|
| Keycloak (identité + SSO) | `auth.yourdomain.com` |
| Portainer (déploiement d'applications) | `portainer.yourdomain.com` |
| Gatus (santé des services) | `monitor.yourdomain.com` |
| Homepage (tableau de bord) | `dash.yourdomain.com` |
| OliveTin (actions à un clic) | `actions.yourdomain.com` |
| Healthchecks (cron / homme mort) | `checks.yourdomain.com` |

> **Note :** Dans toute la documentation, `yourdomain.com` représente
> le domaine d'entreprise que vous avez fourni à l'intégration --
> la pastille en haut de cette page réécrit chaque occurrence à la
> volée afin que les URL affichées correspondent à votre
> installation.
