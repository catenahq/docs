---
title: "Supervision et alertes"
description: "Page d'état, alarmes de tâches manquées et alertes de ressources hébergées sur votre propre serveur, avec un signal de vie hors site facultatif."
---

Le serveur héberge sa propre supervision : une page d'état, des graphiques de ressources et des alertes lorsqu'un service tombe, qu'une tâche planifiée se tait ou que le disque, le CPU ou la mémoire s'emballent. Les alertes vous parviennent par courriel, grâce au courriel sortant du serveur, et aux autres personnes par les canaux que vous ajoutez dans Healthchecks.

## Fonctionnement

**Gatus** (`gatus.yourdomain.com`) est la page d'état. Les services d'infrastructure sont sondés toutes les 60 à 120 secondes, et chaque application routée en marche reçoit un contrôle public toutes les 120 secondes, régénéré toutes les 10 minutes. Les étiquettes `vps.health.path` et `vps.health.expect` de l'application sont utilisées si elles existent; sinon, le contrôle lit la page d'accueil de l'application : une application derrière la connexion est saine quand elle renvoie le visiteur vers la connexion, et une application publique quand sa page d'accueil répond par une page ou une redirection plutôt que par une erreur (voir [Configurer une application pour Catena](/fr/configure-apps/)). Une alerte se déclenche après 3 échecs consécutifs et se résout après 2 réussites : une courte panne met donc quelques minutes à apparaître.

**Healthchecks** (`healthchecks.yourdomain.com`) reçoit les alertes de Gatus, un contrôle par service, créé au premier échec. Il reçoit aussi un signal de chaque tâche planifiée (sauvegarde, copie hors site, entretien nocturne, sonde de redémarrage, signal de vie hors site); un signal manquant déclenche l'alarme. Les alertes parviennent par défaut au courriel de l'administrateur, par le service choisi dans **Paramètres** > **Courriel sortant**; vous ajoutez d'autres canaux de notification (courriel, Slack et bien d'autres) dans l'interface propre à Healthchecks.
**Beszel** (`beszel.yourdomain.com`) trace les ressources du serveur grâce à un agent sur l'hôte. Les règles d'alerte sont créées une fois pour le serveur : état (agent silencieux) après 5 minutes, CPU et mémoire à 90 pour cent et disque à 85 pour cent, chacun maintenu 10 minutes. Les alertes passent par un pont vers Healthchecks et parviennent donc au courriel de l'administrateur et aux autres canaux comme toute autre alerte. Les règles ne sont jamais écrasées après leur création : les modifications faites ensuite dans Beszel restent.

**Signal de vie hors site.** Le Healthchecks du serveur ne peut pas signaler une panne qui emporte le serveur entier. Avec Catena Pro, le signal de vie hors site appelle une vérification auprès d'un service de surveillance externe, selon l'horaire que vous réglez dans [Horaires](/fr/configuration/schedules/); vous enregistrez son adresse dans **Paramètres** > **Alertes et signalement des tâches manquées**. Quand les appels cessent, le service externe donne l'alerte, et un appel qui nomme une surveillance muette signale celle qui s'est arrêtée.

**Autres signaux.** Le panneau affiche des tuiles pour l'état de la surveillance et les ports exposés, une bannière pour les sauvegardes manquantes et les redémarrages en attente, et une page **Système** avec les alertes actives et les tâches qui n'ont pas encore signalé. La veille antivirus et les canaris de livraison du courriel tournent comme minuteries.

## Ce qu'ajoute chaque édition

Gatus, Healthchecks, Beszel, la page d'état et les alertes sur l'hôte fonctionnent dans toutes les éditions. Catena Pro ajoute le signal de vie hors site et Catena Business, la supervision en tant que service, décrits dans la [comparaison des éditions](https://catena.run/fr/#pricing).

## Limites

- Les moniteurs du serveur ne peuvent pas signaler une panne du serveur lui-même, d'où le signal de vie hors site.
- L'alerte exige un canal : avec **Aucun courriel sortant**, rien n'est envoyé tant que vous n'avez pas ajouté un canal dans Healthchecks.
- Le délai d'alerte est l'intervalle de sondage multiplié par le seuil de 3 échecs.

## Configuration

- [Alertes](/fr/configuration/alerts/)
- [Courriel sortant](/fr/configuration/email/)
- [Paramètres du serveur](/fr/configuration/server/)
