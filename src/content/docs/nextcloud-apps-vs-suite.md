---
title: "Applications Nextcloud vs autres apps de la suite"
description: "Comparaison côte à côte des applications Nextcloud intégrées (Talk, Tasks, Deck, Collective, Calendar, Contacts, etc.) et des applications dédiées de la suite catena, avec des recommandations pour choisir laquelle activer selon l'usage."
---

Nextcloud propose un large catalogue d'applications de première
partie, dont plusieurs recouvrent des outils dédiés de votre suite
logicielle catena (Rocket.Chat, Plane, Outline, Easy!Appointments,
EspoCRM). Les
deux peuvent cohabiter, mais il vaut mieux choisir **une seule app
par usage** pour ne pas éparpiller votre équipe.

Cette page compare les applications Nextcloud les plus courantes à
leurs équivalents dédiés et recommande lesquelles activer.

## Applications Nextcloud présentées dans ce guide

Les applications Nextcloud se trouvent dans **Applications -> Vos
applications** à l'intérieur de Nextcloud. Celles couvertes ici :

- [Talk](https://nextcloud.com/talk/) -- clavardage, appels voix et
  vidéo
- [Tasks](https://apps.nextcloud.com/apps/tasks) -- listes de tâches
  liées au calendrier CalDAV
- [Deck](https://apps.nextcloud.com/apps/deck) -- tableaux kanban
- [Collectives](https://apps.nextcloud.com/apps/collectives) -- wiki
  collaboratif basé sur des fichiers Markdown
- [Notes](https://apps.nextcloud.com/apps/notes) -- prise de notes
  par utilisateur, synchronisation mobile
- [Appointments](https://www.srgdev.com/lab/nextcloud-appointments/)
  -- pages de réservation publiques liées au calendrier d'un
  utilisateur
- [Forms](https://apps.nextcloud.com/apps/forms) -- sondages internes
  et formulaires d'intégration
- [Contacts](https://apps.nextcloud.com/apps/contacts) -- carnets
  d'adresses personnels et partagés via CardDAV
- [Mail](https://apps.nextcloud.com/apps/mail) -- client IMAP / SMTP
  dans Nextcloud
- [Calendar](https://apps.nextcloud.com/apps/calendar) -- calendriers
  du personnel et partagés via CalDAV
- [Attendance](https://apps.nextcloud.com/apps/attendance) --
  pointage entrée / sortie pour le suivi du temps
- [Memories](https://apps.nextcloud.com/apps/memories) /
  [Photos](https://apps.nextcloud.com/apps/photos) -- chronologie
  photo et navigation par album
- [Bookmarks](https://apps.nextcloud.com/apps/bookmarks) -- signets
  partagés
- [Polls](https://apps.nextcloud.com/apps/polls) -- sondages de
  groupe et sélecteurs de date
- [News](https://apps.nextcloud.com/apps/news) -- lecteur RSS

## Comment lire cette page

Pour chaque fonction :

- **Essayez d'abord l'application Nextcloud** si vous hésitez ou si
  l'usage est léger. Empreinte plus faible, pas de modèle
  supplémentaire à déployer, et vous pouvez basculer vers
  l'application dédiée plus tard si vous en dépassez les limites.
- **Utilisez l'application dédiée de la suite** quand les limites de
  l'application Nextcloud commencent à se faire sentir, ou quand la
  fonction est centrale dans le travail quotidien et que vous avez
  besoin de plus de fonctionnalités, de vitesse ou d'intégrations.
- **Utiliser les deux** est rarement une bonne idée. Les exceptions
  sont indiquées explicitement plus bas.

Votre opérateur peut pré-activer un ensemble de départ lors du
déploiement ; vous pouvez ensuite activer ou désactiver n'importe
quelle application Nextcloud depuis le même écran.

## Clavardage et appels vidéo

Les deux gèrent canaux, messages directs, appels et partage de
fichiers. Ce qui les distingue vraiment :

| Axe | Nextcloud Talk | Rocket.Chat |
|---|---|---|
| Déploiement | Intégré à Nextcloud, aucun conteneur supplémentaire | Modèle distinct, base de données et domaine propres |
| Conçu pour | Petites équipes où le clavardage est un canal secondaire à côté des fichiers | Annuaires plus larges où le clavardage est la surface principale de collaboration |
| Expérience mobile | Inclus dans l'application mobile Nextcloud | Applications iOS / Android dédiées avec notifications push natives |
| Intégrations | Très liée à Nextcloud (Fichiers, Calendrier, Deck, Contacts, partage depuis l'app) | Place de marché d'applications et passerelles de canaux (Telegram, SMS, Matrix, etc.) |
| Canaux clients | Aucun | Widget livechat intégré pour le soutien web et l'omnicanal |
| Fédération | Fédération entre serveurs Nextcloud (Federated Cloud Sharing) | Fédération Matrix entre organisations |
| Identité | Lié aux comptes Nextcloud (qui peuvent eux-mêmes chaîner vers le SSO Keycloak) | SSO Keycloak de première classe, prêt à l'emploi |
| Granularité admin | Héritée des rôles Nextcloud | Rôles par canal, politiques de rétention, journaux d'audit |

**Utilisez Nextcloud Talk** pour les petites équipes (moins de 10
personnes) où le clavardage est un canal secondaire à côté de la
collaboration sur fichiers.

**Utilisez Rocket.Chat** quand le clavardage est la principale
surface de collaboration, quand il vous faut un widget livechat
public, quand vous voulez une application mobile dédiée soignée, ou
quand des contrôles admin fins comptent.

**Utiliser les deux** seulement pendant une fenêtre de migration.
Sinon, désactivez Talk quand Rocket.Chat devient le clavardage
d'équipe.

Référence : [Vue d'ensemble Nextcloud Talk](https://nextcloud.com/talk/) ·
[Vue d'ensemble Rocket.Chat](https://www.rocket.chat/platform-overview).

## Tâches et gestion de projet

| Nextcloud Tasks + Deck | Plane |
|---|---|
| Tasks : listes de tâches simples liées à votre calendrier CalDAV | Tickets, cycles, modules, sous-tickets, champs personnalisés |
| Deck : tableaux kanban, équivalent léger de Trello | Kanban, liste, calendrier, gantt, sprints |
| Listes personnelles ou petits partages | Espaces de travail multi-équipes, feuilles de route, jalons |
| Pas d'estimés, pas de feuille de route, pas d'automatisation | Estimés, automatisations, liens GitHub/GitLab |

**Utilisez Nextcloud Tasks** pour les tâches personnelles qui se
synchronisent avec le même calendrier vu par vos clients CalDAV.

**Utilisez Nextcloud Deck** pour les petits tableaux kanban (5-10
cartes) partagés au sein d'un département.

**Utilisez Plane** pour tout travail suivi entre plusieurs personnes,
sprints, ou dépendances externes. Plane est l'outil de gestion de
projet recommandé dans la suite.

Référence : [Nextcloud Tasks](https://apps.nextcloud.com/apps/tasks) ·
[Nextcloud Deck](https://apps.nextcloud.com/apps/deck) ·
[Plane](https://plane.so/).

## Wiki et documents partagés

| Nextcloud Collective + Notes | Outline |
|---|---|
| Collective : wiki collaboratif basé sur des fichiers Markdown dans un dossier | Wiki à base de données, pages style Notion |
| Notes : prise de notes par utilisateur, synchronise sur mobile via les apps Notes | Collections hiérarchiques, documents imbriqués |
| Cohabite avec vos fichiers (une URL, une connexion) | Domaine distinct, SSO Keycloak, recherche plus rapide |
| Versionnement via l'historique de fichiers Nextcloud | Historique de révisions intégré, commentaires, mentions |

**Utilisez Nextcloud Collective** pour les pages internes à faible
volume quand tout le reste vit déjà dans Nextcloud.

**Utilisez Nextcloud Notes** pour les notes personnelles qui se
synchronisent avec mobile.

**Utilisez Outline** pour les bases de connaissances d'entreprise,
la documentation d'intégration, ou tout ce qui demande une recherche
robuste et une expérience de lecture soignée.

Référence : [Nextcloud Collectives](https://apps.nextcloud.com/apps/collectives) ·
[Nextcloud Notes](https://apps.nextcloud.com/apps/notes) ·
[Outline](https://www.getoutline.com/).

## Pages de réservation publiques

Les deux permettent aux clients de réserver des créneaux sans compte
Nextcloud. Elles diffèrent par la forme du déploiement et le support
multi-équipe :

| Axe | [Nextcloud Appointments](https://www.srgdev.com/lab/nextcloud-appointments/) | Easy!Appointments |
|---|---|---|
| Déploiement | Une application Nextcloud, vit dans Nextcloud | Modèle distinct, base de données et domaine propres |
| Modèle de prestataire | Un utilisateur Nextcloud par page de réservation (jusqu'à 10 pages par utilisateur) | Plusieurs prestataires, services, lieux gérés depuis un seul tableau de bord |
| Calendrier | Lié au calendrier CalDAV de cet utilisateur (n'importe quel calendrier CalDAV fonctionne) | Calendriers par prestataire, synchronisables via ICS |
| Flux client | Formulaire intégrable ; confirmation/annulation bidirectionnelle par lien dans le courriel | Page de réservation publique hébergée sur le domaine de l'app ; rappels courriel + SMS |
| Idéal pour | Travailleurs autonomes, indépendants, quiconque a déjà son agenda dans Nextcloud | Entreprises multi-personnel (cliniques, salons, ateliers de réparation) |
| Paiements | Aucun | Aucun nativement (Stripe via un petit pont dans la suite) |

**Utilisez Nextcloud Appointments** quand vous travaillez seul et que
votre agenda vit déjà dans Nextcloud -- c'est la configuration la plus
légère, aucun déploiement séparé.

**Utilisez Easy!Appointments** quand plusieurs membres du personnel
ont besoin de leurs propres horaires, quand vous voulez un domaine
de réservation dédié, ou quand vous avez besoin de modéliser des
services / capacités / multi-emplacements.

Voir [Comment choisir votre outil de réservation](/how-to-pick-a-scheduler/)
pour l'arbre de décision complet de tous les besoins de réservation.

Nextcloud Calendar (le calendrier CalDAV du personnel) est
complémentaire aux deux -- il couvre les calendriers internes et les
salles de réunion, pas la réservation client. Voir la liste
Nextcloud-uniquement plus bas.

Référence : [Nextcloud Appointments](https://www.srgdev.com/lab/nextcloud-appointments/) ·
[Easy!Appointments](https://easyappointments.org/).

## Formulaires et sondages

La suite ne livre pas d'application de formulaires dédiée, donc
**Nextcloud Forms** est la voie recommandée pour tout formulaire
inter-entreprise -- bilans RH, réponses d'événements, questionnaires
d'intégration, sondages internes. Activez-le dans Nextcloud sous
Applications -> Vos applications.

| Cas d'usage | Application recommandée |
|---|---|
| Formulaires internes (RH, RSVP, sondages, intégration) | Nextcloud Forms |
| Saisie de formulaire qui déclenche un workflow (créer un contact CRM, envoyer un courriel, publier dans le clavardage) | Nœud Form Trigger de [n8n](/apps/n8n/) |
| Capture de pistes côté client liée à un pipeline de vente | Formulaire web-to-lead d'EspoCRM |
| Flux de signature électronique | [DocuSeal](/apps/docuseal/) |

Pour la plupart des besoins inter-entreprise, Nextcloud Forms est la
bonne réponse : les résultats atterrissent dans une feuille de calcul
Nextcloud, le formulaire vit à une URL publique ou réservée au
personnel, et vous n'avez pas besoin d'un déploiement séparé. Ne
sortez n8n que lorsque le formulaire doit déclencher une action
automatisée en aval.

Référence : [Nextcloud Forms](https://apps.nextcloud.com/apps/forms) ·
[n8n](https://n8n.io/) ·
[EspoCRM](https://www.espocrm.com/) ·
[DocuSeal](https://www.docuseal.com/).

## Contacts et CRM

| Nextcloud Contacts | EspoCRM (ou Twenty) |
|---|---|
| Carnets d'adresses personnels et partagés (CardDAV) | Pipeline de vente : pistes, comptes, opportunités |
| Téléphone, courriel, adresse postale, notes | Historique d'activité, tâches, appels, transactions, rapports |
| Conçu pour alimenter votre téléphone et votre client courriel | Conçu pour suivre les démarches commerciales dans le temps |

**Utilisez Nextcloud Contacts** pour le bottin du personnel et les
carnets d'adresses partagés qui se synchronisent vers les téléphones
via CardDAV.

**Utilisez EspoCRM** quand vous devez suivre les relations clients,
les opportunités de vente et l'historique d'activité. EspoCRM est le
CRM par défaut de la suite.

Les deux sont complémentaires. Utilisez Nextcloud Contacts pour
l'annuaire, EspoCRM pour la vente. Évitez de dupliquer la même
personne dans les deux sans raison précise.

Référence : [Nextcloud Contacts](https://apps.nextcloud.com/apps/contacts) ·
[EspoCRM](https://www.espocrm.com/) ·
[Twenty](https://twenty.com/).

## Courriel

Nextcloud Mail est un **client IMAP/SMTP**, pas un serveur de
courriel. catena n'héberge pas le courriel. Nextcloud Mail peut se
connecter à votre fournisseur courriel existant (Microsoft 365,
Google Workspace, mailbox.org, etc.) pour que votre équipe lise et
envoie du courriel depuis Nextcloud.

Référence : [Nextcloud Mail](https://apps.nextcloud.com/apps/mail).

## Applications Nextcloud sans équivalent

Celles-ci n'ont pas d'équivalent direct dans la suite. Activez-les
dans Nextcloud (Applications -> Vos applications) au besoin.

- **Calendar** -- calendriers du personnel et partagés via CalDAV.
  Le choix par défaut pour la planification interne, les salles de
  réunion et la disponibilité d'équipe.
- **Attendance** -- pointage entrée/sortie pour le suivi du temps.
  Utile pour les petites entreprises qui ont besoin d'un simple
  registre de présence du personnel sans déployer un système RH /
  paie complet.
- **Memories / Photos** -- chronologie photo et navigation par album
  pour les images de votre Nextcloud. Utile si votre entreprise
  stocke beaucoup d'actifs visuels.
- **Bookmarks** -- signets partagés au sein de votre équipe. Utile
  pour des collections de liens organisées.
- **Polls** -- sondages rapides en groupe (sélecteurs de date, choix
  multiples). Équivalent léger de Doodle.
- **News** -- lecteur RSS. Spécialisé mais solide.

## Dans le doute, commencez par l'application Nextcloud

Les applications Nextcloud ci-dessus sont gratuites à activer,
légères en ressources et faciles à désactiver si elles ne
conviennent pas. **Si vous n'êtes pas certain que votre équipe a
besoin de l'application dédiée de la suite, essayez d'abord la
version Nextcloud** -- pendant une semaine ou deux, avec les
personnes qui l'utiliseront vraiment. Vous saurez rapidement si
elle couvre le besoin ou si les limites commencent à se faire
sentir.

Si l'application Nextcloud suffit, vous économisez un déploiement,
un domaine et une surface de connexion supplémentaire. Si elle ne
suffit pas, l'application dédiée n'est qu'à une demande de votre
opérateur -- et vos données côté Nextcloud restent en place pendant
le changement.

Parlez à votre opérateur dès que vous voulez activer, désactiver
ou changer l'application qui gère une fonction donnée. Il peut
ajuster la liste activée en un seul lot.
