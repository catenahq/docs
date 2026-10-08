---
title: "Supervision et alertes"
description: "Page d'état, alarmes de tâches manquées et alertes de ressources hébergées sur le serveur du client, avec des chiens de garde externes facultatifs."
---

Le serveur héberge sa propre supervision : une page d'état, des graphiques de ressources et des alertes lorsqu'un service tombe, qu'une tâche planifiée se tait ou que le disque, le CPU ou la mémoire s'emballent. Les alertes atteignent les gens par les canaux que l'administrateur ajoute.

## Fonctionnement

**Gatus** (`monitor.yourdomain.com`) est la page d'état. Les services d'infrastructure sont sondés toutes les 60 à 120 secondes, et chaque application routée en marche reçoit un contrôle public toutes les 120 secondes, régénéré toutes les 10 minutes. Les étiquettes `vps.health.path` et `vps.health.expect` de l'application sont utilisées si elles existent; sinon, la redirection vers la connexion compte comme saine (voir [Configurer une application pour Catena](/fr/configure-apps/)). Une alerte se déclenche après 3 échecs consécutifs et se résout après 2 réussites : une courte panne met donc quelques minutes à apparaître. Un contrôle de l'inventaire des vulnérabilités des conteneurs échoue dès qu'il existe une constatation critique, ou plus de 10 élevées.

**Healthchecks** (`heartbeat.yourdomain.com`) reçoit les alertes de Gatus, un contrôle par service, créé au premier échec. Il reçoit aussi un signal de chaque tâche planifiée (sauvegarde, copie hors site, entretien nocturne, sonde de redémarrage); un signal manquant déclenche l'alarme. Les canaux de notification (courriel, Slack et bien d'autres) s'ajoutent dans l'interface propre à Healthchecks. Un canal ntfy n'existe que si le serveur et le sujet ntfy sont tous deux définis dans **Paramètres** > **Alertes et signalement des tâches manquées**; il n'y a aucun défaut.

**Beszel** (`hub.yourdomain.com`) trace les ressources du serveur grâce à un agent sur l'hôte. Les règles d'alerte sont créées une fois pour le serveur : état (agent silencieux) après 5 minutes, CPU et mémoire à 90 pour cent et disque à 85 pour cent, chacun maintenu 10 minutes. Les alertes passent par un pont vers Healthchecks et par le courriel sortant. Les règles ne sont jamais écrasées après leur création : les modifications faites ensuite dans Beszel restent.

**Chiens de garde externes.** Les adresses de surveillance par défaut pointent vers le Healthchecks du même serveur, qui ne peut pas signaler une panne emportant le serveur entier. **Paramètres** > **Alertes et signalement des tâches manquées** contient une paire hors site, **URL de surveillance Healthchecks hors site de la sauvegarde (client)** et **(Catena)**, pour un point d'accès externe de type Healthchecks. Si un signal cesse d'arriver, le service externe donne l'alerte : le silence est lui-même l'alerte. Quand aucune n'est définie, l'installation affiche un avertissement non bloquant indiquant qu'une panne du serveur entier passerait inaperçue.

**Autres signaux.** Le panneau affiche des tuiles pour l'état de la surveillance et les ports exposés, une bannière pour les sauvegardes manquantes et les redémarrages en attente, et une page **Système** avec les alertes actives et les tâches qui n'ont pas encore signalé. La veille antivirus et les canaris de livraison du courriel tournent comme minuteries.

## Ce qu'ajoute chaque édition

Gatus, Healthchecks, Beszel, ntfy, la page d'état, les alertes sur l'hôte et les champs de surveillance hors site fonctionnent dans toutes les éditions. Catena Pro ajoute la supervision externe de la disponibilité et Catena Business, la supervision en tant que service, décrites dans la [comparaison des éditions](https://catena.run/fr/#pricing).

## Limites

- Les moniteurs du serveur ne peuvent pas signaler une panne du serveur lui-même, d'où la paire hors site.
- L'alerte exige un canal : rien n'est envoyé à personne tant qu'un canal Healthchecks, ntfy ou le courriel n'est pas configuré.
- Le délai d'alerte est l'intervalle de sondage multiplié par le seuil de 3 échecs.
## Configuration

- [Alertes](/fr/configuration/alerts/)
- [Courriel sortant](/fr/configuration/email/)
- [Paramètres du serveur](/fr/configuration/server/)
