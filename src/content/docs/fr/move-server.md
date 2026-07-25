---
title: "Déplacer vers un autre serveur"
description: "Déplacez vos applications et vos données vers un nouveau serveur, l'ancien continuant de servir jusqu'aux dernières minutes, avec une voie de retour tout du long."
---

Un serveur, ça se remplace. Vous dépassez celui que vous avez, votre
fournisseur change ses prix, vous voulez vos données dans un autre pays,
ou une machine tourne depuis assez longtemps pour que vous préfériez
repartir à neuf.

Le déplacement fait partie des forfaits payants, et le panneau
d'administration le fait depuis la page **Restauration**, sous
**Déplacer un autre serveur ici**. Vous le lancez sur le NOUVEAU
serveur. Celui-ci va rejoindre l'ancien, rapatrier ses données, puis
reprendre son adresse web.

## Ce qui se passe vraiment, et quand vous êtes hors service

La quasi-totalité du travail se fait pendant que l'ancien serveur
continue de répondre à toutes les demandes. C'est tout le principe :

1. **Avant que quoi que ce soit ne s'arrête.** Le nouveau serveur copie
   le gros de vos données, récupère toutes les images d'applications
   dont il aura besoin, et s'enregistre auprès du réseau qui l'acheminera.
   Vos utilisateurs ne voient rien. C'est la partie qui prend des heures
   si vous avez beaucoup de données.
2. **La courte fenêtre.** L'ancien serveur met ses applications en
   pause, prend une dernière sauvegarde, et cette sauvegarde est
   vérifiée. Ensuite il est retiré du service, le nouveau met en place
   les dernières minutes de changements, et l'adresse web bascule.
3. **Après.** Le nouveau serveur sert vos applications avec vos données.
   L'ancien est arrêté, mais intact.

La période d'indisponibilité de vos applications, c'est donc uniquement
la deuxième partie : les changements depuis la copie, plus un changement
d'adresse. Des minutes, pas des heures, et cette durée ne grandit pas
avec le volume de vos données, seulement avec ce qui a changé pendant
que vous attendiez.

## Ce qu'il vous faut d'abord

- **Les deux serveurs sur la même version.** Le déplacement refuse de
  démarrer si les deux ont été installés depuis des versions
  différentes, avant même de toucher à quoi que ce soit. Mettez d'abord
  le plus ancien à jour; le panneau vous dit lequel est lequel.
- **L'adresse de l'ancien serveur sur le réseau privé.** Pas son adresse
  web. Son adresse web est justement ce qui va pointer vers le nouveau
  serveur, elle ne peut donc pas servir à joindre l'ancien pendant le
  déplacement. Vous trouverez l'adresse privée dans votre liste
  d'appareils Tailscale.
- **Les clés de sauvegarde de l'ancien serveur**, saisies sur la page
  Restauration du nouveau, sous **Sauvegardes d'un autre serveur**. Les
  mêmes valeurs que dans
  [Reconstruire votre serveur depuis une sauvegarde](/fr/self-restore/).
  Elles ne sont gardées qu'en mémoire.
- **Une fenêtre ouverte sur l'ancien serveur.** Voir ci-dessous.

## Donner la permission, sur l'ancien serveur

Rien ne peut déplacer votre serveur sans que quelqu'un ouvre d'abord la
porte dessus. Dans le panneau d'administration de l'ANCIEN serveur,
ouvrez la page **Déplacement** et autorisez un déplacement. Un code
court s'affiche, une seule fois.

Ce code est la permission. Le nouveau serveur ne peut absolument rien
faire à l'ancien sans lui : ni le mettre en pause, ni l'arrêter, ni lire
son état. L'ancien serveur ne conserve du code qu'une forme brouillée,
si bien qu'une copie de ses sauvegardes ne contient aucun moyen
d'entrer.

Deux choses à savoir :

- **La fenêtre se referme d'elle-même** après quelques heures si
  personne ne s'en sert, et la refermer fait cesser toute écoute sur
  l'ancien serveur.
- **Des codes répétés erronés la referment aussi**, au lieu de ralentir.
  Si vous perdez le code, autorisez un déplacement de nouveau : cela en
  génère un neuf et invalide le précédent.

Les échanges entre les deux serveurs passent par votre réseau privé et
nulle part ailleurs. L'ancien serveur ne répondra à rien qu'il ne peut
identifier comme l'un de vos propres appareils.

## Lancer le déplacement

Sur le NOUVEAU serveur :

1. Ouvrez le panneau d'administration, allez à **Restauration**, et
   saisissez les clés de sauvegarde de l'ancien serveur sous
   **Sauvegardes d'un autre serveur**.
2. Sous **Déplacer un autre serveur ici**, saisissez l'adresse de
   l'ancien serveur sur le réseau privé et le code qu'il vous a affiché.
3. Laissez **Passes de préparation** à 1, sauf si vous prévoyez une
   longue attente avant d'être prêt à basculer. Chaque passe
   supplémentaire ne copie que ce qui a changé depuis la précédente :
   plus de passes raccourcissent la période d'indisponibilité finale et
   coûtent de la bande passante.
4. Lisez l'avertissement, confirmez, puis lancez.

L'affichage de progression nomme l'étape en cours. Tout ce qui précède
**Vérification de cette sauvegarde** est réversible; après **Retrait de
l'autre serveur du service**, ce ne l'est plus, et la page vous le dit
avant que vous ne lanciez.

## Annuler

Jusqu'à la vérification de la dernière sauvegarde incluse, arrêter le
déplacement remet l'ancien serveur en service de lui-même. Rien n'a
démarré sur le nouveau, votre adresse web pointe toujours vers
l'ancien, et ses applications reviennent. Vous pouvez réessayer quand
vous voulez.

Après le retrait de l'ancien serveur du service, ce n'est plus
automatique, et la raison compte : le nouveau serveur détient peut-être
déjà une partie des données et des réglages de l'ancien. Démarrer les
deux en même temps ferait écrire deux serveurs dans le même stockage et
envoyer du courriel au nom du même domaine, en se corrompant
mutuellement en silence. Le déplacement s'arrête donc, vous dit que
l'ancien serveur est retiré du service et n'a pas été remis en marche,
et vous laisse le choix :

- **Corriger ce qui a échoué et relancer le déplacement.** Il reprend là
  où il s'est arrêté et ne recopie pas tout une seconde fois.
- **Remettre l'ancien serveur en service.** La page a un bouton pour
  cela, au même endroit. Votre adresse web pointe toujours vers lui, ses
  utilisateurs sont donc servis dès qu'il redémarre.

La voie de retour continue de fonctionner même après que l'ancien
serveur a tout arrêté. C'est voulu : la seule demande à laquelle il
répond encore est celle qui le remet en service.

## Après le déplacement

L'ancien serveur est arrêté, pas effacé. Ses données sont intactes et sa
place dans le réseau est toujours enregistrée, ce qui fait du retour en
arrière un simple changement plutôt qu'une reconstruction. Gardez-le
ainsi jusqu'à ce que le nouveau serveur vous satisfasse : un jour, une
semaine, ce qui vous met à l'aise.

Ses sauvegardes sont également intactes : même après avoir retiré la
machine, les données qu'elle contenait restent restaurables sur
n'importe quoi.

Quand vous voudrez vous en débarrasser, retirer un serveur est un geste
distinct et délibéré. Cela ne fait pas partie du déplacement, et rien
dans le déplacement ne le fait pour vous.

## Quelle page me concerne ?

- Déplacer vers un nouveau serveur : **cette page.**
- Le serveur fonctionne et ses données sont mauvaises :
  [Restaurer vos données](/fr/restore-data/).
- Le serveur a disparu :
  [Reconstruire votre serveur depuis une sauvegarde](/fr/self-restore/).
- Vous ne savez pas ce qui a cassé :
  [Se relever d'une panne](/fr/disaster-recovery/) associe chaque
  situation à son parcours.
