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

La restauration remplace les données et rien d'autre. Les applications sont arrêtées pendant que leurs données sont remises en place, puis redémarrées avec elles. Le panneau, l'authentification et la connexion qui sert la page restent accessibles tout du long : vous pouvez donc suivre la restauration du début à la fin. Il n'y a ni reconstruction ni reconfiguration à faire ensuite.

1. Ouvrez **Restauration**.
2. Sous **Quelles sauvegardes restaurer**, gardez **Les sauvegardes de ce serveur** et appuyez sur **Afficher les sauvegardes**.
3. Sous **Choisir une sauvegarde**, sélectionnez une ligne. Les colonnes sont **Effectuée le**, **Serveur**, **Taille** et **Étiquettes**. Chaque ligne est un point de restauration complet; choisissez la plus récente prise avant le début du problème. Lorsque le dépôt contient les sauvegardes de plus d'un serveur, la page avertit que choisir par horodatage seul peut restaurer les données d'un autre serveur par-dessus celles-ci : la colonne **Serveur** indique lequel a écrit chaque instantané.
4. Sous **Étendue de la restauration**, choisissez la portée :
   - **Tout ce que contient ce serveur** ramène toutes les applications à la sauvegarde choisie.
   - **Seulement les applications sélectionnées ci-dessous** (Catena Pro) ne ramène que les applications cochées. Seules celles-ci sont arrêtées; toutes les autres applications, l'authentification et le panneau continuent de fonctionner. Une application revient avec les données et la version enregistrées dans la sauvegarde. Ses réglages ne sont pas rétablis, car ils sont partagés avec le reste du serveur.

   Sans abonnement Pro, le choix de portée n'est pas affiché, et une demande pour une seule application est refusée avec "La restauration d'une seule application n'est pas offerte avec ce forfait."
5. Sous **Lancer la restauration**, cochez "Je comprends que mes applications seront indisponibles pendant la restauration." La durée dépend du volume de données.
6. Appuyez sur **Restaurer la sauvegarde sélectionnée**.

L'option "Copier les données seulement, sans rien démarrer. Sert à préparer un déplacement vers un autre serveur." copie les données puis s'arrête, en laissant toutes les applications éteintes. Laissez-la décochée pour une restauration ordinaire. Une migration fait cette préparation d'elle-même : la case n'est donc pas nécessaire pour une migration.

### Progression

La section **Restauration en cours** nomme l'étape en cours, dans cet ordre : Vérifications avant toute action (elles comprennent la règle de version ci-dessous), Enregistrement de ce qui fonctionne actuellement, Arrêt des applications, Copie des données, Récupération des images des applications, Reprise de la configuration sauvegardée, Démarrage des services de base, Application de la configuration sauvegardée à ce serveur, Remise en service des applications, Restauration des bases de données, Mise à jour des applications, Vérification des fichiers stockés, Vérifications finales, et Terminé.

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

## Reconstruire un serveur perdu sur une nouvelle machine

Lorsque votre serveur d'origine n'existe plus, un nouveau serveur restaure depuis les sauvegardes de l'ancien. Vous n'avez besoin que de la trousse de reprise (voir [Sauvegardes et stockage S3](/fr/configuration/backups/#trousse-de-reprise-après-sinistre)).

1. Installez Catena sur le nouveau serveur (voir [Installation](/fr/installation/)). L'installateur prend la version la plus récente.
2. Ouvrez le panneau du nouveau serveur et allez à **Restauration**.
3. Sous **Quelles sauvegardes restaurer**, choisissez **Les sauvegardes d'un autre serveur**.
4. Sous **Dépôt de sauvegarde d'un autre serveur**, remplissez :

   | Champ | Valeur tirée de la trousse de reprise |
   |---|---|
   | **Adresse du dépôt** | L'adresse du dépôt, `s3:https://<point-d-acces>/<compartiment>` |
   | **Mot de passe du dépôt** | Le mot de passe de chiffrement des sauvegardes |
   | **Clé d'accès du stockage** | La clé d'accès S3 |
   | **Clé secrète du stockage** | La clé secrète S3 |

   Seuls les champs émis par le fournisseur de stockage exigent une valeur, mais l'adresse et le mot de passe sont toujours requis ("L'adresse du dépôt et son mot de passe sont tous deux requis.").
5. Appuyez sur **Enregistrer ces identifiants**. Ils sont conservés en mémoire seulement : l'adresse et les clés disparaissent au redémarrage du serveur, et **Oublier les identifiants enregistrés** les efface immédiatement. Les sauvegardes de ce dépôt sont alors listées sous **Choisir une sauvegarde**.
6. Sélectionnez la sauvegarde (en cas de rançongiciel ou de compromission, une sauvegarde antérieure à l'incident), puis poursuivez avec les étapes 4 à 6 de la section précédente.

Une fois la restauration terminée, le nouveau serveur possède les données et la configuration enregistrée de l'ancien.

## Restaurer depuis la copie hors site

Lorsque le dépôt de sauvegarde lui-même est endommagé, chiffré ou perdu, restaurez plutôt depuis sa [copie hors site](/fr/configuration/backups/#copies-hors-site). La copie est lue sur place : la lire n'y écrit rien, et elle reste verrouillée. Elle garde toutes les sauvegardes qui y ont été copiées, et une sauvegarde plus ancienne que la durée de verrouillage de la copie peut être incomplète.

Il vous faut l'adresse de la copie hors site, le mot de passe de chiffrement des sauvegardes (voir [Sauvegardes et stockage S3](/fr/configuration/backups/#trousse-de-reprise-après-sinistre)), et une clé d'accès et une clé secrète qui peuvent lire le compartiment de la copie.

1. Ouvrez **Restauration**.
2. Sous **Quelles sauvegardes restaurer**, choisissez **La copie hors site de ce serveur**. Ce choix est offert lorsque les composants installés du serveur le prennent en charge (voir Dépannage).
3. Sous **Copie hors site de ce serveur**, remplissez :

   | Champ | Valeur |
   |---|---|
   | **Adresse de la copie hors site** | L'adresse du compartiment de la copie. Elle est remplie d'après la copie hors site du dépôt de sauvegarde déclarée sous **Copies hors site** dans **Paramètres**; sur une nouvelle machine, saisissez-la. |
   | **Mot de passe de chiffrement des sauvegardes** | Le mot de passe du dépôt de sauvegarde |
   | **Clé d'accès qui lit la copie hors site** | La clé d'accès |
   | **Clé secrète qui lit la copie hors site** | La clé secrète |

4. Appuyez sur **Enregistrer ces clés**. Elles sont conservées en mémoire seulement et effacées lorsqu'une restauration depuis la copie se termine, ou au bout de 24 heures, selon la première éventualité. Une restauration qui s'arrête en cours de route les garde pour que vous puissiez la relancer. **Oublier ces clés maintenant** les efface immédiatement. Les sauvegardes de la copie sont alors listées sous **Choisir une sauvegarde**.
5. Sélectionnez la sauvegarde, puis poursuivez avec les étapes 4 à 6 de [Restaurer sur un serveur en marche](#restaurer-sur-un-serveur-en-marche). La [règle de version](#règle-de-version) s'applique.

Une fois la restauration terminée, le serveur possède les données et la configuration enregistrée de la sauvegarde choisie. Remettez le dépôt de sauvegarde en place depuis la copie avant la prochaine sauvegarde nocturne (voir la section suivante).

## Remettre un compartiment en place depuis sa copie hors site

Cette opération recopie la copie hors site d'un compartiment dans le compartiment dont elle provient. Elle vaut pour le dépôt de sauvegarde et pour tout autre compartiment déclaré sous **Copies hors site**, dans toutes les éditions. L'opération ne fait qu'ajouter : ce qui manque ou diffère est recopié, et rien n'est supprimé, d'un côté comme de l'autre. La copie hors site n'est que lue.

1. Ouvrez **Restauration** et allez à **Remettre un seau en place depuis sa copie hors site**. La section est affichée lorsque les composants installés du serveur la prennent en charge (voir Dépannage). Sans copie déclarée, elle indique "Aucune copie hors site n'est déclarée sur ce serveur. Les copies hors site se déclarent dans Paramètres, sous Copies hors site."
2. Sous **Copie hors site à remettre en place**, choisissez la copie. Chaque entrée indique son nom et l'adresse du compartiment qu'elle remet en place.
3. Saisissez **Clé d'accès qui lit la copie hors site** et **Clé secrète qui lit la copie hors site**. Elles servent à cette opération seulement et ne sont conservées nulle part.
4. Facultatif : sous **Application qui range ses fichiers dans ce seau**, choisissez l'application lorsque le compartiment contient ses fichiers, comme Nextcloud. Elle est mise en mode sauvegarde pendant que ses fichiers sont recopiés, puis ses fichiers stockés sont comparés à sa base de données. Gardez **Aucune, comme pour le dépôt de sauvegarde** pour tout autre compartiment.
5. Facultatif : sous **Tel qu'il était le (UTC, facultatif)**, saisissez une date et une heure pour remettre les fichiers tels que la copie hors site les contenait à ce moment, par exemple avant qu'ils soient chiffrés ou écrasés. La clé d'accès doit alors avoir le droit de lire les versions antérieures. Laissé vide, les versions les plus récentes sont remises en place.
6. Cochez "Je comprends que le seau est modifié pendant sa remise en place." et appuyez sur **Remettre le seau en place**.

La section suit l'opération étape par étape : Attente de la fin de la sauvegarde, de la copie hors site ou d'une mise à jour, Prise de contact avec les deux seaux, Vérification que le seau peut reprendre la copie, Mise en mode sauvegarde de l'application, Recopie des fichiers, Sortie de l'application du mode sauvegarde, Vérification des fichiers stockés, et Terminé. Lorsque vous n'avez choisi aucune application, les trois étapes qui la concernent (entrée en mode sauvegarde, sortie du mode sauvegarde, vérification des fichiers stockés) passent sans rien faire.

La copie écrit dans le compartiment pendant qu'elle s'exécute. Un gros compartiment prend des heures, et le fournisseur de stockage peut facturer les données lues.

Si l'opération s'arrête, la section indique "La remise en place du seau s'est arrêtée à :" suivi de l'étape. Appuyez de nouveau sur **Remettre le seau en place** avec les mêmes valeurs : relancer ne recopie que ce qui manque encore. L'opération qui remet en place le dépôt de sauvegarde est refusée à l'étape de vérification lorsque le compartiment contient déjà un autre dépôt de sauvegarde, par exemple un dépôt créé à la place de celui qui a été perdu, car la copie mélangerait les deux. Rien n'est copié. Videz le compartiment, puis relancez.

### Ordre après une restauration depuis la copie hors site

Après une restauration depuis la copie hors site, remettez le dépôt de sauvegarde en place avec cette section avant la prochaine sauvegarde nocturne. Les sauvegardes reprennent alors dans le dépôt que contient la copie hors site. Tant qu'il n'est pas remis en place, la copie hors site s'arrête plutôt que d'y mêler un nouveau dépôt. Une remise en place et une restauration ne s'exécutent pas ensemble : chacune est refusée pendant que l'autre est en cours.

## Rapport de restauration

Le panneau **Rapport de restauration** (Catena Pro) montre la preuve que les sauvegardes se restaurent : un test de restauration local avec son temps de récupération, et l'état de la copie hors site. L'entretien nocturne exécute le test local chaque nuit où il est actif; **Vérifier que ma sauvegarde est restaurable**, dans **Actions**, l'exécute sur demande. Un lien vers le rapport figure dans la section Restauration en cours.

## Migrer vers un autre serveur

Une migration copie presque tout pendant que l'ancien serveur continue de servir. Seules les dernières minutes sont indisponibles pour les personnes qui l'utilisent, et cette période ne croît pas avec le volume de données. Vous lancez le déplacement depuis le nouveau serveur, une fois que l'ancien a ouvert une fenêtre limitée dans le temps.

### Prérequis

- L'ancien serveur a Catena Pro ou Catena Business. Le nouveau serveur n'a besoin d'aucun abonnement à lui : la clé d'abonnement suit les données.
- Les deux serveurs tournent sur la même version de Catena. Un déplacement entre versions différentes est refusé avant que quoi que ce soit soit touché.
- Les deux serveurs sont sur le même réseau privé (voir [Accès administrateur et réseau privé](/fr/configuration/admin-access/)). Le déplacement ne passe que par lui.
- Le dépôt de sauvegarde de l'ancien serveur est enregistré sur le nouveau (étapes 3 à 5 de la section précédente).
- Vous n'avez saisi aucun jeton Cloudflare sur le nouveau serveur. Le déplacement apporte celui de l'ancien serveur, et un jeton saisi d'abord prendrait l'adresse web de l'ancien serveur avant le début du déplacement.

### Sur l'ancien serveur

1. Ouvrez le panneau **Migration**.
2. Appuyez sur **Autoriser le déplacement de ce serveur**. Un code à usage unique apparaît sous le bouton, une seule fois. Il n'est conservé nulle part et ne peut pas être réaffiché.
3. Transmettez le code à la personne qui effectue le déplacement.

La fenêtre se referme d'elle-même après 4 heures; cinq codes erronés la ferment aussi, et **Ne plus autoriser le déplacement** la ferme aussitôt. Remplacez un code perdu en appuyant de nouveau sur le bouton, ce qui invalide aussi l'ancien code. La fenêtre se ferme également une fois que le déplacement a transmis la clé d'abonnement.

### Sur le nouveau serveur

1. Ouvrez **Restauration** et allez à **Déplacer un autre serveur ici**.
2. Saisissez **Adresse de l'autre serveur sur le réseau privé** : son adresse sur le réseau privé (une adresse IP), pas son adresse web. L'adresse web est ce qui migre à la fin, elle ne peut donc pas servir à joindre l'ancien serveur pendant le déplacement.
3. Saisissez le **Code d'appairage**.
4. Réglez **Passes de préparation** (de 1 à 5, 1 par défaut). Chaque passe supplémentaire ne copie que ce qui a changé depuis la précédente, ce qui raccourcit la période d'indisponibilité finale. Une seule suffit, sauf si vous prévoyez un long délai avant la bascule.
5. Cochez "Je comprends que l'autre serveur sera retiré du service et que celui-ci reprendra son adresse web." et appuyez sur **Lancer le déplacement**.

### Déroulement

1. Prise de contact avec l'autre serveur.
2. Copie des données, et Préparation de ce serveur à recevoir le trafic. L'ancien serveur sert toujours.
3. Mise en pause des applications de l'autre serveur. La courte période d'indisponibilité commence.
4. Sauvegarde finale de l'autre serveur, puis Vérification de cette sauvegarde. C'est la dernière étape réversible.
5. Retrait de l'autre serveur du service. À partir d'ici, l'ancien serveur ne se remet plus en service tout seul.
6. Mise en place des données ici, puis Bascule de l'adresse web vers ce serveur.
7. Vérifications finales.

Après les vérifications finales, l'ancien serveur libère son activation de la clé d'abonnement, et le nouveau serveur l'active puis se remet à niveau, ce qui active ce que la clé débloque (domaines supplémentaires, horaires). Certains services redémarrent pendant l'opération. **Paramètres** > **Abonnement** en indique le résultat. Si la libération de l'ancienne activation échoue, libérez-la dans le portail client de Polar et enregistrez de nouveau la clé sur le nouveau serveur.

### Annuler le déplacement

- Jusqu'à "Vérification de cette sauvegarde" inclusivement, l'arrêt du déplacement remet l'ancien serveur en service de lui-même. Rien n'a démarré sur le nouveau serveur et l'adresse web pointe toujours vers l'ancien.
- Après "Retrait de l'autre serveur du service", ce n'est plus automatique, parce que le nouveau serveur peut déjà détenir une partie des données et que démarrer les deux ferait écrire deux serveurs dans le même stockage. La page indique que l'ancien serveur est retiré du service et propose deux voies : corriger ce qui a échoué et relancer le déplacement (il reprend sans tout recopier), ou remettre l'ancien serveur en service.
- Pour remettre l'ancien serveur en service, utilisez **Le remettre en service** sous **Remettre l'autre serveur en service** dans la page Restauration du nouveau serveur (saisissez de nouveau l'adresse et le code d'appairage), ou **Remettre ce serveur en service** dans le panneau **Migration** de l'ancien serveur. Son adresse web pointe toujours vers lui, il sert donc de nouveau dès qu'il redémarre.
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
| "Le déplacement n'a pas pu être lancé." | La demande n'a pas été acceptée. Vérifiez l'adresse (une adresse IP, pas un nom) et le code d'appairage, ainsi que l'ouverture de la fenêtre sur l'ancien serveur. |
| "Les identifiants ont été refusés." | Les détails du dépôt n'ont pas été acceptés. Comparez-les à la trousse de reprise. |
| "Un seau est en cours de remise en place depuis sa copie hors site. Attendez que l'opération se termine avant de lancer une restauration." | Une remise en place de compartiment est en cours. Une restauration ne démarre qu'après sa fin, et une remise en place est refusée de la même façon pendant une restauration ("Une restauration est en cours sur ce serveur. Attendez qu'elle se termine avant de remettre un seau en place."). |
| "La restauration depuis la copie hors site n'est pas encore offerte sur ce serveur : ses composants installés sont plus anciens que ce panneau." ou "La remise en place d'un seau n'est pas encore offerte sur ce serveur : ses composants installés sont plus anciens que ce panneau." | Les composants installés du serveur sont antérieurs à cette fonction. Ouvrez **Paramètres**, allez à **Configuration du serveur**, appuyez sur **Remettre ce serveur à niveau**, puis réessayez une fois l'opération terminée. |
| Journal : la restauration a laissé `<application>` arrêté | La sauvegarde a été prise alors que sa définition nommait une image que ses services n'exécutaient pas. Réglez la définition sur les versions qu'exécutaient les services, puis déployez-la depuis Portainer. |
