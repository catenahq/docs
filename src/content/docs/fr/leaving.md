---
title: "Quitter Catena"
description: "Comment faire fonctionner, sauvegarder et restaurer votre suite sans Catena, et comment partir complètement. Vos données ne sont jamais captives."
---

Catena est une couche de commodité par-dessus des outils standards et
ouverts. Tout ce qui vous appartient vit dans des formats que vous
pouvez lire et restaurer avec ces outils seuls : partir vous coûte du
confort, jamais vos données. Cette page montre exactement comment, et ce
sont les mêmes commandes que Catena exécute derrière les boutons.

<!-- Mainteneurs : les commandes de cette page sont exercées telles
     quelles par la répétition sovereign_exit. Si vous changez une
     commande ici, mettez la répétition à jour dans le même changement,
     et inversement. -->

## Ce qui vous appartient et où cela vit

- **Données des applications** - chaque application conserve ses données
  dans son propre format standard (sa base de données et ses fichiers)
  sur votre serveur, exactement comme une installation autonome de cette
  application. Voir [Où sont mes données?](/fr/where-is-my-data/).
- **Sauvegardes** - un dépôt [restic](https://restic.net/) standard dans
  votre propre espace de stockage. Tout ordinateur avec restic peut le
  lire, pour toujours.
- **Réglages et identifiants internes** - un fichier lisible sur votre
  serveur à `/etc/catena/config.json`, inclus dans chaque sauvegarde.
- **Comptes de connexion** - conservés par Keycloak, le service
  d'authentification à code source ouvert, dans sa propre base de
  données sur votre serveur; exportables avec les outils de Keycloak.

## Les trois choses à conserver

Votre [trousse de récupération](/fr/disaster-prevention/) est la seule
chose qui doit vivre hors de votre serveur : l'adresse du dépôt de
sauvegarde, les clés d'accès au stockage et le mot de passe de
sauvegarde. Avec ces trois éléments et n'importe quel ordinateur, vos
données sont récupérables - avec ou sans Catena.

## Sauvegarder sans le panneau

Le bouton de sauvegarde du panneau d'administration démarre un service
système sur votre serveur. Vous pouvez démarrer le même service
vous-même :

```sh
sudo systemctl start catena-backup.service
```

Pour travailler directement avec le dépôt de sauvegarde, chargez les
paramètres de connexion déjà conservés sur votre serveur, puis utilisez
restic directement :

```sh
sudo bash -c 'set -a; . /etc/catena/backup.env; set +a; restic snapshots'
```

## Restaurer sans le panneau

Restaurez n'importe quel fichier ou dossier depuis le dernier instantané
avec restic, en n'utilisant que les paramètres de votre serveur :

```sh
sudo bash -c 'set -a; . /etc/catena/backup.env; set +a; \
  restic restore latest --target / --include /chemin/a/restaurer'
```

Les applications sont des conteneurs ordinaires. Voyez ce qui tourne et
démarrez ou arrêtez n'importe quoi avec les commandes Docker standards :

```sh
docker ps
docker start <nom>
```

Pour reconstruire un serveur entier à partir de votre seule trousse,
suivez [Restaurer votre serveur vous-même](/fr/self-restore/). Ce
parcours utilise l'installateur librement disponible et fonctionne sans
le panneau d'administration.

## Partir complètement

1. **Exportez ce dont vous avez besoin** avec les outils propres à
   chaque application (chaque application du catalogue a un chemin
   d'exportation standard; voir sa page sous Applications).
2. **Pointez votre domaine ailleurs** chez votre fournisseur DNS quand
   vous êtes prêt; rien sur le serveur ne dépend de Catena pour
   continuer à servir d'ici là.
3. **Conservez vos sauvegardes** - le dépôt restic dans votre espace de
   stockage reste lisible avec restic seul, tant que vous gardez la
   trousse.

Supprimer le panneau d'administration lui-même ne change rien à vos
données ni à vos applications en marche. C'est une couche d'affichage et
de commodité; son retrait est répété dans le cadre de la
[validation continue](/fr/trust/how-we-validate/) de Catena.

## Ce que vous perdez

L'automatisation et le confort : la récupération en une commande, le
câblage de la surveillance, les mises à jour gérées et le panneau
lui-même. Jamais vos données, ni la capacité de faire fonctionner ce que
vous avez déjà.
