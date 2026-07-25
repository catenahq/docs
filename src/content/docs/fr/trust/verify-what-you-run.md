---
title: Vérifier ce que vous exécutez
description: Vérifiez la signature, lisez l'inventaire des composants et analysez vous-même l'image du panneau d'administration - sans identifiants ni permission.
---

Le panneau d'administration est la seule pièce de Catena dont le code
source n'est pas publié. C'est légitime de s'en méfier, alors il est
livré sous une forme que vous pouvez inspecter : une **image de conteneur
publique, compilée en clair**. Rien n'est obfusqué, rien n'est retiré
pour la rendre illisible, et chaque version publie les preuves
nécessaires pour la vérifier.

Aucun compte, aucun identifiant et la coopération de personne ne sont
requis pour effectuer les vérifications ci-dessous.

:::note
La signature, l'inventaire des composants et l'empreinte publiée
arrivent avec la première version issue du flux actuel. Si une
vérification ci-dessous ne trouve rien, votre serveur exécute une image
publiée avant celui-ci.
:::

## 1. Déterminer exactement ce que votre serveur exécute

Sur votre serveur :

```sh
sudo docker image inspect --format '{{index .RepoDigests 0}}' \
  ghcr.io/catenahq/catena-admin:latest
```

Cette commande affiche une référence immuable,
`ghcr.io/catenahq/catena-admin@sha256:...`. Une étiquette peut être
déplacée plus tard vers d'autres octets ; une empreinte, jamais. Utilisez
cette empreinte pour tout ce qui suit.

Pour savoir quelle version répond, demandez-le au panneau lui-même :

```sh
sudo docker run --rm --network catena-network busybox \
  wget -qO- http://catena-admin:8000/health
```

Il indique la version publiée et le commit exact à partir duquel l'image
a été compilée : une étiquette mouvante ne peut donc jamais vous laisser
dans le doute.

## 2. Vérifier la signature

Installez [cosign](https://github.com/sigstore/cosign), puis :

```sh
cosign verify ghcr.io/catenahq/catena-admin@sha256:<empreinte> \
  --certificate-oidc-issuer https://token.actions.githubusercontent.com \
  --certificate-identity-regexp '^https://github.com/catenahq/catena-admin/\.github/workflows/publish-image\.yml@refs/tags/v'
```

Cela prouve que l'image a été publiée par le flux de publication sur une
étiquette de version, et par rien d'autre. La signature et son certificat
résident dans le registre de transparence public de Sigstore : la
vérification porte donc sur une infrastructure publique plutôt que sur
une affirmation.

Les versions portent aussi une seconde signature produite avec une clé
ordinaire, pour les réseaux qui ne peuvent pas joindre Sigstore. La
vérifier demande la moitié publique de cette clé, publiée avec la
version :

```sh
cosign verify --key <clé-publiée> ghcr.io/catenahq/catena-admin@sha256:<empreinte>
```

## 3. Lire l'inventaire des composants

Chaque version publie un SBOM CycloneDX : la liste complète des
composants logiciels contenus dans l'image, avec leurs versions. Deux
façons de l'obtenir :

```sh
cosign verify-attestation --type cyclonedx \
  ghcr.io/catenahq/catena-admin@sha256:<empreinte>
```

ou téléchargez `sbom.cdx.json` depuis la
[page de publication](https://github.com/catenahq/catena-admin/releases).
La publication contient aussi `image-digest.txt`, l'empreinte publiée par
cette version : vous pouvez donc confirmer que la référence rapportée par
votre serveur est bien celle qui a été signée.

## 4. L'analyser vous-même

L'inventaire n'est utile que si vous pouvez en faire quelque chose.
Pointez n'importe quel analyseur vers la même empreinte :

```sh
trivy image ghcr.io/catenahq/catena-admin@sha256:<empreinte>
```

Vous devriez obtenir un résultat propre aux niveaux HIGH et CRITICAL : le
flux de publication analyse cette empreinte exacte avant d'autoriser
l'étiquette `latest` à s'y déplacer, et l'image publiée est réanalysée
périodiquement afin qu'une vulnérabilité divulguée après la publication
soit détectée plutôt qu'attendue. Si vous trouvez quelque chose qui n'est
pas déjà écarté avec une justification documentée, signalez-le à
security@catena.run.

## Ce que cela prouve, et ce que cela ne prouve pas

Cela prouve que l'image que vous exécutez a été publiée par le flux de
publication de Catena, que son inventaire de composants est complet et
vérifiable, et que vous pouvez l'auditer pour les vulnérabilités connues
à votre rythme et avec vos propres outils.

Cela ne prouve pas que le code source du panneau fait ce que fait le
binaire publié, puisque ce code n'est pas public. Personne ne peut le
vérifier de l'extérieur. Ce qui est publié à la place, c'est la propriété
qui rend l'affirmation vérifiable : la compilation est déterministe, et
le flux de publication recompile deux fois le même arbre et échoue si les
deux résultats diffèrent.

Tout le reste de Catena -- l'installateur, l'automatisation qui prépare
votre serveur, le chemin de récupération -- est du
[code source public](https://github.com/catenahq/catena-ce) que vous
pouvez lire directement. Les promesses de ces dépôts, et les garde-fous
qui les appliquent, sont listés dans
[SPEC.md](https://github.com/catenahq/catena-ce/blob/main/SPEC.md) et
décrits dans [Comment nous validons](/fr/trust/how-we-validate/).
