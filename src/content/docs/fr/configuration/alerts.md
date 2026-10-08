---
title: "Alertes"
description: "Les adresses de surveillance et les champs ntfy de la section des alertes, la façon dont les tâches manquées et les services défaillants déclenchent des alertes, la façon dont les alertes parviennent à votre courriel d'administrateur, et l'ajout d'autres canaux de notification dans Healthchecks."
---

Les alertes viennent de trois outils du serveur : Gatus (chaque service répond-il), Healthchecks (chaque tâche planifiée s'est-elle signalée) et Beszel (le processeur, la mémoire et le disque sont-ils sains). La vue d'ensemble se trouve dans [Supervision et alertes](/fr/features/monitoring-alerts/). Cette page couvre les réglages et le premier raccordement.

## Champs

**Paramètres** > **Alertes et signalement des tâches manquées** contient des adresses de surveillance facultatives. Chaque tâche planifiée en signale une à sa fin, et la surveillance donne l'alerte quand le signal n'arrive pas. Un champ vide conserve sa valeur par défaut.

| Champ | Rôle |
|---|---|
| **URL de surveillance Healthchecks de la sauvegarde (signal de réussite)** | Signalée quand une sauvegarde réussit. Par défaut, le Healthchecks de ce même serveur. |
| **URL de surveillance Healthchecks de la sauvegarde (signal de tentative)** | Signalée quand une sauvegarde est tentée, qu'elle réussisse ou non. Par défaut, le Healthchecks de ce même serveur. |
| **URL de surveillance Healthchecks hors site de la sauvegarde (client)** | Une adresse Healthchecks sur un service externe, qui vous appartient. |
| **URL de surveillance Healthchecks hors site de la sauvegarde (Catena)** | Une seconde adresse externe, pour une surveillance tenue par Catena. Laissez-la vide si aucune ne vous a été remise. |
| **Serveur ntfy** | Adresse d'un serveur ntfy pour les notifications poussées. |
| **Sujet ntfy** | Le sujet sur ce serveur. Il doit être difficile à deviner : quiconque le connaît peut y publier. |

Les deux adresses locales ne peuvent pas signaler une panne qui emporte le serveur entier, puisque la surveillance se trouve sur le serveur. La paire hors site comble cet écart : quand le serveur devient muet, le silence lui-même déclenche l'alerte. Si aucune adresse hors site n'est définie, l'installation affiche un avertissement non bloquant indiquant qu'une panne du serveur entier passerait inaperçue.

Le canal ntfy n'est créé que si **Serveur ntfy** et **Sujet ntfy** sont tous deux remplis. Il n'y a aucune valeur par défaut.

Les alertes parviennent aussi à votre courriel d'administrateur, par le service choisi dans [Courriel sortant](/fr/configuration/email/) : tant que le courriel sortant est réglé, le serveur garde dans Healthchecks un canal de courriel vers votre adresse d'administrateur, rattaché à toutes les vérifications au moment de sa création. Un canal détaché d'une vérification dans Healthchecks le reste. Avec **Aucun courriel sortant**, le canal est retiré et les alertes ne parviennent qu'à ntfy et aux canaux ajoutés dans Healthchecks.

La section se termine par **Enregistrer et appliquer**; les services qui utilisent ces valeurs redémarrent brièvement.

## Parcours d'une alerte

1. Gatus sonde les services partagés (le panneau d'administration, Portainer, Healthchecks, Keycloak, Beszel, le tunnel Cloudflare et le mandataire inverse), la dernière sauvegarde, le rapport de vulnérabilités des conteneurs et chaque application exposée à intervalle fixe (environ une à deux minutes). Après 3 échecs consécutifs, il déclenche une alerte, et après 2 réussites, il la résout.
2. Chaque alerte de Gatus est publiée dans Healthchecks sous la forme d'une vérification par service, nommée `gatus-<service>`, créée au premier échec.
3. Healthchecks envoie chaque alerte à votre courriel d'administrateur, au canal ntfy s'il est défini, et aux canaux ajoutés dans sa propre interface.
4. Les tâches planifiées (sauvegarde, copie hors site, entretien nocturne, sonde de redémarrage) signalent leur passage à Healthchecks. Un signal manquant est en soi l'alerte.
5. Beszel surveille le serveur avec des règles créées une seule fois et jamais écrasées : état (agent silencieux) pendant 5 minutes, processeur à 90 % pendant 10 minutes, mémoire à 90 % pendant 10 minutes, disque à 85 % pendant 10 minutes. Ses alertes passent par Healthchecks et parviennent donc aux mêmes canaux.

## Ajouter des canaux de notification dans Healthchecks

Les alertes parviennent à votre courriel d'administrateur et au canal ntfy ci-dessus sans aucune étape ici. Vous ajoutez d'autres canaux, pour d'autres personnes ou d'autres outils, dans Healthchecks :

1. Ouvrez `https://healthchecks.yourdomain.com` et connectez-vous (authentification unique).
2. Ouvrez la page des intégrations du projet et ajoutez un canal : courriel, Slack, webhook, ou tout autre que la page propose.
3. Vérifiez que le canal est rattaché aux vérifications que vous voulez notifier. Les nouvelles vérifications, y compris celles qui commencent par `gatus-`, utilisent les canaux du projet.

Les canaux par courriel exigent [Courriel sortant](/fr/configuration/email/).

## Où regarder

- `https://gatus.yourdomain.com` : la page d'état de Gatus.
- `https://healthchecks.yourdomain.com` : Healthchecks, avec le dernier signal de chaque tâche.
- `https://beszel.yourdomain.com` : Beszel, avec les graphiques de ressources du serveur.
- La page **Système** du panneau d'administration montre les alertes actives et les tâches qui ne se sont pas encore signalées.

Vous pouvez changer les noms de sous-domaines dans [Domaine et Cloudflare](/fr/configuration/domain/).

## Dépannage

- Une tâche apparaît en retard ou en panne dans Healthchecks : l'horaire est désactivé ou la tâche a échoué. Consultez [Horaires](/fr/configuration/schedules/) et le **Journal**.
- Aucun courriel d'alerte : **Courriel sortant** est réglé à **Aucun courriel sortant**, votre canal de courriel d'administrateur a été détaché de cette vérification dans Healthchecks, ou le courriel est dans les pourriels.
- Aucune notification sur un autre canal : ce canal n'est pas rattaché à la vérification. Rattachez-le comme ci-dessus.
- Les messages ntfy n'arrivent jamais : les deux champs ntfy doivent être remplis, et le sujet doit correspondre du côté de la réception.
