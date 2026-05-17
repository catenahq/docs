---
title: "Archive de courriel"
description: "Comment vos courriels, votre calendrier et vos contacts sont sauvegardés depuis votre fournisseur externe."
---

Vos courriels sont hébergés chez le fournisseur que votre opérateur
a sélectionné lors de la mise en place (Migadu, Mailbox.org,
Infomaniak, OVH ou Mailfence). Vous continuez à les utiliser comme
avant : webmail, application mobile, client de bureau. Rien ne
change de ce côté.

Ce qui est nouveau : chaque nuit, votre VPS récupère une copie de
chaque message, de chaque événement de calendrier et de chaque
contact depuis votre fournisseur, et l'envoie dans la même chaîne
de sauvegarde qui protège le reste de vos données. Si votre compte
chez le fournisseur tombe (compromission, litige de facturation,
suppression accidentelle), l'historique reste sous la garde de
votre opérateur.

## Ce qui est protégé

- **Prise de contrôle du compte.** Quelqu'un vole votre mot de passe
  et vide la boîte. L'archive contient tout ce qui s'y trouvait lors
  de la dernière exécution nocturne.
- **Litige de facturation / compte verrouillé.** Le fournisseur
  ferme votre compte avant que vous n'ayez exporté quoi que ce
  soit. L'archive ne disparaît pas.
- **Suppression accidentelle.** Quelqu'un vide la corbeille pour
  libérer de l'espace. L'archive le conserve.

L'archive est **en ajout seul** : une fois qu'un message a été
récupéré, il reste dans l'archive même si vous le supprimez chez le
fournisseur. C'est intentionnel. Une sauvegarde qu'un usage normal
peut effacer ne sert à rien.

## Ce que ce n'est PAS

- **Ce n'est pas votre boîte de réception.** Vous lisez et répondez
  via le fournisseur comme avant. L'archive est un filet de
  sécurité.
- **Ce n'est pas en temps réel.** Le miroir tourne une fois par
  nuit. Un message reçu à 23 h et supprimé à 7 h le lendemain matin,
  avant l'exécution de 3 h, n'est pas dans l'archive. Ne traitez pas
  l'archive comme une corbeille.
- **Ce n'est pas visible dans Fichiers Nextcloud aujourd'hui.**
  L'archive vit dans une partie du VPS qui n'est pas encore
  directement consultable. Si vous avez besoin de récupérer un
  message ou un événement précis depuis l'archive, contactez votre
  opérateur, qui l'extraira. La consultation directe arrivera dans
  une version ultérieure.

## Configuration initiale

Une seule fois, par personne dans l'équipe :

1. Ouvrez **Nextcloud** et cliquez sur le menu en haut à droite,
   puis **Mail**.
2. Cliquez sur **Ajouter un compte** et remplissez les paramètres
   de connexion fournis par votre opérateur lors de la mise en
   place.
3. **Important** : utilisez un **mot de passe d'application**, pas
   le mot de passe principal de votre compte. Votre fournisseur
   propose un écran pour en générer (votre opérateur vous indiquera
   la page exacte pour votre fournisseur).
4. Une fois que Nextcloud Mail parvient à se connecter et à voir
   votre boîte de réception, c'est terminé. La prochaine exécution
   nocturne prendra le compte en charge.

L'authentification à deux facteurs sur le compte du fournisseur
fait partie de la liste de vérification de mise en place ; votre
opérateur confirme qu'elle est active avant d'enclencher l'archive.

## Restaurer un message

En attendant l'arrivée de la consultation directe dans Fichiers, la
récupération se fait par une simple conversation avec votre
opérateur : indiquez approximativement la date d'envoi ou de
réception et le destinataire, et l'opérateur l'extrait de l'archive.

Pour une reprise après sinistre complète (fournisseur perdu, VPS
perdu, en même temps), la page
[Reprise après sinistre](/disaster-recovery/) décrit le
parcours. L'archive revient avec le reste, car elle réside dans la
même sauvegarde.

## Boîtes partagées (`info@`, `facturation@`, `soutien@`)

Le mieux est de les acheminer vers votre messagerie d'équipe ou
votre application d'assistance (`Rocket.Chat Omnichannel`,
`Zammad`, ou un flux `n8n`) plutôt que de les archiver comme du
courriel brut. Chaque conversation vit alors dans une application
dont votre VPS sauvegarde déjà la base de données. Votre opérateur
met cela en place lors de la mise en place.
