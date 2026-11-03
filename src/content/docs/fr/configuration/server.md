---
title: "Paramètres du serveur"
description: "Fuseau horaire et paramètres régionaux, compte du partage de stockage de masse, application des paramètres enregistrés au serveur et emplacement de la trousse de reprise après sinistre."
---

## Fuseau horaire et paramètres régionaux

**Paramètres** > **Fuseau horaire et paramètres régionaux** fixe le fuseau horaire du serveur et les paramètres régionaux de ses sessions en ligne de commande. Ils déterminent l'horodatage des journaux et des tâches planifiées. Ils ne changent pas la langue du panneau, que chaque visiteur choisit.

| Champ | Contenu |
|---|---|
| **Fuseau horaire** | Un fuseau de la liste du serveur. Par défaut `America/Toronto`. |
| **Paramètres régionaux** | Par défaut `en_CA.UTF-8`. Options : Anglais (Canada), Français (Canada), Anglais (États-Unis), Anglais (Royaume-Uni), Français (France), Allemand (Allemagne), Espagnol (Espagne), Italien (Italie), Néerlandais (Pays-Bas), Portugais (Brésil), Neutre (C). |

La section se termine par **Enregistrer et appliquer**. Un nom qui n'est pas un fuseau horaire est refusé : "Un nom de fuseau horaire, par exemple America/Toronto." Les horaires suivent le fuseau horaire du serveur : un changement ici décale l'heure à laquelle ils s'exécutent. Voir [Horaires](/fr/configuration/schedules/).

## Partage de stockage de masse

**Paramètres** > **Partage de stockage de masse (Windows/CIFS)** concerne un serveur que vous configurez à l'installation pour monter un partage de stockage de masse depuis un NAS en CIFS, le protocole de partage de fichiers de Windows. Il contient le compte qui ouvre le partage :

- **Nom d'utilisateur du stockage de masse (partage Windows)**
- **Mot de passe du stockage de masse (partage Windows)**

Un partage monté en NFS n'en demande aucun, et un serveur sans partage laisse les deux champs vides. Le montage lui-même fait partie de l'installation du serveur : un changement ici prend effet lorsque vous appliquez de nouveau l'installation (`uvx catena-installer install --inventory <nom>`, sans danger à relancer). La section a un simple **Enregistrer**; rien ne redémarre. Le mot de passe est stocké et jamais réaffiché.

## Configuration du serveur

**Paramètres** > **Configuration du serveur** applique au serveur les paramètres enregistrés sur cette page, et remet en place tout ce qui a changé sur le serveur depuis. Les paramètres déjà en place ne sont pas touchés. Les sections de paramètres qui en ont besoin lancent cette opération d'elles-mêmes à l'enregistrement.

### Ce qui s'affiche

- **Dernière application** : un horodatage, ou "pas encore".
- **Automatique** : "Oui, selon l'horaire réglé dans Horaires." ou "Non. Se déclenche uniquement depuis cette page."
- En cours : "Application des paramètres enregistrés au serveur." Certains services redémarrent pendant l'opération, donc des parties du serveur peuvent être brièvement indisponibles. L'opération se poursuit même si vous fermez la page.
- Pendant que le serveur se vérifie après l'application : "Les paramètres sont appliqués. Le serveur se vérifie lui-même; les autres changements attendent la fin."
- Après l'échec de cette vérification : "Les paramètres ont été appliqués, et la vérification du serveur qui a suivi a échoué à : {étape}. Les sections concernées affichent Échec; le journal est ci-dessous. Appliquer de nouveau relance la vérification."
- Après un échec : "La dernière tentative s'est arrêtée à : {étape}. Ce qu'elle avait appliqué avant cette étape reste appliqué, et le journal est ci-dessous. Appliquer de nouveau ne présente aucun risque." Quand aucune étape n'est connue, le texte indique "La dernière tentative n'a pas abouti. Ce qu'elle avait appliqué avant reste appliqué, et le journal est ci-dessous. Appliquer de nouveau ne présente aucun risque." Un journal de la tentative est replié sous "Ce que le serveur a enregistré pendant cette tentative".
- Pendant qu'une exécution suivante est en cours, l'étape et le journal de la dernière tentative échouée restent affichés sous "La tentative précédente s'est arrêtée à cette étape :" et "Ce que le serveur a enregistré pendant la tentative précédente".

### Lancer l'opération

1. Lisez l'avertissement : "Les services redémarrent au fur et à mesure qu'ils retrouvent leur configuration prévue, donc des parties de ce serveur sont brièvement indisponibles. Les données ne sont pas touchées."
2. Cochez "Je comprends que des services redémarrent et sont brièvement indisponibles."
3. Appuyez sur **Appliquer les paramètres enregistrés**.

Le formulaire est masqué pendant une exécution ou quand le serveur ne peut pas être interrogé.

### Quand l'utiliser

- Après qu'une section a indiqué "Enregistré, mais l'application n'a pas démarré, sans doute parce que le serveur met déjà sa configuration à niveau."
- Après que vous avez rattaché ou retiré un domaine supplémentaire, ou après le début ou la fin de votre abonnement, pour activer ou désactiver ce qu'il débloque.
- Quand le panneau Personnes indique qu'il n'a pas encore d'identifiant d'annuaire.
- Pour réparer un service qui a dérivé sans réinstaller.

### Fichiers gérés par Catena

Les fichiers que Catena gère sur le serveur sont remis à leur contenu prévu à chaque exécution : les modifications faites à la main dans ces fichiers ne survivent donc pas. Changez plutôt dans le panneau les réglages destinés à être modifiés, où la valeur est stockée et survit à l'exécution. Les lignes que vous ajoutez à la main aux clés SSH autorisées du compte `ops` font exception : elles restent. Voir [Accès administrateur et réseau privé](/fr/configuration/admin-access/).

La même configuration peut aussi s'exécuter selon un horaire. Voir [Horaires](/fr/configuration/schedules/).

## Trousse de reprise après sinistre

La trousse (adresse du dépôt de sauvegarde, clés de stockage et mot de passe de chiffrement des sauvegardes) qui reconstruit le serveur sur une nouvelle machine s'affiche et se gère sur la page des sauvegardes : voir [Sauvegardes et stockage S3](/fr/configuration/backups/). Sa consultation est consignée dans le journal administratif du serveur.

## Dépannage

- Une section indique qu'elle appliquera le changement dès que la mise à niveau en cours sera terminée : rien à faire, le serveur l'applique lors d'une exécution de plus, juste après.
- Une section indique que l'application n'a pas démarré : elle n'a pu ni démarrer ni être mise en file derrière l'exécution de configuration en cours. Attendez la fin de cette exécution, puis appuyez sur **Appliquer les paramètres enregistrés**.
- La dernière tentative a échoué : lisez l'étape et le journal sous "Ce que le serveur a enregistré pendant cette tentative". Ce qu'elle avait appliqué avant l'étape reste appliqué, et appliquer de nouveau est sans danger.
- Une section affiche Échec et son indice renvoie ici : la vérification de cette section par le serveur a échoué après la dernière exécution. L'étape et le journal se trouvent dans cette section; appliquer de nouveau relance la vérification.
- Un fuseau horaire est refusé : utilisez le nom exact, par exemple `America/Toronto`.
