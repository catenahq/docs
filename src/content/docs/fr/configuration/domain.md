---
title: "Domaine et Cloudflare"
description: "Relier votre serveur à un domaine Cloudflare : le jeton d'API et ses permissions, l'application du domaine, le renommage des sous-domaines d'infrastructure et le rattachement de domaines supplémentaires."
---

Chaque adresse publique du serveur est un nom sous un même domaine, servi par un tunnel Cloudflare. Tant que vous n'avez appliqué aucun domaine, le serveur fonctionne sans adresses publiques, et vous atteignez le panneau par le transfert de port SSH décrit dans [Installation](/fr/installation/).

## Prérequis

- Un compte Cloudflare, avec votre domaine ajouté à Cloudflare et utilisant les serveurs de noms de Cloudflare (l'offre gratuite suffit).
- Un jeton d'API Cloudflare ayant les permissions ci-dessous.
- Le panneau ouvert sur **Paramètres** > **Domaine**.

## Le jeton d'API

Vous créez le jeton dans le tableau de bord Cloudflare (jetons d'API), et il doit être actif. Le serveur gère le tunnel et les enregistrements DNS avec lui; il lui faut donc, sur la zone visée :

- **Zone:DNS:Edit**
- **Account:Cloudflare Tunnel:Edit**

Le panneau vérifie le jeton auprès de Cloudflare avant de stocker quoi que ce soit : il doit être vérifié comme actif et atteindre au moins un domaine. Un domaine que le jeton n'atteint pas n'est pas proposé.

:::note
Catena Communauté rattache un seul domaine. Un jeton qui atteint plusieurs domaines les liste tous, et vous en choisissez un seul. Limitez le jeton à ce seul domaine pour réduire sa portée au strict nécessaire.
:::

## Appliquer un domaine

1. Ouvrez **Paramètres** > **Domaine**.
2. Collez le jeton dans **Jeton d'API Cloudflare**. Dès que vous le saisissez, les domaines qu'il atteint remplissent la liste. D'ici là, la liste indique "Saisissez un jeton d'API Cloudflare pour afficher ses domaines".
3. Choisissez le domaine dans **Domaine**.
4. Lisez l'avertissement, puis appuyez sur **Appliquer**.

Quand un jeton est déjà stocké, vous pouvez laisser le champ vide : le jeton stocké est utilisé.

L'avertissement indique : "L'application remplace le tunnel Cloudflare de ce serveur par un nouveau : le tunnel actuel est abandonné, et les applications sont indisponibles quelques minutes pendant que le serveur est remis à niveau sous le domaine." L'application stocke le jeton et le domaine, remplace le tunnel, puis exécute une configuration complète du serveur. La section en suit le déroulement : "Application du domaine : le tunnel est remplacé, puis le serveur est remis à niveau sous ce domaine. Les adresses publiques sont injoignables quelques minutes, et cette section en suit le déroulement."

Le même bouton **Appliquer** répare un tunnel compromis ou défaillant : appuyez dessus avec le domaine déjà en usage pour créer un nouveau tunnel et abandonner l'ancien.

### Messages

| Message | Sens |
|---|---|
| "Jeton d'API Cloudflare refusé : ..." | Le jeton n'est pas actif, la liste des domaines n'a pu être obtenue, ou il n'atteint aucun domaine. La raison donnée par Cloudflare suit. |
| "Saisissez d'abord un jeton d'API Cloudflare : les domaines proposés sont ceux qu'il atteint." | Aucun jeton n'est saisi et aucun n'est stocké. |
| "Choisissez un domaine." | Aucun domaine n'est sélectionné. |
| "Le jeton Cloudflare n'atteint pas ce domaine. Choisissez-en un dans la liste." | Le domaine sélectionné ne fait pas partie de ceux que le jeton atteint. |
| "Un nom de domaine, par exemple example.com." | Le domaine n'est pas un nom valide. |

### Le nom de la page de connexion

Après un changement de domaine, le nom affiché sur la page de connexion à `auth.yourdomain.com` suit le nouveau domaine. Si vous avez renommé la page de connexion à la main dans les paramètres du domaine de sécurité de Keycloak, votre nom reste et n'est jamais remplacé. Voir [Connexion et personnes](/fr/configuration/sign-in-and-people/).

## Sous-domaines des applications d'infrastructure

**Paramètres** > **Sous-domaines des applications d'infrastructure** fixe le nom sur lequel répond chacun des services propres au serveur, sous le domaine. Chaque champ affiche le nom en usage.

| Champ | Service | Valeur par défaut | Adresse |
|---|---|---|---|
| **Portainer (gestionnaire d'applications)** | Portainer | `portainer` | `portainer.yourdomain.com` |
| **Keycloak (connexion)** | Keycloak | `auth` | `auth.yourdomain.com` |
| **Catena admin (ce panneau)** | Ce panneau | `dash` | `dash.yourdomain.com` |
| **Gatus (page d'état)** | Gatus | `gatus` | `gatus.yourdomain.com` |
| **Healthchecks (moniteur de tâches planifiées)** | Healthchecks | `healthchecks` | `healthchecks.yourdomain.com` |
| **Beszel (mesures du serveur)** | Beszel | `beszel` | `beszel.yourdomain.com` |

Règles :

- Un seul nom par champ, sans le domaine : `auth`, et non `auth.yourdomain.com`. Sinon le message est "Un seul nom, par exemple auth : le domaine y est ajouté."
- Lettres minuscules, chiffres et traits d'union; pas de trait d'union au début ni à la fin; 63 caractères au plus.
- Un champ vide conserve le nom en usage. Pour revenir à une valeur par défaut, saisissez le nom par défaut.
- La section se termine par **Enregistrer et appliquer** : le serveur est remis à niveau et les services derrière les adresses renommées redémarrent brièvement.

Quand le nom du panneau lui-même change, **Configuration du serveur** affiche "Ce tableau de bord change d'adresse une fois la configuration appliquée. Il s'ouvrira tout seul à la nouvelle adresse dès qu'elle répondra ; d'ici là, l'adresse est :" suivi de l'ancienne adresse. Vos signets vers l'ancienne adresse cessent de fonctionner.

## Domaines supplémentaires

Un serveur sous Catena Pro ou Catena Business peut servir plusieurs domaines non liés. Chacun est un îlot de connexion distinct : les personnes d'un domaine ne voient jamais la connexion d'un autre domaine. Les tableaux de bord partagés restent sur le premier domaine (principal). Les éditions sont comparées sur [catena.run](https://catena.run/fr/#pricing).

1. Dans Cloudflare, créez un jeton avec **Zone:DNS:Edit** limité au seul domaine à rattacher.
2. Ouvrez le panneau **Domaines** dans le menu.
3. Collez le jeton dans **Jeton d'API Cloudflare (un domaine)** et appuyez sur **Rattacher le domaine**.
4. Les changements s'appliquent lors de la prochaine exécution de configuration : appuyez sur **Remettre ce serveur à niveau** dans [Paramètres du serveur](/fr/configuration/server/).

Le jeton doit atteindre exactement un domaine, celui qui est rattaché. Le tableau liste chaque domaine avec son rôle, Principal ou Secondaire. Un domaine principal ne peut pas être retiré tant que des domaines secondaires existent ("retirez d'abord les autres"); chaque autre ligne a un bouton **Retirer**. Quand un abonnement prend fin, les domaines secondaires restent enregistrés mais ne sont plus servis. Voir [Abonnement](/fr/configuration/subscription/).

## Dépannage

- "Jeton d'API Cloudflare refusé" : confirmez dans Cloudflare que le jeton est actif et qu'il a été créé avec les permissions ci-dessus, sur le bon compte.
- Le domaine manque dans la liste : le jeton ne l'atteint pas. Créez le jeton sur la zone, ou ajoutez la zone au jeton.
- Les adresses publiques restent injoignables bien au-delà de quelques minutes : ouvrez **Configuration du serveur** dans **Paramètres** et lisez le journal de la dernière tentative. Relancer **Appliquer** est sans danger.
