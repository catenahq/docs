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
- **[Fichiers à ne pas toucher](/fr/do-not-touch/)** -- les
  modifications manuelles sont écrasées au prochain push de votre
  opérateur. Voici ce qu'il faut laisser tranquille.

## Tâches quotidiennes

- **[Ajouter / retirer des utilisateurs](/fr/how-to-add-users/)** --
  marche-à-suivre Keycloak pour l'arrivée du personnel +
  réinitialisations.
- **[Déployer des applications (accès par département)](/fr/how-to-deploy-apps/)**
  -- restreindre les nouvelles applications à des équipes
  spécifiques avec des labels compose.
- **[Ce que vous pouvez faire vous-même](/fr/self-service/)** --
  tâches quotidiennes qui n'ont jamais besoin de votre opérateur.

## Gestion des sinistres

- **[Prévention](/fr/disaster-prevention/)** -- comment la suite
  réduit l'impact des défaillances courantes.
- **[Reprise](/fr/disaster-recovery/)** -- ce qui se passe quand le
  VPS est perdu.
- **[Auto-restauration](/fr/self-restore/)** -- le flux à un script
  que vous pouvez lancer vous-même pour démarrer un remplacement.

## Vos sous-domaines

Chaque installation catena publie le même ensemble de sous-domaines
sous votre zone. Votre portail affiche les valeurs réelles pour
**votre** déploiement. La forme :

| Service | Sous-domaine |
|---|---|
| Keycloak (identité + SSO) | `auth.yourdomain.com` |
| Dokploy (déploiement d'applications) | `admin.yourdomain.com` |
| Gatus (santé des services) | `monitor.yourdomain.com` |
| Homepage (tableau de bord) | `dash.yourdomain.com` |
| OliveTin (actions à un clic) | `actions.yourdomain.com` |
| Healthchecks (cron / homme mort) | `checks.yourdomain.com` |

> **Note :** Dans toute la documentation, `yourdomain.com` représente
> le domaine d'entreprise que vous avez fourni à l'intégration --
> la pastille en haut de cette page réécrit chaque occurrence à la
> volée afin que les URL affichées correspondent à votre
> installation.
