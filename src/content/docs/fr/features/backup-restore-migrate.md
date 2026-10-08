---
title: "Sauvegarde, restauration et migration"
description: "Sauvegardes chiffrées vers un stockage appartenant au client, restauration depuis le panneau, déplacement vers un autre serveur et départ de Catena avec des outils standards."
---

Des copies chiffrées de toutes les données des applications et de la configuration du serveur vont vers un stockage S3 appartenant au client. Un serveur perdu se reconstruit sur une nouvelle machine à partir de la seule adresse de sauvegarde, des clés de stockage et du mot de passe de sauvegarde. Un serveur en marche peut être ramené en arrière depuis le panneau, et un serveur entier peut être déplacé vers un autre avec quelques minutes d'indisponibilité.

## Fonctionnement des sauvegardes

- **Stockage et chiffrement.** restic chiffre sur le serveur avant tout envoi. Le dépôt est une seule adresse, de la forme `s3:https://<point-d-acces>/<seau>`, saisie dans **Paramètres** > **Dépôt de sauvegarde** avec ses deux clés S3. Le mot de passe de sauvegarde est généré par le serveur dans **Paramètres** > **Mot de passe de sauvegarde**, affiché une seule fois et conservé nulle part ailleurs : sa place est dans un gestionnaire de mots de passe. Il peut être vérifié contre le dépôt ou changé, ce qui ré-encode le dépôt.
- **Contenu.** Les données et volumes des applications, la configuration du serveur (dont `/etc/catena/config.json`) et la piste d'audit. Les dossiers supplémentaires se déclarent dans **Autres dossiers à sauvegarder**; un conteneur qui monte un chemin hors de l'ensemble sauvegardé fait échouer l'exécution plutôt que d'être ignoré en silence.
- **Bases de données.** Avant chaque instantané, chaque conteneur en marche dont le nom d'image contient `postgres` est vidé avec `pg_dumpall`, de même que chaque conteneur `mariadb` ou `mysql` (qui exige `MARIADB_ROOT_PASSWORD` ou `MYSQL_ROOT_PASSWORD` dans son environnement). Un vidage qui échoue fait échouer la sauvegarde. Les autres moteurs, comme MongoDB ou SQLite, n'ont aucun vidage automatique, et les applications ne sont pas mises en pause autour d'une sauvegarde.
- **Rétention.** Par défaut : 24 horaires, 7 quotidiens, 4 hebdomadaires et 6 mensuels, modifiables dans la page **Horaires**.
- **Cadence.** Un bouton de sauvegarde est toujours offert dans **Actions**. Un horaire de sauvegarde (le dimanche à 3 h par défaut, toute cadence permise) reste désactivé jusqu'à son activation, qui exige Catena Pro ou Catena Business. Healthchecks reçoit un signal après chaque exécution.
- **Consultation.** Les instantanés se listent, se parcourent en lecture seule et s'exportent vers une archive depuis **Actions**, sans restauration.

## Restauration

La page **Restauration** restaure tout à partir des sauvegardes du serveur, ou des sauvegardes d'un autre serveur lorsqu'une machine en remplace une qui n'existe plus (adresse du dépôt, mot de passe de sauvegarde et clés de stockage, conservés en mémoire seulement). Le panneau, la connexion et l'authentification restent accessibles pendant le remplacement des applications. Une restauration interrompue peut reprendre avec la même sauvegarde. Une sauvegarde plus récente que la version en marche est refusée. Voir [Restauration et migration](/fr/configuration/restore-and-migrate/).

## Migration

Un nouveau serveur tire depuis l'ancien avec **Déplacer un autre serveur ici**. Le panneau **Migration** de l'ancien serveur ouvre une fenêtre de 4 heures et affiche un code d'appairage à usage unique; le trafic passe par le tailnet seulement. L'essentiel des données est copié pendant que l'ancien serveur continue de servir. Jusqu'à la vérification de la sauvegarde finale, le déplacement peut être annulé et l'ancien serveur se remet en service de lui-même. Les deux serveurs doivent exécuter la même version. La clé d'abonnement suit les données.

## Copies hors site

**Copies hors site** copie chaque seau déclaré vers un seau verrouillé (Object Lock) chez un autre fournisseur, en ajout seulement : rien n'est jamais supprimé. Restaurer depuis cette copie passe d'abord par une recopie du seau verrouillé vers un seau neuf.

## Ce qu'ajoute chaque édition

Communauté offre les sauvegardes manuelles, la consultation des instantanés, la restauration et la reconstruction du serveur entier, et le côté récepteur d'une migration. Catena Pro ajoute les horaires, la restauration d'une seule application, le rapport de restauration et le côté source d'une migration, et Catena Business ajoute les copies hors site. Voir la [comparaison des éditions](https://catena.run/fr/#pricing).

## Limites

- Un dépôt compatible S3 est requis, et la perte du mot de passe de sauvegarde rend les sauvegardes illisibles.
- Un seau de fichiers copié hors site n'est restaurable qu'accompagné d'un instantané de base de données du même moment.
- Restaurer une application ne ramène pas en arrière les réglages du serveur.

## Configuration

- [Sauvegardes et stockage S3](/fr/configuration/backups/)
- [Horaires](/fr/configuration/schedules/)
- [Restauration et migration](/fr/configuration/restore-and-migrate/)

## Quitter Catena

Catena est une couche de commodité par-dessus des outils standards et ouverts. Tout ce qui se trouve sur le serveur vit dans des formats que ces outils savent lire et restaurer : partir coûte du confort, jamais des données. Les commandes ci-dessous sont celles que Catena exécute derrière ses boutons.

Ce qui appartient au client, et où cela vit :

- **Données des applications** : chaque application conserve sa base de données et ses fichiers sur le serveur, dans son propre format standard.
- **Sauvegardes** : un dépôt [restic](https://restic.net/) standard dans un seau appartenant au client, lisible par tout ordinateur muni de restic.
- **Réglages et identifiants internes** : un fichier lisible à `/etc/catena/config.json`, inclus dans chaque sauvegarde.
- **Comptes de connexion** : conservés par Keycloak dans sa propre base de données sur le serveur, exportables avec les outils de Keycloak.

Trois éléments doivent vivre hors du serveur : l'adresse du dépôt de sauvegarde, les clés d'accès au stockage et le mot de passe de sauvegarde (visibles dans **Paramètres** > **Trousse de reprise après sinistre**). Avec ces éléments et n'importe quel ordinateur, les données sont récupérables, avec ou sans Catena.

Sauvegarder sans le panneau. Le bouton du panneau démarre un service système, qui se démarre aussi à la main :

```sh
sudo systemctl start catena-backup.service
```

Travailler directement avec le dépôt charge les paramètres de connexion déjà conservés sur le serveur, puis utilise restic directement :

```sh
sudo bash -c 'set -a; . /etc/catena/backup.env; set +a; restic snapshots'
```

Restaurer sans le panneau. N'importe quel fichier ou dossier se restaure depuis le dernier instantané :

```sh
sudo bash -c 'set -a; . /etc/catena/backup.env; set +a; \
  restic restore latest --target / --include /chemin/a/restaurer'
```

Les applications tournent sous l'orchestrateur de Docker : les commandes Docker standards les listent et arrêtent ou démarrent n'importe laquelle :

```sh
docker service ls
docker service scale <nom>=0
docker service scale <nom>=1
```

Passer à zéro, c'est l'arrêt; revenir à un, c'est le démarrage. Reconstruire un serveur entier à partir de la trousse suit [Restauration et migration](/fr/configuration/restore-and-migrate/) et fonctionne sans le panneau d'administration.

Pour partir complètement :

1. Exporter ce qui est nécessaire avec les outils propres à chaque application.
2. Pointer le domaine ailleurs chez le fournisseur DNS le moment venu; rien sur le serveur ne dépend de Catena pour continuer à servir d'ici là.
3. Conserver les sauvegardes : le dépôt restic reste lisible avec restic seul, tant que la trousse est gardée.

Supprimer le panneau d'administration ne change rien aux données ni aux applications en marche. Ce qui est perdu, c'est l'automatisation et le confort : la récupération en une commande, le câblage de la surveillance, les mises à jour gérées et le panneau lui-même. Jamais les données.
