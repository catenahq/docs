---
title: "Où vivent les données"
description: "Réponse en langage clair à la question \"si le VPS part en fumée,\""
---

Réponse en langage clair à la question "si le VPS part en fumée,
qu'est-ce qui est perdu et qu'est-ce qui est récupérable ?" Une
lecture à la remise suffit pour avoir la carte mentale avant que quoi
que ce soit ne tourne mal ; les pages
[Tâches récurrentes](/fr/disaster-prevention/) et
[Se remettre d'une panne](/fr/disaster-recovery/) supposent cette
carte.

## Version courte

Les données vivent dans **au moins deux endroits**, et possiblement
trois :

1. **Sur le VPS lui-même** -- bases de données en cours d'exécution,
   configuration des applications, fichiers téléversés pour la
   plupart des applications.
2. **Dans le compartiment de sauvegarde restic** -- un instantané
   chiffré hors-site du VPS, écrit à chaque sauvegarde, dans une autre
   ville (et idéalement un autre pays) que le VPS.
3. **Dans le compartiment Nextcloud-S3** *(seulement là où Nextcloud
   tourne avec stockage S3)* -- les fichiers réels que les
   utilisateurs Nextcloud téléversent, dans leur propre compartiment,
   séparé du restic.

Tout ce qui n'est stocké que sur le VPS est à risque ; le VPS peut
tomber ou être détruit. Tout ce qui est dans restic + sur le VPS est
à l'abri d'un seul incident. Tout ce qui est dans restic *ou*
Nextcloud-S3 spécifiquement peut aussi tomber -- mais ces pannes sont
indépendantes et couvertes par
[Tâches récurrentes](/fr/disaster-prevention/).

## Sur le VPS

Les données du quotidien qui font fonctionner les applications :

- **Bases Postgres** -- les enregistrements de chaque application
  (utilisateurs Nextcloud, pages Outline, rendez-vous Easy!Appointments,
  et le reste) vivent dans une base Postgres à l'intérieur d'un volume
  Docker sur le VPS.
- **Configuration des applications** -- ce qui est configuré, qui a
  accès, l'image de marque personnalisée. Vit dans des volumes
  Docker propres à chaque application.
- **Fichiers téléversés** -- pour les applications qui stockent les
  fichiers localement (pièces jointes Outline, téléversements
  Rocket.Chat, données de workflow n8n). Vit dans des volumes
  Docker.
- **Dumps Postgres** -- une copie SQL en clair de chaque base, déposée
  sur le VPS juste avant l'exécution de chaque sauvegarde. Filet de sécurité si le volume brut de la base est
  corrompu entre deux sauvegardes.

## Dans le compartiment de sauvegarde restic

À chaque sauvegarde, tout ce qui se trouve dans la section précédente
(plus les fichiers système du VPS comme les clés d'hôte SSH et la
configuration du pare-feu) est chiffré et téléversé vers un
compartiment S3 **appartenant au client** -- pas au nôtre. Le
compartiment, la facture et la politique de rétention lui
appartiennent.

Rétention par défaut : 7 quotidiennes, 4 hebdomadaires, 6 mensuelles.
Tout ce qui est plus ancien expire automatiquement.

Le compartiment est chiffré de bout en bout avec le **mot de passe de
chiffrement de la sauvegarde** -- l'un des trois éléments du jeu de
clés de récupération (voir
[Tâches récurrentes](/fr/disaster-prevention/)). Sans ce mot de
passe, le compartiment est du texte chiffré illisible -- même pour
nous. Avec lui, le serveur peut être reconstruit sur n'importe quel
nuage, n'importe quand.

## Dans le compartiment Nextcloud-S3 (si applicable)

Là où Nextcloud a été déployé avec stockage primaire S3 (la formule
"gros fichiers", normalement utilisée au-delà de ~20 Go), le **contenu
réel des fichiers que les utilisateurs téléversent dans Nextcloud ne
vit pas dans restic**. Il vit dans un compartiment S3 séparé qui
appartient aussi au client.

Pourquoi cela compte :

- L'instantané restic reste petit même quand Nextcloud héberge
  des téraoctets -- restic ne porte que le code de Nextcloud + sa
  base de données, pas les octets des fichiers.
- Ces fichiers restent accessibles via l'interface Nextcloud
  normalement, et via n'importe quel outil compatible S3
  (`rclone`, `aws s3 sync`) directement au besoin.
- Le compartiment survit indépendamment du VPS. Si le VPS part en
  fumée, les fichiers sont toujours dans le compartiment. Quand un
  nouveau VPS démarre et se reconnecte au même compartiment, chaque
  fichier est là.
- Le compartiment tombe aussi indépendamment du VPS. Pannes de
  fournisseur, suppression de compartiment, fuite d'identifiants
  affectent le compartiment Nextcloud-S3 *sans* affecter le VPS ni
  le compartiment restic. Voir la section sur les risques
  Nextcloud-S3 ci-dessous.

Sans Nextcloud-sur-S3 (par exemple : petit Nextcloud avec stockage
local par défaut, ou pas de Nextcloud du tout), cette section ne
s'applique pas -- les fichiers Nextcloud, s'il y en a, vivent sur le
VPS et profitent de la sauvegarde restic comme tout le reste.

### Scénarios spécifiques de perte de données Nextcloud-S3

Une panne indépendante = une inquiétude indépendante. Chaque ligne
ci-dessous est un "et si" distinct, plus la mitigation déjà en
place.

| Ce qui arrive | Ce qui est perdu | Ce qui est déjà en place | La réponse |
|---|---|---|---|
| Le compartiment Nextcloud-S3 a une panne fournisseur de plusieurs jours | Lecture/écriture de fichiers (le serveur va bien ; seules les ouvertures/téléversements échouent) | Les sondes Gatus signalent la panne comme étant au niveau du compartiment, pas du serveur | Patienter -- les fichiers reviennent quand le fournisseur se rétablit ; l'équipe est prévenue que les téléversements sont en pause |
| Identifiants du compartiment fuités, un attaquant écrit/supprime des objets | Une partie ou l'ensemble des fichiers du compartiment | Versionnage des objets + règle de rétention de 30 jours sur le compartiment : les objets supprimés sont récupérables pendant 30 jours | Faire tourner les clés du compartiment dans la console du fournisseur, les mettre à jour dans catena-admin Settings, puis restaurer les objets affectés à une version antérieure à l'attaque |
| Le compartiment est supprimé par accident depuis la console du fournisseur | Tout ce qui est dans le compartiment une fois la période de grâce du fournisseur écoulée | La plupart des fournisseurs ont une période de grâce au niveau du compte de 7 à 90 jours | Contacter le support du fournisseur immédiatement pour récupérer le compartiment dans la fenêtre de grâce |
| La base Nextcloud (sur le serveur) est restaurée depuis la sauvegarde d'hier mais le compartiment a les écritures d'aujourd'hui | Les nouveaux fichiers ajoutés aujourd'hui apparaissent comme orphelins dans le compartiment | `occ files:scan` de Nextcloud reconstruit la correspondance base->fichier à partir de ce qui est dans le compartiment | Lancer `occ files:scan` depuis un shell sur la machine (connexion SSH via Tailscale) pour relier les orphelins |
| Le fournisseur résilie le compte | Tout ce qui est dans ce compartiment | Seul un second compartiment de sauvegarde chez un autre fournisseur protège contre cela | Avec un [second compartiment de sauvegarde](/fr/disaster-prevention/#5-optionnel--ajouter-un-second-compartiment-de-sauvegarde-appartenant-au-client) en place, les données sont couvertes. Sans lui, c'est le pire cas |

À retenir : le compartiment Nextcloud-S3 est indépendant du VPS, ce
qui est bon (la mort du VPS ne l'emporte pas avec lui) et risqué
(le compartiment peut tomber sans que le VPS ne le remarque). Les
mitigations ci-dessus couvrent les cas courants ; les cas
catastrophiques (suppression du compartiment, résiliation de
compte) sont exactement ce contre quoi le **second compartiment de
sauvegarde** dans [Tâches récurrentes](/fr/disaster-prevention/)
sert.

## Hébergé à l'extérieur (pas sur le VPS, pas dans les compartiments)

Quelques petites choses vivent dans les consoles d'administration
de tiers plutôt que sur le VPS :

- **Enregistrements DNS** -- chez Cloudflare, dans le compte DNS du
  client.
- **Configuration du tunnel Cloudflare** -- chez Cloudflare, dans le
  même compte.
- **Tenant Tailscale + règles ACL** -- chez Tailscale, dans un compte
  appartenant au client -- la voie d'administration permanente vers la
  machine, voir
  [Comment fonctionne cette suite logicielle](/fr/how-this-stack-works/).
- **Compte du fournisseur SMTP** -- chez le fournisseur d'e-mails
  transactionnels (Resend / Brevo / et les autres) -- contrôle qui
  peut envoyer du courrier "depuis" le domaine.

Ces éléments sont recréés facilement si l'un d'eux tombe -- une
connexion à la console du tiers et quelques clics. La page
[Se remettre d'une panne](/fr/disaster-recovery/) liste la voie de
récupération pour chacun.

## Non sauvegardé (intentionnellement)

Ce qui n'est intentionnellement PAS dans l'instantané restic :

- `/var/log/` -- éphémère, les journaux applicatifs sont rotationnés ;
  pas la peine d'occuper le stockage.
- Couches d'images de conteneurs -- re-tirables depuis le registre
  amont, pas besoin de les accumuler.
- Répertoires temporaires (`/tmp`, `/var/tmp`) -- éphémères par
  définition.

La règle générale pour "est-ce que ça a fini dans la sauvegarde ?"
est : **l'état dont les applications ont besoin pour revenir
exactement comme avant**, oui ; **l'état regénéré automatiquement au
premier démarrage**, non.

## Ce qui est perdu si le VPS part en fumée

Pire scénario : destruction physique du VPS, sans avertissement.

- **L'état du VPS depuis la dernière sauvegarde** -- tout ce qui a
  été créé ou modifié entre le dernier instantané de sauvegarde et
  le moment de la destruction. Selon le calendrier de sauvegarde,
  c'est 1 à 24 heures. Les applications restées inactives pendant
  cette fenêtre ne perdent rien ; les applications recevant beaucoup
  d'écritures (un Rocket.Chat occupé, de l'édition en temps réel dans
  Outline) perdent les modifications les plus récentes.
- **Tout ce qui est dans `/tmp` ou en mémoire des conteneurs** --
  ce n'est pas une vraie perte ; rien d'important ne vit là.
- **Rien d'autre.** Restic + (facultatif) Nextcloud-S3 +
  Cloudflare + Tailscale portent le reste.

La page [Reconstruire un serveur à partir de la sauvegarde](/fr/self-restore/)
couvre à quoi "revenir" ressemble en pratique.

Faire fonctionner tout cela sans Catena - ou partir complètement -
est couvert par [Quitter Catena](/fr/leaving/) : chaque élément
ci-dessus reste utilisable avec les outils standards seuls.
