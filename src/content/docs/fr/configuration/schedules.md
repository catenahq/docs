---
title: "Horaires"
description: "Les sept tâches planifiées d'un serveur Catena, leurs heures par défaut, la syntaxe des horaires, la chaîne d'entretien nocturne et la conservation des sauvegardes."
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
| **Entretien nocturne** | `*-*-* 03:00:00` (chaque jour, 3 h) | jusqu'à 15 minutes | Sauvegarde, vérifie la sauvegarde, la copie hors site, puis fait passer les composants du serveur et les applications déployées à des versions plus récentes derrière ces vérifications. |
| **Copie hors site** | `*-*-* 04:30:00` (chaque jour, 4 h 30) | jusqu'à 30 minutes | Copie chaque compartiment déclaré vers le stockage non réinscriptible du second fournisseur (voir [Copies hors site](/fr/configuration/backups/#copies-hors-site)). Demande Catena Business. |
| **Contrôle d'intégrité des sauvegardes** | `Sun *-*-* 04:15:00` (dimanche, 4 h 15) | jusqu'à 1 heure | Lit un échantillon du dépôt de sauvegarde de bout en bout, ce qui détecte la corruption silencieuse du stockage entre deux instantanés. |
| **Mises à jour du panneau de contrôle** | `monthly` | jusqu'à 30 minutes | Fait passer le panneau de contrôle à une version plus récente, et remet la précédente si la nouvelle rend le serveur moins sain. Le panneau est indisponible environ une minute. |
| **Configuration du serveur** | `*-*-* 04:20:00` (chaque jour, 4 h 20) | jusqu'à 40 minutes | Ramène le serveur à la configuration que porte son panneau de contrôle. Ce qui a dérivé est rétabli, et ce qui est déjà correct n'est pas touché. |
| **Signal de vie hors site** | `*:0/5` (toutes les 5 minutes) | jusqu'à 30 secondes | Vérifie que la page d'état, le moniteur de tâches et le moniteur de ressources répondent, puis appelle l'adresse du signal de vie hors site enregistrée dans **Paramètres** > **Alertes et signalement des tâches manquées** (voir [Alertes](/fr/configuration/alerts/)). Demande cette adresse et Catena Pro. Sa section indique la période et le délai de grâce à régler sur la vérification externe. |

Le délai aléatoire étale le démarrage réel sur une fenêtre après l'heure réglée : une tâche démarre donc un peu plus tard que l'heure écrite. Une tâche manquée parce que le serveur était éteint ou en redémarrage s'exécute au prochain démarrage du serveur.

### Entretien nocturne

L'entretien nocturne est une chaîne ordonnée. Elle reprend d'elle-même si un redémarrage l'interrompt.

1. **Vérifications préalables.** Contrôle qu'au moins 5 Gio de disque sont libres.
2. **Scripts avant et après la sauvegarde.** Exécutent des scripts facultatifs lorsqu'il en existe sur le serveur. Rien n'est mis en pause sauf si un script le fait, et un script en échec ne produit qu'un avertissement.
3. **Sauvegarde.**
4. **Vérification à chaud.** Restaure le dernier instantané dans une zone temporaire et le contrôle.
5. **Contrôle du dépôt.** Vérifie les métadonnées du dépôt.
6. **Copie hors site.**
7. **Vérification de la copie hors site.**
8. **Barrière avant mise à jour.** Consulte la page d'état.
9. **Vulnérabilités de l'hôte.** Liste les avis de sécurité signalés dans les paquets du serveur (à titre informatif).
10. **Mises à jour des applications.** Met à jour les conteneurs du serveur et les applications déployées (voir [Mises à jour](/fr/configuration/updates/)).
11. **Analyse des images.** Analyse les images en cours d'exécution (à titre informatif; voir [Vulnérabilités](/fr/configuration/vulnerabilities/)).
12. **Mise à niveau du moteur Docker.** Au sein de la version majeure en cours; la version précédente est remise en place si le serveur ne revient pas en bonne santé.
13. **Nettoyage.** Supprime les couches d'images inutilisées de plus d'une semaine.
14. **Redémarrage.** Ne redémarre le serveur que si une mise à jour de sécurité l'exige, puis vérifie que chaque service est revenu.

Ces étapes arrêtent la chaîne, afin qu'aucune mise à jour ne s'applique par-dessus une défaillance : les vérifications préalables, la sauvegarde, la vérification à chaud, le contrôle du dépôt, la barrière avant mise à jour (tout point de contrôle en échec dans la page d'état) et la vérification de la copie hors site (exigée par défaut). Les autres étapes consignent leur résultat et laissent la chaîne se poursuivre.

Une sauvegarde configurée qui échoue, ou dont la vérification échoue, arrête donc la chaîne avant toute mise à jour. Lorsqu'aucune sauvegarde n'est configurée, la chaîne saute de l'étape de sauvegarde à la barrière avant mise à jour, consigne un événement au Journal et applique tout de même les mises à jour; le panneau affiche une bannière sur chaque page tant qu'aucune sauvegarde n'est configurée.

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

L'enregistrement règle aussi les vérifications Healthchecks de la sauvegarde, de la copie hors site et du signal de vie hors site sur les nouveaux horaires; une vérification à laquelle aucune tâche activée ne se signale est en pause. Quand Healthchecks ne répond pas, la page indique "Horaires enregistrés et appliqués à ce serveur. Healthchecks n'a pas répondu : les vérifications qui surveillent ces tâches prendront les nouveaux horaires au prochain enregistrement des horaires ou à la prochaine mise à jour de la configuration de ce serveur." Une vérification réactivée affiche "new" dans Healthchecks jusqu'à la prochaine exécution de sa tâche.

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
