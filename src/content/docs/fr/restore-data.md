---
title: "Restaurer les données depuis le panneau d'administration"
description: "Le serveur fonctionne mais ses données sont mauvaises : choisir une sauvegarde dans le panneau d'administration et la remettre en place, sans rien reconstruire."
---

Il arrive que le serveur aille bien et que les données, non. Quelqu'un
a supprimé un dossier partagé, une mise à jour d'application a mal
tourné, une base de données s'est retrouvée dans un état que personne
ne veut. Le serveur lui-même est en bonne santé : le reconstruire
serait le mauvais outil.

Pour ce cas, le panneau d'administration offre une page
**Restauration** : choisir une des sauvegardes, confirmer, et regarder
les données revenir.

## Ce qu'elle fait, et ce qu'elle laisse tranquille

La restauration remplace les données et rien d'autre. Les applications
sont arrêtées le temps que leurs données soient remises en place, puis
redémarrées avec.

Ce qui reste accessible tout du long : le panneau qui affiche la
progression, la connexion derrière lui, et le lien qui transporte la
page. C'est voulu : une restauration doit pouvoir être suivie du début
à la fin sans perdre la page. Lue par l'accès Tailscale ou par le web,
les deux continuent de fonctionner.

Ce qui ne change pas : le serveur lui-même. Aucune reconstruction,
aucune réinstallation, et rien à réappliquer ensuite.

## Lancer une restauration

1. Ouvrir le panneau d'administration et aller à **Restauration**.
2. Laisser la source sur **Les sauvegardes de ce serveur**.
3. Choisir une sauvegarde dans la liste. Chaque ligne indique quand
   elle a été effectuée, quel serveur l'a faite et sa taille.
4. Lire l'avertissement, cocher la case de confirmation et lancer.
5. Suivre la progression. Elle nomme l'étape en cours -- vérifications,
   arrêt des applications, copie des données, restauration des bases
   de données, vérifications finales -- et se termine par un message
   d'achèvement.

La durée dépend du volume de données, pas de la complexité de
l'installation. Une petite suite prend quelques minutes.

## Choisir la bonne sauvegarde

La liste va de la plus récente à la plus ancienne, et chaque entrée est
un point de restauration complet : il n'existe pas de sauvegarde
partielle dans cette liste. Celle à retenir est la plus récente
effectuée **avant** l'apparition du problème.

Quand l'espace de sauvegarde contient les sauvegardes de plus d'un
serveur, la page le signale et affiche une colonne **Serveur**. Elle
mérite un coup d'oeil avant le choix : restaurer les données d'un autre
serveur par-dessus celles-ci est la seule erreur que cette page ne peut
pas défaire.

## Restaurer sur un serveur de remplacement

Quand le serveur d'origine n'existe plus et qu'un nouveau prend sa
place, la page Restauration peut lire directement les sauvegardes de
l'ancien. Passer la source à **Les sauvegardes d'un autre serveur** et
saisir l'adresse du dépôt, son mot de passe et ses clés de stockage --
le même trousseau de récupération que décrit
[Reconstruire un serveur depuis une sauvegarde](/fr/self-restore/).

Ces valeurs sont conservées en mémoire uniquement. Elles disparaissent
au redémarrage du serveur, ce qui est la bonne durée de vie pour
quelque chose saisi afin de récupérer une machine une seule fois. Rien
n'est écrit quelque part qu'il faudrait nettoyer ensuite.

À la fin de la restauration, le nouveau serveur a les données et les
réglages de l'ancien. Rien à ressaisir.

## Si une restauration s'arrête en chemin

Elle le dit, et elle nomme l'étape où elle s'est arrêtée. Chaque étape
peut être reprise, donc deux chemins existent :

- **Continuer :** choisir la même sauvegarde et relancer. La
  restauration reprend là où elle s'était arrêtée.
- **Repartir du début :** effacer d'abord la restauration arrêtée, puis
  relancer.

La page refuse de lancer une deuxième restauration pendant qu'une autre
est en cours, et refuse d'effacer une restauration encore active. Les
deux refus existent pour la même raison : deux restaurations qui
écrivent les mêmes données en même temps sont pires que le problème à
corriger.

## Quelle page couvre quelle situation

- Le serveur fonctionne, les données sont mauvaises : **cette page.**
- Le serveur n'existe plus : [Reconstruire un serveur depuis une
  sauvegarde](/fr/self-restore/).
- Un serveur qui fonctionne encore est remplacé : [Déplacer vers un
  autre serveur](/fr/move-server/).
- La cause reste floue : [Se remettre d'une
  panne](/fr/disaster-recovery/) associe chaque situation à son chemin.
- Des outils standards, sans panneau du tout :
  [Quitter Catena](/fr/leaving/).

## Préparer un déplacement vers un autre serveur

La page Restauration offre une option de plus : **copier les données
seulement, sans rien démarrer**. Elle place les données sur le serveur
et s'arrête là, en laissant toutes les applications éteintes.

Ce n'est pas une restauration à souhaiter pour elle-même. Elle existe
pour qu'un déplacement vers un autre serveur puisse copier l'essentiel
des données à l'avance, pendant que l'ancien serveur fonctionne encore,
et ne laisser que les changements récents pour la courte fenêtre du
basculement. Elle reste décochée pour une restauration ordinaire.

Sur un forfait payant, cette option ne se lance pas à la main :
[Déplacer vers un autre serveur](/fr/move-server/) enchaîne la copie, le
basculement et la voie de retour en une seule opération.
