---
title: "Tableau de bord d'administration"
description: "Le panneau catena-admin : état, applications, actions, restauration, horaires, paramètres et, avec un abonnement, personnes et domaines."
---

Le tableau de bord d'administration est un panneau unique pour l'état, les applications, les sauvegardes, les restaurations, les horaires et les paramètres. Le personnel ne voit que les applications qu'il peut ouvrir; en tant qu'administrateur, vous avez accès à tout. Il est servi à `dash.yourdomain.com` une fois votre domaine appliqué, et par le transfert de port SSH avant cela (voir [Installation](/fr/installation/)). Le panneau existe en français et en anglais, avec des thèmes clair et sombre.

## Fonctionnement

**Onglets selon le rôle.** Les non-administrateurs ne voient que **Applications**, avec des tuiles filtrées selon leurs groupes. Vous avez aussi **Système**, **Actions**, **Restauration**, **Horaires**, **Journal** et **Paramètres**, plus les panneaux payants que votre abonnement débloque.

- **Système.** Jauges de sauvegarde, de disque, de CPU, de RAM et de Healthchecks, alertes actives, état des services de base, commande de redémarrage et commande du moteur Docker. Des tuiles de preuve indiquent si une restauration a été testée, si la copie hors site a été vérifiée, si les sauvegardes passent un contrôle d'intégrité, la santé de l'authentification unique, les ports exposés inattendus, l'état de la surveillance, et les vulnérabilités critiques et élevées des applications en cours.
- **Applications.** Une tuile par application routée déployée dans Portainer, avec un point d'état et des badges comme **admin seulement** ou **public**. En tant qu'administrateur, vous voyez aussi, sur la tuile de chaque application qui se connecte d'elle-même, un badge indiquant si sa connexion est prête, en attente ou en échec, avec la raison quand elle n'est pas prête. Le personnel ne le voit pas. Vous voyez aussi la version que chaque application exécute et, quand une plus récente existe, "Mise à jour disponible" avec cette version; l'onglet **Système** montre la même chose pour les composants du serveur et indique quand les versions ont été vérifiées pour la dernière fois. Voir [Connexion avec les comptes Catena](/fr/configure-apps/#connexion-avec-les-comptes-catena-facultatif).
- **Actions.** Des boutons qui lancent des opérations nommées sur le serveur (sauvegarder maintenant, lister ou parcourir les instantanés, câblage des applications du catalogue, redémarrer le service de tunnel ou Portainer, répartition du disque, synchronisation complète), avec la sortie diffusée dans une console.
- **Restauration, Horaires, Journal, Paramètres.** Restaurer depuis une sauvegarde, régler le moment des tâches planifiées, lire le journal de maintenance et modifier chaque réglage.

**Actions sûres.** Le conteneur du panneau ne modifie jamais le serveur directement. Un bouton envoie une action nommée à l'hôte par SSH, et les noms inconnus sont refusés. Chaque action déclenchée par un bouton est consignée au journal système du serveur.

**Panneaux payants.** Les panneaux que votre abonnement ne débloque pas apparaissent grisés sous **Catena Pro** ou **Catena Business** et ouvrent une explication avec un lien vers la comparaison des éditions. Le panneau reste refusé tant qu'une clé ne le débloque pas.

**Bannières.** Les pages d'administration affichent une bannière quand un redémarrage est en attente, quand aucune sauvegarde n'est configurée ou quand les fonctions payantes sont verrouillées. Les applications et leurs données continuent de fonctionner dans tous les cas.

**Trousse de reprise après sinistre.** Masquée par défaut; le journal consigne le moment où vous l'affichez.

## Ce qu'ajoute chaque édition

Communauté offre Applications, Système, Actions, Restauration, Horaires, Journal et Paramètres. Catena Pro ajoute **Mises à jour gérées**, **Domaines**, **Personnes**, **Migration** et **Rapport de restauration**. Catena Business ajoute **Journal d'audit** et **Rapport de conformité**. Voir la [comparaison des éditions](https://catena.run/fr/#pricing).

## Limites

- Le panneau est une image à code source fermé, publiée publiquement; le retirer ne touche ni à vos applications ni à vos sauvegardes.
- Renommer le sous-domaine du panneau le déplace à une nouvelle adresse; la page s'y ouvre dès que la nouvelle adresse répond.
- Les versions proviennent d'une vérification périodique. Quand elle n'a pas fait rapport récemment, aucune version n'est affichée et l'onglet **Système** le dit. Les résultats des mises à jour figurent dans l'onglet **Journal**.

## Configuration

- [Vue d'ensemble de la configuration](/fr/configuration/)
- [Abonnement](/fr/configuration/subscription/)
- [Paramètres du serveur](/fr/configuration/server/)
- [Configurer une application pour Catena](/fr/configure-apps/)
