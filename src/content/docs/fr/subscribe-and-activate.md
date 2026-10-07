---
title: "S'abonner et activer"
description: "Ce que Catena Pro et Catena Business débloquent, où se trouve la clé d'abonnement, comment l'enregistrer dans le panneau d'administration, ce que signifie chaque état et ce qui se passe quand un abonnement prend fin."
---

Catena Community est gratuit et fait tourner toutes les applications
avec toutes leurs données. Catena Pro et Catena Business ajoutent des
fonctions au panneau d'administration. Un abonnement vient avec une clé
d'abonnement, qui s'enregistre dans la page **Paramètres** du panneau
d'administration et se vérifie auprès de Polar, le service qui vend les
abonnements.

## Ce que débloque chaque édition

Catena Business comprend tout ce que comprend Catena Pro.

| Fonction du panneau d'administration | Ce qu'elle fait | Édition |
|---|---|---|
| **Mises à jour gérées** | L'entretien nocturne : sauvegarder le serveur, vérifier la sauvegarde, la copier hors site, puis faire passer les composants et les applications à des versions plus récentes, en remettant la précédente si la nouvelle rend le serveur moins sain qu'il ne l'était. Une exécution peut aussi être lancée sur demande. | Catena Pro |
| **Domaines** | Rattache d'autres domaines Cloudflare au serveur, chacun avec sa propre connexion distincte, pour qu'un même serveur desserve plusieurs organisations ou marques. | Catena Pro |
| **Personnes** | Créer, renommer et supprimer les groupes qui décident des applications accessibles, y ajouter des personnes et désactiver des comptes. Le panneau indique qui perdrait l'accès avant qu'un groupe change. | Catena Pro |
| **Migration** | Déplace les applications et les données du serveur vers un autre serveur Catena, ou celles d'un autre serveur vers celui-ci. Voir [Déplacer vers un autre serveur](/fr/move-server/). | Catena Pro |
| **Rapport de restauration** | La preuve que les sauvegardes se restaurent : un test de restauration quotidien dans une zone temporaire, la vérification de la copie hors site, le temps de récupération, et un test de restauration sur demande. | Catena Pro |
| **Journal d'audit** | Chaque action administrative effectuée sur le serveur, conservée dans une chaîne où toute modification ultérieure se voit, exportable dans un fichier. | Catena Business |
| **Rapport de conformité** | Un rapport prêt à imprimer sur l'emplacement des données, les sous-traitants, le dernier test de restauration et les ports exposés, avec une liste de vérification de préparation à la Loi 25. | Catena Business |

L'un ou l'autre des abonnements permet aussi d'activer les horaires, et
fait exécuter la copie de chaque seau de sauvegarde vers le stockage
hors site.

## Les licences ne débloquent que des fonctions du panneau

Les applications et leurs données continuent de fonctionner sans
abonnement, et après la fin d'un abonnement. Les sauvegardes, les
restaurations et les mises à jour lancées à la main continuent aussi de
fonctionner. Une clé absente, refusée ou non confirmée laisse le serveur
sur Catena Community avec une raison indiquée ; elle n'empêche jamais
l'installation ni l'accès aux données.

## Souscrire un abonnement

La section des tarifs du site web présente les éditions :
[tarifs de Catena](https://catena.run/fr/#pricing). Une fonction payante
que l'abonnement du serveur ne comprend pas est grisée dans le menu du
panneau d'administration, sous Catena Pro ou Catena Business. Elle ouvre
une courte explication de ce que fait la fonction, de l'édition qui la
comprend, et un bouton **S'abonner** qui mène à la même section des
tarifs.

## Où se trouve la clé

La clé d'abonnement se trouve dans le portail client de Polar. La page
**Paramètres** y mène, sous **Abonnement** : **Gérer l'abonnement dans
le portail client de Polar**.

## Enregistrer la clé

Dans le panneau d'administration, **Paramètres**, section
**Abonnement**, le champ **Clé d'abonnement** reçoit la clé. Une fois
enregistrée, la clé n'est plus jamais affichée ; la section montre à sa
place une courte empreinte, avec le nom du titulaire de la licence,
l'édition et l'état. Laisser le champ vide conserve la clé enregistrée.

L'enregistrement stocke la clé sur le serveur et interroge Polar
aussitôt, ce qui prend la place du serveur si la clé n'en détient aucune
ici. Une clé nouvelle ou renouvelée prend effet dès son enregistrement,
et les fonctions qu'elle débloque apparaissent sans attendre la
vérification horaire. La section indique ensuite l'un de quatre
résultats :

- "Enregistrée. Polar a confirmé la clé sur ce serveur."
- "Enregistrée. Polar était injoignable pour vérifier la clé ; le
  serveur réessaie toutes les heures."
- "Enregistrée. La clé ne débloque aucune fonction payante sur ce
  serveur ; la raison figure ci-dessous."
- "Enregistrée. La vérification auprès de Polar n'a pas abouti ; le
  serveur réessaie toutes les heures."

## Ce que signifie chaque état

La ligne **État** de la section affiche l'une des phrases suivantes. Les
noms en gras sont des étiquettes propres à cette page, et le texte entre
crochets est remplacé par la date indiquée par le serveur.

- **Aucune clé enregistrée :** "Aucune clé d'abonnement n'est
  enregistrée. Les fonctions payantes sont désactivées."
- **En attente de Polar :** "La clé est enregistrée et Polar n'a pas
  encore répondu à son sujet pour ce serveur. Les fonctions payantes
  restent désactivées jusqu'à sa réponse ; le serveur la demande toutes
  les heures, et l'enregistrement de la clé la demande aussitôt."
- **Active :** "Active. Polar a confirmé la clé sur ce serveur pour la
  dernière fois le [date de la dernière confirmation]."
- **Active pendant le délai de grâce :** "Active pendant le délai de
  grâce : Polar est injoignable depuis le [date de la dernière
  confirmation]. Les fonctions payantes restent activées jusqu'au [fin
  du délai de grâce], et le serveur continue de vérifier toutes les
  heures."
- **Non accordée :** "Polar n'accorde pas cette clé sur ce serveur :
  l'abonnement a été annulé ou n'a pas été renouvelé, la clé a été
  révoquée ou remplacée, ou l'activation de ce serveur a été libérée
  dans le portail client. Les fonctions payantes sont désactivées. Une
  fois l'abonnement actif, l'enregistrement de la clé l'active de
  nouveau ici."
- **Refusée :** "Polar a refusé d'activer cette clé sur ce serveur :
  elle est active sur un autre serveur (une clé n'est active que sur un
  serveur à la fois), ou elle est révoquée, désactivée ou expirée.
  Libérer l'autre activation dans le portail client de Polar, puis
  enregistrer de nouveau la clé ici, l'active sur ce serveur."
- **Aucune édition connue :** "Polar accorde cette clé, mais elle
  n'appartient à aucune édition de Catena connue de ce panneau. Les
  fonctions payantes sont désactivées. Le soutien peut vérifier pour
  quel produit la clé a été émise."
- **Injoignable :** "Polar est injoignable depuis le [date de la
  dernière confirmation], au-delà du délai de grâce de 48 heures. Les
  fonctions payantes sont désactivées jusqu'à ce que Polar réponde de
  nouveau ; le serveur continue de vérifier toutes les heures."
- **Horloge en retard :** "L'horloge de ce serveur est en retard sur la
  date de sa dernière vérification de licence. Les fonctions payantes
  sont désactivées jusqu'à ce que l'heure soit de nouveau juste ;
  l'enregistrement de la clé les déverrouille alors aussitôt."

La ligne **Dernière erreur** donne la raison, dans les mots du serveur,
quand la dernière vérification n'a obtenu aucune réponse de Polar, ou
que les fichiers du serveur n'ont pu être lus.

## Une clé, un serveur

Une clé n'est active que sur un serveur à la fois. L'activation d'un
serveur est liée à son identité matérielle : un clone d'un serveur, ou
une restauration sur un autre matériel, est un autre serveur aux yeux de
Polar et est refusé tant que la place de la clé est prise.

Déplacer une clé vers un autre serveur se fait en deux étapes :

1. Libérer la place tenue par l'ancien serveur, dans le portail client
   de Polar.
2. Enregistrer la clé sur le nouveau serveur, dans **Paramètres**,
   section **Abonnement**.

L'ancien serveur l'apprend à sa prochaine vérification horaire : son
état devient Non accordée et ses fonctions payantes se verrouillent. Une
clé dont la place a été libérée n'est pas reprise d'elle-même par
l'ancien serveur.

## La vérification horaire et le délai de grâce

Chaque serveur interroge Polar au sujet de sa clé enregistrée une fois
par heure, à son propre décalage fixe dans l'heure. Un serveur sans clé
enregistrée ne demande rien. Entre deux vérifications, les fonctions
suivent la dernière réponse, sans réseau.

- Quand Polar refuse la clé, les fonctions payantes se verrouillent
  aussitôt.
- Quand Polar est injoignable (panne réseau, erreur côté Polar ou limite
  de débit), les fonctions payantes restent activées pendant 48 heures
  après la dernière confirmation. L'état est Active pendant le délai de
  grâce et indique la fin de ce délai. Après 48 heures, l'état est
  Injoignable et les fonctions se verrouillent jusqu'à ce que Polar
  réponde de nouveau.

## Ce qui se verrouille à la fin d'un abonnement

Quand un abonnement prend fin, que Polar refuse la clé, ou que le délai
de grâce est écoulé :

- Les panneaux payants deviennent les explications grisées décrites
  plus haut.
- Une bannière sur chaque page d'administration mène à la section
  **Abonnement**, qui donne la raison.
- Les actions payantes sont refusées, et les tâches planifiées payantes
  (mises à jour gérées, copie hors site, migration) sont sautées. "Les
  horaires s'activent avec une licence Catena. D'ici là, chaque tâche
  ci-dessous peut encore être lancée à la main depuis la page
  Actions."
- Les applications, leurs données, ainsi que les sauvegardes, les
  restaurations et les mises à jour lancées à la main continuent de
  fonctionner.

Le serveur déverrouille les fonctions à la première vérification où
Polar accorde de nouveau la clé, ou aussitôt quand la clé est
enregistrée de nouveau.

## Le courriel de verrouillage

La première fois qu'une vérification verrouille un serveur qui avait une
édition payante, l'administrateur reçoit un seul courriel, en anglais
puis en français dans le même message. Il nomme le domaine du serveur et
indique :

- que les fonctions d'administration payantes sont verrouillées ;
- pourquoi : l'abonnement a été annulé ou n'a pas été renouvelé, la clé
  a été révoquée ou remplacée, ou l'activation a été libérée dans le
  portail client ; ou Polar a refusé d'activer la clé sur ce serveur ;
  ou Polar est injoignable depuis une date donnée et le délai de grâce
  de 48 heures est écoulé ;
- que seules les fonctions d'administration sont verrouillées, et que
  les applications, leurs données, les sauvegardes, les restaurations et
  les mises à jour manuelles continuent de fonctionner ;
- le lien vers le portail client de Polar ;
- que le serveur vérifie la clé toutes les heures et déverrouille les
  fonctions dès que Polar l'accorde de nouveau, et qu'une clé dont
  l'activation a été libérée s'active de nouveau en l'enregistrant dans
  **Paramètres**.

Le courriel part vers le courriel d'administrateur défini à
l'installation, par le relais de courriel configuré dans **Paramètres**.
La vérification suivante trouve le serveur déjà verrouillé et n'envoie
plus rien. Le verrouillage est aussi consigné dans le **Journal** du
panneau d'administration, dans la langue de la page. Sans relais de
courriel configuré, l'entrée du journal et la bannière sont les seuls
avis.
