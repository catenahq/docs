---
title: "Sauvegardes et stockage S3"
description: "Où les sauvegardes sont écrites, comment elles sont chiffrées, ce qu'elles contiennent, et comment la trousse de reprise et les copies hors site les protègent."
---

Les sauvegardes sont chiffrées sur le serveur avant d'en sortir et sont écrites dans un compartiment compatible S3 que possède l'administrateur du serveur. Catena ne conserve aucune copie des données. Cette page couvre les réglages de stockage, le mot de passe de sauvegarde, la trousse de reprise, les copies hors site et le lancement manuel d'une sauvegarde. Le moment où les sauvegardes s'exécutent seules, et le nombre conservé, se règlent dans la page [Horaires](/fr/configuration/schedules/).

## Prérequis

- Un compartiment chez un fournisseur de stockage compatible S3, et une paire de clés (clé d'accès et clé secrète) qui peut lire, écrire et supprimer des objets dans ce compartiment.
- Un fournisseur, ou au minimum une région, différent de celui qui héberge le serveur. Une panne ou un incident unique ne peut alors pas emporter à la fois le serveur et ses sauvegardes.
- Un accès administrateur au panneau (voir [Accès administrateur et réseau privé](/fr/configuration/admin-access/)).

Le compartiment est un compartiment ordinaire : les anciennes sauvegardes sont élaguées selon les nombres de conservation de la page Horaires. Le verrouillage d'objets (Object Lock) et le versionnage appartiennent à la destination d'une [copie hors site](#copies-hors-site), pas à ce compartiment.

## Dépôt de sauvegarde

Ouvrir **Paramètres** > **Dépôt de sauvegarde**. Le dépôt est une seule adresse qui contient déjà le point d'accès et le compartiment :

```text
s3:https://<point-d-acces>/<compartiment>
```

Par exemple, `s3:https://s3.bhs.io.cloud.ovh.net/acme-restic`. Il n'y a aucun champ distinct pour le compartiment, le point d'accès ou la région : la région fait partie du nom du point d'accès, et les deux sont dans cette adresse unique.

| Champ | Contenu |
|---|---|
| **Clé d'accès S3 de sauvegarde** | La clé d'accès de la paire. Conservée, jamais réaffichée. |
| **Clé secrète S3 de sauvegarde** | La clé secrète de la paire. Conservée, jamais réaffichée. |
| **URL du dépôt de sauvegarde** | L'adresse ci-dessus. |
| **Autres dossiers à sauvegarder (séparés par des virgules)** | Facultatif. Emplacements supplémentaires du serveur à inclure (voir [Ce que contient une sauvegarde](#ce-que-contient-une-sauvegarde)). |

Un champ de clé laissé vide conserve la valeur actuelle; saisir une valeur la remplace. **Enregistrer** stocke les valeurs sur le serveur. Aucun redémarrage ni aucune reconfiguration ne suit : la prochaine sauvegarde les lit.

### Vérification du point d'accès

Une fois les valeurs stockées, le panneau vérifie le point d'accès et affiche l'un de ces messages :

| Message | Signification |
|---|---|
| Point d'accès joignable; le contenu du compartiment est lisible. | L'adresse est valide, le point d'accès répond et le compartiment peut être listé. |
| Point d'accès valide, mais son contenu n'a pas pu être lu. | Le point d'accès répond, mais le contenu du compartiment n'a pas pu être lu. Un compartiment neuf et vide n'est pas une erreur. |
| Point d'accès de sauvegarde refusé : `<raison>` | L'adresse est mal formée ou le point d'accès a refusé la connexion. Les valeurs restent stockées; les corriger et enregistrer de nouveau. |

## Mot de passe de sauvegarde

Les sauvegardes sont chiffrées avec un mot de passe que le serveur génère. Il est affiché une seule fois.

1. Enregistrer l'adresse du dépôt et les deux clés, comme ci-dessus. D'ici là, la section indique : "Saisissez d'abord ci-dessus le dépôt de sauvegarde et ses deux clés : le mot de passe est vérifié contre le dépôt avant d'être conservé."
2. Sous **Mot de passe de sauvegarde**, appuyer sur **Générer le mot de passe de chiffrement des sauvegardes**.
3. Copier aussitôt le mot de passe dans un gestionnaire de mots de passe. La page confirme par "Mot de passe de chiffrement des sauvegardes généré et stocké sur ce serveur." et "Conservez-le dès maintenant dans un gestionnaire de mots de passe. Il n'est plus affiché, et recharger cette page le masque."

Le serveur garde le mot de passe pour exécuter les sauvegardes, et Catena n'en conserve aucune autre copie. Sans lui, tout le contenu du compartiment est illisible. Le mot de passe est aussi nécessaire pour lire ces sauvegardes depuis un autre serveur (voir [Restauration et migration](/fr/configuration/restore-and-migrate/)).

La génération est refusée lorsqu'un mot de passe existe déjà, ou lorsque le dépôt contient déjà des sauvegardes sous un autre mot de passe. La raison s'affiche dans la même section. Un dépôt qui contient les sauvegardes d'un autre serveur ne se réutilise pas pour un nouveau serveur : un compartiment neuf et vide sert à cela.

Une fois le mot de passe créé, la section offre deux outils :

- **Vérifier un mot de passe** > **Vérifier** : teste un mot de passe saisi contre le dépôt. Les réponses sont "Ce mot de passe ouvre le dépôt de sauvegarde.", "Ce mot de passe n'ouvre PAS le dépôt de sauvegarde." et "Impossible de joindre le dépôt de sauvegarde pour vérifier le mot de passe."
- **Nouveau mot de passe de sauvegarde** > **Changer le mot de passe** : ré-encode le dépôt sous un nouveau mot de passe. La case "Je comprends que cela ré-encode le dépôt : chaque sauvegarde devient illisible sans le nouveau mot de passe." doit être cochée. Le succès affiche "Mot de passe de sauvegarde changé. Le nouveau mot de passe a maintenant sa place dans un gestionnaire de mots de passe."; un échec affiche "Impossible de changer le mot de passe de sauvegarde. Le dépôt n'a pas été ré-encodé." La copie conservée dans le gestionnaire de mots de passe est remplacée le jour même.

## Trousse de reprise après sinistre

La section **Trousse de reprise après sinistre** liste les quatre valeurs qui reconstruisent à elles seules le serveur sur une machine neuve :

- l'adresse du dépôt de sauvegarde,
- la clé d'accès S3,
- la clé secrète S3,
- le mot de passe de chiffrement des sauvegardes.

Tout le reste, y compris chaque réglage interne et chaque secret qu'utilisent les applications, se trouve dans la sauvegarde chiffrée. Les valeurs restent masquées dans la page parce qu'elle est joignable de partout, et que les afficher les inscrirait dans l'historique du navigateur et dans les captures d'écran.

**Afficher les valeurs** les affiche une fois. La consultation est consignée dans le journal administratif du serveur, avec le compte et l'heure : "Affichées une fois, et consignées : cette consultation est désormais une entrée du journal administratif de ce serveur, avec le compte et l'heure. Recharger la page les masque de nouveau." Tant que les identifiants de sauvegarde ne sont pas définis, la section indique "La trousse de reprise apparaît une fois les identifiants de sauvegarde ci-dessus définis."

Les quatre valeurs ont leur place dans un gestionnaire de mots de passe, en entrées séparées, conservées hors du serveur et hors du compartiment. La reconstruction d'un serveur à partir d'elles est décrite dans la page [Restauration et migration](/fr/configuration/restore-and-migrate/).

## Copies hors site

Une copie hors site duplique un compartiment vers un compartiment verrouillé chez un autre fournisseur. Elle protège contre un serveur ou un compte compromis : la destination ne peut être ni modifiée ni supprimée, même avec des clés valides, tant que le verrou n'a pas expiré. Les copies hors site demandent Catena Business; la [comparaison des éditions](https://catena.run/fr/#pricing) donne les détails.

### Prérequis

- Un compartiment de destination chez un fournisseur autre que celui de la source, créé avec **Object Lock** et le **versionnage** activés. La plupart des fournisseurs n'autorisent Object Lock qu'à la création du compartiment.
- Une paire de clés d'accès pour la destination et, si la source n'est pas le compartiment principal de sauvegarde, pour la source.

### Étapes

1. Ouvrir **Paramètres** > **Copies hors site**.
2. Sous **Ajouter une copie**, remplir une ligne :

| Champ | Contenu |
|---|---|
| **Nom** | Lettres minuscules, chiffres et traits d'union; 40 caractères au maximum; unique. |
| **URL du dépôt source** | Le compartiment à copier, sous la forme `s3:https://<point-d-acces>/<compartiment>`. |
| **Clé d'accès S3 de la source**, **Clé secrète S3 de la source** | Les clés de la source. |
| **URL du dépôt de destination** | Le compartiment verrouillé, au même format d'adresse. |
| **Clé d'accès S3 de la destination**, **Clé secrète S3 de la destination** | Les clés de la destination. |

3. Appuyer sur **Enregistrer les copies hors site**. La page répond "Copies hors site enregistrées." Une ligne se retire avec **Retirer cette copie à l'enregistrement (les copies déjà faites sont conservées)**.

Les deux jeux de clés se saisissent ici même lorsqu'un compartiment est aussi configuré ailleurs : l'application décide où elle range ses fichiers, et cette liste décide de ce qui est copié où. La source et la destination doivent être des compartiments différents, et 32 lignes au plus sont acceptées. Un secret laissé vide sur une ligne existante conserve celui qui est stocké. Tant qu'aucune ligne n'existe, la section indique "Aucune copie hors site n'est déclarée, donc rien n'est copié hors site."

Les copies s'exécutent selon l'horaire **Copie hors site** de la page Horaires (et comme étape de l'entretien nocturne). Une destination injoignable ou non configurée est consignée comme sautée et n'arrête pas les sauvegardes.

### Comportement d'une copie

- Une copie ne fait qu'ajouter. Rien de ce qu'elle a écrit n'est ensuite modifié ni supprimé. Un compartiment retiré de la liste conserve toutes les copies déjà faites, et le coût de stockage croît avec le volume de changements.
- Un compartiment verrouillé ne peut pas être restauré sur place. Restaurer passe d'abord par une recopie vers un compartiment neuf et non verrouillé, dont on lit ensuite les données.
- La copie du compartiment de fichiers d'une application n'est restaurable qu'accompagnée d'une copie du même instant de la base de données qui indexe ces fichiers. Cette base se trouve dans les instantanés de sauvegarde : un compartiment de fichiers copié seul ne constitue donc pas une sauvegarde.

## Ce que contient une sauvegarde

Inclus :

- les données de chaque application, y compris ses volumes Docker et les dossiers rangés dans l'espace de stockage des applications du serveur;
- un export de chaque base de données, fait juste avant l'instantané (voir plus bas);
- la configuration propre au serveur : fichiers système, réglages SSH et pare-feu, réglages et secrets conservés par Catena, et journal administratif;
- chaque dossier listé sous **Autres dossiers à sauvegarder (séparés par des virgules)**.

Exclus : les couches d'images de conteneurs (elles sont retéléchargées), l'historique de la page d'état, du moniteur de signalement et du moniteur de ressources, les bases de signatures de l'antivirus, les journaux et les dossiers temporaires.

L'export des bases est automatique pour chaque conteneur en marche dont le nom d'image contient `postgres`, `mariadb` ou `mysql`. PostgreSQL est exporté avec `pg_dumpall`. MariaDB et MySQL exigent `MARIADB_ROOT_PASSWORD` ou `MYSQL_ROOT_PASSWORD` dans l'environnement du conteneur. Un export qui échoue fait échouer toute la sauvegarde. Les autres moteurs, comme MongoDB ou SQLite, n'ont aucun export automatique. Les sauvegardes ne mettent pas les applications en pause. Pendant l'entretien nocturne, une application du catalogue dont l'entrée le demande, comme Nextcloud, est placée en mode maintenance le temps de la sauvegarde et en est sortie ensuite, même quand la sauvegarde échoue; une sauvegarde lancée autrement laisse chaque application telle quelle. Une restauration sort du mode maintenance les applications qu'elle remet en place.

Après chaque instantané, le serveur vérifie chaque conteneur en marche pour repérer les dossiers montés depuis l'extérieur de l'ensemble sauvegardé. Une sauvegarde échoue lorsqu'elle en trouve un qui n'est pas listé sous **Autres dossiers à sauvegarder (séparés par des virgules)**; l'action **Vérifier la couverture des sauvegardes** exécute la même vérification sur demande.

## Lancer une sauvegarde manuellement

Les sauvegardes manuelles sont offertes dans toutes les éditions. Ouvrir **Actions**; la catégorie **Sauvegardes** apparaît une fois l'adresse du dépôt et les deux clés enregistrées (d'ici là, la page affiche "Configurer le dépôt de sauvegarde" avec un lien vers les paramètres). Appuyer sur **Exécuter** pour :

| Action | Effet |
|---|---|
| **Lancer une sauvegarde** | Démarre une sauvegarde en arrière-plan. |
| **Dernier journal de sauvegarde** | Affiche les dernières lignes du journal de sauvegarde. |
| **Lister les snapshots restic** | Liste les derniers instantanés. |
| **Vérifier la couverture des sauvegardes** | Signale les dossiers hors de l'ensemble sauvegardé. |
| **Parcourir les snapshots passés (lecture seule)** | Monte les instantanés en lecture seule sur le serveur, pour en extraire des fichiers. Le montage est libéré après une heure. |
| **Navigateur de snapshots -- état** | Indique où le navigateur est monté et ce qu'il contient. |
| **Démonter le navigateur de snapshots** | Libère le montage. |
| **Exporter le dernier snapshot (tar.gz)** | Dans la catégorie **Récupération** : écrit le dernier instantané dans une archive téléchargeable, sans restauration. |

L'archive exportée est listée sous **Téléchargements disponibles** dans la page **Restauration**. La taille de la sauvegarde et le nombre d'instantanés s'affichent dans la page **Système** une fois une sauvegarde effectuée.

## Lorsqu'aucune sauvegarde n'est configurée

Chaque page d'administration affiche la bannière "Aucune sauvegarde n'est configurée : les mises à jour s'appliquent sans rien vers quoi revenir. En configurer une dans Paramètres." L'entretien nocturne applique tout de même les mises à jour dans cet état, et consigne un événement au Journal pour le signaler. La bannière reste affichée jusqu'à la configuration d'un dépôt.

## Dépannage

| Symptôme | Cause et correctif |
|---|---|
| Les actions de sauvegarde sont absentes de **Actions** | L'adresse du dépôt ou une clé n'est pas encore enregistrée. |
| "Point d'accès valide, mais son contenu n'a pas pu être lu." | Mauvaise paire de clés, absence de droit de lecture sur le compartiment, ou nom de compartiment erroné dans l'adresse. Corriger et enregistrer de nouveau. |
| **Générer le mot de passe de chiffrement des sauvegardes** est refusé | Un mot de passe existe déjà, ou le compartiment contient des sauvegardes sous un autre mot de passe. Utiliser un compartiment vide. |
| Une sauvegarde échoue sur la couverture | Un conteneur monte un dossier hors de l'ensemble sauvegardé. Le lister sous **Autres dossiers à sauvegarder (séparés par des virgules)**. |
| Une sauvegarde échoue sur un export de base de données | Un conteneur MariaDB ou MySQL sans `MARIADB_ROOT_PASSWORD` ni `MYSQL_ROOT_PASSWORD`, ou une base qui n'a pu être exportée. Le journal de sauvegarde donne la raison. |
| La copie enregistrée du mot de passe est perdue | Tant que le serveur fonctionne, **Afficher les valeurs** dans **Trousse de reprise après sinistre** l'affiche de nouveau. Si le serveur a aussi disparu, rien ne permet de lire les sauvegardes. |

La page **Journal** consigne chaque sauvegarde terminée avec sa taille; la page [Mises à jour](/fr/configuration/updates/) décrit les autres événements qui y figurent.
