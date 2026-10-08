---
title: "Paramètres du serveur"
description: "Fuseau horaire et paramètres régionaux, compte du partage de stockage de masse, remise à niveau du serveur selon sa configuration stockée et emplacement de la trousse de reprise après sinistre."
---

## Fuseau horaire et paramètres régionaux

**Paramètres** > **Fuseau horaire et paramètres régionaux** fixe le fuseau horaire du serveur et les paramètres régionaux de ses sessions en ligne de commande. Ils déterminent l'horodatage des journaux et des tâches planifiées. Ils ne changent pas la langue du panneau, que chaque visiteur choisit.

| Champ | Contenu |
|---|---|
| **Fuseau horaire** | Un fuseau de la liste du serveur. Par défaut `America/Toronto`. |
| **Paramètres régionaux** | Par défaut `en_CA.UTF-8`. Options : Anglais (Canada), Français (Canada), Anglais (États-Unis), Anglais (Royaume-Uni), Français (France), Allemand (Allemagne), Espagnol (Espagne), Italien (Italie), Néerlandais (Pays-Bas), Portugais (Brésil), Neutre (C). |

La section se termine par **Enregistrer et appliquer**. Un nom qui n'est pas un fuseau horaire est refusé : "Un nom de fuseau horaire, par exemple America/Toronto." Les horaires suivent le fuseau horaire du serveur : un changement ici décale l'heure à laquelle ils s'exécutent. Voir [Horaires](/fr/configuration/schedules/).

## Partage de stockage de masse

**Paramètres** > **Partage de stockage de masse (Windows/CIFS)** concerne un serveur configuré à l'installation pour monter un partage de stockage de masse depuis un NAS en CIFS, le protocole de partage de fichiers de Windows. Il contient le compte qui ouvre le partage :

- **Nom d'utilisateur du stockage de masse (partage Windows)**
- **Mot de passe du stockage de masse (partage Windows)**

Un partage monté en NFS n'en demande aucun, et un serveur sans partage laisse les deux champs vides. Le montage lui-même fait partie de l'installation du serveur : un changement ici prend effet lorsque l'installation est appliquée de nouveau (`uvx catena-installer install --inventory <nom>`, sans danger à relancer). La section a un simple **Enregistrer**; rien ne redémarre. Le mot de passe est stocké et jamais réaffiché.

## Configuration du serveur

**Paramètres** > **Configuration du serveur** ramène le serveur à la configuration établie lors de son installation. Ce qui a dérivé depuis est rétabli; ce qui est déjà correct n'est pas touché. Les données ne sont pas touchées.

### Ce qui s'affiche

- **Dernière remise à niveau** : un horodatage, ou "pas encore".
- **Automatique** : "Oui, selon l'horaire réglé dans Horaires." ou "Non. Se déclenche uniquement depuis cette page."
- En cours : "Remise à niveau du serveur en cours." Certains services redémarrent pendant l'opération, donc des parties du serveur peuvent être brièvement indisponibles. L'opération se poursuit même si la page est fermée.
- "Ce serveur est en pause pour maintenance : il a été laissé tel quel. L'opération reprendra d'elle-même à la fin de la maintenance."
- Après un échec : "La dernière tentative n'a pas abouti. Ce serveur fonctionne toujours sur la configuration qu'il avait auparavant, et rien n'est resté à moitié appliqué." Un journal de la tentative est replié sous "Ce que le serveur a enregistré pendant cette tentative".

### Lancer l'opération

1. Lire l'avertissement : "Les services redémarrent au fur et à mesure qu'ils retrouvent leur configuration prévue, donc des parties de ce serveur sont brièvement indisponibles. Les données ne sont pas touchées."
2. Cocher "Je comprends que des services redémarrent et sont brièvement indisponibles."
3. Appuyer sur **Remettre ce serveur à niveau**.

Le formulaire est masqué pendant une exécution ou quand le serveur ne peut pas être interrogé.

### Quand l'utiliser

- Après qu'une section a indiqué "Enregistré, mais l'application n'a pas démarré, sans doute parce que le serveur met déjà sa configuration à niveau."
- Après le rattachement ou le retrait d'un domaine supplémentaire, ou après le début ou la fin d'un abonnement, pour activer ou désactiver ce qu'il débloque.
- Quand le panneau Personnes indique qu'il n'a pas encore d'identifiant d'annuaire.
- Pour réparer un service qui a dérivé sans réinstaller.

### Fichiers gérés par Catena

Les fichiers que Catena gère sur le serveur sont remis à leur contenu prévu à chaque exécution : les modifications faites à la main dans ces fichiers ne survivent donc pas. Les réglages destinés à être modifiés se changent dans le panneau, où la valeur est stockée et survit à l'exécution. Les lignes ajoutées à la main aux clés SSH autorisées du compte `ops` font exception : elles restent. Voir [Accès administrateur et réseau privé](/fr/configuration/admin-access/).

La même configuration peut aussi s'exécuter selon un horaire. Voir [Horaires](/fr/configuration/schedules/).

## Trousse de reprise après sinistre

La trousse (adresse du dépôt de sauvegarde, clés de stockage et mot de passe de chiffrement des sauvegardes) qui reconstruit le serveur sur une nouvelle machine s'affiche et se gère sur la page des sauvegardes : voir [Sauvegardes et stockage S3](/fr/configuration/backups/). Sa consultation est consignée dans le journal administratif du serveur.

## Dépannage

- Une section indique que l'application n'a pas démarré : une autre exécution de configuration est en cours. Attendre sa fin, puis appuyer sur **Remettre ce serveur à niveau**.
- La dernière tentative a échoué : lire le journal sous "Ce que le serveur a enregistré pendant cette tentative". Le serveur garde sa configuration précédente, et relancer est sans danger.
- Un fuseau horaire est refusé : utiliser le nom exact, par exemple `America/Toronto`.
