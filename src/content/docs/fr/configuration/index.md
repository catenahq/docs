---
title: "Vue d'ensemble de la configuration"
description: "Où se trouve la page Paramètres, comment fonctionne un enregistrement et dans quel ordre un nouveau serveur se configure."
---

Un serveur fraîchement installé ne demande que la façon de l'atteindre. Le domaine, Cloudflare, les sauvegardes, le courriel, le réseau privé et le reste se règlent ensuite dans le panneau d'administration, sur la page **Paramètres**.

## Où se trouve Paramètres

**Paramètres** figure dans le menu de gauche du panneau d'administration et n'est visible que pour les administrateurs. Le panneau s'ouvre à l'adresse :

- `https://dash.yourdomain.com` une fois un domaine appliqué;
- `http://localhost:9010` avant cela, par le transfert de port SSH que l'installateur garde ouvert (ou rouvre avec `uvx catena-installer connect --inventory <nom>`). Sans l'installateur, le transfert se fait ainsi :

```bash
ssh -N -L 9010:127.0.0.1:9010 -L 9000:127.0.0.1:9000 panel@<adresse-du-serveur>
```

La connexion utilise le courriel de l'administrateur et le mot de passe administrateur affiché une seule fois à l'installation. Voir [Installation](/fr/installation/).

## Comment fonctionne un enregistrement

- Chaque section de **Paramètres** est un formulaire distinct, avec son propre bouton. Enregistrer une section ne touche jamais une autre.
- Chaque valeur est stockée sur le serveur et fait partie de chaque sauvegarde.
- Un champ laissé vide conserve la valeur stockée. Saisir une valeur la remplace. Un secret déjà stocké porte l'étiquette **défini** et n'est jamais réaffiché; les champs obligatoires portent l'étiquette **requis**.
- Une valeur que la section ne peut pas accepter est refusée en bloc : "Rien n'a été enregistré. Corrigez les champs signalés ci-dessous."
- Les sections qui se terminent par **Enregistrer et appliquer** (Sous-domaines des applications d'infrastructure, Courriel sortant, Alertes et signalement des tâches manquées, Exigences de connexion, Fuseau horaire et paramètres régionaux) remettent le serveur à niveau aussitôt. La note sous le bouton indique : "L'enregistrement applique ces réglages immédiatement : les services qui les utilisent redémarrent et sont brièvement indisponibles." Le déroulement se suit dans **Configuration du serveur**, plus bas sur la page.
- Les autres sections ont leur propre action : **Appliquer** pour **Domaine**, la jonction pour **Tunnel d'accès administrateur**, et un simple **Enregistrer** pour le reste. Les valeurs de sauvegarde sont lues par la sauvegarde elle-même et n'exigent aucun redémarrage.
- Si l'application ne peut pas démarrer, la section l'indique : "Enregistré, mais l'application n'a pas démarré, sans doute parce que le serveur met déjà sa configuration à niveau." Lancer **Remettre ce serveur à niveau** une fois l'autre opération terminée applique les valeurs enregistrées. Voir [Paramètres du serveur](/fr/configuration/server/).

## Ordre de la première configuration

L'ordre ci-dessous évite les impasses : chaque étape s'appuie sur les précédentes.

1. [Abonnement](/fr/configuration/subscription/), si une clé Catena Pro ou Catena Business a été achetée. Enregistrer la clé en premier permet aux étapes suivantes d'utiliser ce qu'elle débloque, comme les horaires et les domaines supplémentaires.
2. [Domaine et Cloudflare](/fr/configuration/domain/) : le jeton d'API Cloudflare, le domaine, puis **Appliquer**. Tant que cette étape n'est pas faite, le serveur fonctionne sans adresses publiques.
3. [Sauvegardes et stockage S3](/fr/configuration/backups/) : le dépôt et ses clés, puis **Générer le mot de passe de chiffrement des sauvegardes**, puis la trousse de reprise après sinistre à conserver dans un gestionnaire de mots de passe.
4. [Horaires](/fr/configuration/schedules/) : l'activation des horaires de sauvegarde et d'entretien (Catena Pro ou Catena Business).
5. [Courriel sortant](/fr/configuration/email/) : le service de courriel utilisé pour les réinitialisations de mot de passe, les invitations et les alertes.
6. [Accès administrateur et réseau privé](/fr/configuration/admin-access/) : le réseau privé, puis éventuellement **Fermer le SSH sur le port public 22**.
7. [Alertes](/fr/configuration/alerts/) : les adresses de surveillance et les canaux de notification.
8. [Connexion et personnes](/fr/configuration/sign-in-and-people/) : l'exigence du deuxième facteur et les comptes.
9. [Paramètres du serveur](/fr/configuration/server/) : fuseau horaire, paramètres régionaux et remise à niveau manuelle.

## Autres pages de configuration

- [Mises à jour](/fr/configuration/updates/) : la version du panneau de contrôle et la mise à jour des applications.
- [Vulnérabilités](/fr/configuration/vulnerabilities/) : ce qui est analysé et comment les constats s'affichent.
- [Restauration et migration](/fr/configuration/restore-and-migrate/) : restaurer depuis une sauvegarde et passer à un autre serveur.
- [Configurer une application pour Catena](/fr/configure-apps/) : raccorder une application à la connexion et au tableau de bord.

## Panneaux payants

Certains panneaux hors de **Paramètres** exigent Catena Pro ou Catena Business. Un panneau que l'abonnement ne comprend pas est grisé dans le menu et ouvre une courte explication. Les éditions sont comparées sur [catena.run](https://catena.run/fr/#pricing).
