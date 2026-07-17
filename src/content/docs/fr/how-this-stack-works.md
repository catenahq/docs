---
title: "Comment fonctionne cette suite logicielle"
description: "Une visite guidée, en langage clair, de ce qui tourne sur"
---

Une visite guidée, en langage clair, de ce qui tourne sur
`your VPS` et de la façon dont les pièces s'emboîtent.
Vous n'avez rien à mémoriser -- c'est ici pour que, si quelque chose
cloche, vous ayez un modèle mental du premier endroit à regarder.

## La version en un paragraphe

Quand un membre du personnel tape une de vos URLs dans son navigateur,
la requête entre par **Cloudflare** (qui cache l'adresse réelle de
votre VPS), traverse un tunnel privé jusqu'à `your VPS`,
frappe un routeur (**Traefik**) qui déduit à quelle application elle
est destinée, puis est arrêtée par **Keycloak** -- votre couche
d'identité -- pour vérifier que la personne est bien connectée et dans
la bonne équipe. Ce n'est qu'ensuite que la requête atteint
l'application elle-même. Pendant ce temps, un autre processus
sauvegarde discrètement tout vers votre seau S3 à chaque sauvegarde,
et un moniteur teste chaque service chaque minute pour attraper les
pannes avant vous.

## Les services en bref

| Service | Ce qu'il fait pour vous |
|---|---|
| **Cloudflare** | Votre porte d'entrée publique. Cache l'IP du VPS, émet les certificats HTTPS, absorbe le trafic malveillant. |
| **Tunnel Cloudflare** | Un lien privé entre Cloudflare et votre VPS. Rien sur `your VPS` n'est exposé directement à Internet. |
| **Tailscale** | Votre accès privé à la machine. Un réseau maillé réservé aux machines autorisées -- c'est par là que vous (et toute personne que vous invitez pour vous aider) vous connectez en SSH à `your VPS` pour la maintenance ou les enquêtes, et votre voie de retour si les tableaux de bord web tombent un jour. SSH public est fermé ; sans Tailscale (ou Cloudflare, pour le trafic du personnel), rien n'atteint le VPS. Vous gardez le contrôle : Tailscale peut être désactivé ou retiré par vous à tout moment depuis la console de votre fournisseur VPS (ou physiquement, pour du matériel sur site). |
| **Traefik** | Le standard téléphonique. Lit l'URL de chaque requête et l'oriente vers la bonne application. |
| **Keycloak** | Votre serveur d'identité. Gère la connexion, les réinitialisations de mot de passe et le contrôle d'accès par équipe. La seule page de connexion que vos utilisateurs verront. |
| **Portainer** | Le panneau de déploiement. Là où les nouvelles applications sont installées et mises à jour. Vous pouvez consulter les journaux ici. |
| **Vos applications** | Tout ce que vous avez déployé via Portainer -- un conteneur par application, tournant sur un réseau Docker privé. |
| **Gatus** | Le moniteur de santé. Teste chaque service toutes les minutes sous deux angles : à l'interne (le conteneur répond-il ?) et à l'externe (le chemin complet de Cloudflare à l'application fonctionne-t-il ?). |
| **Healthchecks** | Le centre de notifications. Toutes les alertes de Gatus (services en panne) et du moteur de sauvegarde (sauvegarde manquée) arrivent ici, et vous les branchez aux canaux que vous voulez -- courriel, Slack, Discord, ntfy, et une trentaine d'autres. Voir [Comment les alertes vous parviennent](#comment-les-alertes-vous-parviennent). |
| **Homepage** | Le tableau de bord. Rassemble les liens et les statuts sur une seule page. |
| **OliveTin** | Actions en un clic, restreintes au groupe `administrators` (équipe administratrice). Le bouton "synchroniser maintenant", par exemple. |
| **Restic -> S3** | Le moteur de sauvegarde. Prend une image chiffrée et dédupliquée de vos données à chaque sauvegarde, l'envoie vers un seau de stockage que vous possédez. |

## Le parcours d'une requête

Voici ce qui se passe quand un membre du personnel ouvre, par exemple,
`https://paperless.yourdomain.com` :

```mermaid
flowchart LR
    U[Navigateur de l'utilisateur]
    CF[Périphérie<br/>Cloudflare]
    TUN[Tunnel Cloudflare<br/>sur le VPS]
    T[Routeur<br/>Traefik]
    A[Keycloak<br/>vérif. connexion]
    APP[Votre application<br/>ex. Paperless]

    U -->|1. requête HTTPS| CF
    CF -->|2. via tunnel privé| TUN
    TUN -->|3. dans le VPS| T
    T -->|4. utilisateur connecté ?| A
    A -->|5. oui, rôle X| T
    T -->|6. transmet la requête| APP
    APP -->|7. réponse| U
```

Si l'étape 5 répond "non" (l'utilisateur n'est pas connecté, ou
n'est pas dans la bonne équipe), il est redirigé vers la page de
connexion Keycloak -- il ne voit jamais l'application avant d'avoir
prouvé son identité.

## Comment vos données sont protégées

```mermaid
flowchart LR
    APPS[Vos applications<br/>sur le VPS]
    PG[(Bases Postgres)]
    VOL[(Volumes Docker<br/>fichiers des apps)]
    RESTIC[Moteur Restic]
    S3[(Votre seau S3<br/>chiffré, dédupliqué)]
    HC[Healthchecks<br/>déclencheur d'alerte]
    YOU[Vous + votre équipe<br/>sur les canaux choisis]

    APPS --> PG
    APPS --> VOL
    PG --> RESTIC
    VOL --> RESTIC
    RESTIC -->|chaque sauvegarde| S3
    RESTIC -->|ping après succès| HC
    HC -.->|aucun ping à l'heure| YOU
```

Deux points à retenir :

- Le seau S3 est **le vôtre**. Vous configurez les identifiants sur le
  VPS à l'installation, et le compte et la facturation avec le
  fournisseur de stockage restent à votre nom -- rien dans les
  sauvegardes ne dépend de quelqu'un d'autre.
- La sauvegarde est **chiffrée sur le VPS avant d'en sortir**, avec
  une clé que vous conservez séparément du VPS (elle fait partie de
  votre [jeu de clés de récupération](/fr/disaster-prevention/)). Même
  quelqu'un avec un accès complet au seau S3 ne peut pas lire la
  sauvegarde sans cette clé.

## Comment la surveillance attrape les problèmes

Gatus exécute deux sondes par service chaque minute :

- **Sonde interne** -- le conteneur répond-il sur le réseau Docker
  privé ? Si non, l'application elle-même est en panne.
- **Sonde publique** -- le chemin complet (Cloudflare -> Tunnel ->
  Traefik -> Keycloak -> application) retourne-t-il la réponse
  attendue ? Si celle-ci échoue mais que la sonde interne réussit,
  quelque chose entre Cloudflare et votre application dysfonctionne --
  un enregistrement DNS, le tunnel, la couche de connexion.

Deux sondes, deux scénarios de panne distincts. Quand une alerte
tombe, celle qui se déclenche vous indique quelle moitié de la suite
regarder en premier.

## Comment les alertes vous parviennent

Chaque sonde Gatus qui passe au rouge envoie une notification via
**Healthchecks** à [`checks.yourdomain.com`](https://checks.yourdomain.com).
Chaque service a sa propre vérification, nommée `gatus-<service>`
(p. ex. `gatus-actualbudget`, `gatus-homepage-internal`), donc la
notification reçue nomme directement le service en panne. Les
rétablissements déclenchent aussi une notification, donc vous savez
quand le problème est réglé sans avoir à rafraîchir Gatus.

Par défaut, les alertes sont poussées via **ntfy** (un service de
notifications push gratuit, configuré automatiquement à l'installation,
aucun compte requis). Pointez-le vers votre téléphone et **ajoutez les
autres canaux que vous voulez** -- configuration unique :

1. Connectez-vous à [`checks.yourdomain.com`](https://checks.yourdomain.com)
   (même identifiant Keycloak que pour les autres services).
2. **Settings -> Integrations -> Add Integration**. Choisissez le canal
   voulu : courriel, Slack, Discord, Telegram, Microsoft Teams,
   Pushover, ntfy, Matrix, PagerDuty, un webhook, ou n'importe lequel
   des ~30 autres. Collez la cible (adresse courriel, URL webhook
   Slack, etc.) et enregistrez. Les nouvelles intégrations s'appliquent
   automatiquement à toutes les vérifications `gatus-*` -- pas besoin de
   les cocher une par une.
3. Si vous voulez un canal sur *certains* services seulement, ouvrez la
   vérification `gatus-<service>` spécifique, cliquez sur
   **Integrations**, et cochez uniquement ceux voulus pour ce service.
   Utile si p. ex. le portail du personnel en panne doit vous joindre
   par SMS mais le tableau de bord interne non.
4. Faites pareil pour **Daily backup ping** si vous voulez être
   notifié des sauvegardes manquées.

Le retrait d'un canal se fait de la même façon. Le canal par défaut
intégré n'est pas exposé dans cette interface -- il reste en place peu
importe ce que vous ajoutez ou retirez. Les nouveaux services
surveillés (p. ex. une application que vous venez de déployer) reçoivent
leur propre vérification à la première panne, avec vos canaux
automatiquement rattachés.

## Mises à jour et retour en arrière

Vos applications et l'infrastructure qui les fait tourner sont
rafraîchies selon un horaire hebdomadaire -- en dehors des heures de
bureau, avec un retour en arrière automatique si quelque chose se met
à échouer.

Toutes les applications ne sont pas traitées de la même façon. Ça
dépend de comment le tag d'image est épinglé dans la configuration
de l'application :

| Le tag ressemble à...   | Exemple              | Mise à jour auto ? |
|---|---|---|
| Version complète      | `paperless:2.12.3`   | **Oui** -- avec retour en arrière auto en cas d'échec. |
| Épingle majeure seule | `postgres:16-alpine` | Non. Épinglé par le système ; ignoré par la mise à jour hebdomadaire. |
| Flottant              | `nginx:latest`       | Non. Dangereux à toucher sans surveillance. |

Pour les applications épinglées à une version complète, chaque
service peut optionnellement étiqueter une politique dans son
fichier compose :

- `vps.auto-update=patch` *(défaut)* -- accepte uniquement les
  correctifs (p. ex. 2.12.3 -> 2.12.4).
- `vps.auto-update=minor` -- accepte aussi les versions mineures
  dans la même série majeure (2.12.3 -> 2.13.0).
- `vps.auto-update=major` -- accepte tout ce qui est plus récent,
  y compris les sauts de version majeure.
- `vps.auto-update=off` -- saute complètement ce service.

Si vous mettez l'étiquette sur une app avec un tag flottant ou
majeur-seul, elle est **silencieusement ignorée** -- la règle
d'épinglage du système l'emporte. C'est délibéré : un retour en arrière
automatique a besoin d'une version précédente connue-bonne, et un tag
flottant n'en fournit pas.

**Ce qui se passe quand une mise à jour casse :**

1. Les sondes de santé Gatus détectent la régression en ~3 minutes
   (sondes interne ET publique).
2. La mise à jour revient au service à la version connue-bonne
   précédente et le redéploie.
3. La mauvaise version est mémorisée -- la prochaine exécution essaie
   la version *suivante*, pas celle qui vient de casser.
4. Vous êtes alerté via **Healthchecks** avec le nom du
   service et la version qui a échoué. La version exécutée par
   chaque service est visible sur la **surface de monitoring
   Gatus** à `monitor.<votre-zone>` -- un service en quarantaine
   affiche le tag épinglé précédent avec la mauvaise version
   annotée à côté.

Vous n'avez rien à faire. L'application revient d'elle-même, alors
vous examinez la cause à votre rythme -- ce n'est pas une urgence de
3 h du matin.

Si vous préférez sauter une semaine de mises à jour (p. ex. vous
êtes en démo et rien ne doit changer), vous pouvez **mettre en
pause** la mise à jour depuis le panneau d'actions OliveTin -- le
statut reste visible sur la surface Gatus jusqu'à ce que vous
repreniez.

## Votre rôle

Vous n'avez pas à toucher Cloudflare, Traefik, le tunnel ni le moteur
de sauvegarde. Votre surface d'interaction quotidienne est :

- **Keycloak** -- ajouter ou retirer du personnel, réinitialiser des
  mots de passe, assigner les personnes aux équipes (voir
  [Gérer les utilisateurs et les rôles](/fr/manage-users-and-roles/)).
- **Portainer** -- déployer de nouvelles applications avec des étiquettes
  de contrôle d'accès (voir
  [Gérer les applications](/fr/manage-apps/)).
- **Homepage** -- coup d'œil rapide sur la santé des services et les
  liens épinglés.
- **Healthchecks** -- ajouter les canaux de notification que vous
  souhaitez recevoir (voir
  [Comment les alertes vous parviennent](#comment-les-alertes-vous-parviennent)).
- **OliveTin** (administrateurs uniquement) -- cliquer sur un bouton
  nommé pour déclencher une action prédéfinie (comme
  "resynchroniser le tableau de bord
  maintenant"). Visible aux membres du personnel dans le groupe
  Keycloak `administrators` ; le personnel non-administrateur voit
  la tuile sur le tableau de bord mais y accéder le redirige vers
  l'écran de connexion.

Tout le reste tourne tout seul. Si quelque chose s'arrête, Gatus vous
alerte avant qu'un membre du personnel ne vous le signale.
