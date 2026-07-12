---
title: Comment nous validons
description: Les trois couches qui gardent le produit honnête - répétitions automatisées, barrières d'analyse de sécurité et barrières de dérive.
---

Trois couches indépendantes gardent Catena honnête. Chacune est
automatisée et bloquante : quand une couche échoue, le changement
n'est pas livré.

## 1. Répétitions automatisées

Chaque comportement significatif -- installer, reconfigurer,
sauvegarder, briser, restaurer, reconstruire un serveur entier -- est
répété par une suite automatisée qui provisionne des serveurs virtuels
jetables et pilote le vrai produit, pas une simulation. Les
répétitions incluent des pannes injectées délibérément : services
tués en pleine opération, disques pleins, stockage injoignable,
certificats expirés, coupures réseau. Une restauration jamais répétée
est considérée comme brisée.

La liste à jour des fonctions couvertes est sur
[Ce que nous testons](/fr/trust/what-we-test/); la fiche technique
avec les noms de scénarios est dans le
[dépôt public](https://github.com/catenahq/catena-ce/blob/main/VALIDATION.md).

## 2. Barrières d'analyse de sécurité

Chaque changement à chaque dépôt traverse la même batterie d'analyses
avant de pouvoir être fusionné : détection de secrets sur tout
l'historique, vérification des vulnérabilités connues dans les
dépendances et les images de conteneurs, et analyse statique du code.
Les analyses tournent dans l'intégration continue publique des dépôts
publics -- les résultats ne sont pas une affirmation, ce sont des
exécutions visibles.

## 3. Barrières de dérive

Les fiches de spécification et de validation que vous pouvez lire sont
**générées à partir du même manifeste vérifié par machine qui
classifie le code source**, et la compilation échoue dès qu'une fiche
dérive de la réalité. Une promesse dont l'application disparaît brise
la compilation; une fonction qui gagne du code mais aucune répétition
est signalée comme non classée. C'est pourquoi les fiches sont fiables
à la version exacte qui est livrée :

- [SPEC.md](https://github.com/catenahq/catena-ce/blob/main/SPEC.md) --
  la promesse rédigée à la main, où chaque invariant pointe vers la
  vérification exacte qui l'applique, chaque pointeur étant résolu par
  machine.
- [VALIDATION.md](https://github.com/catenahq/catena-ce/blob/main/VALIDATION.md) --
  la fiche de couverture générée.
- Le même patron couvre le
  [catalogue d'applications](https://github.com/catenahq/catena-templates/blob/main/SPEC.md)
  et les [éléments légaux et tarifaires](https://github.com/catenahq/contracts).
