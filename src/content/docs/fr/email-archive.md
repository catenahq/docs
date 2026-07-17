---
title: "Archive de courriel"
description: "Comment vos courriels, votre calendrier et vos contacts sont captés depuis votre fournisseur vers vos propres sauvegardes -- ce que ça protège, et comment l'activer."
---

Vos courriels vivent chez votre fournisseur de messagerie, et vous
continuez de les utiliser comme d'habitude -- webmail, application
mobile, client de bureau. Rien ne change dans votre quotidien.
L'archive est un filet de sécurité placé derrière.

## Comment ça marche

Une fois une boîte connectée (voir [Comment l'activer](#comment-lactiver)),
votre VPS récupère une copie de chaque message, événement de calendrier
et contact depuis votre fournisseur, dans la même chaîne de sauvegarde
qui protège le reste de vos données. Elle se rafraîchit à chaque
sauvegarde.

L'archive est **en ajout seul** : une fois un message récupéré, il
reste dans l'archive même si vous le supprimez ensuite chez le
fournisseur. C'est volontaire -- une sauvegarde est inutile si l'usage
normal peut l'effacer. Comme elle voyage dans la même sauvegarde
chiffrée que le reste, elle revient automatiquement lors d'une
restauration complète.

## Ce que ça protège

- **Prise de contrôle du compte.** Quelqu'un vole votre mot de passe et
  vide la boîte. L'archive contient toujours tout ce qui a été capté à
  la sauvegarde la plus récente.
- **Litige de facturation / compte verrouillé.** Le fournisseur ferme
  votre compte avant que vous n'ayez rien exporté. L'archive ne
  disparaît pas.
- **Suppression accidentelle.** Quelqu'un vide la corbeille pour
  libérer de l'espace. L'archive le conserve.

## Ce que ce n'est pas

- **Ce n'est pas votre boîte de réception.** Vous lisez et répondez via
  le fournisseur comme d'habitude. L'archive est un filet, pas un
  client de messagerie.
- **Ce n'est pas en temps réel.** Le miroir se rafraîchit à chaque
  sauvegarde, pas à l'instant où un courriel arrive. Un message reçu
  puis supprimé entre deux sauvegardes n'est pas capté. Ne traitez pas
  l'archive comme une "corbeille".
- **Ce n'est pas encore navigable dans Nextcloud Files.** L'archive vit
  dans une partie du VPS qui n'est pas directement navigable
  aujourd'hui. Pour récupérer un message précis,
  [sortez-le d'un instantané de sauvegarde](#restaurer-un-message). La
  navigation directe arrive dans une version ultérieure.

## Comment l'activer

Une seule fois, par personne dans l'équipe :

1. Ouvrez **Nextcloud**, cliquez sur le menu en haut à droite, puis
   **Mail**.
2. Cliquez **Add account** et remplissez les détails de connexion de
   votre boîte (hôte, port et votre adresse -- fournis par votre
   fournisseur de messagerie).
3. **Important :** utilisez un **mot de passe d'application**, pas le
   mot de passe principal de votre compte. Votre fournisseur a un écran
   pour en générer ; consultez sa documentation pour la bonne page.
4. Dès que Nextcloud Mail se connecte et voit votre boîte, c'est
   terminé. La prochaine sauvegarde prend le compte en charge.

Activez l'authentification multifacteur chez votre fournisseur de
messagerie avant d'activer l'archive -- un compte archivé avec un mot
de passe faible est un risque, pas un filet de sécurité.

## Restaurer un message

En attendant la navigation dans Files, récupérez-le vous-même depuis un
instantané de sauvegarde dans le panneau catena-admin : ouvrez
**Actions -> Browse past snapshots**, choisissez un point dans le
temps, et lisez le message archivé directement depuis le montage en
lecture seule. Pour en sortir plusieurs d'un coup, utilisez **Export
snapshot** et ouvrez le téléchargement.

Pour une reprise complète -- fournisseur perdu, VPS perdu, les deux à
la fois -- la page [Se remettre d'une panne](/fr/disaster-recovery/)
couvre le chemin. L'archive revient dans ce flux car elle est dans la
même sauvegarde que tout le reste.

## Boîtes partagées (`info@`, `billing@`, `support@`)

Elles fonctionnent mieux routées vers votre messagerie d'équipe ou
votre application d'assistance (`Rocket.Chat Omnichannel`, `Zammad`, ou
un flux `n8n`) plutôt qu'archivées en courriel brut. Chaque échange vit
alors dans une application dont la base de données est déjà sauvegardée
par votre VPS. Configurez cela au moment de déployer ces applications.
