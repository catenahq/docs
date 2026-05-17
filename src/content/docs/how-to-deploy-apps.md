---
title: "Comment déployer des applications (avec contrôle d'accès par département)"
description: "Lorsque vous déployez une nouvelle application via Dokploy, vous"
---

Lorsque vous déployez une nouvelle application via Dokploy, vous
contrôlez qui peut y accéder en ajoutant des étiquettes au fichier
compose. La suite lit ces étiquettes et provisionne automatiquement les
bons groupes et politiques Keycloak -- vous ne touchez jamais à l'API
d'Keycloak directement.

## Que puis-je déployer ?

Tout ce qui fournit un Docker Compose fonctionne. Deux catalogues
utiles pour choisir ce que vous auto-hébergez :

- **[templates.dokploy.com](https://templates.dokploy.com)** -- le
  catalogue de modèles un-clic de Dokploy (installation directe
  depuis l'interface Dokploy en collant l'ID du modèle). Soigné,
  testé contre Dokploy, maintenu activement. Commencez par là pour
  les applications courantes.
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

Avant de déployer quelque chose de nouveau, vérifiez le projet
**Templates** dans Dokploy -- nous pré-câblons quelques applications
prêtes à l'emploi (voir "Applications pré-configurées prêtes à
activer" plus bas) qui couvrent peut-être déjà votre besoin.

## Démarrage rapide

Déployer une nouvelle application (par exemple, Paperless pour votre
équipe de comptabilité) :

1. Connectez-vous à `admin.yourdomain.com` (Dokploy).
2. Créez une nouvelle application. Collez votre fichier compose.
3. Ajoutez un bloc `labels:` (pour le contrôle d'accès) ET un alias
   `networks:` correspondant à votre `appName` Dokploy en minuscules
   avec traits d'union (`paperless` -> `paperless`, `MyApp` -> `myapp`,
   `My-App` -> `my-app`). Traefik utilise cet alias pour atteindre votre
   conteneur ; sans lui le service retourne 502.

   ```yaml
   services:
     paperless:
       image: paperlessngx/paperless-ngx:latest
       labels:
         - "vps.auth.groups=accounting"
       networks:
         dokploy-network:
           aliases:
             - paperless        # doit correspondre à votre appName Dokploy en minuscules
   networks:
     dokploy-network:
       external: true
   ```

4. Définissez le domaine (p. ex. `paperless.yourdomain.com`)
   dans l'onglet Domains.
5. Déployez.

En moins de 5 minutes, `dashboard-sync` détecte la nouvelle application,
crée le groupe `accounting` dans Keycloak (s'il n'existe pas), câble
le middleware forward-auth et rend l'application accessible -- mais
uniquement pour les utilisateurs du groupe `accounting`.

## Applications pré-configurées prêtes à activer

Dokploy est livré avec un projet **Templates** sur votre VPS contenant
des applications prêtes à déployer, correctement câblées dès le
départ -- authentification, SSO, stockage, réseau, étiquettes, SSL.
Cliquez Deploy sur celles que vous voulez, Delete sur les autres.

Catalogue complet avec notes par application :
**[Applications pré-configurées](/apps/)**.

## Applications multi-conteneurs (exemple : Nextcloud)

Une application mono-image ne nécessite que le rattachement à
`dokploy-network` illustré plus haut. Dès que votre compose contient
**plusieurs services** -- une vraie application comme Nextcloud embarque
Postgres et Redis à côté du processus web -- la règle de réseau est :

- **Seul le service public** (celui auquel Traefik doit router le
  trafic) rejoint `dokploy-network`. L'ajouter aussi au réseau
  `default` du compose lui permet de parler à ses voisins.
- **Les services internes** (base de données, cache, worker cron)
  restent uniquement sur `default`. Ils n'ont pas besoin d'être
  joignables par Traefik, et les mettre sur `dokploy-network` les
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
      dokploy-network:          # Traefik y accède
        aliases:
          - nextcloud           # doit correspondre au appName Dokploy
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
      - default                 # PAS sur dokploy-network -- interne uniquement

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
  dokploy-network:
    external: true
  # `default` est implicite et propre au projet ; pas besoin de le déclarer.
```

**Pourquoi deux réseaux sur `app`, pas un seul** : si `app` ne
rejoignait que `dokploy-network`, il pourrait atteindre Traefik mais
pas `db`, `redis` ou `cron`. S'il ne rejoignait que `default`, Traefik
ne le verrait pas et renverrait une 502. Il faut les deux.

**Pourquoi `db`, `redis` et `cron` restent hors de `dokploy-network`** :
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

Ça devient un problème pour les sauvegardes. La sauvegarde nocturne
copie chaque octet des données applicatives dans le dépôt hors-site. À
l'échelle du To, ça prend des heures, coûte de l'argent en stockage et
en transfert, et rend une restauration complète pénible.

Pour cette famille d'applications, demandez à l'opérateur de déployer
la **variante avec stockage S3** : les fichiers vivent directement
dans un bucket d'objets qui vous appartient, pas dans un volume local
du VPS. La sauvegarde nocturne ne copie alors que le code et la
configuration de l'application (quelques centaines de Mo), et le
bucket gère l'historique des fichiers de son côté.

Ce que ça change pour vous :

- **Rien dans l'interface.** Pour vos utilisateurs, l'application a
  l'air exactement pareille. Même connexion, même explorateur de
  fichiers, tout pareil.
- **Votre sauvegarde est en deux morceaux, pas un.** Le code, la
  config et la base de données restent dans la sauvegarde nocturne de
  l'opérateur ; les fichiers vivent dans le bucket S3 (avec 30 jours
  d'historique de suppression intégrés). Les deux vous appartiennent.
- **La restauration est plus rapide.** Si le VPS brûle, vos fichiers
  survivent indépendamment -- le nouveau VPS se reconnecte simplement
  au même bucket, et chaque fichier y est déjà.

Vous ne provisionnez rien de tout ça vous-même ; parlez-en à
l'opérateur quand vous planifiez un déploiement avec beaucoup de
fichiers et il suivra un schéma interne documenté.

## Garder vos applications à jour

Une fois par semaine, votre VPS vérifie si de nouvelles versions
existent pour chaque image déployée, récupère celles qui respectent
votre politique, redéploie, fait un contrôle de santé et annule
(rollback) si le contrôle échoue. Vous n'avez rien à faire -- ça tourne
à 3 h du matin, l'opérateur n'est alerté qu'en cas de problème.

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
- **Infrastructure de l'opérateur** (Keycloak, Dokploy, Traefik,
  Gatus, etc.) : `patch+minor`. L'opérateur les surveille
  quotidiennement.

Sauf raison contraire, laisser l'étiquette non définie sur vos apps
est le bon choix. Vous recevrez les correctifs de sécurité
automatiquement.

### Ce que fait concrètement le "rollback automatique"

Après chaque service mis à jour, l'updater exécute une vérification
de santé de base (même contrôle que le drill de nuit) : le conteneur
répond-il, la page renvoie-t-elle 2xx/3xx, le temps de réponse
reste-t-il raisonnable. Si un élément échoue, le tag est remis à la
dernière bonne version, redéployé, et l'opérateur reçoit une alerte
ntfy avec le nom du service et la mauvaise version. Le passage de la
semaine suivante se souvient de la mauvaise version et la saute --
vous ne retomberez pas sur le même mauvais release en boucle.

Pour voir l'état en cours (en attente / rollback récents /
quarantaine) : le tableau de bord Gatus affiche la version en cours
d'exécution sur chaque carte de service -- un épinglage bloqué se
repère d'un coup d'œil. OliveTin a un bouton *Afficher l'état des
mises à jour gérées* pour le résumé complet (bumps échoués,
versions en quarantaine, prochaine exécution planifiée).

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

Liste séparée par virgules de noms de groupes Keycloak autorisés. Tout
utilisateur appartenant à AU MOINS UN des groupes listés passe
(sémantique OU, comme l'utilitaire `app_proxy_gate`).

**Exemples :**

```yaml
labels:
  - "vps.auth.groups=accounting"                    # comptabilité seulement
  - "vps.auth.groups=accounting,engineering"        # l'un ou l'autre département
  - "vps.auth.groups=administrators"                # administrateurs seulement (équivaut à vps.auth.mode=admin-only)
  - "vps.auth.groups=client-staff"                  # tout le monde dans client-staff (niveau de base)
```

**Création automatique.** Si un nom de groupe n'existe pas encore dans
Keycloak, dashboard-sync le crée (vide) au prochain tick. L'opérateur
(ou toute personne avec accès admin Keycloak) ajoute des membres via
l'interface. L'application retournera 403 jusqu'à ce qu'au moins un
utilisateur soit assigné.

**Suppression.** Si vous supprimez une application dans Dokploy,
dashboard-sync retire son fournisseur, son application et ses liaisons
de politique Keycloak. Les groupes ayant des membres sont préservés ;
les groupes vides sans référence à une application sont nettoyés.

### `vps.auth.mode=<mode>`

Choisissez la posture d'accès. Mutuellement exclusif avec
`vps.auth.groups` sur le même service (utilisez l'un OU l'autre).

| Mode | Signification |
|---|---|
| `private` | Protégé par Keycloak ; les utilisateurs du groupe `client-staff` peuvent accéder. Valeur par défaut si non défini. |
| `admin-only` | Protégé par Keycloak ; les utilisateurs du groupe `administrators` peuvent accéder. Équivaut à `vps.auth.groups=administrators`. |
| `public` | Contourne Keycloak entièrement. L'application est accessible à quiconque a l'URL. À utiliser UNIQUEMENT pour des services vraiment publics (site vitrine, page d'accueil). |

**Posture par défaut (aucune étiquette).** Une application déployée
sans étiquettes `vps.auth.*` tombe sur le catchall de domaine, qui est
lié au groupe `administrators`. En pratique : *les applications sans
étiquettes sont réservées aux administrateurs, et non à tous les
utilisateurs authentifiés.* C'est sécurisé par défaut -- il faut opter
explicitement pour un accès plus large.

**Pourquoi `mode=private` diffère de "aucune étiquette".** Sans
aucune étiquette, l'application n'a pas d'application/fournisseur
Keycloak dédié ; elle tombe sur le catchall (admins seulement). Avec
`vps.auth.mode=private`, dashboard-sync crée une application + un
fournisseur + une liaison dédiés à `client-staff`, de sorte que
quiconque dans `client-staff` peut y accéder. Optez pour `private` (ou
un `vps.auth.groups=...` explicite) dès qu'un non-administrateur doit
y accéder.

## Ce que dashboard-sync fait pour vous

Toutes les 5 minutes (via un timer systemd), `dashboard-sync.service` :

1. Interroge l'API de Dokploy pour toutes les applications en cours
   d'exécution avec des domaines.
2. Pour chaque application, analyse les étiquettes du compose.
3. Réconcilie Keycloak :
   - S'assure que les groupes listés existent.
   - S'assure que l'application a un fournisseur `forward_single` + une
     Application.
   - S'assure que les liaisons de politique reflètent la liste
     `vps.auth.groups` actuelle.
   - Rattache le fournisseur à l'avant-poste intégré.
4. Écrit le fichier de route dynamique Traefik
   (`*-auto-keycloak.yml`) EN DERNIER, de sorte que si une étape
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
  Keycloak, ou corrigez l'étiquette dans Dokploy et redéployez.
- **Vous avez retiré l'étiquette mais gardé l'application.** Au
  prochain sync, les liaisons de politique reviennent à
  `administrators` (catchall). Personne sauf les admins ne peut y
  accéder. Intentionnel -- échec fermé.
- **Deux applications avec le même nom d'hôte mais des groupes
  différents.** La dernière liaison de politique écrite l'emporte. Ne
  faites pas ça ; donnez un nom d'hôte unique à chaque application.

## Vérifications en libre-service

- `https://auth.yourdomain.com` -> Directory -> Groups. Vos groupes
  définis apparaissent ici. Ajoutez / retirez des membres via
  l'interface.
- `https://admin.yourdomain.com` -> votre application -> Logs.
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
leur propre modèle de permissions (utilisateurs Paperless, rôles
Dokploy, etc.) conservent ce modèle ; Keycloak garde simplement la
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

Ce sont des **noms volontairement choisis par l'opérateur** -- pas
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
      dokploy-network:
        aliases: [grafana]
networks:
  dokploy-network:
    external: true
```

La syntaxe `${...}` est la substitution standard de variables
Docker Compose. Docker lit la valeur dans le bloc env du compose
(rempli par dashboard-sync) et la substitue dans l'environnement
du conteneur au démarrage.

#### 4. Sauvegarder + attendre le redéploiement

Sauvegarder le compose dans Dokploy déclenche un redéploiement.
Au tic de synchronisation suivant, dashboard-sync met à jour le
bloc env et Dokploy redéploie l'application une fois de plus avec
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
de config** plutôt que par des variables d'environnement -- OliveTin
(YAML), Nextcloud (`config.php`), Jellyfin (XML de plugin),
Vaultwarden (fichier haché) -- ne sont pas couvertes par ce flux
d'étiquettes. Pour celles-ci, demandez à votre opérateur de les
câbler manuellement.

## Personnaliser l'apparence de votre application sur le tableau de bord

Le tableau de bord Homepage à
[`dash.yourdomain.com`](https://dash.yourdomain.com)
affiche une tuile pour chaque application déployée. Quatre étiquettes
optionnelles permettent d'ajuster la présentation sans intervention
de l'opérateur :

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
  nom Dokploy de l'application.
- **`vps.homepage.icon`** -- n'importe quelle icône [Material Design Icons](https://pictogrammers.com/library/mdi/)
  (préfixe `mdi-`) ou l'URL complète d'une image.
- **`vps.homepage.description`** -- une ligne de description sous le
  nom.
- **`vps.homepage.hidden=true`** -- masque l'application du tableau
  de bord (elle reste déployée et fonctionnelle à son URL, juste
  non listée). Utile pour des services en arrière-plan que vous ne
  voulez pas voir cliqués par le personnel.

Les changements s'appliquent à la prochaine synchronisation
dashboard-sync (toutes les 5 minutes), ou cliquez sur "Sync all"
dans OliveTin pour forcer un rafraîchissement immédiat.

C'est là toute la surface de personnalisation, par design. Si vous
avez besoin de plus -- un autre groupe, une URL personnalisée, de la
visibilité par utilisateur -- demandez à votre opérateur ; ces
options nécessitent une configuration côté opérateur.

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
