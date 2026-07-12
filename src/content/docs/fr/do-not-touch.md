---
title: "Fichiers et répertoires appartenant à la suite logicielle"
description: "En bref : si un fichier sous les chemins ci-dessous est modifié à la"
---

En bref : si un fichier sous les chemins ci-dessous est modifié à la
main, la prochaine exécution de maintenance de votre opérateur
écrasera vos modifications. Dites plutôt à votre opérateur ce que
vous vouliez faire -- il a presque certainement un drapeau ou un
autre chemin prévu pour cela.

Ne modifiez pas à la main :

- `/etc/catena/traefik/dynamic/*.yml` -- géré par `dashboard-sync`
- `/etc/catena/backup.env` -- géré par l'automatisation de votre
  opérateur
- `/etc/catena/restic.pass` -- géré par l'automatisation de votre
  opérateur
- `/etc/systemd/system/catena-*.{service,timer}` -- géré par
  l'automatisation de votre opérateur
- `/usr/local/bin/run-backup.sh`, `/usr/local/bin/dashboard-sync`,
  `/usr/local/bin/gatus-sync`, `/usr/local/bin/auto-update.sh` --
  gérés par l'automatisation de votre opérateur

Si un fichier à l'un de ces chemins porte un en-tête indiquant
qu'il a été généré automatiquement, traitez-le comme étant en
lecture seule.

Ce que vous POUVEZ modifier sans permission préalable :

- Les applications déployées via l'interface de Portainer (elles vous
  appartiennent).
- Vos utilisateurs et groupes Keycloak (c'est le propre du libre-service).
- Tout ce qui se trouve dans `/home/<vos-utilisateurs>/` (l'opérateur
  ne touche pas aux répertoires personnels).
