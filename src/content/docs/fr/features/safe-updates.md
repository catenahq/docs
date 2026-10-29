---
title: "Mises à jour sûres"
description: "Comment le système d'exploitation, les applications, le panneau et le moteur Docker restent à jour, avec des vérifications avant chaque changement et un retour en arrière après."
---

Le système d'exploitation se corrige de lui-même, quelle que soit l'édition. Les applications et les services propres à Catena se mettent à jour selon un horaire, derrière une sauvegarde et des contrôles de santé, et reviennent en arrière d'eux-mêmes quand le serveur devient moins sain.

## Système d'exploitation

Les mises à niveau automatiques de Debian sont seules à appliquer les paquets du système : mises à jour de sécurité, mises à jour stables et versions intermédiaires. Le serveur ne redémarre jamais de sa propre initiative. Une vérification horaire lit si un redémarrage est nécessaire, et une bannière sur chaque page d'administration le signale. Le redémarrage est votre décision, prise depuis **Système** > **Redémarrage** (**Redémarrer ce serveur**), ou par l'entretien nocturne, qui ne redémarre qu'à sa dernière étape, seulement si c'est dû et seulement si cet horaire est activé.

## Entretien nocturne

Sur Catena Pro et Catena Business, **Horaires** > **Entretien nocturne** (désactivé par défaut, 3 h une fois activé) exécute une chaîne ordonnée : vérification de l'espace disque libre, sauvegarde, test de restauration, contrôle du dépôt de sauvegarde, copie hors site, barrière de santé Gatus, mises à jour des conteneurs, analyse des vulnérabilités, mise à niveau du moteur Docker et redémarrage si dû. La chaîne s'arrête avant toute mise à jour si le plancher d'espace disque, la sauvegarde, sa vérification ou la barrière de santé échoue, et elle reprend après un redémarrage. Sans sauvegarde configurée, les mises à jour s'exécutent quand même et une bannière d'avertissement signale qu'il n'y a rien vers quoi revenir. Vous choisissez les étapes qui s'exécutent, et un avertissement s'affiche lorsqu'une combinaison est risquée (voir [Choisir les étapes](/fr/configuration/schedules/#choisir-les-étapes)).

## Mises à jour des applications

- **Nouvelles versions d'une application.** Une application vient d'un dépôt, qui publie ses versions sous forme d'étiquettes. Une nouvelle version attend le délai d'attente, puis s'applique d'elle-même lorsque le dépôt est de confiance (le catalogue de Catena l'est), ou vous est proposée sur la page **Applications** lorsqu'il ne l'est pas. Lorsque la version en cours a plus de 12 mois, les mises à jour sont seulement proposées, même depuis un dépôt de confiance. Voir [Applications ajoutées depuis un dépôt](/fr/configuration/updates/#applications-ajoutées-depuis-un-dépôt).
- **Retenue, copies et annulation.** Une mise à jour retient les écritures de l'application et garde des copies de ses bases de données et de ses données. Elles sont gardées 14 jours et jusqu'à ce qu'une sauvegarde ultérieure réussisse, et tant qu'elles existent vous pouvez [annuler la mise à jour](/fr/configuration/updates/#annuler-une-mise-à-jour).
- **Applications modifiées à la main.** Une application modifiée à la main, ou par un autre gestionnaire de conteneurs, n'est pas mise à jour, et la page **Applications** le dit (voir [Applications modifiées hors de Catena](/fr/configuration/updates/#applications-modifiées-hors-de-catena)).
- **Seules les étiquettes complètes x.y.z sont mises à jour automatiquement.** Une étiquette comme `1.2.3` est admissible; `1.2`, `latest` ou `stable` ne sont jamais touchées.
- **Politique.** Vos applications reçoivent par défaut les mises à jour correctives (`1.2.3` vers `1.2.9`); les services propres à Catena prennent d'eux-mêmes leurs versions correctives, et les versions mineures et majeures plus récentes arrivent avec une mise à jour du panneau de contrôle (voir [Services propres à Catena](/fr/configuration/updates/#services-propres-à-catena)). L'étiquette `vps.auto-update=off|patch|minor|major`, propre à chaque application, remplace le défaut pour vos applications (voir [Configurer une application pour Catena](/fr/configure-apps/)). `off` laisse l'application telle quelle.
- **Délai d'attente.** Par défaut, une nouvelle version attend 7 jours après sa publication avant d'être adoptée.
- **Correction des CVE (Catena Pro).** Avant une mise à jour, les versions candidates sont analysées. Une version qui ajoute une nouvelle CVE élevée ou critique est écartée au profit d'une version inférieure saine, ou la mise à jour attend. Une version plus récente qui retire une CVE de la version en marche s'applique sans le délai de 7 jours.
- **Retour en arrière.** Après chaque changement, la santé du serveur est comparée à son état d'avant. En cas de régression, la version précédente est remise en place et la version fautive est mise de côté : la prochaine exécution essaie la version suivante. Une application avec base de données reçoit avant la mise à jour un vidage rejoué lors du retour en arrière. Une application dont la nouvelle version met à niveau sur place son code, sa configuration et ses modules complémentaires (Nextcloud) en reçoit aussi une copie, remise en place lors du retour en arrière; les fichiers de ses utilisateurs restent tels quels.
- **Journal.** L'onglet **Journal** consigne les sauvegardes, mises à jour, retours en arrière, changements de vulnérabilités et redémarrages.

## Panneau et moteur Docker

Le panneau a son propre horaire **Mises à jour du panneau de contrôle** (mensuel par défaut) et un bouton manuel **Mettre à jour ce panneau** dans **Paramètres** > **Version du panneau de contrôle**, qui fonctionne dans toutes les éditions. Le panneau est indisponible environ une minute, et une mise à jour qui échoue est annulée. Le moteur Docker est maintenu à sa version. Une mise à jour du panneau de contrôle le fait passer à la version qu'apporte sa version de Catena, dans toutes les éditions, et l'entretien nocturne le fait avancer au sein de sa version majeure; l'un et l'autre remettent la précédente si les services ne reviennent pas (voir [Moteur Docker](/fr/configuration/updates/#moteur-docker)).

## Ce qu'ajoute chaque édition

Communauté offre les correctifs du système, le signalement des redémarrages, la visibilité des versions, les alertes de sécurité pour les vulnérabilités exploitées et critiques (voir [Alertes de sécurité](/fr/configuration/vulnerabilities/#alertes-de-sécurité-toutes-les-éditions)) et les mises à jour manuelles du panneau et du moteur; pour les applications, aucune mise à jour n'est proposée ni appliquée. Catena Pro et Catena Business ajoutent l'entretien nocturne et les autres horaires, les mises à jour gérées des applications, la correction des CVE et le retour en arrière automatique. Voir la [comparaison des éditions](https://catena.run/fr/#pricing).

## Limites

- Seuls les conteneurs sont gérés; le système appartient à Debian.
- Aucune mise à jour n'est offerte pour une application dont l'étiquette n'est pas une version complète x.y.z.
- Le redémarrage nocturne est le seul redémarrage automatique.

## Configuration

- [Mises à jour](/fr/configuration/updates/)
- [Vulnérabilités](/fr/configuration/vulnerabilities/)
- [Horaires](/fr/configuration/schedules/)
