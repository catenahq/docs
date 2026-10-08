---
title: "Installation"
description: "Installation de Catena sur un serveur neuf depuis Windows, macOS ou Linux, première connexion et messages de l'installateur qui demandent une intervention."
---

Catena s'installe depuis l'ordinateur de l'administrateur, avec un petit outil, `catena-installer`, qui joint le serveur en SSH. L'installateur demande seulement comment joindre le serveur et le courriel de l'administrateur. Le domaine, Cloudflare, les sauvegardes, le courriel sortant et le réseau privé se règlent ensuite dans le panneau (voir la [Vue d'ensemble de la configuration](/fr/configuration/)).

## Prérequis

### Serveur

| Élément | Exigence |
|---|---|
| Serveur | Un serveur neuf (VPS ou dédié) sous la version stable courante de Debian. Les autres distributions, Ubuntu comprise, sont refusées. |
| Architecture | x86_64 (amd64) seulement. |
| Réseau | Une adresse IPv4 publique et un accès Internet sortant (le serveur télécharge Catena, les paquets Debian et le moteur de conteneurs en HTTPS). |
| Accès | SSH, avec une clé ou avec le mot de passe de l'hébergeur pour la première connexion. Un utilisateur initial autre que root (`debian`, `ubuntu`, ...) doit pouvoir utiliser sudo sans mot de passe. |
| Mémoire | 4 Go au minimum. 6 Go recommandés pour des applications légères et peu d'utilisateurs. 8 Go pour des applications plus lourdes comme Nextcloud et ERPNext avec beaucoup d'utilisateurs. Les services propres à Catena en occupent environ 2 Go. |
| Disque | Aucun minimum fixe. Les données des applications et l'espace que les sauvegardes utilisent pendant leur préparation croissent avec la quantité de données : le disque se dimensionne selon les données, avec une marge confortable. Une exécution de la configuration refuse un disque rempli à 90 % ou plus. |

### Ordinateur de l'administrateur

- Windows, macOS ou Linux.
- **uv**, qui exécute l'installateur (section suivante).
- Un client OpenSSH, qui fournit `ssh` et `ssh-keygen`. `ssh-keygen` sert à créer une paire de clés et à oublier une ancienne clé d'hôte; il est livré avec les versions courantes de Windows, macOS et Linux.
- Une paire de clés SSH sans phrase secrète. L'installateur se connecte sans surveillance et refuse une clé protégée par une phrase secrète. Il peut créer la paire (par défaut `~/.ssh/catena_ed25519`).

### Comptes nécessaires plus tard, dans le panneau

Aucun n'est nécessaire au moment de l'installation.

- Un compte Cloudflare et un domaine : [Domaine et Cloudflare](/fr/configuration/domain/).
- Un espace de stockage compatible S3 pour les sauvegardes : [Sauvegardes et stockage S3](/fr/configuration/backups/).
- Facultatif, Tailscale ou Headscale pour un réseau d'administration privé : [Accès administrateur et réseau privé](/fr/configuration/admin-access/).
- Un service d'envoi de courriel : [Courriel sortant](/fr/configuration/email/).

## Installer uv

uv s'installe une seule fois par ordinateur d'administration. D'autres options figurent dans la [documentation de uv](https://docs.astral.sh/uv/).

Linux et macOS :

```sh
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Windows (PowerShell) :

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

Il faut ensuite ouvrir une nouvelle fenêtre de terminal pour que `uv` et `uvx` soient trouvés.

## Lancer l'installateur

```sh
uvx catena-installer
```

La commande sert une page sur l'ordinateur de l'administrateur et l'ouvre dans le navigateur, à l'adresse `http://127.0.0.1:8765/`. La page est en français ou en anglais selon la langue du navigateur; la sortie de la console est en anglais seulement. Fermer l'onglet du navigateur ne change rien; fermer la fenêtre du terminal arrête l'installation et la connexion au panneau.

Chaque serveur a un inventaire, un dossier qui contient ses réglages non secrets. L'onglet **Inventaire** liste les inventaires et en crée un (lettres minuscules, chiffres, tirets et traits de soulignement, par exemple `prod`). L'onglet **Installation** demande ensuite :

| Champ | Signification |
|---|---|
| **Adresse IP publique du serveur** | L'adresse IPv4 publique du serveur, telle que fournie par l'hébergeur. |
| **Adresse SSH privée du serveur** | Facultatif. **Installer par une adresse IP privée** remplace l'adresse IP publique pour SSH seulement, par exemple une adresse du tailnet quand le port 22 n'est pas joignable depuis l'adresse IP publique. |
| **Port SSH du serveur** | Le port sur lequel SSH répond, habituellement 22. |
| **Utilisateur initial du serveur** | L'identifiant fourni par l'hébergeur, par exemple `root`, `debian` ou `ubuntu`. |
| **Mot de passe de l'utilisateur initial** | Facultatif. Nécessaire seulement si le serveur n'accepte pas encore la clé SSH : l'installation s'en sert une fois pour ajouter la clé. Il reste en mémoire et n'est jamais écrit sur le disque. |
| **Courriel de l'administrateur** | L'identifiant de connexion du panneau. |
| **Fichier de clé SSH** | La clé privée (son fichier `.pub` doit se trouver à côté). La case **Créer cette paire de clés SSH maintenant** crée une paire absente. |

L'utilisateur initial ne peut plus ouvrir de session SSH une fois Catena installé. Un nouvel utilisateur, `ops`, est créé pour administrer le serveur.

### Vérifications préalables

Le bouton **Vérifier la configuration et lancer l'installation** exécute d'abord des vérifications et n'envoie rien au serveur tant qu'une seule bloque :

- un serveur SSH répond à l'adresse et au port;
- la clé d'hôte correspond à celle déjà connue pour cette adresse;
- la paire de clés existe sur l'ordinateur de l'administrateur;
- la clé ouvre déjà la connexion initiale (ou `ops`), ou le mot de passe de l'hébergeur l'ouvre.

### L'installation

L'installation dure plusieurs minutes, et plusieurs dizaines de minutes sont possibles. Sa sortie s'affiche sur la page. Dans l'ordre, l'installateur se connecte, fait télécharger la version de Catena au serveur et le fait s'installer lui-même, se reconnecte en tant que `ops` avec la clé avant que quoi que ce soit soit fermé, puis vérifie le serveur depuis l'ordinateur de l'administrateur (balayage des ports publics).

Après quelques minutes, la section **Accès au serveur Catena** affiche trois secrets, et les affiche de nouveau à la fin de l'installation :

| Secret | Usage |
|---|---|
| Mot de passe administrateur | Connexion au panneau et à Portainer. |
| Mot de passe de l'utilisateur 'ops' | Fonctionne seulement à la console web de l'hébergeur (KVM ou série) ou sur un clavier physique, jamais par SSH. C'est la voie d'accès quand SSH est indisponible. |
| Clé de vérification du journal | Prouve que le journal des actions administratives du serveur n'a pas été modifié. Affichée une seule fois, à la première installation seulement. |

:::caution
Ces valeurs ne s'affichent qu'une fois et Catena n'en garde aucune autre copie. Elles doivent être sauvegardées dans un gestionnaire de mots de passe avant de fermer la page.
:::

### Mode console

La même installation peut s'exécuter sans la page du navigateur :

```sh
uvx catena-installer init --inventory prod
```

Cette commande écrit l'inventaire et son fichier `.env`, chaque réglage à sa valeur par défaut et expliqué. Une fois le `.env` rempli :

```sh
uvx catena-installer install --inventory prod
```

La console demande le mot de passe de l'hébergeur seulement quand la clé n'ouvre pas déjà la connexion initiale, et pose la question `Was the server reinstalled? [y/N]:` seulement quand une clé d'hôte a changé.

## Première connexion

Le SSH public reste ouvert après l'installation et aucun domaine n'existe encore : le panneau et Portainer sont donc joints par une redirection SSH. La page de l'installateur la garde ouverte tant que sa fenêtre l'est. Elle se rouvre en tout temps avec :

```sh
uvx catena-installer connect --inventory prod
```

Depuis un ordinateur sans l'installateur, la même redirection est :

```sh
ssh -N -L 9010:127.0.0.1:9010 -L 9000:127.0.0.1:9000 panel@<adresse-du-serveur>
```

Le compte `panel` ne peut rien faire d'autre que rediriger ces deux ports. L'adresse du serveur est l'adresse IP publique, ou l'adresse du tailnet une fois le SSH public fermé. Tant que la redirection est ouverte :

| Outil | Adresse | Connexion |
|---|---|---|
| Panneau Catena | `http://localhost:9010` | **Courriel administrateur** et **Mot de passe** : le courriel de l'administrateur saisi à l'installation et le mot de passe administrateur affiché une seule fois. |
| Portainer | `http://localhost:9000` | Nom d'utilisateur `admin` (pas un courriel) et le même mot de passe administrateur. |

Une fois un domaine appliqué, les mêmes outils sont à `https://dash.yourdomain.com` et `https://portainer.yourdomain.com`.

L'étape suivante est la [Vue d'ensemble de la configuration](/fr/configuration/), qui donne l'ordre de réglage du domaine, des sauvegardes, des horaires et du reste dans **Paramètres**.

## Problèmes courants

L'installateur affiche ses messages en anglais dans les deux langues. Les messages sont cités ici tels qu'ils apparaissent (`<...>` représente une valeur).

| Message | Cause | Solution |
|---|---|---|
| `nothing accepted a connection. A server still being delivered is the ordinary reason, and this section is where a run waits for it` | Rien ne répond encore en SSH à cette adresse IP et à ce port. | Attendre que l'hébergeur termine la livraison du serveur, puis vérifier de nouveau. Confirmer l'adresse IP, le port et le pare-feu de l'hébergeur. |
| `nothing answers SSH at <host>:<port>: <err>` | La connexion TCP a échoué (délai de 15 secondes). | Vérifier l'adresse IP, le port SSH et tout pare-feu chez l'hébergeur. |
| `<host> presents another host key than the one this machine trusts for it (trusted: ...; offered: ...). A reinstalled server presents a new key; if this one was not reinstalled, another machine may be answering at this address.` | Le serveur a été reconstruit à la même adresse, ou une autre machine y répond. Rien n'est envoyé à ce serveur. | Si le serveur a été réinstallé : cocher **Ce serveur a été réinstallé : faire confiance à sa nouvelle clé d'hôte** sur la page, ou ajouter `--reinstalled` en mode console. Sinon, s'arrêter et vérifier l'adresse. |
| `the server does not accept this key yet` | La clé n'est pas sur la connexion initiale. | Saisir le mot de passe de l'hébergeur pour l'utilisateur initial : l'installation y ajoute la clé. Autre option : fournir la clé publique à l'hébergeur et vérifier de nouveau. |
| `the password was refused`, ou `<user>@<host> refused the password` | Mot de passe de l'hébergeur incorrect. | Le saisir de nouveau tel que fourni par l'hébergeur. |
| `<user>@<host> refused the key <path>` | Mauvais fichier de clé ou mauvais utilisateur initial. | Vérifier les champs **Fichier de clé SSH** et **Utilisateur initial du serveur**. |
| `<path> or its .pub is missing. Tick the box below to create the pair there, or name a pair this machine has` | La paire de clés n'existe pas. | Cocher **Créer cette paire de clés SSH maintenant**, ou indiquer une paire existante. |
| `... is protected by a passphrase; the installer logs in unattended and needs a key without one` | La clé a une phrase secrète. | Utiliser une clé sans phrase secrète, par exemple une nouvelle paire créée par l'installateur. |
| `ssh-keygen is not installed: it ships with OpenSSH` | Aucun client OpenSSH sur l'ordinateur de l'administrateur. | Installer le client OpenSSH du système d'exploitation, ou utiliser une paire de clés créée ailleurs. |
| `this server is not Debian; ...` | Le serveur utilise une autre distribution (Ubuntu comprise). | Réinstaller le serveur avec la version stable courante de Debian. |
| `no catena-admin build for a <machine> machine; pass --platform` | Le serveur n'est pas x86_64 (par exemple arm64). | Commander un serveur x86_64. |
| `run as root` | L'utilisateur initial n'est ni root ni autorisé à utiliser sudo sans mot de passe. | Utiliser `root`, ou un utilisateur avec sudo sans mot de passe. |
| `Disk preflight: <mount> is N% full (X GiB free), at or above the 90% converge ceiling. Free space before re-running -- a converge onto a full disk fails mid-role with no space left on device.` | Le disque est rempli à 90 % ou plus. | Libérer de l'espace ou agrandir le disque, puis relancer l'installation. |
| `fetch-release: <url>: HTTP <code> <reason>` | Le serveur ne joint pas le registre de conteneurs qui publie les versions de Catena. | Vérifier l'accès HTTPS sortant du serveur (pare-feu de l'hébergeur, DNS), puis relancer l'installation. |
| `apt update failed and no APT_PROXY_URL is configured, so there is nothing to bypass. Real apt-get error: ...` | Le miroir de paquets Debian est injoignable depuis le serveur. | Vérifier le réseau et le DNS du serveur, puis relancer l'installation. |
| `catena-installer: SECURITY REGRESSION: <ip> answers on [...], which nothing declares (expected open: [...]). Check ufw, docker's iptables rules and the provider's firewall.` | Un port est ouvert sans être déclaré par Catena, souvent à cause d'une règle chez l'hébergeur. | Fermer ce port dans le pare-feu de l'hébergeur, ou retirer le service qui y écoute. |
| `catena-installer: the panel forward did not open: <problem>` | La redirection SSH vers le panneau n'a pas pu démarrer. | Exécuter `uvx catena-installer connect --inventory prod`. Si un port local est occupé, l'installateur affiche une autre adresse. |
| `refusing to continue: this session did not prove that ops opens with its key` | La seconde connexion n'était pas une connexion de `ops` par clé : rien n'a été fermé. | Relancer l'installation depuis l'installateur. |
| `the passwords could not be shown; running the install again shows them` | Les mots de passe n'ont pas pu s'afficher. | Relancer l'installation (la clé de vérification du journal ne s'affiche qu'à la première installation). |
| `The installation stopped. The output says where.` | L'installation a échoué. | Lire la sortie pour repérer l'étape en cause, corriger, puis relancer l'installation. |

La console se termine avec le code 0 quand l'installation a réussi, 1 quand elle a échoué, 3 quand elle s'est terminée mais qu'une vérification a échoué, et 4 quand le serveur a refusé la seconde connexion.

Un balayage des ports publics signalé comme ignoré (`public port scan SKIPPED`) signifie seulement que l'adresse IP n'est pas routable; ce n'est pas un échec.

## Relancer, mettre à niveau et désinstaller

**Relancer.** Relancer l'installation sur un serveur déjà installé est sans danger. Elle ne demande rien, réapplique tout avec la version que le serveur a enregistrée, valide le serveur et affiche de nouveau les mots de passe (la clé de vérification du journal ne s'affiche qu'une fois). C'est aussi la voie d'accès quand le panneau est indisponible, par exemple après un disque plein.

```sh
uvx catena-installer install --inventory prod
```

**Mettre à niveau.** Une version se choisit avec `--release`. Le serveur passe à cette version, avec le code de cette version, et l'enregistre. Sans `--release`, un serveur installé garde la version enregistrée et un nouveau serveur reçoit la plus récente. C'est la voie à suivre quand la mise à jour du panneau lui-même ne peut pas s'exécuter; autrement, les mises à jour se font dans le panneau.

```sh
uvx catena-installer install --inventory prod --release vX.Y.Z
```

**Après la fermeture du SSH public.** Une fois **Fermer le SSH sur le port public 22** coché dans **Paramètres** > **Tunnel d'accès administrateur**, l'installateur joint le serveur par son adresse du tailnet pour cette exécution :

```sh
uvx catena-installer install --inventory prod --address <ip-du-tailnet>
```

Définir `HOST_SSH_ADDRESS` dans le `.env` de l'inventaire conserve cette adresse.

**Désinstaller.** La commande rend les mises à jour du système d'exploitation à Debian et ne retire rien d'autre :

```sh
uvx catena-installer uninstall --inventory prod
```

Elle démasque les minuteries de mise à jour de Debian, retire les origines de mises à jour automatiques et la politique de redémarrage ajoutées par Catena, et lève le blocage des paquets du moteur de conteneurs. Elle laisse en place, pour un retrait délibéré :

- les applications et leurs données, ainsi que Portainer (retirés depuis Portainer ou avec Docker);
- les comptes créés sur le serveur;
- le tunnel Cloudflare et les enregistrements DNS (supprimés dans le tableau de bord Cloudflare);
- le nœud Tailscale (retiré dans la console d'administration de Tailscale);
- les sauvegardes dans le stockage S3, qui restent jusqu'à la suppression du contenu du seau.
