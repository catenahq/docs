---
title: "Sauvegardes et stockage S3"
description: "Où les sauvegardes sont écrites, comment elles sont chiffrées, ce qu'elles contiennent, et comment la trousse de reprise et les copies hors site les protègent."
---

Les sauvegardes sont chiffrées sur le serveur avant d'en sortir et sont écrites dans un compartiment compatible S3 dont vous êtes propriétaire. Catena ne conserve aucune copie des données. Cette page couvre les réglages de stockage, le mot de passe de sauvegarde, la trousse de reprise, les copies hors site et le lancement manuel d'une sauvegarde. Le moment où les sauvegardes s'exécutent seules, et le nombre conservé, se règlent dans la page [Horaires](/fr/configuration/schedules/).

## Prérequis

- Un compartiment chez un fournisseur de stockage compatible S3, et une paire de clés (clé d'accès et clé secrète) qui peut lire, écrire et supprimer des objets dans ce compartiment.
- Un fournisseur, ou au minimum une région, différent de celui qui héberge le serveur. Une panne ou un incident unique ne peut alors pas emporter à la fois le serveur et ses sauvegardes.
- Un accès administrateur au panneau (voir [Accès administrateur et réseau privé](/fr/configuration/admin-access/)).

Le compartiment est un compartiment ordinaire : les anciennes sauvegardes sont élaguées selon les nombres de conservation de la page Horaires. Le verrouillage d'objets (Object Lock) et le versionnage appartiennent à la destination d'une [copie hors site](#copies-hors-site), pas à ce compartiment.

## Dépôt de sauvegarde

Ouvrez **Paramètres** > **Dépôt de sauvegarde**. Le dépôt est une seule adresse qui contient déjà le point d'accès et le compartiment :

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

Laissez un champ de clé vide pour conserver la valeur actuelle; saisissez une valeur pour la remplacer. **Enregistrer** stocke les valeurs sur le serveur. Aucun redémarrage ni aucune reconfiguration ne suit : la prochaine sauvegarde les lit.

### Vérification du point d'accès

Une fois les valeurs stockées, le panneau vérifie le point d'accès et affiche l'un de ces messages :

| Message | Signification |
|---|---|
| Point d'accès joignable; le contenu du compartiment est lisible. | L'adresse est valide, le point d'accès répond et le compartiment peut être listé. |
| Point d'accès valide, mais son contenu n'a pas pu être lu. | Le point d'accès répond, mais le contenu du compartiment n'a pas pu être lu. Un compartiment neuf et vide n'est pas une erreur. |
| Point d'accès de sauvegarde refusé : `<raison>` | L'adresse est mal formée ou le point d'accès a refusé la connexion. Les valeurs restent stockées; corrigez-les et enregistrez de nouveau. |

## Mot de passe de sauvegarde

Les sauvegardes sont chiffrées avec un mot de passe que le serveur génère. Il est affiché une seule fois.

1. Enregistrez l'adresse du dépôt et les deux clés, comme ci-dessus. D'ici là, la section indique : "Saisissez d'abord ci-dessus le dépôt de sauvegarde et ses deux clés : le mot de passe est vérifié contre le dépôt avant d'être conservé."
2. Sous **Mot de passe de sauvegarde**, appuyez sur **Générer le mot de passe de chiffrement des sauvegardes**.
3. Copiez aussitôt le mot de passe dans un gestionnaire de mots de passe. La page confirme par "Mot de passe de chiffrement des sauvegardes généré et stocké sur ce serveur." et "Conservez-le dès maintenant dans un gestionnaire de mots de passe. Il n'est plus affiché, et recharger cette page le masque."

Le serveur garde le mot de passe pour exécuter les sauvegardes, et Catena n'en conserve aucune autre copie. Sans lui, tout le contenu du compartiment est illisible. Le mot de passe est aussi nécessaire pour lire ces sauvegardes depuis un autre serveur (voir [Restauration et migration](/fr/configuration/restore-and-migrate/)).

La génération est refusée lorsqu'un mot de passe existe déjà, ou lorsque le dépôt contient déjà des sauvegardes sous un autre mot de passe. La raison s'affiche dans la même section. Ne réutilisez pas pour un nouveau serveur un dépôt qui contient les sauvegardes d'un autre serveur : utilisez plutôt un compartiment neuf et vide.

Une fois le mot de passe créé, la section offre deux outils :

- **Vérifier un mot de passe** > **Vérifier** : teste contre le dépôt un mot de passe que vous saisissez. Les réponses sont "Ce mot de passe ouvre le dépôt de sauvegarde.", "Ce mot de passe n'ouvre PAS le dépôt de sauvegarde." et "Impossible de joindre le dépôt de sauvegarde pour vérifier le mot de passe."
- **Nouveau mot de passe de sauvegarde** > **Changer le mot de passe** : ré-encode le dépôt sous un nouveau mot de passe. Cochez la case "Je comprends que cela ré-encode le dépôt : chaque sauvegarde devient illisible sans le nouveau mot de passe." Le succès affiche "Mot de passe de sauvegarde changé. Le nouveau mot de passe a maintenant sa place dans un gestionnaire de mots de passe."; un échec affiche "Impossible de changer le mot de passe de sauvegarde. Le dépôt n'a pas été ré-encodé." Remplacez le jour même la copie conservée dans votre gestionnaire de mots de passe.

## Trousse de reprise après sinistre

La section **Trousse de reprise après sinistre** liste les quatre valeurs qui reconstruisent à elles seules le serveur sur une machine neuve :

- l'adresse du dépôt de sauvegarde,
- la clé d'accès S3,
- la clé secrète S3,
- le mot de passe de chiffrement des sauvegardes.

Tout le reste, y compris chaque réglage interne et chaque secret qu'utilisent les applications, se trouve dans la sauvegarde chiffrée. Les valeurs restent masquées dans la page parce qu'elle est joignable de partout, et que les afficher les inscrirait dans l'historique du navigateur et dans les captures d'écran.

**Afficher les valeurs** les affiche une fois. La consultation est consignée dans le journal administratif du serveur, avec le compte et l'heure : "Affichées une fois, et consignées : cette consultation est désormais une entrée du journal administratif de ce serveur, avec le compte et l'heure. Recharger la page les masque de nouveau." Tant que les identifiants de sauvegarde ne sont pas définis, la section indique "La trousse de reprise apparaît une fois les identifiants de sauvegarde ci-dessus définis."

Conservez les quatre valeurs dans un gestionnaire de mots de passe, en entrées séparées, hors du serveur et hors du compartiment. La reconstruction d'un serveur à partir d'elles est décrite dans la page [Restauration et migration](/fr/configuration/restore-and-migrate/).

## Copies hors site

Une copie hors site duplique un compartiment vers un compartiment verrouillé chez un autre fournisseur. Elle protège contre un serveur ou un compte compromis : la destination ne peut être ni modifiée ni supprimée, même avec des clés valides, tant que le verrou n'a pas expiré. Les copies hors site demandent Catena Business; la [comparaison des éditions](https://catena.run/fr/#pricing) donne les détails.

### Prérequis

- Un compartiment de destination chez un fournisseur autre que celui de la source, créé avec **Object Lock** et le **versionnage** activés (voir [Créer le compartiment de destination](#créer-le-compartiment-de-destination)).
- Une paire de clés pour la destination (voir [Clés de la destination](#clés-de-la-destination)) et, pour la source, les clés du compartiment copié.

### Créer le compartiment de destination

Une copie ne peut pas aller dans le compartiment de sauvegarde lui-même, car les sauvegardes y sont élaguées et un verrou bloquerait l'élagage. Chaque compartiment source a son propre compartiment de destination.

1. Choisissez un fournisseur qui prend en charge Object Lock et qui n'est pas celui de la source :

   | Fournisseur | Remarques |
   |---|---|
   | eazybackup (Canada) | Propriété canadienne, compatible S3 avec Object Lock et versionnage, sans frais de sortie de données. |
   | Backblaze B2 | Object Lock pris en charge; propriété américaine; frais de sortie de données au-delà d'une allocation mensuelle. |
   | AWS S3 | Le mode Conformité est appliqué strictement; propriété américaine. |
   | OVHcloud Object Storage | Object Lock s'active à la création du compartiment, ce qui active aussi le versionnage. Non offert pour la classe de stockage Cold Archive. |

   Cloudflare R2 ne peut pas héberger une destination : il n'offre ni Object Lock ni versionnage. Ses verrous de compartiment (bucket locks) empêchent la suppression et l'écrasement des objets, mais ne gardent aucune version antérieure à remettre en place.
2. Créez un compartiment neuf, un par compartiment source. Ne partagez pas un compartiment de destination entre deux copies.
3. Activez le **versionnage**. Il conserve la version précédente d'un objet écrasé ou supprimé.
4. Activez **Object Lock** à la création, avec une rétention par défaut d'au moins 30 jours (90 jours recommandés). Choisissez le mode **Conformité** (Compliance) lorsque le fournisseur l'offre : personne, pas même le propriétaire du compartiment, ne peut le raccourcir. Le mode **Gouvernance** (Governance) est le recours lorsque la Conformité ne vous est pas accessible.
5. Notez le point d'accès et le nom du compartiment. Le panneau les prend en une seule adresse, `s3:https://<point-d-acces>/<compartiment>`.

Les versions qui ne sont plus courantes occupent de l'espace jusqu'à l'expiration du verrou. Pour un compartiment qui change beaucoup, comme les fichiers d'une application, prévoyez de deux à cinq fois la taille de la source la première année, et créez chez le fournisseur une règle de cycle de vie qui fait expirer les versions non courantes après la période de rétention. Une règle de cycle de vie s'exécute chez le fournisseur et n'exige aucun droit de suppression sur la clé confiée à Catena.

### Clés de la destination

Créez une paire de clés par compartiment de destination, pour que la fuite d'une paire n'atteigne pas un autre compartiment. Gardez trois rôles distincts :

| Clé | Droits | Où elle se trouve |
|---|---|---|
| Clé de copie | Écriture et lecture, jamais de suppression : `s3:PutObject`, `s3:GetObject`, `s3:GetObjectVersion`, `s3:ListBucket`, `s3:GetBucketLocation`, `s3:AbortMultipartUpload`, `s3:ListMultipartUploadParts`. Omettez `s3:DeleteObject`, `s3:DeleteObjectVersion`, `s3:PutObjectRetention` et `s3:BypassGovernanceRetention`. | Dans les champs **Clé d'accès S3 de la destination** et **Clé secrète S3 de la destination** de la ligne. |
| Clé de restauration | Lecture seule : lister le compartiment, lire les objets (les versions antérieures aussi, pour restaurer un moment passé) et trouver l'emplacement du compartiment (`s3:ListBucket`, `s3:GetObject`, `s3:GetObjectVersion`, `s3:GetBucketLocation`). | Dans un gestionnaire de mots de passe. Vous la saisissez dans la page **Restauration** au besoin (voir [Restaurer depuis un autre dépôt de sauvegarde](/fr/configuration/restore-and-migrate/#restaurer-depuis-un-autre-dépôt-de-sauvegarde)); elle n'est pas conservée sur le serveur. |
| Clé d'élagage | Les droits de la clé de copie, plus `s3:DeleteObject` et `s3:DeleteObjectVersion`. | Jamais sur le serveur. Dans un gestionnaire de mots de passe, utilisée depuis votre propre ordinateur seulement lorsque le fournisseur n'a pas de règle de cycle de vie et que vous devez supprimer d'anciennes versions à la main. |

Une clé de copie sans droit de suppression garantit qu'aucune demande de suppression venant du serveur n'atteint la destination, et toute suppression visible dans le journal d'accès du fournisseur ne vient pas de Catena. Certains fournisseurs exigent aussi le droit de suppression pour nettoyer les téléversements inachevés; ajoutez-le seulement si les copies échouent pour cette raison.

Comment chaque fournisseur exprime l'absence de suppression :

- **eazybackup et autres fournisseurs compatibles MinIO :** associez à l'utilisateur de la clé une politique qui autorise les actions ci-dessus.
- **AWS S3 :** associez la même politique, avec l'ARN du compartiment, à un utilisateur IAM.
- **Backblaze B2 :** à la création de la clé d'application, cochez `listBuckets`, `listFiles`, `readFiles` et `writeFiles`, et laissez `deleteFiles` décoché.
- **OVH Object Storage :** donnez à la clé le rôle de lecture et d'écriture, pas celui d'administrateur.

Pour remplacer une clé : saisissez la nouvelle dans la ligne, attendez qu'une exécution planifiée réussisse, puis supprimez l'ancienne clé chez le fournisseur. Aucune autre étape n'est nécessaire.

### Étapes

1. Ouvrez **Paramètres** > **Copies hors site**.
2. Sous **Ajouter une copie**, remplissez une ligne :

| Champ | Contenu |
|---|---|
| **Nom** | Lettres minuscules, chiffres et traits d'union; 40 caractères au maximum; unique. |
| **URL du dépôt source** | Le compartiment à copier, sous la forme `s3:https://<point-d-acces>/<compartiment>`. |
| **Clé d'accès S3 de la source**, **Clé secrète S3 de la source** | Les clés de la source. |
| **URL du dépôt de destination** | Le compartiment verrouillé, au même format d'adresse. |
| **Clé d'accès S3 de la destination**, **Clé secrète S3 de la destination** | Les clés de la destination. |

3. Appuyez sur **Enregistrer les copies hors site**. La page répond "Copies hors site enregistrées." Retirez une ligne avec **Retirer cette copie à l'enregistrement (les copies déjà faites sont conservées)**.

Saisissez ici les deux jeux de clés même lorsqu'un compartiment est aussi configuré ailleurs : l'application décide où elle range ses fichiers, et cette liste décide de ce qui est copié où. La source et la destination doivent être des compartiments différents, et vous pouvez ajouter 32 lignes au plus. Laissez le secret vide sur une ligne existante pour conserver celui qui est stocké. Tant qu'aucune ligne n'existe, la section indique "Aucune copie hors site n'est déclarée, donc rien n'est copié hors site."

Les copies s'exécutent selon la tâche **Copie hors site** de la page [Horaires](/fr/configuration/schedules/), livrée désactivée : activez-la là une fois la ligne enregistrée. Elles s'exécutent aussi comme étape de l'entretien nocturne. Une destination injoignable ou non configurée est consignée comme sautée et n'arrête pas les sauvegardes.

### Comportement d'une copie

- Une copie ne fait qu'ajouter. Rien de ce qu'elle a écrit n'est ensuite modifié ni supprimé. Un compartiment retiré de la liste conserve toutes les copies déjà faites, et le coût de stockage croît avec le volume de changements.
- Une copie verrouillée est lue sur place. La page **Restauration** restaure le serveur depuis la copie hors site de son dépôt de sauvegarde et remet en place tout compartiment déclaré depuis sa copie (voir [Restaurer depuis un autre dépôt de sauvegarde](/fr/configuration/restore-and-migrate/#restaurer-depuis-un-autre-dépôt-de-sauvegarde) et [Remettre un compartiment en place depuis sa copie hors site](/fr/configuration/restore-and-migrate/#remettre-un-compartiment-en-place-depuis-sa-copie-hors-site)).
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

Les sauvegardes manuelles sont offertes dans toutes les éditions. Ouvrez **Actions**; la catégorie **Sauvegardes** apparaît une fois l'adresse du dépôt et les deux clés enregistrées (d'ici là, la page affiche "Configurer le dépôt de sauvegarde" avec un lien vers les paramètres). Appuyez sur **Exécuter** pour :

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
| Les actions de sauvegarde sont absentes de **Actions** | Vous n'avez pas encore enregistré l'adresse du dépôt ou une clé. |
| "Point d'accès valide, mais son contenu n'a pas pu être lu." | Mauvaise paire de clés, absence de droit de lecture sur le compartiment, ou nom de compartiment erroné dans l'adresse. Corrigez et enregistrez de nouveau. |
| **Générer le mot de passe de chiffrement des sauvegardes** est refusé | Un mot de passe existe déjà, ou le compartiment contient des sauvegardes sous un autre mot de passe. Utilisez un compartiment vide. |
| Une sauvegarde échoue sur la couverture | Un conteneur monte un dossier hors de l'ensemble sauvegardé. Listez-le sous **Autres dossiers à sauvegarder (séparés par des virgules)**. |
| Une sauvegarde échoue sur un export de base de données | Un conteneur MariaDB ou MySQL sans `MARIADB_ROOT_PASSWORD` ni `MYSQL_ROOT_PASSWORD`, ou une base qui n'a pu être exportée. Le journal de sauvegarde donne la raison. |
| Vous avez perdu la copie enregistrée du mot de passe | Tant que le serveur fonctionne, **Afficher les valeurs** dans **Trousse de reprise après sinistre** l'affiche de nouveau. Si le serveur a aussi disparu, rien ne permet de lire les sauvegardes. |

La page **Journal** consigne chaque sauvegarde terminée avec sa taille; la page [Mises à jour](/fr/configuration/updates/) décrit les autres événements qui y figurent.
