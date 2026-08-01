---
title: Créer les comptes fournisseurs
description: Créer les comptes externes sur lesquels repose un déploiement catena -- un VPS, Cloudflare, Tailscale, un stockage de sauvegarde S3 et un relais SMTP -- tous au nom du client.
---

Un déploiement catena repose sur quelques comptes externes qui restent
au nom et à la facturation **du client**. Ils lui appartiennent, et
l'installateur les câble dans le serveur ; les comptes se créent
d'abord, et leurs identifiants sont fournis à l'installation.

Chaque identifiant a sa place dans un gestionnaire de mots de passe dès
sa création. Les valeurs exactes dont l'installation a besoin sont
listées sous chaque étape et regroupées dans
[Identifiants à noter](#identifiants-à-noter) à la fin.

## 1. Louer un VPS

Le serveur qui fait tout tourner. En commander un au nom de
l'entreprise chez un fournisseur qui convient :

- **[Hetzner](https://www.hetzner.com/cloud)** -- faible coût, régions
  UE + États-Unis.
- **[OVHcloud](https://www.ovhcloud.com/fr-ca/vps/)** -- tarif fixe,
  Beauharnois (Québec) garde les données au Canada.
- **[Servarica](https://servarica.com/)** -- entreprise canadienne,
  disque généreux.
- **[DigitalOcean](https://www.digitalocean.com/products/droplets)** --
  console simple, large choix de régions.

La région décide de la juridiction où les données restent. Le
dimensionnement suit l'effectif et les applications prévues -- la
plupart des fournisseurs permettent de redimensionner le VPS plus tard
s'il est dépassé.

*À noter : l'identifiant du fournisseur, l'IP publique du serveur et
les accès SSH (ou le mot de passe root, si c'est tout ce que le
fournisseur donne au départ).*

## 2. Cloudflare : compte + jeton API

Cloudflare est la porte d'entrée publique et fournit le tunnel privé
qui masque l'adresse réelle du serveur.

1. [S'inscrire](https://dash.cloudflare.com/sign-up) avec le courriel
   qui doit figurer sur la facture.
2. Ajouter le domaine d'entreprise au DNS Cloudflare (le forfait
   gratuit suffit).
3. Créer un jeton API limité à cette zone pour que l'installation
   puisse publier les enregistrements DNS et le tunnel.

Le guide de Cloudflare détaille la création du jeton :
[Créer un jeton API](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/).

*À noter : le jeton API.*

## 3. Tailscale : client OAuth

Tailscale est le réseau privé que nous utilisons pour atteindre le
serveur lors des mises à jour et de la maintenance. Le SSH public reste
fermé.

1. [Démarrer un tailnet](https://login.tailscale.com/start) via le SSO
   d'une identité qui existe déjà (Google, Microsoft, GitHub).
2. Créer un client OAuth pour que l'installation joigne le nouveau
   serveur à ce réseau sans qu'une connexion personnelle soit
   partagée.

Le guide de Tailscale :
[Clients OAuth](https://tailscale.com/kb/1215/oauth-clients/).

*À noter : l'identifiant et le secret du client OAuth.*

## 4. Stockage de sauvegarde S3

Les sauvegardes hors-site chiffrées atterrissent dans un bucket de
stockage d'objets appartenant au client -- fournisseur distinct du VPS,
pour qu'une seule panne ne puisse pas emporter les deux. **Le bucket
doit prendre en charge S3 Object Lock et le versionnage** afin qu'un
instantané ne puisse pas être silencieusement supprimé ou écrasé, même
par quelqu'un ayant des clés valides.

Fournisseurs qui prennent en charge Object Lock + versionnage :

- **[eazybackup](https://eazybackup.ca/)** -- entreprise canadienne,
  garde les sauvegardes hors-site au Canada. Recommandation par défaut
  quand le VPS est aussi canadien.
- **[Backblaze B2](https://www.backblaze.com/cloud-storage)** -- faible
  coût, compatible S3, basé aux États-Unis.
- **[IDrive e2](https://www.idrive.com/e2/)** -- compatible S3, prix
  compétitif, plusieurs régions.
- **[Cloudflare R2](https://www.cloudflare.com/developer-platform/products/r2/)**
  -- pas de frais de sortie, basé aux États-Unis.

Créer le bucket avec **Object Lock et versionnage activés à la
création** (la plupart des fournisseurs cachent cette option derrière
une case qu'on ne peut plus cocher ensuite). Le garder dans une autre
ville -- idéalement un autre pays -- que le serveur.

*À noter : l'URL de l'endpoint, le nom du bucket, la clé d'accès et la
clé secrète.*

## 5. Relais SMTP pour le courriel automatisé

Deux choses différentes s'appellent "courriel", et elles demandent
une configuration différente :

- **Les boîtes aux lettres** (la boîte que l'équipe lit et d'où elle
  répond). Un serveur de messagerie peut tourner comme l'une des
  applications, ou un fournisseur déjà en place peut être intégré. Les
  deux conviennent.
- **L'envoi automatisé** (liens de réinitialisation, invitations de
  calendrier, notifications de tickets, courriels de campagne). C'est
  ici qu'**un service SMTP d'envoi externe et indépendant est
  requis.** Un VPS qui envoie lui-même son courriel transactionnel
  finit en pourriel -- la délivrabilité dépend de la réputation d'un
  expéditeur dédié, alors catena relaie toujours le courriel
  automatisé par l'un d'eux.

Choisir un expéditeur transactionnel et y ajouter le domaine :

- **[Resend](https://resend.com/)** -- par défaut. Ajouter le domaine,
  déposer dans Cloudflare les enregistrements DNS qu'il fournit,
  générer une clé API. Guide :
  [Domaines Resend](https://resend.com/docs/dashboard/domains/introduction).
- **[Brevo](https://www.brevo.com/)** -- forfait gratuit généreux.
- Ou un fournisseur de courriel transactionnel déjà en place, s'il y
  en a un.

*À noter : l'hôte SMTP, le port (habituellement 587), le nom
d'utilisateur, le mot de passe ou la clé API, et l'adresse expéditeur
vérifiée.*

## Identifiants à noter

Avant le lancement de l'installation, ceci a sa place dans un
gestionnaire de mots de passe, chacun comme sa propre entrée --
l'installation les demande :

| Compte | À noter |
|---|---|
| VPS | identifiant du fournisseur, IP du serveur, accès SSH |
| Cloudflare | jeton API |
| Tailscale | identifiant + secret du client OAuth |
| Sauvegarde S3 | endpoint, bucket, clé d'accès, clé secrète |
| Relais SMTP | hôte, port, nom d'utilisateur, mot de passe/clé API, adresse expéditeur |

Avec tout ceci en main, l'installation se déroule de bout en bout
toute seule. Un coup de main pour la parcourir reste disponible auprès
du contact Catena -- une option, pas une obligation.
