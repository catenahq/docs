---
title: "Sauvegardes et stockage S3"
description: "Où les sauvegardes sont écrites, comment elles sont chiffrées, ce qu'elles contiennent, et comment la trousse de reprise et les copies hors site les protègent."
---

Les sauvegardes sont chiffrées sur le serveur avant d'en sortir et sont écrites dans un seau compatible S3 dont vous êtes propriétaire. Catena ne conserve aucune copie des données. Cette page couvre les réglages de stockage, le mot de passe de sauvegarde, la trousse de reprise, les copies hors site et le lancement manuel d'une sauvegarde. Le moment où les sauvegardes s'exécutent seules, et le nombre conservé, se règlent dans la page [Horaires](/fr/configuration/schedules/).

## Prérequis

- Un seau chez un fournisseur de stockage compatible S3, et une paire de clés (clé d'accès et clé secrète) qui peut lire, écrire et supprimer des objets dans ce seau.
- Un fournisseur, ou au minimum une région, différent de celui qui héberge le serveur. Une panne ou un incident unique ne peut alors pas emporter à la fois le serveur et ses sauvegardes.
- Un accès administrateur au panneau (voir [Accès administrateur et réseau privé](/fr/configuration/admin-access/)).

Le seau est un seau ordinaire : les sauvegardes au-delà des nombres de conservation de la page Horaires sont supprimées une fois par jour, et avant chaque copie hors site. Le verrouillage d'objets (Object Lock) et le versionnage appartiennent à la destination d'une [copie hors site](#copies-hors-site), pas à ce seau.

## Dépôt de sauvegarde

Ouvrez **Paramètres** > **Dépôt de sauvegarde**. Le dépôt est une seule adresse qui contient déjà le point d'accès et le seau :

```text
s3:https://<point-d-acces>/<seau>
```

Par exemple, `s3:https://s3.bhs.io.cloud.ovh.net/acme-restic`. Il n'y a aucun champ distinct pour le seau, le point d'accès ou la région : la région fait partie du nom du point d'accès, et les deux sont dans cette adresse unique.

| Champ | Contenu |
|---|---|
| **Clé d'accès S3 de sauvegarde** | La clé d'accès de la paire. Conservée, jamais réaffichée. |
| **Clé secrète S3 de sauvegarde** | La clé secrète de la paire. Conservée, jamais réaffichée. |
| **URL du dépôt de sauvegarde** | L'adresse ci-dessus. |
| **Autres dossiers à sauvegarder (séparés par des virgules)** | Facultatif. Emplacements supplémentaires du serveur à inclure (voir [Ce que contient une sauvegarde](#ce-que-contient-une-sauvegarde) et [Garder les fichiers d'une application sur un disque que vous attachez](#garder-les-fichiers-dune-application-sur-un-disque-que-vous-attachez)). |

Laissez un champ de clé vide pour conserver la valeur actuelle; saisissez une valeur pour la remplacer. **Enregistrer** stocke les valeurs sur le serveur. Aucun redémarrage ni aucune reconfiguration ne suit : la prochaine sauvegarde les lit.

### Vérification du point d'accès

Une fois les valeurs stockées, le panneau vérifie le point d'accès et affiche l'un de ces messages :

| Message | Signification |
|---|---|
| Point d'accès joignable; le contenu du seau est lisible. | L'adresse est valide, le point d'accès répond et le seau peut être listé. |
| Point d'accès valide, mais son contenu n'a pas pu être lu. | Le point d'accès répond, mais le contenu du seau n'a pas pu être lu. Un seau neuf et vide n'est pas une erreur. |
| Point d'accès de sauvegarde refusé : `<raison>` | L'adresse est mal formée ou le point d'accès a refusé la connexion. Les valeurs restent stockées; corrigez-les et enregistrez de nouveau. |

## Mot de passe de sauvegarde

Les sauvegardes sont chiffrées avec un mot de passe que le serveur génère. Il est affiché une seule fois.

1. Enregistrez l'adresse du dépôt et les deux clés, comme ci-dessus. D'ici là, la section indique : "Saisissez d'abord ci-dessus le dépôt de sauvegarde et ses deux clés : le mot de passe est vérifié contre le dépôt avant d'être conservé."
2. Sous **Mot de passe de sauvegarde**, appuyez sur **Générer le mot de passe de chiffrement des sauvegardes**.
3. Copiez aussitôt le mot de passe dans un gestionnaire de mots de passe. La page confirme par "Mot de passe de chiffrement des sauvegardes généré et stocké sur ce serveur." et "Conservez-le dès maintenant dans un gestionnaire de mots de passe. Il n'est plus affiché, et recharger cette page le masque."

Le serveur garde le mot de passe pour exécuter les sauvegardes, et Catena n'en conserve aucune autre copie. Sans lui, tout le contenu du seau est illisible. Le mot de passe est aussi nécessaire pour lire ces sauvegardes depuis un autre serveur (voir [Restauration et migration](/fr/configuration/restore-and-migrate/)).

La génération est refusée lorsqu'un mot de passe existe déjà, ou lorsque le dépôt contient déjà des sauvegardes sous un autre mot de passe. La raison s'affiche dans la même section. Ne réutilisez pas pour un nouveau serveur un dépôt qui contient les sauvegardes d'un autre serveur : utilisez plutôt un seau neuf et vide.

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

Conservez les quatre valeurs dans un gestionnaire de mots de passe, en entrées séparées, hors du serveur et hors du seau. La reconstruction d'un serveur à partir d'elles est décrite dans la page [Restauration et migration](/fr/configuration/restore-and-migrate/).

## Copies hors site

Une copie hors site garde une copie non réinscriptible de votre dépôt de sauvegarde dans un seau verrouillé chez un autre fournisseur. Elle protège contre un serveur ou un compte compromis : la destination ne peut être ni modifiée ni supprimée, même avec des clés valides, tant que le verrou n'a pas expiré. Une ligne peut nommer tout autre seau : c'est alors une copie planifiée ordinaire de ce seau, et aucune restauration ne la rattache à une application. Les copies hors site demandent Catena Business; la [comparaison des éditions](https://catena.run/fr/#pricing) donne les détails.

### Prérequis

- Un seau de destination chez un fournisseur autre que celui de la source, créé avec **Object Lock** et le **versionnage** activés (voir [Créer le seau de destination](#créer-le-seau-de-destination)).
- Une paire de clés pour la destination (voir [Clés de la destination](#clés-de-la-destination)) et, pour la source, les clés du seau copié.

### Créer le seau de destination

Une copie ne peut pas aller dans le seau de sauvegarde lui-même, car les sauvegardes y sont élaguées et un verrou bloquerait l'élagage. Chaque seau source a son propre seau de destination.

1. Choisissez un fournisseur qui prend en charge Object Lock et qui n'est pas celui de la source :

   | Fournisseur | Remarques |
   |---|---|
   | eazybackup (Canada) | Propriété canadienne, compatible S3 avec Object Lock et versionnage, sans frais de sortie de données. |
   | Backblaze B2 | Object Lock pris en charge; propriété américaine; frais de sortie de données au-delà d'une allocation mensuelle. |
   | AWS S3 | Le mode Conformité est appliqué strictement; propriété américaine. |
   | OVHcloud Object Storage | Object Lock s'active à la création du seau, ce qui active aussi le versionnage. Non offert pour la classe de stockage Cold Archive. |

   Cloudflare R2 ne peut pas héberger une destination : il n'offre ni Object Lock ni versionnage. Ses verrous de seau (bucket locks) empêchent la suppression et l'écrasement des objets, mais ne gardent aucune version antérieure à remettre en place.
2. Créez un seau neuf, un par seau source. Ne partagez pas un seau de destination entre deux copies.
3. Activez le **versionnage**. Il conserve la version précédente d'un objet écrasé ou supprimé.
4. Activez **Object Lock** à la création, avec une rétention par défaut d'au moins 30 jours (90 jours recommandés). Choisissez le mode **Conformité** (Compliance) lorsque le fournisseur l'offre : personne, pas même le propriétaire du seau, ne peut le raccourcir. Le mode **Gouvernance** (Governance) est le recours lorsque la Conformité ne vous est pas accessible.
5. Notez le point d'accès et le nom du seau. Le panneau les prend en une seule adresse, `s3:https://<point-d-acces>/<seau>`.

Les versions qui ne sont plus courantes occupent de l'espace jusqu'à l'expiration du verrou. Pour un seau qui change beaucoup, prévoyez de deux à cinq fois la taille de la source la première année, et créez chez le fournisseur une règle de cycle de vie qui fait expirer les versions non courantes après la période de rétention. Une règle de cycle de vie s'exécute chez le fournisseur et n'exige aucun droit de suppression sur la clé confiée à Catena.

### Clés de la destination

Créez une paire de clés par seau de destination, pour que la fuite d'une paire n'atteigne pas un autre seau. Gardez trois rôles distincts :

| Clé | Droits | Où elle se trouve |
|---|---|---|
| Clé de copie | Écriture et lecture, jamais de suppression : `s3:PutObject`, `s3:GetObject`, `s3:GetObjectVersion`, `s3:ListBucket`, `s3:GetBucketLocation`, `s3:AbortMultipartUpload`, `s3:ListMultipartUploadParts`. Omettez `s3:DeleteObject`, `s3:DeleteObjectVersion`, `s3:PutObjectRetention` et `s3:BypassGovernanceRetention`. | Dans les champs **Clé d'accès S3 de la destination** et **Clé secrète S3 de la destination** de la ligne. |
| Clé de restauration | Lecture seule : lister le seau, lire les objets (les versions antérieures aussi, pour restaurer un moment passé) et trouver l'emplacement du seau (`s3:ListBucket`, `s3:GetObject`, `s3:GetObjectVersion`, `s3:GetBucketLocation`). | Dans un gestionnaire de mots de passe. Vous la saisissez dans la page **Restauration** au besoin (voir [Restaurer la sauvegarde d'un autre serveur](/fr/configuration/restore-and-migrate/#restaurer-la-sauvegarde-dun-autre-serveur)); elle n'est pas conservée sur le serveur. |
| Clé d'élagage | Les droits de la clé de copie, plus `s3:DeleteObject` et `s3:DeleteObjectVersion`. | Jamais sur le serveur. Dans un gestionnaire de mots de passe, utilisée depuis votre propre ordinateur seulement lorsque le fournisseur n'a pas de règle de cycle de vie et que vous devez supprimer d'anciennes versions à la main. |

Une clé de copie sans droit de suppression garantit qu'aucune demande de suppression venant du serveur n'atteint la destination, et toute suppression visible dans le journal d'accès du fournisseur ne vient pas de Catena. Certains fournisseurs exigent aussi le droit de suppression pour nettoyer les téléversements inachevés; ajoutez-le seulement si les copies échouent pour cette raison.

Comment chaque fournisseur exprime l'absence de suppression :

- **eazybackup et autres fournisseurs compatibles MinIO :** associez à l'utilisateur de la clé une politique qui autorise les actions ci-dessus.
- **AWS S3 :** associez la même politique, avec l'ARN du seau, à un utilisateur IAM.
- **Backblaze B2 :** à la création de la clé d'application, cochez `listBuckets`, `listFiles`, `readFiles` et `writeFiles`, et laissez `deleteFiles` décoché.
- **OVH Object Storage :** donnez à la clé le rôle de lecture et d'écriture, pas celui d'administrateur.

Pour remplacer une clé : saisissez la nouvelle dans la ligne, attendez qu'une exécution planifiée réussisse, puis supprimez l'ancienne clé chez le fournisseur. Aucune autre étape n'est nécessaire.

### Étapes

1. Ouvrez **Paramètres** > **Copies hors site**. La section demande Catena Business. Sans cette édition, elle indique "Disponible avec une licence Catena Business." avec un lien vers **Abonnement**, et n'affiche aucun formulaire. Lorsque des copies sont déjà déclarées, elle en donne le nombre, et elles reprennent dès que la licence inclut Business.
2. Sous **Ajouter une copie**, remplissez une ligne :

| Champ | Contenu |
|---|---|
| **Nom** | Lettres minuscules, chiffres et traits d'union; 40 caractères au maximum; unique. |
| **URL du dépôt source** | Le seau à copier, sous la forme `s3:https://<point-d-acces>/<seau>`. |
| **Clé d'accès S3 de la source**, **Clé secrète S3 de la source** | Les clés de la source. |
| **URL du dépôt de destination** | Le seau verrouillé, au même format d'adresse. |
| **Clé d'accès S3 de la destination**, **Clé secrète S3 de la destination** | Les clés de la destination. |

3. Appuyez sur **Enregistrer les copies hors site**. La page répond "Copies hors site enregistrées." Retirez une ligne avec **Retirer cette copie à l'enregistrement (les copies déjà faites sont conservées)**.

Saisissez les deux jeux de clés dans la ligne, même pour le dépôt de sauvegarde, dont les clés sont aussi conservées sous **Dépôt de sauvegarde** : cette liste décide de ce qui est copié où. La source et la destination doivent être des seaux différents, et vous pouvez ajouter 32 lignes au plus. Laissez le secret vide sur une ligne existante pour conserver celui qui est stocké. Tant qu'aucune ligne n'existe, la section indique "Aucune copie hors site n'est déclarée, donc rien n'est copié hors site."

Les copies s'exécutent selon la tâche **Copie hors site** de la page [Horaires](/fr/configuration/schedules/), livrée désactivée : activez-la là une fois la ligne enregistrée. Elles s'exécutent aussi comme étape de la maintenance. Une destination injoignable ou non configurée est consignée comme sautée et n'arrête pas les sauvegardes.

### Comportement d'une copie

- Avant chaque copie, les sauvegardes au-delà des nombres de conservation sont supprimées du dépôt de sauvegarde et le dépôt est vérifié, de sorte que le stockage non réinscriptible ne reçoit que les sauvegardes que vous conservez. Tant qu'une copie hors site existe, ce nettoyage ne supprime que les données qu'aucune sauvegarde conservée n'utilise et ne réécrit jamais un stockage en partie utilisé : le stockage non réinscriptible contient donc chaque donnée une seule fois.
- Une copie ne fait qu'ajouter. Rien de ce qu'elle a écrit n'est ensuite modifié ni supprimé. Un seau retiré de la liste conserve toutes les copies déjà faites, et le coût de stockage croît avec le volume de changements.
- Une copie verrouillée est lue sur place. La page **Restauration** restaure le serveur depuis la copie hors site de son dépôt de sauvegarde et remet en place tout seau déclaré depuis sa copie (voir [Restaurer la sauvegarde d'un autre serveur](/fr/configuration/restore-and-migrate/#restaurer-la-sauvegarde-dun-autre-serveur) et [Remettre un seau en place depuis sa copie hors site](/fr/configuration/restore-and-migrate/#remettre-un-seau-en-place-depuis-sa-copie-hors-site)).
- La copie d'un seau autre que le dépôt de sauvegarde est une copie planifiée ordinaire de ce seau. Aucune restauration ne la rattache à une application.

## Ce que contient une sauvegarde

Inclus :

- les données de chaque application, y compris ses volumes Docker et les dossiers rangés dans l'espace de stockage des applications du serveur, et l'historique de la page d'état, du moniteur de signalement et du moniteur de ressources;
- un export de chaque base de données, fait juste avant l'instantané (voir plus bas);
- la configuration propre au serveur : fichiers système, réglages SSH et pare-feu, réglages et secrets conservés par Catena, et journal administratif;
- chaque dossier listé sous **Autres dossiers à sauvegarder (séparés par des virgules)**.

Exclus : les couches d'images de conteneurs (elles sont retéléchargées), les bases de signatures de l'antivirus, les journaux et les dossiers temporaires.

Non inclus : les données qu'une application garde hors de ce serveur, par exemple dans un seau que vous l'avez configurée pour utiliser. Un seau n'est copié que si vous le déclarez sous **Copies hors site**, comme copie ordinaire (voir [Copies hors site](#copies-hors-site)).

L'export des bases est automatique pour chaque conteneur en marche dont l'image est une image PostgreSQL, son nom contenant `postgres` ou commençant par `postgis`, `timescale` ou `pgvector`, ou une image MariaDB ou MySQL. PostgreSQL est exporté avec `pg_dumpall`. MariaDB et MySQL exigent `MARIADB_ROOT_PASSWORD` ou `MYSQL_ROOT_PASSWORD` dans l'environnement du conteneur. Chaque export est un fichier SQL en clair, un par serveur de bases de données, que le stockage des sauvegardes compresse : chaque sauvegarde après la première n'envoie donc que ce qui a changé. Un export qui échoue pour une base en marche fait échouer toute la sauvegarde. Une base qui n'est pas encore en marche est un autre cas : une sauvegarde attend jusqu'à dix minutes que la base de données de chaque application déployée soit en marche avant de l'exporter, et une base encore arrêtée après ce délai est laissée de côté dans cette sauvegarde, la sauvegarde de tout le reste se poursuit, et l'exécution est signalée comme échouée, avec le nom de l'application. Les autres moteurs, comme MongoDB ou SQLite, n'ont aucun export automatique.

Chaque sauvegarde place en mode sauvegarde chaque application qui en déclare un : une application du catalogue dont l'entrée le demande, comme Nextcloud, est placée en mode maintenance le temps de la sauvegarde et en est sortie juste après l'instantané, même quand la sauvegarde échoue. Cela vaut pour la sauvegarde que prend la maintenance, pour celle que la tâche **Sauvegarde** exécute selon son propre horaire et pour **Lancer une sauvegarde**. Une application qui ne déclare aucun mode sauvegarde reste en marche : ses exports de bases sont cohérents, et ses fichiers sur le disque sont tels qu'ils étaient pendant l'utilisation. Une restauration sort du mode maintenance les applications qu'elle remet en place.

Après chaque instantané, le serveur vérifie chaque conteneur en marche pour repérer les dossiers montés depuis l'extérieur de l'ensemble sauvegardé. Une sauvegarde échoue lorsqu'elle en trouve un qui n'est pas listé sous **Autres dossiers à sauvegarder (séparés par des virgules)**; l'action **Vérifier la couverture des sauvegardes** exécute la même vérification sur demande.

## Garder les fichiers d'une application sur un disque que vous attachez

Une application garde ses fichiers dans un volume Docker, sur le disque du serveur lui-même, tant que vous ne la dirigez pas ailleurs. Pour un grand ensemble de fichiers, ou pour les garder à part du disque système, attachez un volume chez votre fournisseur et faites garder à l'application ses fichiers dessus. Catena ne monte aucun disque elle-même : vous attachez, formatez et montez le disque, vous inscrivez son point de montage dans Catena et vous dirigez l'application vers un dossier du disque. Les étapes prennent `/mnt/data` comme point de montage et `my-app` comme dossier de l'application; remplacez les deux. Exécutez les commandes en tant que root par SSH.

### Préparer le disque

1. Attachez un volume au serveur dans la console de votre fournisseur. Le chiffrement du volume est une option du fournisseur, lorsqu'il en offre une (voir [Chiffrement du disque et des fichiers](#chiffrement-du-disque-et-des-fichiers)). Exécutez `lsblk` pour trouver le nom de périphérique qu'il reçoit, par exemple `/dev/sdb`.
2. Formatez-le une seule fois. Cela efface tout le contenu du volume :

   ```sh
   mkfs.ext4 /dev/sdb
   ```

3. Créez le point de montage et lisez l'UUID du volume :

   ```sh
   mkdir -p /mnt/data
   blkid /dev/sdb
   ```

4. Ajoutez une ligne à `/etc/fstab`, avec l'UUID qu'a affiché `blkid`. Un UUID reste le même quand le nom du périphérique change, et `nofail` laisse le serveur démarrer quand le disque est absent :

   ```text
   UUID=<uuid> /mnt/data ext4 defaults,nofail 0 2
   ```

5. Montez le disque et vérifiez-le :

   ```sh
   systemctl daemon-reload
   mount /mnt/data
   df -h /mnt/data
   ```

6. Faites attendre le disque par Docker au démarrage. Créez le fichier `/etc/systemd/system/docker.service.d/40-data-disk.conf` avec ce contenu, puis exécutez `systemctl daemon-reload` :

   ```ini
   [Unit]
   WantsMountsFor=/mnt/data
   ```

   Docker démarre alors après le montage du disque quand le disque est présent, et démarre quand même quand il est absent : les autres applications continuent donc de tourner. N'utilisez pas `RequiresMountsFor=` : il garde Docker, et avec lui toutes les applications, à l'arrêt tant que le disque est absent.
7. Créez un dossier vide sur le disque pour l'application :

   ```sh
   mkdir /mnt/data/my-app
   ```

   Ne donnez jamais à une application le dossier de premier niveau du disque, `/mnt/data`. Tant que le disque est absent, le dossier qu'il contient n'existe pas : l'application ne démarre pas et n'écrit rien sur le disque système, alors que le dossier de premier niveau existe avec ou sans le disque. La vérification d'application refuse un montage lié du dossier de premier niveau (voir la règle [X17](/fr/configure-apps/#x17)). Les notes propres à l'application disent si le dossier doit avoir un propriétaire particulier (voir [Réglages, déploiement, retrait et suppression](/fr/configure-apps/#réglages-déploiement-retrait-et-suppression)).

### Dire à Catena et à l'application où sont les fichiers

1. Ouvrez **Paramètres** > **Dépôt de sauvegarde**, ajoutez le point de montage, `/mnt/data`, à **Autres dossiers à sauvegarder (séparés par des virgules)** et enregistrez. Tout ce qu'il contient va dans chaque sauvegarde. Un montage lié hors du dossier propre de l'application n'est accepté que sous un dossier inscrit ici : faites donc cette étape en premier.
2. Ajoutez l'application, puis ouvrez sa page. Réglez le paramètre qui dit où elle garde ses fichiers sur le dossier que vous avez créé, `/mnt/data/my-app`. Les étapes de mise en route de l'application nomment ce paramètre. Il est lu au premier démarrage et verrouillé ensuite (voir [Déclarer les réglages](/fr/configure-apps/#déclarer-les-réglages-facultatif)) : réglez-le donc avant le premier déploiement.
3. Appuyez sur **Déployer l'application**.

### Ce que Catena vérifie

Chaque sauvegarde note quels dossiers inscrits se trouvent sur un disque monté, et Catena surveille ces disques pendant son travail :

- **Sauvegarde.** Quand un disque qui était monté lors de la dernière sauvegarde ne l'est plus, la sauvegarde s'arrête avant de rien enregistrer : elle n'enregistre donc jamais un dossier vide à la place des fichiers du disque. La page **Journal** indique "La sauvegarde n'a pas eu lieu : `<dossier>` était un disque monté lors de la dernière sauvegarde et ne l'est plus." Montez le disque au même chemin et relancez la sauvegarde. Si vous avez retiré le disque volontairement, retirez le dossier des **Autres dossiers à sauvegarder**, ce qui met fin à la vérification. Un autre disque monté au même chemin n'arrête pas la sauvegarde : le journal de sauvegarde dit que le disque a changé. Un dossier inscrit qui se trouve dans un disque monté ailleurs est vérifié par l'intermédiaire de ce disque.
- **Déploiement, démarrage et mise à jour.** Une application dont les fichiers sont sur un disque qui n'est pas monté n'est ni déployée, ni démarrée, ni mise à jour. La page nomme le dossier à monter.
- **Démarrage du serveur.** Une application dont le disque est absent ne peut pas démarrer, car son dossier n'existe pas, et Catena l'arrête au démarrage. La page **Journal** indique "`<application>` a été arrêtée au démarrage du serveur : elle garde ses fichiers dans `<dossier>`, un disque qui n'est pas monté." Montez le disque. L'application revient d'elle-même au prochain démarrage du serveur, ou tout de suite quand vous la déployez depuis la page **Applications**. Une application que vous avez arrêtée vous-même reste arrêtée.
- **Restauration.** Une restauration refuse de commencer, sans rien toucher, quand un disque où elle écrit n'est pas monté ou manque de place (voir [Disques sur lesquels une restauration écrit](/fr/configuration/restore-and-migrate/#disques-sur-lesquels-une-restauration-écrit)).

### Sauvegarde et restauration

- La sauvegarde grossit avec le disque. Tout ce que contient un dossier inscrit va dans chaque sauvegarde : le dépôt contient donc autant que le disque, et une restauration demande la même place sur le disque.
- La restauration d'une seule application ramène le dossier de cette application sur le disque et rien d'autre du disque (voir [Restaurer sur un serveur en marche](/fr/configuration/restore-and-migrate/#restaurer-sur-un-serveur-en-marche)).
- Sur un nouveau serveur, montez un disque au même chemin avant de lancer la restauration : suivez [Préparer le disque](#préparer-le-disque) jusqu'à l'étape 6, et sautez l'étape 2 quand le disque contient déjà des fichiers, car le formater l'efface. La restauration écrit les dossiers inscrits sur le disque, mais elle n'écrit pas le `/etc` du serveur : vous refaites à la main la ligne de `/etc/fstab` et le fichier de Docker.

### Chiffrement du disque et des fichiers

Catena ne met en place aucun chiffrement des fichiers d'une application. Deux options distinctes existent :

- **Le chiffrement de volume du fournisseur**, quand votre fournisseur en offre un, s'active à la création ou à l'attachement du volume. Le serveur voit le disque déchiffré tant qu'il est attaché, et Catena ne gère ni n'affiche la clé du fournisseur. Il protège le contenu du volume chez le fournisseur, pas contre quelqu'un qui atteint le serveur en marche.
- **Le chiffrement propre à une application pour ses fichiers au repos**, quand l'application en offre un, est un réglage de l'application. Les notes de l'application, sur sa page sous **En savoir plus sur cette application** (voir [Réglages, déploiement, retrait et suppression](/fr/configure-apps/#réglages-déploiement-retrait-et-suppression)), disent comment l'activer, ce qu'il couvre, où sont ses clés et ce qui est perdu sans elles. Il fonctionne de la même façon sur un volume et sur un disque attaché.

Catena chiffre elle-même les sauvegardes, avant qu'elles quittent le serveur, avec le mot de passe de sauvegarde, quelle que soit l'option que vous choisissez.

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

Chaque page d'administration affiche la bannière "Aucune sauvegarde n'est configurée : les mises à jour s'appliquent sans rien vers quoi revenir. En configurer une dans Paramètres." La maintenance applique tout de même les mises à jour dans cet état, et consigne un événement au Journal pour le signaler. Lorsque la maintenance ne change rien (elle est désactivée, ou [Mises à jour et Mise à niveau du moteur Docker](/fr/configuration/schedules/#choisir-les-étapes) sont toutes deux retirées), la bannière est raccourcie : "Aucune sauvegarde n'est configurée. En configurer une dans Paramètres." La bannière reste affichée jusqu'à la configuration d'un dépôt.

## Dépannage

| Symptôme | Cause et correctif |
|---|---|
| Les actions de sauvegarde sont absentes de **Actions** | Vous n'avez pas encore enregistré l'adresse du dépôt ou une clé. |
| "Point d'accès valide, mais son contenu n'a pas pu être lu." | Mauvaise paire de clés, absence de droit de lecture sur le seau, ou nom de seau erroné dans l'adresse. Corrigez et enregistrez de nouveau. |
| **Générer le mot de passe de chiffrement des sauvegardes** est refusé | Un mot de passe existe déjà, ou le seau contient des sauvegardes sous un autre mot de passe. Utilisez un seau vide. |
| Une sauvegarde échoue sur la couverture | Un conteneur monte un dossier hors de l'ensemble sauvegardé. Listez-le sous **Autres dossiers à sauvegarder (séparés par des virgules)**. |
| Une sauvegarde échoue sur un export de base de données | Un conteneur MariaDB ou MySQL sans `MARIADB_ROOT_PASSWORD` ni `MYSQL_ROOT_PASSWORD`, une base qui n'a pu être exportée, ou une application dont la base était encore arrêtée après dix minutes. L'exécution nomme l'application, et le journal de sauvegarde donne la raison. |
| Une sauvegarde n'a pas lieu, et la page **Journal** indique "La sauvegarde n'a pas eu lieu : ... ne l'est plus." | Un dossier inscrit était sur un disque monté lors de la dernière sauvegarde, et le disque n'est pas monté. Montez-le au même chemin, ou retirez le dossier des **Autres dossiers à sauvegarder** si vous avez retiré le disque (voir [Garder les fichiers d'une application sur un disque que vous attachez](#garder-les-fichiers-dune-application-sur-un-disque-que-vous-attachez)). |
| Une application est arrêtée, et la page **Journal** indique "... a été arrêtée au démarrage du serveur : ..." | Son disque n'est pas monté. Montez-le, puis déployez l'application depuis la page **Applications**, ou redémarrez le serveur. |
| Vous avez perdu la copie enregistrée du mot de passe | Tant que le serveur fonctionne, **Afficher les valeurs** dans **Trousse de reprise après sinistre** l'affiche de nouveau. Si le serveur a aussi disparu, rien ne permet de lire les sauvegardes. |

La page **Journal** consigne chaque sauvegarde terminée avec sa taille; la page [Mises à jour](/fr/configuration/updates/) décrit les autres événements qui y figurent.
