---
title: "Reconstruire un serveur à partir de la sauvegarde"
description: "Un serveur perdu peut être reconstruit à partir de sa sauvegarde avec le seul jeu de clés de récupération."
---

Si un serveur est un jour perdu -- panne matérielle, incident de
centre de données, effacement accidentel, rançongiciel -- il peut
être reconstruit à partir de sa dernière sauvegarde. Rien n'est à
reconstituer à la main, et aucun des réglages internes ni des mots de
passe qu'utilisent les applications n'est à mémoriser.

## La seule chose à conserver : le jeu de clés de récupération

Tout ce qu'il faut pour ramener un serveur tient en trois éléments.
Ils ont leur place dans un gestionnaire de mots de passe, chacun comme
une entrée distincte et clairement étiquetée :

- L'**emplacement du dépôt de sauvegarde** -- l'adresse du stockage de
  sauvegarde plus le nom du compartiment (là où vivent les
  sauvegardes).
- Les **clés de stockage** de ce compartiment -- une clé d'accès et
  une clé secrète, appariées.
- Le **mot de passe de chiffrement de la sauvegarde** -- la clé qui
  déverrouille la sauvegarde chiffrée.

Voilà tout le jeu de clés. Tant que ces trois éléments survivent
ailleurs que sur le serveur lui-même, les données sont récupérables.

## Tout le reste revient de lui-même

La sauvegarde est chiffrée de bout en bout et contient bien plus que
des fichiers. Chaque réglage interne et chaque secret dont dépendent
les applications -- mots de passe de base de données, configuration de
connexion, réglages de messagerie -- se trouve à l'intérieur de cette
sauvegarde chiffrée. Lorsque les données sont restaurées, tout cela
revient automatiquement. Il n'y a rien à ressaisir et aucune liste
d'identifiants à retaper.

C'est pourquoi le jeu de clés est court : les trois éléments
ci-dessus sont les seules choses qui vivent *à l'extérieur* de la
sauvegarde, donc les seules à conserver séparément.

## Comment se déroule une reconstruction

La reconstruction part d'une seule commande, et elle est rapide :

1. Louer un VPS neuf (n'importe quel fournisseur).
2. Depuis un dépôt Catena, lancer `catena recover`. Il demande le jeu
   de clés de récupération, puis prépare la machine, restaure le
   dernier instantané, ramène les applications et valide.
3. Les applications reviennent avec leurs données et leurs réglages
   intacts.

Le seul travail en amont est de garder le jeu de clés de récupération
en sécurité. La reconstruction peut démarrer dès que la perte du
serveur est constatée -- c'est une commande de routine, pas un projet
spécial. Un coup de main pour la première exécution reste disponible
auprès du contact Catena -- optionnel, pas obligatoire.

## Pourquoi chaque partie du jeu de clés compte

La sauvegarde est protégée pour que seuls les détenteurs du jeu de
clés puissent la lire :

- Le **mot de passe de chiffrement** déverrouille les données.
- Les **clés de stockage** permettent à la restauration de lire le
  compartiment.
- L'**emplacement du dépôt** indique où chercher.

Les trois sont requis ensemble. Sans le mot de passe de chiffrement,
la sauvegarde est du texte chiffré illisible pour quiconque -- c'est
précisément pour cela qu'il est détenu par le client, et pourquoi le
perdre est le seul cas qui ne peut pas être récupéré.
[Tâches récurrentes](/fr/disaster-prevention/) détaille comment
conserver le jeu de clés pour que cela n'arrive jamais.

## Ce qui revient, et ce qui peut être perdu

Restauré automatiquement depuis la sauvegarde : les bases de données,
les réglages des applications, les fichiers que la plupart des
applications stockent localement, et la configuration système
sous-jacente.

La seule chose à risque est ce qui a changé entre la dernière
sauvegarde et le moment de la perte du serveur -- de quelques minutes
à une journée, selon le calendrier de sauvegarde.
[Où vivent les données](/fr/where-is-my-data/) explique exactement où
vit chaque chose, et la page
[Se remettre d'une panne](/fr/disaster-recovery/) associe chaque
situation "ce qui a cassé" à sa voie de récupération.

## Nextcloud avec stockage de fichiers S3

Certaines configurations à forte volumétrie gardent les fichiers
téléversés dans Nextcloud dans leur propre compartiment de stockage,
séparé de la sauvegarde. Ce compartiment survit indépendamment du
serveur : si le serveur est perdu, les fichiers sont toujours dans le
compartiment, et quand le Nextcloud reconstruit se reconnecte au même
compartiment, chaque fichier est là.
[Où vivent les données](/fr/where-is-my-data/) couvre ceci en détail.

## Garder une copie hors ligne

Un site de documentation n'aide pas pendant un incident s'il se trouve
sur le chemin qui est tombé. Les pages qui méritent une copie locale --
celle-ci plus [Se remettre d'une panne](/fr/disaster-recovery/) et
[Où vivent les données](/fr/where-is-my-data/) -- s'enregistrent avec
la fonction "Enregistrer sous..." d'un navigateur (ou s'impriment en
PDF) à la prise en charge, et la copie mérite un rafraîchissement une
fois par an.

Si le serveur fonctionne encore et que seules ses données sont
mauvaises, rien de tout ceci n'est nécessaire : remettre les données en
place depuis le panneau d'administration. Voir
[Restaurer les données depuis le panneau d'administration](/fr/restore-data/).

Pour des restaurations de fichiers et des commandes de sauvegarde qui
fonctionnent sans le panneau d'administration, voir
[Quitter Catena](/fr/leaving/).
