---
title: "Sauvegarde, restauration et migration"
description: "Sauvegardes chiffrées vers un stockage qui vous appartient, restauration depuis le panneau, déplacement vers un autre serveur et départ de Catena avec des outils standards."
---

Des copies chiffrées de toutes les données des applications et de la configuration du serveur vont vers un stockage S3 qui vous appartient. Vous pouvez reconstruire un serveur perdu sur une nouvelle machine à partir de la seule adresse de sauvegarde, des clés de stockage et du mot de passe de sauvegarde. Vous pouvez ramener en arrière un serveur en marche depuis le panneau, et déplacer un serveur entier vers un autre avec quelques minutes d'indisponibilité.

## Fonctionnement des sauvegardes

- **Stockage et chiffrement.** restic chiffre sur le serveur avant tout envoi. Le dépôt est une seule adresse, de la forme `s3:https://<point-d-acces>/<seau>`, que vous saisissez dans **Paramètres** > **Dépôt de sauvegarde** avec ses deux clés S3. Le serveur génère le mot de passe de sauvegarde dans **Paramètres** > **Mot de passe de sauvegarde**, l'affiche une seule fois et ne le conserve nulle part ailleurs : enregistrez-le dans un gestionnaire de mots de passe. Vous pouvez le vérifier contre le dépôt ou le changer, ce qui ré-encode le dépôt.
- **Contenu.** Les données et volumes des applications, la configuration du serveur (dont `/etc/catena/config.json`) et la piste d'audit. Vous déclarez les dossiers supplémentaires dans **Autres dossiers à sauvegarder**; un conteneur qui monte un chemin hors de l'ensemble sauvegardé fait échouer l'exécution plutôt que d'être ignoré en silence.
- **Bases de données.** Avant chaque instantané, chaque conteneur en marche dont le nom d'image contient `postgres` est vidé avec `pg_dumpall`, de même que chaque conteneur `mariadb` ou `mysql` (qui exige `MARIADB_ROOT_PASSWORD` ou `MYSQL_ROOT_PASSWORD` dans son environnement). Un vidage qui échoue fait échouer la sauvegarde. Les autres moteurs, comme MongoDB ou SQLite, n'ont aucun vidage automatique, et les applications ne sont pas mises en pause autour d'une sauvegarde.
- **Rétention.** Par défaut : 24 horaires, 7 quotidiens, 4 hebdomadaires et 6 mensuels, que vous pouvez modifier dans la page **Horaires**.
- **Cadence.** Un bouton de sauvegarde est toujours offert dans **Actions**. Un horaire de sauvegarde (le dimanche à 3 h par défaut, toute cadence permise) reste désactivé jusqu'à ce que vous l'activiez, ce qui exige Catena Pro ou Catena Business. Healthchecks reçoit un signal après chaque exécution.
- **Consultation.** Vous pouvez lister les instantanés, les parcourir en lecture seule et les exporter vers une archive depuis **Actions**, sans restauration.

## Restauration

La page **Restauration** restaure tout à partir des sauvegardes de ce serveur, ou d'un autre dépôt de sauvegarde (celui d'un autre serveur, ou une copie comme la copie hors site), à partir de son adresse, du mot de passe de sauvegarde et des clés de stockage, conservés en mémoire seulement. Le panneau, la connexion et l'authentification restent accessibles pendant le remplacement des applications. Vous pouvez reprendre une restauration interrompue avec la même sauvegarde. Une sauvegarde plus récente que la version en marche est refusée. Les applications qu'une restauration ramène restent à l'arrêt jusqu'à ce que vous les démarriez depuis la page **Restauration**, et un déplacement les démarre avec le serveur. Après une reconstruction ou un déplacement, la piste d'audit du serveur précédent est conservée à côté de celle du nouveau, et chaque exportation la contient. Voir [Restauration et migration](/fr/configuration/restore-and-migrate/).

## Migration

Un nouveau serveur tire depuis l'ancien avec **Déplacer un autre serveur ici**. Le panneau **Migration** de l'ancien serveur ouvre une fenêtre de 4 heures et affiche un billet de déplacement et un code d'appairage à usage unique, avec lesquels le nouveau serveur joint l'ancien par SSH. L'essentiel des données est copié pendant que l'ancien serveur continue de servir. Jusqu'à la vérification de la sauvegarde finale, vous pouvez annuler le déplacement et l'ancien serveur se remet en service de lui-même. Les deux serveurs doivent exécuter la même version. La clé d'abonnement suit les données.

## Copies hors site

**Copies hors site** copie chaque seau déclaré vers un seau verrouillé (Object Lock) chez un autre fournisseur, en ajout seulement : rien n'est jamais supprimé. Vous pouvez restaurer depuis une copie sur place, ou remettre un seau en place depuis elle.

## Ce qu'ajoute chaque édition

Communauté offre les sauvegardes manuelles, la consultation des instantanés, la restauration et la reconstruction du serveur entier, et le côté récepteur d'une migration. Catena Pro ajoute les horaires, la restauration d'une seule application, le rapport de restauration et le côté source d'une migration, et Catena Business ajoute les copies hors site. Voir la [comparaison des éditions](https://catena.run/fr/#pricing).

## Limites

- Il vous faut un dépôt compatible S3, et si vous perdez le mot de passe de sauvegarde, les sauvegardes deviennent illisibles.
- Un seau de fichiers copié hors site n'est restaurable qu'accompagné d'un instantané de base de données du même moment.
- Restaurer une application ne ramène pas en arrière les réglages du serveur.

## Configuration

- [Sauvegardes et stockage S3](/fr/configuration/backups/)
- [Horaires](/fr/configuration/schedules/)
- [Restauration et migration](/fr/configuration/restore-and-migrate/)

## Quitter Catena

Catena est une couche de commodité par-dessus des outils standards et ouverts. Tout ce qui se trouve sur le serveur vit dans des formats que ces outils savent lire et restaurer : partir coûte du confort, jamais des données. Les commandes ci-dessous sont celles que Catena exécute derrière ses boutons.

Ce qui vous appartient, et où cela vit :

- **Données des applications** : chaque application conserve sa base de données et ses fichiers sur le serveur, dans son propre format standard.
- **Sauvegardes** : un dépôt [restic](https://restic.net/) standard dans un seau qui vous appartient, lisible par tout ordinateur muni de restic.
- **Réglages et identifiants internes** : un fichier lisible à `/etc/catena/config.json`, inclus dans chaque sauvegarde.
- **Comptes de connexion** : conservés par Keycloak dans sa propre base de données sur le serveur, exportables avec les outils de Keycloak.

Trois éléments doivent vivre hors du serveur : l'adresse du dépôt de sauvegarde, les clés d'accès au stockage et le mot de passe de sauvegarde (visibles dans **Paramètres** > **Trousse de reprise après sinistre**). Avec ces éléments et n'importe quel ordinateur, vous pouvez récupérer les données, avec ou sans Catena.

Sauvegarder sans le panneau. Le bouton du panneau démarre un service système, que vous pouvez aussi démarrer à la main :

```sh
sudo systemctl start catena-backup.service
```

Pour travailler directement avec le dépôt, chargez les paramètres de connexion déjà conservés sur le serveur, puis utilisez restic directement :

```sh
sudo bash -c 'set -a; . /etc/catena/backup.env; set +a; restic snapshots'
```

Restaurer sans le panneau. Vous pouvez restaurer n'importe quel fichier ou dossier depuis le dernier instantané :

```sh
sudo bash -c 'set -a; . /etc/catena/backup.env; set +a; \
  restic restore latest --target / --include /chemin/a/restaurer'
```

Après une restauration, les applications qu'elle a ramenées restent à l'arrêt. Démarrez-les sans le panneau avec la commande ci-dessous, en répétant `-app` pour chaque application. Le nom est celui que Docker donne à l'application, comme `catena-nextcloud`. Un nom que la restauration n'a pas laissé à l'arrêt est refusé, et le refus liste ceux qu'elle a laissés. La commande exécute le même démarrage que la page **Restauration** : la vérification des bases de données, la sortie du mode sauvegarde, puis la remise à niveau du serveur.

```sh
sudo catena-recovery start-apps -app <nom>
```

Les applications tournent sous l'orchestrateur de Docker : les commandes Docker standards vous permettent de les lister et d'arrêter ou de démarrer n'importe laquelle :

```sh
docker service ls
docker service scale <nom>=0
docker service scale <nom>=1
```

Passer à zéro, c'est l'arrêt; revenir à un, c'est le démarrage. Une application qu'une restauration a laissée à l'arrêt n'a aucun service tant qu'elle n'est pas démarrée : `docker service scale` ne la démarre donc pas. Vous reconstruisez un serveur entier à partir de la trousse en suivant [Restauration et migration](/fr/configuration/restore-and-migrate/), ce qui fonctionne sans le panneau d'administration.

Pour partir complètement :

1. Exportez ce dont vous avez besoin avec les outils propres à chaque application.
2. Pointez votre domaine ailleurs chez votre fournisseur DNS le moment venu; rien sur le serveur ne dépend de Catena pour continuer à servir d'ici là.
3. Conservez les sauvegardes : le dépôt restic reste lisible avec restic seul, tant que vous gardez la trousse.

Supprimer le panneau d'administration ne change rien aux données ni aux applications en marche. Ce que vous perdez, c'est l'automatisation et le confort : la récupération en une commande, le câblage de la surveillance, les mises à jour gérées et le panneau lui-même. Jamais les données.
