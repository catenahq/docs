---
title: "Connexions sécurisées"
description: "Comment le trafic web, l'administration et les appels atteignent le serveur sans exposer de port web, et comment les ports ouverts sont gardés sous contrôle."
---

Tout le trafic web atteint le serveur par un tunnel Cloudflare chiffré : aucun port web n'est ouvert sur la machine elle-même. Cloudflare masque l'adresse du serveur, émet les certificats HTTPS et absorbe le trafic indésirable. L'administration passe par un réseau privé distinct et facultatif, et les appels audio et vidéo peuvent passer par un relais que vous ajoutez comme application.

## Fonctionnement

**Tunnel des applications.** Un service du serveur se connecte vers Cloudflare. Les requêtes destinées aux adresses de `yourdomain.com` arrivent par ce tunnel, passent par Traefik, puis vont à l'application. Les applications non publiques sont derrière une barrière de connexion propre à chacune (voir [Authentification unique](/fr/features/single-sign-on/)).

**Changement de domaine.** Appliquer un domaine dans **Paramètres** > **Domaine** remplace le tunnel par un nouveau. Les applications sont indisponibles quelques minutes pendant que le serveur est remis à niveau sous le domaine. Tant que vous n'avez appliqué aucun domaine, rien n'est publié et vous atteignez le panneau par un transfert de port SSH.

**Voie d'administration.** Le tailnet est facultatif. **Paramètres** > **Tunnel d'accès administrateur** accepte un client OAuth Tailscale hébergé ou un serveur Headscale auto-hébergé. Les identifiants sont vérifiés sur le serveur avant d'être enregistrés. Si vous ne choisissez aucun réseau privé, le SSH par clé sur l'adresse publique reste la voie d'accès.

**SSH public.** Le SSH est toujours par clé seulement : pas de connexion root, pas de mots de passe. Le port 22 reste ouvert jusqu'à ce que vous cochiez **Fermer le SSH sur le port public 22**, option offerte seulement quand le tailnet est actif. Si le tailnet reste ensuite inactif plus de 5 minutes, l'hôte rouvre le port : un tailnet défaillant ne peut donc pas verrouiller votre accès.

**Réconciliation des ports.** Le coupe-feu refuse tout par défaut. Les ports sont déclarés par la plateforme ou par une application (les étiquettes `vps.expose.*`, voir [Configurer une application pour Catena](/fr/configure-apps/)), et un réconciliateur les fusionne dans les règles du coupe-feu toutes les 5 minutes. Outre SSH, seuls les ports que déclarent les applications, comme le courriel ou le relais d'appels, sont ouverts publiquement. Une application du catalogue de Catena qui fonctionne sur le réseau du serveur lui-même, comme le relais d'appels, ouvre les ports que ses étiquettes déclarent. Une étiquette n'ouvre jamais un port que le serveur déclare lui-même : aucune application ne peut donc rouvrir SSH après que vous l'avez fermé. Une passe de validation vérifie que chaque service répond là où il le doit, sur le serveur et par le réseau privé, et un balayage externe depuis votre ordinateur d'administration confirme que rien de non déclaré n'est joignable.

**Appels.** Le relais d'appels est une application du catalogue que vous ajoutez une fois que le serveur a son domaine : le serveur publie pour lui le nom `turn.yourdomain.com` et émet son certificat. Sans lui, les appels se connectent directement quand le réseau le permet. C'est un relais UDP, pas une page web.

## Ce qu'ajoute chaque édition

Communauté comprend les deux tunnels, la protection contre les attaques par déni de service de Cloudflare et un domaine. Catena Pro et Catena Business ajoutent la desserte de plusieurs domaines distincts depuis un même serveur, chacun avec sa propre connexion, par le panneau **Domaines**. Si un abonnement prend fin, les domaines supplémentaires restent enregistrés mais ne sont plus servis. Voir la [comparaison des éditions](https://catena.run/fr/#pricing).

## Limites

- Il vous faut un compte Cloudflare et un domaine pour les applications publiques.
- Un jeton Cloudflare peut atteindre plusieurs domaines, mais Communauté n'en rattache qu'un.
- Un changement de domaine ou le remplacement du tunnel cause quelques minutes d'indisponibilité des adresses publiques.

## Configuration

- [Domaine et Cloudflare](/fr/configuration/domain/)
- [Accès administrateur et réseau privé](/fr/configuration/admin-access/)
- [Paramètres du serveur](/fr/configuration/server/)
