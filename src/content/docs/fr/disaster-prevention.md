---
title: "Tâches récurrentes"
description: "La courte liste de ce qu'il faut faire à l'intégration, une fois par mois et une fois par an pour que la reprise reste toujours possible."
---

Voici les tâches qui gardent votre installation récupérable.
Faites-les **avant** que quelque chose tourne mal, pour que si cela
arrive, vous soyez du côté "mardi pénible" et non du côté "perte de
données". La page compagne, [Se remettre d'une panne](/fr/disaster-recovery/),
couvre ce qu'il faut faire une fois que quelque chose est déjà cassé.

**Quand faire chacune :**

- **À l'intégration (une fois) :** sauvegardez votre jeu de clés de
  récupération (1), sortez votre clé SSH de votre portable (2),
  confirmez l'emplacement du compartiment (3) et le miroir immuable
  (4), décidez d'un second compartiment (5), et confirmez le chemin de
  récupération de bout en bout (7).
- **Une fois par mois :** un coup d'œil rapide pour vérifier que les
  sauvegardes arrivent toujours et que rien dans votre jeu de clés n'a
  bougé.
- **Une fois par an :** reconfirmez le miroir immuable, le second
  compartiment (si vous en avez un), et que votre jeu de clés
  sauvegardé correspond toujours à ce qui est installé (6).

> Cette page est écrite pour des lectrices et lecteurs non
> techniques -- propriétaires, gestionnaires, personnel de bureau.
> Aucune commande terminal n'est requise. Les pages compagnes
> [Se remettre d'une panne](/fr/disaster-recovery/) et
> [Reconstruire votre serveur à partir de la sauvegarde](/fr/self-restore/)
> associent chaque incident à sa voie de récupération.

## Le principe : deux voies indépendantes, deux sauvegardes indépendantes

Votre infrastructure est conçue de telle sorte que la **voie
publique** (Tunnel Cloudflare -> vos applis) et la **voie
d'administration** (Tailscale -> SSH) sont indépendantes l'une de
l'autre. Casser l'une ne casse pas l'autre. De même, votre **serveur**
et votre **compartiment de sauvegarde** devraient être chez des
entreprises différentes, de sorte qu'une seule panne de fournisseur
ne peut pas faire tomber les deux. (Vous configurez cela à
l'installation ; si vous n'êtes pas certain que c'est en place,
l'endpoint du dépôt de sauvegarde est affiché dans le panneau
catena-admin Settings.) La prévention consiste surtout à **ne pas
faire s'effondrer ces indépendances**.

## Liste de vérification -- à faire à la remise, puis une fois par an

### 1. Sauvegardez votre jeu de clés de récupération

L'installation présente une fois un petit ensemble d'identifiants (et
ils sont reconsultables à tout moment depuis le panneau de jeu de clés
de récupération de catena-admin). Trois d'entre eux composent votre
**jeu de clés de récupération** -- les seules choses nécessaires pour
reconstruire
votre serveur à partir de la sauvegarde, et les seules qui vivent
*à l'extérieur* de la sauvegarde chiffrée :

- L'**emplacement du dépôt de sauvegarde** -- l'adresse ("point
  d'accès") de votre stockage de sauvegarde plus le nom du
  compartiment (là où vivent vos sauvegardes).
- Les **clés de stockage** de ce compartiment -- une clé d'accès et
  une clé secrète, appariées.
- Le **mot de passe de chiffrement de la sauvegarde** -- sans lui,
  chaque octet de votre compartiment de sauvegarde est du texte
  chiffré illisible.

Tout le reste -- chaque réglage interne et chaque secret qu'utilisent
vos applications -- se trouve dans la sauvegarde chiffrée et revient
automatiquement quand vos données sont restaurées. Il n'y a rien
d'autre à conserver et rien à ressaisir ; les trois éléments
ci-dessus suffisent à ramener tout le serveur.

Un élément de plus vaut la peine d'être conservé aux côtés du jeu de
clés, même s'il concerne l'*accès* plutôt que la *récupération* :

- Une **copie de la clé SSH privée** utilisée pour se connecter à
  votre serveur -- votre filet de sécurité si vous avez un jour
  besoin d'un accès direct et ne pouvez pas nous joindre (voir la
  section 2).

Mettez chaque élément dans votre gestionnaire de mots de passe,
étiqueté clairement ("serveur -- chiffrement sauvegarde", "serveur --
clés de stockage", "serveur -- emplacement sauvegarde", "serveur --
clé SSH privée"). **Sauvegardez-les comme entrées séparées** même
si cela semble redondant -- perdre l'un des éléments du jeu de clés
vous coûte la voie de récupération. Le mot de passe de chiffrement
déverrouille les données, les clés de stockage permettent à la
restauration de lire le compartiment, et l'emplacement de la
sauvegarde indique où regarder.

### 2. Gardez votre clé SSH privée hors de votre portable

Votre portable qui meurt sans clé SSH de secours signifie perdre
l'accès distant jusqu'à ce que le mode secours du fournisseur vous
rentre. Quelques façons d'éviter ça :

- Copiez la clé privée sur une clé USB chiffrée conservée dans un
  coffre ou à une autre adresse.
- Utilisez une clé matérielle (YubiKey) -- le matériel de clé ne
  quitte jamais l'appareil.
- Utilisez un gestionnaire de mots de passe qui stocke les pièces
  jointes (1Password, Bitwarden payant) et mettez-y la clé privée.

Choisissez-en une. Faites-le aujourd'hui.

### 3. Vérifiez que votre compartiment de sauvegarde est dans une ville différente de votre serveur

Un incendie de centre de données (OVH Strasbourg 2021) peut détruire
chaque machine dans un bâtiment d'un seul coup. Si votre serveur vit à
Beauharnois, votre compartiment de sauvegarde devrait être à Toronto,
à Montréal-Ouest, à Francfort ou dans tout autre endroit qui
survivrait à la même catastrophe locale.

Si vous ne savez pas où se trouve votre compartiment de sauvegarde,
consultez catena-admin Settings -- l'endpoint du dépôt et la région y
sont affichés ("eu-west-1" / "us-east-005" / etc.).

### 4. Confirmez que votre infrastructure a un instantané hebdomadaire dans un compartiment immuable

Si une attaque par rançongiciel atteint votre serveur, l'attaquant a
accès au même mot de passe de chiffrement de la sauvegarde et aux
mêmes clés de stockage que chaque sauvegarde. Avec ça, il
pourrait en principe supprimer vos sauvegardes historiques avant
de chiffrer le disque actif -- transformant un incident
récupérable en perte irréversible.

La défense : votre infrastructure embarque un **miroir
hebdomadaire** qui copie votre compartiment de sauvegarde actif
(mutable) vers un compartiment SÉPARÉ avec Object Lock / WORM
activé. Le compartiment actif reste normal pour que l'étape de
nettoyage de chaque sauvegarde fonctionne sans interférence ;
le miroir hebdomadaire capture l'état du compartiment au moment de
la synchro et le range là où il ne peut être ni supprimé ni
écrasé avant l'expiration de la fenêtre de rétention
(typiquement 30 jours).

Résultat : même si l'attaquant efface tout dans le compartiment
actif, le miroir de la semaine dernière est toujours dans le
stockage immuable, récupérable jusqu'à votre dernière bonne
semaine. La pire fenêtre de perte de données est d'une
semaine, pas "tout".

Confirmez deux choses vous-même :

1. Le miroir immuable hebdomadaire tourne -- catena-admin
   **Actions -> Check backup coverage** montre si la copie de la
   semaine dernière s'est terminée.
2. Le compartiment immuable vit chez un **fournisseur différent**
   de votre compartiment de sauvegarde actif. Vous configurez les
   deux, c'est donc une vérification contre vos propres notes. Si le
   fournisseur du compartiment actif est celui qui est compromis,
   mettre le miroir au même endroit annule l'effet.

Le miroir tourne une fois par semaine, avant toute fenêtre de
mise à jour, sur un horaire fixe qui ne dépend pas du fait que
les mises à jour soient déclenchées cette semaine ou non. Il
échoue en douceur : un compartiment immuable mal configuré ne peut
pas bloquer vos sauvegardes -- le run de sauvegarde ne touche que le
compartiment actif.

### 5. Optionnel -- ajoutez un second compartiment de sauvegarde dont vous êtes propriétaire

Le miroir immuable de la section 4 tourne sur un calendrier fixe
défini à l'installation. Si vous voulez une seconde voie de sauvegarde
dont **vous** êtes propriétaire -- facturation distincte, fournisseur
distinct, identifiants entièrement sous votre contrôle -- vous pouvez
ajouter un second compartiment vous-même.

C'est superflu pour la plupart des déploiements (le miroir immuable
géré de la section 4 protège déjà contre les rançongiciels et la
prise de contrôle de compte). À envisager quand :

- Vous voulez que le mot de passe de chiffrement et les clés de
  stockage soient entièrement sous votre contrôle, sur une voie de
  sauvegarde que personne d'autre n'a jamais touchée.
- Une obligation de conformité ou contractuelle exige une copie
  hors-site explicitement détenue par le client.
- Vous voulez une redondance géographique au-delà du fournisseur
  du miroir (par ex. un compartiment au Canada, un dans l'UE,
  un aux États-Unis).

**Choisissez un fournisseur qui prend en charge Object Lock.** Le
fournisseur doit prendre en charge **S3 Object Lock + versionnage**.
Les snapshots écrits dans un compartiment Object Lock ne peuvent
pas être supprimés ni écrasés avant la fin de la fenêtre de
rétention, même par quelqu'un qui détient des identifiants valides
-- c'est la même ligne de défense sur laquelle s'appuie le miroir
de la section 4.

Quelques options décentes :

- **eazybackup** -- Canadien, ca-central-1, Object Lock +
  versionnage pris en charge. Recommandation par défaut quand le
  compartiment principal est aussi canadien et que vous voulez une
  séparation juridictionnelle.
- **AWS S3** -- Object Lock + versionnage, le plus éprouvé, le plus
  cher.
- **OVH Object Storage** -- tarification fixe, UE ; vérifiez la
  disponibilité d'Object Lock dans votre région cible.
- **Cloudflare R2** -- pas de frais d'égress, Object Lock +
  versionnage, US.

Évitez de mettre les deux compartiments chez la même société-mère.

**Créez le compartiment.** La documentation du fournisseur vous
guide. État final :

- Un nom de compartiment (par ex. `acme-serveur-backup-2`).
- Un code de région (par ex. `ca-central-1`).
- Une URL de point d'accès (par ex. `s3.ca-central-1.amazonaws.com`).
- Une clé d'accès + secrète limitée à l'écriture dans ce
  compartiment.
- **Object Lock activé à la création** en mode compliance ou
  governance (compliance est plus fort -- même le propriétaire ne
  peut pas raccourcir la rétention).
- **Versionnage des objets activé** (Object Lock l'exige).
- Une période de rétention par défaut correspondant à votre
  rétention de snapshots (typique : 30 à 90 jours).

La plupart des fournisseurs cachent Object Lock derrière une case
à cocher au moment de la création. Si vous oubliez de la cocher,
il faut supprimer le compartiment et recommencer -- Object Lock ne
peut pas être activé rétroactivement chez la plupart des
fournisseurs.

Assurez-vous que le compartiment est dans une autre ville -- et
idéalement un autre pays -- que votre serveur et votre compartiment
de sauvegarde principal.

**Ajoutez le second compartiment dans catena-admin Settings**
(identifiants du fournisseur de sauvegarde + dépôt), puis confirmez
que la prochaine exécution y écrit avec **Actions -> Check backup
coverage**.

**Sauvegardez les identifiants dans votre gestionnaire de mots de
passe**, à côté de l'entrée du compartiment principal, étiquetée
clairement. Utilisez le même mot de passe de chiffrement de la
sauvegarde que pour le principal -- un seul mot de passe ouvrant les
deux compartiments suffit.

**Une fois par an**, confirmez : le second compartiment reçoit
toujours les snapshots, vos identifiants stockés correspondent à ce
qui est installé sur le serveur, et le fournisseur n'a pas modifié le
comportement d'Object Lock ou la tarification d'une façon qui vous
concerne.

Si vous devez un jour reconstruire à partir du compartiment
secondaire, [Reconstruire votre serveur à partir de la sauvegarde](/fr/self-restore/)
couvre la procédure -- la même voie, avec le jeu de clés du
compartiment secondaire.

### 6. Gardez votre jeu de clés de récupération à jour

Une fois par trimestre, prenez deux minutes pour confirmer que votre
jeu de clés de récupération est toujours complet et exact dans votre
gestionnaire de mots de passe :

- l'emplacement du dépôt de sauvegarde,
- les clés de stockage, et
- le mot de passe de chiffrement de la sauvegarde.

Si l'un d'eux a été régénéré (par exemple avec l'action
rotate-backup-password de catena-admin), mettez à jour la copie
sauvegardée le jour même. Un jeu de clés périmé est aussi bon que
perdu le jour où vous en avez besoin.

### 7. Confirmez votre chemin de récupération une fois

À un moment calme des six premiers mois, assurez-vous que le chemin
de récupération fonctionne vraiment de bout en bout -- avant d'en
avoir besoin, pas pendant un incident :

- Vérifiez que les trois éléments du jeu de clés sont sauvegardés
  dans votre gestionnaire de mots de passe, chacun comme sa propre
  entrée, et que vous pouvez réellement les ouvrir.
- Pour l'assurance la plus forte, faites un essai de restauration
  vous-même : `catena recover` sur un VPS jetable et confirmez que vos
  données reviennent. Voir [Reconstruire votre serveur à partir de la
  sauvegarde](/fr/self-restore/). Faites-le une fois par an et une
  vraie reprise devient un réflexe, pas une première tentative.

Si quelque chose manque ou que vous n'êtes pas sûr, réglez-le
maintenant -- cela vaut 15 minutes de temps tranquille.

## Récapitulatif -- à quoi ressemble "terminé"

Quand la prévention est en place, le vous d'ici trois mois peut
répondre "oui" à tout cela :

- [ ] Mon mot de passe de chiffrement de la sauvegarde est dans mon
      gestionnaire de mots de passe, clairement étiqueté.
- [ ] Mes clés de stockage (clé d'accès + secrète) sont dans mon
      gestionnaire de mots de passe, comme entrée séparée du mot de
      passe de chiffrement.
- [ ] L'emplacement de ma sauvegarde (point d'accès + nom du
      compartiment) est dans mon gestionnaire de mots de passe, avec
      les clés.
- [ ] J'ai une copie de ma clé SSH privée ailleurs que sur mon
      portable actuel.
- [ ] Je sais dans quelle ville vit mon compartiment de sauvegarde
      (et ce n'est pas la même ville que mon serveur).
- [ ] Mon infrastructure a un miroir hebdomadaire en compartiment
      immuable configuré (fournisseur différent du compartiment de
      sauvegarde actif, dernier run hebdomadaire terminé) -- confirmé
      dans catena-admin.
- [ ] J'ai décidé si j'ai besoin d'un second emplacement de
      sauvegarde -- si oui, je l'ai ajouté.
- [ ] J'ai confirmé que mon jeu de clés de récupération est complet
      dans mon gestionnaire de mots de passe (et, si je voulais
      l'assurance la plus forte, fait un essai de restauration).

Si l'un de ces points est "non", travaillez-y cette semaine. La
page [Se remettre d'une panne](/fr/disaster-recovery/) explique ce qu'il
faut faire une fois que la prévention a porté ses fruits.
