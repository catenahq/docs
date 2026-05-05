---
title: "Où sont mes données ?"
description: "Réponse en langage clair à la question « si le VPS part en fumée,"
---

Réponse en langage clair à la question « si le VPS part en fumée,
qu'est-ce qui est perdu et qu'est-ce qui est récupérable ? » Lisez
ceci une fois à la remise pour avoir une carte mentale avant que
quoi que ce soit ne tourne mal ; les pages
[Prévention des sinistres](/disaster-prevention/) et
[Reprise après sinistre](/disaster-recovery/) supposent que vous
savez où se trouvent les choses.

## Version courte

Vos données vivent dans **au moins deux endroits**, et possiblement
trois :

1. **Sur le VPS lui-même** — bases de données en cours d'exécution,
   configuration des applications, fichiers téléversés pour la
   plupart des applications.
2. **Dans votre compartiment de sauvegarde restic** — instantané
   nocturne chiffré du VPS, dans une autre ville (et idéalement un
   autre pays) que le VPS.
3. **Dans votre compartiment Nextcloud-S3** *(seulement si vous
   utilisez Nextcloud avec stockage S3)* — les fichiers réels que
   les utilisateurs Nextcloud téléversent, dans leur propre
   compartiment, séparé du restic.

Tout ce qui n'est stocké que sur le VPS est à risque ; le VPS peut
tomber ou être détruit. Tout ce qui est dans restic + sur le VPS est
à l'abri d'un seul incident. Tout ce qui est dans restic *ou*
Nextcloud-S3 spécifiquement peut aussi tomber — mais ces pannes sont
indépendantes et couvertes par
[Prévention des sinistres](/disaster-prevention/).

## Sur le VPS

Les données du quotidien qui font fonctionner vos applications :

- **Bases Postgres** — les enregistrements de chaque application
  (utilisateurs Nextcloud, pages Outline, rendez-vous Cal.com, etc.)
  vivent dans une base Postgres à l'intérieur d'un volume Docker
  sur le VPS.
- **Configuration des applications** — ce qui est configuré, qui a
  accès, l'image de marque personnalisée. Vit dans des volumes
  Docker propres à chaque application.
- **Fichiers téléversés** — pour les applications qui stockent les
  fichiers localement (pièces jointes Outline, téléversements
  Rocket.Chat, données de workflow n8n). Vit dans des volumes
  Docker.
- **Dumps Postgres nocturnes** — une copie SQL en clair de chaque
  base, déposée sur le VPS juste avant l'exécution de chaque
  sauvegarde. Filet de sécurité si le volume brut de la base est
  corrompu entre deux sauvegardes.

## Dans votre compartiment de sauvegarde restic

Chaque nuit, tout ce qui se trouve dans la section précédente (plus
les fichiers système du VPS comme les clés d'hôte SSH et la
configuration du pare-feu) est chiffré et téléversé vers **votre**
compartiment S3 — pas celui de l'opérateur. Vous possédez le
compartiment, vous payez la facture, vous contrôlez la rétention.

Rétention par défaut : 7 quotidiennes, 4 hebdomadaires, 6 mensuelles.
Tout ce qui est plus ancien expire automatiquement.

Le compartiment est chiffré de bout en bout avec le **mot de passe
restic** que votre opérateur vous a remis à la remise (voir
[Prévention des sinistres](/disaster-prevention/)). Sans ce mot de
passe, le compartiment est du texte chiffré illisible — même pour
l'opérateur. Avec lui, vous pouvez restaurer chez n'importe quel
nuage, n'importe quand.

## Dans votre compartiment Nextcloud-S3 (si applicable)

Si votre opérateur a déployé Nextcloud avec stockage primaire S3
(la formule « gros fichiers », normalement utilisée quand vous
allez stocker plus de ~20 Go), le **contenu réel des fichiers que
vos utilisateurs téléversent dans Nextcloud ne vit pas dans
restic**. Il vit dans un compartiment S3 séparé qui vous appartient
aussi.

Pourquoi cela compte :

- L'instantané restic reste petit même si votre Nextcloud héberge
  des téraoctets — restic ne porte que le code de Nextcloud + sa
  base de données, pas les octets des fichiers.
- Vous accédez à ces fichiers via l'interface Nextcloud
  normalement, et via n'importe quel outil compatible S3
  (`rclone`, `aws s3 sync`) directement si vous en avez besoin.
- Le compartiment survit indépendamment du VPS. Si le VPS part en
  fumée, les fichiers sont toujours dans le compartiment. Quand un
  nouveau VPS démarre et se reconnecte au même compartiment, chaque
  fichier est là.
- Le compartiment tombe aussi indépendamment du VPS. Pannes de
  fournisseur, suppression de compartiment, fuite d'identifiants
  affectent le compartiment Nextcloud-S3 *sans* affecter le VPS ni
  le compartiment restic. Voir la section sur les risques
  Nextcloud-S3 ci-dessous.

Si vous **n'utilisez pas** Nextcloud avec S3 (par exemple : petit
Nextcloud avec stockage local par défaut, ou pas de Nextcloud du
tout), cette section ne s'applique pas — vos fichiers Nextcloud, si
vous en avez, vivent sur le VPS et profitent de la sauvegarde
restic comme tout le reste.

### Scénarios spécifiques de perte de données Nextcloud-S3

Une panne indépendante = une inquiétude indépendante. Chaque ligne
ci-dessous est un « et si » distinct, plus la mitigation déjà en
place.

| Ce qui arrive | Ce qui est perdu | Ce qui est déjà en place | Ce que vous pouvez faire |
|---|---|---|---|
| Votre compartiment Nextcloud-S3 a une panne fournisseur de plusieurs jours | Lecture/écriture de fichiers (le VPS va bien ; seules les ouvertures/téléversements échouent) | L'opérateur peut vérifier que le problème est au niveau du compartiment via son monitoring | Patientez — les fichiers reviendront quand le fournisseur se rétablira ; prévenez votre équipe que les téléversements sont en pause |
| Identifiants du compartiment fuités, un attaquant écrit/supprime des objets | Une partie ou l'ensemble des fichiers du compartiment | Versionnage des objets + règle de rétention de 30 jours sur le compartiment : les objets supprimés sont récupérables pendant 30 jours | Contactez votre opérateur immédiatement ; il fait tourner les identifiants et restaure les objets affectés |
| Vous supprimez par accident le compartiment depuis la console du fournisseur | Tout ce qui est dans le compartiment une fois la période de grâce du fournisseur écoulée | La plupart des fournisseurs ont une période de grâce au niveau du compte de 7 à 90 jours | Contactez le support du fournisseur immédiatement pour récupérer le compartiment dans la fenêtre de grâce ; contactez votre opérateur |
| La base Nextcloud (sur le VPS) est restaurée depuis la sauvegarde d'hier mais le compartiment a les écritures d'aujourd'hui | Les nouveaux fichiers ajoutés aujourd'hui apparaissent comme orphelins dans le compartiment | `occ files:scan` de Nextcloud reconstruit la correspondance base→fichier à partir de ce qui est dans le compartiment | Demandez à votre opérateur de lancer un scan des fichiers après la restauration ; il s'occupe de la partie technique |
| Le fournisseur résilie votre compte | Tout ce qui est dans ce compartiment | Seul un second compartiment de sauvegarde chez un autre fournisseur vous protège ici | Si vous avez configuré un second compartiment (voir [Ajouter un second compartiment de sauvegarde](/how-to-add-second-backup-bucket/)), vous êtes couvert. Sinon — c'est le pire cas |

À retenir : le compartiment Nextcloud-S3 est indépendant du VPS, ce
qui est bon (la mort du VPS ne l'emporte pas avec lui) et risqué
(le compartiment peut tomber sans que le VPS ne le remarque). Les
mitigations ci-dessus couvrent les cas courants ; les cas
catastrophiques (suppression du compartiment, résiliation de
compte) sont exactement ce contre quoi le **second compartiment de
sauvegarde** dans [Prévention des sinistres](/disaster-prevention/)
sert.

## Hébergé à l'extérieur (pas sur votre VPS, pas dans vos compartiments)

Quelques petites choses vivent dans les consoles d'administration
de tiers plutôt que sur votre VPS :

- **Enregistrements DNS** — chez Cloudflare, dans votre compte DNS.
- **Configuration du tunnel Cloudflare** — chez Cloudflare, dans
  votre compte CF.
- **Tenant Tailscale + règles ACL** — chez Tailscale, dans le
  compte Tailscale de votre opérateur (l'opérateur le possède pour
  la porte dérobée d'administration permanente — voir
  [Comment fonctionne cette pile](/how-this-stack-works/)).
- **Compte du fournisseur SMTP** — chez votre fournisseur d'e-mails
  transactionnels (Resend / Brevo / etc.) — contrôle qui peut
  envoyer du courrier « depuis » votre domaine.

Ces éléments sont recréés facilement si l'un d'eux tombe — vous
vous connectez à la console du tiers et vous cliquez. La page
[Reprise après sinistre](/disaster-recovery/) liste la voie de
récupération pour chacun.

## Non sauvegardé (intentionnellement)

Ce qui n'est intentionnellement PAS dans l'instantané restic :

- `/var/log/` — éphémère, les journaux applicatifs sont rotationnés ;
  pas la peine d'occuper le stockage.
- Couches d'images de conteneurs — re-tirables depuis le registre
  amont, pas besoin de les accumuler.
- Répertoires temporaires (`/tmp`, `/var/tmp`) — éphémères par
  définition.

Si vous vous demandez « est-ce que ça a fini dans la sauvegarde ? »,
la règle générale est : **l'état dont vos applications ont besoin
pour revenir exactement comme avant**, oui ; **l'état regénéré
automatiquement au premier démarrage**, non.

## Ce qui est perdu si le VPS part en fumée

Pire scénario : destruction physique du VPS, sans avertissement.

- **L'état du VPS depuis la dernière sauvegarde** — tout ce qui a
  été créé ou modifié entre le dernier instantané de sauvegarde et
  le moment de la destruction. Selon votre calendrier de
  sauvegarde, c'est 1 à 24 heures. Les applications restées
  inactives pendant cette fenêtre ne perdent rien ; les
  applications recevant beaucoup d'écritures (un Rocket.Chat
  occupé, de l'édition en temps réel dans Outline) perdent les
  modifications les plus récentes.
- **Tout ce qui est dans `/tmp` ou en mémoire des conteneurs** —
  ce n'est pas une vraie perte ; rien d'important ne devrait
  vivre là.
- **Rien d'autre.** Restic + (facultatif) Nextcloud-S3 +
  Cloudflare + Tailscale portent le reste.

La page [Restaurer sur un nouveau VPS](/self-restore/) couvre à
quoi « revenir » ressemble en pratique.
