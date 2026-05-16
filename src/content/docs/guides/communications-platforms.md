---
title: Choisir une plateforme de communications
description: Comparez Nextcloud Talk, Rocket.Chat, Element et Linphone -- ce que chacun apporte, ce qui lui manque, ce qui tourne sur votre propre serveur sans frais supplémentaires, et quelles combinaisons conviennent à quelles situations.
---

Aucun outil unique ne couvre tout ce dont une entreprise a besoin en communications. La discussion d'équipe interne, les visioconférences, les boîtes de support client et les appels téléphoniques classiques fonctionnent chacun mieux sur une plateforme différente. Voici les quatre composantes que vous pouvez combiner : courtes descriptions d'abord, puis un tableau comparatif côte à côte, puis une liste « choisir selon votre situation ».

## Les quatre composantes

**[Nextcloud Talk](/docs/nextcloud-apps-vs-suite/)** est inclus avec la suite Nextcloud déjà installée sur votre serveur. Discussion d'équipe interne, appels voix et vidéo, et accès téléphonique aux réunions lorsque vous prenez un abonnement chez un service téléphonique. Pas de boîte de support client ; pas de téléphone de bureau à extension.

**[Rocket.Chat](/docs/apps/rocketchat-oidc/)** est une plateforme de discussion d'équipe plus riche, avec de solides applications mobiles et une boîte de support client qui regroupe le clavardage web, le courriel, les réseaux sociaux et les SMS dans une seule fenêtre. Les appels voix et vidéo internes fonctionnent immédiatement. Passer et recevoir des appels téléphoniques classiques depuis la fenêtre de discussion exige un abonnement payant chez Rocket.Chat ; tout le reste demeure gratuit sur votre serveur.

**Element** traite les appels téléphoniques classiques dans la même fenêtre que la discussion, sans complément payant, et permet à votre équipe de discuter avec n'importe qui sur le serveur Element d'une autre organisation. Il n'inclut pas de boîte de support client.

**Linphone** est une application téléphonique gratuite pour ordinateur et mobile qui donne à chaque membre du personnel un numéro d'extension de bureau, une boîte vocale et la capacité de passer et recevoir des appels téléphoniques classiques. Ce n'est pas une plateforme de discussion ; c'est la pièce que vous ajoutez quand vous gardez Talk ou Rocket.Chat comme outil de discussion et que vous avez tout de même besoin d'un vrai téléphone de bureau. Le compromis : une fenêtre supplémentaire dans la journée de travail.

## Comparaison des fonctionnalités

|                                              | Talk    | Rocket.Chat | Element | Linphone |
| -------------------------------------------- | :-----: | :---------: | :-----: | :------: |
| Discussion d'équipe interne                  |   ✅    |     ✅      |   ✅    |    ❌    |
| Visioconférences de groupe                   |   ✅    |     ✅      |   ✅    |    ❌    |
| Accès à une réunion par téléphone [^1]       |   ✅    |     ✅      |   ✅    |    ❌    |
| Boîte de support client (Omnichannel)        |   ❌    |     ✅      |   ❌    |    ❌    |
| Appels téléphoniques depuis la fenêtre       |   ❌    | payant [^2] |   ✅    |    ✅    |
| Applications mobiles (iOS / Android)         |   ✅    |     ✅      |   ✅    |    ✅    |
| Chiffrement de bout en bout (messages directs) |   ✅  |     ✅      |   ✅    |    ✅    |
| Fédération entre organisations               | limitée |   limitée   |   ✅    |    ✅    |
| Intégration Nextcloud [^4]                   | complète | fichiers + SSO | SSO seulement | ❌ |
| Gratuit sur votre serveur, sans frais par utilisateur |   ✅ |   ✅ [^3]   |   ✅    |    ✅    |

[^1]: Nécessite un abonnement à un service téléphonique. Voir [Ce qui tourne sur votre serveur, ce qui coûte extra](#ce-qui-tourne-sur-votre-serveur-ce-qui-coûte-extra) plus bas.
[^2]: Rocket.Chat vend cette fonction comme un forfait Premium accompagné d'un complément Voice, facturé par utilisateur et par mois, négocié directement avec leur équipe de ventes. Les autres options de cette page évitent ce frais.
[^3]: L'édition Community de Rocket.Chat (gratuite) couvre tout ce qui figure dans le tableau, sauf les appels téléphoniques dans la fenêtre.
[^4]: Talk est une application Nextcloud : sélecteur de fichiers, entrées d'agenda, contacts, sondages et présence sont partagés automatiquement avec le reste de Nextcloud. Rocket.Chat partage l'authentification unique Keycloak avec Nextcloud et propose une extension optionnelle sur sa Marketplace qui ajoute un sélecteur de fichiers Nextcloud ; agenda et contacts restent séparés. Element partage uniquement l'authentification unique Keycloak -- sélecteur de fichiers, agenda et contacts vivent dans Nextcloud et doivent être ouverts dans un onglet séparé.

## Choisir selon votre situation

- **Petite équipe, communication interne seulement.** [Nextcloud Talk](/docs/nextcloud-apps-vs-suite/) seul.
- **Discussion d'équipe et boîte de support client par web, courriel, réseaux sociaux et SMS.** [Rocket.Chat](/docs/apps/rocketchat-oidc/) pour la boîte ; Linphone pour le travail téléphonique sortant.
- **Discussion d'équipe et appels téléphoniques classiques dans une seule fenêtre.** Element.
- **Boîte de support client ET appels téléphoniques classiques dans une seule fenêtre.** Aucune option vraiment unifiée ; prenez Rocket.Chat avec Linphone, ou Element avec un outil de billetterie distinct.
- **Besoins mixtes dans plusieurs équipes.** Talk pour la discussion interne, Rocket.Chat pour l'équipe de support, Linphone pour quiconque a besoin d'une extension téléphonique.

## Ce qui tourne sur votre serveur, ce qui coûte extra

Tout ce qui précède -- Talk, Rocket.Chat, Element, Linphone -- tourne sur le serveur que votre opérateur gère déjà pour vous, sans frais mensuels par utilisateur (la seule exception est l'abonnement optionnel de téléphone-dans-la-fenêtre de Rocket.Chat noté dans le tableau). Les coûts externes récurrents ne s'appliquent que lorsque vous voulez un vrai numéro de téléphone que les clients peuvent composer. Ils proviennent d'un fournisseur de service téléphonique, pas de Rocket.Chat, Nextcloud, Element ou de votre opérateur.

| Quoi                                                                  | Coût typique au Canada [^4]                                                                                |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Le numéro de téléphone de votre entreprise                            | Environ 1 à 3 $ par mois, par numéro                                                                       |
| Appels sortants                                                       | Environ 0,01 $ la minute, OU un forfait fixe d'environ 5 à 10 $ par mois pour les appels illimités en Amérique du Nord |
| Redevance pour le service d'urgence 9-1-1 (imposée par la loi canadienne) | Environ 1,50 $ par mois, par numéro                                                                    |

[^4]: Approximatif au moment de la rédaction. Exemples de fournisseurs qui offrent ce type de service téléphonique au tarif d'utilisation au Canada : VoIP.ms, Babytel, Twilio. Votre opérateur confirme les chiffres réels et vous aide à vous inscrire le jour du devis. Vous payez directement le fournisseur téléphonique ; votre opérateur n'applique aucune marge.

Si vous n'êtes pas certain de la combinaison qui convient à votre entreprise, contactez votre opérateur. Un court appel cerne la voie plus vite qu'une grille de critères.
