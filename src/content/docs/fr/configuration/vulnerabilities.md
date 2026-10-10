---
title: "Vulnérabilités"
description: "Où s'affichent les vulnérabilités connues sur un serveur Catena, comment elles sont repérées, signalées et corrigées, l'inventaire logiciel, et comment l'image du panneau se vérifie."
---

Un serveur signale les vulnérabilités connues (CVE publiées) à deux endroits : les logiciels des images d'applications en cours d'exécution, et les paquets du système d'exploitation de l'hôte. Les constats sont informatifs : ils n'arrêtent jamais l'entretien nocturne à eux seuls. Le moteur de mise à jour se sert des mêmes analyses pour éviter d'adopter une version qui aggrave les choses.

## Prérequis

- Les analyses font partie de l'entretien nocturne, qui demande Catena Pro ou Catena Business (voir [Horaires](/fr/configuration/schedules/) et la [comparaison des éditions](https://catena.run/fr/#pricing)). Tant qu'aucune analyse n'a eu lieu, les chiffres indiquent "Pas encore mesuré".
- L'analyseur est livré avec le serveur. Si l'analyse le signale absent, lancez **Installer les moteurs gérés sur ce serveur** (voir [Mises à jour](/fr/configuration/updates/#panneau-mises-à-jour-gérées)) pour le rétablir.

## Où les constats s'affichent

### Carte Vulnérabilités connues

Dans la page **Système**, la carte **Vulnérabilités connues** donne deux nombres, libellés "critiques / élevées dans les applications en cours". Ils proviennent d'une analyse Trivy de chaque image d'un conteneur en marche, aux gravités élevée et critique, en ne comptant que les vulnérabilités pour lesquelles un correctif est publié. Un constat signifie donc qu'une version corrigée existe en amont, même si l'image de l'application ne la porte pas encore.

Chaque rapport liste 200 constats au plus. Le premier de chaque mois, il est archivé, et les trois dernières archives mensuelles sont conservées sur le serveur.

### Événements du Journal

La page **Journal** consigne les changements d'avis, pour les deux analyses :

| Événement | Source |
|---|---|
| `<nombre>` avis de sécurité signalé(s) dans les paquets de l'hôte; suivi(s) pour le prochain cycle de mise à jour. | Paquets du système d'exploitation |
| Avis de sécurité dans les paquets de l'hôte corrigés. | Paquets du système d'exploitation |
| `<nombre>` avis de sécurité signalé(s) dans les images d'application; suivi(s) pour le prochain cycle de mise à jour. | Images d'application |
| Avis de sécurité dans les images d'application corrigés. | Images d'application |
| `<application>` est atteint par `<vulnérabilité>` (`<gravité>`) dans `<paquets>`, ce qui déclenche une alerte de la veille des vulnérabilités. | Veille des vulnérabilités |
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

1. Ouvrez le **Journal** et la page **Système** pour voir de quel côté vient le constat : une image d'application ou un paquet de l'hôte.
2. Pour une image d'application, une version plus récente l'élimine généralement. L'entretien nocturne applique une telle version de lui-même, sans le délai de 7 jours, sauf si l'application porte l'étiquette `vps.auto-update=off` ou si son étiquette d'image n'est pas une étiquette de version complète. Sinon, changez l'étiquette à la main : ouvrez Portainer, ouvrez **Stacks**, sélectionnez l'application, modifiez l'étiquette d'image pour la version corrigée et appuyez sur le bouton de mise à jour.
3. Pour un paquet de l'hôte, les mises à jour de sécurité automatiques appliquent le correctif. Si la page **Système** indique un redémarrage en attente, redémarrez depuis **Système** > **Redémarrage**. **Mises à jour apt en attente**, sous **Actions** > **Opérations**, liste ce qui attend.
4. Si aucune version plus récente n'existe encore, le constat demeure jusqu'à la reconstruction de l'image en amont. L'analyse nocturne suivante le déclare corrigé dans le Journal dès qu'il a disparu.

## Page Vulnérabilités (Catena Pro)

La veille des vulnérabilités vérifie les logiciels de chaque application et service du serveur à l'aide d'une base de vulnérabilités qu'elle rafraîchit lorsque celle en usage date de six heures, et de la liste de la CISA des vulnérabilités que des attaquants exploitent activement. Le serveur télécharge les deux comme des données et fait la vérification localement : aucune liste de vos logiciels ne le quitte.

**Vulnérabilités** liste, par application, chaque vulnérabilité connue élevée ou critique et chacune que la CISA signale comme exploitée, avec son paquet, sa version installée et sa version corrigée, et le moment où elle a été vue pour la première fois. Une vulnérabilité que la CISA signale porte un badge "exploitée" avec les dates que fournit la CISA et, le cas échéant, un badge "rançongiciel". Une vulnérabilité sans version corrigée indique "aucun correctif publié".

Pour ouvrir la page, ouvrez le panneau **Mises à jour gérées** et suivez **Vulnérabilités**. Elle exige Catena Pro et un compte administrateur. La tuile d'une application, dans l'onglet **Applications**, affiche aux administrateurs "Vulnérabilités à traiter" et, quand la CISA en signale, "Exploitées par des attaquants", et la carte **Vulnérabilités connues** de **Système** ajoute le nombre de vulnérabilités exploitées dans les logiciels en service ici.

La page indique quand les résultats ont été établis, l'âge de la base de vulnérabilités et la version de la liste de la CISA en usage. Elle avertit lorsque la veille ne peut pas faire son travail : aucun analyseur installé, pas encore de base, une base de plus de 48 heures, la liste de la CISA non lue depuis plus de 7 jours, ou la liste des images en marche illisible. Des résultats non renouvelés depuis plus de 32 heures sont marqués "périmé" et n'offrent aucun correctif. Les services en marche dont l'image n'a pas encore de liste de logiciels apparaissent sous **Non vérifiés**.

### Activer la veille

La veille est une tâche planifiée, **Veille des vulnérabilités**, désactivée jusqu'à ce que vous l'activiez (voir [Horaires](/fr/configuration/schedules/)). Elle exige Catena Pro. Elle s'exécute à l'un de deux endroits, jamais aux deux : selon son propre horaire, ou comme étape de l'entretien nocturne, après les mises à jour de la nuit, de sorte qu'elle n'alerte que sur ce que les mises à jour n'ont pas corrigé (voir [Choisir les étapes](/fr/configuration/schedules/#choisir-les-étapes)). Tant qu'elle ne s'exécute à aucun des deux, la page l'indique et ses résultats ne sont renouvelés que lorsque vous appuyez sur **Vérifier maintenant**.

**Vérifier maintenant** lance la veille en arrière-plan : une base fraîche si celle en usage date de six heures, la liste de la CISA, puis la vérification de chaque application. La page en montre les résultats quelques minutes plus tard.

### Alertes

La veille envoie une alerte pour chaque vulnérabilité que la CISA signale comme exploitée, ou qui est critique et publiée dans les 30 derniers jours. Elle continue d'alerter, quel que soit l'âge de la vulnérabilité, tant que quelque chose sur le serveur en est atteint. L'alerte va au courriel administrateur et à chaque canal configuré dans Healthchecks (voir [Alertes](/fr/configuration/alerts/)), et elle nomme la vulnérabilité, chaque application et chaque paquet atteints, ainsi que la version corrigée. C'est une seule alerte par vulnérabilité, quel que soit le nombre d'applications atteintes; son texte est mis à jour lorsqu'une autre application en est atteinte. Lorsque plus aucune application n'est atteinte, l'alerte est levée.

Une seconde alerte, **Veille des vulnérabilités**, se déclenche lorsque la veille elle-même ne peut pas vérifier : les mêmes causes que celles dont la page avertit.

### Corriger une vulnérabilité

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
| La carte indique "Pas encore mesuré" | Aucune analyse n'a eu lieu : l'entretien nocturne est désactivé ou n'a pas atteint l'étape d'analyse. Lancez-le depuis **Actions** avec **Lancer la chaîne de mises à jour maintenant** une fois votre abonnement actif. |
| Un constat demeure après une mise à jour | Les responsables de l'image n'ont pas publié de reconstruction corrigée, ou l'application est retenue par son étiquette d'application ou d'image. Voir les étapes ci-dessus. |
| Les chiffres diffèrent d'un autre analyseur | Le panneau ne compte que les constats élevés et critiques ayant un correctif publié, sur les images des conteneurs en marche. |
