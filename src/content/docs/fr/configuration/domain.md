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

L'avertissement indique : "L'application remplace le tunnel Cloudflare de ce serveur par un nouveau : le tunnel actuel est abandonné, et les applications sont indisponibles quelques minutes pendant que les paramètres enregistrés sont appliqués sous le domaine." L'application stocke le jeton et le domaine, remplace le tunnel, puis applique au serveur les paramètres enregistrés. La section en suit le déroulement : "Application du domaine : le tunnel est remplacé, puis les paramètres enregistrés sont appliqués sous ce domaine. Les adresses publiques sont injoignables quelques minutes, et cette section en suit le déroulement." Son étiquette passe d'elle-même à **Appliqué** à la fin de l'opération, sans rechargement.

Le même bouton **Appliquer** répare un tunnel compromis ou défaillant : appuyez dessus avec le domaine déjà en usage pour créer un nouveau tunnel et abandonner l'ancien.

Pendant qu'une application du domaine s'exécute, un deuxième **Appliquer** n'enregistre rien et la section indique : "Le serveur applique encore le dernier changement, affiché ci-dessous. Rien de nouveau n'a été enregistré." Appuyez de nouveau dessus une fois l'opération terminée.

### Ce qui passe au nouveau domaine

Le panneau et les applications dont le panneau gère l'adresse passent au nouveau domaine. Une application dont l'adresse est intégrée, saisie dans ses propres réglages, reste sous son ancien nom jusqu'à ce que vous la déplaciez.

Le serveur de courriel est de celles-là. Il garde son propre nom jusqu'à ce que vous le déplaciez, et son certificat comme ses enregistrements DNS restent associés à ce nom : son certificat est émis pour lui, et son enregistrement d'adresse (A) ainsi que ses enregistrements MTA-STS et TLS-RPT sont publiés dans les zones de ce nom lorsque le jeton Cloudflare les atteint. Quand le jeton n'atteint pas une zone, Catena conserve le certificat ou les enregistrements existants et signale le nom laissé de côté. Le webmail vérifie le certificat du serveur de courriel d'après ce nom : il continue donc de fonctionner après le changement de domaine.

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
| **Keycloak (connexion)** | Keycloak | `auth` | `auth.yourdomain.com` |
| **Catena admin (ce panneau)** | Ce panneau | `dash` | `dash.yourdomain.com` |

Gatus (`gatus`), Healthchecks (`healthchecks`) et Beszel (`beszel`) sont installés par défaut comme applications : l'adresse de chacun est donc un paramètre de son application. Ouvrez **Applications**, puis la page de l'application avec l'engrenage de sa carte, et changez le nom à cet endroit. Le serveur déplace toutes les adresses de l'application vers le nouveau nom à sa prochaine application de la configuration (**Appliquer les paramètres enregistrés** dans [Paramètres du serveur](/fr/configuration/server/)).

Règles, pour les champs ci-dessus et de même pour le nom d'une application :

- Un seul nom par champ, sans le domaine : `auth`, et non `auth.yourdomain.com`. Sinon le message est "Un seul nom, par exemple auth : le domaine y est ajouté."
- Lettres minuscules, chiffres et traits d'union; pas de trait d'union au début ni à la fin; 63 caractères au plus.
- Un champ vide conserve le nom en usage. Pour revenir à une valeur par défaut, saisissez le nom par défaut.
- La section se termine par **Enregistrer et appliquer** : les paramètres enregistrés sont appliqués et les services derrière les adresses renommées redémarrent brièvement.

Quand le nom du panneau lui-même change, **Configuration du serveur** affiche d'abord "Ce tableau de bord passe à {address} dès que le serveur sert le nouveau domaine. Le lien qui y mène s'affiche ici dès que c'est le cas.", la nouvelle adresse remplaçant `{address}`. Dès que le serveur sert le nouveau domaine, elle affiche "Ce tableau de bord change d'adresse une fois la configuration appliquée. Il s'ouvrira tout seul à la nouvelle adresse dès qu'elle répondra ; d'ici là, l'adresse est :" suivi d'un lien vers la nouvelle adresse, qui s'ouvre dès qu'elle répond. Vos signets vers l'ancienne adresse cessent de fonctionner.

## Domaines supplémentaires

Un serveur sous Catena Pro ou Catena Business peut servir plusieurs domaines non liés. Chacun est un îlot de connexion distinct : les personnes d'un domaine ne voient jamais la connexion d'un autre domaine. Les tableaux de bord partagés restent sur le premier domaine (principal). Les éditions sont comparées sur [catena.run](https://catena.run/fr/#pricing).

1. Dans Cloudflare, créez un jeton avec **Zone:DNS:Edit** limité au seul domaine à rattacher.
2. Ouvrez le panneau **Domaines** dans le menu.
3. Collez le jeton dans **Jeton d'API Cloudflare (un domaine)** et appuyez sur **Rattacher le domaine**.
4. Les changements s'appliquent lors de la prochaine exécution de configuration : appuyez sur **Appliquer les paramètres enregistrés** dans [Paramètres du serveur](/fr/configuration/server/).

Le jeton doit atteindre exactement un domaine, celui qui est rattaché. Le tableau liste chaque domaine avec son rôle, Principal ou Secondaire. Un domaine principal ne peut pas être retiré tant que des domaines secondaires existent ("retirez d'abord les autres"); chaque autre ligne a un bouton **Retirer**. Quand un abonnement prend fin, les domaines secondaires restent enregistrés mais ne sont plus servis. Voir [Abonnement](/fr/configuration/subscription/).

## Dépannage

- "Jeton d'API Cloudflare refusé" : confirmez dans Cloudflare que le jeton est actif et qu'il a été créé avec les permissions ci-dessus, sur le bon compte.
- Le domaine manque dans la liste : le jeton ne l'atteint pas. Créez le jeton sur la zone, ou ajoutez la zone au jeton.
- Les adresses publiques restent injoignables bien au-delà de quelques minutes : ouvrez **Configuration du serveur** dans **Paramètres** et lisez le journal de la dernière tentative. Relancer **Appliquer** est sans danger.
