---
title: "Accès administrateur et réseau privé"
description: "Le réseau privé facultatif pour administrer le serveur, les identifiants qu'il exige, la fermeture du SSH public, la reconnexion au réseau et la connexion SSH au serveur."
---

L'administration peut passer par un réseau privé (un tailnet) plutôt que par l'adresse publique. Le tailnet est facultatif : avec **Aucun réseau privé**, le SSH par clé sur l'adresse publique reste la voie d'accès. Le trafic web vers les applications n'a rien à voir avec cette section; il passe toujours par le tunnel Cloudflare, voir [Domaine et Cloudflare](/fr/configuration/domain/).

Le SSH du serveur est toujours par clé seulement, sans connexion root et sans mot de passe. Le port public 22 reste ouvert tant que **Fermer le SSH sur le port public 22** n'est pas coché, ce qui exige un tailnet fonctionnel.

## Choisir un plan de contrôle

Dans **Paramètres** > **Tunnel d'accès administrateur**, **Plan de contrôle du réseau privé** propose :

| Option | Sens |
|---|---|
| **Aucun réseau privé** | Aucun tailnet. Le SSH public par clé reste la voie d'accès. |
| **Tailscale (hébergé)** | Le tailnet repose sur le service de Tailscale. |
| **Headscale (auto-hébergé)** | Le tailnet repose sur un serveur Headscale. |

Seuls les champs dont le plan de contrôle choisi a besoin sont affichés. Changer le choix déplace le serveur vers un autre réseau privé, ou l'en retire, et le SSH public reste tel quel tant que la case décrite plus bas n'en décide pas autrement.

### Tailscale

Prérequis : un tailnet et un client OAuth dans la console d'administration de Tailscale.

| Champ | Contenu |
|---|---|
| **Identifiant client OAuth Tailscale** | Requis. |
| **Secret client OAuth Tailscale** | Requis, stocké et jamais réaffiché. |
| **Étiquettes du réseau privé** | Requises pour Tailscale, par exemple `tag:vps`. Séparées par des virgules. |

Le client OAuth a besoin de la portée **Auth Keys** en écriture, pour les étiquettes utilisées, et de la portée **Devices** > **Core** en lecture. Les étiquettes doivent être déclarées dans la politique du tailnet, et le client doit être autorisé à les utiliser. La première portée permet au serveur de produire une clé de courte durée sous ces étiquettes pour se joindre; la seconde lui permet de demander à Tailscale s'il est connecté avant la fermeture du SSH public.

### Headscale

| Champ | Contenu |
|---|---|
| **Adresse du serveur Headscale** | Commence par `http://` ou `https://`. |
| **Utilisateur Headscale** | L'utilisateur auquel les clés du serveur appartiennent. Requis quand une clé d'API est fournie, et l'utilisateur doit exister. |
| **Clé d'API Headscale** | Facultative. À privilégier : le serveur produit une clé neuve à chaque jonction. |
| **Clé de préauthentification Headscale** | Facultative. Utilisée si aucune clé d'API n'est stockée; elle est de longue durée. |
| **Étiquettes du réseau privé** | Séparées par des virgules, par exemple `tag:vps`. |

L'une des deux clés est requise. Une clé de préauthentification statique doit être créée avec les mêmes étiquettes, car un nœud qui se joint avec une telle clé reprend les étiquettes de la clé. Le serveur Headscale doit être assez récent; un serveur plus ancien est refusé, et le message nomme la version minimale.

## Enregistrer et joindre

Appuyer sur **Enregistrer** vérifie les réglages auprès du fournisseur avant de stocker quoi que ce soit. Un échec se lit "Réglages du réseau privé refusés, et rien n'a été enregistré : ..." suivi de la raison, par exemple que le client OAuth ne peut pas créer de clés sous les étiquettes, ne peut pas lire les appareils, ou que l'utilisateur Headscale n'existe pas. Quand la vérification passe, les valeurs sont stockées et le serveur se joint au réseau. La note indique : "Enregistré. Le serveur rejoint le réseau privé, et cette section en suit le déroulement. Le SSH public reste tel quel."

Un bloc d'état sous la section se rafraîchit toutes les 5 secondes :

- **SSH public (port 22)** : "Fermé : accessible par le tailnet seulement" ou "Ouvert".
- **Dernier changement** : un horodatage, ou "pas encore".
- En cours : "Changement de l'accès à ce serveur en cours." La connexion de maintenance peut tomber pendant ce temps; l'opération se poursuit même si la page est fermée.
- "Ce que le serveur a enregistré pendant cette tentative" contient le journal de la dernière tentative.
- Après un échec : "La dernière tentative n'est pas allée au bout. Le port de maintenance a été laissé tel quel : rien n'a été fermé."
- Si un autre changement est en cours, l'enregistrement indique que la jonction n'a pas démarré. Enregistrer de nouveau une fois l'autre changement terminé suffit.

## Fermer le SSH sur le port public 22

La case **Fermer le SSH sur le port public 22** apparaît quand un plan de contrôle est défini et que le tailnet est actif (ou que le SSH est déjà fermé). L'avertissement indique : "Fermer le SSH sur le port public 22 signifie que cette machine n'est plus accessible que par le tailnet. Cette action n'est possible que lorsqu'une connexion valide au tailnet est active. Le port est automatiquement rouvert si la connexion au tailnet est interrompue pendant plus de 5 minutes." Quand le tailnet est inactif, la section indique "La connexion au tailnet n'est pas active en ce moment, donc le port ne peut pas encore être fermé."

C'est le serveur, et non le panneau, qui décide si le port peut se fermer. Avant de le fermer, il établit que :

- le serveur de contrôle montre le serveur comme connecté;
- un autre appareil du tailnet, qui ne porte pas les étiquettes du serveur, le joint;
- la politique du tailnet permet à un tel appareil d'ouvrir le port TCP 22 sur le serveur;
- le pare-feu du serveur laisse entrer le SSH par l'interface du tailnet.

Un refus laisse le port 22 ouvert et la raison dans le journal de la tentative. En cas de succès, la note indique "Enregistré. Le SSH public se ferme une fois que le serveur a prouvé que le tailnet le joint, et cette section en suit le déroulement." Décocher la case rouvre le port ("Enregistré. Le SSH public se rouvre, et cette section en suit le déroulement.").

Si le tailnet reste inactif plus de 5 minutes après la fermeture, le serveur rouvre lui-même le port 22 pour que la clé sur le SSH public refonctionne.

:::caution
Avant de fermer, confirmer depuis un second appareil que le SSH par l'adresse du tailnet fonctionne. La nouvelle voie doit être éprouvée avant de retirer l'ancienne.
:::

## Rejoindre de nouveau le réseau privé

Quand un fournisseur est défini et que le serveur a décroché du tailnet, ou que ses étiquettes ont changé, un formulaire apparaît : "Ce serveur n'est pas sur son réseau privé en ce moment. Le reconnecter avec une nouvelle clé l'y ramène, lorsqu'il en a décroché ou que ses étiquettes ont changé." Cocher "Je comprends que la connexion au réseau privé tombe un instant." puis appuyer sur **Rejoindre de nouveau le réseau privé**. Enregistrer d'abord les nouveaux identifiants du tailnet est la façon de prendre en compte un client OAuth ou une clé Headscale remplacés.

## SSH vers le serveur en tant que ops

Le compte d'administration est `ops`, atteint avec la clé SSH remise à l'installateur.

- Tant que le port public 22 est ouvert : `ssh ops@<ip-publique-du-serveur>`
- Une fois fermé : `ssh ops@<ip-du-tailnet>`, depuis un appareil du même tailnet.

`ops` dispose de sudo sans mot de passe. Un compte distinct, `panel`, ne sert qu'à transférer les ports du panneau et de Portainer et ne peut pas ouvrir de shell.

### Ajouter une clé SSH pour ops

Depuis une session existante en tant que `ops`, ajouter la nouvelle clé publique aux clés autorisées du compte :

```bash
echo 'ssh-ed25519 AAAA... nom' >> ~/.ssh/authorized_keys
```

Les lignes ajoutées à la main restent en place quand la configuration du serveur est appliquée de nouveau. Sans aucune session fonctionnelle, le mode de secours du fournisseur permet de monter le disque et d'ajouter la clé dans `/home/ops/.ssh/authorized_keys`.

## Dépannage

- "Tailscale refused the OAuth client" (message en anglais renvoyé par la vérification) : l'identifiant ou le secret du client est erroné, ou le client a été révoqué.
- "The OAuth client cannot create keys tagged ..." : le client n'a pas la portée **Auth Keys** en écriture ou les étiquettes, ou les étiquettes ne sont pas déclarées dans la politique du tailnet.
- La case de fermeture n'apparaît jamais : le tailnet n'est pas actif. Utiliser **Rejoindre de nouveau le réseau privé** et consulter le bloc d'état.
- Le port public 22 s'est rouvert de lui-même : le tailnet est resté inactif plus de 5 minutes. Corriger le tailnet, puis fermer de nouveau.
