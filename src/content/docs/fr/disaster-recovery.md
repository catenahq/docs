---
title: "Reprise après sinistre : que faire quand ça tourne mal"
description: "Quelque chose est déjà cassé et vous devez le réparer. Cette page est"
---

Quelque chose est déjà cassé et vous devez le réparer. Cette page est
la carte "ce qui peut tourner mal" + "ce qui fonctionne encore
quand ça arrive" + "comment s'en sortir dans chaque situation". Si
vous lisez ceci **avant** un incident, la page compagne est
[Prévention des sinistres](/fr/disaster-prevention/) -- c'est là que
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
| **J'ai supprimé un fichier par accident** (un utilisateur, un fichier/dossier) | Essayez la corbeille de l'application. Si vide, communiquez avec nous. | Suivez d'abord la corbeille; sinon joignez votre contact Catena. |
| **J'ai perdu mon mot de passe ou mon 2FA** (juste moi) | Réinitialisation libre-service ; pour le 2FA, joignez votre contact Catena. | Réinitialisation libre-service via le portail; 2FA via votre contact Catena. |
| **Tous les administrateurs sont verrouillés en même temps** (email perdu, tableau de bord perdu) | Communiquez avec nous -- il existe un chemin de récupération séparé qui ne dépend ni de l'email ni du tableau de bord. | Chemin hors-bande (non documenté côté client). |
| **Le serveur entier est chiffré par un rançongiciel** | Communiquez avec nous immédiatement. La récupération se fait depuis votre dernière sauvegarde saine, antérieure au rançongiciel. | Carte de récupération ci-dessous ("Disque serveur entier") |
| **Le serveur lui-même est compromis par un malware / accès non autorisé** | Communiquez avec nous. Le chemin est : effacement + reconstruction depuis une sauvegarde pré-compromise + rotation de tous les secrets. Nous nous en chargeons ; vous recevez une mise à jour à chaque phase. | Carte de récupération ci-dessous ("Disque serveur entier") |
| **Le centre de données de votre fournisseur brûle** (ou panne matérielle) | Communiquez avec nous. Nous reconstruisons votre suite logicielle sur un serveur neuf chez le même ou un autre fournisseur, depuis la sauvegarde hors site. | Carte de récupération ci-dessous ("Disque serveur entier") + [Reconstruire votre serveur à partir de la sauvegarde](/fr/self-restore/) |
| **Votre fournisseur donne un préavis de 48 h / suspend le compte** | Communiquez avec nous. Nous migrons vers un nouveau fournisseur dans un délai serré ; comptez ~30-60 min d'indisponibilité publique pendant la bascule. | Carte de récupération ci-dessous ("Votre fournisseur fait faillite") |
| **Le fournisseur de sauvegarde donne un préavis de 48 h** | Communiquez avec nous. Nous re-ciblons les sauvegardes vers un nouveau compartiment ; les données sur le serveur ne sont pas affectées. | Carte de récupération ci-dessous ("Le fournisseur de sauvegarde fait faillite") |
| **Je crois que quelqu'un d'autre a mon mot de passe / mon jeton API** | N'attendez pas -- communiquez avec nous et faites tourner la clé. | Carte de récupération ci-dessous (lignes par identifiant) |

La carte de récupération ci-dessous contient le tableau complet, y
compris les rotations d'identifiants d'infrastructure (jeton
Cloudflare, compte Tailscale, etc.) -- continuez à lire.

## Si votre serveur entier est perdu

Quand le serveur lui-même a disparu -- détruit, effacé ou chiffré par
un rançongiciel -- il est reconstruit à partir de votre sauvegarde
nocturne. La seule chose que vous devez avoir conservée est votre
**jeu de clés de récupération** :

- l'**emplacement du dépôt de sauvegarde** (là où vivent vos
  sauvegardes),
- les **clés de stockage** de ce compartiment, et
- votre **mot de passe de chiffrement de la sauvegarde**.

[Prévention des sinistres](/fr/disaster-prevention/) explique comment
conserver ces trois éléments en sécurité. Tout le reste -- chaque
réglage interne et chaque secret qu'utilisent vos applications -- se
trouve dans la sauvegarde chiffrée et revient automatiquement avec vos
données ; il n'y a rien à ressaisir. La page
[Reconstruire votre serveur à partir de la sauvegarde](/fr/self-restore/)
détaille à quoi ressemble une reconstruction.

Nous faisons la reconstruction avec vous. Votre rôle est d'avoir gardé
le jeu de clés en sécurité et de communiquer avec nous au besoin.

Quelques identifiants ne vivent pas du tout sur votre serveur -- ils
se trouvent dans les consoles d'administration d'autres entreprises :
Cloudflare (DNS + tunnel), Tailscale (accès à distance) et Portainer
(gestion des conteneurs). Si l'un d'eux est un jour perdu, vous le
régénérez dans la console de ce fournisseur et nous l'installons. La
carte de récupération ci-dessous liste chacun.

## Carte de récupération -- ce qui casse et quoi faire

| Ce que vous perdez | Ce qui fonctionne encore | Comment récupérer |
|---|---|---|
| **Votre portable** (l'appareil depuis lequel vous travaillez) | Serveur, applis, sauvegardes | Rien n'est perdu tant que votre jeu de clés de récupération est enregistré dans votre gestionnaire de mots de passe, et pas seulement sur le portable. Configurez un nouvel appareil, restaurez le jeu de clés et poursuivez |
| **Clé SSH privée** | Serveur, applis, tableau de bord | Nous ajoutons une nouvelle clé publique via notre propre voie d'administration ; si nous sommes injoignables, voir "Mode secours du fournisseur" plus bas |
| **Accès au tableau de bord (connexion cassée, service de connexion tombé)** | Vos applis (leurs propres logins fonctionnent encore), vos données | Nous nous connectons pour réparer ; au pire, redémarrer le service de connexion |
| **Données d'une appli (vous avez supprimé quelque chose)** | Tout le reste | Essayez d'abord la corbeille de l'appli ; si vide, communiquez avec nous |
| **Disque entier du serveur (corruption, effacement accidentel)** | Les sauvegardes (dans votre compartiment de stockage) | Reconstruire à partir de votre sauvegarde -- voir [Reconstruire votre serveur à partir de la sauvegarde](/fr/self-restore/) |
| **Jeton API Cloudflare (régénéré par accident)** | Votre tunnel continue à tourner. Les applis publiques restent en ligne. **Fonctionnalité seulement**, pas la sauvegarde. | Générez un nouveau jeton API à [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens), puis **communiquez avec nous** avec celui-ci -- nous installons le nouveau jeton et confirmons que le tunnel continue de prendre en compte les changements DNS après rotation. Les applis restent joignables pendant que vous attendez |
| **Jeton de tunnel Cloudflare (régénéré ou fuité)** | Le tunnel existant continue à tourner jusqu'à la prochaine reconnexion, puis tombe. Les applis publiques sont coupées jusqu'à la fin de la rotation. **Fonctionnalité**, pas la sauvegarde. | Plus perturbant que le jeton API : le trafic public s'arrête quand le tunnel ne peut plus s'authentifier. **Communiquez avec nous immédiatement** pour que nous générions et installions le remplacement. Trouvez le jeton sous [dash.cloudflare.com](https://dash.cloudflare.com) -> votre zone -> **Zero Trust** -> **Networks** -> **Tunnels** -> cliquez sur votre tunnel -> **Configure** -> afficher/régénérer le jeton. **PAS** dans la page "API Tokens". Comptez 5 à 15 minutes d'arrêt des applis publiques pendant l'installation |
| **Client OAuth Tailscale (régénéré par accident)** | L'accès à distance du serveur continue à fonctionner. L'administration à distance reste active | Générez un nouveau client OAuth, puis **communiquez avec nous** avec les identifiants pour l'installation |
| **Clé API Portainer (régénérée par accident)** | Toutes vos applis continuent à tourner | Générez une nouvelle clé dans l'interface Portainer, puis **communiquez avec nous** avec celle-ci |
| **Compte Cloudflare résilié** | Serveur, applis (en interne), données | Créez un nouveau compte Cloudflare, pointez votre domaine dessus, nous relançons la configuration ; vos applis subissent un temps d'arrêt uniquement pendant la propagation DNS |
| **Compte Tailscale résilié** | Serveur, applis, voie publique (le tunnel) | Nous passons à une autre méthode d'administration ; Tailscale n'est que la "porte dérobée d'administration", pas une partie du chemin de service public |
| **Votre fournisseur fait faillite / ferme** | Votre compartiment de sauvegarde (entreprise différente) | [Reconstruire à partir de votre sauvegarde](/fr/self-restore/) chez un autre fournisseur |
| **Le centre de données de votre fournisseur brûle (OVH Strasbourg 2021)** | Votre compartiment de sauvegarde (région et ville différentes) | Idem -- reconstruire sur un serveur neuf chez le même ou un autre fournisseur, dans une autre région |
| **Votre fournisseur de sauvegarde fait faillite / ferme** | Votre serveur et ses données | Vous avez toujours les données -- copiez votre serveur de production vers un nouveau compartiment de sauvegarde *avant* la date butoir du fournisseur. Si vous avez configuré une sauvegarde secondaire (voir [Prévention](/fr/disaster-prevention/)), elle est déjà en sécurité |
| **Compartiment de sauvegarde supprimé par accident** | Votre serveur et ses données | Idem -- recréez le compartiment et repointez les sauvegardes. Certains fournisseurs conservent les objets supprimés pendant une période de rétention, ce qui peut vous laisser du temps |
| **Panne simultanée du fournisseur ET du fournisseur de sauvegarde** | Dernière copie hors site hebdomadaire (si vous en avez configuré une -- voir [Prévention](/fr/disaster-prevention/)) | Reconstruire à partir de la copie hors site sur n'importe quel nouveau nuage |
| **Votre serveur est mort ET vos identifiants enregistrés sont perdus** | Votre compartiment de sauvegarde | Tant que votre jeu de clés de récupération (emplacement du dépôt + clés de stockage + mot de passe de chiffrement) est dans votre gestionnaire de mots de passe, la sauvegarde peut encore être lue et votre serveur reconstruit -- suivez [Reconstruire votre serveur à partir de la sauvegarde](/fr/self-restore/) |
| **Votre serveur est mort ET votre mot de passe de chiffrement de la sauvegarde est perdu** | Votre compartiment existe mais chaque octet est du texte chiffré indéchiffrable | **Perte de données.** C'est le seul cas irrécupérable, et précisément pourquoi [Prévention des sinistres](/fr/disaster-prevention/) dit de conserver votre mot de passe de chiffrement séparément et en sécurité |

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

Nous pouvons vous guider lors d'un appel vidéo si besoin ; les étapes
sont les mêmes d'un fournisseur à l'autre, seuls les libellés
d'interface changent.

**Notre accès à distance et la console de secours du fournisseur sont
équivalents pour vous.** Si nous sommes joignables, nous nous
connectons et corrigeons le problème. Si nous ne le sommes pas -- ou si
SSH lui-même est cassé -- la console de secours du fournisseur donne le
même accès root au disque. Les deux voies vous ramènent à un serveur
fonctionnel ; la console de secours n'est que le repli quand la
voie habituelle est indisponible. Ne perdez pas de temps à attendre
l'une si l'autre est devant vous.

## Comment ça se passe en pratique

La plupart des situations "j'ai perdu X" sont bien moins graves
qu'elles n'en ont l'air dans les cinq premières minutes. Le site
continue à servir le trafic. Votre base de données va bien. Vous avez
24 à 72 heures pour gérer la récupération sans pression -- tout sauf
un désastre total est surmontable un mardi matin avec un café.

Si quelque chose dans la carte ci-dessus ne correspond pas à votre
situation, communiquez avec nous. Tout l'intérêt du kit de remise +
de cette page est de vous donner toutes les voies possibles, mais
rien ne remplace une seconde paire d'yeux dans un vrai incident.
