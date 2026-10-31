---
title: "Vulnérabilités"
description: "Où s'affichent les vulnérabilités connues sur un serveur Catena, comment elles sont repérées, signalées et corrigées, l'inventaire logiciel, et comment l'image du panneau se vérifie."
---

Un serveur signale les vulnérabilités connues (CVE publiées) à deux endroits : les logiciels des images d'applications en cours d'exécution, et les paquets du système d'exploitation de l'hôte. Les constats sont informatifs : ils n'arrêtent jamais l'entretien nocturne à eux seuls. Le moteur de mise à jour se sert des mêmes analyses pour éviter d'adopter une version qui aggrave les choses.

## Prérequis

- Les alertes de sécurité et la [page Vulnérabilités](#page-vulnérabilités) fonctionnent dans toutes les éditions (voir [Alertes de sécurité](#alertes-de-sécurité-toutes-les-éditions)). Une vérification sur demande, le correctif en une étape, le correctif automatique et l'inventaire logiciel exigent Catena Pro.
- Les analyses des images et des paquets font partie de l'entretien nocturne, qui demande Catena Pro ou Catena Business (voir [Horaires](/fr/configuration/schedules/) et la [comparaison des éditions](https://catena.run/fr/#pricing)). Tant que la veille des vulnérabilités n'a pas été exécutée, la carte **Vulnérabilités connues** indique "Pas encore mesuré".
- L'analyseur est livré avec le serveur. Si l'analyse le signale absent, lancez **Installer les moteurs gérés sur ce serveur** (voir [Mises à jour](/fr/configuration/updates/#panneau-mises-à-jour-gérées)) pour le rétablir.

## Où les constats s'affichent

### Carte Vulnérabilités connues

Dans la page **Système**, la carte **Vulnérabilités connues** lit ce que la veille des vulnérabilités a trouvé (voir [Alertes de sécurité](#alertes-de-sécurité-toutes-les-éditions)), dans toutes les éditions. Son grand nombre est celui des applications à mettre à jour : celles qui portent une vulnérabilité sur laquelle la veille alerte et qui ont une version corrigée. Le point à côté est rouge tant que des attaquants exploitent une vulnérabilité que la veille a trouvée, orange tant que la veille alerte sur une vulnérabilité, et vert sinon. Quand quelque chose demande une mise à jour, la carte indique "Consultez l'onglet Applications pour trouver quelle application mettre à jour." et offre **Ouvrir les applications**; quand rien ne la demande, elle indique "Aucune application n'a besoin d'une mise à jour pour une vulnérabilité connue." Elle ajoute "Sans correctif pour l'instant : `<nombre>`." quand des constats qui déclenchent une alerte n'ont pas de version corrigée, et, sous "Vérifié le `<moment>`.", le lien **Toutes les vulnérabilités**. Avant la première exécution de la veille, la carte indique "Pas encore mesuré", et quand la veille n'a pas vérifié depuis un moment, elle dit depuis quand. Quand aucun courriel ne peut être envoyé, elle vous avertit de régler le courriel sortant dans **Paramètres**.

Les nombres de vulnérabilités critiques et élevées ayant un correctif publié, issus d'une analyse Trivy de chaque image d'un conteneur en marche, figurent dans le Rapport de conformité et le Rapport mensuel (Catena Business). Un constat y signifie qu'une version corrigée existe en amont, même si l'image de l'application ne la porte pas encore. Chaque rapport liste au plus 200 constats. Le premier de chaque mois, il est archivé, et les trois dernières archives mensuelles sont conservées sur le serveur.

### Événements du Journal

La page **Journal** consigne les changements d'avis, pour les deux analyses :

| Événement | Source |
|---|---|
| `<nombre>` avis de sécurité signalé(s) dans les paquets de l'hôte; suivi(s) pour le prochain cycle de mise à jour. | Paquets du système d'exploitation |
| Avis de sécurité dans les paquets de l'hôte corrigés. | Paquets du système d'exploitation |
| `<nombre>` avis de sécurité signalé(s) dans les images d'application; suivi(s) pour le prochain cycle de mise à jour. | Images d'application |
| Avis de sécurité dans les images d'application corrigés. | Images d'application |
| `<application>` (`<images>`) est atteint par `<vulnérabilité>` (`<gravité>`) dans `<paquets>`; la version `<version>` ou une plus récente le corrige. | Veille des vulnérabilités |
| `<application>` (`<images>`) est atteint par `<vulnérabilité>` (`<gravité>`) dans `<paquets>`; aucun correctif n'est encore publié : limiter l'accès à `<application>` ou l'arrêter. | Veille des vulnérabilités |
| `<application>` n'est plus atteint par `<vulnérabilité>`. | Veille des vulnérabilités |
| `<application>` est passé de `<version>` à `<version>` pour corriger `<vulnérabilité>`. | Correctif |
| Le correctif de `<application>` vers `<version>` contre `<vulnérabilité>` n'a pas tenu et a été annulé. | Correctif |

## Déroulement des analyses

Deux étapes de l'entretien nocturne produisent les constats :

1. **Analyse des paquets du serveur.** La liste des avis de sécurité qui touchent les paquets installés sur l'hôte.
2. **Analyse des images.** S'exécute après les mises à jour des applications, et reflète donc l'état après toute mise à jour. La base de vulnérabilités de l'analyseur est rafraîchie à chaque exécution, et la copie en cache sert si le rafraîchissement échoue.

Les deux sont informatives et n'interrompent jamais la chaîne. Seul l'échec de la sauvegarde, de sa vérification ou du contrôle d'état l'arrête (voir [Horaires](/fr/configuration/schedules/#entretien-nocturne)).

## Usage par le moteur de mise à jour

Avant la mise à jour d'une application, les versions candidates sont analysées de la même façon :

- Une version qui ajoute une nouvelle vulnérabilité élevée ou critique n'est jamais adoptée. Le moteur se rabat sur une version inférieure propre, ou la mise à jour attend.
- Une version plus récente qui supprime une vulnérabilité élevée ou critique de la version en cours est appliquée sans le délai d'attente habituel de 7 jours.

Les règles sur les étiquettes, les étiquettes d'application et le retour arrière se trouvent dans la page [Mises à jour](/fr/configuration/updates/).

## Que faire d'un constat

1. Ouvrez le **Journal** pour voir de quel côté vient le constat : une image d'application ou un paquet de l'hôte.
2. Pour une image d'application, une version plus récente l'élimine généralement. L'entretien nocturne applique une telle version de lui-même, sans le délai de 7 jours, sauf si l'application porte l'étiquette `vps.auto-update=off` si son étiquette d'image n'est pas une étiquette de version complète, ou si elle a été modifiée hors de Catena (voir [Applications modifiées hors de Catena](/fr/configuration/updates/#applications-modifiées-hors-de-catena)). Sinon, ouvrez la carte de l'application dans **Applications** : "Mettre à jour pour corriger." mène à sa partie **Mise à jour**, où vous la mettez à jour à la main (voir [Mettre une application à jour à la main](/fr/configuration/updates/#mettre-une-application-à-jour-à-la-main)).
3. Pour un paquet de l'hôte, les mises à jour de sécurité automatiques appliquent le correctif. Si la page **Système** indique un redémarrage en attente, redémarrez depuis **Système** > **Redémarrage**. **Mises à jour apt en attente**, sous **Actions** > **Opérations**, liste ce qui attend.
4. Si aucune version plus récente n'existe encore, le constat demeure jusqu'à la reconstruction de l'image en amont. L'analyse nocturne suivante le déclare corrigé dans le Journal dès qu'il a disparu.

## Alertes de sécurité (toutes les éditions)

Votre serveur vérifie les logiciels de chaque application et service en marche à l'aide d'une base de vulnérabilités et de la liste de la CISA des vulnérabilités que des attaquants exploitent activement. Le serveur télécharge les deux comme des données et fait la vérification localement : aucune liste de vos logiciels ne le quitte. La vérification est la tâche **Veille des vulnérabilités** (voir [Horaires](/fr/configuration/schedules/)). Elle s'exécute au plus une fois par jour sans abonnement payant, et un serveur qui n'a jamais enregistré ses horaires l'exécute chaque jour à 1 h.

La veille envoie une alerte pour chaque vulnérabilité qui est :

- signalée par la CISA comme exploitée, avec ou sans version corrigée; ou
- critique, publiée dans les 30 derniers jours, et dotée d'une version corrigée.

Une vulnérabilité critique qui n'est pas exploitée et n'a pas de version corrigée reste silencieuse jusqu'à la publication d'un correctif. Une alerte dure, quel que soit l'âge de la vulnérabilité, tant que quelque chose sur le serveur en est atteint, et elle est levée lorsque plus rien ne l'est. C'est une seule alerte par vulnérabilité, quel que soit le nombre d'applications atteintes.

Le courriel d'alerte nomme la vulnérabilité, chaque application qui en est atteinte avec son image, le paquet et sa version installée, et la version qui la corrige, "ou une plus récente". Quand aucun correctif n'est encore publié, il le dit et vous demande de limiter l'accès à l'application ou de l'arrêter jusqu'à la publication d'un correctif. Un correctif publié après l'alerte n'envoie pas de second courriel. Mettez l'application à la version corrigée (voir [Mises à jour](/fr/configuration/updates/)) : l'alerte est levée quand la veille ne trouve plus la vulnérabilité.

Le courriel va à l'adresse de l'administrateur par le courriel sortant réglé dans **Paramètres** > **Courriel sortant** (voir [Courriel sortant](/fr/configuration/email/)). Sans courriel sortant, l'alerte n'apparaît que dans Healthchecks et sur la carte **Vulnérabilités connues** de **Système**, et la carte indique "Aucun courriel ne peut être envoyé : réglez le courrier sortant dans Paramètres." Vous ajoutez d'autres canaux dans Healthchecks (voir [Alertes](/fr/configuration/alerts/)).

Une fois la veille exécutée, la carte **Vulnérabilités connues** de la page **Système** affiche ce qu'elle a trouvé, dans toutes les éditions : le nombre d'applications à mettre à jour, le moment de la dernière vérification et un lien vers la [page Vulnérabilités](#page-vulnérabilités) (voir [Carte Vulnérabilités connues](#carte-vulnérabilités-connues)).

Catena Pro ajoute une vérification sur demande, le correctif en une étape, le correctif automatique et l'inventaire logiciel, décrits plus bas.

## Page Vulnérabilités

La veille des vulnérabilités (voir [Alertes de sécurité](#alertes-de-sécurité-toutes-les-éditions)) rafraîchit sa base de vulnérabilités lorsque celle en usage date de six heures.

La page a un index, la carte **Sur cette page** à droite, et montre une section à la fois. La section **Sommaire** contient le moment où les résultats ont été établis, l'âge de la base de vulnérabilités et la version de la liste de la CISA en usage, les avertissements ci-dessous et, avec Catena Pro, **Vérifier maintenant** et **Dernier correctif**. Chaque application a sa propre section, nommée dans l'index : les applications qui ont quelque chose à traiter viennent d'abord, celles qui portent une vulnérabilité exploitée en tête, chacune avec le badge **Exploitée** ou **À corriger**; les autres suivent, puis **Non vérifiés**.

Dans une application, **Corrigeable maintenant** liste les vulnérabilités élevées ou critiques, et celles que la CISA signale comme exploitées, qui ont une version corrigée. Tant qu'une mise à jour de l'application attend votre décision, elle y liste tous les constats de l'application, avec un lien vers la page de l'application, où **Mise à jour** la fait avancer (voir [Mettre une application à jour à la main](/fr/configuration/updates/#mettre-une-application-à-jour-à-la-main)). **Pas encore de correctif** liste les autres. Chaque constat indique son paquet, sa version installée et sa version corrigée, et le moment où il a été vu pour la première fois. Une vulnérabilité que la CISA signale porte un badge "exploitée" avec les dates que fournit la CISA et, le cas échéant, un badge "rançongiciel". Une vulnérabilité sans version corrigée indique "aucun correctif publié".

Pour ouvrir la page, suivez **Toutes les vulnérabilités** sur la carte **Vulnérabilités connues** de **Système**, ou dans la partie **Vulnérabilités** de la page propre à une application. Elle exige un compte administrateur et aucun abonnement payant. La carte d'une application, dans l'onglet **Applications**, affiche aux administrateurs une ligne : un badge **Exploitée** quand des attaquants exploitent l'une de ses vulnérabilités, puis "Vulnérabilité dans cette version." (ou "Vulnérabilités dans cette version."), puis "Mettre à jour pour corriger." quand une version corrigée existe, un lien vers la partie **Mise à jour** de la page de l'application, ou "Aucun correctif publié pour l'instant." La ligne elle-même ouvre la page de l'application à sa partie **Vulnérabilités**, ou cette page pour une application non ajoutée depuis un dépôt.

Le Sommaire indique quand les résultats ont été établis, l'âge de la base de vulnérabilités et la version de la liste de la CISA en usage. Il avertit lorsque la veille ne peut pas faire son travail : aucun analyseur installé, pas encore de base, une base de plus de 48 heures, la liste de la CISA non lue depuis plus de 7 jours, ou la liste des images en marche illisible. Des résultats non renouvelés depuis plus de 32 heures sont marqués "périmé" et n'offrent aucun correctif. Les services en marche dont l'image n'a pas encore de liste de logiciels apparaissent sous **Non vérifiés**.

### Activer la veille

La veille est la tâche planifiée **Veille des vulnérabilités** (voir [Horaires](/fr/configuration/schedules/)). Elle s'exécute à l'un de deux endroits, jamais aux deux : selon son propre horaire, ou, avec Catena Pro ou Catena Business, comme étape de l'entretien nocturne, après les mises à jour de la nuit, de sorte qu'elle n'alerte que sur ce que les mises à jour n'ont pas corrigé (voir [Choisir les étapes](/fr/configuration/schedules/#choisir-les-étapes)). Tant qu'elle ne s'exécute à aucun des deux, la page l'indique et ses résultats ne sont renouvelés que lorsqu'une vérification est lancée.

### Vérifier maintenant (Catena Pro)

Avec Catena Pro, **Vérifier maintenant** lance la veille en arrière-plan : une base fraîche si celle en usage date de six heures, la liste de la CISA, puis la vérification de chaque application. La page en montre les résultats quelques minutes plus tard. Sans Catena Pro, la page indique qu'une vérification sur demande, le correctif en une étape et l'inventaire logiciel font partie de Catena Pro.

### Alertes

Les alertes suivent la règle des [Alertes de sécurité](#alertes-de-sécurité-toutes-les-éditions). Elles vont au courriel administrateur et à chaque canal configuré dans Healthchecks (voir [Alertes](/fr/configuration/alerts/)). Le texte d'une alerte est mis à jour lorsqu'une autre application est atteinte par la vulnérabilité.

Une seconde alerte, **Veille des vulnérabilités**, se déclenche lorsque la veille elle-même ne peut pas vérifier : les mêmes causes que celles dont la page avertit.

### Corriger une vulnérabilité

Le correctif exige Catena Pro.

1. Dans **Vulnérabilités**, appuyez sur **Corriger** à côté de la vulnérabilité.
2. Lisez la page **Corriger une vulnérabilité**. Elle liste les services d'application atteints et ce que fait le correctif. Un correctif fait évoluer au plus 20 services; les autres restent listés pour le suivant. Les services de l'infrastructure propre au serveur sont listés à part : ses mises à jour les font évoluer, ils ne se corrigent donc pas d'ici.
3. Cochez "Je comprends que chaque service listé redémarre sur sa nouvelle version, et qu'un service dont le passage ne tient pas revient à la version qu'il exécute maintenant."
4. Appuyez sur **Corriger `<vulnérabilité>`**.

Le correctif fait passer chaque service à la plus ancienne version que permet sa politique de mise à jour et qu'une analyse sur le serveur montre exempte de la vulnérabilité, même si cette version est plus récente que le délai d'attente habituel (voir [Mises à jour](/fr/configuration/updates/#délai-dattente-et-barrière-de-vulnérabilités)). Avant le passage, il copie la base de données et les données du service. Il vérifie ensuite que le serveur est en aussi bonne santé qu'avant et remet tout en place sinon, comme le fait toute mise à jour. Il analyse de nouveau la nouvelle image et lance la veille : l'alerte est donc levée dès que la vulnérabilité a disparu.

Un service exclu des mises à jour automatiques évolue aussi lorsque vous confirmez, après la copie de ses données; son étiquette reste telle quelle. Le correctif ne fait jamais passer un service à une version hors de sa politique de mise à jour : lorsque seule une version plus récente est exempte de la vulnérabilité, rien ne bouge et la page nomme cette version, pour que vous puissiez élargir l'étiquette `vps.auto-update` du service (voir la [référence des étiquettes](/fr/configure-apps/#mises-à-jour)) et corriger de nouveau.

Une analyse trouve ce que l'analyseur sait identifier. Du code que les auteurs d'une application y ont copié peut échapper à l'analyse, et donc à cette vérification.

Le correctif se poursuit sur le serveur si vous fermez la page. **Dernier correctif**, dans la page **Vulnérabilités**, indique où en est chaque service :

| Résultat | Signification | Que faire |
|---|---|---|
| Passé de `<a>` à `<b>`. L'analyse après le passage ne trouve plus la vulnérabilité. | Le correctif a fonctionné. | Rien. |
| Passé de `<a>` à `<b>`, mais l'analyse après le passage trouve encore la vulnérabilité, ou n'a pas pu se faire : non vérifié. | Le service reste sur la nouvelle version et l'analyseur trouve encore la vulnérabilité. | Lisez la raison affichée, puis surveillez une version ultérieure. |
| Le passage n'a pas tenu et a été annulé; la version n'est plus proposée. | Le contrôle de santé a échoué et le service est revenu à sa version précédente avec ses données. | Lisez la raison affichée. |
| Le passage n'a pas pu être annulé proprement et demande une intervention. | Le retour arrière n'a pas abouti. | Consultez l'onglet **Journal** et le journal de mise à jour du serveur. |
| Non modifié : aucune version que permet sa politique de mise à jour n'est exempte de la vulnérabilité. `<version>`, au-delà de cette politique, l'est. | Seule une version plus récente en est exempte. | Changez l'étiquette `vps.auto-update` du service, puis corrigez de nouveau. |
| Non modifié : aucune version publiée plus récente que `<a>` et analysée n'est encore exempte de la vulnérabilité, ou chaque version qui en est exempte en apporte une nouvelle, élevée ou critique. | L'éditeur n'a pas encore de correctif utilisable. | Attendez une nouvelle version; l'alerte demeure. |
| Non modifié : une analyse de l'image qu'il exécute ne trouve pas la vulnérabilité. | Les résultats étaient périmés. | Appuyez sur **Vérifier maintenant**. |
| Non modifié : son étiquette l'exclut des mises à jour automatiques. | Le correctif automatique ne fait jamais évoluer un tel service. | Corrigez-le depuis cette page. |
| Non lancé : les mises à jour sont en pause sur ce serveur. | Le correctif automatique attend pendant que les mises à jour sont en pause. | Corrigez depuis cette page, qu'une pause n'arrête pas. |
| Non modifié : les images n'ont pas pu être analysées, il n'y a pas encore d'analyseur ou de base, l'application est arrêtée, l'application ou le service n'est plus déployé, les versions de son image ne peuvent pas être listées, ou le service exécute une version dans un schéma de nommage que son éditeur a abandonné. | La raison suit le message. | Corrigez la cause indiquée, appuyez sur **Vérifier maintenant**, puis corrigez de nouveau. |

### Correctif automatique

Sous **Paramètres** > **Vulnérabilités**, le champ **Correctif automatique** choisit ce que le serveur fait face à une vulnérabilité exploitée :

- **Désactivé : une personne confirme chaque correctif** (par défaut).
- **Corriger automatiquement les vulnérabilités exploitées** : chaque fois que la veille trouve, dans un service d'application, une vulnérabilité que la CISA signale comme exploitée, le serveur corrige ce service comme le ferait un correctif confirmé, avec la même copie, le même contrôle de santé et le même retour arrière.

Le correctif automatique ne fait jamais évoluer un service exclu des mises à jour automatiques, et il attend pendant que les mises à jour sont en pause. Il ne s'enquiert d'un service et d'une vulnérabilité qu'une fois par jour au plus, de sorte qu'une version publiée plus tard est tout de même prise. Il exige Catena Pro : le réglage peut s'enregistrer sans, et rien n'est corrigé tant que l'abonnement ne l'inclut pas. **Dernier correctif** indique "Lancé par le correctif automatique" pour ses exécutions.

## Inventaire logiciel (Catena Pro)

**Inventaire logiciel** liste l'image de chaque service en marche avec sa nomenclature logicielle (SBOM, format CycloneDX) à télécharger, et trouve quels services portent un paquet, recherché par son nom ou sous la forme `nom@version`. Le serveur établit lui-même chaque SBOM, sans rien télécharger. Ouvrez-le depuis le panneau **Mises à jour gérées**, ou par le lien au bas de **Vulnérabilités**.

- **Trouver un paquet** : saisissez un nom, par exemple `openssl`, ou `openssl@3.0.15` pour une version précise. Les résultats listent chaque paquet correspondant, sa version et les services qui l'exécutent. Seules les premières correspondances sont listées; un nom plus long resserre la recherche.
- **Images en service** : chaque service avec son application, son image, son nombre de paquets et une SBOM à télécharger, pour un auditeur ou un autre analyseur. Une image sans SBOM indique pourquoi.

La liste est vide tant que la veille ou l'analyse nocturne n'a pas listé les images.

## Vérifier l'image du panneau

Le panneau de contrôle tourne à partir d'une image publique, `ghcr.io/catenahq/catena-admin`, téléchargée sans identifiants. Chaque version est publiée dans cet ordre, et l'étiquette de version ainsi que `latest` ne sont ajoutées qu'à la fin, de sorte qu'aucune étiquette qu'un serveur résout ne pointe vers une image qui a échoué à une étape :

1. L'image est construite pour x86_64 et poussée sous une étiquette de commit.
2. Le condensat exact de l'image est analysé avec Trivy aux gravités élevée et critique, constats corrigeables seulement. Un constat fait échouer la publication.
3. Une nomenclature logicielle (SBOM) au format CycloneDX est générée à partir de ce condensat.
4. L'image est signée par une signature Sigstore sans clé, liée à l'identité du flux de publication et consignée dans le journal public Rekor. La SBOM est jointe à l'image sous forme d'attestation signée.
5. L'étiquette de version et `latest` sont pointées vers ce même condensat.

Le flux de publication construit aussi le binaire du panneau deux fois et échoue si les deux constructions diffèrent.

Pour analyser l'image publiée avec n'importe quel analyseur, résolvez le condensat d'une étiquette de version, puis analysez le condensat. Avec Trivy, ajoutez `--skip-version-check` et `--disable-telemetry` pour que l'analyse ne fasse aucun rapport au fabricant de l'analyseur :

```sh
docker buildx imagetools inspect ghcr.io/catenahq/catena-admin:<etiquette> --format '{{.Manifest.Digest}}'
trivy image --skip-version-check --disable-telemetry ghcr.io/catenahq/catena-admin@sha256:<condensat>
```

Pour vérifier la signature et lire la SBOM avec `cosign` :

```sh
IMAGE=ghcr.io/catenahq/catena-admin@sha256:<condensat>
cosign verify "$IMAGE" \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp '^https://github.com/catenahq/catena-admin/\.github/workflows/publish-image\.yml@refs/tags/v'
cosign verify-attestation --type cyclonedx "$IMAGE" \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp '^https://github.com/catenahq/catena-admin/\.github/workflows/publish-image\.yml@refs/tags/v'
```

Les signalements de sécurité vont à security@catena.run.

## Dépannage

| Symptôme | Cause et correctif |
|---|---|
| La carte indique "Pas encore mesuré" | La veille des vulnérabilités n'a pas été exécutée : activez-la dans **Horaires** (voir [Activer la veille](#activer-la-veille)), ou appuyez sur **Vérifier maintenant** avec Catena Pro. |
| Un constat demeure après une mise à jour | Les responsables de l'image n'ont pas publié de reconstruction corrigée, ou l'application est retenue par son étiquette d'application ou d'image. Voir les étapes ci-dessus. |
| Les chiffres diffèrent d'un autre analyseur | Le panneau ne compte que les constats élevés et critiques ayant un correctif publié, sur les images des conteneurs en marche. |
