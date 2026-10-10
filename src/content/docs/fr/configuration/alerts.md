---
title: "Alertes"
description: "L'adresse du signal de vie hors site de la section des alertes, la façon dont les tâches manquées et les services défaillants déclenchent des alertes, la façon dont les alertes parviennent à votre courriel d'administrateur, et l'ajout d'autres canaux de notification dans Healthchecks."
---

Les alertes viennent de trois outils du serveur : Gatus (chaque service répond-il), Healthchecks (chaque tâche planifiée s'est-elle signalée) et Beszel (le processeur, la mémoire et le disque sont-ils sains). La vue d'ensemble se trouve dans [Supervision et alertes](/fr/features/monitoring-alerts/). Cette page couvre les réglages et le premier raccordement.

## Champs

**Paramètres** > **Alertes et signalement des tâches manquées** contient l'adresse du signal de vie hors site. Les tâches planifiées se signalent au Healthchecks du serveur, qui donne l'alerte quand un signal est en retard ou annonce un échec.

| Champ | Rôle |
|---|---|
| **Adresse du signal de vie hors site** | L'adresse de signal d'une vérification auprès d'un service de surveillance externe, par exemple une vérification gratuite healthchecks.io. Utilisée par le signal de vie hors site (Catena Pro), que vous activez dans [Horaires](/fr/configuration/schedules/). |

Une surveillance installée sur le serveur ne peut pas signaler une panne qui emporte le serveur entier. Le signal de vie hors site comble cet écart : selon son horaire, le serveur vérifie que sa page d'état, son moniteur de tâches et son moniteur de ressources répondent, puis appelle l'adresse hors site. Un appel simple indique que tout va bien; un appel d'échec nomme les surveillances qui ne répondent plus; l'absence d'appel signifie que le serveur est hors service, et le service externe donne l'alerte. Enregistrer l'adresse seule n'envoie rien : le signal de vie s'exécute une fois que vous l'activez dans [Horaires](/fr/configuration/schedules/), où sa section indique la période et le délai de grâce à régler sur la vérification externe. À la fin de votre abonnement, les appels cessent : mettez alors la vérification externe en pause.

Les alertes parviennent aussi à votre courriel d'administrateur, par le service choisi dans [Courriel sortant](/fr/configuration/email/) : tant que le courriel sortant est réglé, le serveur garde dans Healthchecks un canal de courriel vers votre adresse d'administrateur, rattaché à toutes les vérifications au moment de sa création. Un canal détaché d'une vérification dans Healthchecks le reste. Avec **Aucun courriel sortant**, le canal est retiré et les alertes ne parviennent qu'aux canaux que vous ajoutez dans Healthchecks.

La section se termine par **Enregistrer et appliquer**; les services qui utilisent ces valeurs redémarrent brièvement.

## Parcours d'une alerte

1. Gatus sonde les services partagés (le panneau d'administration, Portainer, Healthchecks, Keycloak, Beszel, le tunnel Cloudflare et le mandataire inverse) et chaque application exposée à intervalle fixe (environ une à deux minutes). Après 3 échecs consécutifs, il déclenche une alerte, et après 2 réussites, il la résout.
2. Chaque alerte de Gatus est publiée dans Healthchecks sous la forme d'une vérification par service, nommée `gatus-<service>`, créée au premier échec.
3. Healthchecks envoie chaque alerte à votre courriel d'administrateur et aux canaux ajoutés dans sa propre interface.
4. Les tâches planifiées (sauvegarde, copie hors site, entretien nocturne, sonde de redémarrage, signal de vie hors site) signalent leur passage à Healthchecks. Un signal manquant est en soi l'alerte. Les vérifications de la sauvegarde, de la copie hors site, de l'entretien nocturne (**Nightly maintenance**, avertie quand une nuit commence, échoue ou se termine) et du signal de vie hors site suivent les horaires des tâches qui s'y signalent; tant qu'aucune de ces tâches n'est activée, la vérification est en pause et n'est donc jamais en retard. L'entretien nocturne ne se signale aux vérifications de la sauvegarde et de la copie hors site que tant que ses étapes de sauvegarde et de copie hors site sont activées (voir [Choisir les étapes](/fr/configuration/schedules/#choisir-les-étapes)).
5. Beszel surveille le serveur avec des règles créées une seule fois et jamais écrasées : état (agent silencieux) pendant 5 minutes, processeur à 90 % pendant 10 minutes, mémoire à 90 % pendant 10 minutes, disque à 85 % pendant 10 minutes. Ses alertes passent par Healthchecks et parviennent donc aux mêmes canaux.

## Ajouter des canaux de notification dans Healthchecks

Les alertes parviennent à votre courriel d'administrateur sans aucune étape ici. Vous ajoutez d'autres canaux, pour d'autres personnes ou d'autres outils, dans Healthchecks :

1. Ouvrez `https://healthchecks.yourdomain.com` et connectez-vous (authentification unique).
2. Ouvrez la page des intégrations du projet et ajoutez un canal : courriel, Slack, ntfy, webhook, ou tout autre que la page propose.
3. Vérifiez que le canal est rattaché aux vérifications que vous voulez notifier. Les nouvelles vérifications, y compris celles qui commencent par `gatus-`, utilisent les canaux du projet.

Les canaux par courriel exigent [Courriel sortant](/fr/configuration/email/).

## Où regarder

- `https://gatus.yourdomain.com` : la page d'état de Gatus.
- `https://healthchecks.yourdomain.com` : Healthchecks, avec le dernier signal de chaque tâche.
- `https://beszel.yourdomain.com` : Beszel, avec les graphiques de ressources du serveur.
- La page **Système** du panneau d'administration montre les alertes actives et les tâches qui ne se sont pas encore signalées.

Vous pouvez changer les noms de sous-domaines dans [Domaine et Cloudflare](/fr/configuration/domain/).

## Dépannage

- Une tâche apparaît en retard ou en panne dans Healthchecks : la tâche a échoué ou ne s'est pas exécutée à son horaire. Consultez le **Journal** et [Horaires](/fr/configuration/schedules/).
- Aucun courriel d'alerte : **Courriel sortant** est réglé à **Aucun courriel sortant**, votre canal de courriel d'administrateur a été détaché de cette vérification dans Healthchecks, ou le courriel est dans les pourriels.
- Aucune notification sur un autre canal : ce canal n'est pas rattaché à la vérification. Rattachez-le comme ci-dessus.
- Un canal que vous avez ajouté ne livre rien : comparez son adresse ou son sujet dans Healthchecks avec ceux du côté de la réception.
