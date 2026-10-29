---
title: "Mises à jour"
description: "Ce qu'un serveur Catena met à jour seul, ce qui demande une décision, et comment une mise à jour est encadrée, annulée au besoin et consignée."
---

Un serveur Catena compte cinq couches qui se mettent à jour indépendamment : le système d'exploitation, le panneau de contrôle, le moteur Docker, les services propres à Catena et les applications. Cette page indique ce qui avance seul, ce qui demande un clic et ce qu'ajoute Catena Pro.

| Couche | Mode de mise à jour | Édition |
|---|---|---|
| Système d'exploitation | Les mises à jour de sécurité s'appliquent automatiquement; le redémarrage est une décision. | Toutes |
| Panneau de contrôle | **Mettre à jour ce panneau**, ou la tâche mensuelle **Mises à jour du panneau de contrôle**. | Bouton : toutes. Tâche : Catena Pro ou Catena Business |
| Moteur Docker | **Mettre à niveau Docker**, ou une étape de l'entretien nocturne. | Bouton : toutes. Étape : Catena Pro ou Catena Business |
| Services propres à Catena | Les versions correctives par l'entretien nocturne; les versions plus récentes arrivent avec une mise à jour du panneau de contrôle (voir [Services propres à Catena](#services-propres-à-catena)). | Catena Pro ou Catena Business |
| Applications | L'entretien nocturne, derrière un délai d'attente, une vérification des vulnérabilités et un retour arrière. | Catena Pro ou Catena Business |

Avec Communauté, aucune application n'est proposée ni mise à jour (voir [Applications avec Communauté](#applications-avec-communauté)). La [comparaison des éditions](https://catena.run/fr/#pricing) présente les éditions.

## Système d'exploitation

Les mises à jour de sécurité automatiques de Debian s'exécutent sur tous les serveurs, dans toutes les éditions. Elles couvrent la suite de sécurité, les mises à jour stables, les versions intermédiaires et le dépôt propre au client du réseau privé. Elles ne redémarrent jamais le serveur d'elles-mêmes.

Un redémarrage est nécessaire lorsqu'une mise à jour remplace quelque chose qui est déjà en cours d'exécution. Chaque heure, le serveur vérifie si un redémarrage est dû. Tant qu'il l'est, chaque page d'administration affiche "Une mise à jour installée ne prend effet qu'après le redémarrage de ce serveur. Le redémarrer depuis la page Système." et la page **Système** liste ce qui l'a demandé et les services qui fonctionnent encore sur des bibliothèques remplacées.

Pour redémarrer :

1. Ouvrez **Système** > **Redémarrage**.
2. Cochez "Je comprends que cela arrête toutes les applications de ce serveur pendant environ une minute."
3. Appuyez sur **Redémarrer ce serveur**.

Lorsque l'entretien nocturne et son étape **Redémarrage** sont actifs, sa dernière étape redémarre le serveur si un redémarrage est dû, puis vérifie que chaque service est revenu. La page **Système** indique "Dernier redémarrage par l'entretien nocturne" et son issue, et le Journal le consigne. Le redémarrage vous est sinon laissé, parce que l'interruption est une décision.

Sous **Actions** > **Opérations**, **Mises à jour apt en attente** liste ce qui attend et **Journal des mises à jour auto** montre ce que les mises à jour automatiques ont fait.

## Version du panneau de contrôle

Ouvrez **Paramètres** > **Version du panneau de contrôle**.

1. **En cours d'exécution** indique la version que fait tourner le serveur.
2. Choisissez la cible sous **Version à installer**. La liste contient les versions publiées de ce même panneau. Lorsque la liste ne peut pas être obtenue, le champ devient une zone de texte et vous saisissez la version (par exemple `v1.2.3`); seule une version de ce même panneau est acceptée.
3. Cochez "Je comprends que le panneau redémarre et sera brièvement indisponible."
4. Appuyez sur **Mettre à jour ce panneau**.

La section suit la mise à jour à travers Téléchargement, Installation, Redémarrage, Vérification de l'état et Application de sa configuration. Pendant le téléchargement, la section montre les couches terminées et les Mio téléchargés, rafraîchis toutes les 5 secondes. Le panneau est inaccessible environ une minute pendant son redémarrage et revient de lui-même; la mise à jour se poursuit sur le serveur même si vous fermez la page. Tout le reste continue de fonctionner.

Une mise à jour apporte les versions plus récentes des services propres à Catena qui ont été testées avec elle (voir [Services propres à Catena](#services-propres-à-catena)). Elle vérifie de nouveau la santé du serveur après avoir appliqué sa configuration, et une mise à jour qui rend le serveur moins sain qu'avant est remise en arrière automatiquement, avec les données copiées pour elle (voir [Retour arrière et quarantaine](#retour-arrière-et-quarantaine)). La section indique alors "La dernière tentative n'a pas abouti. Ce serveur a remis la version précédente et fonctionne normalement avec celle-ci, avec une version de retard.", avec le journal de la tentative replié en dessous.

Le bouton fonctionne dans toutes les éditions. La tâche **Mises à jour du panneau de contrôle** de la page [Horaires](/fr/configuration/schedules/) (mensuelle par défaut, Catena Pro ou Catena Business) fait la même chose selon un horaire, avec les mêmes vérifications.

### Lorsque le panneau ne peut pas se mettre à jour

Si le panneau est indisponible ou si sa mise à jour ne peut pas s'exécuter, relancez la commande d'installation depuis votre ordinateur d'administration avec la version cible (voir [Installation](/fr/installation/)) :

```sh
uvx catena-installer install --inventory <nom> --release v1.2.3
```

Le serveur passe à cette version avec le code de cette version, pour le même état final que la mise à jour du panneau. Une fois le SSH public fermé, ajoutez `--address <ip-tailnet>` pour cette exécution. Sans `--release`, la commande réapplique la version que le serveur a déjà enregistrée.

## Moteur Docker

Ouvrez **Système** > **Moteur Docker**.

1. Cochez "Je comprends que toutes les applications redémarrent pendant environ une minute."
2. Appuyez sur **Mettre à niveau Docker**.

Docker passe à la version que porte le panneau, puis le serveur vérifie que chaque service est revenu; sinon, la version précédente est remise en place. Une nouvelle version majeure n'est pas installée par ce bouton. Lorsque le panneau en porte une, une seconde case apparaît : cochez "Je comprends que Docker passe à une nouvelle version majeure et que toutes les applications redémarrent." et appuyez sur **Passer à la nouvelle version majeure**.

L'entretien nocturne met Docker à niveau de la même façon au sein de la version majeure en cours. Le résultat s'affiche à la ligne **Dernière mise à niveau** de la section.

## Services propres à Catena

Les services propres à Catena sont le service de connexion, le mandataire inverse, les services de surveillance, la base de données partagée et les auxiliaires du tableau de bord du serveur.

- **Versions correctives, d'elles-mêmes.** Avec Catena Pro et Catena Business, l'entretien nocturne fait passer chacun d'eux à sa version corrective la plus récente. Pour la base de données partagée, une version mineure compte comme corrective.
- **Versions mineures et majeures plus récentes, avec une mise à jour du panneau de contrôle.** Elles n'arrivent qu'avec une mise à jour du panneau de contrôle (voir [Version du panneau de contrôle](#version-du-panneau-de-contrôle)), après avoir été testées ensemble avant la publication. La mise à jour du panneau de contrôle lui-même prend toute version plus récente.
- **Le connecteur du tunnel.** C'est la seule exception : après le délai d'attente et la vérification des vulnérabilités, il prend de lui-même toute version plus récente. Le changement ne tient que lorsque le nouveau connecteur se reconnecte à Cloudflare; sinon, le serveur remet de lui-même le précédent.

La liste **Infrastructure** de la page **Système** indique à côté de chaque service ce qui s'applique : "La maintenance de nuit le fait passer à `<version>`" pour une version corrective, ou "`<version>` arrive avec une mise à jour du panneau de contrôle".

Un service qui conserve des données les voit copiées avant son changement de version, puis remises en place si le changement est annulé (voir [Retour arrière et quarantaine](#retour-arrière-et-quarantaine)).

## Applications (Catena Pro)

L'entretien nocturne met à jour chaque application de la page **Applications**, et les services propres à Catena comme décrit dans [Services propres à Catena](#services-propres-à-catena). Il prend d'abord une sauvegarde et la vérifie, et s'arrête avant toute mise à jour si cela échoue, sauf si vous avez retiré l'étape de sauvegarde (voir [Horaires](/fr/configuration/schedules/#entretien-nocturne)). Vous pouvez retirer n'importe quelle étape, et Catena avertit lorsque la combinaison est risquée (voir [Choisir les étapes](/fr/configuration/schedules/#choisir-les-étapes)).

Une application se met à jour de deux façons, et l'entretien nocturne fait les deux : il fait passer une application à une version plus récente d'elle-même, depuis son dépôt, puis il fait passer les images du fichier de chaque application à des étiquettes plus récentes.

### Applications ajoutées depuis un dépôt

Vous ajoutez une application depuis un dépôt de la liste du serveur (voir [Ajouter une application depuis un dépôt](/fr/configure-apps/#ajouter-une-application-depuis-un-dépôt)). Le dépôt publie chaque version d'une application sous forme d'étiquette, écrite `<application>/<version>-<révision>`, et la page **Applications** affiche celle qu'une application exécute sous la forme "Version `<étiquette>` du dépôt `<dépôt>`". Une version plus récente est une étiquette plus récente de la même application.

1. **Délai d'attente.** Une étiquette n'est prise qu'après que Catena l'a vue pendant le délai d'attente (7 jours par défaut, le même réglage que pour les images : voir [Délai d'attente et barrière de vulnérabilités](#délai-dattente-et-barrière-de-vulnérabilités)). Le compte commence la nuit où Catena voit l'étiquette pour la première fois. Si l'étiquette la plus récente n'a pas attendu assez longtemps, la plus récente qui a attendu est prise.
2. **Dépôt de confiance.** La mise à jour s'applique d'elle-même. Le catalogue de Catena est de confiance. Un dépôt que vous ajoutez ne l'est que si vous cochez **De confiance : appliquer ses mises à jour d'elles-mêmes**.
3. **Dépôt qui n'est pas de confiance.** La mise à jour est proposée et attend votre décision. La page de l'application, qu'ouvre **Ouvrir les réglages** sous **Gérer les applications** sur la page **Applications**, indique "La version `<étiquette>` est disponible (actuellement `<actuelle>`)." et la tuile affiche "Mise à jour `<étiquette>` proposée". Cochez "Passer à la version `<étiquette>` maintenant" et appuyez sur **Mettre à jour**. La mise à jour se déroule alors comme celle d'une nuit, sans le délai d'attente, et **Progression** s'ouvre sous le formulaire comme au démarrage d'une application (voir [Ajouter une application depuis un dépôt](/fr/configure-apps/#ajouter-une-application-depuis-un-dépôt)).
4. **Version de plus de 12 mois.** Lorsque la version qu'exécute une application date de plus de 12 mois, la mise à jour vers une version plus récente est seulement proposée, même depuis un dépôt de confiance.

Une version dont le contenu change après que Catena l'a vue pour la première fois est refusée et mise de côté. Lorsque l'application déclare des versions par lesquelles elle doit passer, la mise à jour les traverse l'une après l'autre.

Chaque mise à jour commence par retenir l'application : son adresse répond un simple 503 (service indisponible) jusqu'à ce que la mise à jour tienne ou que son retour arrière soit terminé, sans page qui en explique la raison, et les écritures de l'application sont immobilisées par son propre mode de sauvegarde ou ses propres étapes de mise à jour lorsqu'elle en déclare (voir [Déclarer le mode de sauvegarde et les étapes de mise à jour](/fr/configure-apps/#déclarer-le-mode-de-sauvegarde-et-les-étapes-de-mise-à-jour-facultatif)). La mise à jour fait d'abord une copie des bases de données et des données de l'application, vérifie ensuite sa santé, et revient en arrière d'elle-même lorsque l'application est en moins bon état qu'avant (voir [Retour arrière et quarantaine](#retour-arrière-et-quarantaine)).

### Annuler une mise à jour

Une fois qu'une mise à jour tient, Catena garde les fichiers précédents de l'application et les copies de ses données pendant 14 jours et jusqu'à ce qu'une sauvegarde faite après la mise à jour ait réussi, selon la dernière échéance. Tant qu'ils existent, un administrateur peut remettre l'application comme elle était avant la mise à jour, dans toutes les éditions :

1. Sur la page **Applications**, ouvrez la page de l'application avec **Ouvrir les réglages**. Tant que les copies existent, sa partie **Mise à jour** propose "Remettre la version précédente", avec une note disant que les fichiers et les données reviennent à leur état d'avant la mise à jour.
2. Cochez "Remettre `<application>` comme elle tournait avant sa dernière mise à jour".
3. Appuyez sur **Remettre la version précédente**.

L'annulation arrête l'application, remet ses fichiers et ses données précédents, puis la démarre. La page indique alors "`<application>` a été remise comme elle tournait avant sa dernière mise à jour." et dit ce que l'annulation a abandonné. Les données écrites depuis la mise à jour sont abandonnées, et les bases de données sont copiées dans leur état actuel et conservées comme les autres copies. La version qu'exécutait l'application est mise de côté : l'entretien nocturne ne l'applique donc pas de nouveau. Lorsque le serveur refuse, la page indique "Le serveur a refusé le retour en arrière : l'application n'a pas été mise à jour par Catena, ou les copies gardées pour elle n'existent plus."; une application modifiée hors de Catena est refusée aussi.

### Applications modifiées hors de Catena

Catena ne met une application à jour que tant que ses fichiers et ses services sont ce que Catena a déployé en dernier. La page **Applications** le dit par un badge sur la page de l'application et sur sa ligne sous **Gérer les applications** :

| Badge | Signification |
|---|---|
| **Fichiers modifiés à la main** | Le fichier compose ou le fichier de réglages du dossier de l'application diffère de ce que Catena a déployé en dernier. |
| **Modifiée hors de Catena** | Un service de l'application diffère du déploiement, manque, ou un nouveau service est apparu, par exemple après un changement dans Docker ou dans un autre gestionnaire de conteneurs. |
| **Version propre du fichier** | Les fichiers et les services sont ceux du déploiement, mais le fichier compose n'est celui d'aucune version d'un dépôt. |
| **Arrêtée** | L'application est arrêtée. |

L'entretien nocturne laisse une telle application de côté, et l'annulation la refuse. Un service qui tourne sur le serveur sans avoir été ajouté par Catena est listé sous **Hors de Catena** et n'est jamais mis à jour. Portainer et Arcane sont des applications facultatives du catalogue. Les applications que vous déployez avec elles font partie de ce groupe : Catena leur donne des routes, la connexion, la surveillance et la sauvegarde de leurs données par leurs étiquettes, et leurs mises à jour relèvent de ce gestionnaire. Portainer et Arcane eux-mêmes sont mis à jour par Catena.

### Images admissibles

Seules les images épinglées à une étiquette de version complète sont mises à jour automatiquement : `1.2.3`, `v1.2.3`, ou ces formes avec un suffixe comme `1.2.3-alpine`. Les étiquettes partielles (`18`, `1.2`) et flottantes (`latest`, `stable`, `main`) ne sont jamais touchées, quelle que soit l'étiquette d'application. Les images d'autres registres que Docker Hub et le registre de conteneurs de GitHub ne sont pas listées pour les mises à jour.

### L'étiquette vps.auto-update

L'étiquette `vps.auto-update` d'une application détermine jusqu'où son numéro de version peut avancer, de `off` à `major`; ses valeurs figurent dans la [référence des étiquettes](/fr/configure-apps/#mises-à-jour). Les applications ont `patch` par défaut, qui garde les numéros majeur et mineur; les services propres à Catena suivent la règle de [Services propres à Catena](#services-propres-à-catena). Des services qui partagent une même image prennent l'étiquette la plus restrictive.

### Délai d'attente et barrière de vulnérabilités

Une nouvelle version n'est adoptée qu'après avoir attendu un certain nombre de jours, 7 par défaut. Pour le changer, réglez **Jours d'attente d'une nouvelle version avant que la mise à jour nocturne la prenne** (de 0 à 90, où 0 signifie aucune attente) à côté de **Mises à jour** sur la page **Horaires** (voir [Choisir les étapes](/fr/configuration/schedules/#choisir-les-étapes)). Une version qu'aucune source ne sait dater n'est adoptée que si son analyse est propre.

Avant une mise à jour, les versions candidates sont analysées pour les vulnérabilités connues (Trivy, gravités élevée et critique, jusqu'à quatre candidates) :

- Une version qui ajoute une nouvelle vulnérabilité élevée ou critique est écartée au profit d'une version inférieure propre, ou la mise à jour attend.
- Une version plus récente qui supprime une vulnérabilité élevée ou critique présente dans la version en cours est appliquée sans le délai d'attente.

Sans analyseur, la vérification des vulnérabilités est désactivée et le délai d'attente s'applique toujours. Voir [Vulnérabilités](/fr/configuration/vulnerabilities/). Une vulnérabilité que trouve la veille des vulnérabilités peut aussi être corrigée à la demande, ou automatiquement lorsque la CISA la signale comme exploitée, sans le délai d'attente (voir [Corriger une vulnérabilité](/fr/configuration/vulnerabilities/#corriger-une-vulnérabilité)).

### Retour arrière et quarantaine

Après chaque mise à jour, le serveur compare son état de santé à celui d'avant. Il examine l'application toutes les 15 secondes pendant au plus deux minutes. La mise à jour est gardée dès que deux examens de suite trouvent ses conteneurs démarrés, chacun de ses services en marche et, quand l'application en déclare une, sa question de disponibilité répondue, sans aucun conteneur du serveur en moins bonne santé qu'avant. Elle est annulée dès que deux examens de suite trouvent le même conteneur en moins bonne santé qu'avant. Sinon, l'examen à la fin des deux minutes décide. Les services propres à Catena attendent les deux minutes entières. Lors d'un retour arrière, la version précédente est remise en place et l'étiquette fautive est mise en quarantaine : la prochaine exécution essaie la version suivante plutôt que la même. Une application dotée d'une base de données reçoit un export fait avant la mise à jour, remis en place lors du retour arrière. Lorsque la nouvelle version d'une application met aussi à niveau sur place son code, sa configuration et ses modules complémentaires, comme Nextcloud, une copie de ceux-ci est faite avant la mise à jour et remise en place lors du retour arrière, l'application étant arrêtée; les fichiers de ses utilisateurs ne sont jamais remis en place. Les copies sont supprimées dès que la mise à jour est conservée ou que le retour arrière se termine. Un retour arrière qui ne peut aboutir les conserve sur le serveur.

Avant qu'un service propre à Catena qui conserve des données passe à une nouvelle version, ses données sont copiées, et le service est retenu le temps de la copie. Cela couvre le service de connexion et les magasins de données des services de surveillance. Si le changement est annulé, ou si une mise à jour du panneau de contrôle l'est, les données copiées et les versions précédentes sont remises en place. Tout ce qui a été écrit entre la copie et l'annulation est perdu, quelques minutes au plus.

### Services exclus des mises à jour automatiques

Le modèle d'une application du catalogue peut poser `vps.auto-update=off` sur un service dont une nouvelle version risque de réécrire ses fichiers au-delà de ce que la version précédente sait lire. L'entretien nocturne ne fait jamais avancer un tel service. Deux services du catalogue sont ainsi exclus : le stockage d'objets de Plane et l'index de recherche de Zammad (Elasticsearch).

Avec Catena Pro, l'entretien nocturne cherche une version plus récente pour chacun de ces services. S'il en trouve une, la tuile de l'application, dans l'onglet **Applications**, affiche un avis que seuls les administrateurs voient :

- "`<service>` est exclu des mises à jour automatiques. La version `<nouvelle>` est disponible ; la version en service est `<actuelle>`." nomme le service, la version qu'il exécute et la version trouvée.
- Une seconde ligne indique ce qu'on sait des vulnérabilités. Elle affiche "Pas vérifié pour les vulnérabilités connues." quand l'analyseur est désactivé ou n'a pas pu lire la version en service, et "La version en service n'a aucune vulnérabilité élevée ou critique connue qui ait un correctif." quand elle est propre. Sinon, elle compte les vulnérabilités élevées ou critiques de la version en service qui ont un correctif. Une version plus récente n'est vérifiée qu'une fois sur le serveur ; d'ici là, la ligne ajoute "On ne sait pas si `<nouvelle>` les corrige". Une fois sur le serveur, la ligne indique "`<nouvelle>` corrige `<n>` des `<m>` vulnérabilités élevées ou critiques connues de la version en service et en apporte `<k>` nouvelles.", et la page de confirmation les liste sous **Corrigées :** et **Nouvelles :**.

L'avis disparaît quand la vérification nocturne n'a rien signalé depuis deux jours, pour ne jamais nommer une version que rien n'a vérifiée depuis.

Pour appliquer la mise à jour :

1. Dans l'onglet **Applications**, appuyez sur **Mettre à jour `<service>`** dans l'avis.
2. Lisez la page **Mettre à jour un service exclu des mises à jour automatiques**. Elle nomme le service, la version qu'il exécute et la version proposée.
3. Cochez "Je comprends que `<service>` est suspendu pendant la copie de ses données puis redémarre sur la nouvelle version, et que l'application s'arrête quelques minutes si la mise à jour doit être annulée."
4. Appuyez sur **Mettre à jour `<service>` vers `<nouvelle>`**.

La page indique alors "Mise à jour lancée. Elle se poursuit sur le serveur même si cette page se ferme ; cette page et l'onglet Applications indiquent où elle en est." La mise à jour :

1. Copie les données du service, en le suspendant pendant la copie.
2. Fait passer le service à la nouvelle version.
3. Vérifie que le serveur est en aussi bonne santé qu'avant.
4. Sinon, remet le service sur sa version précédente avec ses données d'origine, et ne propose plus la version fautive.

Le service reste ensuite exclu des mises à jour automatiques, et sa version suivante est proposée de la même façon. Une seule de ces mises à jour s'exécute à la fois ("Une mise à jour d'un service exclu des mises à jour automatiques est déjà en cours."). Si une autre vérification nocturne a remplacé la version proposée pendant que la page était ouverte, rien ne démarre et la page affiche la version actuelle.

La tuile et la page indiquent où en est la mise à jour : "Mise à jour de `<service>` vers `<nouvelle>` en cours.", "`<service>` a été mis à jour vers `<nouvelle>`.", ou, si elle n'a pas tenu, "La mise à jour de `<service>` vers `<nouvelle>` n'a pas tenu et a été annulée" avec la raison. Un retour arrière qui n'a pas pu se terminer proprement demande votre intervention ; l'onglet **Journal** et le journal de mise à jour du serveur indiquent jusqu'où il est allé.

### Panneau Mises à jour gérées

Le panneau **Mises à jour gérées** (Catena Pro) affiche "État actuel :" (IDLE lorsque rien ne s'exécute) et un tableau des 14 dernières exécutions avec **Heure**, **État terminal** et **Résultat**. Il indique "Aucune exécution de mise à jour gérée enregistrée pour l'instant." tant qu'aucune n'a eu lieu. Trois actions le pilotent :

| Action | Effet |
|---|---|
| **Lancer la chaîne de mises à jour maintenant** | Exécute immédiatement tout l'entretien nocturne, sauvegarde d'abord. |
| **Afficher l'état des mises à jour** | Affiche l'état courant de la chaîne. |
| **Installer les moteurs gérés sur ce serveur** | Réinstalle les outils de mise à jour de l'hôte depuis l'image qu'exécute le panneau; à utiliser après une mise à jour du panneau. |

## Événements du Journal

La page **Journal** consigne chaque décision de mise à jour, notamment :

| Événement |
|---|
| Mises à jour de sécurité installées. |
| `<nombre>` mise(s) à jour non liée(s) à la sécurité disponible(s); prévue(s) pour la prochaine fenêtre de maintenance. |
| `<application>` mis à jour de `<version>` à `<version>`. |
| La mise à jour de `<application>` vers `<version>` n'a pas abouti et a été annulée. |
| Redémarrage du serveur pendant l'entretien nocturne, ou redémarrage qui ne s'est pas déroulé comme prévu. |
| Avis de sécurité signalés dans les paquets de l'hôte ou les images d'application, puis corrigés. |
| Aucune sauvegarde n'est configurée; les mises à jour nocturnes s'appliquent sans sauvegarde. |
| L'entretien nocturne s'est terminé, ou ne s'est pas terminé correctement, avec l'étape en échec. |
| Une combinaison d'étapes choisie sur la page Horaires est risquée (voir [Choisir les étapes](/fr/configuration/schedules/#choisir-les-étapes)). |
| `<application>` a été mis à jour vers `<version>`, mais la mise à jour n'a pas pu être enregistrée; la remise à niveau du serveur remet donc la version précédente. |
| La mise à jour de `<application>` vers `<version>` a été annulée, mais son enregistrement n'a pas pu être effacé; la remise à niveau du serveur pourrait donc réinstaller `<version>`. |
| La mise à jour nocturne laisse `<application>` de côté : un de ses services ne fonctionne pas. Ses mises à jour reprennent dès que le service fonctionne. |

## Applications avec Communauté

Sans l'entretien nocturne, Catena ne cherche aucune version plus récente de vos applications, n'en propose aucune et n'en applique aucune : une application reste à la version que vous avez ajoutée. Le bouton **Mettre à jour** de la fiche d'une application applique une proposition dans toutes les éditions, mais seule une exécution de nuit en fait une : un serveur Communauté n'en montre aucune. Les alertes de sécurité vous préviennent quand une application est atteinte par une vulnérabilité exploitée, ou critique et dotée d'une version corrigée (voir [Alertes de sécurité](/fr/configuration/vulnerabilities/#alertes-de-sécurité-toutes-les-éditions)). La catégorie **Mises à jour** de **Actions** est vide avec Communauté : ses boutons arrivent avec un abonnement.

## Dépannage

| Symptôme | Cause et correctif |
|---|---|
| Une application ne se met jamais à jour | Son étiquette est partielle ou flottante, son étiquette d'application est `off` (voir [Services exclus des mises à jour automatiques](#services-exclus-des-mises-à-jour-automatiques)), ou sa version la plus récente a moins de 7 jours ou ajoute une vulnérabilité. |
| "La dernière tentative n'a pas abouti." sous **Version du panneau de contrôle** | La mise à jour a été remise en arrière. Lisez le journal de la section, puis réessayez. |
| La bannière de redémarrage reste affichée | Redémarrez depuis **Système** > **Redémarrage**, ou laissez l'entretien nocturne s'en charger. |
| La liste de versions est remplacée par une zone de texte | Le registre n'a pas pu être joint; saisissez la version. |
| Une application ne se met jamais à jour, bien que son dépôt ait des versions plus récentes | La page de l'application en donne la raison : un badge comme **Fichiers modifiés à la main** (voir [Applications modifiées hors de Catena](#applications-modifiées-hors-de-catena)), ou une mise à jour proposée qui attend votre décision parce que le dépôt n'est pas de confiance. |
| La mise à jour nocturne laisse une application de côté | Corrigez le service arrêté. La mise à jour nocturne suivante reprend l'application dès que tous ses services fonctionnent. |
