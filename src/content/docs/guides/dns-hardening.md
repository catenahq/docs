---
title: Durcir votre DNS avec blocage et filtrage
description: Configurer Cloudflare Gateway et le filtrage DNS par catégorie pour bloquer maliciels, hameçonnage et contenu adulte sur tous les appareils de votre PME — sans agent par appareil.
---

Le filtrage au niveau DNS est l'amélioration de sécurité la moins chère et la plus efficace que la plupart des PME ne mettent jamais en place. Un seul changement au niveau du résolveur bloque le command-and-control des maliciels, les domaines d'hameçonnage et le contenu par catégorie pour tous les appareils du réseau — sans agent par appareil.

## Ce que vous obtenez

- Domaines de maliciels et d'hameçonnage bloqués avant même que le navigateur les résolve.
- Filtrage par catégorie (adulte, jeu, pair-à-pair, etc.) configurable par bureau ou par identité.
- Journal par requête des tentatives bloquées — preuve à montrer lors d'une revue d'incident.
- Aucun agent par appareil si vous appliquez le changement au routeur du bureau ou via WARP.

## Approche : Cloudflare Gateway + WARP

[Cloudflare Gateway](https://developers.cloudflare.com/cloudflare-one/policies/gateway/dns-policies/) est le choix adapté aux PME : gratuit jusqu'à 50 sièges sur Zero Trust Free, tourne sur le compte Cloudflare qui sert déjà d'entrée publique pour vos services catena, et se marie au [client WARP](https://1.1.1.1/) pour le filtrage sur les appareils qui quittent le réseau du bureau.

### 1. Activer Cloudflare Zero Trust sur votre compte Cloudflare existant

Depuis le tableau de bord Cloudflare : **Zero Trust** → **Settings** → choisissez un domaine d'équipe (modifiable plus tard). Le palier Free convient pour moins de 50 sièges ; bascule en *Pay-as-you-go* si vous grossissez.

### 2. Créer une politique DNS de base

**Gateway** → **Policies** → **DNS**. Ajoutez une politique avec sélecteurs *Security categories : malware, phishing, command-and-control, cryptomining* et action *Block*. À elle seule, elle attrape la majorité de ce qui autrement atteindrait les navigateurs.

### 3. Ajouter une politique de contenu

Ajoutez une seconde politique DNS avec sélecteurs *Content categories : adult, gambling, anonymizers* (choisissez les catégories qui collent à votre posture d'entreprise) et action *Block*. Pour une clinique ou une école, ajoutez *peer-to-peer* et *illegal downloads*.

### 4. Choisir comment les clients atteignent le résolveur

Deux options, vous pouvez utiliser les deux :

- **Routeur du bureau :** réglez les serveurs DNS du LAN sur les adresses IPv4 + IPv6 que Gateway vous donne sous *Networks*. Tous les appareils du LAN résolvent désormais via votre politique de filtrage.
- **Client WARP :** déployez le [client WARP](https://1.1.1.1/) sur les portables qui quittent le bureau. La même politique les suit à la maison, sur le WiFi d'hôtel et sur le cellulaire.

### 5. Vérifier

Depuis un appareil derrière la politique, visitez [un domaine de test connu malveillant](https://www.malware-test-site.com/). Vous devriez tomber sur la page de blocage Cloudflare plutôt que sur le site. Puis consultez **Gateway** → **Logs** ; la requête bloquée s'y trouve avec la politique associée.

## Mises en garde

- Le filtrage DNS ne voit pas le trafic qui utilise DNS-over-HTTPS (DoH) en contournant votre résolveur. Désactivez le DoH par navigateur sur les appareils gérés, ou utilisez WARP, qui tunnelise la résolution via Gateway peu importe la préférence de l'application.
- Mettez en allow-list les faux positifs *rapidement*. Le coût de trois jours de retard sur un domaine de fournisseur légitime est bien supérieur au risque marginal de l'autoriser.
- Les journaux contiennent les IP utilisateurs et les noms d'hôtes interrogés. Configurez la rétention délibérément et documentez-la dans votre politique de confidentialité.
