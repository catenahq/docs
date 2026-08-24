---
title: "Quitter Catena"
description: "Comment faire fonctionner, sauvegarder et restaurer la suite sans Catena, et comment partir complètement. Les données ne sont jamais captives."
---

Catena est une couche de commodité par-dessus des outils standards et
ouverts. Tout ce qui se trouve sur le serveur vit dans des formats que
ces outils seuls savent lire et restaurer : partir coûte du confort,
jamais des données. Cette page montre exactement comment, et ce sont
les mêmes commandes que Catena exécute derrière les boutons.

<!-- Mainteneurs : les commandes de cette page sont exercées telles
     quelles par la répétition sovereign_exit. Une commande modifiée ici
     se met à jour dans la répétition au même changement, et
     inversement. -->

## Ce qui appartient au client, et où cela vit

- **Données des applications** - chaque application conserve ses données
  dans son propre format standard (sa base de données et ses fichiers)
  sur le serveur, exactement comme une installation autonome de cette
  application. Voir [Où vivent les données](/fr/where-is-my-data/).
- **Sauvegardes** - un dépôt [restic](https://restic.net/) standard dans
  un espace de stockage appartenant au client. Tout ordinateur avec
  restic peut le lire, pour toujours.
- **Réglages et identifiants internes** - un fichier lisible sur le
  serveur à `/etc/catena/config.json`, inclus dans chaque sauvegarde.
- **Comptes de connexion** - conservés par Keycloak, le service
  d'authentification à code source ouvert, dans sa propre base de
  données sur le serveur ; exportables avec les outils de Keycloak.

## Les trois choses à conserver

La [trousse de récupération](/fr/disaster-prevention/) est la seule
chose qui doit vivre hors du serveur : l'adresse du dépôt de
sauvegarde, les clés d'accès au stockage et le mot de passe de
sauvegarde. Ces trois éléments et n'importe quel ordinateur rendent les
données récupérables - avec ou sans Catena.

## Sauvegarder sans le panneau

Le bouton de sauvegarde du panneau d'administration démarre un service
système sur le serveur. Le même service se démarre à la main :

```sh
sudo systemctl start catena-backup.service
```

Travailler directement avec le dépôt de sauvegarde demande de charger
les paramètres de connexion déjà conservés sur le serveur, puis
d'utiliser restic directement :

```sh
sudo bash -c 'set -a; . /etc/catena/backup.env; set +a; restic snapshots'
```

## Restaurer sans le panneau

N'importe quel fichier ou dossier se restaure depuis le dernier
instantané avec restic, en n'utilisant que les paramètres du serveur :

```sh
sudo bash -c 'set -a; . /etc/catena/backup.env; set +a; \
  restic restore latest --target / --include /chemin/a/restaurer'
```

Les applications tournent sous l'orchestrateur de Docker : les
commandes Docker standards les listent et arrêtent ou démarrent
n'importe laquelle :

```sh
docker service ls
docker service scale <nom>=0
docker service scale <nom>=1
```

Passer à zéro, c'est l'arrêt ; revenir à un, c'est le démarrage. Docker
maintient chaque application en marche de lui-même, d'où la demande
plutôt qu'une action directe sur un conteneur.

Reconstruire un serveur entier à partir de la seule trousse suit
[Reconstruire un serveur à partir de la sauvegarde](/fr/self-restore/).
Ce parcours utilise l'installateur librement disponible et fonctionne
sans le panneau d'administration.

## Partir complètement

1. **Exporter ce qui est nécessaire** avec les outils propres à chaque
   application (chaque application du catalogue a un chemin
   d'exportation standard ; voir sa page sous Applications).
2. **Pointer le domaine ailleurs** chez le fournisseur DNS le moment
   venu ; rien sur le serveur ne dépend de Catena pour continuer à
   servir d'ici là.
3. **Conserver les sauvegardes** - le dépôt restic dans l'espace de
   stockage reste lisible avec restic seul, tant que la trousse est
   gardée.

Supprimer le panneau d'administration lui-même ne change rien aux
données ni aux applications en marche. C'est une couche d'affichage et
de commodité ; son retrait est répété dans le cadre de la
[validation continue](/fr/trust/) de Catena.

## Ce qui est perdu

L'automatisation et le confort : la récupération en une commande, le
câblage de la surveillance, les mises à jour gérées et le panneau
lui-même. Jamais les données, ni la capacité de faire fonctionner ce
qui est déjà là.
