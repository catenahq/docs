---
title: Choisir une plateforme de communications
description: Comparez Nextcloud Talk, Rocket.Chat, Element et Linphone -- ce que chacun apporte, ce qui lui manque, ce qui tourne sur votre propre serveur sans frais supplémentaires, et quelles combinaisons conviennent à quelles situations.
---

Aucun outil unique ne couvre tout ce dont une entreprise a besoin en communications. La discussion d'équipe interne, les visioconférences, les boîtes de support client et les appels téléphoniques classiques fonctionnent chacun mieux sur une plateforme différente. Cette page indique ce que chaque option fait bien, ses limites et les combinaisons adaptées aux situations courantes.

## Ce qui tourne sur votre serveur, ce qui coûte extra

Presque tout ce qui suit tourne sur le serveur que votre opérateur gère déjà pour vous. Rien sur cette page ne facture par utilisateur par mois -- avec une exception précise et optionnelle. Les seuls coûts externes récurrents sont ceux que le reste du monde rend obligatoires : un fournisseur téléphonique (si vous voulez composer ou recevoir des numéros classiques) et la redevance 9-1-1 réglementaire qui l'accompagne.

| Quoi | Où ça tourne | Coût récurrent au-delà de ce que votre opérateur gère déjà |
| --- | --- | --- |
| Nextcloud Talk | Votre serveur | Aucun |
| Rocket.Chat (édition Community) | Votre serveur | Aucun |
| Rocket.Chat Premium + complément Voice (appels téléphoniques dans la fenêtre) | Votre serveur, mais fonction verrouillée par la licence de Rocket.Chat | Payant, par utilisateur, par mois, fixé directement par Rocket.Chat. Les autres options de cette page évitent ce frais. |
| Element / Matrix | Votre serveur | Aucun |
| Linphone (logiciel téléphonique installé par membre du personnel) | L'ordinateur ou le téléphone de chaque membre du personnel | Aucun |
| FreeSWITCH / Asterisk (si vous voulez un système téléphonique complet avec groupes de sonnerie, boîte vocale, standard automatique) | Votre serveur | Aucun |
| Ligne SIP + numéros de téléphone (DID) | Fournisseur téléphonique externe | Par numéro, par mois + à la minute ou en forfait. Obligatoire si vous voulez passer des appels classiques. |
| Redevance 9-1-1 | Facturée par le fournisseur téléphonique | Par numéro, par mois. Imposée par le CRTC au Canada. |

La conclusion : les logiciels de discussion, de réunion et de voix vous appartiennent. La ligne téléphonique et l'acheminement des services d'urgence viennent d'une compagnie téléphonique parce que c'est ainsi que fonctionne le réseau public.

## Les quatre composantes

**[Nextcloud Talk](/docs/nextcloud-apps-vs-suite/)** est inclus avec la suite Nextcloud installée sur votre serveur, sans coût supplémentaire. Il couvre la discussion d'équipe interne, les appels voix et vidéo entre membres du personnel et l'accès à une réunion par téléphone classique lorsqu'il est jumelé à un fournisseur téléphonique. Il n'inclut pas de boîte de support client ni d'appels téléphoniques par extension.

**[Rocket.Chat](/docs/apps/rocketchat-oidc/)** est une plateforme de discussion d'équipe plus riche, avec des applications mobiles matures et un module Omnichannel intégré qui transforme une boîte unique en lieu où votre personnel traite les conversations client venant du clavardage web, du courriel, des réseaux sociaux et des SMS. Les appels voix et vidéo internes fonctionnent immédiatement (le bouton de réunion ouvre une salle Jitsi). La fonction « passer et recevoir des appels téléphoniques classiques depuis la fenêtre de discussion » est par contre verrouillée derrière un forfait Premium payant et un complément Voice. Ce prix est par utilisateur, par mois, fixé directement par Rocket.Chat avec leur équipe de ventes, et c'est le seul abonnement payant mentionné sur cette page. L'édition Community qui tourne sur votre serveur sans cet abonnement couvre tout le reste.

**Element** est une plateforme de discussion construite sur le protocole ouvert Matrix. Sa force est l'intégration téléphonique native : les appels vers et depuis des numéros de téléphone classiques se font dans la même fenêtre que la discussion, sans complément payant. Element prend aussi en charge la fédération (votre équipe peut discuter avec n'importe qui sur un autre serveur Matrix) et le chiffrement de bout en bout par défaut sur les messages directs. Il n'inclut pas de boîte de support client Omnichannel.

**Linphone** est un logiciel téléphonique gratuit et libre -- une application de bureau ou mobile qui transforme votre ordinateur ou votre téléphone en ligne de bureau. Ce n'est pas une plateforme de discussion concurrente ; c'est la pièce qui comble l'absence de téléphone classique lorsque vous gardez Talk ou Rocket.Chat comme outil de discussion. Chaque membre du personnel installe Linphone, se connecte une fois avec les identifiants fournis par votre opérateur, et obtient un numéro d'extension, une boîte vocale et la capacité de passer et recevoir des appels. Le compromis : une fenêtre supplémentaire dans la journée de travail ; la discussion reste dans Talk ou Rocket.Chat, l'audio de l'appel se fait dans Linphone.

## Où ils se recoupent, où ils diffèrent

|                                                              | Nextcloud Talk            | Rocket.Chat                                       | Element                              | Linphone               |
| ------------------------------------------------------------ | ------------------------- | ------------------------------------------------- | ------------------------------------ | ---------------------- |
| Discussion d'équipe interne                                  | oui                       | oui                                               | oui                                  | non                    |
| Visioconférences de groupe                                   | oui                       | oui (via le bouton de réunion)                    | oui                                  | non                    |
| Accès à une réunion par téléphone classique                  | oui (avec fournisseur téléphonique) | oui (avec fournisseur téléphonique)     | oui (avec fournisseur téléphonique)  | s/o                    |
| Boîte de support client Omnichannel                          | non                       | oui                                               | non                                  | non                    |
| Appels téléphoniques classiques depuis la fenêtre de discussion | non                    | complément payant (Premium + Voice)               | oui                                  | s/o (c'est le téléphone) |
| Applications mobiles (iOS / Android)                         | oui                       | oui                                               | oui                                  | oui                    |
| Chiffrement de bout en bout sur les messages directs         | oui                       | optionnel                                         | oui (par défaut)                     | optionnel              |
| Fédération entre organisations sur la même plateforme        | limitée                   | limitée                                           | oui                                  | oui (via SIP)          |
| Tourne sur votre serveur sans frais par utilisateur          | oui                       | oui (le téléphone dans la fenêtre est l'exception payante) | oui                            | oui (une installation par membre du personnel) |

## Choisir selon votre situation

### Petite équipe, communication interne seulement, sans numéro de téléphone public

**Recommandé :** [Nextcloud Talk](/docs/nextcloud-apps-vs-suite/) seul.

Talk est déjà sur votre serveur, ne coûte rien de plus, et couvre la discussion, les réunions et l'accès téléphonique à ces réunions au besoin.

### Discussion d'équipe et support client par web, courriel, réseaux sociaux ou SMS

**Recommandé :** [Rocket.Chat](/docs/apps/rocketchat-oidc/) pour la boîte de réception ; Linphone pour le travail téléphonique sortant.

Le module Omnichannel de Rocket.Chat est la raison de le choisir. Une seule boîte couvre le clavardage web, le courriel-vers-ticket et le SMS-vers-conversation (par l'API de votre fournisseur téléphonique). Votre personnel traite les conversations client depuis une seule fenêtre. Les appels téléphoniques classiques sortants et entrants se font dans Linphone en parallèle. Rocket.Chat lui-même reste en édition Community ; aucun abonnement Premium n'est requis pour cette combinaison.

### Discussion d'équipe et appels téléphoniques classiques dans une seule fenêtre

**Recommandé :** Element.

Element est la seule option qui combine la discussion d'entreprise et les appels téléphoniques classiques dans le même client sans complément payant. Utile si la journée de votre équipe est moitié téléphone, moitié discussion, et que changer de fenêtre dérange.

### Boîte de support client ET appels téléphoniques classiques dans une seule fenêtre

**Recommandé :** il n'existe pas aujourd'hui d'option véritablement unifiée. Choisissez Rocket.Chat pour la boîte et acceptez Linphone pour le téléphone, ou choisissez Element pour le téléphone et traitez les tickets de support dans un outil distinct. L'autre voie -- payer Rocket.Chat Premium + Voice -- ramène les deux dans la fenêtre Rocket.Chat, mais vous fait basculer vers un abonnement mensuel par utilisateur fixé par Rocket.Chat.

### Besoins mixtes dans une entreprise à plusieurs équipes

**Recommandé :** Talk pour la discussion interne informelle, Rocket.Chat pour l'équipe de support client, Linphone pour quiconque a besoin d'une extension téléphonique.

Chaque outil traite ce qu'il fait le mieux. Le personnel qui ne discute qu'à l'interne reste dans Talk. Le personnel au contact des clients travaille dans Rocket.Chat. Le personnel qui a besoin d'une extension installe aussi Linphone. C'est l'arrangement le plus fréquent dans les entreprises qui combinent collaboration interne et flux de travail face aux clients.

## Ce qu'aucun de ces outils ne fournit à lui seul

- Un numéro de téléphone classique que les clients peuvent composer. Cela vient d'un fournisseur téléphonique ; votre opérateur peut en recommander un adapté à votre juridiction.
- L'appel sortant au 9-1-1. Fourni par le fournisseur téléphonique et facturé par celui-ci ; obligatoire au Canada.
- La boîte vocale par courriel, les groupes de sonnerie (un numéro qui fait sonner plusieurs personnes) ou un standard automatique (« Faites le 1 pour les ventes »). Ces fonctions viennent d'un système téléphonique libre (FreeSWITCH ou Asterisk) que votre opérateur peut ajouter aux côtés de l'une ou l'autre des plateformes de discussion ci-dessus. Parlez à votre opérateur si vous avez besoin d'un système téléphonique complet et pas seulement d'un logiciel téléphonique.

Si vous n'êtes pas certain de la combinaison qui convient à votre entreprise, contactez votre opérateur. Un court appel cerne la voie plus vite qu'une grille de critères.
