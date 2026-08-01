---
title: "Fichiers à ne pas modifier"
description: "Le VPS opère la machine entière et se maintient configuré. La seule règle : rien sur le serveur ne se modifie à la main."
---

Le VPS est géré de bout en bout. Il opère la machine entière et garde
sa propre configuration synchronisée, alors il n'y a vraiment qu'une
règle :

**Rien ne se modifie à la main sur le serveur lui-même.** Toute
modification faite directement sur la machine est écrasée au prochain
passage de réconciliation du système (la mise à jour hebdomadaire, ou
le prochain `catena converge`), et peut casser la reprise automatique.
Il existe presque certainement une façon prise en charge de rendre le
changement durable -- une étiquette compose, un réglage dans le panneau
catena-admin, ou une entrée dans la configuration -- et c'est celle-là
qu'il faut employer.

Tout ce qui est réellement nécessaire est exposé par les interfaces
web, et celles-ci se modifient librement :

- Les applications déployées via [Portainer](/fr/manage-apps/).
- Les utilisateurs, rôles et groupes dans
  [Keycloak](/fr/manage-users-and-roles/).
- Les canaux de notification dans Healthchecks, les tuiles du tableau
  de bord et les autres réglages dans les applications.

Ouvrir une session SSH pour éditer un fichier à la main sur le serveur
est le signal qu'il faut s'arrêter : le même résultat obtenu via une
étiquette compose ou le panneau catena-admin survit à la prochaine
réconciliation.
