---
title: "Restaurer vos données depuis le panneau d'administration"
description: "Votre serveur fonctionne mais ses données sont mauvaises : choisissez une sauvegarde dans le panneau d'administration et remettez-la en place, sans rien reconstruire."
---

Il arrive que le serveur aille bien et que les données, non. Quelqu'un
a supprimé un dossier partagé, une mise à jour d'application a mal
tourné, une base de données s'est retrouvée dans un état que personne
ne veut. Le serveur lui-même est en bonne santé : le reconstruire
serait le mauvais outil.

Pour ce cas, le panneau d'administration offre une page
**Restauration** : choisissez une de vos sauvegardes, confirmez, et
regardez vos données revenir.

## Ce qu'elle fait, et ce qu'elle laisse tranquille

La restauration remplace vos données et rien d'autre. Vos applications
sont arrêtées le temps que leurs données soient remises en place, puis
redémarrées avec.

Ce qui reste accessible tout du long : le panneau que vous regardez,
votre connexion, et le lien qui transporte la page. C'est voulu : vous
devez pouvoir suivre votre propre restauration du début à la fin sans
perdre la page. Que vous lisiez le panneau par votre accès Tailscale ou
par le web, les deux continuent de fonctionner.

Ce qui ne change pas : le serveur lui-même. Aucune reconstruction,
aucune réinstallation, et rien à réappliquer ensuite.

## Lancer une restauration

1. Ouvrez le panneau d'administration et allez à **Restauration**.
2. Laissez la source sur **Les sauvegardes de ce serveur**.
3. Choisissez une sauvegarde dans la liste. Chaque ligne indique quand
   elle a été effectuée, quel serveur l'a faite et sa taille.
4. Lisez l'avertissement, cochez la case de confirmation et lancez.
5. Suivez la progression. Elle nomme l'étape en cours -- vérifications,
   arrêt des applications, copie de vos données, restauration des bases
   de données, vérifications finales -- et se termine par un message
   d'achèvement.

La durée dépend du volume de données, pas de la complexité de votre
installation. Une petite suite prend quelques minutes.

## Choisir la bonne sauvegarde

La liste va de la plus récente à la plus ancienne, et chaque entrée est
un point de restauration complet : il n'existe pas de sauvegarde
partielle dans cette liste. Choisissez la plus récente effectuée
**avant** l'apparition du problème.

Si votre espace de sauvegarde contient les sauvegardes de plus d'un
serveur, la page le signale et affiche une colonne **Serveur**.
Vérifiez-la avant de choisir : restaurer les données d'un autre serveur
par-dessus celles-ci est la seule erreur que cette page ne peut pas
défaire pour vous.

## Restaurer sur un serveur de remplacement

Si le serveur d'origine n'existe plus et que vous en avez bâti un
nouveau à sa place, la page Restauration peut lire directement les
sauvegardes de l'ancien. Passez la source à **Les sauvegardes d'un
autre serveur** et saisissez l'adresse du dépôt, son mot de passe et
ses clés de stockage -- le même trousseau de récupération que décrit
[Reconstruire votre serveur depuis une sauvegarde](/fr/self-restore/).

Ces valeurs sont conservées en mémoire uniquement. Elles disparaissent
au redémarrage du serveur, ce qui est la bonne durée de vie pour
quelque chose saisi afin de récupérer une machine une seule fois. Rien
n'est écrit quelque part qu'il faudrait nettoyer ensuite.

À la fin de la restauration, le nouveau serveur a les données et les
réglages de l'ancien. Rien à ressaisir.

## Si une restauration s'arrête en chemin

Elle le dit, et elle nomme l'étape où elle s'est arrêtée. Chaque étape
peut être reprise, donc deux chemins s'offrent à vous :

- **Continuer :** choisissez la même sauvegarde et relancez. La
  restauration reprend là où elle s'était arrêtée.
- **Repartir du début :** effacez d'abord la restauration arrêtée, puis
  relancez.

La page refuse de lancer une deuxième restauration pendant qu'une autre
est en cours, et refuse d'effacer une restauration encore active. Les
deux refus existent pour la même raison : deux restaurations qui
écrivent les mêmes données en même temps sont pires que le problème que
vous cherchiez à corriger.

## Quelle page me convient ?

- Le serveur fonctionne, les données sont mauvaises : **cette page.**
- Le serveur n'existe plus : [Reconstruire votre serveur depuis une
  sauvegarde](/fr/self-restore/).
- Vous remplacez un serveur qui fonctionne encore : [Déplacer vers un
  autre serveur](/fr/move-server/).
- Vous ne savez pas ce qui a brisé : [Se remettre d'une
  panne](/fr/disaster-recovery/) associe chaque situation à son chemin.
- Vous voulez le faire avec des outils standards, sans panneau du tout :
  [Quitter Catena](/fr/leaving/).

## Préparer un déplacement vers un autre serveur

La page Restauration offre une option de plus : **copier les données
seulement, sans rien démarrer**. Elle place les données sur le serveur
et s'arrête là, en laissant toutes les applications éteintes.

Ce n'est pas une restauration à souhaiter pour elle-même. Elle existe
pour qu'un déplacement vers un autre serveur puisse copier l'essentiel
de vos données à l'avance, pendant que l'ancien serveur fonctionne
encore, et ne laisser que les changements récents pour la courte
fenêtre du basculement. Laissez-la décochée pour une restauration
ordinaire.

Sur un forfait payant, vous n'avez pas à lancer cette option à la main :
[Déplacer vers un autre serveur](/fr/move-server/) enchaîne la copie, le
basculement et la voie de retour en une seule opération.
