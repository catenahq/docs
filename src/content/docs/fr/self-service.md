---
title: "Libre-service — ce que vous pouvez faire sans l'opérateur"
description: "Règle empirique : tout ce que les interfaces web exposent, vous pouvez"
---

Règle empirique : tout ce que les interfaces web exposent, vous pouvez
le faire vous-même. Tout ce qui requiert un accès SSH et sudo passe par
l'opérateur.

## Oui, faites-le vous-même

- Ajouter / retirer des comptes d'employés : interface Keycloak
  (`auth.yourdomain.com`).
- Déployer de nouvelles applications : interface Dokploy
  (`admin.yourdomain.com`).
- Vérifier la santé des services : Gatus
  (`monitor.yourdomain.com`) ou Homepage
  (`dash.yourdomain.com`).
- Lancer des sauvegardes ponctuelles, consulter l'historique des
  sauvegardes : OliveTin (`actions.yourdomain.com`).
- Voir les alertes actives : Healthchecks (`checks.yourdomain.com`).

## Passez par l'opérateur

- Mises à niveau majeures d'Keycloak, de Dokploy ou de Postgres.
- Changements à la topologie CF Tunnel ou DNS.
- Restauration à partir d'une sauvegarde (destructif ; exige le VPS en
  état suspendu).
- Migration vers un autre fournisseur de VPS.
- Toute opération impliquant SSH.
