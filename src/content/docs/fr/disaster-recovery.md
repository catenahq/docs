---
title: "Se remettre d'une panne"
description: "Quelque chose est déjà cassé et demande réparation. Cette page est"
---

Quelque chose est déjà cassé et demande réparation. Cette page est
la carte "ce qui peut tourner mal" + "ce qui fonctionne encore
quand ça arrive" + "comment s'en sortir dans chaque situation". Lue
**avant** un incident, la page compagne est
[Tâches récurrentes](/fr/disaster-prevention/) -- c'est là que
vivent les sauvegardes hors portable, le compartiment hors site et
le jeu de clés de récupération.

Version courte : l'infrastructure est conçue pour qu'**aucun clic
accidentel ne puisse à lui seul mettre qui que ce soit à la porte**.
Il faut un concours de circonstances pour vraiment perdre l'accès, et
chaque scénario a son chemin de récupération.

## Scénarios de perte de données -- FAQ rapide

Pour aller droit à la situation qui correspond, voici l'index. Chaque
entrée renvoie à la page ou la section qui détaille la récupération.

| Situation | Premier réflexe | Où en lire plus |
|---|---|---|
| **Un fichier a été supprimé par accident** (un utilisateur, un fichier/dossier) | Essayer la corbeille de l'application. Si vide, parcourir un instantané de sauvegarde dans catena-admin (**Actions -> Browse past snapshots**) et en sortir le fichier. | Carte de récupération ("données d'une appli") |
| **Les données d'une application sont mauvaises** (mise à jour ratée, suppression massive, base de données dans un état que personne ne veut) | Le serveur va bien : remettre les données en place plutôt que de reconstruire, en choisissant une sauvegarde sur la page **Restauration** du panneau d'administration. | [Restaurer les données depuis le panneau d'administration](/fr/restore-data/) |
| **Un mot de passe ou un 2FA est perdu** (une personne) | Réinitialisation libre-service depuis la page de connexion. Pour le 2FA, un autre administrateur le réinitialise dans Keycloak. | [Gérer les utilisateurs et les rôles](/fr/manage-users-and-roles/) |
| **Tous les administrateurs sont verrouillés en même temps** (connexion cassée, personne ne peut ouvrir le tableau de bord) | L'accès Tailscale est la voie d'entrée -- se connecter en SSH à la machine et redémarrer ou reprovisionner le service de connexion. | [Reprendre l'accès administrateur](#reprendre-laccès-administrateur) plus bas |
| **Le serveur entier est chiffré par un rançongiciel** | Reconstruire depuis le dernier instantané sain (avant le rançongiciel), avec `catena recover` sur une machine neuve. | Carte de récupération ("disque serveur entier") |
| **Le serveur lui-même est compromis** | Effacer et reconstruire depuis un instantané pré-compromission (`catena recover --snapshot <id>`), puis faire tourner tous les identifiants externes. | Carte de récupération ("disque serveur entier") |
| **Le centre de données du fournisseur brûle** (ou panne matérielle) | Reconstruire sur un serveur neuf chez n'importe quel fournisseur depuis la sauvegarde hors site (`catena recover`). | [Reconstruire un serveur à partir de la sauvegarde](/fr/self-restore/) |
| **Le fournisseur donne un préavis de 48 h / suspend le compte** | Louer un VPS ailleurs et `catena recover` dessus ; compter ~30-60 min d'indisponibilité publique pendant la bascule. | Carte de récupération ("le fournisseur fait faillite") |
| **Le fournisseur de sauvegarde donne un préavis de 48 h** | Pointer les sauvegardes vers un nouveau compartiment dans catena-admin **Settings** ; les données du serveur ne sont pas affectées. | Carte de récupération ("le fournisseur de sauvegarde fait faillite") |
| **Un mot de passe ou un jeton API a peut-être fuité** | Ne pas attendre -- faire tourner l'identifiant dans sa console maintenant (et `catena rotate-tunnel` / `catena rotate-tailscale` pour ces deux-là). | Carte de récupération (lignes par identifiant) |

La carte de récupération ci-dessous contient le tableau complet, y
compris les rotations d'identifiants d'infrastructure (jeton
Cloudflare, compte Tailscale, et les autres) -- la lecture continue
plus bas.

## Si le serveur entier est perdu

Quand le serveur lui-même a disparu -- détruit, effacé ou chiffré par
un rançongiciel -- il est reconstruit à partir de la dernière
sauvegarde. La seule chose qui doit avoir été conservée est le
**jeu de clés de récupération** :

- l'**emplacement du dépôt de sauvegarde** (là où vivent les
  sauvegardes),
- les **clés de stockage** de ce compartiment, et
- le **mot de passe de chiffrement de la sauvegarde**.

[Tâches récurrentes](/fr/disaster-prevention/) explique comment
conserver ces trois éléments en sécurité. Tout le reste -- chaque
réglage interne et chaque secret qu'utilisent les applications -- se
trouve dans la sauvegarde chiffrée et revient automatiquement avec les
données ; il n'y a rien à ressaisir. La page
[Reconstruire un serveur à partir de la sauvegarde](/fr/self-restore/)
détaille à quoi ressemble une reconstruction.

La reconstruction part de `catena recover` : il demande le jeu de
clés, restaure le dernier instantané sur la nouvelle machine, et
ramène chaque application avec ses données et ses réglages. Le seul
travail en amont est de garder le jeu de clés en sécurité.

Quelques identifiants ne vivent pas du tout sur le serveur -- ils
se trouvent dans les consoles d'administration d'autres entreprises :
Cloudflare (DNS + tunnel), Tailscale (accès à distance) et Portainer
(gestion des conteneurs). Si l'un d'eux est un jour perdu, il se
régénère dans la console de ce fournisseur et se réinstalle
(`catena rotate-tunnel` / `catena rotate-tailscale`, ou en relançant
l'installation). La carte de récupération ci-dessous liste chacun.

## Carte de récupération -- ce qui casse et quoi faire

| Ce qui est perdu | Ce qui fonctionne encore | Comment récupérer |
|---|---|---|
| **Le portable** (l'appareil depuis lequel le travail se fait) | Serveur, applis, sauvegardes | Rien n'est perdu tant que le jeu de clés de récupération est enregistré dans un gestionnaire de mots de passe, et pas seulement sur le portable. Configurer un nouvel appareil, restaurer le jeu de clés et poursuivre |
| **Clé SSH privée** | Serveur, applis, tableau de bord | Démarrer le **Mode secours du fournisseur** (plus bas), monter le disque et ajouter une nouvelle clé publique au compte `ops` ; relancer ensuite l'installation pour que ça tienne |
| **Accès au tableau de bord (connexion cassée, service de connexion tombé)** | Les applis (leurs propres logins fonctionnent encore), les données | Se connecter en SSH via Tailscale et redémarrer le service de connexion, ou le reprovisionner avec `catena converge`. Voir [Reprendre l'accès administrateur](#reprendre-laccès-administrateur) |
| **Données d'une appli (quelque chose a été supprimé)** | Tout le reste | Essayer d'abord la corbeille de l'appli ; si vide, ouvrir catena-admin **Actions -> Browse past snapshots**, choisir un point dans le temps, et copier le fichier depuis le montage en lecture seule |
| **Disque entier du serveur (corruption, effacement accidentel)** | Les sauvegardes (dans le compartiment de stockage) | Reconstruire à partir de la sauvegarde avec `catena recover` -- voir [Reconstruire un serveur à partir de la sauvegarde](/fr/self-restore/) |
| **Jeton API Cloudflare (régénéré par accident)** | Le tunnel continue à tourner. Les applis publiques restent en ligne. **Fonctionnalité seulement**, pas la sauvegarde. | Générer un nouveau jeton API à [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) et le renseigner dans catena-admin **Settings**. Les applis restent joignables tout du long |
| **Jeton de tunnel Cloudflare (régénéré ou fuité)** | Le tunnel existant continue à tourner jusqu'à la prochaine reconnexion, puis tombe. Les applis publiques sont coupées jusqu'à la fin de la rotation. **Fonctionnalité**, pas la sauvegarde. | Lancer `catena rotate-tunnel` -- il génère un nouveau tunnel et l'installe. (Le jeton lui-même est sous [dash.cloudflare.com](https://dash.cloudflare.com) -> la zone -> **Zero Trust** -> **Networks** -> **Tunnels** -> le tunnel -> **Configure**, PAS la page "API Tokens".) Compter 5 à 15 minutes d'arrêt des applis publiques pendant l'échange |
| **Client OAuth Tailscale (régénéré par accident)** | L'accès à distance du serveur continue à fonctionner. L'administration à distance reste active | Générer un nouveau client OAuth dans la console Tailscale, puis `catena rotate-tailscale` pour réauthentifier le noeud |
| **Clé API Portainer (régénérée par accident)** | Toutes les applis continuent à tourner | Générer une nouvelle clé dans l'interface Portainer et la renseigner dans catena-admin **Settings** (ou relancer l'installation pour que les services la reprennent) |
| **Compte Cloudflare résilié** | Serveur, applis (en interne), données | Créer un nouveau compte Cloudflare, y pointer le domaine, et relancer l'installation dessus ; les applis ne sont indisponibles que pendant la propagation DNS |
| **Compte Tailscale résilié** | Serveur, applis, voie publique (le tunnel) | Tailscale n'est que la voie d'administration, pas le chemin de service public. Rejoindre le noeud depuis un nouveau tailnet (`catena rotate-tailscale`), ou atteindre la machine via le **Mode secours du fournisseur** |
| **Le fournisseur VPS fait faillite / ferme** | Le compartiment de sauvegarde (entreprise différente) | [Reconstruire à partir de la sauvegarde](/fr/self-restore/) (`catena recover`) chez un autre fournisseur |
| **Le centre de données du fournisseur brûle (OVH Strasbourg 2021)** | Le compartiment de sauvegarde (région et ville différentes) | Idem -- `catena recover` sur un serveur neuf chez un autre fournisseur ou une autre région |
| **Le fournisseur de sauvegarde fait faillite / ferme** | Le serveur et ses données | Les données sont toujours là -- pointer les sauvegardes vers un nouveau compartiment dans catena-admin **Settings** *avant* la date butoir du fournisseur. Avec une sauvegarde secondaire déjà configurée (voir [Tâches récurrentes](/fr/disaster-prevention/)), elle est déjà en sécurité |
| **Compartiment de sauvegarde supprimé par accident** | Le serveur et ses données | Idem -- recréer le compartiment et repointer les sauvegardes dans catena-admin **Settings**. Certains fournisseurs conservent les objets supprimés pendant une période de rétention, ce qui peut laisser du temps |
| **Panne simultanée du fournisseur ET du fournisseur de sauvegarde** | Dernière copie hors site hebdomadaire (là où une a été configurée -- voir [Tâches récurrentes](/fr/disaster-prevention/)) | `catena recover` à partir de la copie hors site sur n'importe quel nouveau nuage |
| **Le serveur est mort ET les identifiants enregistrés sont perdus** | Le compartiment de sauvegarde | Tant que le jeu de clés de récupération (emplacement du dépôt + clés de stockage + mot de passe de chiffrement) est dans un gestionnaire de mots de passe, la sauvegarde peut encore être lue et le serveur reconstruit -- `catena recover`, voir [Reconstruire un serveur à partir de la sauvegarde](/fr/self-restore/) |
| **Le serveur est mort ET le mot de passe de chiffrement de la sauvegarde est perdu** | Le compartiment existe mais chaque octet est du texte chiffré que rien n'ouvre | **Perte de données.** C'est le seul cas irrécupérable, et précisément pourquoi [Tâches récurrentes](/fr/disaster-prevention/) dit de conserver le mot de passe de chiffrement séparément et en sécurité |

## Reprendre l'accès administrateur

Si la connexion casse pour tout le monde -- Keycloak est tombé, ou tous
les comptes administrateurs sont verrouillés -- les tableaux de bord
web sont injoignables, mais l'**accès Tailscale, lui, ne l'est pas**.
C'est la voie de retour :

1. Depuis une machine sur le tailnet, se connecter en SSH à la
   machine (`ssh ops@<l-ip-tailnet>`).
2. Depuis ce shell : redémarrer le service de connexion (Keycloak),
   réinitialiser l'identifiant administrateur, ou reprovisionner tout
   le realm avec `catena converge` -- ce qui réimporte les
   utilisateurs, les clients et les groupes.
3. Si la base de données de Keycloak est endommagée plutôt que
   simplement capricieuse, `catena restore` la ramène depuis le
   dernier instantané.

Le SSH public est fermé, donc Tailscale est la seule voie distante vers
la machine. C'est exactement pourquoi [Tâches récurrentes](/fr/disaster-prevention/)
demande de garder l'accès Tailscale -- et une copie de la clé SSH --
ailleurs que sur un seul portable. Si Tailscale lui-même est
injoignable, le **Mode secours du fournisseur** ci-dessous est le
repli.

## Mode secours du fournisseur -- quand SSH a disparu

Chaque fournisseur d'hébergement sérieux propose un "mode secours" qui
démarre une image de secours temporaire avec le disque monté, pour
ajouter une nouvelle clé SSH ou récupérer des fichiers sans
réinstaller. Quelques exemples :

- **OVH** : Panneau de configuration -> le serveur -> **Secours /
  rescue-customer**. Redémarrer en mode secours, monter le disque,
  ajouter la nouvelle clé publique à
  `/home/ops/.ssh/authorized_keys`, redémarrer normalement.
- **Hetzner** : Robot -> système Rescue -> activer et redémarrer.
- **DigitalOcean / Linode / Vultr** : chacun a une console de
  récupération (parfois un terminal web VNC) -- chercher "Recovery" /
  "Console" dans la barre latérale du fournisseur.

Les étapes sont les mêmes d'un fournisseur à l'autre, seuls les
libellés d'interface changent.

**Le SSH Tailscale et la console de secours du fournisseur sont deux
voies vers la machine.** Tailscale est la voie normale. Si SSH
lui-même est cassé, ou si Tailscale est tombé, la console de secours
donne le même accès root au disque -- les deux voies ramènent à un
serveur fonctionnel. Celle qui est à portée est la bonne ; attendre
l'une quand l'autre est disponible coûte du temps pour rien.

## Comment ça se passe en pratique

La plupart des situations "X est perdu" sont bien moins graves
qu'elles n'en ont l'air dans les cinq premières minutes. Le site
continue à servir le trafic. La base de données va bien. Il reste
24 à 72 heures pour gérer la récupération sans pression -- tout sauf
le désastre total se traverse un matin de semaine avec un café.

Entre l'accès Tailscale, le jeu de clés de récupération et `catena
recover`, chaque chemin de cette page s'exécute sans nous. Une
deuxième paire d'yeux pendant un incident en direct reste disponible
auprès du contact Catena -- une option, pas une obligation.
