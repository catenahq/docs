---
title: "Prévention des sinistres : ce qu'il faut mettre en place pour que la récupération soit possible"
description: "Cette page est une liste de vérification de ce qu'il faut faire"
---

Cette page est une liste de vérification de ce qu'il faut faire
**avant** que quelque chose tourne mal, pour que si cela arrive, vous
soyez du côté "mardi pénible" et non du côté "perte de données".
La page compagne est [Reprise après sinistre](/fr/disaster-recovery/),
qui couvre ce qu'il faut faire une fois que quelque chose est déjà
cassé.

Les deux pages sont écrites pour être lues dans l'ordre : la
prévention d'abord, puis la récupération pour que vous sachiez contre
quoi la prévention vous protège.

> Cette page est écrite pour des lectrices et lecteurs non
> techniques -- propriétaires, gestionnaires, personnel de bureau.
> Aucune commande terminal n'est requise hors de l'étape facultative
> "tester une fois". Les pages compagnes
> [Reprise après sinistre](/fr/disaster-recovery/) et
> [Restaurer sur un nouveau VPS](/fr/self-restore/) supposent un peu
> plus d'aisance technique et descendent en ligne de commande.

## Le principe : deux voies indépendantes, deux sauvegardes indépendantes

Votre infrastructure est conçue de telle sorte que la **voie
publique** (Tunnel Cloudflare -> vos applis) et la **voie
d'administration** (Tailscale -> SSH) sont indépendantes l'une de
l'autre. Casser l'une ne casse pas l'autre. De même, votre **VPS** et
votre **compartiment de sauvegarde** devraient être chez des
entreprises différentes, de sorte qu'une seule panne de fournisseur
ne peut pas faire tomber les deux. (C'est une étape ponctuelle de la
prise en main -- vérifiez avec votre opérateur que c'est en place si
vous n'êtes pas certain.) La prévention consiste surtout à **ne pas
faire s'effondrer ces indépendances**.

## Liste de vérification -- à faire à la remise, puis une fois par an

### 1. Sauvegardez les identifiants de récupération que votre opérateur vous a remis

Lors de la remise, votre opérateur vous a donné un petit kit
d'identifiants. Le contenu exact dépend de la formule choisie, mais
chaque kit comprend ces quatre éléments :

- Le **mot de passe de chiffrement du dépôt restic** -- sans lui,
  chaque octet du compartiment de sauvegarde est du texte chiffré
  illisible.
- La **clé d'accès S3 + clé secrète** qui pointent sur votre
  compartiment de sauvegarde (une chaîne "access key" + une chaîne
  "secret", appariées).
- Une **copie de la clé SSH privée** que l'opérateur utilise pour
  se connecter à votre VPS -- votre filet de sécurité si l'opérateur
  devient injoignable.
- L'**adresse de votre compartiment de sauvegarde** (l'URL ou le
  "point d'accès" du service S3, plus le nom du compartiment).

Certains kits incluent aussi un **mot de passe de coffre** (aussi
appelé "mot de passe maître" dans les anciennes docs). Celui-ci
n'a d'utilité que si votre opérateur vous a aussi remis le fichier
de secrets chiffré lui-même -- la plupart des clients n'ont pas ce
fichier directement, parce que la voie de récupération actuelle
passe par le bouton [Exporter les clés de récupération](/fr/disaster-recovery/),
qui vous laisse réexporter à la demande un paquet chiffré protégé
par une phrase de passe que VOUS choisissez au moment du clic. Si
votre kit ne contient pas de mot de passe de coffre, vous n'en avez
pas besoin -- le bouton d'export couvre le scénario.

Mettez chaque identifiant dans votre gestionnaire de mots de passe,
étiqueté clairement ("VPS -- chiffrement sauvegardes", "VPS --
clé d'accès S3", "VPS -- clé SSH privée", "VPS -- URL du
compartiment"). **Sauvegardez-les comme entrées séparées** même
si cela semble redondant -- perdre l'un ou l'autre vous coûte une
voie de récupération. Le mot de passe restic déchiffre les données,
les clés S3 vous laissent lire le compartiment, la clé SSH vous
laisse vous connecter au serveur, et l'URL du compartiment vous dit
où regarder.

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

### 3. Vérifiez que votre compartiment de sauvegarde est dans une ville différente de votre VPS

Un incendie de centre de données (OVH Strasbourg 2021) peut détruire
chaque machine dans un bâtiment d'un seul coup. Si votre VPS vit à
Beauharnois, votre compartiment de sauvegarde devrait être à Toronto,
à Montréal-Ouest, à Francfort ou dans tout autre endroit qui
survivrait à la même catastrophe locale.

Si vous ne savez pas où se trouve votre compartiment de sauvegarde,
demandez à votre opérateur. C'est une question ponctuelle avec une
réponse simple ("eu-west-1" / "us-east-005" / etc.).

### 4. Confirmez que votre infrastructure a un instantané hebdomadaire dans un compartiment immuable

Si une attaque par rançongiciel atteint votre VPS, l'attaquant a
accès au même mot de passe restic et aux mêmes clés S3 que la
sauvegarde nocturne. Avec ça, il pourrait en principe lancer un
`forget --prune` et supprimer vos sauvegardes historiques avant
de chiffrer le disque actif -- transformant un incident
récupérable en perte irréversible.

La défense : votre infrastructure embarque un **miroir
hebdomadaire** qui copie votre compartiment de sauvegarde actif
(mutable) vers un compartiment SÉPARÉ avec Object Lock / WORM
activé. Le compartiment actif reste normal pour que l'élagage
nocturne de restic fonctionne sans interférence ; le miroir
hebdomadaire capture l'état du compartiment au moment de la
synchro et le range là où il ne peut être ni supprimé ni
écrasé avant l'expiration de la fenêtre de rétention
(typiquement 30 jours).

Résultat : même si l'attaquant efface tout dans le compartiment
actif, le miroir de la semaine dernière est toujours dans le
stockage WORM, récupérable jusqu'à votre dernière bonne
semaine. La pire fenêtre de perte de données est d'une
semaine, pas "tout".

Demandez à votre opérateur de confirmer deux choses :

1. Le miroir WORM hebdomadaire est configuré (le minuteur
   systemd `catena-restic-mirror.timer` est activé, le
   compartiment WORM a ses identifiants dans le coffre, et le
   healthcheck de la dernière semaine a pingé vert).
2. Le compartiment WORM vit chez un **fournisseur différent**
   de votre compartiment de sauvegarde actif. Si le fournisseur
   du compartiment actif est celui qui est compromis, mettre le
   WORM au même endroit annule l'effet.

Le miroir tourne une fois par semaine, avant toute fenêtre de
mise à jour, sur un horaire fixe qui ne dépend pas du fait que
les mises à jour soient déclenchées cette semaine ou non. Il
échoue en douceur : un compartiment WORM mal configuré ne peut
pas bloquer la sauvegarde quotidienne -- le run quotidien ne
touche que le compartiment actif.

### 5. Optionnel -- ajoutez un second compartiment de sauvegarde dont vous êtes propriétaire

Le miroir WORM de la section 4 est configuré et exécuté par votre
opérateur sur un calendrier fixe. Si vous voulez une seconde voie
de sauvegarde dont **vous** êtes propriétaire -- facturation
distincte, fournisseur distinct, identifiants entièrement sous
votre contrôle -- vous pouvez ajouter un second compartiment
vous-même.

C'est superflu pour la plupart des déploiements (le miroir WORM de
la section 4 protège déjà contre les rançongiciels et la prise de
contrôle de compte). À envisager quand :

- Vous voulez que le mot de passe de chiffrement et les clés S3
  soient entièrement sous votre contrôle, sans intervention de
  l'opérateur dans le chemin de récupération.
- Une obligation de conformité ou contractuelle exige une copie
  hors-site explicitement détenue par le client.
- Vous voulez une redondance géographique au-delà du fournisseur
  du miroir WORM (par ex. un compartiment au Canada, un dans l'UE,
  un aux États-Unis).

**Choisissez un fournisseur qui prend en charge Object Lock.** Le
fournisseur doit prendre en charge **S3 Object Lock + versionnage**.
Les snapshots écrits dans un compartiment Object Lock ne peuvent
pas être supprimés ni écrasés avant la fin de la fenêtre de
rétention, même par quelqu'un qui détient des identifiants valides
-- c'est la même ligne de défense sur laquelle s'appuie le miroir
WORM de la section 4.

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

- Un nom de compartiment (par ex. `acme-vps-backup-2`).
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
idéalement un autre pays -- que votre VPS et votre compartiment de
sauvegarde principal.

**Transmettez les identifiants à votre opérateur** via le canal
chiffré que vous utilisez d'habitude (ne les collez pas dans un
courriel ou un Slack en clair). Votre opérateur intègre le second
compartiment au calendrier de sauvegarde et confirme que la
prochaine exécution y écrit bien.

**Sauvegardez les identifiants dans votre gestionnaire de mots de
passe**, à côté de l'entrée du compartiment principal, étiquetée
clairement. Utilisez le même mot de passe de chiffrement restic que
pour le principal -- un seul mot de passe ouvrant les deux
compartiments suffit.

**Une fois par an**, confirmez : le second compartiment reçoit
toujours les snapshots, vos identifiants stockés correspondent à ce
qui est installé sur le VPS, et le fournisseur n'a pas modifié le
comportement d'Object Lock ou la tarification d'une façon qui vous
concerne.

Si vous devez un jour restaurer depuis le compartiment secondaire,
la page [Restaurer sur un nouveau VPS](/fr/self-restore/) couvre la
procédure -- c'est la même que pour le principal, juste avec les
identifiants du secondaire dans les variables d'environnement.

### 6. Utilisez le bouton "Exporter les clés de récupération" de manière proactive

Sur [actions.yourdomain.com](https://actions.yourdomain.com/),
dans la section **Ops / divers**, il y a un bouton intitulé
**"Exporter les clés de récupération (chiffrées)"** (🔐). La plupart
du temps, il est utilisé quand quelque chose est déjà mal tourné --
mais il fonctionne aussi comme prévention.

Chaque trimestre :

1. Cliquez sur le bouton, tapez une phrase de passe solide (votre
   gestionnaire de mots de passe peut en générer une).
2. Ouvrez [recovery.yourdomain.com](https://recovery.yourdomain.com/)
   dans votre navigateur, connectez-vous comme administrateur, et
   téléchargez le plus récent fichier `secrets-*.yml.gpg` sur votre
   portable.
3. Stockez le fichier `.gpg` + la phrase de passe utilisée pour le
   chiffrer dans votre gestionnaire de mots de passe (joignez le
   fichier ; sauvegardez la phrase de passe comme une entrée
   séparée).

Cela vous donne un **kit de récupération prêt à l'emploi** utilisable
si vous perdez un jour votre fichier de mot de passe maître. Il vous
faut toujours la phrase de passe pour le déchiffrer, mais c'est vous
qui l'avez choisie et qui l'avez sauvegardée à un endroit que vous
contrôlez.

### 7. Testez votre chemin de récupération une fois

À un moment calme des six premiers mois, faites un essai "est-ce que
ça fonctionne vraiment" :

- Choisissez un répertoire jetable sur votre portable.
- Déchiffrez un des exports proactifs de l'étape 5 -- choisissez la
  commande qui correspond à votre système :

    - **Linux** (Ubuntu / Debian / Fedora -- `gpg` est préinstallé, ou
      `sudo apt install gnupg`) :

        ```
        gpg --pinentry-mode loopback -o vault-test.yml -d secrets-*.yml.gpg
        ```

    - **macOS** (Homebrew : `brew install gnupg`, puis) :

        ```
        gpg --pinentry-mode loopback -o vault-test.yml -d secrets-*.yml.gpg
        ```

    - **Windows** -- installez [Gpg4win](https://www.gpg4win.org/)
      (l'interface Kleopatra est la voie la plus simple). Ouvrez
      Kleopatra, glissez-déposez le fichier `.gpg` dans la fenêtre,
      tapez la phrase de passe que vous avez choisie, Kleopatra écrit
      le `vault-test.yml` déchiffré à côté. Les utilisateurs avancés
      peuvent aussi lancer `gpg.exe` depuis PowerShell avec la même
      ligne de commande que macOS / Linux ci-dessus.

- Vérifiez que le contenu du fichier ressemble à un vrai fichier de
  secrets (vous verrez des entrées comme
  `vault_catena_postgres_password: "..."`).
- Supprimez `vault-test.yml` quand vous avez terminé.

Si quelque chose ne fonctionne pas -- mauvaise phrase de passe,
fichier corrompu, etc. -- vous voulez le découvrir maintenant, pas
pendant un incident. Cela vaut 15 minutes de temps tranquille.

## Récapitulatif -- à quoi ressemble "terminé"

Quand la prévention est en place, le vous d'ici trois mois peut
répondre "oui" à tout cela :

- [ ] Mon mot de passe du dépôt restic est dans mon gestionnaire de
      mots de passe, clairement étiqueté.
- [ ] Ma clé d'accès S3 + clé secrète sont dans mon gestionnaire de
      mots de passe, comme entrée séparée du mot de passe restic.
- [ ] L'URL/point d'accès et le nom de mon compartiment de
      sauvegarde sont dans mon gestionnaire de mots de passe, avec
      les identifiants.
- [ ] J'ai une copie de ma clé SSH privée ailleurs que sur mon
      portable actuel.
- [ ] (Si mon opérateur m'a remis un mot de passe de coffre, il est
      dans mon gestionnaire de mots de passe -- entrée séparée. Sinon,
      je m'appuie sur le bouton **Exporter les clés de
      récupération**, ce qui est correct.)
- [ ] Je sais dans quelle ville vit mon compartiment de sauvegarde
      (et ce n'est pas la même ville que mon VPS).
- [ ] Mon infrastructure a un miroir WORM hebdomadaire configuré
      (fournisseur différent du compartiment de sauvegarde actif,
      dernier run hebdomadaire a pingé vert) -- confirmé avec mon
      opérateur.
- [ ] J'ai décidé si j'ai besoin d'un second emplacement de
      sauvegarde -- si oui, mon opérateur l'a configuré.
- [ ] J'ai cliqué sur le bouton "Exporter les clés de récupération"
      au moins une fois et la sortie déchiffrée a l'air cohérente.

Si l'un de ces points est "non", travaillez-y cette semaine. La
page [Reprise après sinistre](/fr/disaster-recovery/) explique ce qu'il
faut faire une fois que la prévention a porté ses fruits.
