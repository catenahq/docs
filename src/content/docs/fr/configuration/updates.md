---
title: "Mises à jour"
description: "Ce qu'un serveur Catena met à jour seul, ce qui demande une décision, et comment une mise à jour est encadrée, annulée au besoin et consignée."
---

Un serveur Catena compte quatre couches qui se mettent à jour indépendamment : le système d'exploitation, le panneau de contrôle, le moteur Docker et les applications. Cette page indique ce qui avance seul, ce qui demande un clic et ce qu'ajoute Catena Pro.

| Couche | Mode de mise à jour | Édition |
|---|---|---|
| Système d'exploitation | Les mises à jour de sécurité s'appliquent automatiquement; le redémarrage est une décision. | Toutes |
| Panneau de contrôle | **Mettre à jour ce panneau**, ou la tâche mensuelle **Mises à jour du panneau de contrôle**. | Bouton : toutes. Tâche : Catena Pro ou Catena Business |
| Moteur Docker | **Mettre à niveau Docker**, ou une étape de l'entretien nocturne. | Bouton : toutes. Étape : Catena Pro ou Catena Business |
| Applications et services propres à Catena | L'entretien nocturne, derrière un délai d'attente, une vérification des vulnérabilités et un retour arrière. | Catena Pro ou Catena Business |

Avec Communauté, les applications se mettent à jour à la main (voir [Mettre à jour une application avec Communauté](#mettre-à-jour-une-application-avec-communauté)). La [comparaison des éditions](https://catena.run/fr/#pricing) présente les éditions.

## Système d'exploitation

Les mises à jour de sécurité automatiques de Debian s'exécutent sur tous les serveurs, dans toutes les éditions. Elles couvrent la suite de sécurité, les mises à jour stables, les versions intermédiaires et le dépôt propre au client du réseau privé. Elles ne redémarrent jamais le serveur d'elles-mêmes.

Un redémarrage est nécessaire lorsqu'une mise à jour remplace quelque chose qui est déjà en cours d'exécution. Chaque heure, le serveur vérifie si un redémarrage est dû. Tant qu'il l'est, chaque page d'administration affiche "Une mise à jour installée ne prend effet qu'après le redémarrage de ce serveur. Le redémarrer depuis la page Système." et la page **Système** liste ce qui l'a demandé et les services qui fonctionnent encore sur des bibliothèques remplacées.

Pour redémarrer :

1. Ouvrez **Système** > **Redémarrage**.
2. Cochez "Je comprends que cela arrête toutes les applications de ce serveur pendant environ une minute."
3. Appuyez sur **Redémarrer ce serveur**.

Lorsque l'entretien nocturne est actif, sa dernière étape redémarre le serveur si un redémarrage est dû, puis vérifie que chaque service est revenu. La page **Système** indique "Dernier redémarrage par la maintenance nocturne" et son issue, et le Journal le consigne. Le redémarrage vous est sinon laissé, parce que l'interruption est une décision.

Sous **Actions** > **Opérations**, **Mises à jour apt en attente** liste ce qui attend et **Journal des mises à jour auto** montre ce que les mises à jour automatiques ont fait.

## Version du panneau de contrôle

Ouvrez **Paramètres** > **Version du panneau de contrôle**.

1. **En cours d'exécution** indique la version que fait tourner le serveur.
2. Choisissez la cible sous **Version à installer**. La liste contient les versions publiées de ce même panneau. Lorsque la liste ne peut pas être obtenue, le champ devient une zone de texte et vous saisissez la version (par exemple `v1.2.3`); seule une version de ce même panneau est acceptée.
3. Cochez "Je comprends que le panneau redémarre et sera brièvement indisponible."
4. Appuyez sur **Mettre à jour ce panneau**.

La section suit la mise à jour à travers Téléchargement (avec un compte de couches), Installation, Redémarrage, Vérification de l'état et Application de sa configuration. Le panneau est inaccessible environ une minute pendant son redémarrage et revient de lui-même; la mise à jour se poursuit sur le serveur même si vous fermez la page. Tout le reste continue de fonctionner.

Une mise à jour qui rend le serveur moins sain qu'avant est remise en arrière automatiquement. La section indique alors "La dernière tentative n'a pas abouti. Ce serveur a remis la version précédente et fonctionne normalement avec celle-ci, avec une version de retard.", avec le journal de la tentative replié en dessous.

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

## Applications (Catena Pro)

L'entretien nocturne met à jour les services propres à Catena et chaque application déployée depuis Portainer. Il prend d'abord une sauvegarde et la vérifie, et s'arrête avant toute mise à jour si cela échoue (voir [Horaires](/fr/configuration/schedules/#entretien-nocturne)).

### Images admissibles

Seules les images épinglées à une étiquette de version complète sont mises à jour automatiquement : `1.2.3`, `v1.2.3`, ou ces formes avec un suffixe comme `1.2.3-alpine`. Les étiquettes partielles (`18`, `1.2`) et flottantes (`latest`, `stable`, `main`) ne sont jamais touchées, quelle que soit l'étiquette d'application. Les images d'autres registres que Docker Hub et le registre de conteneurs de GitHub ne sont pas listées pour les mises à jour.

### L'étiquette vps.auto-update

L'étiquette `vps.auto-update` d'une application détermine jusqu'où son numéro de version peut avancer, de `off` à `major`; ses valeurs figurent dans la [référence des étiquettes](/fr/configure-apps/#mises-à-jour). Les applications ont `patch` par défaut, qui garde les numéros majeur et mineur; les services propres à Catena ont `patch+minor` par défaut, qui garde le numéro majeur. Des services qui partagent une même image prennent l'étiquette la plus restrictive.

### Délai d'attente et barrière de vulnérabilités

Une nouvelle version n'est adoptée qu'après 7 jours d'existence. Une version qu'aucune source ne sait dater n'est adoptée que si son analyse est propre.

Avant une mise à jour, les versions candidates sont analysées pour les vulnérabilités connues (Trivy, gravités élevée et critique, jusqu'à quatre candidates) :

- Une version qui ajoute une nouvelle vulnérabilité élevée ou critique est écartée au profit d'une version inférieure propre, ou la mise à jour attend.
- Une version plus récente qui supprime une vulnérabilité élevée ou critique présente dans la version en cours est appliquée sans le délai de 7 jours.

Sans analyseur, la vérification des vulnérabilités est désactivée et le délai d'attente s'applique toujours. Voir [Vulnérabilités](/fr/configuration/vulnerabilities/).

### Retour arrière et quarantaine

Après chaque mise à jour, le serveur compare son état de santé à celui d'avant. S'il est moins bon, la version précédente est remise en place et l'étiquette fautive est mise en quarantaine : la prochaine exécution essaie la version suivante plutôt que la même. Une application dotée d'une base de données reçoit un export fait avant la mise à jour, remis en place lors du retour arrière. Lorsque la nouvelle version d'une application met aussi à niveau sur place son code, sa configuration et ses modules complémentaires, comme Nextcloud, une copie de ceux-ci est faite avant la mise à jour et remise en place lors du retour arrière, l'application étant arrêtée; les fichiers de ses utilisateurs ne sont jamais remis en place. Les copies sont supprimées dès que la mise à jour est conservée ou que le retour arrière se termine. Un retour arrière qui ne peut aboutir les conserve sur le serveur.

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
| Redémarrage du serveur pendant la maintenance nocturne, ou redémarrage qui ne s'est pas déroulé comme prévu. |
| Avis de sécurité signalés dans les paquets de l'hôte ou les images d'application, puis corrigés. |
| Aucune sauvegarde n'est configurée; les mises à jour nocturnes s'appliquent sans sauvegarde. |
| La mise à jour de `<application>` n'a pas pu être enregistrée, ou son retour arrière n'a pas pu être effacé; la remise à niveau du serveur pourrait donc en changer la version. |
| La définition de `<application>` enregistrée dans Portainer nomme une image qu'aucun de ses services n'exécute; `<application>` ne reçoit ni mise à jour automatique, ni changement de paramètres, ni restauration à partir de cette définition tant qu'elles ne concordent pas. |
| La mise à jour nocturne laisse `<application>` de côté : son dernier déploiement a échoué et un service ne fonctionne pas. |

## Mettre à jour une application avec Communauté

Sans l'entretien nocturne, vous mettez à jour une application en changeant son étiquette d'image :

1. Ouvrez Portainer (`https://portainer.yourdomain.com`, ou par le transfert de port SSH avant qu'un domaine existe).
2. Ouvrez **Stacks** et sélectionnez l'application.
3. Dans l'éditeur, changez l'étiquette d'image pour la nouvelle étiquette de version complète.
4. Appuyez sur le bouton de mise à jour sous l'éditeur.

Faites une sauvegarde préalable (**Actions** > **Sauvegardes** > **Lancer une sauvegarde**). La catégorie **Mises à jour** de **Actions** est vide avec Communauté : ses boutons arrivent avec un abonnement.

## Dépannage

| Symptôme | Cause et correctif |
|---|---|
| Une application ne se met jamais à jour | Son étiquette est partielle ou flottante, son étiquette d'application est `off`, ou sa version la plus récente a moins de 7 jours ou ajoute une vulnérabilité. |
| "La dernière tentative n'a pas abouti." sous **Version du panneau de contrôle** | La mise à jour a été remise en arrière. Lisez le journal de la section, puis réessayez. |
| La bannière de redémarrage reste affichée | Redémarrez depuis **Système** > **Redémarrage**, ou laissez l'entretien nocturne s'en charger. |
| La liste de versions est remplacée par une zone de texte | Le registre n'a pas pu être joint; saisissez la version. |
| La définition d'une application nomme une autre image | Dans Portainer, ouvrez **Stacks**, sélectionnez l'application, réglez chaque `image:` sur ce qu'exécutent ses services, puis déployez. |
| La mise à jour nocturne laisse une application de côté | Corrigez le service arrêté, puis redéployez l'application depuis Portainer. |
