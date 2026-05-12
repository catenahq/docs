---
title: Créer vos comptes fournisseurs
description: Pas-à-pas — créer les comptes fournisseurs externes (courriel, Cloudflare, Tailscale, OVH, eazybackup, Resend) qu'un déploiement catena typique requiert.
---

Un déploiement catena typique repose sur quelques comptes externes qui restent à votre nom. Passez à travers ce que vous pouvez ; on couvrira le reste ensemble à la rencontre d'installation.

## 1. Fournisseur de courriel : en choisir un

Catena n'opère pas de serveur de messagerie ; il s'intègre au fournisseur que vous choisissez. Ouvrez le [comparatif des fournisseurs de courriel](/docs/guides/email-providers/) et choisissez l'un des cinq que nous recommandons (Migadu, Mailbox.org, Infomaniak, OVH Pro Mail, Mailfence), puis créez le compte au nom de votre entreprise. Choisissez le plan qui correspond à la taille de votre équipe ; on s'occupe des enregistrements DNS et de l'expéditeur transactionnel à l'installation.

*Durée : 15-30 minutes (création de compte + vérification initiale du domaine).*

[![Capture d'écran du parcours de choix d'un fournisseur de courriel](/img/guides/provider-accounts/email.fr.png)](/img/guides/provider-accounts/email.fr.png)

[Comparer les six fournisseurs →](/docs/guides/email-providers/)

## 2. Cloudflare : créer une clé API

[Inscrivez-vous](https://dash.cloudflare.com/sign-up) avec l'adresse courriel que vous voulez voir sur la facture et ajoutez votre nom de domaine au DNS de Cloudflare (le palier gratuit suffit). Créez ensuite un jeton API limité à votre zone afin que l'installation puisse publier les enregistrements DNS et le tunnel public en votre nom.

*Durée : 10-15 minutes (propagation DNS).*

[![Capture d'écran du parcours de création d'un jeton API Cloudflare](/img/guides/provider-accounts/cloudflare.fr.png)](/img/guides/provider-accounts/cloudflare.fr.png)

[Documentation Cloudflare complète →](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)

## 3. Tailscale : créer un client OAuth

[Démarrez un tailnet](https://login.tailscale.com/start) via le SSO de votre fournisseur courriel actuel (Google, Microsoft, GitHub). Créez ensuite un client OAuth afin que l'installation puisse ajouter le nouveau serveur à votre réseau privé sans que vous ayez à partager un identifiant personnel.

*Durée : 5-10 minutes.*

[![Capture d'écran du parcours de création d'un client OAuth Tailscale](/img/guides/provider-accounts/tailscale.fr.png)](/img/guides/provider-accounts/tailscale.fr.png)

[Documentation Tailscale complète →](https://tailscale.com/kb/1215/oauth-clients)

## 4. OVH (ou un autre fournisseur de VPS) : louer un VPS

[Créez un compte OVH](https://www.ovhcloud.com/fr-ca/vps/) et commandez un VPS à votre nom. Pas certain de la taille qu'il vous faut ? Consultez le [guide de dimensionnement](/docs/sizing/) pour une recommandation rapide selon le nombre d'employés et la charge. Beauharnois (Québec) est la région par défaut pour garder vos données au Canada.

*Durée : 30 minutes (la vérification de compte peut s'étirer à la première inscription).*

[![Capture d'écran du parcours de commande VPS OVH](/img/guides/provider-accounts/ovh.fr.png)](/img/guides/provider-accounts/ovh.fr.png)

[Documentation OVH complète →](https://help.ovhcloud.com/csm/fr-ca-vps-getting-started?id=kb_article_view&sysparm_article=KB0047708)

## 5. eazybackup : créer un stockage S3 de sauvegarde immuable

[Ouvrez un compte eazybackup](https://eazybackup.ca/) et créez un bucket S3-compatible avec Object Lock et le versioning activés. eazybackup est canadien et opère depuis Ottawa, donc vos sauvegardes hors-site restent au Canada et ne peuvent pas être écrasées ou supprimées silencieusement.

*Durée : 15 minutes.*

[![Capture d'écran du parcours d'inscription eazybackup](/img/guides/provider-accounts/eazybackup.fr.png)](/img/guides/provider-accounts/eazybackup.fr.png)

[Documentation eazybackup complète →](https://eazybackup.ca/)

## 6. Relais SMTP : configurer un expéditeur pour les courriels automatiques

Catena n'opère pas de serveur de messagerie ; il relaie les courriels automatiques (réinitialisations de mot de passe, invitations calendrier, notifications de tickets) via un expéditeur de votre choix. Par défaut : [Resend](https://resend.com/) (configuration en un clic — ajoutez votre domaine, copiez les enregistrements DNS dans Cloudflare, générez une clé API). Alternatives : [Brevo](https://www.brevo.com/) (palier gratuit généreux), ou votre fournisseur courriel transactionnel actuel.

*Durée : 10-20 minutes avec Resend (aller-retour DNS).*

[![Capture d'écran de la configuration domaine + clé API Resend](/img/guides/provider-accounts/resend.fr.png)](/img/guides/provider-accounts/resend.fr.png)

[Documentation Resend complète →](https://resend.com/docs/dashboard/domains/introduction)

---

Plus vous avancez dans cette liste, plus la rencontre d'installation sera rapide. Si vous n'avez le temps que de créer les comptes avant la rencontre, pas de souci : on passera chaque étape ensemble lors de l'appel.
