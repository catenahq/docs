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
les exports proactifs des clés.

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
| **J'ai supprimé un fichier par accident** (un utilisateur, un fichier/dossier) | Essayez la corbeille de l'application. Si vide, contactez votre opérateur. | Suivez d'abord la corbeille; sinon contactez votre opérateur. |
| **J'ai perdu mon mot de passe ou mon 2FA** (juste moi) | Réinitialisation libre-service ; pour le 2FA, contactez votre opérateur. | Réinitialisation libre-service via le portail; 2FA via votre opérateur. |
| **Tous les administrateurs sont verrouillés en même temps** (email perdu, tableau de bord perdu) | Contactez votre opérateur -- il a un chemin de récupération séparé qui ne dépend ni de l'email ni du tableau de bord. | Chemin opérateur hors-bande (non documenté côté client). |
| **Le VPS entier est chiffré par un rançongiciel** | Contactez votre opérateur immédiatement. La récupération se fait depuis votre dernière sauvegarde saine, antérieure au rançongiciel. | Carte de récupération ci-dessous ("Disque VPS entier") |
| **Le VPS lui-même est compromis par un malware / accès non autorisé** | Contactez votre opérateur. Le chemin est : effacement + restauration depuis un snapshot pré-compromis + rotation de tous les secrets. Votre opérateur s'en charge ; vous recevez une mise à jour à chaque phase. | Carte de récupération ci-dessous ("Disque VPS entier") |
| **Le centre de données du fournisseur VPS brûle** (ou panne matérielle) | Contactez votre opérateur. Il restaure votre infrastructure sur un nouveau VPS chez le même ou un autre fournisseur, depuis le compartiment de sauvegarde hors site. | Carte de récupération ci-dessous ("Disque VPS entier") + [Restaurer sur un nouveau VPS](/fr/self-restore/) |
| **Le fournisseur VPS donne un préavis de 48 h / suspend le compte** | Contactez votre opérateur. Il migre vers un nouveau fournisseur dans un délai serré ; comptez ~30-60 min d'indisponibilité publique pendant la bascule. | Carte de récupération ci-dessous ("Le fournisseur VPS fait faillite") |
| **Le fournisseur de sauvegarde donne un préavis de 48 h** | Contactez votre opérateur. Il re-cible les sauvegardes vers un nouveau compartiment ; les données sur le VPS ne sont pas affectées. | Carte de récupération ci-dessous ("Le fournisseur S3 fait faillite") |
| **Je crois que quelqu'un d'autre a mon mot de passe / mon jeton API** | N'attendez pas -- contactez votre opérateur et faites tourner la clé. | Carte de récupération ci-dessous (lignes par identifiant) |

La carte de récupération ci-dessous contient le tableau complet, y
compris les rotations d'identifiants d'infrastructure (jeton
Cloudflare, compte Tailscale, etc.) -- continuez à lire.

## Le seul bouton dont vous aurez peut-être besoin : "Exporter les clés de récupération"

Sur [actions.yourdomain.com](https://actions.yourdomain.com/),
dans la section **Ops / divers**, il y a un bouton intitulé **"Exporter
les clés de récupération (chiffrées)"** (🔐). Cliquez dessus lorsque :

- Vous avez perdu le mot de passe maître qui déchiffre votre fichier
  de secrets.
- Vous avez encore accès au tableau de bord.

Il vous demandera une phrase de passe (tapez-en une solide -- votre
gestionnaire de mots de passe peut en générer une), reconstituera une
copie chiffrée de tous les secrets récupérables depuis le VPS en
marche, et déposera un fichier sur le serveur que vous pouvez
télécharger avec votre navigateur.

**Pour télécharger le fichier** -- pas besoin de SSH ni de ligne de
commande :

1. Ouvrez [recovery.yourdomain.com](https://recovery.yourdomain.com/) dans
   votre navigateur.
2. Connectez-vous comme administrateur (le même compte qui a cliqué
   sur le bouton ci-dessus). Les membres d'équipe non-administrateurs
   voient une page de refus ici, c'est voulu -- les paquets de
   récupération ne doivent atteindre que les personnes habilitées à
   déclencher une restauration.
3. Cliquez sur le plus récent fichier `secrets-*.yml.gpg` pour
   l'enregistrer sur votre portable. Déchiffrez-le localement avec
   votre phrase de passe :

    ```
    gpg --pinentry-mode loopback -o vault-recovered.yml -d secrets-*.yml.gpg
    ```

Le fichier est inutile sans la phrase de passe -- il peut rester
quelques jours sur le VPS pendant que vous gérez le reste du
rétablissement.

Si votre accès au tableau de bord est lui aussi cassé, votre opérateur
peut faire la même chose à distance en utilisant le même outil par
SSH.

*Le même bouton peut être utilisé avant tout incident, comme étape de
prévention -- voir [Prévention des sinistres](/fr/disaster-prevention/).*

## Ce que le bouton peut et ne peut pas récupérer

Tout ce qui vit dans l'environnement d'un conteneur ou dans un fichier
sur disque est récupérable depuis un serveur en marche : mots de passe
de base de données, clés SSO, identifiants SMTP, mots de passe de
chiffrement des sauvegardes. Cela représente la majorité de ce qu'il
faut pour reconstituer votre fichier de secrets.

Trois identifiants **ne peuvent pas** provenir du serveur -- ils vivent
dans les consoles d'administration d'autres entreprises, pas sur
votre VPS :

- **Client OAuth Tailscale** -- régénérez à
  [login.tailscale.com](https://login.tailscale.com/admin/settings/oauth)
- **Jeton API Cloudflare** -- régénérez à
  [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
- **Clé API Dokploy** -- régénérez dans l'interface Dokploy
  (Paramètres -> Profil -> Clés API)

Le fichier exporté les liste comme des valeurs à remplacer clairement
marquées, pour que vous sachiez qu'il faut les régénérer.

## Carte de récupération -- ce qui casse et quoi faire

| Ce que vous perdez | Ce qui fonctionne encore | Comment récupérer |
|---|---|---|
| **Mot de passe maître (votre portable va bien)** | Tout -- serveur, applis, SSH | Cliquez sur **Exporter les clés de récupération**, sauvegardez le fichier, redémarrez la configuration de votre opérateur avec le nouveau fichier |
| **Mot de passe maître ET vous êtes verrouillé hors du tableau de bord** | Serveur, applis, SSH | Votre opérateur lance le même outil d'export par SSH et vous envoie le fichier |
| **Portable (avec le mot de passe maître)** | Serveur, applis, sauvegardes | Votre opérateur a une copie du mot de passe maître (s'il l'a sauvegardée à la remise) OU cliquez sur le bouton de récupération depuis n'importe quel navigateur |
| **Clé SSH privée** | Serveur, applis, tableau de bord | Votre opérateur ajoute une nouvelle clé publique via sa propre voie d'administration ; s'il est indisponible, voir "Mode secours du fournisseur" plus bas |
| **Accès au tableau de bord (SSO cassé, Keycloak tombé)** | Vos applis (leurs propres logins fonctionnent encore), vos données | L'opérateur se connecte par SSH pour réparer ; au pire, redémarrer le conteneur Keycloak |
| **Données d'une appli (vous avez supprimé quelque chose)** | Tout le reste | Restaurez uniquement les données de cette appli à partir de la sauvegarde de la nuit dernière via la liste des snapshots restic |
| **Disque entier du VPS (corruption, effacement accidentel)** | Les sauvegardes (dans votre compartiment S3) | Suivez [Restaurer sur un nouveau VPS](/fr/self-restore/) chez le même fournisseur |
| **Jeton API Cloudflare (régénéré par accident)** | Votre tunnel continue à tourner. Les applis publiques restent en ligne. **Fonctionnalité seulement**, pas la sauvegarde. | Générez un nouveau jeton API à [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens), puis **contactez votre opérateur** avec celui-ci -- il installe le nouveau jeton et confirme que le tunnel continue de prendre en compte les changements DNS après rotation. Les applis restent joignables pendant que vous attendez. |
| **Jeton de tunnel Cloudflare (régénéré ou fuité)** | Le tunnel existant continue à tourner jusqu'à la prochaine reconnexion de cloudflared, puis tombe. Les applis publiques sont coupées jusqu'à la fin de la rotation. **Fonctionnalité**, pas la sauvegarde. | Plus perturbant que le jeton API : le trafic public s'arrête quand cloudflared ne peut plus s'authentifier. **Contactez votre opérateur immédiatement** pour qu'il génère et installe le remplacement. Trouvez le jeton sous [dash.cloudflare.com](https://dash.cloudflare.com) -> votre zone -> **Zero Trust** -> **Networks** -> **Tunnels** -> cliquez sur votre tunnel -> **Configure** -> afficher/régénérer le jeton. **PAS** dans la page "API Tokens". Comptez 5 à 15 minutes d'arrêt des applis publiques pendant l'installation. |
| **Client OAuth Tailscale (régénéré par accident)** | L'accès du serveur au tailnet continue à fonctionner. Le SSH distant reste actif. | Générez un nouveau client OAuth, puis **contactez votre opérateur** avec les identifiants pour la mise en place. |
| **Clé API Dokploy (régénérée par accident)** | Toutes vos applis continuent à tourner | Générez une nouvelle clé dans l'interface Dokploy, puis **contactez votre opérateur** avec celle-ci. |
| **Compte Cloudflare résilié** | Serveur, applis (en interne), données | Créez un nouveau compte Cloudflare, pointez votre domaine dessus, relancez la configuration de l'opérateur ; vos applis subissent un temps d'arrêt uniquement pendant la propagation DNS |
| **Compte Tailscale résilié** | Serveur, applis, voie publique (Tunnel CF) | Passez à une autre méthode d'accès admin ; Tailscale n'est que la "porte dérobée d'administration", pas une partie du chemin de service public |
| **Votre fournisseur VPS fait faillite / ferme** | Votre compartiment de sauvegarde S3 (entreprise différente) | [Restaurer sur un nouveau VPS](/fr/self-restore/) chez un autre fournisseur à partir de la sauvegarde |
| **Le centre de données de votre fournisseur VPS brûle (OVH Strasbourg 2021)** | Votre compartiment de sauvegarde S3 (région et ville différentes) | Idem -- restaurer sur un nouveau VPS chez le même ou un autre fournisseur, dans une autre région |
| **Votre fournisseur S3 de sauvegarde fait faillite / ferme** | Votre VPS et ses données | Vous avez toujours les données -- copiez votre VPS de production vers un nouveau compartiment S3 *avant* la date butoir du fournisseur. Si vous avez configuré une sauvegarde secondaire (voir [Prévention](/fr/disaster-prevention/)), elle est déjà en sécurité |
| **Compartiment S3 supprimé par accident** | Votre VPS et ses données | Idem -- recréez le compartiment et repointez les sauvegardes. Certains fournisseurs conservent les objets supprimés pendant une période de rétention, ce qui peut vous laisser du temps |
| **Panne simultanée du fournisseur VPS ET du fournisseur S3** | Dernière copie hors site hebdomadaire (si vous en avez configuré une -- voir [Prévention](/fr/disaster-prevention/)) | Restaurer à partir de la copie hors site vers n'importe quel nouveau cloud |
| **Mot de passe maître ET SSH ET serveur mort** | Compartiment S3 de sauvegarde | Vous pouvez toujours déchiffrer le dépôt restic si vous avez sauvegardé le **mot de passe du dépôt restic** ET la **clé d'accès S3 + clé secrète** séparément (voir [Prévention](/fr/disaster-prevention/)) -- restic a besoin des trois pour lire le compartiment -- suivez [Restaurer sur un nouveau VPS](/fr/self-restore/) |
| **Mot de passe maître ET mot de passe restic ET serveur mort** | Votre compartiment S3 existe mais chaque octet est du texte chiffré indéchiffrable | **Perte de données.** C'est pour cela que [Prévention des sinistres](/fr/disaster-prevention/) dit de sauvegarder le mot de passe restic séparément, même du mot de passe maître |

## Mode secours du fournisseur -- quand vous avez perdu SSH

Chaque fournisseur VPS sérieux propose un "mode secours" qui permet
de démarrer une image de secours temporaire avec votre disque monté,
pour que vous puissiez ajouter une nouvelle clé SSH ou récupérer des
fichiers sans réinstaller. Quelques exemples :

- **OVH** : Panneau de configuration -> votre VPS -> **Secours /
  rescue-customer**. Redémarrez en mode secours, montez votre disque,
  ajoutez votre nouvelle clé publique à
  `/home/ops/.ssh/authorized_keys`, redémarrez normalement.
- **Hetzner** : Robot -> système Rescue -> activez et redémarrez.
- **DigitalOcean / Linode / Vultr** : chacun a une console de
  récupération (parfois un terminal web VNC) -- cherchez "Recovery" /
  "Console" dans la barre latérale du fournisseur.

Votre opérateur peut vous guider lors d'un appel vidéo si besoin ; les
étapes sont les mêmes d'un fournisseur à l'autre, seuls les libellés
d'interface changent.

**Le SSH de l'opérateur et la console de secours du fournisseur sont
équivalents pour vous.** Si votre opérateur est joignable, il se
connecte par SSH et corrige le problème. S'il ne l'est pas -- ou si SSH
lui-même est cassé -- la console de secours du fournisseur donne le
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
situation, appelez votre opérateur. Tout l'intérêt du kit de remise +
de cette page est de vous donner toutes les voies possibles, mais
rien ne remplace une seconde paire d'yeux dans un vrai incident.
