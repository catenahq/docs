---
title: Ce que Catena promet
description: La promesse du produit, en une page, avec des liens vers la façon dont chaque partie est appliquée et vérifiée.
---

Catena est construite autour d'une seule promesse :

> **Votre serveur peut être reconstruit à partir de rien d'autre que
> son stockage de sauvegarde et de la clé de sauvegarde.**

Tout le reste en découle. Cette page énonce la promesse en mots
simples; les deux pages compagnes montrent [comment nous la validons](/fr/trust/how-we-validate/)
et [ce qui est testé en ce moment](/fr/trust/what-we-test/).

## La promesse, en détail

- **Vos données résident dans un stockage qui vous appartient.** Les
  sauvegardes sont chiffrées sur le serveur avant d'en sortir et
  aboutissent dans un stockage objet sous votre compte, pas le nôtre.
  Vous pouvez lister, parcourir et exporter les instantanés en tout
  temps.
- **La reprise est répétée, pas présumée.** La reconstruction complète
  de serveur et la restauration sur place tournent en continu sur des
  serveurs jetables, pannes injectées délibérément incluses, avant
  qu'un changement soit livré.
- **Le serveur n'expose rien d'interdit.** Le trafic web entre par un
  tunnel chiffré; aucun port web n'est ouvert sur la machine
  elle-même, et un balayage externe le vérifie à chaque passe de
  validation.
- **Une seule connexion pour toute la suite**, avec contrôle d'accès
  par application en amont des applications.
- **Une sauvegarde planifiée est incluse dans chaque édition.**
  Community exécute une sauvegarde hebdomadaire; la cadence
  quotidienne et infra-quotidienne, les mises à jour gérées et la
  copie immuable hors site font partie de Catena Pro.

## Pourquoi vous pouvez le vérifier au lieu de nous croire

Chaque affirmation ci-dessus est liée à une vérification machine : une
répétition automatisée, une analyse de sécurité, ou une règle de
compilation qui échoue quand la documentation dérive du code. Les
fiches de spécification et de validation vivent dans les dépôts
publics, où vous pouvez les lire à la version exacte qui est livrée :

- [Spécification de Catena Community (SPEC.md)](https://github.com/catenahq/catena-ce/blob/main/SPEC.md)
  et sa [fiche de validation](https://github.com/catenahq/catena-ce/blob/main/VALIDATION.md)
- [Spécification du catalogue d'applications](https://github.com/catenahq/catena-templates/blob/main/SPEC.md)
- [Textes légaux, tarification et éléments de marque](https://github.com/catenahq/contracts) --
  les mêmes fichiers versionnés rendus sur [catena.run](https://catena.run/fr/legal/master-agreement),
  de sorte que le texte que vous avez accepté est vérifiable à sa
  révision exacte.
