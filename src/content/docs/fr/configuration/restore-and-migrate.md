---
title: "Restauration et migration"
description: "Remettre des données en place depuis une sauvegarde, reconstruire un serveur perdu sur une nouvelle machine et déplacer un serveur en marche vers un autre."
---

Vous traitez trois situations depuis la page **Restauration** du panneau : votre serveur fonctionne mais ses données sont mauvaises, votre serveur est perdu et une nouvelle machine le remplace, ou vous remplacez un serveur en bon état par un autre. Les deux premières utilisent des sauvegardes; la troisième copie un serveur en marche et garde une voie de retour jusqu'aux toutes dernières minutes. La configuration des sauvegardes elles-mêmes est décrite dans la page [Sauvegardes et stockage S3](/fr/configuration/backups/).

## Prérequis

- Une restauration du serveur entier et le côté récepteur d'une migration fonctionnent dans toutes les éditions.
- La restauration d'une seule application, le rapport de restauration et le côté source d'une migration demandent Catena Pro ou Catena Business (voir la [comparaison des éditions](https://catena.run/fr/#pricing)).
- Vous avez ouvert le panneau en tant qu'administrateur.

## Restaurer sur un serveur en marche

La restauration remplace les données et rien d'autre. Les applications sont arrêtées pendant que leurs données sont remises en place, et elles reviennent à l'arrêt : vous les démarrez vous-même une fois qu'elles sont vérifiées (voir [Démarrer les applications après une restauration](#démarrer-les-applications-après-une-restauration)). La restauration d'une seule application laisse aussi cette application à l'arrêt. Un [déplacement vers un autre serveur](#migrer-vers-un-autre-serveur) fait exception : ses applications démarrent avec le serveur. Le panneau, l'authentification et la connexion qui sert la page restent accessibles tout du long : vous pouvez donc suivre la restauration du début à la fin. Il n'y a ni reconstruction ni reconfiguration à faire ensuite.

1. Ouvrez **Restauration**.
2. Sous **Quelles sauvegardes restaurer**, gardez **Les sauvegardes de ce serveur** et appuyez sur **Afficher les sauvegardes**.
3. Sous **Choisir une sauvegarde**, sélectionnez une ligne. Les colonnes sont **Effectuée le**, **Serveur**, **Taille** et **Étiquettes**. Chaque ligne est un point de restauration complet; choisissez la plus récente prise avant le début du problème. Lorsque le dépôt contient les sauvegardes de plus d'un serveur, la page avertit que choisir par horodatage seul peut restaurer les données d'un autre serveur par-dessus celles-ci : la colonne **Serveur** indique lequel a écrit chaque instantané. Une sauvegarde effectuée depuis la dernière vérification réussie du dépôt, pendant que cette vérification échoue, porte l'étiquette "Effectuée pendant que la vérification du dépôt échoue" : elle est conservée, jamais supprimée, et l'étiquette disparaît pour les sauvegardes suivantes une fois la vérification réussie.
4. Sous **Étendue de la restauration**, choisissez la portée :
   - **Tout ce que contient ce serveur** ramène toutes les applications à la sauvegarde choisie.
   - **Seulement les applications sélectionnées ci-dessous** (Catena Pro) ne ramène que les applications cochées. Seules celles-ci sont arrêtées; toutes les autres applications, l'authentification et le panneau continuent de fonctionner. Une application revient avec les données et la version enregistrées dans la sauvegarde. Ses réglages ne sont pas rétablis, car ils sont partagés avec le reste du serveur.

   Sans abonnement Pro, le choix de portée n'est pas affiché, et une demande pour une seule application est refusée avec "La restauration d'une seule application n'est pas offerte avec ce forfait."
5. Sous **Lancer la restauration**, cochez "Je comprends que mes applications seront indisponibles pendant la restauration." La durée dépend du volume de données.
6. Appuyez sur **Restaurer la sauvegarde sélectionnée**.

L'option "Copier les données seulement, sans rien démarrer. Sert à préparer un déplacement vers un autre serveur." copie les données puis s'arrête, en laissant toutes les applications éteintes. Laissez-la décochée pour une restauration ordinaire. Une migration fait cette préparation d'elle-même : la case n'est donc pas nécessaire pour une migration.

### Progression

La section **Restauration en cours** nomme l'étape en cours, dans cet ordre : Vérifications avant toute action (elles comprennent la règle de version ci-dessous), Enregistrement de ce qui fonctionne actuellement, Arrêt des applications, Copie des données, Récupération des images des applications, Reprise de la configuration sauvegardée, Démarrage des services de base, Maintien des applications à l'arrêt, Application de la configuration sauvegardée à ce serveur, Remise en service des applications, Restauration des bases de données, Mise à jour des applications, Vérification des fichiers stockés, Vérifications finales, et Terminé.

Une restauration terminée affiche un lien vers la section ci-dessous : "Les applications que cette restauration a ramenées restent à l'arrêt jusqu'à ce qu'elles soient démarrées ci-dessous."

### Restauration interrompue

La section indique "La restauration s'est arrêtée à :" suivi de l'étape. Chaque étape peut être reprise, ce qui offre deux voies :

- **Continuer :** choisissez la même sauvegarde et relancez-la; elle reprend là où elle s'est arrêtée. Une autre sauvegarde ou une autre portée est refusée.
- **Repartir du début :** appuyez sur **Effacer la restauration arrêtée**, puis relancez depuis le début.

Une deuxième restauration est refusée pendant qu'une autre est en cours ("Une restauration est déjà en cours sur ce serveur."), et une restauration en cours ne peut pas être effacée.

### Règle de version

Chaque sauvegarde enregistre la version de Catena qui l'a produite. La restauration la compare à la version que fait tourner le serveur :

- Un instantané **plus récent** que le serveur est refusé, car des fichiers de base de données plus récents ne s'ouvrent pas sous une base plus ancienne. Amenez d'abord le serveur à la version de l'instantané, puis relancez la restauration.
- Un instantané **plus ancien** que le serveur exige un choix explicite de mise à niveau. Sans lui, la restauration est refusée et rien n'est modifié.
- Deux versions impossibles à ordonner sont refusées.

Le refus survient à la première étape, avant que quoi que ce soit soit touché.

## Démarrer les applications après une restauration

Une restauration ne peut pas savoir si les données d'une application étaient compromises avant la sauvegarde; les applications clientes qu'elle a ramenées restent donc à l'arrêt jusqu'à ce que vous les démarriez. Une restauration du serveur entier laisse toutes les applications clientes à l'arrêt, et la restauration d'une seule application laisse cette application à l'arrêt. Les services propres à Catena (le panneau, l'authentification et la connexion) démarrent comme avant. Le démarrage des applications est offert dans toutes les éditions. Tant que vous n'avez pas démarré une application, elle reste à l'arrêt malgré les mises à jour et les redémarrages.

Tant que des applications sont laissées à l'arrêt, chaque page du panneau affiche une bannière : "Applications laissées à l'arrêt par la restauration de ce serveur : {apps}. Les démarrer depuis la page Restauration une fois vérifiées." Elle renvoie à la section **Applications laissées à l'arrêt après la restauration** de la page **Restauration**.

1. Décidez si chaque application est digne de confiance, par exemple si sa sauvegarde est antérieure à l'incident.
2. Ouvrez **Restauration** et allez à **Applications laissées à l'arrêt après la restauration**. Chaque application a une case, cochée par défaut, qui indique "À l'arrêt depuis le" et la date. Décochez une application pour la laisser à l'arrêt.
3. Cochez "J'ai vérifié ces applications, ou j'accepte le risque de les démarrer".
4. Appuyez sur **Démarrer les applications sélectionnées**.

Démarrer une application rétablit ses bases de données depuis la sauvegarde là où elles n'ont pas survécu, la sort du mode dans lequel la sauvegarde l'a placée, vérifie ses fichiers stockés, puis remet ce serveur à niveau, ce qui redémarre certains services. La section suit le démarrage étape par étape : Attente de la fin de la sauvegarde, de la copie hors site ou d'une mise à jour, Démarrage des applications, Restauration des bases de données, Mise à jour des applications, Vérification des fichiers stockés, Vérifications finales, Lancement de la remise à niveau de ce serveur, et Terminé. Pendant l'opération, la section indique "Démarrage des applications en cours :" suivi de l'étape, et à la fin, "Le dernier démarrage est terminé."

Une application démarrée quitte la liste. Une application qui n'a pas démarré est de nouveau arrêtée et reste listée avec "Son dernier démarrage n'a pas abouti :" suivi de la raison, par exemple "no container of it came up: ...", "it did not start: ..." ou "its stored definition names `<image>`, which none of its services ran when the backup was taken (...)". Les raisons s'affichent en anglais. Corrigez la cause, puis démarrez de nouveau l'application depuis la même section. Si le démarrage s'arrête en entier, la section indique "Le démarrage des applications s'est arrêté à :" suivi de l'étape. Les démarrer de nouveau reprend chaque étape, et une application déjà démarrée ne l'est pas une seconde fois.

Démarrez ces applications depuis la page **Restauration**, pas depuis Portainer. En démarrer une dans Portainer, ou y enregistrer sa définition, la démarre sans la vérification de ses bases de données ni sa sortie du mode sauvegarde, et le panneau avertit : "Démarrées hors de ce panneau depuis la restauration, sans la vérification de leurs bases de données ni leur sortie du mode sauvegarde : {apps}. Les démarrer depuis la page Restauration exécute les deux." Cette application reste listée. La démarrer depuis la page **Restauration** exécute ce qu'elle a sauté, sans la démarrer une seconde fois.

Vous pouvez aussi démarrer une application laissée à l'arrêt sans le panneau (voir [Quitter Catena](/fr/features/backup-restore-migrate/#quitter-catena)).

## Restaurer depuis un autre dépôt de sauvegarde

Restaurez depuis un dépôt de sauvegarde autre que celui où ce serveur sauvegarde : le dépôt de l'ancien serveur lorsqu'une nouvelle machine en remplace une qui n'existe plus, ou une copie des sauvegardes de ce serveur, comme sa [copie hors site](/fr/configuration/backups/#copies-hors-site), lorsque le dépôt de sauvegarde lui-même est endommagé, chiffré ou perdu. Le dépôt est lu sur place : le lire n'y écrit rien, une copie verrouillée reste donc verrouillée et une clé qui ne fait que lire suffit. Une copie hors site garde toutes les sauvegardes qui y ont été copiées, et une sauvegarde plus ancienne que la durée de verrouillage de la copie peut être incomplète.

Il vous faut l'adresse du dépôt, son mot de passe (le mot de passe de chiffrement des sauvegardes), et une clé d'accès et une clé secrète qui peuvent lire son compartiment. Pour reconstruire un serveur perdu, les quatre se trouvent dans la trousse de reprise (voir [Sauvegardes et stockage S3](/fr/configuration/backups/#trousse-de-reprise-après-sinistre)) : installez d'abord Catena sur le nouveau serveur (voir [Installation](/fr/installation/)). L'installateur prend la version la plus récente.

1. Ouvrez **Restauration**.
2. Sous **Quelles sauvegardes restaurer**, choisissez **Un autre dépôt de sauvegarde**. Ce choix est offert lorsque les composants installés du serveur le prennent en charge (voir Dépannage).
3. Sous **Un autre dépôt de sauvegarde**, remplissez :

   | Champ | Valeur |
   |---|---|
   | **Adresse du dépôt** | L'adresse du dépôt, `s3:https://<point-d-acces>/<compartiment>`. Les adresses des copies hors site de ce serveur sont proposées, ainsi que les dépôts que vous avez [listés dans un seau verrouillé](#lister-les-dépôts-dun-seau-verrouillé). |
   | **Mot de passe du dépôt** | Le mot de passe de chiffrement des sauvegardes |
   | **Clé d'accès du stockage** | La clé d'accès S3 |
   | **Clé secrète du stockage** | La clé secrète S3 |

   Seuls les champs émis par le fournisseur de stockage exigent une valeur, mais l'adresse et le mot de passe sont toujours requis ("L'adresse du dépôt et son mot de passe sont tous deux requis.").
4. Appuyez sur **Enregistrer ces identifiants**. Ils sont conservés en mémoire seulement, et effacés lorsqu'une restauration depuis ce dépôt se termine, au bout de 24 heures ou au redémarrage du serveur. Une restauration qui s'arrête en cours de route les garde pour que vous puissiez la relancer. Un déplacement vers ce serveur qui n'est pas terminé 24 heures après leur enregistrement exige de les enregistrer de nouveau. **Oublier les identifiants enregistrés** les efface immédiatement. Les sauvegardes de ce dépôt sont alors listées sous **Choisir une sauvegarde**.
5. Sélectionnez la sauvegarde (en cas de rançongiciel ou de compromission, une sauvegarde antérieure à l'incident), puis poursuivez avec les étapes 4 à 6 de [Restaurer sur un serveur en marche](#restaurer-sur-un-serveur-en-marche). La [règle de version](#règle-de-version) s'applique.

Une fois la restauration terminée, le serveur possède les données et la configuration enregistrée de la sauvegarde choisie. Ses applications restent à l'arrêt jusqu'à ce que vous les démarriez (voir [Démarrer les applications après une restauration](#démarrer-les-applications-après-une-restauration)).

Après cette restauration, les sauvegardes attendent que vous confirmiez la destination de sauvegarde ou que vous en enregistriez une nouvelle (voir [Reprendre les sauvegardes après une restauration](#reprendre-les-sauvegardes-après-une-restauration)).

## Reprendre les sauvegardes après une restauration

Une restauration du serveur entier ne peut pas savoir si le dépôt qu'elle a lu, ou la destination de sauvegarde que nomme la configuration restaurée, peut encore recevoir des écritures sans risque : un attaquant en détient peut-être les clés. Les sauvegardes attendent donc après chaque restauration du serveur entier, depuis le dépôt de ce serveur ou un autre. La restauration d'une seule application et un [déplacement vers un autre serveur](#migrer-vers-un-autre-serveur) laissent les sauvegardes en marche.

Tant que les sauvegardes attendent :

- Aucune sauvegarde n'est faite, et chaque exécution de sauvegarde signale une tentative échouée. La copie hors site ne copie rien et le test de restauration est ignoré.
- Chaque page d'administration affiche une bannière : "Les sauvegardes sont en pause depuis la restauration de ce serveur le {date} : une restauration ne peut pas savoir si la destination de sauvegarde peut encore recevoir des écritures sans risque. La confirmer, ou en enregistrer une nouvelle, dans Paramètres, sous Dépôt de sauvegarde."
- La section **Restauration en cours** indique "Les sauvegardes restent en attente jusqu'à ce que la destination de sauvegarde soit confirmée, ou qu'une nouvelle soit enregistrée, dans Paramètres." et propose le choix décrit sous [Choisir comment le dépôt de sauvegarde se poursuit](#choisir-comment-le-dépôt-de-sauvegarde-se-poursuit).

Pour les reprendre :

1. Vérifiez le dépôt. Après une compromission soupçonnée, préférez un nouveau compartiment avec de nouvelles clés.
2. Ouvrez **Paramètres** et allez à **Dépôt de sauvegarde**. La section indique "Les sauvegardes sont en pause depuis la restauration de ce serveur le {date} à partir de {repository}. Une restauration ne peut pas savoir si ce dépôt peut encore recevoir des écritures sans risque. Le vérifier, puis y sauvegarder de nouveau ou saisir une nouvelle destination." Quand la restauration a lu un autre dépôt que la destination que nomme la configuration restaurée, l'avis nomme les deux.
3. Cochez "Sauvegarder de nouveau vers cette destination" pour garder la destination telle quelle, ou saisissez la nouvelle destination et ses clés.
4. Enregistrez la section.

L'enregistrement vérifie que la destination répond et y crée un dépôt s'il n'y en a pas. Les sauvegardes ne reprennent que si la destination s'ouvre. Elles restent en attente, avec la raison dans la section, si elle ne s'ouvre pas, si aucune destination n'est enregistrée, ou pendant qu'une restauration est en cours ou arrêtée en cours de route sur ce serveur (terminez-la ou effacez-la d'abord sur la page **Restauration**).

Le mot de passe de sauvegarde suit votre choix sur la page **Restauration** :

- Avec **Un dépôt neuf**, ou sans choix et avec une nouvelle destination, l'enregistrement crée un nouveau mot de passe de sauvegarde, affiché une seule fois sous **Mot de passe de sauvegarde**, plus bas dans la section. Quiconque a compromis le serveur avant la restauration peut connaître l'ancien.
- Avec **Continuité**, le mot de passe de sauvegarde reste le même.
- Sans choix, confirmer la même destination garde le mot de passe.

La copie hors site qui copiait l'ancienne destination suit la nouvelle. Avec un dépôt neuf, elle copie dans un dossier qui lui est propre, dans le même compartiment verrouillé et nommé d'après le nouveau dépôt, et ce qu'elle avait copié de l'ancien reste en place. Avec la continuité, elle se poursuit dans le même dossier.

Avec la continuité, l'enregistrement ouvre d'abord la copie hors site et vérifie qu'elle contient le même dépôt que la nouvelle destination. Les sauvegardes restent en attente, et la section nomme la copie et son adresse, dans deux cas :

- La copie hors site contient un autre dépôt que la nouvelle destination. La raison se termine par "Put the offsite copy back into the new bucket, or choose a fresh start" (en anglais). Remettez d'abord la copie hors site dans le nouveau seau (voir [Remettre un compartiment en place depuis sa copie hors site](#remettre-un-compartiment-en-place-depuis-sa-copie-hors-site)) et enregistrez de nouveau ce compartiment, ou choisissez **Un dépôt neuf** sous **Comment le dépôt de sauvegarde se poursuit** et enregistrez de nouveau.
- La copie hors site ne s'ouvre pas : elle ne peut donc pas être vérifiée. Corrigez la cause indiquée par la raison, par exemple les clés de la copie hors site dans **Paramètres**, sous **Copies hors site**, puis enregistrez de nouveau.

## Réactiver les mises à jour nocturnes après une restauration

Pour la même raison, une restauration du serveur entier désactive les étapes **Mises à jour** et **Mise à niveau du moteur Docker** de l'entretien nocturne, et les autres étapes gardent le choix que vous avez fait. Rien ne change sur le serveur pendant la nuit tant que vous n'avez pas décidé. Chaque page d'administration affiche alors une bannière : "Aucune mise à jour automatique n'est configurée sur ce serveur depuis la restauration du {date}. Les réactiver dans Horaires, sous Entretien nocturne." La section **Restauration en cours** indique "Les mises à jour nocturnes restent désactivées jusqu'à ce qu'elles soient réactivées dans Horaires."

1. Ouvrez **Horaires** et allez à **Entretien nocturne**, sous **Étapes**.
2. Cochez **Mises à jour**, **Mise à niveau du moteur Docker**, ou les deux (voir [Choisir les étapes](/fr/configuration/schedules/#choisir-les-étapes)).
3. Appuyez sur **Enregistrer les horaires**.

La bannière disparaît dès que l'une des deux étapes est activée. Les mises à jour exigent Catena Pro ou Catena Business, et l'entretien nocturne lui-même doit être activé.

## Remettre un compartiment en place depuis sa copie hors site

Cette opération recopie la copie hors site d'un compartiment dans le compartiment dont elle provient. Elle vaut pour le dépôt de sauvegarde et pour tout autre compartiment déclaré sous **Copies hors site**, dans toutes les éditions. L'opération ne fait qu'ajouter : ce qui manque ou diffère est recopié, et rien n'est supprimé, d'un côté comme de l'autre. La copie hors site n'est que lue.

1. Ouvrez **Restauration** et allez à **Remettre un seau en place depuis sa copie hors site**. La section est affichée lorsque les composants installés du serveur la prennent en charge (voir Dépannage). Sans copie déclarée, elle indique "Aucune copie hors site n'est déclarée sur ce serveur. Les copies hors site se déclarent dans Paramètres, sous Copies hors site."
2. Sous **Copie hors site à remettre en place**, choisissez la copie. Chaque entrée indique son nom et l'adresse du compartiment qu'elle remet en place.
3. Saisissez **Clé d'accès qui lit la copie hors site** et **Clé secrète qui lit la copie hors site**. Elles servent à cette opération seulement et ne sont conservées nulle part.
4. Facultatif : sous **Application qui range ses fichiers dans ce seau**, choisissez l'application lorsque le compartiment contient ses fichiers, comme Nextcloud. Elle est mise en mode sauvegarde pendant que ses fichiers sont recopiés, puis ses fichiers stockés sont comparés à sa base de données. Gardez **Aucune** pour tout autre compartiment, et pour le dépôt de sauvegarde.
5. Facultatif : sous **Dans un autre seau (facultatif)**, les champs commencent par le seau dont provient la copie choisie (**Adresse du nouveau seau**) et sa clé d'accès (**Clé d'accès qui écrit dans le nouveau seau**), de sorte que les fichiers retournent là où ils étaient. Laissez **Clé secrète qui écrit dans le nouveau seau** vide pour garder celle que le serveur détient. Pour la copie du dépôt de sauvegarde, les champs commencent vides, car le dépôt de sauvegarde n'est jamais remis dans son propre seau. Pour mettre plutôt la copie dans un autre compartiment vide, remplacez l'adresse, la clé d'accès et la clé secrète par celles de ce compartiment : un seau ou une clé d'accès modifié exige sa clé secrète. Saisissez **Région du nouveau seau (facultatif)** lorsque le fournisseur de stockage en indique une : elle sert pour l'application choisie à l'étape 4. Un compartiment qui contient quoi que ce soit est refusé avant la copie. Avec une application et un nouveau compartiment, l'opération règle aussi l'application sur le nouveau compartiment (voir [Faire pointer Nextcloud vers le nouveau seau](#faire-pointer-nextcloud-vers-le-nouveau-seau)).
6. Facultatif : sous **Tel qu'il était le (UTC, facultatif)**, saisissez une date et une heure pour remettre les fichiers tels que la copie hors site les contenait à ce moment, par exemple avant qu'ils soient chiffrés ou écrasés. La clé d'accès doit alors avoir le droit de lire les versions antérieures. Laissé vide, les versions les plus récentes sont remises en place.
7. Cochez "Je comprends que le seau est modifié pendant sa remise en place." et appuyez sur **Remettre le seau en place**.

La section suit l'opération étape par étape : Attente de la fin de la sauvegarde, de la copie hors site ou d'une mise à jour, Prise de contact avec les deux seaux, Vérification que le seau peut reprendre la copie, Mise en mode sauvegarde de l'application, Recopie des fichiers, Réglage de l'application et de la copie hors site sur le nouveau seau, Sortie de l'application du mode sauvegarde, Vérification des fichiers stockés, et Terminé. Lorsque vous n'avez choisi aucune application, les trois étapes qui la concernent (entrée en mode sauvegarde, sortie du mode sauvegarde, vérification des fichiers stockés) passent sans rien faire. Lorsque vous n'avez nommé aucun nouveau seau, l'étape de réglage passe elle aussi sans rien faire.

La copie écrit dans le compartiment pendant qu'elle s'exécute. Un gros compartiment prend des heures, et le fournisseur de stockage peut facturer les données lues.

Si l'opération s'arrête, la section indique "La remise en place du seau s'est arrêtée à :" suivi de l'étape. Appuyez de nouveau sur **Remettre le seau en place** avec les mêmes valeurs : relancer ne recopie que ce qui manque encore. Le dépôt de sauvegarde n'est jamais remis dans son propre seau : une demande en ce sens est refusée avant que quoi que ce soit soit copié. Enregistrez une nouvelle destination de sauvegarde dans **Paramètres**, sous **Dépôt de sauvegarde**, ou nommez un nouveau compartiment vide où mettre la copie sous **Dans un autre seau (facultatif)**, puis enregistrez ce compartiment comme destination de sauvegarde (voir [Choisir comment le dépôt de sauvegarde se poursuit](#choisir-comment-le-dépôt-de-sauvegarde-se-poursuit)).

### Faire pointer Nextcloud vers le nouveau seau

Pour déplacer les fichiers de Nextcloud vers un nouveau seau, le formulaire de remise en place fait tout le déplacement :

1. Sous **Application qui range ses fichiers dans ce seau**, choisissez Nextcloud.
2. Sous **Dans un autre seau (facultatif)**, remplissez **Adresse du nouveau seau**, **Clé d'accès qui écrit dans le nouveau seau** et **Clé secrète qui écrit dans le nouveau seau**, ainsi que **Région du nouveau seau (facultatif)** lorsque le fournisseur de stockage en indique une.
3. Remplissez le reste du formulaire comme décrit plus haut et appuyez sur **Remettre le seau en place**.

L'opération copie les fichiers dans le nouveau seau. À l'étape Réglage de l'application et de la copie hors site sur le nouveau seau, elle règle Nextcloud sur le nouveau seau et ses clés, renomme le stockage de Nextcloud pour que ses fichiers restent lisibles, et fait copier le nouveau seau par la copie hors site désormais. Nextcloud redémarre sur le nouveau seau. Si le réglage échoue, les paramètres de Nextcloud sont remis comme avant. Nextcloud doit être en marche : un Nextcloud que vous avez arrêté vous-même est refusé, donc démarrez-le d'abord. Un Nextcloud qu'une restauration a laissé arrêté est réglé lorsque vous le démarrez depuis la page **Restauration** (voir [Démarrer les applications après une restauration](#démarrer-les-applications-après-une-restauration)). Vous ne changez rien dans Portainer.

### Lister les dépôts d'un seau verrouillé

Pour trouver les dépôts de sauvegarde que contient le seau verrouillé d'une copie hors site, comme celui qu'un nouveau départ recopie dans son propre dossier :

1. Sous le formulaire de remise en place, sous **Dépôts du seau d'une copie hors site**, choisissez la copie sous **Copie hors site à remettre en place**.
2. Saisissez **Clé d'accès qui lit la copie hors site** et **Clé secrète qui lit la copie hors site**. Elles lisent le seau pour cette demande seulement et ne sont conservées nulle part.
3. Appuyez sur **Lister les dépôts**.

La page indique "Dépôts de sauvegarde de ce seau :" suivi des adresses, "Ce seau ne contient aucun dépôt de sauvegarde." ou "Le seau n'a pas pu être listé." avec la raison. Chaque adresse est proposée en suggestion sous **Adresse du dépôt** de **Un autre dépôt de sauvegarde** (voir [Restaurer depuis un autre dépôt de sauvegarde](#restaurer-depuis-un-autre-dépôt-de-sauvegarde)).

### Choisir comment le dépôt de sauvegarde se poursuit

Après une restauration, les sauvegardes attendent que vous confirmiez la destination de sauvegarde, ou que vous en enregistriez une nouvelle, dans **Paramètres** (voir [Reprendre les sauvegardes après une restauration](#reprendre-les-sauvegardes-après-une-restauration)). Pendant qu'elles attendent, la page **Restauration** affiche **Comment le dépôt de sauvegarde se poursuit**, avec deux choix. Appuyez sur **Enregistrer ce choix** pour retenir le vôtre.

- **Un dépôt neuf** (sélectionné tant que vous ne choisissez pas autre chose). Les sauvegardes démarrent un nouveau dépôt sous un nouveau mot de passe de sauvegarde, affiché une seule fois lorsque vous enregistrez ou confirmez la destination dans **Paramètres**. Sa copie hors site va dans un nouveau dossier du même compartiment verrouillé, à côté de l'ancien. Choisissez ce mode après une compromission soupçonnée.
- **Continuité**. Le dépôt de sauvegarde revient de sa copie hors site dans un nouveau compartiment vide que vous nommez sous **Remettre un seau en place depuis sa copie hors site** (voir les étapes ci-dessus, avec **Adresse du nouveau seau** remplie). Enregistrez ensuite ce compartiment comme destination de sauvegarde dans **Paramètres** : les sauvegardes s'y poursuivent sous le même mot de passe de sauvegarde, et la copie hors site se poursuit dans le même dossier du compartiment verrouillé, donc rien n'est stocké deux fois. Choisissez ce mode après un accident, comme un compartiment supprimé ou une panne du fournisseur.

La continuité conserve la clé maîtresse du dépôt. Un nouveau mot de passe de sauvegarde ne fait que réenvelopper cette clé : quiconque détient l'ancien mot de passe et une copie de l'ancien fichier de clé peut encore lire les données du dépôt poursuivi s'il atteint ses fichiers.

Sans choix, enregistrer une nouvelle destination crée un nouveau mot de passe de sauvegarde, et confirmer la même n'en crée pas. Une remise en place et une restauration ne s'exécutent pas ensemble : chacune est refusée pendant que l'autre est en cours.

## Rapport de restauration

Le panneau **Rapport de restauration** (Catena Pro) montre la preuve que les sauvegardes se restaurent : un test de restauration local avec son temps de récupération, et l'état de la copie hors site. Le test local est désactivé tant que vous ne l'activez pas : il s'exécute chaque semaine selon l'horaire **Test de restauration**, ou chaque nuit comme étape de l'entretien nocturne (voir [Horaires](/fr/configuration/schedules/)). Il télécharge autant que la sauvegarde contient et demande autant d'espace disque libre : activez-le lorsque le serveur a la place. **Vérifier que ma sauvegarde est restaurable**, dans **Actions**, l'exécute sur demande. Un lien vers le rapport figure dans la section Restauration en cours.

## Migrer vers un autre serveur

Une migration copie presque tout pendant que l'ancien serveur continue de servir. Seules les dernières minutes sont indisponibles pour les personnes qui l'utilisent, et cette période ne croît pas avec le volume de données. Vous lancez le déplacement depuis le nouveau serveur, une fois que l'ancien a ouvert une fenêtre limitée dans le temps.

### Prérequis

- L'ancien serveur a Catena Pro ou Catena Business. Le nouveau serveur n'a besoin d'aucun abonnement à lui : la clé d'abonnement suit les données.
- Les deux serveurs tournent sur la même version de Catena. Un déplacement entre versions différentes est refusé avant que quoi que ce soit soit touché.
- Le nouveau serveur joint le port SSH 22 de l'ancien : par son adresse publique, ou par son réseau privé une fois son SSH public fermé (voir [Accès administrateur et réseau privé](/fr/configuration/admin-access/#fermer-le-ssh-sur-le-port-public-22)).
- Le dépôt de sauvegarde de l'ancien serveur est enregistré sur le nouveau (étapes 2 à 4 de [Restaurer depuis un autre dépôt de sauvegarde](#restaurer-depuis-un-autre-dépôt-de-sauvegarde)).
- Vous n'avez saisi aucun jeton Cloudflare sur le nouveau serveur. Le déplacement apporte celui de l'ancien serveur, et un jeton saisi d'abord prendrait l'adresse web de l'ancien serveur avant le début du déplacement.

### Sur l'ancien serveur

1. Ouvrez le panneau **Migration**.
2. Appuyez sur **Autoriser le déplacement de ce serveur**. Trois champs apparaissent sous le bouton, une seule fois : le **Billet de déplacement**, avec un bouton **Copier**, le **Code d'appairage**, et **Fermeture de la fenêtre de déplacement**, l'heure de fermeture dans le fuseau horaire du serveur. Ni le billet ni le code n'est conservé, et ni l'un ni l'autre n'est réaffiché.
3. Transmettez les deux à la personne qui effectue le déplacement par deux moyens différents : copiez-lui le billet avec **Copier**, et lisez-lui le code à voix haute.

La fenêtre se referme d'elle-même après 4 heures; cinq codes erronés la ferment aussi, et **Ne plus autoriser le déplacement** la ferme aussitôt. Remplacez un billet ou un code perdu en appuyant de nouveau sur le bouton, ce qui produit une nouvelle paire et arrête les anciens. La fenêtre se ferme également une fois que le déplacement a transmis la clé d'abonnement.

### Sur le nouveau serveur

1. Ouvrez **Restauration** et allez à **Déplacer un autre serveur ici**.
2. Collez le **Billet de déplacement**.
3. Saisissez le **Code d'appairage**.
4. Laissez **Adresse de l'autre serveur (facultative)** vide pour utiliser l'adresse du billet, ou saisissez une autre adresse IP, par exemple l'adresse de l'ancien serveur sur le réseau privé une fois son SSH public fermé. N'utilisez jamais son adresse web : elle migre à la fin, elle ne peut donc pas servir à joindre l'ancien serveur pendant le déplacement.
5. Réglez **Passes de préparation** (de 1 à 5, 1 par défaut). Chaque passe supplémentaire ne copie que ce qui a changé depuis la précédente, ce qui raccourcit la période d'indisponibilité finale. Une seule suffit, sauf si vous prévoyez un long délai avant la bascule.
6. Cochez "Je comprends que l'autre serveur sera retiré du service et que celui-ci reprendra son adresse web." et appuyez sur **Lancer le déplacement**.

### Déroulement

1. Prise de contact avec l'autre serveur.
2. Copie des données, et Préparation de ce serveur à recevoir le trafic. L'ancien serveur sert toujours.
3. Mise en pause des applications de l'autre serveur. La courte période d'indisponibilité commence.
4. Sauvegarde finale de l'autre serveur, puis Vérification de cette sauvegarde. C'est la dernière étape réversible.
5. Retrait de l'autre serveur du service. À partir d'ici, l'ancien serveur ne se remet plus en service tout seul.
6. Mise en place des données ici, puis Bascule de l'adresse web vers ce serveur.
7. Vérifications finales.

Un déplacement démarre les applications avec le serveur : rien n'est laissé à l'arrêt.

Après les vérifications finales, l'ancien serveur libère son activation de la clé d'abonnement, et le nouveau serveur l'active puis se remet à niveau, ce qui active ce que la clé débloque (domaines supplémentaires, horaires). Certains services redémarrent pendant l'opération. **Paramètres** > **Abonnement** en indique le résultat. Si la libération de l'ancienne activation échoue, libérez-la dans le portail client de Polar et enregistrez de nouveau la clé sur le nouveau serveur.

### Annuler le déplacement

- Jusqu'à "Vérification de cette sauvegarde" inclusivement, l'arrêt du déplacement remet l'ancien serveur en service de lui-même. Rien n'a démarré sur le nouveau serveur et l'adresse web pointe toujours vers l'ancien.
- Après "Retrait de l'autre serveur du service", ce n'est plus automatique, parce que le nouveau serveur peut déjà détenir une partie des données et que démarrer les deux ferait écrire deux serveurs dans le même stockage. La page indique que l'ancien serveur est retiré du service et propose deux voies : corriger ce qui a échoué et relancer le déplacement (il reprend sans tout recopier), ou remettre l'ancien serveur en service.
- Pour remettre l'ancien serveur en service, utilisez **Le remettre en service** sous **Remettre l'autre serveur en service** dans la page Restauration du nouveau serveur (saisissez de nouveau le billet, le code d'appairage et, au besoin, l'adresse), ou **Remettre ce serveur en service** dans le panneau **Migration** de l'ancien serveur. Son adresse web pointe toujours vers lui, il sert donc de nouveau dès qu'il redémarre.
- **Oublier ce déplacement** efface la trace d'un déplacement inachevé et ne modifie rien sur l'un ou l'autre serveur.

Après un déplacement terminé, l'ancien serveur est arrêté, pas effacé. Ses données et ses sauvegardes sont intactes : vous pouvez le garder jusqu'à ce que le nouveau serveur ait fait ses preuves. Le retirer est une étape distincte que rien dans le déplacement n'exécute.

## Dépannage

| Message | Signification |
|---|---|
| "Choisissez une sauvegarde à restaurer." | Vous n'avez sélectionné aucune ligne. |
| "Confirmer que les applications peuvent être indisponibles avant de lancer la restauration." | Vous n'avez pas coché la case de confirmation. |
| "Sélectionnez au moins une application, ou choisissez de tout restaurer." | La portée est limitée aux applications et vous n'en avez coché aucune. |
| "Une restauration est en cours sur ce serveur. Attendez qu'elle se termine avant d'y déplacer un autre serveur." | Une migration ne peut pas démarrer pendant une restauration. |
| "Un déplacement est déjà en cours sur ce serveur." | Attendez sa fin, ou utilisez **Oublier ce déplacement** s'il est inachevé. |
| "Le déplacement n'a pas pu être lancé." | La demande n'a pas été acceptée. Vérifiez le billet, le code d'appairage et l'adresse (une adresse IP, pas un nom), ainsi que l'ouverture de la fenêtre sur l'ancien serveur. |
| La source a refusé le billet : sa fenêtre est fermée, elle a été ouverte de nouveau depuis, ou le billet n'est pas celui de ce serveur | L'ancien serveur n'a pas accepté le billet. Ouvrez une nouvelle fenêtre de déplacement sur l'ancien serveur, puis utilisez son nouveau billet et son nouveau code. |
| Le serveur à cette adresse n'est pas celui qui a produit le billet | L'adresse joint un autre serveur, ou la clé d'hôte SSH de l'ancien serveur a changé après une réinstallation ou une restauration. Vérifiez l'adresse; après une réinstallation ou une restauration, ouvrez une nouvelle fenêtre de déplacement sur l'ancien serveur et utilisez son nouveau billet. |
| "Les identifiants ont été refusés." | Les détails du dépôt n'ont pas été acceptés. Comparez-les à la trousse de reprise. |
| La liste des sauvegardes affiche "this server's backup repository refused its access key: the key is wrong or revoked." | Le fournisseur de stockage a refusé la clé d'accès que ce serveur détient. La page répond en une vingtaine de secondes au lieu d'attendre. Corrigez la clé dans **Paramètres**, sous **Sauvegarde**, ou saisissez la trousse du dépôt à restaurer sous **Un autre dépôt de sauvegarde**. La même liste peut aussi indiquer que le dépôt n'a pas répondu, n'existe pas ou ne s'ouvre pas avec le mot de passe de sauvegarde. La raison est affichée en anglais. |
| "Un seau est en cours de remise en place depuis sa copie hors site. Attendez que l'opération se termine avant de lancer une restauration." | Une remise en place de compartiment est en cours. Une restauration ne démarre qu'après sa fin, et une remise en place est refusée de la même façon pendant une restauration ("Une restauration est en cours sur ce serveur. Attendez qu'elle se termine avant de remettre un seau en place."). |
| "La restauration depuis un autre dépôt de sauvegarde n'est pas encore offerte sur ce serveur : ses composants installés sont plus anciens que ce panneau. Remettez ce serveur à niveau dans Paramètres, sous Configuration du serveur, puis réessayez.", "La remise en place d'un seau n'est pas encore offerte sur ce serveur : ses composants installés sont plus anciens que ce panneau." ou "Le démarrage des applications depuis cette page n'est pas encore offert sur ce serveur : ses composants installés sont plus anciens que ce panneau. Remettez ce serveur à niveau dans Paramètres, sous Configuration du serveur, puis réessayez." | Les composants installés du serveur sont antérieurs à cette fonction. Ouvrez **Paramètres**, allez à **Configuration du serveur**, appuyez sur **Remettre ce serveur à niveau**, puis réessayez une fois l'opération terminée. |
| "Confirmez que ces applications ont été vérifiées, ou que le risque de les démarrer est accepté, avant de les démarrer." | Vous n'avez pas coché la case de confirmation de **Applications laissées à l'arrêt après la restauration**. |
| "Une restauration est en cours sur ce serveur. Attendez qu'elle se termine avant de démarrer les applications." | Les applications ne peuvent pas être démarrées pendant une restauration. |
| "Un seau est en cours de remise en place depuis sa copie hors site. Attendez que l'opération se termine avant de démarrer les applications." | Une remise en place de compartiment est en cours. Démarrez les applications après sa fin. |
| "Les applications sont déjà en cours de démarrage sur ce serveur." | Un démarrage est en cours. Attendez qu'il se termine. |
| "Les applications n'ont pas pu être démarrées." | La demande a été refusée. La raison du serveur suit, par exemple "choose at least one application to start" ou une application qui n'est plus laissée à l'arrêt. |
| "Son dernier démarrage n'a pas abouti :" | La raison suit. L'application a été de nouveau arrêtée et reste listée. Corrigez la cause, puis redémarrez-la depuis **Applications laissées à l'arrêt après la restauration**. |
| "Démarrées hors de ce panneau depuis la restauration, sans la vérification de leurs bases de données ni leur sortie du mode sauvegarde : ..." | Les applications listées ont été démarrées dans Portainer. Démarrez-les depuis la page **Restauration** pour exécuter la vérification des bases de données et la sortie du mode sauvegarde qu'elles ont sautées. |
| "Les sauvegardes restent en attente : ..." ou "Le serveur n'a pas répondu : les sauvegardes restent en attente. Enregistrer de nouveau la destination relance l'opération." sous **Dépôt de sauvegarde** | La destination a été enregistrée, mais les sauvegardes n'ont pas repris. La raison suit : la destination ne s'ouvre pas, aucune destination n'est enregistrée, une restauration est en cours ou arrêtée en cours de route, ou, avec la continuité, la copie hors site contient un autre dépôt ou ne s'ouvre pas (voir [Reprendre les sauvegardes après une restauration](#reprendre-les-sauvegardes-après-une-restauration)). Corrigez la cause, puis enregistrez de nouveau. |
| "Aucun nouveau mot de passe de sauvegarde n'a été créé, les sauvegardes restent donc en attente : ..." | Le nouveau mot de passe de sauvegarde n'a pas pu être créé. Enregistrez de nouveau la destination. |
| Journal : la restauration a laissé `<application>` arrêté | La sauvegarde a été prise alors que sa définition nommait une image que ses services n'exécutaient pas. Réglez la définition sur les versions qu'exécutaient les services, puis déployez-la depuis Portainer. |
