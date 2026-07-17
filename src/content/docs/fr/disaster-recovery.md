---
title: "Se remettre d'une panne"
description: "Quelque chose est déjà cassé et vous devez le réparer. Cette page est"
---

Quelque chose est déjà cassé et vous devez le réparer. Cette page est
la carte "ce qui peut tourner mal" + "ce qui fonctionne encore
quand ça arrive" + "comment s'en sortir dans chaque situation". Si
vous lisez ceci **avant** un incident, la page compagne est
[Tâches récurrentes](/fr/disaster-prevention/) -- c'est là que
vivent les sauvegardes hors portable, le compartiment hors site et
votre jeu de clés de récupération.

Version courte : votre infrastructure est conçue pour qu'**aucun clic
accidentel ne puisse à lui seul vous mettre à la porte**. Il faut un
concours de circonstances pour vraiment perdre l'accès, et pour chaque
scénario, il existe un chemin de récupération.

## Scénarios de perte de données -- FAQ rapide

Si vous parcourez la page à la recherche de la seule chose qui
correspond à votre situation actuelle, voici l'index. Chaque entrée
renvoie à la page ou la section qui détaille la récupération.

| Situation | Premier réflexe | Où en lire plus |
|---|---|---|
| **J'ai supprimé un fichier par accident** (un utilisateur, un fichier/dossier) | Essayez la corbeille de l'application. Si vide, parcourez un instantané de sauvegarde dans catena-admin (**Actions -> Browse past snapshots**) et sortez-en le fichier. | Carte de récupération ("données d'une appli") |
| **J'ai perdu mon mot de passe ou mon 2FA** (juste moi) | Réinitialisation libre-service depuis la page de connexion. Pour le 2FA, un autre administrateur le réinitialise dans Keycloak. | [Gérer les utilisateurs et les rôles](/fr/manage-users-and-roles/) |
| **Tous les administrateurs sont verrouillés en même temps** (connexion cassée, personne ne peut ouvrir le tableau de bord) | Utilisez votre accès Tailscale -- connectez-vous en SSH à la machine, où vous pouvez redémarrer ou reprovisionner le service de connexion. | [Reprendre l'accès administrateur](#reprendre-laccès-administrateur) plus bas |
| **Le serveur entier est chiffré par un rançongiciel** | Reconstruisez depuis votre dernier instantané sain (avant le rançongiciel), avec `catena recover` sur une machine neuve. | Carte de récupération ("disque serveur entier") |
| **Le serveur lui-même est compromis** | Effacez et reconstruisez depuis un instantané pré-compromission (`catena recover --snapshot <id>`), puis faites tourner tous les identifiants externes. | Carte de récupération ("disque serveur entier") |
| **Le centre de données de votre fournisseur brûle** (ou panne matérielle) | Reconstruisez sur un serveur neuf chez n'importe quel fournisseur depuis la sauvegarde hors site (`catena recover`). | [Reconstruire votre serveur à partir de la sauvegarde](/fr/self-restore/) |
| **Votre fournisseur donne un préavis de 48 h / suspend le compte** | Louez un VPS ailleurs et `catena recover` dessus ; comptez ~30-60 min d'indisponibilité publique pendant la bascule. | Carte de récupération ("votre fournisseur fait faillite") |
| **Le fournisseur de sauvegarde donne un préavis de 48 h** | Pointez les sauvegardes vers un nouveau compartiment dans catena-admin **Settings** ; les données du serveur ne sont pas affectées. | Carte de récupération ("le fournisseur de sauvegarde fait faillite") |
| **Je crois que quelqu'un d'autre a mon mot de passe / mon jeton API** | N'attendez pas -- faites tourner l'identifiant dans sa console maintenant (et `catena rotate-tunnel` / `catena rotate-tailscale` pour ces deux-là). | Carte de récupération (lignes par identifiant) |

La carte de récupération ci-dessous contient le tableau complet, y
compris les rotations d'identifiants d'infrastructure (jeton
Cloudflare, compte Tailscale, etc.) -- continuez à lire.

## Si votre serveur entier est perdu

Quand le serveur lui-même a disparu -- détruit, effacé ou chiffré par
un rançongiciel -- il est reconstruit à partir de votre dernière
sauvegarde. La seule chose que vous devez avoir conservée est votre
**jeu de clés de récupération** :

- l'**emplacement du dépôt de sauvegarde** (là où vivent vos
  sauvegardes),
- les **clés de stockage** de ce compartiment, et
- votre **mot de passe de chiffrement de la sauvegarde**.

[Tâches récurrentes](/fr/disaster-prevention/) explique comment
conserver ces trois éléments en sécurité. Tout le reste -- chaque
réglage interne et chaque secret qu'utilisent vos applications -- se
trouve dans la sauvegarde chiffrée et revient automatiquement avec vos
données ; il n'y a rien à ressaisir. La page
[Reconstruire votre serveur à partir de la sauvegarde](/fr/self-restore/)
détaille à quoi ressemble une reconstruction.

Vous faites la reconstruction vous-même avec `catena recover` : il
demande le jeu de clés, restaure votre dernier instantané sur la
nouvelle machine, et ramène chaque application avec ses données et ses
réglages. Votre seul rôle en amont est de garder le jeu de clés en
sécurité.

Quelques identifiants ne vivent pas du tout sur votre serveur -- ils
se trouvent dans les consoles d'administration d'autres entreprises :
Cloudflare (DNS + tunnel), Tailscale (accès à distance) et Portainer
(gestion des conteneurs). Si l'un d'eux est un jour perdu, vous le
régénérez dans la console de ce fournisseur et le réinstallez
(`catena rotate-tunnel` / `catena rotate-tailscale`, ou en relançant
l'installation). La carte de récupération ci-dessous liste chacun.

## Carte de récupération -- ce qui casse et quoi faire

| Ce que vous perdez | Ce qui fonctionne encore | Comment récupérer |
|---|---|---|
| **Votre portable** (l'appareil depuis lequel vous travaillez) | Serveur, applis, sauvegardes | Rien n'est perdu tant que votre jeu de clés de récupération est enregistré dans votre gestionnaire de mots de passe, et pas seulement sur le portable. Configurez un nouvel appareil, restaurez le jeu de clés et poursuivez |
| **Clé SSH privée** | Serveur, applis, tableau de bord | Démarrez le **Mode secours du fournisseur** (plus bas), montez le disque et ajoutez une nouvelle clé publique au compte `ops` ; relancez ensuite l'installation pour que ça tienne |
| **Accès au tableau de bord (connexion cassée, service de connexion tombé)** | Vos applis (leurs propres logins fonctionnent encore), vos données | Connectez-vous en SSH via Tailscale et redémarrez le service de connexion, ou reprovisionnez-le avec `catena converge`. Voir [Reprendre l'accès administrateur](#reprendre-laccès-administrateur) |
| **Données d'une appli (vous avez supprimé quelque chose)** | Tout le reste | Essayez d'abord la corbeille de l'appli ; si vide, ouvrez catena-admin **Actions -> Browse past snapshots**, choisissez un point dans le temps, et copiez le fichier depuis le montage en lecture seule |
| **Disque entier du serveur (corruption, effacement accidentel)** | Les sauvegardes (dans votre compartiment de stockage) | Reconstruire à partir de votre sauvegarde avec `catena recover` -- voir [Reconstruire votre serveur à partir de la sauvegarde](/fr/self-restore/) |
| **Jeton API Cloudflare (régénéré par accident)** | Votre tunnel continue à tourner. Les applis publiques restent en ligne. **Fonctionnalité seulement**, pas la sauvegarde. | Générez un nouveau jeton API à [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) et renseignez-le dans catena-admin **Settings**. Les applis restent joignables tout du long |
| **Jeton de tunnel Cloudflare (régénéré ou fuité)** | Le tunnel existant continue à tourner jusqu'à la prochaine reconnexion, puis tombe. Les applis publiques sont coupées jusqu'à la fin de la rotation. **Fonctionnalité**, pas la sauvegarde. | Lancez `catena rotate-tunnel` -- il génère un nouveau tunnel et l'installe. (Le jeton lui-même est sous [dash.cloudflare.com](https://dash.cloudflare.com) -> votre zone -> **Zero Trust** -> **Networks** -> **Tunnels** -> votre tunnel -> **Configure**, PAS la page "API Tokens".) Comptez 5 à 15 minutes d'arrêt des applis publiques pendant l'échange |
| **Client OAuth Tailscale (régénéré par accident)** | L'accès à distance du serveur continue à fonctionner. L'administration à distance reste active | Générez un nouveau client OAuth dans la console Tailscale, puis `catena rotate-tailscale` pour réauthentifier le nœud |
| **Clé API Portainer (régénérée par accident)** | Toutes vos applis continuent à tourner | Générez une nouvelle clé dans l'interface Portainer et renseignez-la dans catena-admin **Settings** (ou relancez l'installation pour que les services la reprennent) |
| **Compte Cloudflare résilié** | Serveur, applis (en interne), données | Créez un nouveau compte Cloudflare, pointez votre domaine dessus, et relancez l'installation dessus ; vos applis ne sont indisponibles que pendant la propagation DNS |
| **Compte Tailscale résilié** | Serveur, applis, voie publique (le tunnel) | Tailscale n'est que la voie d'administration, pas le chemin de service public. Rejoignez le nœud depuis un nouveau tailnet (`catena rotate-tailscale`), ou atteignez la machine via le **Mode secours du fournisseur** |
| **Votre fournisseur fait faillite / ferme** | Votre compartiment de sauvegarde (entreprise différente) | [Reconstruire à partir de votre sauvegarde](/fr/self-restore/) (`catena recover`) chez un autre fournisseur |
| **Le centre de données de votre fournisseur brûle (OVH Strasbourg 2021)** | Votre compartiment de sauvegarde (région et ville différentes) | Idem -- `catena recover` sur un serveur neuf chez un autre fournisseur ou une autre région |
| **Votre fournisseur de sauvegarde fait faillite / ferme** | Votre serveur et ses données | Vous avez toujours les données -- pointez les sauvegardes vers un nouveau compartiment dans catena-admin **Settings** *avant* la date butoir du fournisseur. Si vous avez configuré une sauvegarde secondaire (voir [Tâches récurrentes](/fr/disaster-prevention/)), elle est déjà en sécurité |
| **Compartiment de sauvegarde supprimé par accident** | Votre serveur et ses données | Idem -- recréez le compartiment et repointez les sauvegardes dans catena-admin **Settings**. Certains fournisseurs conservent les objets supprimés pendant une période de rétention, ce qui peut vous laisser du temps |
| **Panne simultanée du fournisseur ET du fournisseur de sauvegarde** | Dernière copie hors site hebdomadaire (si vous en avez configuré une -- voir [Tâches récurrentes](/fr/disaster-prevention/)) | `catena recover` à partir de la copie hors site sur n'importe quel nouveau nuage |
| **Votre serveur est mort ET vos identifiants enregistrés sont perdus** | Votre compartiment de sauvegarde | Tant que votre jeu de clés de récupération (emplacement du dépôt + clés de stockage + mot de passe de chiffrement) est dans votre gestionnaire de mots de passe, la sauvegarde peut encore être lue et votre serveur reconstruit -- `catena recover`, voir [Reconstruire votre serveur à partir de la sauvegarde](/fr/self-restore/) |
| **Votre serveur est mort ET votre mot de passe de chiffrement de la sauvegarde est perdu** | Votre compartiment existe mais chaque octet est du texte chiffré indéchiffrable | **Perte de données.** C'est le seul cas irrécupérable, et précisément pourquoi [Tâches récurrentes](/fr/disaster-prevention/) dit de conserver votre mot de passe de chiffrement séparément et en sécurité |

## Reprendre l'accès administrateur

Si la connexion casse pour tout le monde -- Keycloak est tombé, ou tous
les comptes administrateurs sont verrouillés -- les tableaux de bord
web sont injoignables, mais votre **accès Tailscale, lui, ne l'est
pas**. C'est la voie de retour :

1. Depuis une machine sur votre tailnet, connectez-vous en SSH à la
   machine (`ssh ops@<votre-ip-tailnet>`).
2. Depuis ce shell, vous pouvez redémarrer le service de connexion
   (Keycloak), réinitialiser l'identifiant administrateur, ou
   reprovisionner tout le realm avec `catena converge` -- ce qui
   réimporte les utilisateurs, les clients et les groupes.
3. Si la base de données de Keycloak est endommagée plutôt que
   simplement capricieuse, `catena restore` la ramène depuis votre
   dernier instantané.

Le SSH public est fermé, donc Tailscale est la seule voie distante vers
la machine. C'est exactement pourquoi [Tâches récurrentes](/fr/disaster-prevention/)
vous dit de garder votre accès Tailscale -- et une copie de votre clé
SSH -- ailleurs que sur un seul portable. Si Tailscale lui-même est
injoignable, repliez-vous sur le **Mode secours du fournisseur**
ci-dessous.

## Mode secours du fournisseur -- quand vous avez perdu SSH

Chaque fournisseur d'hébergement sérieux propose un "mode secours" qui
permet de démarrer une image de secours temporaire avec votre disque
monté, pour que vous puissiez ajouter une nouvelle clé SSH ou récupérer
des fichiers sans réinstaller. Quelques exemples :

- **OVH** : Panneau de configuration -> votre serveur -> **Secours /
  rescue-customer**. Redémarrez en mode secours, montez votre disque,
  ajoutez votre nouvelle clé publique à
  `/home/ops/.ssh/authorized_keys`, redémarrez normalement.
- **Hetzner** : Robot -> système Rescue -> activez et redémarrez.
- **DigitalOcean / Linode / Vultr** : chacun a une console de
  récupération (parfois un terminal web VNC) -- cherchez "Recovery" /
  "Console" dans la barre latérale du fournisseur.

Les étapes sont les mêmes d'un fournisseur à l'autre, seuls les
libellés d'interface changent.

**Votre SSH Tailscale et la console de secours du fournisseur sont deux
voies vers la machine.** Utilisez Tailscale normalement. Si SSH
lui-même est cassé, ou si Tailscale est tombé, la console de secours
donne le même accès root au disque -- les deux voies vous ramènent à un
serveur fonctionnel. Prenez celle qui est devant vous ; n'attendez pas
l'une quand l'autre est disponible.

## Comment ça se passe en pratique

La plupart des situations "j'ai perdu X" sont bien moins graves
qu'elles n'en ont l'air dans les cinq premières minutes. Le site
continue à servir le trafic. Votre base de données va bien. Vous avez
24 à 72 heures pour gérer la récupération sans pression -- tout sauf
un désastre total est surmontable un mardi matin avec un café.

Entre votre accès Tailscale, le jeu de clés de récupération et
`catena recover`, chaque voie de cette page est une voie que vous
pouvez exécuter vous-même. Vous préférez une seconde paire d'yeux dans
un incident en direct ? Joignez votre contact Catena -- c'est une
option, pas une obligation.
