---
title: "Alertes"
description: "Choisir les alertes que le serveur envoie et où elles vont : adresses de courriel et adresses de webhook, l'alerte de test, la page Alertes, l'adresse du signal de vie hors site, et la façon dont les alertes de services, de ressources et de tâches vous parviennent."
---

Le serveur vous informe de ses propres événements : une mise à jour disponible ou en échec, une vulnérabilité, un redémarrage nécessaire, un certificat non renouvelé, le verrouillage des fonctions payantes, et les alertes qui n'atteignent plus une destination. Chaque alerte est désactivée tant que vous ne l'activez pas, sauf **Fonctions payantes verrouillées**. Chaque alerte va aux adresses de courriel de votre liste et aux adresses de webhook que vous enregistrez, dans toutes les éditions.

Les alertes sur les services et les ressources viennent de deux autres outils du serveur : Gatus (chaque service répond-il) et Beszel (le processeur, la mémoire et le disque sont-ils sains). Ils remettent leurs alertes au panneau de contrôle, qui les envoie comme toute autre alerte, et vous les choisissez dans la même section. Les tâches planifiées signalent chaque exécution au panneau de contrôle lui-même, qui déclenche une alerte pour une tâche en échec ou qui ne s'est pas exécutée. La vue d'ensemble se trouve dans [Supervision et alertes](/fr/features/monitoring-alerts/). Cette page couvre les réglages et le premier raccordement.

## Champs

**Paramètres** > **Alertes** contient ces champs, puis la carte **Adresses de webhook** dessous.

| Champ | Rôle |
|---|---|
| **Adresses de courriel des alertes** | Dix adresses de courriel au plus, chacune seulement l'adresse, séparées par des virgules ou des espaces. Laissez vide pour envoyer à l'adresse de l'administrateur. |
| Un champ par alerte | **Désactivé** ou **Activé**. Voir [Types d'alerte](#types-dalerte). |
| **Plus bas niveau de vulnérabilité signalé dans les alertes** | Le seuil des alertes de vulnérabilité. **Seulement les vulnérabilités exploitées** nomme celles que la CISA signale comme exploitées. **Vulnérabilités exploitées et critiques** ajoute les critiques corrigées par une mise à jour proposée. **Vulnérabilités exploitées, critiques et élevées** ajoute les élevées corrigées par une mise à jour proposée. Le champ indique le premier choix tant que vous n'en faites pas un autre. |
| **Adresse du signal de vie hors site** | L'adresse de signal d'une vérification auprès d'un service de surveillance externe, par exemple une vérification gratuite healthchecks.io. Utilisée par le signal de vie hors site (Catena Pro), que vous activez dans [Horaires](/fr/configuration/schedules/). Voir [Signal de vie hors site](#signal-de-vie-hors-site). |

Un champ **Adresses de courriel des alertes** vide laisse la liste telle quelle. Pour vider la liste, cochez **Envoyer seulement à l'adresse de l'administrateur** sous le champ et enregistrez. Rien n'est enregistré tant qu'une adresse est refusée : le champ indique "Dix adresses de courriel au plus, chacune seulement l'adresse, séparées par des virgules ou des espaces."

La section se termine par **Enregistrer**, **Envoyer un signal de vie de test** et **Envoyer une alerte de test**. L'enregistrement prend effet aussitôt et ne redémarre rien. Tout dans la section est gratuit sauf le signal de vie hors site : sans Catena Pro, son adresse et son bouton **Envoyer un signal de vie de test** sont affichés verrouillés, avec un avis.

## Types d'alerte

Chaque alerte a son propre champ, nommé comme dans la première colonne. Une alerte de panne a deux champs de plus, nommés comme elle suivie de " : message à la fin" et de " : rappel tous les sept jours". Une alerte qui vous demande d'agir a le premier des deux, et **Correctif d'urgence** n'a ni l'un ni l'autre. Chacun de ces champs est **Désactivé** tant que vous ne l'activez pas, sauf **Fonctions payantes verrouillées**, qui est **Activé**; son message à la fin est **Désactivé**.

| Alerte | Déclenchée quand | Message à la fin | Rappel |
|---|---|---|---|
| **Mise à jour du panneau disponible** | Une version plus récente du panneau de contrôle est proposée. | Le panneau l'exécute maintenant. | Non |
| **Mise à jour d'application disponible** | Une mise à jour est proposée pour une application. Une alerte par application. | Plus aucune mise à jour n'est proposée. | Non |
| **Échec de mise à jour d'application** | Une mise à jour a échoué à ses vérifications et a été annulée, ou le déploiement de l'application a échoué. | Une mise à jour de l'application a réussi. | Oui |
| **Vulnérabilité dans une application** | La veille des vulnérabilités alerte sur une application, selon la règle des [Alertes de sécurité](/fr/configuration/vulnerabilities/#alertes-de-sécurité-toutes-les-éditions), au niveau choisi ou au-dessus. | Plus aucune vulnérabilité à ce niveau, ou l'application n'existe plus. | Non |
| **Une mise à jour corrige une vulnérabilité** | Une mise à jour proposée remplace les images d'une application qui porte ces vulnérabilités. | La mise à jour a été appliquée, ou les vulnérabilités ont disparu. | Non |
| **Correctif d'urgence** | Un correctif d'urgence s'est exécuté, ou a été refusé, avec son résultat. | Ne se termine jamais. | Non |
| **Redémarrage nécessaire** | Les mises à jour installées ne prennent effet qu'après le redémarrage du serveur. | Le serveur a redémarré. | Non |
| **Échec du redémarrage** | Un redémarrage par la maintenance n'a pas tout remis en marche. | Un redémarrage suivant a tout remis en marche. | Oui |
| **Certificat non renouvelé** | Le certificat d'une application est absent, il lui reste un cinquième de sa durée, ou un certificat renouvelé n'a pas atteint l'application depuis plus d'un jour. | Le certificat a été renouvelé. | Oui |
| **Fonctions payantes verrouillées** | L'abonnement verrouille les fonctions payantes. Voir [Abonnement](/fr/configuration/subscription/). | Les fonctions sont déverrouillées, ou la clé a été retirée. | Non |
| **Vérification de l'abonnement en échec** | Le service d'abonnement est injoignable pour confirmer la clé. Les fonctions payantes restent déverrouillées pendant le délai de grâce. | Le service a répondu, le délai de grâce est écoulé, ou la clé a été retirée. | Non |
| **Alertes non remises** | Une destination est en échec depuis un jour. | La remise vers elle fonctionne de nouveau. | Oui |
| **Service en panne** | Le moniteur d'état (Gatus) signale un service en panne. Une alerte, puis une de plus au rétablissement si le message à la fin est activé. | Le moniteur d'état signale que le service est rétabli. | Oui |
| **Alerte de ressources** | Le moniteur de ressources (Beszel) déclenche l'une de ses règles : serveur silencieux, ou processeur, mémoire ou disque au-delà de son seuil. Voir [Parcours d'une alerte de service ou de tâche](#parcours-dune-alerte-de-service-ou-de-tâche). | Le moniteur de ressources signale que la règle est revenue à la normale. | Oui |
| **Échec de la sauvegarde** | Une exécution de la sauvegarde a échoué. Une sauvegarde retenue après une restauration ne déclenche que cette alerte : la copie hors site et le test de restauration consignent une exécution sautée. | Une sauvegarde suivante a réussi. | Oui |
| **Échec du test de restauration** | Une exécution du test de restauration a échoué. | Un test de restauration suivant a réussi. | Oui |
| **Échec de la copie hors site** | Une exécution de la copie hors site a échoué. | Une copie hors site suivante a réussi. | Oui |
| **Échec de la vérification du dépôt de sauvegarde** | Une exécution de la vérification du dépôt de sauvegarde a échoué. | Une vérification suivante du dépôt de sauvegarde a réussi. | Oui |
| **Tâche planifiée en retard** | Une tâche n'a signalé aucune exécution à son horaire plus une marge (voir la règle ci-dessous), ou la maintenance, la veille des vulnérabilités ou le signal de vie hors site a terminé une exécution en échec. | La tâche a signalé une exécution réussie. | Oui |

Le comportement d'une alerte :

- **Activer une alerte envoie ce qui est ouvert à cet instant,** une fois. Un correctif d'urgence exécuté pendant que son alerte était désactivée n'est pas envoyé plus tard.
- **Un seul message par type d'alerte** porte tout ce qui est dû pour ce type à ce moment : plusieurs applications qui déclenchent la même alerte ensemble arrivent donc dans un message. Quand **Vulnérabilité dans une application** et **Une mise à jour corrige une vulnérabilité** sont toutes deux activées, un seul message nomme les vulnérabilités et la mise à jour.
- **Un rappel** répète tous les sept jours une alerte encore ouverte.
- **Une tâche est en retard** quand elle ne signale aucune exécution à son horaire plus une marge. Une tâche désactivée, ou que votre édition n'exécute pas, n'est jamais en retard.
- **Rien n'est envoyé sans destination.** Sans courriel sortant ni adresse de webhook, une alerte activée reste muette. **Envoyer une alerte de test** l'indique.

## Destinations

### Courriel

Chaque alerte part en un courriel vers chaque adresse de la liste, ou vers l'adresse de l'administrateur quand la liste est vide, par le service choisi dans [Courriel sortant](/fr/configuration/email/). Avec **Aucun courriel sortant**, aucun courriel n'est envoyé et seules les adresses de webhook servent.

L'objet se lit `Catena yourdomain.com : panel update available / mise à jour du panneau disponible`. Le corps est en anglais, puis `--`, puis en français, et chaque langue se termine par l'endroit où désactiver l'alerte.

### Adresses de webhook

La carte **Adresses de webhook** envoie les alertes à des services de messagerie et de notification qui acceptent une adresse web. Collez dix adresses au plus, séparées par des espaces, dans **Adresses de webhook, séparées par des espaces, dix au plus**, puis appuyez sur **Enregistrer les adresses de webhook**.

- **Seules les adresses https publiques sont acceptées.** Une adresse qui mène au serveur lui-même, à ses conteneurs, à un réseau privé ou à un réseau local est refusée, à l'enregistrement et à chaque envoi. Une redirection n'est pas suivie. Une adresse refusée est listée par sa position avec la raison, par exemple "Adresse 2 : l'adresse doit commencer par https://.", et rien n'est enregistré tant que chaque adresse n'est pas acceptée.
- **L'enregistrement remplace toute la liste.** Les adresses restent sur le serveur et ne sont plus jamais affichées. La carte indique combien sont enregistrées, avec la position et l'hôte de chacune, par exemple "Adresse 1 : chat.example.net". Elle n'affiche jamais une adresse.
- **Pour toutes les supprimer,** cochez **Supprimer toutes les adresses de webhook** et appuyez sur **Enregistrer les adresses de webhook**. Un champ vide sans la case n'enregistre rien.

Chaque adresse reçoit un POST par message, avec `Content-Type: application/json`, et une réponse 2xx compte comme remise :

```json
{"title": "...", "text": "...", "content": "...", "allowed_mentions": {"parse": []}}
```

`text` et `content` contiennent les mêmes mots : le texte anglais, `--`, puis le français, au plus 2000 caractères, les listes les plus longues étant raccourcies par "et `<nombre>` autres". `allowed_mentions` demande aux services qui le lisent, comme Discord, de ne prévenir personne de ceux que le texte nomme. Chaque adresse est sa propre destination : une qui échoue ne retient pas les autres.

| Service | Adresse à coller | Lit |
|---|---|---|
| Webhook entrant de Slack | L'adresse que donne Slack. | `text` |
| Webhook de Discord | L'adresse que donne Discord. | `content` |
| Matrix (webhook générique de hookshot) | L'adresse que donne hookshot. | `text` |
| ntfy | `https://HOTE/SUJET?tpl=yes&t=%7B%7B.title%7D%7D&m=%7B%7B.text%7D%7D`, avec votre hôte et votre sujet ntfy à la place de `HOTE` et `SUJET`. | Le gabarit de l'adresse. |

Après l'enregistrement, appuyez sur **Envoyer une alerte de test** pour voir si le service accepte le message.

### Envoyer une alerte de test

**Envoyer une alerte de test** envoie un message de test à toutes les destinations à la fois, quels que soient les interrupteurs des alertes, et répond à côté du bouton :

- "Une alerte de test a été envoyée à chaque destination."
- "L'alerte de test n'a pas atteint chaque destination." suivie de chaque destination en échec et de la raison.
- "L'alerte de test n'a atteint aucune destination."
- "Rien vers quoi envoyer pour l'instant : configurer le courrier sortant, ou ajouter une adresse de webhook."

Le résultat met aussi à jour l'état de chaque destination sur la page Alertes.

Une destination qui ne répond pas est essayée de nouveau après une attente plus longue chaque fois, jusqu'à une heure, puis abandonnée après 24 heures. La raison est toujours en mots : "le relais de courriel est injoignable", "aucune réponse n'est arrivée à temps", "la connexion sécurisée a échoué", "le relais de courriel l'a refusé (code `<numéro>`)", "le service a répondu par l'erreur `<numéro>`", "l'adresse mène à ce serveur ou à un réseau privé, où les alertes ne sont pas envoyées", ou "l'envoi a échoué".

## La page Alertes

**Alertes** dans le menu principal, pour un administrateur, montre ce que le serveur a signalé et où cela va. Son lien **Réglages des alertes** ouvre **Paramètres** > **Alertes**.

- **Envoi** donne le moment de la dernière vérification, indique si les courriels vont à l'adresse de l'administrateur ou combien d'adresses la liste contient, et avertit quand le courrier sortant n'est pas configuré.
- **Destinations** liste chaque destination par son type et sa position, et un webhook par son hôte, jamais par son adresse, avec son état : "Fonctionne. Dernière remise `<moment>`.", "Rien ne lui a encore été envoyé.", "La dernière tentative a échoué (`<moment>`) : `<raison>`." ou "En échec depuis `<moment>` : `<raison>`."
- **Alertes en cours** liste ce qui est ouvert maintenant, depuis quand, si l'alerte a été envoyée ou attend d'être envoyée, et le moment du prochain rappel.
- **Historique récent** liste ce qui s'est passé durant les 30 derniers jours : alerte déclenchée, situation terminée, message envoyé, message de fin envoyé, rappel envoyé, envoi abandonné et abandonnée.

Quand une destination est en échec depuis un jour, une bannière sur chaque page d'administration indique "Les alertes n'atteignent pas l'une de leurs destinations. La page Alertes indique laquelle." et mène à la page. L'alerte **Alertes non remises**, quand elle est activée, vous en avertit par les autres destinations.

## Signal de vie hors site

Une surveillance installée sur le serveur ne peut pas signaler une panne qui emporte le serveur entier. Le signal de vie hors site comble cet écart : selon son horaire, le serveur vérifie que son moniteur d'état, son moniteur de ressources et sa réception d'alertes répondent et que les alertes du panneau de contrôle se sont exécutées dans les 3 dernières minutes, puis appelle l'adresse hors site. Un appel simple indique que tout va bien; un appel d'échec nomme les surveillances qui ne répondent plus; l'absence d'appel signifie que le serveur est hors service, et le service externe donne l'alerte. Enregistrer l'adresse seule n'envoie rien : le signal de vie s'exécute une fois que vous l'activez dans [Horaires](/fr/configuration/schedules/), où sa section indique la période et le délai de grâce à régler sur la vérification externe. À la fin de votre abonnement, les appels cessent : mettez alors la vérification externe en pause.

**Envoyer un signal de vie de test** exécute le signal de vie une fois, maintenant, sur l'adresse enregistrée, et indique à côté du bouton si le service externe a reçu l'appel, ou quelle surveillance du serveur n'a pas répondu. Il exige Catena Pro.

## Parcours d'une alerte de service ou de tâche

Les alertes de services, de ressources et de tâches planifiées sont toutes envoyées par le panneau de contrôle, aux adresses de courriel et aux adresses de webhook de **Paramètres** > **Alertes**, par le service choisi dans [Courriel sortant](/fr/configuration/email/).

1. Gatus sonde les services partagés (le panneau d'administration, Keycloak, Beszel, le tunnel Cloudflare et le mandataire inverse) et chaque application exposée à intervalle fixe (environ une à deux minutes). Après 3 échecs consécutifs, il déclenche une alerte, et après 2 réussites, il la résout.
2. Gatus publie chaque alerte au panneau de contrôle, qui l'envoie comme **Service en panne** quand cette alerte est activée.
3. Beszel surveille le serveur avec des règles créées une seule fois et jamais écrasées : état (agent silencieux) pendant 5 minutes, processeur à 90 % pendant 10 minutes, mémoire à 90 % pendant 10 minutes, disque à 85 % pendant 10 minutes. Il publie chaque alerte au panneau de contrôle, qui l'envoie comme **Alerte de ressources** quand cette alerte est activée.
4. Les tâches planifiées (sauvegarde, vérification du dépôt, test de restauration, copie hors site, maintenance, veille des vulnérabilités, signal de vie hors site, sonde de redémarrage) signalent chaque exécution au panneau de contrôle. Une exécution en échec déclenche l'alerte propre à la tâche (**Échec de la sauvegarde**, **Échec du test de restauration**, **Échec de la copie hors site**, **Échec de la vérification du dépôt de sauvegarde**) ou, pour les autres, **Tâche planifiée en retard**. Le panneau de contrôle remarque lui-même une tâche qui a manqué son exécution, selon son horaire plus une marge. La maintenance ne se signale à la sauvegarde et à la copie hors site que tant que ses étapes de sauvegarde et de copie hors site sont activées (voir [Choisir les étapes](/fr/configuration/schedules/#choisir-les-étapes)). La veille des vulnérabilités déclenche aussi **Tâche planifiée en retard** quand elle ne peut pas s'exécuter (voir [la seconde alerte de la page Vulnérabilités](/fr/configuration/vulnerabilities/#alertes)).

## Envoyer des rapports d'erreurs au soutien de Catena

**Paramètres** > **Rapports d'erreurs au soutien de Catena** permet à un serveur d'aviser Catena quand l'un des contrôles propres à Catena échoue ou se rétablit. Elle existe dans toutes les éditions et reste désactivée tant que vous ne l'activez pas. Avec Catena Pro ou Catena Business, le soutien peut alors vous aider avant qu'un petit problème ne grossisse. Sans abonnement payant, les rapports aident Catena à trouver et à corriger les problèmes du produit : le serveur s'inscrit sous une identité d'installation aléatoire qu'il garde pour lui, liée à aucune licence, et un rapport n'ouvre aucun billet de soutien.

Pour l'activer :

1. Lisez le rapport que la section affiche. C'est le rapport que ce serveur enverrait à l'instant.
2. Cochez la case qui confirme votre accord, puis appuyez sur **Activer les rapports d'erreurs**. D'ici cinq minutes, le serveur s'inscrit auprès du soutien de Catena.

Pour la désactiver, appuyez sur **Désactiver les rapports d'erreurs**. Le serveur cesse aussitôt d'envoyer et se désinscrit.

Un rapport nomme chaque alerte ouverte et chaque contrôle en échec, depuis quand, l'application concernée, votre version de Catena et votre édition. Il ne nomme jamais une vulnérabilité. Il ne contient jamais ce qui se trouve dans vos applications : ni fichiers, ni lignes de journal, ni comptes d'utilisateurs, ni adresses courriel ou réseau, ni noms de domaine. Un rapport n'est envoyé que lorsque la liste des contrôles en échec change ou qu'un événement ponctuel survient.

Sous l'interrupteur, la section liste les 100 derniers rapports envoyés, du plus récent au plus ancien, chacun avec le texte exact qui a quitté le serveur et l'indication que le soutien de Catena l'a reçu ou non.

Quand une tâche en échec a écrit un texte sur ce qui a mal tourné, ce texte reste sur votre serveur. Sans abonnement payant, il n'est pas envoyé. Avec Catena Pro ou Catena Business, la liste le propose pour chaque rapport qui en a un :

- **Télécharger le texte de la tâche** enregistre le texte tel quel.
- **Relire et envoyer au soutien de Catena** ouvre le texte dans une zone. Retirez ce que vous ne voulez pas que le soutien voie, puis appuyez sur **Envoyer ce texte au soutien de Catena**. Seul le texte de la zone est envoyé, et la liste montre exactement ce que vous avez envoyé.

Les billets de soutien et les réponses viennent avec Catena Pro et Catena Business, et le soutien répond du lundi au vendredi, de 8 h à 17 h. Les rapports d'erreurs ne forment pas une surveillance 24 heures sur 24, et un serveur éteint ou sans accès à Internet n'envoie rien : pour cela, utilisez le [signal de vie hors site](#signal-de-vie-hors-site).

## Où regarder

- `https://gatus.yourdomain.com` : la page d'état de Gatus.
- `https://beszel.yourdomain.com` : Beszel, avec les graphiques de ressources du serveur.
- La page **Système** du panneau d'administration : le titre de **Ressources** ouvre Beszel, le titre de **Surveillance** ouvre Gatus, et le titre d'**Alertes** ouvre la page **Alertes**. La carte **Alertes** liste ce qui demande attention maintenant (chaque tâche planifiée en échec ou en retard, un redémarrage en attente et chaque alerte de ressources, nommée par sa clé), et "Aucune alerte" quand il n'y a rien; les services tombés sont sur la carte **Surveillance**; la carte **Tâches planifiées** nomme chaque tâche activée, avec un point gris et "aucun signalement encore" pour celle qui ne s'est pas signalée.

Vous pouvez changer les noms de sous-domaines dans [Domaine et Cloudflare](/fr/configuration/domain/).

## Dépannage

- Une alerte que vous avez activée n'arrive jamais : vérifiez qu'une destination existe (courriel sortant réglé, ou adresse de webhook enregistrée), puis appuyez sur **Envoyer une alerte de test**. La page **Alertes** montre l'état de chaque destination et ce qui attend d'être envoyé.
- Une alerte n'arrive qu'une fois : une alerte est envoyée une seule fois tant que sa situation dure. Activez son rappel pour en être averti de nouveau tous les sept jours.
- Rien n'arrive par courriel, mais les webhooks fonctionnent : **Envoyer le courriel par** est réglé à **Aucun courriel sortant** dans **Paramètres** > **Courriel sortant**, ou le courriel est dans les pourriels.
- Une adresse de webhook est refusée : elle doit être une adresse https publique, et non une adresse qui mène à ce serveur ou à un réseau privé. La carte liste chaque adresse refusée par sa position avec la raison.
- Une tâche apparaît en échec ou en retard sur la page **Système** : la tâche a échoué ou ne s'est pas exécutée à son horaire. Consultez le **Journal** et [Horaires](/fr/configuration/schedules/).
- Une tâche en échec ou en retard n'a envoyé aucun message : activez son alerte dans **Paramètres** > **Alertes** (**Échec de la sauvegarde**, **Échec du test de restauration**, **Échec de la copie hors site**, **Échec de la vérification du dépôt de sauvegarde** ou **Tâche planifiée en retard**). Chacune est désactivée tant que vous ne l'activez pas.
