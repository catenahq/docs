---
title: "Déplacer vers un autre serveur"
description: "Déplacer les applications et les données vers un nouveau serveur, l'ancien continuant de servir jusqu'aux dernières minutes, avec une voie de retour tout du long."
---

Un serveur, ça se remplace. Une machine est dépassée, un fournisseur
change ses prix, les données doivent se trouver dans un autre pays, ou
un serveur tourne depuis assez longtemps pour qu'un départ à neuf soit
préférable.

Le déplacement fait partie des forfaits payants, et le panneau
d'administration le fait depuis la page **Restauration**, sous
**Déplacer un autre serveur ici**. Il se lance sur le NOUVEAU serveur.
Celui-ci va rejoindre l'ancien, rapatrier ses données, puis reprendre
son adresse web.

## Ce qui se passe vraiment, et quand les applications sont hors service

La quasi-totalité du travail se fait pendant que l'ancien serveur
continue de répondre à toutes les demandes. C'est tout le principe :

1. **Avant que quoi que ce soit ne s'arrête.** Le nouveau serveur copie
   le gros des données, récupère toutes les images d'applications
   dont il aura besoin, et s'enregistre auprès du réseau qui l'acheminera.
   Les utilisateurs ne voient rien. C'est la partie qui prend des heures
   quand il y a beaucoup de données.
2. **La courte fenêtre.** L'ancien serveur met ses applications en
   pause, prend une dernière sauvegarde, et cette sauvegarde est
   vérifiée. Ensuite il est retiré du service, le nouveau met en place
   les dernières minutes de changements, et l'adresse web bascule.
3. **Après.** Le nouveau serveur sert les applications avec les données.
   L'ancien est arrêté, mais intact.

La période d'indisponibilité des applications, c'est donc uniquement
la deuxième partie : les changements depuis la copie, plus un changement
d'adresse. Des minutes, pas des heures, et cette durée ne grandit pas
avec le volume de données, seulement avec ce qui a changé pendant
l'attente.

## Ce qu'il faut d'abord

- **Les deux serveurs sur la même version.** Le déplacement refuse de
  démarrer si les deux ont été installés depuis des versions
  différentes, avant même de toucher à quoi que ce soit. Le plus ancien
  se met à jour d'abord ; le panneau dit lequel est lequel.
- **L'adresse de l'ancien serveur sur le réseau privé.** Pas son adresse
  web. Son adresse web est justement ce qui va pointer vers le nouveau
  serveur, elle ne peut donc pas servir à joindre l'ancien pendant le
  déplacement. L'adresse privée se trouve dans la liste d'appareils
  Tailscale.
- **Les clés de sauvegarde de l'ancien serveur**, saisies sur la page
  Restauration du nouveau, sous **Sauvegardes d'un autre serveur**. Les
  mêmes valeurs que dans
  [Reconstruire un serveur depuis une sauvegarde](/fr/self-restore/).
  Elles ne sont gardées qu'en mémoire.
- **Une fenêtre ouverte sur l'ancien serveur.** Voir ci-dessous.

## Donner la permission, sur l'ancien serveur

Rien ne peut déplacer un serveur sans que quelqu'un ouvre d'abord la
porte dessus. Dans le panneau d'administration de l'ANCIEN serveur, la
page **Déplacement** autorise un déplacement. Un code court s'affiche,
une seule fois.

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
  Un code perdu se remplace en autorisant un déplacement de nouveau :
  cela en génère un neuf et invalide le précédent.

Les échanges entre les deux serveurs passent par le réseau privé du
client et nulle part ailleurs. L'ancien serveur ne répondra à rien
qu'il ne peut identifier comme l'un de ces appareils.

## Lancer le déplacement

Sur le NOUVEAU serveur :

1. Ouvrir le panneau d'administration, aller à **Restauration**, et
   saisir les clés de sauvegarde de l'ancien serveur sous
   **Sauvegardes d'un autre serveur**.
2. Sous **Déplacer un autre serveur ici**, saisir l'adresse de
   l'ancien serveur sur le réseau privé et le code qu'il a affiché.
3. Laisser **Passes de préparation** à 1, sauf si une longue attente est
   prévue avant le basculement. Chaque passe supplémentaire ne copie que
   ce qui a changé depuis la précédente : plus de passes raccourcissent
   la période d'indisponibilité finale et coûtent de la bande passante.
4. Lire l'avertissement, confirmer, puis lancer.

L'affichage de progression nomme l'étape en cours. Tout ce qui précède
**Vérification de cette sauvegarde** est réversible ; après **Retrait de
l'autre serveur du service**, ce ne l'est plus, et la page le dit
avant le lancement.

## Annuler

Jusqu'à la vérification de la dernière sauvegarde incluse, arrêter le
déplacement remet l'ancien serveur en service de lui-même. Rien n'a
démarré sur le nouveau, l'adresse web pointe toujours vers l'ancien, et
ses applications reviennent. Un nouvel essai peut suivre à tout moment.

Après le retrait de l'ancien serveur du service, ce n'est plus
automatique, et la raison compte : le nouveau serveur détient peut-être
déjà une partie des données et des réglages de l'ancien. Démarrer les
deux en même temps ferait écrire deux serveurs dans le même stockage et
envoyer du courriel au nom du même domaine, en se corrompant
mutuellement en silence. Le déplacement s'arrête donc, signale que
l'ancien serveur est retiré du service et n'a pas été remis en marche,
et laisse le choix :

- **Corriger ce qui a échoué et relancer le déplacement.** Il reprend là
  où il s'est arrêté et ne recopie pas tout une seconde fois.
- **Remettre l'ancien serveur en service.** La page a un bouton pour
  cela, au même endroit. L'adresse web pointe toujours vers lui, ses
  utilisateurs sont donc servis dès qu'il redémarre.

La voie de retour continue de fonctionner même après que l'ancien
serveur a tout arrêté. C'est voulu : la seule demande à laquelle il
répond encore est celle qui le remet en service.

## Après le déplacement

L'ancien serveur est arrêté, pas effacé. Ses données sont intactes et sa
place dans le réseau est toujours enregistrée, ce qui fait du retour en
arrière un simple changement plutôt qu'une reconstruction. Il reste
ainsi jusqu'à ce que le nouveau serveur ait fait ses preuves : un jour,
une semaine, ce qui met à l'aise.

Ses sauvegardes sont également intactes : même une fois la machine
retirée, les données qu'elle contenait restent restaurables sur
n'importe quoi.

Retirer un serveur est un geste distinct et délibéré. Cela ne fait pas
partie du déplacement, et rien dans le déplacement ne le fait.

## Quelle page couvre quelle situation

- Déplacer vers un nouveau serveur : **cette page.**
- Le serveur fonctionne et ses données sont mauvaises :
  [Restaurer les données](/fr/restore-data/).
- Le serveur a disparu :
  [Reconstruire un serveur depuis une sauvegarde](/fr/self-restore/).
- La cause reste floue :
  [Se relever d'une panne](/fr/disaster-recovery/) associe chaque
  situation à son parcours.
