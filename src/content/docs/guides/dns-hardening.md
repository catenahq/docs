---
title: Filtrer votre DNS pour bloquer maliciels et hameçonnage
description: Configurer Quad9 (sans inscription) ou NextDNS (filtres personnalisés) sur votre routeur, Firefox ou Chrome pour bloquer maliciels et hameçonnage sur tous vos appareils.
---

Le filtrage au niveau DNS est l'amélioration de sécurité la moins chère et la plus efficace que la plupart des PME ne mettent jamais en place. Un seul changement au niveau du résolveur bloque les domaines malveillants pour tous les appareils du réseau — sans logiciel à installer sur chaque poste.

## Choisir un résolveur

Deux résolveurs respectueux de la vie privée que nous recommandons. Les deux sont gratuits.

| | Quad9 | NextDNS |
| --- | --- | --- |
| Où l'organisation est basée | Suisse (fondation à but non lucratif) | France |
| Inscription requise | non | oui (compte gratuit) |
| Blocage maliciels et hameçonnage | oui, intégré | oui, configurable |
| Filtres personnalisés (catégories, listes, journaux) | non | oui |
| Quota gratuit | illimité | 300 000 requêtes / mois (≈ 10-30 personnes selon usage) |

**Quad9** convient si vous voulez la protection de base sans gérer un compte de plus. Vous changez les adresses DNS, c'est terminé.

**NextDNS** convient si vous voulez voir ce qui est bloqué, ajouter vos propres règles (publicité, suivi, contenu adulte, jeu, etc.), ou couvrir plusieurs sites avec des politiques différentes. Vous créez un compte sur [nextdns.io](https://nextdns.io/), choisissez vos filtres, puis utilisez l'identifiant de configuration qui vous est attribué (de la forme `abc123`) à la place des valeurs d'exemple plus bas.

## Configurer le routeur du bureau

C'est l'option qui couvre le plus d'appareils d'un seul coup : ordinateurs, téléphones, imprimantes, objets connectés du réseau. Connectez-vous à l'interface d'administration de votre routeur (généralement `192.168.1.1` ou `192.168.0.1`), trouvez la section DNS (souvent sous *WAN*, *Internet* ou *DHCP*), et remplacez les serveurs DNS par :

**Quad9**
- DNS principal : `9.9.9.9`
- DNS secondaire : `149.112.112.112`
- IPv6 principal : `2620:fe::fe`
- IPv6 secondaire : `2620:fe::9`

**NextDNS** (remplacez `abc123` par votre identifiant)
- DNS principal : `45.90.28.0`
- DNS secondaire : `45.90.30.0`
- Suivez ensuite les instructions de NextDNS pour lier ces IP à votre compte, ou utilisez le routeur lui-même pour pointer vers l'endpoint `https://dns.nextdns.io/abc123` si votre routeur supporte DNS-over-HTTPS (OPNsense, pfSense, MikroTik, certains routeurs Asus / Ubiquiti).

Redémarrez le routeur. Les appareils prennent les nouveaux DNS au prochain renouvellement DHCP (souvent en débranchant-rebranchant le câble réseau, ou en oubliant et rejoignant le WiFi).

## Configurer Firefox

Pour les portables qui quittent le bureau ou les appareils où vous ne contrôlez pas le routeur.

1. Ouvrez **Paramètres** → **Vie privée et sécurité**.
2. Descendez jusqu'à **DNS sur HTTPS**, sélectionnez **Protection maximale**.
3. Sous **Choisissez un fournisseur**, choisissez **Personnalisé**.
4. Collez l'URL :
   - Quad9 : `https://dns.quad9.net/dns-query`
   - NextDNS : `https://dns.nextdns.io/abc123` (remplacez `abc123` par votre identifiant)
5. Fermez l'onglet. Le changement prend effet immédiatement.

## Configurer Chrome (et Edge, Brave, Opera)

1. Ouvrez **Paramètres** → **Confidentialité et sécurité** → **Sécurité**.
2. Descendez jusqu'à **Utiliser un DNS sécurisé**, activez l'option, choisissez **Avec** puis **Personnalisé**.
3. Collez l'URL :
   - Quad9 : `https://dns.quad9.net/dns-query`
   - NextDNS : `https://dns.nextdns.io/abc123` (remplacez `abc123` par votre identifiant)
4. Fermez l'onglet. Le changement prend effet immédiatement.

Edge, Brave et Opera partagent le même paramètre sous un libellé équivalent (« DNS sécurisé », « Secure DNS »).

## Vérifier que ça marche

- **Quad9** : visitez [test.quad9.net](https://test.quad9.net/). La page confirme si votre appareil résout bien via Quad9, et offre un domaine de test malveillant qui doit être bloqué.
- **NextDNS** : visitez [test.nextdns.io](https://test.nextdns.io/). La page confirme que votre identifiant de configuration est bien actif, et le tableau de bord NextDNS affiche les requêtes en temps réel.

Si la vérification échoue, l'appareil utilise probablement encore le DNS du fournisseur d'accès. Sur le routeur, vérifiez que le changement DNS est bien sauvegardé et que le DHCP distribue les nouveaux serveurs. Sur le navigateur, vérifiez que DNS sur HTTPS est bien activé (pas en mode « par défaut »).

## Mises en garde

- Le filtrage DNS bloque les noms de domaine, pas le contenu une fois la page chargée. Il complète, mais ne remplace pas, un antivirus à jour et la prudence avec les pièces jointes.
- Configurer le DNS au routeur ET au navigateur en même temps fait que le navigateur gagne. Choisissez une couche ou l'autre, ou assurez-vous que les deux pointent vers le même résolveur.
- Les domaines légitimes sont parfois faussement bloqués. Si NextDNS bloque un domaine de fournisseur que vous utilisez, ajoutez-le à votre liste d'autorisation dans le tableau de bord — l'ajustement prend effet en moins d'une minute. Quad9 n'offre pas de liste d'autorisation par client ; si un faux positif vous bloque, basculez ce poste sur NextDNS.
