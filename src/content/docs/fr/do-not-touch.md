---
title: "Fichiers à ne pas toucher"
description: "Le VPS opère la machine entière et se maintient configuré. La seule règle : ne modifiez pas le serveur à la main."
---

Le VPS est géré de bout en bout. Il opère la machine entière et garde
sa propre configuration synchronisée, alors il n'y a vraiment qu'une
règle :

**Ne modifiez rien à la main sur le serveur lui-même.** Toute
modification faite directement sur la machine est écrasée au prochain
passage de réconciliation du système (la mise à jour hebdomadaire, ou
le prochain `catena converge`), et peut casser la reprise automatique.
Il existe presque certainement une façon prise en charge de rendre le
changement durable -- une étiquette compose, un réglage dans le panneau
catena-admin, ou une entrée dans votre configuration -- alors utilisez
celle-là.

Tout ce dont vous avez réellement besoin est exposé par les interfaces
web, et celles-ci sont à vous de modifier librement :

- Les applications que vous déployez via
  [Portainer](/fr/manage-apps/).
- Les utilisateurs, rôles et groupes dans
  [Keycloak](/fr/manage-users-and-roles/).
- Les canaux de notification dans Healthchecks, les tuiles du tableau
  de bord et les autres réglages dans les applications.

Si vous vous surprenez à ouvrir une session SSH pour éditer un fichier
à la main sur le serveur, arrêtez : obtenez le même résultat via une
étiquette compose ou le panneau catena-admin pour que le changement
survive à la prochaine réconciliation.
