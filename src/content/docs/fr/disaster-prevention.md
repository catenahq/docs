---
title: "Tâches récurrentes"
description: "La courte liste de ce qu'il faut faire à l'intégration, une fois par mois et une fois par an pour que la reprise reste toujours possible."
---

Voici les tâches qui gardent une installation récupérable. Elles ont
leur place **avant** que quelque chose tourne mal, pour que si cela
arrive, la journée tombe du côté "mardi pénible" et non du côté
"perte de données". La page compagne,
[Se remettre d'une panne](/fr/disaster-recovery/), couvre ce qu'il faut
faire une fois que quelque chose est déjà cassé.

**Quand faire chacune :**

- **À l'intégration (une fois) :** sauvegarder le jeu de clés de
  récupération (1), sortir la clé SSH du portable (2), confirmer
  l'emplacement du compartiment (3) et le miroir immuable (4), décider
  d'un second compartiment (5), et confirmer le chemin de récupération
  de bout en bout (7).
- **Une fois par mois :** un coup d'oeil rapide pour vérifier que les
  sauvegardes arrivent toujours et que rien dans le jeu de clés n'a
  bougé.
- **Une fois par an :** reconfirmer le miroir immuable, le second
  compartiment (là où il y en a un), et que le jeu de clés sauvegardé
  correspond toujours à ce qui est installé (6).

> Cette page est écrite pour des lectrices et lecteurs non
> techniques -- propriétaires, gestionnaires, personnel de bureau.
> Aucune commande terminal n'est requise. Les pages compagnes
> [Se remettre d'une panne](/fr/disaster-recovery/) et
> [Reconstruire un serveur à partir de la sauvegarde](/fr/self-restore/)
> associent chaque incident à sa voie de récupération.

## Le principe : deux voies indépendantes, deux sauvegardes indépendantes

L'infrastructure est conçue de telle sorte que la **voie publique**
(Tunnel Cloudflare -> les applications) et la **voie
d'administration** (Tailscale -> SSH) sont indépendantes l'une de
l'autre. Casser l'une ne casse pas l'autre. De même, le **serveur**
et le **compartiment de sauvegarde** ont leur place chez des
entreprises différentes, de sorte qu'une seule panne de fournisseur
ne peut pas faire tomber les deux. (Cela se configure à
l'installation ; l'endpoint du dépôt de sauvegarde est affiché dans le
panneau catena-admin Settings pour qui n'est pas certain que ce soit
en place.) La prévention consiste surtout à **ne pas faire
s'effondrer ces indépendances**.

## Liste de vérification -- à faire à la remise, puis une fois par an

### 1. Sauvegarder le jeu de clés de récupération

L'installation présente une fois un petit ensemble d'identifiants (et
ils sont reconsultables à tout moment depuis le panneau de jeu de clés
de récupération de catena-admin). Trois d'entre eux composent le
**jeu de clés de récupération** -- les seules choses nécessaires pour
reconstruire un serveur à partir de la sauvegarde, et les seules qui
vivent *à l'extérieur* de la sauvegarde chiffrée :

- L'**emplacement du dépôt de sauvegarde** -- l'adresse ("point
  d'accès") du stockage de sauvegarde plus le nom du compartiment (là
  où vivent les sauvegardes).
- Les **clés de stockage** de ce compartiment -- une clé d'accès et
  une clé secrète, appariées.
- Le **mot de passe de chiffrement de la sauvegarde** -- sans lui,
  chaque octet du compartiment de sauvegarde est du texte chiffré
  illisible.

Tout le reste -- chaque réglage interne et chaque secret qu'utilisent
les applications -- se trouve dans la sauvegarde chiffrée et revient
automatiquement quand les données sont restaurées. Il n'y a rien
d'autre à conserver et rien à ressaisir ; les trois éléments
ci-dessus suffisent à ramener tout le serveur.

Un élément de plus vaut la peine d'être conservé aux côtés du jeu de
clés, même s'il concerne l'*accès* plutôt que la *récupération* :

- Une **copie de la clé SSH privée** utilisée pour se connecter au
  serveur -- le filet de sécurité pour un accès direct quand nous ne
  sommes pas joignables (voir la section 2).

Chaque élément a sa place dans un gestionnaire de mots de passe,
étiqueté clairement ("serveur -- chiffrement sauvegarde", "serveur --
clés de stockage", "serveur -- emplacement sauvegarde", "serveur --
clé SSH privée"). **Comme entrées séparées** même si cela semble
redondant -- perdre l'un des éléments du jeu de clés coûte la voie de
récupération. Le mot de passe de chiffrement déverrouille les données,
les clés de stockage permettent à la restauration de lire le
compartiment, et l'emplacement de la sauvegarde indique où regarder.

### 2. Garder la clé SSH privée hors du portable

Un portable qui meurt sans clé SSH de secours signifie perdre
l'accès distant jusqu'à ce que le mode secours du fournisseur le
rétablisse. Quelques façons d'éviter ça :

- Copier la clé privée sur une clé USB chiffrée conservée dans un
  coffre ou à une autre adresse.
- Utiliser une clé matérielle (YubiKey) -- le matériel de clé ne
  quitte jamais l'appareil.
- Utiliser un gestionnaire de mots de passe qui stocke les pièces
  jointes (1Password, Bitwarden payant) et y mettre la clé privée.

L'une des trois, aujourd'hui.

### 3. Vérifier que le compartiment de sauvegarde est dans une ville différente du serveur

Un incendie de centre de données (OVH Strasbourg 2021) peut détruire
chaque machine dans un bâtiment d'un seul coup. Un serveur à
Beauharnois veut son compartiment de sauvegarde à Toronto, à
Montréal-Ouest, à Francfort ou dans tout autre endroit qui
survivrait à la même catastrophe locale.

L'emplacement du compartiment est dans catena-admin Settings --
l'endpoint du dépôt et la région y sont affichés ("eu-west-1" /
"us-east-005" / et les autres).

### 4. Confirmer que l'infrastructure a un instantané hebdomadaire dans un compartiment immuable

Si une attaque par rançongiciel atteint le serveur, l'attaquant a
accès au même mot de passe de chiffrement de la sauvegarde et aux
mêmes clés de stockage que chaque sauvegarde. Avec ça, il
pourrait en principe supprimer les sauvegardes historiques avant
de chiffrer le disque actif -- transformant un incident
récupérable en perte irréversible.

La défense : l'infrastructure embarque un **miroir hebdomadaire** qui
copie le compartiment de sauvegarde actif (mutable) vers un
compartiment SÉPARÉ avec Object Lock / WORM activé. Le compartiment
actif reste normal pour que l'étape de nettoyage de chaque sauvegarde
fonctionne sans interférence ; le miroir hebdomadaire capture l'état
du compartiment au moment de la synchro et le range là où il ne peut
être ni supprimé ni écrasé avant l'expiration de la fenêtre de
rétention (typiquement 30 jours).

Résultat : même si l'attaquant efface tout dans le compartiment
actif, le miroir de la semaine dernière est toujours dans le
stockage immuable, récupérable jusqu'à la dernière bonne semaine. La
pire fenêtre de perte de données est d'une semaine, pas "tout".

Deux choses à confirmer directement :

1. Le miroir immuable hebdomadaire tourne -- catena-admin
   **Actions -> Check backup coverage** montre si la copie de la
   semaine dernière s'est terminée.
2. Le compartiment immuable vit chez un **fournisseur différent**
   du compartiment de sauvegarde actif. Les deux ont été configurés
   par le client, c'est donc une vérification contre ces notes. Si le
   fournisseur du compartiment actif est celui qui est compromis,
   mettre le miroir au même endroit annule l'effet.

Le miroir tourne une fois par semaine, avant toute fenêtre de
mise à jour, sur un horaire fixe qui ne dépend pas du fait que
les mises à jour soient déclenchées cette semaine ou non. Il
échoue en douceur : un compartiment immuable mal configuré ne peut
pas bloquer les sauvegardes -- le run de sauvegarde ne touche que le
compartiment actif.

### 5. Optionnel -- ajouter un second compartiment de sauvegarde appartenant au client

Le miroir immuable de la section 4 tourne sur un calendrier fixe
défini à l'installation. Une seconde voie de sauvegarde appartenant
en propre au client -- facturation distincte, fournisseur distinct,
identifiants entièrement sous sa garde -- peut s'ajouter par-dessus.

C'est superflu pour la plupart des déploiements (le miroir immuable
géré de la section 4 protège déjà contre les rançongiciels et la
prise de contrôle de compte). À envisager quand :

- Le mot de passe de chiffrement et les clés de stockage doivent
  rester entièrement sous la garde du client, sur une voie de
  sauvegarde que personne d'autre n'a jamais touchée.
- Une obligation de conformité ou contractuelle exige une copie
  hors-site explicitement détenue par le client.
- Une redondance géographique au-delà du fournisseur du miroir est
  souhaitée (par ex. un compartiment au Canada, un dans l'UE,
  un aux États-Unis).

**Choisir un fournisseur qui prend en charge Object Lock.** Le
fournisseur doit prendre en charge **S3 Object Lock + versionnage**.
Les snapshots écrits dans un compartiment Object Lock ne peuvent
pas être supprimés ni écrasés avant la fin de la fenêtre de
rétention, même par quelqu'un qui détient des identifiants valides
-- c'est la même ligne de défense sur laquelle s'appuie le miroir
de la section 4.

Quelques options décentes :

- **eazybackup** -- Canadien, ca-central-1, Object Lock +
  versionnage pris en charge. Recommandation par défaut quand le
  compartiment principal est aussi canadien et qu'une séparation
  juridictionnelle compte.
- **AWS S3** -- Object Lock + versionnage, le plus éprouvé, le plus
  cher.
- **OVH Object Storage** -- tarification fixe, UE ; la disponibilité
  d'Object Lock demande une vérification dans la région cible.
- **Cloudflare R2** -- pas de frais d'égress, Object Lock +
  versionnage, US.

Éviter de mettre les deux compartiments chez la même société-mère.

**Créer le compartiment.** La documentation du fournisseur couvre les
étapes. État final :

- Un nom de compartiment (par ex. `acme-serveur-backup-2`).
- Un code de région (par ex. `ca-central-1`).
- Une URL de point d'accès (par ex. `s3.ca-central-1.amazonaws.com`).
- Une clé d'accès + secrète limitée à l'écriture dans ce
  compartiment.
- **Object Lock activé à la création** en mode compliance ou
  governance (compliance est plus fort -- même le propriétaire ne
  peut pas raccourcir la rétention).
- **Versionnage des objets activé** (Object Lock l'exige).
- Une période de rétention par défaut correspondant à la rétention
  de snapshots (typique : 30 à 90 jours).

La plupart des fournisseurs cachent Object Lock derrière une case
à cocher au moment de la création. Une case oubliée signifie
supprimer le compartiment et recommencer -- Object Lock ne peut pas
être activé rétroactivement chez la plupart des fournisseurs.

Le compartiment a sa place dans une autre ville -- et idéalement un
autre pays -- que le serveur et le compartiment de sauvegarde
principal.

**Ajouter le second compartiment dans catena-admin Settings**
(identifiants du fournisseur de sauvegarde + dépôt), puis confirmer
que la prochaine exécution y écrit avec **Actions -> Check backup
coverage**.

**Sauvegarder les identifiants dans un gestionnaire de mots de
passe**, à côté de l'entrée du compartiment principal, étiquetée
clairement. Le même mot de passe de chiffrement de la sauvegarde que
pour le principal convient -- un seul mot de passe ouvrant les deux
compartiments suffit.

**Une fois par an**, confirmer : le second compartiment reçoit
toujours les snapshots, les identifiants stockés correspondent à ce
qui est installé sur le serveur, et le fournisseur n'a pas modifié le
comportement d'Object Lock ou la tarification d'une façon qui compte.

Reconstruire à partir du compartiment secondaire est couvert par
[Reconstruire un serveur à partir de la sauvegarde](/fr/self-restore/)
-- la même voie, avec le jeu de clés du compartiment secondaire.

### 6. Garder le jeu de clés de récupération à jour

Une fois par trimestre, deux minutes confirment que le jeu de clés de
récupération est toujours complet et exact dans le gestionnaire de
mots de passe :

- l'emplacement du dépôt de sauvegarde,
- les clés de stockage, et
- le mot de passe de chiffrement de la sauvegarde.

Si l'un d'eux a été régénéré (par exemple avec l'action
rotate-backup-password de catena-admin), la copie sauvegardée se met
à jour le jour même. Un jeu de clés périmé est aussi bon que perdu le
jour où il sert.

### 7. Confirmer le chemin de récupération une fois

À un moment calme des six premiers mois, s'assurer que le chemin
de récupération fonctionne vraiment de bout en bout -- avant d'en
avoir besoin, pas pendant un incident :

- Vérifier que les trois éléments du jeu de clés sont sauvegardés
  dans le gestionnaire de mots de passe, chacun comme sa propre
  entrée, et que chacun s'ouvre réellement.
- Pour l'assurance la plus forte, faire un essai de restauration :
  `catena recover` sur un VPS jetable, et confirmer que les données
  reviennent. Voir [Reconstruire un serveur à partir de la
  sauvegarde](/fr/self-restore/). Une fois par an, et une vraie
  reprise devient un réflexe plutôt qu'une première tentative.

Ce qui manque ou reste incertain mérite d'être réglé maintenant --
15 minutes de temps tranquille.

## Récapitulatif -- à quoi ressemble "terminé"

Quand la prévention est en place, tout ceci est vrai dans trois
mois :

- [ ] Le mot de passe de chiffrement de la sauvegarde est dans un
      gestionnaire de mots de passe, clairement étiqueté.
- [ ] Les clés de stockage (clé d'accès + secrète) sont dans le
      gestionnaire de mots de passe, comme entrée séparée du mot de
      passe de chiffrement.
- [ ] L'emplacement de la sauvegarde (point d'accès + nom du
      compartiment) est dans le gestionnaire de mots de passe, avec
      les clés.
- [ ] Une copie de la clé SSH privée existe ailleurs que sur le
      portable actuel.
- [ ] La ville où vit le compartiment de sauvegarde est connue
      (et ce n'est pas la même ville que le serveur).
- [ ] L'infrastructure a un miroir hebdomadaire en compartiment
      immuable configuré (fournisseur différent du compartiment de
      sauvegarde actif, dernier run hebdomadaire terminé) -- confirmé
      dans catena-admin.
- [ ] Une décision a été prise sur un second emplacement de
      sauvegarde -- et si la réponse était oui, il a été ajouté.
- [ ] Le jeu de clés de récupération a été confirmé complet dans le
      gestionnaire de mots de passe (et, pour l'assurance la plus
      forte, un essai de restauration a été fait).

Tout "non" est le travail de la semaine. La page
[Se remettre d'une panne](/fr/disaster-recovery/) explique ce qu'il
faut faire une fois que la prévention a porté ses fruits.
