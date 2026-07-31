---
title: "Gérer les applications"
description: "Déployez de nouvelles applications via Portainer et posez les étiquettes qui décident qui peut atteindre chacune et où elle est publiée."
---

Lorsque vous déployez une nouvelle application via Portainer, vous
contrôlez qui peut y accéder en ajoutant des étiquettes au fichier
compose. La suite lit ces étiquettes et provisionne automatiquement les
bons groupes et politiques Keycloak -- vous ne touchez jamais à l'API
d'Keycloak directement.

Vous accédez à Portainer à `portainer.yourdomain.com` (la même connexion
SSO que vos autres outils ; seuls les administrateurs peuvent l'ouvrir).
C'est le plan de contrôle des conteneurs de votre VPS -- l'endroit où vous
créez, déployez et gérez les stacks d'applications.

## Que puis-je déployer ?

Tout ce qui fournit un Docker Compose fonctionne. Quelques sources
utiles pour choisir ce que vous auto-hébergez :

- **Les App Templates de votre VPS** -- ouvrez Portainer à
  `portainer.yourdomain.com` et regardez sous **App Templates**. Nous
  pré-câblons un ensemble d'applications entièrement prêtes (SSO,
  stockage, réseau, étiquettes, SSL déjà configurés). Commencez par là
  pour les applications courantes -- un clic pour déployer. Catalogue
  complet avec notes par application :
  **[Applications pré-configurées](/fr/apps/)**.
- **[openalternative.co](https://openalternative.co)** -- un annuaire
  d'alternatives open-source aux SaaS populaires (p. ex.
  "alternatives à Notion", "alternatives à Slack"). Chaque
  entrée renvoie au dépôt du projet et à ses instructions
  d'auto-hébergement. Sélection plus large mais vous faites plus
  de vérifications vous-même.
- **[awweso.me](https://awweso.me)** -- une interface filtrable
  pour la liste GitHub `awesome-selfhosted` (plus de 1300 projets).
  Affiche les étoiles GitHub et l'activité récente de chaque
  entrée, pour repérer d'un coup d'œil les projets vivants et
  populaires. La sélection la plus large des trois.

Quoi que vous choisissiez, les étiquettes de la suite
(`vps.auth.groups`, `vps.auth.mode`, `vps.auth.oidc`,
`vps.auto-update`, `vps.homepage.*`) s'appliquent par-dessus --
elles filtrent l'accès, câblent le SSO, marquent les mises à jour
et alimentent le tableau de bord, peu importe d'où vient le compose.

Avant de déployer quelque chose de nouveau, vérifiez les **App
Templates** dans Portainer -- nous pré-câblons quelques applications
prêtes à l'emploi (voir "Applications pré-configurées prêtes à
activer" plus bas) qui couvrent peut-être déjà votre besoin.

## Démarrage rapide

Déployer une nouvelle application (par exemple, Paperless pour votre
équipe de comptabilité) :

1. Connectez-vous à `portainer.yourdomain.com` (Portainer).
2. Créez un nouveau Stack. Collez votre fichier compose.
3. Ajoutez un bloc `labels:` (pour le contrôle d'accès et l'URL
   publique) ET un alias `catena-network` sur le service public, en
   minuscules avec traits d'union (`paperless` -> `paperless`, `MyApp` ->
   `myapp`, `My-App` -> `my-app`). Traefik utilise cet alias pour
   atteindre votre conteneur ; sans lui le service retourne 502.
   L'étiquette `vps.route.host` est ce qui publie l'application à une URL
   publique (il n'y a pas d'onglet Domains distinct).

   ```yaml
   services:
     paperless:
       image: paperlessngx/paperless-ngx:latest
       labels:
         - "vps.auth.groups=accounting"
         - "vps.route.host=paperless.yourdomain.com"
       networks:
         catena-network:
           aliases:
             - paperless        # alias en minuscules avec traits d'union pour Traefik
   networks:
     catena-network:
       external: true
   ```

4. Déployez le stack.

En moins de 5 minutes, `dashboard-sync` détecte la nouvelle application,
crée le groupe `accounting` dans Keycloak (s'il n'existe pas), câble
le middleware forward-auth et rend l'application accessible -- mais
uniquement pour les utilisateurs du groupe `accounting`.

## Aide-mémoire des étiquettes

Chaque étiquette, son défaut (entre parenthèses), ses valeurs
acceptées et ce qu'elle fait. Suivez une étiquette vers sa section plus
bas pour l'explication complète. Toutes sont optionnelles ; une
application sans étiquette `vps.auth.*` n'est accessible que par
`admin` (refus par défaut).

| Étiquette (défaut) | Valeurs | Ce qu'elle fait |
|---|---|---|
| [`vps.route.host`](#démarrage-rapide)<br>(aucun) | un FQDN public, p. ex. `app.yourdomain.com` | Publie l'application à cette URL |
| [`vps.auth.groups`](#vpsauthgroupscsv)<br>(`admin` seulement) | csv de `staff`, `client`, noms de départements, `visitor`, `admin` | Qui peut atteindre l'application |
| [`vps.auth.mode`](#vpsauthmodemode)<br>(`admin-only`) | `public` \| `private` \| `admin-only` | Raccourci pour un ensemble de groupes courant (ceci OU `vps.auth.groups`) |
| [`vps.auth.protected`](#vpsauthprotectedtrue)<br>(`false`) | `true` \| `false` | Marque une application qui ne doit jamais devenir publique |
| [`vps.auth.oidc`](#forward-auth-ou-oidc)<br>(`false`) | `true` \| `false` (plus `vps.auth.oidc.redirect_uris`, `vps.auth.oidc.scopes` optionnel) | Ajoute une connexion OIDC native par-dessus la barrière |
| [`vps.auto-update`](#choisir-lagressivité-des-mises-à-jour)<br>(`patch`) | `patch` \| `minor` \| `major` \| `off` | Jusqu'où l'updater peut monter l'image |
| [`vps.homepage.*`](#personnaliser-lapparence-de-votre-application-sur-le-tableau-de-bord)<br>(tuile affichée) | `name`, `icon`, `description`, `hidden` | Présentation de la tuile du tableau de bord |
| [`vps.display-name`](#remplacer-laffichage-de-votre-application-sur-la-page-détat-gatus)<br>(nom court de l'image) | toute chaîne | Nom affiché sur la carte d'état Gatus |

Pas une étiquette, mais requis pour le routage : donnez au service
public un alias `catena-network` en minuscules avec traits d'union,
sinon Traefik ne peut pas l'atteindre (502). Voir
[Démarrage rapide](#démarrage-rapide).

## Applications pré-configurées prêtes à activer

Portainer fournit un catalogue **App Templates** sur votre VPS contenant
des applications prêtes à déployer, correctement câblées dès le
départ -- authentification, SSO, stockage, réseau, étiquettes, SSL.
Cliquez Deploy sur celles que vous voulez, ignorez les autres.

Catalogue complet avec notes par application :
**[Applications pré-configurées](/fr/apps/)**.

## Applications multi-conteneurs (exemple : Nextcloud)

Une application mono-image ne nécessite que le rattachement à
`catena-network` illustré plus haut. Dès que votre compose contient
**plusieurs services** -- une vraie application comme Nextcloud embarque
Postgres et Redis à côté du processus web -- la règle de réseau est :

- **Seul le service public** (celui auquel Traefik doit router le
  trafic) rejoint `catena-network`. L'ajouter aussi au réseau
  `default` du compose lui permet de parler à ses voisins.
- **Les services internes** (base de données, cache, worker cron)
  restent uniquement sur `default`. Ils n'ont pas besoin d'être
  joignables par Traefik, et les mettre sur `catena-network` les
  exposerait à tous les autres projets hébergés sur le même VPS.

Exemple concret -- Nextcloud avec son propre Postgres, Redis et worker
cron :

```yaml
services:
  app:
    image: nextcloud:33.0.3-apache
    environment:
      POSTGRES_HOST: db
      POSTGRES_DB: nextcloud
      POSTGRES_USER: nextcloud
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      REDIS_HOST: redis
      NEXTCLOUD_TRUSTED_DOMAINS: nextcloud.yourdomain.com
    volumes:
      - nc-data:/var/www/html
    labels:
      - "vps.auth.mode=private"
      - "vps.auth.groups=staff"
    networks:
      catena-network:          # Traefik y accède
        aliases:
          - nextcloud           # alias en minuscules avec traits d'union pour Traefik
      default: {}               # atteindre db, redis, cron via les noms voisins

  db:
    image: postgres:16.13-alpine
    environment:
      POSTGRES_DB: nextcloud
      POSTGRES_USER: nextcloud
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - default                 # PAS sur catena-network -- interne uniquement

  redis:
    image: redis:7.4.9-alpine
    networks:
      - default

  cron:
    image: nextcloud:33.0.3-apache
    entrypoint: /cron.sh        # exécute php -f cron.php toutes les 5 min
    volumes:
      - nc-data:/var/www/html
    networks:
      - default

volumes:
  nc-data:
  db-data:

networks:
  catena-network:
    external: true
  # `default` est implicite et propre au projet ; pas besoin de le déclarer.
```

**Pourquoi deux réseaux sur `app`, pas un seul** : si `app` ne
rejoignait que `catena-network`, il pourrait atteindre Traefik mais
pas `db`, `redis` ou `cron`. S'il ne rejoignait que `default`, Traefik
ne le verrait pas et renverrait une 502. Il faut les deux.

**Pourquoi `db`, `redis` et `cron` restent hors de `catena-network`** :
tous les projets sur cet hôte partagent ce réseau. En gardant les
services internes sur le `default` propre au projet, les conteneurs
d'un autre projet ne peuvent pas joindre votre base Nextcloud en
devinant le nom du service -- l'isolation réseau de Docker s'en charge.

**Adressage entre voisins** : depuis `app`, Postgres est joignable à
`db:5432` et Redis à `redis:6379` (c'est pourquoi les variables
d'environnement utilisent `POSTGRES_HOST: db` et `REDIS_HOST: redis`).
Le DNS intégré de Docker résout automatiquement les noms de services
sur le réseau `default`.

## Applications qui stockent beaucoup de fichiers

Quelques applications -- Nextcloud en est l'exemple type -- existent
précisément pour héberger de gros volumes de données utilisateur. Une
équipe qui se sert de Nextcloud en remplacement d'une synchro de
postes de travail peut facilement accumuler des centaines de Go, voire
plus.

Ça devient un problème pour les sauvegardes. Chaque sauvegarde
copie chaque octet des données applicatives dans le dépôt hors-site. À
l'échelle du To, ça prend des heures, coûte de l'argent en stockage et
en transfert, et rend une restauration complète pénible.

Pour cette famille d'applications, déployez la **variante avec
stockage S3** (le modèle Nextcloud à stockage S3 dans App Templates) :
les fichiers vivent directement dans un bucket d'objets qui vous
appartient, pas dans un volume local du VPS. Chaque sauvegarde ne copie
alors que le code et la
configuration de l'application (quelques centaines de Mo), et le
bucket gère l'historique des fichiers de son côté.

Ce que ça change pour vous :

- **Rien dans l'interface.** Pour vos utilisateurs, l'application a
  l'air exactement pareille. Même connexion, même explorateur de
  fichiers, tout pareil.
- **Votre sauvegarde est en deux morceaux, pas un.** Le code, la
  config et la base de données restent dans chaque sauvegarde ; les
  fichiers vivent dans le bucket S3 (avec 30 jours d'historique de
  suppression intégrés). Les deux vous appartiennent.
- **La restauration est plus rapide.** Si le VPS brûle, vos fichiers
  survivent indépendamment -- le nouveau VPS se reconnecte simplement
  au même bucket, et chaque fichier y est déjà.

Vous ne câblez pas la plomberie du bucket à la main : pour un
déploiement avec beaucoup de fichiers, choisissez le modèle à stockage
S3 plutôt que le modèle ordinaire et il configure le stockage d'objets
pour vous.

## Garder vos applications à jour

Sur une base hebdomadaire, votre VPS vérifie si de nouvelles versions
existent pour chaque image déployée, récupère celles qui respectent
votre politique, redéploie, fait un contrôle de santé et annule
(rollback) si le contrôle échoue. Vous n'avez rien à faire -- ça tourne
dans la fenêtre de mise à jour, en dehors des heures ouvrables, et
vous n'êtes alerté qu'en cas de problème.

**Mais seules les applications épinglées à une version complète sont
gérées.** La suite refuse de toucher à toute image dont le tag
n'identifie pas complètement une version. C'est volontaire : une mise à
jour automatique incapable de revenir en arrière sur une valeur connue
est pire que pas de mise à jour du tout.

### La forme du tag détermine l'éligibilité

| Tag d'image                                  | Géré ?  |
|----------------------------------------------|---------|
| `nextcloud:30.0.2-apache`                    | ✓ oui   |
| `nextcloud:v30.0.2` (avec ou sans `v`)       | ✓ oui   |
| `postgres:16.4.2-alpine`                     | ✓ oui   |
| `redis:7.4`                                  | ✗ non (épinglage partiel) |
| `postgres:16-alpine`                         | ✗ non (épinglage partiel) |
| `nginx:alpine`                               | ✗ non (flottant) |
| `ubuntu:latest`                              | ✗ non (flottant) |
| `monapp` (sans tag)                          | ✗ non (flottant, implicitement `latest`) |

Si votre tag est dans la colonne ✗, l'image déployée reste celle qui
tourne jusqu'à ce que vous redéployiez manuellement. Aucun correctif
de sécurité, aucun correctif de bug -- mais aussi aucune surprise la
nuit où un mauvais release est publié. Vous gérez le calendrier de
mise à jour de bout en bout.

### Choisir l'agressivité des mises à jour

Sur chaque service public, l'étiquette `vps.auto-update` délimite la
plage des changements de version que l'updater est autorisé à
appliquer :

```yaml
labels:
  - "vps.auto-update=patch"     # défaut -- 1.2.3 -> 1.2.9 (corrections seulement)
  - "vps.auto-update=minor"     # 1.2.3 -> 1.9.0 (nouvelles fonctionnalités OK)
  - "vps.auto-update=major"     # 1.2.3 -> 2.0.0 (changements de rupture OK)
  - "vps.auto-update=off"       # figer sur le tag déployé
```

Valeurs par défaut, par type de service :

- **Applications clientes** (les vôtres) : `patch`. Conservateur --
  correctifs de bugs et mises à jour de sécurité, aucun changement de
  comportement.
- **Infrastructure de base** (Keycloak, Portainer, Traefik,
  Gatus, etc.) : `patch+minor`, pour que les correctifs de sécurité
  arrivent d'eux-mêmes.

Sauf raison contraire, laisser l'étiquette non définie sur vos apps
est le bon choix. Vous recevrez les correctifs de sécurité
automatiquement.

### Ce que fait concrètement le "rollback automatique"

Après chaque service mis à jour, l'updater exécute une vérification
de santé de base (même contrôle que le drill de reprise) : le conteneur
répond-il, la page renvoie-t-elle 2xx/3xx, le temps de réponse
reste-t-il raisonnable. Si un élément échoue, le tag est remis à la
dernière bonne version, redéployé, et vous recevez une alerte
ntfy avec le nom du service et la mauvaise version. Le passage
suivant se souvient de la mauvaise version et la saute --
vous ne retomberez pas sur le même mauvais release en boucle.

Pour voir l'état en cours (en attente / rollback récents /
quarantaine) : le tableau de bord Gatus affiche la version en cours
d'exécution sur chaque carte de service -- un épinglage bloqué se
repère d'un coup d'œil. L'onglet **Maintenance** de votre tableau de
bord porte le résumé complet (bumps échoués, versions en
quarantaine, prochaine exécution planifiée).

### Quand tout ceci compte

Utilisez un vrai tag `X.Y.Z` sur chaque service public. Si votre
éditeur ne publie que `:latest` ou `:stable`, soit vous épinglez à un
digest et mettez à jour manuellement, soit vous assumez de sortir du
filet de sécurité. Le `compose-lint` de la suite détecte les tags
non-semver au moment du déploiement et vous le rappelle ; la page
d'état Gatus affiche la version concrète en cours d'exécution par
service, ce qui rend toute dérive facile à repérer.

## Référence des étiquettes `vps.auth.*`

### `vps.auth.groups=<csv>`

Liste séparée par virgules de noms de groupes Keycloak autorisés. Un
utilisateur appartenant à AU MOINS UN des groupes listés passe
(sémantique OU). Le groupe `admin` est TOUJOURS autorisé implicitement
-- un administrateur n'est jamais verrouillé hors d'une application par
une étiquette.

Les valeurs que vous pouvez lister :

- **`visitor`** -- un mot-clé spécial signifiant **public, sans aucune
  connexion**. Ce n'est pas un vrai groupe ; voir la note plus bas.
- **`client`** -- vos utilisateurs externes (clients, partenaires).
- **`staff`** -- vos employés. La base pour votre équipe.
- **tout sous-groupe de `staff`** -- par nom (`accounting`,
  `engineering`, ...), pour un accès plus fin.
- **`admin`** -- les personnes qui opèrent le serveur. Toujours autorisé
  implicitement, vous n'avez donc jamais à le lister.

**Exemples :**

```yaml
labels:
  - "vps.auth.groups=accounting"             # comptabilité seulement (+admin)
  - "vps.auth.groups=accounting,engineering" # l'un ou l'autre département (+admin)
  - "vps.auth.groups=staff"                  # tous les employés (+admin)
  - "vps.auth.groups=client,staff"           # utilisateurs externes + employés
  - "vps.auth.groups=visitor"                # PUBLIC -- sans connexion (voir note)
```

**`visitor` signifie public.** Lister `visitor` rend l'application
accessible sans aucune authentification (c'est un mot-clé d'étiquette,
pas une vraie connexion). Mélanger `visitor` avec d'autres groupes est
contradictoire -- `visitor` l'emporte et l'application est publique.

**Les groupes ne sont PAS créés automatiquement.** Un groupe nommé ici
doit exister dans Keycloak et avoir des membres, sinon personne (sauf
`admin`) ne peut accéder à l'application. Consultez d'un coup d'oeil qui
peut atteindre quoi dans l'onglet Accès de votre tableau de bord, et
ajoutez des membres dans Keycloak (lien depuis l'onglet Accès).

### `vps.auth.mode=<mode>`

Un raccourci pour les ensembles de groupes courants. Utilisez ceci OU
`vps.auth.groups`.

| Mode | Signification |
|---|---|
| `public` | Aucune authentification -- quiconque a l'URL. Identique à `vps.auth.groups=visitor`. À utiliser UNIQUEMENT pour des services vraiment publics (site vitrine, page d'accueil). |
| `private` | Protégé par Keycloak ; `client` + `staff` (+ `admin`) peuvent accéder. Ajoutez un `vps.auth.groups` explicite pour restreindre à un département. |
| `admin-only` | Protégé par Keycloak ; `admin` uniquement. |

**La posture par défaut (aucune étiquette) est le REFUS.** Une
application déployée sans aucune étiquette `vps.auth.*` est accessible
uniquement par `admin` -- inaccessible à tous les autres niveaux. C'est
sécurisé par défaut : vous optez explicitement pour un accès plus large
en ajoutant `vps.auth.groups` (ou `vps.auth.mode`). Une application sans
étiquette qui devrait être accessible à votre équipe lui retournera 403
jusqu'à ce que vous ajoutiez `vps.auth.groups=staff` (ou le bon
département).

### `vps.auth.protected=true`

Marque une application sensible qui ne doit JAMAIS être publique. Si une
application `protected` est résolue en public (par exemple si quelqu'un
ajoute `vps.auth.mode=public`), l'onglet Accès la signale par un
avertissement garde-fou pour que l'erreur soit détectée avant la mise en
service. Ajoutez-la à tout ce qui contient des données confidentielles.

```yaml
labels:
  - "vps.auth.groups=accounting"
  - "vps.auth.protected=true"
```

## Ce que dashboard-sync fait pour vous

Toutes les 5 minutes (via un timer systemd), `dashboard-sync.service` :

1. Lit les étiquettes de chaque conteneur d'application en cours
   d'exécution (via `docker ps`).
2. Pour chaque application, analyse ses étiquettes `vps.*` du compose.
3. Réconcilie Keycloak :
   - S'assure que les groupes listés existent.
   - S'assure que la barrière oauth2-proxy de l'application autorise
     exactement la liste `vps.auth.groups` actuelle.
4. Écrit le fichier de route dynamique Traefik
   (`*-auto-gate.yml`) EN DERNIER, de sorte que si une étape
   Keycloak échoue, la route n'est pas écrite et l'application reste
   inaccessible (échec fermé, non ouvert).

## Modes de défaillance à connaître

- **API Keycloak inaccessible pendant la synchronisation.**
  dashboard-sync journalise l'erreur, n'écrit pas la route Traefik,
  réessaie au tick suivant. L'application reste 404 jusqu'au
  rétablissement d'Keycloak.
- **Vous avez mal tapé un nom de groupe.** Un groupe portant ce nom est
  créé automatiquement (vide). Vous le remarquerez car l'application
  retourne 403. Correction : renommez le groupe dans l'interface
  Keycloak, ou corrigez l'étiquette dans Portainer et redéployez.
- **Vous avez retiré l'étiquette mais gardé l'application.** Au
  prochain sync, les liaisons de politique reviennent à
  `admin` (catchall). Personne sauf les admins ne peut y
  accéder. Intentionnel -- échec fermé.
- **Deux applications avec le même nom d'hôte mais des groupes
  différents.** La dernière liaison de politique écrite l'emporte. Ne
  faites pas ça ; donnez un nom d'hôte unique à chaque application.

## Vérifications en libre-service

- `https://auth.yourdomain.com` -> Directory -> Groups. Vos groupes
  définis apparaissent ici. Ajoutez / retirez des membres via
  l'interface.
- `https://portainer.yourdomain.com` -> votre stack -> Logs.
  Après le déploiement, les logs montrent les appels forward-auth
  Keycloak (203 -> injection d'en-têtes -> upstream).
- `https://monitor.yourdomain.com` (Gatus). Votre
  application reçoit une entrée dans le groupe `client-apps` en moins
  de 5 minutes, sondée toutes les 60 secondes. Rouge = application
  hors service OU sync pas encore exécuté.

## Hors portée

Ces étiquettes contrôlent l'*authentification* (qui peut accéder à
l'application). Elles ne contrôlent PAS l'*autorisation* (ce que les
utilisateurs peuvent faire dans l'application). Les applications ayant
leur propre modèle de permissions (utilisateurs Paperless, groupes
Nextcloud, etc.) conservent ce modèle ; Keycloak garde simplement la
porte.

## Forward-auth ou OIDC

Les étiquettes ci-dessus (`vps.auth.groups`, `vps.auth.mode`)
activent le **forward-auth** : Keycloak se place devant votre
application au niveau Traefik et ne laisse passer que les
utilisateurs connectés. L'application elle-même n'a rien à savoir
d'Keycloak -- elle reçoit simplement du trafic authentifié. C'est
le mode **par défaut, toujours actif**, et il fonctionne pour
n'importe quelle application.

Les applications qui parlent nativement **OIDC** (Grafana, Gitea,
n8n, Keycloak, Vault, Nextcloud, Harbor, et bien d'autres) peuvent
*en plus* lire directement l'identité de l'utilisateur connecté et
ses appartenances de groupes depuis Keycloak. Cela débloque les
permissions par utilisateur *à l'intérieur* de l'application -- qui
peut éditer ou seulement consulter un tableau, qui peut approuver
une demande, etc. -- et une déconnexion propre.

**OIDC s'ajoute au forward-auth, il ne le remplace pas.** Lorsque
vous l'activez :
- Le forward-auth reste devant l'application (la barrière de
  sécurité ne change pas).
- Un client OIDC est en plus provisionné pour que l'application
  puisse demander à Keycloak "qui est cet utilisateur connecté"
  une fois qu'il a franchi la barrière.
- Si votre câblage OIDC est incorrect, la barrière tient toujours --
  au pire le bouton "Se connecter avec Keycloak" n'apparaît pas
  ou échoue, mais l'application reste joignable et protégée.

La suite détaille la procédure complète.

### Activer OIDC : étape par étape

#### 1. Récupérer les prérequis OIDC de votre application

Deux informations, puisées dans la **documentation de votre
application** :

- **URL de redirection (chemin de rappel) :** l'URL vers laquelle
  votre application renvoie l'utilisateur après qu'Keycloak l'a
  connecté. Spécifique à chaque application.

  | Application | Chemin de rappel typique |
  |---|---|
  | Grafana | `/login/generic_oauth` |
  | Gitea | `/user/oauth2/<nom-fournisseur>/callback` |
  | n8n | `/rest/sso/oauth2/callback` |
  | Harbor | `/c/oidc/callback` |
  | Vault | `/ui/vault/auth/oidc/oidc/callback` |
  | Keycloak (fédérant Keycloak) | `/auth/realms/<realm>/broker/<alias>/endpoint` |

- **Noms des variables d'environnement OIDC que votre application
  lit.** Chaque application nomme ses variables OIDC différemment.
  Quelques préfixes :

  | Application | Préfixe des variables OIDC |
  |---|---|
  | Grafana | `GF_AUTH_GENERIC_OAUTH_*` |
  | n8n | `N8N_SSO_OIDC_*` |
  | Harbor | `HARBOR_OIDC_*` (plus config serveur) |
  | Gitea | via la CLI, pas de variables d'environnement |

  Si votre application ne figure pas ci-dessus, cherchez "OIDC"
  ou "OpenID Connect" dans sa documentation -- les noms sont
  généralement listés sur la page de configuration
  d'authentification.

#### 2. Ajouter trois étiquettes à votre service compose

```yaml
labels:
  - "vps.auth.oidc=true"
  - "vps.auth.groups=staff"       # qui peut se connecter via cette app
  - "vps.auth.oidc.redirect_uris=https://monapp.exemple.com/login/generic_oauth"
```

- `vps.auth.oidc=true` -- active le provisionnement OIDC pour ce
  service.
- `vps.auth.groups=<liste>` -- même étiquette que le forward-auth.
  Définit qui peut se connecter via OIDC (réutilise la sémantique
  existante des groupes).
- `vps.auth.oidc.redirect_uris=<url>` -- l'URL de rappel relevée à
  l'étape 1. Obligatoire ; sans elle, OIDC n'est pas
  provisionné. Plusieurs URL séparées par des virgules sont
  autorisées si votre application en exige plusieurs.

#### 3. Mapper les variables injectées aux noms de votre application

Dans les ~5 minutes qui suivent, `dashboard-sync` va :

- Créer une application cliente OAuth2 dans Keycloak.
- Générer un ID client + un secret.
- Injecter ces quatre variables dans l'environnement de votre
  compose :
  - `OIDC_CLIENT_ID`
  - `OIDC_CLIENT_SECRET`
  - `OIDC_ISSUER_URL`
  - `OIDC_REDIRECT_URL`

Ce sont des **noms volontairement fixés** -- pas
un standard que votre application lira directement. Vous devez
ajouter des lignes au bloc `environment:` de votre service pour
mapper ces variables vers celles qu'attend votre application, avec
la substitution `${...}` de Docker Compose.

Voici un compose Grafana complet en référence :

```yaml
services:
  app:
    image: grafana/grafana:12.0.0
    labels:
      - "vps.auth.oidc=true"
      - "vps.auth.groups=staff"
      - "vps.auth.oidc.redirect_uris=https://grafana.exemple.com/login/generic_oauth"
      - "vps.auto-update=patch"
    environment:
      # Config OIDC propre à Grafana, alimentée par les variables injectées :
      GF_AUTH_GENERIC_OAUTH_ENABLED: "true"
      GF_AUTH_GENERIC_OAUTH_NAME: Keycloak
      GF_AUTH_GENERIC_OAUTH_ALLOW_SIGN_UP: "true"
      GF_AUTH_GENERIC_OAUTH_CLIENT_ID: ${OIDC_CLIENT_ID}
      GF_AUTH_GENERIC_OAUTH_CLIENT_SECRET: ${OIDC_CLIENT_SECRET}
      GF_AUTH_GENERIC_OAUTH_AUTH_URL: ${OIDC_ISSUER_URL}authorize/
      GF_AUTH_GENERIC_OAUTH_TOKEN_URL: ${OIDC_ISSUER_URL}token/
      GF_AUTH_GENERIC_OAUTH_API_URL: ${OIDC_ISSUER_URL}userinfo/
      GF_AUTH_GENERIC_OAUTH_SCOPES: "openid email profile groups"
    networks:
      catena-network:
        aliases: [grafana]
networks:
  catena-network:
    external: true
```

La syntaxe `${...}` est la substitution standard de variables
Docker Compose. Docker lit la valeur dans le bloc env du compose
(rempli par dashboard-sync) et la substitue dans l'environnement
du conteneur au démarrage.

#### 4. Sauvegarder + attendre le redéploiement

Sauvegarder le compose dans Portainer déclenche un redéploiement.
Au tic de synchronisation suivant, dashboard-sync met à jour le
bloc env et Portainer redéploie l'application une fois de plus avec
les valeurs remplies. Ensuite, connectez-vous à la page d'accueil
de l'application -- vous devriez voir un bouton "Se connecter avec
Keycloak" (le libellé dépend de l'application). Cliquez,
autorisez, vous êtes dedans.

### Vérifier que ça fonctionne

- **Interface de l'application :** l'application affiche un bouton
  SSO et cliquer dessus vous connecte sans second mot de passe (si
  vous êtes déjà connecté à une autre application de la session --
  Keycloak vous maintient connecté entre applications).
- **Interface admin d'Keycloak** (`auth.yourdomain.com`) ->
  Annuaire -> Applications : vous verrez deux entrées par
  application OIDC -- une pour la barrière forward-auth, et
  `<nom> (OIDC)` pour le client OIDC.

### Erreurs courantes

- **Substitution `${...}` oubliée.** La synchro injecte bien les
  variables, mais votre application ne les voit pas parce que son
  `environment` ne les référence pas. Symptôme : aucun bouton SSO
  n'apparaît. `compose-lint` émet un avertissement à ce sujet au
  déploiement.
- **Mauvaise valeur de `redirect_uris`.** Keycloak affiche "URL
  de redirection invalide" pendant le flux. Correctif : revérifier
  la documentation de votre application pour le chemin de rappel
  exact, ajuster l'étiquette, sauvegarder.
- **Utilisateur absent de `vps.auth.groups`.** Keycloak affiche
  "Permission refusée" à l'écran de consentement. Correctif :
  ajoutez l'utilisateur au groupe via Annuaire -> Groupes, ou
  élargissez la liste dans l'étiquette.
- **Valeurs codées en dur au lieu de `${...}`.** Si vous collez
  directement l'ID client / le secret dans l'environnement de
  votre service au lieu de les référencer, votre application
  fonctionnera une fois puis cassera à la rotation du secret.
  Toujours utiliser la forme `${...}`.

### Désactiver OIDC

Supprimez l'étiquette `vps.auth.oidc=true` (les deux autres
étiquettes OIDC peuvent rester -- elles sont inoffensives sans
l'interrupteur). Au tic de synchronisation suivant, dashboard-sync
démonte l'application + le fournisseur OIDC d'Keycloak, arrête
d'injecter les variables, et l'application revient au
forward-auth seul. Vous pouvez ensuite retirer les lignes
`${OIDC_*}` de votre `environment`.

### Hors périmètre

Les applications dont la configuration OIDC passe par des **fichiers
de config** plutôt que par des variables d'environnement --
Nextcloud (`config.php`), Jellyfin (XML de plugin),
Vaultwarden (fichier haché) -- ne sont pas couvertes par ce flux
d'étiquettes. Pour celles-ci, câblez OIDC à la main dans le fichier de
configuration de l'application.

## Personnaliser l'apparence de votre application sur le tableau de bord

Votre tableau de bord à
[`dash.yourdomain.com`](https://dash.yourdomain.com)
affiche une tuile pour chaque application déployée. Quatre étiquettes
optionnelles permettent d'ajuster la présentation vous-même :

```yaml
services:
  myapp:
    image: myapp:1.2.3
    labels:
      - "vps.homepage.name=Portail du personnel"
      - "vps.homepage.icon=mdi-briefcase"
      - "vps.homepage.description=Suivi des dossiers clients"
      - "vps.homepage.hidden=false"
```

- **`vps.homepage.name`** -- étiquette de la tuile. Par défaut : le
  nom de déploiement de l'application.
- **`vps.homepage.icon`** -- n'importe quelle icône [Material Design Icons](https://pictogrammers.com/library/mdi/)
  (préfixe `mdi-`) ou l'URL complète d'une image.
- **`vps.homepage.description`** -- une ligne de description sous le
  nom.
- **`vps.homepage.hidden=true`** -- masque l'application du tableau
  de bord (elle reste déployée et fonctionnelle à son URL, juste
  non listée). Utile pour des services en arrière-plan que vous ne
  voulez pas voir cliqués par le personnel.

Les changements s'appliquent à la prochaine synchronisation
dashboard-sync (toutes les 5 minutes), ou cliquez sur **Sync all
(apps + monitors)** dans l'onglet **Actions** du tableau de bord pour
forcer un rafraîchissement immédiat.

C'est là toute la surface de personnalisation, par design. Si vous
avez besoin de plus -- un autre groupe, une URL personnalisée, de la
visibilité par utilisateur -- faites la modification directement sur
le serveur (connexion SSH via Tailscale).

## Remplacer l'affichage de votre application sur la page d'état Gatus

Par défaut, la carte Gatus de votre application affiche le nom court
de l'image conteneur suivi de sa version -- p. ex. `paperless-ngx
2.12.3`. Lorsque le nom court de l'image ne reflète pas ce que votre
application *est* (cas courant quand un conteneur enveloppe autre
chose -- p. ex. nginx servant un site statique pré-généré), définissez
une étiquette compose :

```yaml
services:
  myapp:
    image: nginx:1.29.8-alpine
    labels:
      - "vps.display-name=my-static-site"
```

Le titre de la carte Gatus devient `my-static-site`, la sous-ligne
`group • domaine` reste inchangée. L'étiquette agit uniquement sur le
nom visible ; elle n'affecte ni la vérification de version ni les
mises à jour automatisées.
