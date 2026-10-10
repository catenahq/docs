---
title: "Vulnérabilités"
description: "Où s'affichent les vulnérabilités connues sur un serveur Catena, comment elles sont repérées et utilisées par le moteur de mise à jour, et comment l'image du panneau se vérifie."
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

## Déroulement des analyses

Deux étapes de l'entretien nocturne produisent les constats :

1. **Vulnérabilités de l'hôte.** La liste des avis de sécurité qui touchent les paquets installés sur l'hôte.
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

## Vérifier l'image du panneau

Le panneau de contrôle tourne à partir d'une image publique, `ghcr.io/catenahq/catena-admin`, téléchargée sans identifiants. Chaque version est publiée dans cet ordre, et l'étiquette de version ainsi que `latest` ne sont ajoutées qu'à la fin, de sorte qu'aucune étiquette qu'un serveur résout ne pointe vers une image qui a échoué à une étape :

1. L'image est construite pour x86_64 et poussée sous une étiquette de commit.
2. Le condensat exact de l'image est analysé avec Trivy aux gravités élevée et critique, constats corrigeables seulement. Un constat fait échouer la publication.
3. Une nomenclature logicielle (SBOM) au format CycloneDX est générée à partir de ce condensat.
4. L'image est signée par une signature Sigstore sans clé, liée à l'identité du flux de publication et consignée dans le journal public Rekor. La SBOM est jointe à l'image sous forme d'attestation signée.
5. L'étiquette de version et `latest` sont pointées vers ce même condensat.

Le flux de publication construit aussi le binaire du panneau deux fois et échoue si les deux constructions diffèrent.

Pour analyser l'image publiée avec n'importe quel analyseur, résolvez le condensat d'une étiquette de version, puis analysez le condensat :

```sh
docker buildx imagetools inspect ghcr.io/catenahq/catena-admin:<etiquette> --format '{{.Manifest.Digest}}'
trivy image ghcr.io/catenahq/catena-admin@sha256:<condensat>
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
