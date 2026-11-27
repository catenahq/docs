---
title: "Supervision et alertes"
description: "Vérification de disponibilité, alertes de tâches en échec ou en retard et alertes de ressources hébergées sur votre propre serveur, avec un signal de vie hors site facultatif."
---

Le serveur héberge sa propre supervision : une vérification de disponibilité, des graphiques de ressources et des alertes lorsqu'un service tombe, qu'une tâche planifiée se tait ou que le disque, le CPU ou la mémoire s'emballent. Les alertes de services, de ressources et de tâches planifiées vous parviennent par courriel, grâce au courriel sortant du serveur, et par webhook, selon votre choix dans [Alertes](/fr/configuration/alerts/).

## Fonctionnement

Beszel est installé par défaut comme application et se configure lui-même. Vous réglez son adresse dans les paramètres de son application (voir [Domaine et Cloudflare](/fr/configuration/domain/#sous-domaines-des-applications-dinfrastructure)) et vous le mettez à jour depuis sa page (voir [Mettre une application à jour à la main](/fr/configuration/updates/#mettre-une-application-à-jour-à-la-main)); une mise à jour de Catena le déplace aussi vers la version plus récente que nomme sa version, jamais vers une plus ancienne. Un moniteur que vous retirez reste retiré : Catena ne le réinstalle pas et ne lève aucune alerte à son sujet. Ajoutez-le de nouveau depuis le catalogue et la prochaine exécution de configuration le relie à nouveau.

**Vérification de disponibilité.** Le serveur se vérifie lui-même, sans aucune application à installer. Chaque minute, il vérifie les services propres à Catena (le panneau, la connexion, le moniteur de ressources Beszel et, une fois un domaine réglé, le tunnel), chaque adresse de chaque application et les autres adresses que vous ajoutez (voir [Vérification de disponibilité](/fr/configuration/alerts/#vérification-de-disponibilité)). Les étiquettes `vps.health.path` et `vps.health.expect` de l'application sont utilisées si elles existent; sinon, le contrôle lit la page d'accueil de l'application : une application derrière la connexion est saine quand elle renvoie le visiteur vers la connexion, et une application publique quand sa page d'accueil répond par une page ou une redirection plutôt que par une erreur (voir [Configurer une application pour Catena](/fr/configure-apps/)). Une adresse est en panne après 3 vérifications ratées de suite et de nouveau en service après 2 bonnes réponses : une courte panne met donc quelques minutes à apparaître. Le serveur transmet chaque changement au panneau de contrôle, qui l'envoie comme l'alerte **Service en panne** de [Alertes](/fr/configuration/alerts/#types-dalerte).

**Page Disponibilité.** En tant qu'administrateur, ouvrez **Surveillance** > **Disponibilité** et choisissez une période : 24 heures, 7 jours, 30 jours ou 90 jours. Chaque service et chaque adresse indique son état, la part de la période pendant laquelle il a répondu et une barre de ce temps. Les états sont **En service**, **En panne**, **Sauvegarde ou mise à jour** et **Non mesuré** :

- Un échec pendant qu'une application est en pause pour sa sauvegarde ou retenue pour une mise à jour est indiqué comme **Sauvegarde ou mise à jour**, est exclu de la part et ne déclenche aucune alerte.
- Le temps pendant lequel le serveur n'a pas vérifié est indiqué comme **Non mesuré** et est exclu de la part.
- L'historique est conservé 400 jours et fait partie de la sauvegarde.

La carte **Surveillance** de la page **Système** compte ce qui est en service et en panne, et son titre ouvre l'onglet **Disponibilité**. Les tuiles de **Applications** prennent leur point d'état de cette vérification, et la page de chaque application a une section **Disponibilité** avec ses adresses et la part de chaque période.

**Gatus.** Un nouveau serveur ne l'installe pas. Il reste au catalogue comme application ordinaire : ajoutez-le depuis **Applications** si vous voulez une page d'état publique ou privée bien à vous. Il ne vérifie que les adresses que vous lui ajoutez.

**Tâches planifiées.** Chaque tâche planifiée (sauvegarde, vérification du dépôt, test de restauration, copie hors site, maintenance, veille des vulnérabilités, signal de vie hors site, sonde de redémarrage) signale ses exécutions aux alertes du panneau de contrôle, qui remarque une tâche en échec ou qui a manqué son exécution (son horaire plus une marge). Une tâche désactivée, ou que votre édition n'exécute pas, n'est jamais en retard.

**Beszel** (`beszel.yourdomain.com`) trace les ressources du serveur grâce à son agent sur l'hôte, qui fait partie de l'application Beszel, avec l'historique et l'utilisation de chaque conteneur; les jauges de CPU et de RAM de l'onglet **Système** sont lues sur le serveur lui-même et n'en dépendent pas. Les règles d'alerte sont créées une fois pour le serveur : état (agent silencieux) après 5 minutes, CPU et mémoire à 90 pour cent et disque à 85 pour cent, chacun maintenu 10 minutes. Beszel remet ses alertes au panneau de contrôle, qui les envoie comme l'alerte **Alerte de ressources** de [Alertes](/fr/configuration/alerts/#types-dalerte). Les règles ne sont jamais écrasées après leur création : les modifications faites ensuite dans Beszel restent.

**Signal de vie hors site.** Les moniteurs du serveur ne peuvent pas signaler une panne qui emporte le serveur entier. Avec Catena Pro, le signal de vie hors site appelle une vérification auprès d'un service de surveillance externe, selon l'horaire que vous réglez dans [Horaires](/fr/configuration/schedules/); vous enregistrez son adresse dans **Paramètres** > **Alertes**. Quand les appels cessent, le service externe donne l'alerte, et un appel qui nomme une surveillance muette signale celle qui s'est arrêtée.

**Autres signaux.** Le panneau affiche des tuiles pour l'état de la surveillance et les ports exposés, une bannière pour les sauvegardes manquantes et les redémarrages en attente, et une page **Système** avec les alertes actives et les tâches qui n'ont pas encore signalé. La veille antivirus et les canaris de livraison du courriel tournent comme minuteries.

**Healthchecks.** Un nouveau serveur ne l'installe pas. Il reste au catalogue comme application ordinaire que vous installez, mettez à jour et retirez comme les autres, avec sa propre connexion. Un serveur qui l'exécute déjà le garde en marche comme application ordinaire : Catena ne le sollicite plus, ne le lit plus et ne s'y connecte plus, donc les vérifications que Catena y avait créées ne reçoivent plus de signal et Healthchecks écrit une fois pour chacune qu'elle est en panne. Gardez-le, ou ouvrez sa page dans **Applications**, choisissez **Retirer l'application**, puis **Supprimer l'application et ses données**.

## Ce qu'ajoute chaque édition

La vérification de disponibilité, Beszel et les alertes sur l'hôte fonctionnent dans toutes les éditions, tout comme les alertes de sécurité : la veille des vulnérabilités vous écrit au sujet d'une vulnérabilité exploitée, ou critique ou élevée et corrigée par une mise à jour proposée (voir [Alertes de sécurité](/fr/configuration/vulnerabilities/#alertes-de-sécurité-toutes-les-éditions)). Catena Pro ajoute le signal de vie hors site et Catena Business, la supervision en tant que service, décrits dans la [comparaison des éditions](https://catena.run/fr/#pricing).

## Limites

- Les moniteurs du serveur ne peuvent pas signaler une panne du serveur lui-même, d'où le signal de vie hors site.
- L'alerte exige un canal : avec **Aucun courriel sortant**, aucun courriel n'est envoyé : ajoutez une adresse de webhook dans [Alertes](/fr/configuration/alerts/#adresses-de-webhook).
- Le délai d'alerte est l'intervalle de vérification d'une minute multiplié par le seuil de 3 échecs.

## Configuration

- [Alertes](/fr/configuration/alerts/)
- [Courriel sortant](/fr/configuration/email/)
- [Paramètres du serveur](/fr/configuration/server/)
