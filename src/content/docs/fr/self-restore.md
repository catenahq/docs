---
title: "Reconstruire votre serveur à partir de la sauvegarde"
description: "Si votre serveur est perdu, il peut être reconstruit à partir de votre sauvegarde avec votre seul jeu de clés de récupération."
---

Si votre serveur est un jour perdu -- panne matérielle, incident de
centre de données, effacement accidentel, rançongiciel -- il peut
être reconstruit à partir de votre sauvegarde nocturne. Vous n'avez
rien à reconstituer à la main, et vous n'avez à mémoriser aucun des
réglages internes ni des mots de passe qu'utilisent vos applications.

## La seule chose à conserver : votre jeu de clés de récupération

Tout ce qu'il faut pour ramener votre serveur tient en trois
éléments. Conservez-les dans votre gestionnaire de mots de passe,
chacun comme une entrée distincte et clairement étiquetée :

- L'**emplacement du dépôt de sauvegarde** -- l'adresse de votre
  stockage de sauvegarde plus le nom du compartiment (là où vivent
  vos sauvegardes).
- Les **clés de stockage** de ce compartiment -- une clé d'accès et
  une clé secrète, appariées.
- Votre **mot de passe de chiffrement de la sauvegarde** -- la clé
  qui déverrouille la sauvegarde chiffrée.

Voilà tout le jeu de clés. Tant que ces trois éléments survivent
ailleurs que sur le serveur lui-même, vos données sont récupérables.

## Tout le reste revient de lui-même

Votre sauvegarde est chiffrée de bout en bout et contient bien plus
que vos fichiers. Chaque réglage interne et chaque secret dont
dépendent vos applications -- mots de passe de base de données,
configuration de connexion, réglages de messagerie -- se trouve à
l'intérieur de cette sauvegarde chiffrée. Lorsque vos données sont
restaurées, tout cela revient automatiquement. Il n'y a rien à
ressaisir et aucune liste d'identifiants à retaper.

C'est pourquoi le jeu de clés est court : les trois éléments
ci-dessus sont les seules choses qui vivent *à l'extérieur* de la
sauvegarde, donc les seules que vous devez conserver vous-même.

## Comment se déroule une reconstruction

La reconstruction, nous la faisons avec vous, et elle est rapide :

1. Un serveur neuf est préparé.
2. Votre dernière sauvegarde y est restaurée à l'aide de votre jeu
   de clés de récupération.
3. Vos applications reviennent avec leurs données et leurs réglages
   intacts.

Votre rôle se résume à avoir gardé votre jeu de clés de récupération
en sécurité et à joindre votre contact Catena au besoin. Dès que vous
constatez que le serveur est perdu, communiquez avec nous -- une
reconstruction à partir de votre sauvegarde est une opération de
routine, pas un projet spécial.

## Pourquoi chaque partie du jeu de clés compte

La sauvegarde est protégée pour que vous seul (et les personnes à qui
vous confiez le jeu de clés) puissiez la lire :

- Le **mot de passe de chiffrement** déverrouille les données.
- Les **clés de stockage** permettent à la restauration de lire
  votre compartiment.
- L'**emplacement du dépôt** indique où chercher.

Les trois sont requis ensemble. Sans le mot de passe de chiffrement,
la sauvegarde est du texte chiffré illisible, même pour nous -- c'est
précisément pour cela que vous le détenez, et pourquoi le perdre est
le seul cas qui ne peut pas être récupéré.
[Prévention des sinistres](/fr/disaster-prevention/) détaille comment
conserver le jeu de clés pour que cela n'arrive jamais.

## Ce qui revient, et ce que vous pourriez perdre

Restauré automatiquement depuis la sauvegarde : vos bases de données,
les réglages de vos applications, les fichiers que la plupart des
applications stockent localement, et la configuration système
sous-jacente.

La seule chose à risque est ce qui a changé entre la dernière
sauvegarde et le moment de la perte du serveur -- de quelques minutes
à une journée, selon votre calendrier de sauvegarde.
[Où sont mes données](/fr/where-is-my-data/) explique exactement où
vit chaque chose, et la page
[Reprise après sinistre](/fr/disaster-recovery/) associe chaque
situation "ce qui a cassé" à sa voie de récupération.

## Si vous utilisez Nextcloud avec stockage de fichiers S3

Certaines configurations à forte volumétrie gardent les fichiers
téléversés dans Nextcloud dans leur propre compartiment de stockage,
séparé de la sauvegarde. Ce compartiment survit indépendamment du
serveur : si le serveur est perdu, les fichiers sont toujours dans le
compartiment, et quand le Nextcloud reconstruit se reconnecte au même
compartiment, chaque fichier est là.
[Où sont mes données](/fr/where-is-my-data/) couvre ceci en détail.

## Garder une copie hors ligne

Si votre serveur est tombé et que vous avez besoin de ces
instructions pour le relever, le site de documentation ne vous aidera
pas s'il se trouve sur le même chemin. Enregistrez les pages que vous
utiliseriez lors d'un incident -- celle-ci plus
[Reprise après sinistre](/fr/disaster-recovery/) et
[Où sont mes données](/fr/where-is-my-data/) -- sur votre poste avec
la fonction "Enregistrer sous..." de votre navigateur (ou imprimez-les
en PDF) à la prise en charge, et rafraîchissez la copie une fois par
an.
