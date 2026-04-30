---
title: Votre VPS, votre documentation
description: Documentation de référence publique pour la pile auto-hébergée catena. Les spécificités par-VPS vivent dans le portail client.
---

Ce wiki documente la pile catena telle que déployée sur votre VPS.
Chaque page s'applique à **toute installation catena** ; les
spécificités par-installation (vos noms de domaine, votre hôte
d'inventaire, votre seau S3) apparaissent dans le
[portail client](https://app.catena.run).

## Par où commencer

- **[Comment fonctionne cette pile](/fr/how-this-stack-works/)** --
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

- **[Prévention](/fr/disaster-prevention/)** -- comment la pile
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
| Keycloak (identité + SSO) | `auth.<votre-zone>` |
| Dokploy (déploiement d'applications) | `admin.<votre-zone>` |
| Gatus (santé des services) | `monitor.<votre-zone>` |
| Homepage (tableau de bord) | `dash.<votre-zone>` |
| OliveTin (actions à un clic) | `actions.<votre-zone>` |
| Healthchecks (cron / homme mort) | `checks.<votre-zone>` |
| Wiki par-VPS (ce site, servi depuis votre VPS) | `vps-docs.<votre-zone>` |

> **Note :** Ce site est aussi servi depuis votre propre VPS à
> `vps-docs.<votre-zone>`. La copie VPS est identique au bit près à
> docs.catena.run -- les deux proviennent du même artefact de
> publication. La copie sur-VPS est un repli souveraineté +
> hors-ligne ; traitez-les comme interchangeables.
