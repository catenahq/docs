---
title: Ce que nous testons
description: La liste générée et à jour de ce que couvrent les répétitions automatisées de la suite Catena.
---

<!-- Generated file. Do not hand-edit: the maintainers' tooling
     regenerates it and the build fails on drift. -->

Cette page est **générée, pas rédigée** : elle est rendue à partir du même manifeste vérifié par machine qui classifie chaque fichier source et chaque scénario de test du produit Catena, et la compilation échoue dès que cette page dérive de ce manifeste. Ce qu'elle affirme est ce qui est appliqué.

Catena est exercée de bout en bout par des répétitions automatisées : chacune provisionne des serveurs virtuels jetables, pilote le vrai produit (installation, sauvegarde, bris, restauration) et vérifie le résultat -- y compris des pannes injectées délibérément. Les comptes ci-dessous sont ces répétitions.

## Inclus dans Community

### Sauvegardes chiffrées vers un stockage qui vous appartient (12 répétitions)

Une sauvegarde hebdomadaire planifiée plus des sauvegardes manuelles en tout temps. Les sauvegardes sont chiffrées sur le serveur avant d'en sortir et aboutissent dans un stockage objet appartenant au client; les instantanés se listent, se parcourent et s'exportent sans restauration. La cadence quotidienne et infra-quotidienne est une fonction Catena Pro.

### Authentification unique pour toute la suite (10 répétitions)

Un seul compte ouvre toutes les applications, avec contrôle d'accès par application et séparation employé/administrateur appliquée en amont des applications, pas dans chacune.

### Tableau de bord d'administration (10 répétitions)

Un tableau de bord web à accès selon le rôle (le personnel voit l'état, les administrateurs ont aussi les actions d'entretien). Chaque action déclenchée par un bouton est consignée au journal système du serveur.

### Installation et déploiement des applications (17 répétitions)

Prépare un serveur neuf, installe la plateforme et déploie les applications choisies. Relancer la même opération gérée ramène le serveur à sa configuration déclarée : un serveur ayant dérivé est réparé, pas reconstruit à la main.

### Catalogue d'applications et intégrations de la suite (2 répétitions)

Déploiement par application plus le câblage qui fait de la suite un seul produit : courriel, clavardage et visioconférence, intégration fichiers/bureautique, veille antivirus et canaris de livraison.

### Supervision auto-hébergée (1 répétition)

Pages d'état sur le serveur, suivi des ressources, chien de garde d'espace disque et rapport toujours à jour des mises à jour disponibles pour les applications installées -- le tout hébergé sur le serveur du client.

### Réseau privé et accès public durci (17 répétitions)

Tout le trafic web atteint le serveur par un tunnel chiffré : aucun port web n'est ouvert sur la machine elle-même. L'administration à distance passe par un réseau privé pair à pair, et les appels audio/vidéo ont leur relais dédié.

### Reprise après sinistre et restauration (20 répétitions)

Un serveur entier se reconstruit à partir du seul point d'accès de sauvegarde et de sa clé, et un serveur en marche se restaure sur place. Bases de données et applications reviennent en une seule opération coordonnée, cohérentes entre elles plutôt que chacune à son propre instant. Les deux chemins sont répétés en continu, y compris à travers les versions majeures du système et de la base de données.

### Aucune dépendance forcée, jamais (2 répétitions)

Supprimez le panneau d'administration et tout ce qui vous appartient continue de fonctionner : les sauvegardes tournent, les restaurations réussissent et chaque application reste en ligne, avec seulement des outils standards et les réglages conservés sur votre propre serveur. Partir coûte du confort, jamais vos données.

### Vérifications automatisées de santé et d'exposition (3 répétitions)

Une passe de validation prouve les deux sens : chaque service répond là où il le doit (sur le serveur et via le réseau privé), et un balayage externe confirme que rien d'interdit n'est joignable.

## Catena Pro

Les fonctions Catena Pro sont exercées par la même suite de répétitions; les comptes proviennent du même manifeste.

### Attestation de conformité mensuelle signée (1 répétition)

Un rapport mensuel signé cryptographiquement (disponibilité, sauvegardes, test de restauration, correctifs, posture d'identité, événements d'audit) présentable à un assureur ou un auditeur, vérifiable contre toute altération.

### Journal d'audit centralisé infalsifiable (1 répétition)

Chaque action administrative sur le serveur est aussi expédiée hors de la machine vers un stockage d'audit central : la trace survit même si le serveur est perdu ou altéré.

### Copie de sauvegarde hors site immuable (6 répétitions)

Une seconde copie de sauvegarde chez un fournisseur différent, verrouillée en écriture pour qu'un serveur compromis ne puisse ni la modifier ni l'effacer, avec vérification récurrente que les deux copies se restaurent réellement.

### Analyse de vulnérabilités (1 répétition)

Analyses récurrentes des logiciels installés et de leurs conteneurs pour vulnérabilités connues, avec résultats versés aux rapports d'entretien et d'attestation.

### Entretien quotidien automatisé (14 répétitions)

Une routine quotidienne supervisée sur le serveur : sauvegardes horaires, contrôles de paquets et de santé, et une chaîne d'entretien ordonnée qui reprend sans danger après interruption.

### Opérations de cycle de vie gérées (migration, retrait) (répétée comme opération gérée)

Migration complète de serveur entre fournisseurs, retrait ordonné avec remise des données, et pause/arrêt de flotte -- exécutés pour le client comme opérations gérées et répétés régulièrement.

### Activation des fonctions sous licence (4 répétitions)

Les fonctions Pro s'activent par une licence signée cryptographiquement et se désactivent proprement à son échéance; la base Community continue de fonctionner dans les deux cas.

### Surveillance de la posture d'identité (1 répétition)

Contrôles récurrents de la santé des comptes : authentification multifacteur imposée, modèle de groupes convenu et aucun compte administrateur inattendu -- toute dérive lève une alerte.

### Mises à jour gérées avec retour arrière automatique (9 répétitions)

Les applications et composants système se mettent à jour selon un calendrier géré; une mise à jour ratée est détectée et ramenée à la dernière version fonctionnelle sans intervention.

### Supervision externe de la disponibilité (1 répétition)

Supervision indépendante depuis l'extérieur du serveur, avec interrupteur homme-mort : le silence lui-même déclenche une alerte, un serveur qui s'éteint ne passe pas inaperçu.

### Domaines multiples, chacun avec sa propre connexion privée (1 répétition)

Sur les forfaits payants, un même serveur peut héberger plusieurs domaines distincts et non liés, chacun avec sa propre connexion privée, de sorte que les personnes utilisant un domaine ne voient jamais la connexion d'un autre domaine. Les tableaux de bord partagés restent sur le premier domaine (principal).

### Archivage courriel et fichiers par utilisateur (3 répétitions)

Archives planifiées en ajout seul du courriel, des calendriers, des contacts et des fichiers de chaque utilisateur, conservées sur le serveur et couvertes par les sauvegardes régulières.

Le détail technique complet (chemins d'implémentation et noms de scénarios pour l'édition Community) se trouve dans la [fiche de validation publique sur GitHub](https://github.com/catenahq/catena-ce/blob/main/VALIDATION.md).
