---
title: "Vue d'ensemble de la configuration"
description: "Où se trouve la page Paramètres, comment fonctionne un enregistrement et dans quel ordre un nouveau serveur se configure."
---

Un serveur fraîchement installé ne demande que la façon de l'atteindre. Vous réglez ensuite le domaine, Cloudflare, les sauvegardes, le courriel, le réseau privé et le reste dans le panneau d'administration, sur la page **Paramètres**.

## Où se trouve Paramètres

**Paramètres** figure dans le menu de gauche du panneau d'administration et n'est visible que pour les administrateurs. Vous ouvrez le panneau à l'adresse :

- `https://dash.yourdomain.com` une fois que vous avez appliqué un domaine;
- `http://localhost:9010` avant cela, par le transfert de port SSH que l'installateur garde ouvert (ou rouvre avec `uvx catena-installer connect --inventory <nom>`). Sans l'installateur, le transfert se fait ainsi :

```bash
ssh -N -L 9010:127.0.0.1:9010 -L 9000:127.0.0.1:9000 panel@<adresse-du-serveur>
```

Connectez-vous avec le courriel de l'administrateur et le mot de passe administrateur affiché une seule fois à l'installation. Voir [Installation](/fr/installation/).

## Comment fonctionne un enregistrement

- **Paramètres** n'affiche qu'une section à la fois. Choisissez-la dans la carte **Sur cette page**, à droite de la page (une liste au-dessus de la section sur un écran étroit).
- Une section dont l'étiquette est **En attente**, **Non vérifié** ou **Échec** porte en haut un court indice qui dit la prochaine action. Le bouton de fermeture, à son extrémité, le cache dans ce navigateur; il réapparaît si l'état de la section change.
- La page vérifie d'elle-même les valeurs enregistrées à son ouverture, pour chaque section utilisée dont les valeurs actuelles n'ont aucune vérification réussie au dossier. **Domaine** lit les domaines que le jeton Cloudflare atteint, **Dépôt de sauvegarde** en liste le contenu, et **Courriel sortant** ouvre une session sans rien envoyer. L'étiquette indique **Vérification** jusqu'à la réponse, puis **Appliqué**, ou **Échec** avec la raison dans son infobulle. Un serveur qui ne répond pas la laisse **Non vérifié**. Une vérification réussie vaut tant que les valeurs ne changent pas : les visites suivantes relisent la réponse, et enregistrer de nouvelles valeurs demande une nouvelle vérification.
- **Tunnel d'accès administrateur** et **Alertes et signalement des tâches manquées** ne sont vérifiés que par leurs boutons **Tester**, car leur vérification crée une clé de courte durée chez le fournisseur ou appelle le moniteur externe. Tant que le bouton n'a pas été utilisé, leur étiquette est le **Non vérifié** gris. Une section indique **En attente** seulement pour un changement qui lui est propre et que le serveur n'a pas encore appliqué. **Trousse de reprise après sinistre** indique **À faire** tant que vous n'avez pas affiché ses clés une fois. Une section que seule une exécution de la configuration du serveur applique (Sous-domaines des applications d'infrastructure, Exigences de connexion, Fuseau horaire et paramètres régionaux) indique **En attente** depuis son enregistrement jusqu'à ce qu'une exécution lancée après l'enregistrement l'ait appliquée, puis **Appliqué**; une exécution lancée pour une autre section ne la garde pas **En attente**.
- Une section qui ne contient rien indique **Par défaut** en gris quand elle a une valeur par défaut, et **Non défini** en gris sinon. Une section que la vérification du serveur lui-même a jugée en **Échec** après une exécution le dit dans son indice, qui renvoie à **Configuration du serveur** pour l'étape et son journal. Quand cette vérification ne juge aucune section en particulier, toutes les sections enregistrées depuis la dernière bonne exécution indiquent **Échec**.
- Une section qui fait partie de Catena Pro ou de Catena Business (**Alertes et signalement des tâches manquées**, **Vulnérabilités**, **Copies hors site**) porte un badge **Pro** ou **Business** à côté de son nom, dans la carte et dans la section. Le badge est gris tant que l'abonnement n'inclut pas la section, et le sélectionner ouvre la page qui explique l'édition; il devient vert dès que l'abonnement inclut la section, qui affiche alors aussi son badge de vérification lorsqu'elle est utilisée.
- Chaque section de **Paramètres** est un formulaire distinct, avec son propre bouton. Enregistrer une section ne touche jamais une autre.
- La réponse à un bouton s'affiche juste sous ce bouton, et la page reste là où vous êtes. Une bannière en haut de la page y renvoie lorsqu'elle ne doit pas passer inaperçue : un secret affiché une seule fois (le mot de passe de sauvegarde, les clés de reprise après sinistre), un enregistrement refusé qui laisse une étape de configuration à faire (domaine, dépôt et mot de passe de sauvegarde, courriel sortant), et une action qui rend le serveur ou le panneau indisponible un moment (une mise à jour du panneau, un redémarrage, une mise à jour de la configuration, une restauration).
- Chaque valeur est stockée sur le serveur et fait partie de chaque sauvegarde.
- Un champ laissé vide conserve la valeur stockée. Saisir une valeur la remplace. Un secret déjà stocké porte l'étiquette **défini** et n'est jamais réaffiché; les champs obligatoires portent l'étiquette **requis**.
- Une valeur que la section ne peut pas accepter est refusée en bloc : "Rien n'a été enregistré. Corrigez les champs signalés ci-dessous."
- Les sections qui se terminent par **Enregistrer et appliquer** (Sous-domaines des applications d'infrastructure, Courriel sortant, Alertes et signalement des tâches manquées, Exigences de connexion, Fuseau horaire et paramètres régionaux) appliquent aussitôt les paramètres enregistrés. La note sous le bouton indique : "L'enregistrement applique ces réglages immédiatement : les services qui les utilisent redémarrent et sont brièvement indisponibles." Le déroulement s'affiche dans la section enregistrée.
- Les autres sections ont leur propre action : **Appliquer** pour **Domaine**, la jonction pour **Tunnel d'accès administrateur**, et un simple **Enregistrer** pour le reste. Les valeurs de sauvegarde sont lues par la sauvegarde elle-même et n'exigent aucun redémarrage.
- Si le serveur applique déjà ses paramètres, la section l'indique : "Enregistré. Le serveur applique déjà ses paramètres, et appliquera ce changement dès que cette opération sera terminée. Le déroulement s'affiche ci-dessous." Le serveur applique les valeurs enregistrées lors d'une exécution de plus, juste après celle en cours; il n'y a rien à refaire.
- Si l'application ne peut ni démarrer ni être mise en file, la section l'indique : "Enregistré, mais l'application n'a pas démarré, sans doute parce que le serveur applique déjà ses paramètres. Appliquez les paramètres enregistrés dans Configuration du serveur une fois cette opération terminée." Appuyez sur **Appliquer les paramètres enregistrés** une fois l'autre opération terminée pour appliquer les valeurs enregistrées. Voir [Paramètres du serveur](/fr/configuration/server/).

## Ordre de la première configuration

L'ordre ci-dessous évite les impasses : chaque étape s'appuie sur les précédentes. Le domaine, les sauvegardes, l'horaire des sauvegardes et la trousse de reprise après sinistre sont les étapes obligatoires.

1. [Abonnement](/fr/configuration/subscription/), si vous avez acheté une clé Catena Pro ou Catena Business. Enregistrer la clé en premier permet aux étapes suivantes d'utiliser ce qu'elle débloque, comme les horaires plus fréquents et les domaines supplémentaires.
2. [Domaine et Cloudflare](/fr/configuration/domain/) : le jeton d'API Cloudflare, le domaine, puis **Appliquer**. Tant que vous ne l'avez pas faite, le serveur fonctionne sans adresses publiques.
3. [Sauvegardes et stockage S3](/fr/configuration/backups/) : le dépôt et ses clés, puis **Générer le mot de passe de chiffrement des sauvegardes**, puis la trousse de reprise après sinistre à conserver dans un gestionnaire de mots de passe.
4. [Horaires](/fr/configuration/schedules/) : l'activation de l'horaire de sauvegarde, au plus une fois par semaine dans toutes les éditions, et les autres horaires, dont l'entretien (Catena Pro ou Catena Business).
5. [Courriel sortant](/fr/configuration/email/) : le service de courriel utilisé pour les réinitialisations de mot de passe, les invitations et les alertes.
6. [Accès administrateur et réseau privé](/fr/configuration/admin-access/) : le réseau privé, puis éventuellement **Fermer le SSH sur le port public 22**.
7. [Alertes](/fr/configuration/alerts/) : l'adresse du signal de vie hors site et les canaux de notification.
8. [Connexion et personnes](/fr/configuration/sign-in-and-people/) : l'exigence du deuxième facteur et les comptes.
9. [Paramètres du serveur](/fr/configuration/server/) : fuseau horaire, paramètres régionaux et application manuelle des paramètres enregistrés.

## Autres pages de configuration

- [Mises à jour](/fr/configuration/updates/) : la version du panneau de contrôle et la mise à jour des applications.
- [Vulnérabilités](/fr/configuration/vulnerabilities/) : les alertes de sécurité que toutes les éditions reçoivent, ce qui est analysé et comment les constats s'affichent.
- [Restauration et migration](/fr/configuration/restore-and-migrate/) : restaurer depuis une sauvegarde et migrer vers un autre serveur.
- [Configurer une application pour Catena](/fr/configure-apps/) : raccorder une application à la connexion et au tableau de bord.

## Panneaux payants

Certains panneaux hors de **Paramètres** exigent Catena Pro ou Catena Business. Un panneau que l'abonnement ne comprend pas est grisé dans le menu et ouvre une courte explication. Les éditions sont comparées sur [catena.run](https://catena.run/fr/#pricing).
