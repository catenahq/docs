---
title: "Abonnement"
description: "Enregistrer la clé d'abonnement Polar, le sens de chaque état, le transfert d'une clé entre serveurs, et ce qui se verrouille ou continue de fonctionner à la fin d'un abonnement."
---

Catena Communauté est gratuit et n'exige aucune clé. Catena Pro et Catena Business débloquent des fonctions supplémentaires du panneau d'administration grâce à une clé d'abonnement vendue par Polar. La clé s'enregistre dans **Paramètres** > **Abonnement**. Les éditions sont comparées sur [catena.run](https://catena.run/fr/#pricing).

## Prérequis

- Une clé d'abonnement de Polar.
- Le serveur doit pouvoir joindre Polar en HTTPS.

## Enregistrer la clé

1. Ouvrir **Paramètres** et aller à **Abonnement**.
2. Coller la clé dans **Clé d'abonnement** et appuyer sur **Enregistrer**.

La clé est stockée sur le serveur et n'est jamais réaffichée. La section montre alors :

| Ligne | Contenu |
|---|---|
| **Clé enregistrée** | Une courte empreinte de la clé et le nom du titulaire de la licence. |
| **Édition** | Catena Communauté, Catena Pro ou Catena Business. |
| **État** | L'une des phrases ci-dessous. |
| **Activation sans réponse** | Affichée seulement quand une activation envoyée à Polar est restée sans réponse : Polar peut détenir pour ce serveur une activation dont le serveur n'a jamais eu connaissance (voir [Dépannage](#dépannage)). |
| **Dernière erreur** | La raison, quand la dernière vérification n'a obtenu aucune réponse de Polar ou que les fichiers du serveur n'ont pu être lus. |

Un champ vide conserve la clé enregistrée. Une clé nouvelle ou renouvelée prend effet dès son enregistrement, sans attendre la vérification horaire. L'enregistrement interroge Polar aussitôt (la requête cesse d'attendre après 60 secondes) et donne l'un de quatre résultats :

- "Enregistrée. Polar a confirmé la clé sur ce serveur."
- "Enregistrée. Polar était injoignable pour vérifier la clé ; le serveur réessaie toutes les heures."
- "Enregistrée. La clé ne débloque aucune fonction payante sur ce serveur ; la raison figure ci-dessous."
- "Enregistrée. La vérification auprès de Polar n'a pas abouti ; le serveur réessaie toutes les heures."

La section renvoie aussi à **Gérer l'abonnement dans le portail client de Polar**, où se gèrent la clé elle-même et les activations par serveur.

## Une clé, un serveur

Une clé n'est active que sur un serveur à la fois. L'activation est liée à l'identité matérielle de la machine (son UUID matériel, ou l'identifiant de machine à défaut). Un clone du serveur, ou une restauration sur un autre matériel, compte comme un autre serveur et est refusé tant que la place de la clé est prise.

Pour déplacer une clé vers un autre serveur :

1. Libérer la place tenue par l'ancien serveur dans le portail client.
2. Enregistrer la clé sur le nouveau serveur, dans **Paramètres** > **Abonnement**.

L'ancien serveur l'apprend à sa prochaine vérification horaire : son état devient la phrase "Polar n'accorde pas cette clé" ci-dessous et ses fonctions payantes se verrouillent. Un déplacement fait avec [Restauration et migration](/fr/configuration/restore-and-migrate/) libère automatiquement l'ancienne place et active la clé sur le nouveau serveur.

## La vérification horaire et le délai de grâce

Chaque serveur interroge Polar au sujet de sa clé une fois par heure, à un décalage fixe qui lui est propre dans l'heure. Un serveur sans clé enregistrée ne demande rien. Entre deux vérifications, les fonctions suivent la dernière réponse, sans réseau.

- Quand Polar refuse la clé, les fonctions payantes se verrouillent aussitôt.
- Quand Polar est injoignable (panne réseau, erreur côté Polar ou limite de débit), les fonctions payantes restent activées pendant 48 heures après la dernière confirmation. Passé ce délai, elles se verrouillent jusqu'à ce que Polar réponde de nouveau.

## Phrases d'état

La ligne **État** affiche l'une de ces phrases. Le texte entre accolades est remplacé par une date.

| Situation | Phrase | Que faire |
|---|---|---|
| Aucune clé | "Aucune clé d'abonnement n'est enregistrée. Les fonctions payantes sont désactivées." | Enregistrer une clé si les fonctions payantes sont voulues. |
| En attente | "La clé est enregistrée et Polar n'a pas encore répondu à son sujet pour ce serveur. Les fonctions payantes restent désactivées jusqu'à sa réponse ; le serveur la demande toutes les heures, et l'enregistrement de la clé la demande aussitôt." | Attendre la prochaine vérification, ou enregistrer de nouveau la clé pour la demander aussitôt. |
| Active | "Active. Polar a confirmé la clé sur ce serveur pour la dernière fois le {date}." | Rien. |
| Délai de grâce | "Active pendant le délai de grâce : Polar est injoignable depuis le {date}. Les fonctions payantes restent activées jusqu'au {date}, et le serveur continue de vérifier toutes les heures." | Vérifier le réseau sortant et le DNS du serveur. |
| Non accordée | "Polar n'accorde pas cette clé sur ce serveur : l'abonnement a été annulé ou n'a pas été renouvelé, la clé a été révoquée ou remplacée, ou l'activation de ce serveur a été libérée dans le portail client. Les fonctions payantes sont désactivées. Une fois l'abonnement actif, l'enregistrement de la clé l'active de nouveau ici." | Renouveler l'abonnement, ou enregistrer de nouveau la clé une fois l'abonnement actif. |
| Refusée | "Polar a refusé d'activer cette clé sur ce serveur : elle est active sur un autre serveur (une clé n'est active que sur un serveur à la fois), ou elle est révoquée, désactivée ou expirée. Libérer l'autre activation dans le portail client de Polar, puis enregistrer de nouveau la clé ici, l'active sur ce serveur." | Libérer l'autre activation dans le portail, puis enregistrer de nouveau la clé. |
| Aucune édition connue | "Polar accorde cette clé, mais elle n'appartient à aucune édition de Catena connue de ce panneau. Les fonctions payantes sont désactivées." | Vérifier dans le portail pour quel produit la clé a été émise. |
| Injoignable | "Polar est injoignable depuis le {date}, au-delà du délai de grâce de 48 heures. Les fonctions payantes sont désactivées jusqu'à ce que Polar réponde de nouveau ; le serveur continue de vérifier toutes les heures." | Rétablir l'accès sortant vers Polar; les fonctions reviennent à la première vérification réussie. |
| Horloge en retard | "L'horloge de ce serveur est en retard sur la date de sa dernière vérification de licence. Les fonctions payantes sont désactivées jusqu'à ce que l'heure soit de nouveau juste ; l'enregistrement de la clé les déverrouille alors aussitôt." | Corriger l'horloge du serveur, puis enregistrer la clé. |

## Ce qui se verrouille à la fin d'un abonnement, et ce qui ne se verrouille jamais

Quand Polar cesse d'accorder la clé, ou que le délai de grâce est écoulé :

- Les panneaux payants deviennent des entrées grisées sous **Catena Pro** ou **Catena Business**. Chacune ouvre une explication de la fonction, de l'édition qui la comprend et un bouton **S'abonner**.
- Tous les horaires sont désactivés, puisque l'activation d'un horaire exige une édition payante. Les choix enregistrés sont conservés et reviennent avec l'abonnement.
- Les actions payantes sont refusées, et les domaines supplémentaires au-delà du domaine principal cessent d'être servis (ils restent enregistrés).
- Une bannière sur chaque page d'administration mène à la section **Abonnement** et en donne la raison, une entrée s'ajoute au **Journal**, et un courriel part vers l'adresse de l'administrateur par le service de courriel configuré (en anglais puis en français). Sans service de courriel, la bannière et l'entrée du journal sont les seuls avis. Voir [Courriel sortant](/fr/configuration/email/).

Ce qui ne se verrouille jamais : les applications et leurs données, les sauvegardes manuelles, les restaurations du serveur entier, les mises à jour lancées à la main, l'authentification unique et la supervision. Une clé absente, refusée ou non confirmée laisse le serveur sur Catena Communauté et n'empêche jamais une installation ni l'accès aux données.

## Dépannage

- L'état reste "En attente" : vérifier que le serveur joint Polar en HTTPS, puis enregistrer de nouveau la clé pour la demander aussitôt.
- "Refusée" juste après une reconstruction ou une restauration : la nouvelle machine est un autre serveur aux yeux de Polar. Libérer d'abord l'ancienne activation dans le portail client.
- Un panneau reste grisé après l'enregistrement : l'édition enregistrée ne le comprend pas. La ligne **Édition** indique ce que la clé accorde.
- Une ligne **Activation sans réponse** s'affiche : une activation a atteint Polar mais sa réponse s'est perdue, de sorte que Polar peut tenir la place de ce serveur pour prise sans que le serveur le sache. Libérer l'activation de ce serveur, nommée d'après son domaine, dans le portail client de Polar, puis enregistrer de nouveau la clé.
