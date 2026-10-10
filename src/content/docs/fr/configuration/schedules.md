---
title: "Horaires"
description: "Les huit tâches planifiées d'un serveur Catena, leurs heures par défaut, la syntaxe des horaires, la chaîne d'entretien nocturne et la conservation des sauvegardes."
---

La page **Horaires** règle le moment où le serveur effectue ses tâches planifiées. Rien ne s'exécute selon un horaire tant que vous ne l'activez pas ici. Vous pouvez aussi lancer chaque tâche à la main depuis la page **Actions**, dans toutes les éditions.

## Prérequis

- Catena Pro ou Catena Business. Activer un horaire demande un abonnement actif (voir [Abonnement](/fr/configuration/subscription/) et la [comparaison des éditions](https://catena.run/fr/#pricing)). Avec Communauté, la page indique "Les horaires s'activent avec une licence Catena. D'ici là, chaque tâche ci-dessous peut encore être lancée à la main depuis la page Actions."
- Pour la tâche de sauvegarde, un dépôt de sauvegarde configuré (voir [Sauvegardes et stockage S3](/fr/configuration/backups/)).

Enregistrer une tâche activée sans abonnement actif est refusé avec le message "scheduled work needs an active Catena Pro licence", une fois l'horaire lui-même vérifié.

## Les tâches

Chaque tâche est livrée désactivée. L'heure indiquée est l'horaire prérempli, qui ne s'exécute qu'une fois que vous avez activé la tâche.

| Tâche | Horaire par défaut | Délai aléatoire | Rôle |
|---|---|---|---|
| **Sauvegarde** | `Sun *-*-* 03:00:00` (dimanche, 3 h) | jusqu'à 1 heure | Prend un instantané du serveur et l'envoie vers le stockage de sauvegarde configuré. |
| **Entretien nocturne** | `*-*-* 03:00:00` (chaque jour, 3 h) | jusqu'à 15 minutes | Sauvegarde, vérifie la sauvegarde, la copie hors site, puis fait passer les composants du serveur et les applications déployées à des versions plus récentes derrière ces vérifications. Vous choisissez les étapes qu'il exécute (voir [Choisir les étapes](#choisir-les-étapes)). |
| **Copie hors site** | `*-*-* 04:30:00` (chaque jour, 4 h 30) | jusqu'à 30 minutes | Copie chaque compartiment déclaré vers le stockage non réinscriptible du second fournisseur (voir [Copies hors site](/fr/configuration/backups/#copies-hors-site)). Demande Catena Business. |
| **Contrôle d'intégrité des sauvegardes** | `Sun *-*-* 04:15:00` (dimanche, 4 h 15) | jusqu'à 1 heure | Lit un échantillon du dépôt de sauvegarde de bout en bout, ce qui détecte la corruption silencieuse du stockage entre deux instantanés. |
| **Mises à jour du panneau de contrôle** | `monthly` | jusqu'à 30 minutes | Fait passer le panneau de contrôle à une version plus récente, et remet la précédente si la nouvelle rend le serveur moins sain. Le panneau est indisponible environ une minute. |
| **Configuration du serveur** | `*-*-* 04:20:00` (chaque jour, 4 h 20) | jusqu'à 40 minutes | Ramène le serveur à la configuration que porte son panneau de contrôle. Ce qui a dérivé est rétabli, et ce qui est déjà correct n'est pas touché. |
| **Signal de vie hors site** | `*:0/5` (toutes les 5 minutes) | jusqu'à 30 secondes | Vérifie que la page d'état, le moniteur de tâches et le moniteur de ressources répondent, puis appelle l'adresse du signal de vie hors site enregistrée dans **Paramètres** > **Alertes et signalement des tâches manquées** (voir [Alertes](/fr/configuration/alerts/)). Demande cette adresse et Catena Pro. Sa section indique la période et le délai de grâce à régler sur la vérification externe. |
| **Veille des vulnérabilités** | `*-*-* 01,07,13,19:00:00` (toutes les 6 heures, dès 1 h) | jusqu'à 10 minutes | Vérifie les logiciels de chaque application et service à l'aide d'une base de vulnérabilités fraîche et de la liste de la CISA des vulnérabilités exploitées, et alerte pour chacune qui est exploitée, ou critique et publiée dans les 30 derniers jours (voir [Vulnérabilités](/fr/configuration/vulnerabilities/#page-vulnérabilités-catena-pro)). Demande Catena Pro. Elle peut plutôt s'exécuter dans l'entretien nocturne, après les mises à jour de la nuit (voir [Choisir les étapes](#choisir-les-étapes)). |

Le délai aléatoire étale le démarrage réel sur une fenêtre après l'heure réglée : une tâche démarre donc un peu plus tard que l'heure écrite. Une tâche manquée parce que le serveur était éteint ou en redémarrage s'exécute au prochain démarrage du serveur.

### Entretien nocturne

L'entretien nocturne est une chaîne ordonnée. Elle reprend d'elle-même si un redémarrage l'interrompt.

1. **Vérifications préalables.** Contrôle qu'au moins 5 Gio de disque sont libres.
2. **Mode maintenance et scripts autour de la sauvegarde.** Une application du catalogue dont l'entrée le demande, comme Nextcloud, est placée en mode maintenance le temps de la sauvegarde et en est sortie ensuite, même quand la sauvegarde échoue. Des scripts facultatifs s'exécutent avant et après la sauvegarde lorsqu'il en existe sur le serveur. Rien d'autre n'est mis en pause sauf si un script le fait, et un script en échec ne produit qu'un avertissement.
3. **Sauvegarde.**
4. **Test de restauration.** Restaure le dernier instantané dans une zone temporaire et le contrôle.
5. **Vérification du dépôt de sauvegarde.** Vérifie les métadonnées du dépôt.
6. **Copie hors site.**
7. **Vérification de la copie hors site.**
8. **Contrôle de santé avant les mises à jour.** Consulte la page d'état.
9. **Analyse des paquets du serveur.** Liste les avis de sécurité signalés dans les paquets du serveur (à titre informatif).
10. **Mises à jour.** Met à jour les conteneurs du serveur et les applications déployées (voir [Mises à jour](/fr/configuration/updates/)).
11. **Analyse des images.** Analyse les images en cours d'exécution (à titre informatif; voir [Vulnérabilités](/fr/configuration/vulnerabilities/)).
12. **Veille des vulnérabilités.** Exécute la veille après les mises à jour de la nuit, lorsque vous l'avez choisie comme étape (voir [Choisir les étapes](#choisir-les-étapes)).
13. **Mise à niveau du moteur Docker.** Au sein de la version majeure en cours; la version précédente est remise en place si le serveur ne revient pas en bonne santé.
14. **Nettoyage.** Supprime les couches d'images inutilisées de plus d'une semaine.
15. **Redémarrage.** Ne redémarre le serveur que si une mise à jour de sécurité l'exige, puis vérifie que chaque service est revenu. Le redémarrage attend d'abord que les autres travaux sur le serveur, comme une sauvegarde ou une mise à jour, se terminent; des travaux encore en cours après une heure reportent le redémarrage à la nuit suivante, et la page **Système** l'indique comme reporté.

Ces étapes arrêtent la chaîne, afin qu'aucune mise à jour ne s'applique par-dessus une défaillance : les vérifications préalables, la sauvegarde, le test de restauration, la vérification du dépôt de sauvegarde, le contrôle de santé avant les mises à jour (tout point de contrôle en échec dans la page d'état) et la vérification de la copie hors site (exigée par défaut). Les autres étapes consignent leur résultat et laissent la chaîne se poursuivre. Une étape que vous retirez ne s'exécute pas : elle ne peut donc pas arrêter la chaîne.

Une sauvegarde configurée qui échoue, ou dont le test de restauration ou la vérification du dépôt échoue, arrête donc la chaîne avant toute mise à jour, sauf si l'étape de sauvegarde est retirée. Une nuit ainsi arrêtée n'a rien changé sur le serveur, et elle redémarre tout de même le serveur si un redémarrage est dû et que l'étape **Redémarrage** est activée. Lorsqu'aucune sauvegarde n'est configurée, la chaîne saute de l'étape de sauvegarde au contrôle de santé avant les mises à jour, consigne un événement au Journal et applique tout de même les mises à jour; le panneau affiche une bannière sur chaque page tant qu'aucune sauvegarde n'est configurée. Lorsque la chaîne ne change alors rien (l'entretien nocturne est désactivé, ou **Mises à jour** et **Mise à niveau du moteur Docker** sont toutes deux retirées), la bannière est raccourcie : "Aucune sauvegarde n'est configurée. En configurer une dans Paramètres."

### Choisir les étapes

Sous **Étapes**, dans la section **Entretien nocturne**, chaque étape de la chaîne est une case accompagnée d'un résumé d'une ligne, dans l'ordre où elle s'exécute :

1. **Sauvegarde**
2. **Test de restauration**
3. **Vérification du dépôt de sauvegarde**
4. **Copie hors site**
5. **Vérification de la copie hors site**
6. **Contrôle de santé avant les mises à jour**
7. **Analyse des paquets du serveur**
8. **Mises à jour**
9. **Analyse des images**
10. **Veille des vulnérabilités**
11. **Mise à niveau du moteur Docker**
12. **Redémarrage**

Toutes les étapes sont activées, sauf **Veille des vulnérabilités**. La vérification de l'espace disque au début et le nettoyage des anciennes couches d'images à la fin s'exécutent toujours et n'ont pas de case. Pour retirer une étape, décochez sa case et appuyez sur **Enregistrer les horaires** : la chaîne la saute chaque nuit. Pour la remettre, cochez la case et enregistrez de nouveau.

Certains choix sont imposés ou refusés :

- Tant que la copie hors site est activée et qu'une copie hors site est déclarée (voir [Copies hors site](/fr/configuration/backups/#copies-hors-site)), **Test de restauration** et **Vérification du dépôt de sauvegarde** restent cochées et grisées, avec la raison "Cette étape reste active tant que la copie hors site l'est : la copie va vers un stockage dont rien ne peut être supprimé, elle ne s'exécute donc qu'après la réussite du test de restauration et de la vérification du dépôt." Une fois enregistrées, elles restent cochées après la désactivation de la copie hors site, jusqu'à ce que vous les décochiez et enregistriez de nouveau.
- Avec Catena Pro, **Copie hors site** et **Vérification de la copie hors site** sont grisées, avec "Exige Catena Business : sans elle, la copie hors site ne s'exécute pas, ni selon un horaire ni à la main."
- Sans copie hors site déclarée, **Copie hors site** affiche l'indication "Aucune copie hors site n'est déclarée dans Paramètres : cette étape ne copie donc rien."
- La veille des vulnérabilités s'exécute soit comme étape, soit selon son propre horaire, jamais les deux. Cocher **Veille des vulnérabilités** alors que son propre horaire est activé, ou activer cet horaire alors que l'étape est cochée, est refusé avec "La veille des vulnérabilités s'exécute soit chaque nuit dans l'entretien nocturne, soit selon son propre horaire, pas les deux. Désactiver l'un des deux." et la page indique "Rien n'a été enregistré. Les étapes de l'entretien nocturne, plus bas, en donnent la raison." Désactivez l'un des deux et enregistrez de nouveau.

Cinq combinaisons s'enregistrent, avec un avertissement sous la liste :

| Combinaison | Avertissement |
|---|---|
| **Mises à jour** ou **Mise à niveau du moteur Docker** activées, **Sauvegarde** désactivée | "Les mises à jour ou la mise à niveau du moteur Docker sont activées, mais pas la sauvegarde. Une mise à jour ou une migration de base de données ratée pourrait entraîner une perte de données définitive : les services de Catena ne gardent aucune copie de leurs données pendant leur mise à jour, et un dommage découvert après qu'une mise à jour a réussi son contrôle de santé n'a rien vers quoi revenir." |
| **Sauvegarde** activée, **Test de restauration** désactivé | "La sauvegarde nocturne n'est pas testée par une restauration. Une sauvegarde impossible à restaurer n'est découverte qu'au moment où on en a besoin." |
| **Sauvegarde** activée, **Vérification du dépôt de sauvegarde** désactivée | "Le dépôt de sauvegarde n'est pas vérifié après la sauvegarde nocturne. Un dommage dans le stockage des sauvegardes n'est découvert qu'au moment d'une restauration." |
| **Mises à jour** ou **Mise à niveau du moteur Docker** activées, **Contrôle de santé avant les mises à jour** désactivé | "Le contrôle de santé avant les mises à jour est désactivé. Une mise à jour peut s'appliquer à un service déjà en panne, et la comparaison qui décide de remettre la version précédente ne peut alors pas savoir que la mise à jour l'a cassé." |
| **Copie hors site** activée, **Vérification de la copie hors site** désactivée | "La vérification de la copie hors site est désactivée. Rien ne prouve que la copie hors site peut être relue : une copie impossible à restaurer n'est découverte qu'au moment où on en a besoin, et les mises à jour n'attendent pas cette preuve." |

Tant que l'entretien nocturne est activé et exécute **Mises à jour** ou **Mise à niveau du moteur Docker** avec **Sauvegarde** retirée, chaque page d'administration s'ouvre sur une bannière d'avertissement : "L'entretien nocturne met ce serveur à jour sans son étape de sauvegarde. Une mise à jour ou une migration de base de données ratée pourrait entraîner une perte de données définitive. Réactiver l'étape de sauvegarde dans Horaires, sous Entretien nocturne." La bannière mène à la liste des étapes.

Avec **Redémarrage** désactivé, l'entretien nocturne ne redémarre jamais le serveur. Un redémarrage en attente affiche alors la bannière "Une mise à jour installée ne prend effet qu'après le redémarrage de ce serveur. Le redémarrer depuis la page Système." Redémarrez depuis **Système** > **Redémarrage** (voir [Mises à jour](/fr/configuration/updates/)).

### Ce que l'entretien nocturne consigne

Le **Journal** consigne le résultat de chaque nuit, et chaque avertissement une seule fois, au moment où sa combinaison commence à s'appliquer :

| Événement |
|---|
| L'entretien nocturne s'est terminé. |
| L'entretien nocturne ne s'est pas terminé correctement. Étape en échec : `<étape>`. |
| L'entretien nocturne applique ses mises à jour sans sa sauvegarde, retirée sur la page Horaires. Une mise à jour ou une migration de base de données ratée pourrait entraîner une perte de données définitive. |
| L'entretien nocturne fait sa sauvegarde sans le test de restauration, retiré sur la page Horaires. Une sauvegarde impossible à restaurer n'est découverte qu'au moment où on en a besoin. |
| L'entretien nocturne fait sa sauvegarde sans la vérification du dépôt de sauvegarde, retirée sur la page Horaires. Un dommage dans le stockage des sauvegardes n'est découvert qu'au moment d'une restauration. |
| L'entretien nocturne applique ses mises à jour sans le contrôle de santé avant les mises à jour, retiré sur la page Horaires. Une mise à jour peut s'appliquer à un service déjà en panne, et le contrôle qui la suit ne peut alors pas savoir si elle l'a cassé. |
| L'entretien nocturne fait sa copie hors site sans la vérification de la copie hors site, retirée sur la page Horaires. Rien ne prouve que la copie peut être relue, et les mises à jour n'attendent pas cette preuve. |

L'étape nommée pour une nuit en échec est celle qui l'a arrêtée, sinon la première qui a échoué.

L'entretien nocturne a aussi sa propre vérification Healthchecks, nommée **Nightly maintenance**. Elle est avertie au début de chaque nuit, quand une étape échoue et à la fin de la nuit : une nuit qui échoue ou ne s'exécute pas déclenche donc une alerte (voir [Alertes](/fr/configuration/alerts/)). L'entretien nocturne ne se signale aux vérifications de la sauvegarde que tant que **Sauvegarde** est une étape, et à celles de la copie hors site que tant que **Copie hors site** en est une.

## Syntaxe des horaires

Un horaire est une expression de calendrier systemd, que vous écrivez dans le champ **Horaire** de chaque tâche. Formes courantes :

| Expression | Signification |
|---|---|
| `Sun 3:00` | chaque dimanche à 3 h |
| `3:00` | chaque jour à 3 h |
| `*-*-1 3:00` | à 3 h le premier jour de chaque mois |
| `hourly`, `monthly` | les intervalles nommés |
| `*:0/15` | chaque quart d'heure |

La fréquence d'exécution d'une tâche n'a pas de limite. Le lien **Référence complète de la syntaxe** ouvre la syntaxe complète.

### Outil de vérification

Sous **Vérifier un horaire**, saisissez une expression et appuyez sur **Vérifier**. Le panneau répond "Interprété comme : `<forme normalisée>`" et donne les trois prochaines exécutions, avant tout enregistrement. Chaque tâche a aussi son propre bouton **Vérifier** et une ligne **Prochaines exécutions** en lecture seule. Une expression invalide est refusée.

## Activer une tâche

1. Ouvrez **Horaires**.
2. Dans la section de la tâche, modifiez **Horaire** si la valeur par défaut ne convient pas, et cochez **Exécuter selon cet horaire**.
3. Appuyez sur **Enregistrer les horaires**. La page confirme par "Horaires enregistrés et appliqués à ce serveur." Un refus affiche "Ce serveur n'a pas accepté l'horaire.", suivi de la raison.

L'enregistrement règle aussi les vérifications Healthchecks de la sauvegarde, de la copie hors site, de l'entretien nocturne et du signal de vie hors site sur les nouveaux horaires; une vérification à laquelle aucune tâche activée ne se signale est en pause. Quand Healthchecks ne répond pas, la page indique "Horaires enregistrés et appliqués à ce serveur. Healthchecks n'a pas répondu : les vérifications qui surveillent ces tâches prendront les nouveaux horaires au prochain enregistrement des horaires ou à la prochaine mise à jour de la configuration de ce serveur." Une vérification réactivée affiche "new" dans Healthchecks jusqu'à la prochaine exécution de sa tâche.

Lorsque rien n'est activé, la page avertit : "Aucune tâche n'est planifiée sur ce serveur, donc aucune sauvegarde ne sera faite. Activez l'horaire de sauvegarde ci-dessous."

## Combien de sauvegardes conserver

Sous **Combien de sauvegardes conserver**, cinq nombres déterminent ce qui survit à l'élagage. Chaque ligne est conservée indépendamment.

| Champ | Défaut |
|---|---|
| **Plus récentes** | 0 |
| **Horaires** | 24 |
| **Quotidiennes** | 7 |
| **Hebdomadaires** | 4 |
| **Mensuelles** | 6 |

Conserver les 8 plus récentes et 24 horaires avec un horaire au quart d'heure garde 8 sauvegardes sur les deux dernières heures et 22 autres sur le reste de la journée. Un zéro signifie qu'aucune n'est conservée sur cette base. Chaque nombre doit être un entier supérieur ou égal à zéro, et au moins un doit dépasser zéro : des zéros partout supprimeraient tous les instantanés à l'élagage suivant, et l'enregistrement est donc refusé. Les nombres s'appliquent même si aucune tâche n'est activée.

## Lorsque l'abonnement prend fin

Les minuteries sont désactivées et les tâches cessent de s'exécuter. Les horaires et les nombres de conservation enregistrés sont conservés. Les applications, leurs données et les sauvegardes manuelles ne sont pas touchées. Le Journal et une bannière consignent le verrouillage.

## Dépannage

| Symptôme | Cause et correctif |
|---|---|
| "Les horaires s'activent avec une licence Catena." | Aucun abonnement Catena Pro ou Catena Business actif. Vérifiez **Paramètres** > **Abonnement**. |
| "Ce serveur n'a pas accepté l'horaire." | La raison suit le message; le plus souvent, une expression qui ne s'interprète pas. Utilisez **Vérifier**. |
| "Impossible de joindre ce serveur pour lire ou modifier l'horaire." | L'hôte n'a pas répondu; réessayez dans un instant. |
| Une tâche n'a pas démarré à l'heure réglée | Le délai aléatoire s'applique; une exécution manquée démarre au prochain démarrage. |
| L'activation de **Signal de vie hors site** est refusée | L'adresse du signal de vie hors site dans **Paramètres** > **Alertes et signalement des tâches manquées** est vide ou n'est pas une adresse web (`http://` ou `https://`). Enregistrez-la d'abord. |
