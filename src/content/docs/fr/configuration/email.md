---
title: "Courriel sortant"
description: "Choisir le service de courriel par lequel le serveur expédie, les champs de chaque service, ce qui en dépend et les étapes côté compte pour Resend et Brevo."
---

Tout ce qui, sur le serveur, envoie du courriel automatisé passe par un seul service externe : un choix, une adresse d'expédition, un identifiant. Un serveur qui expédie lui-même son courriel transactionnel finit dans les pourriels; un service d'envoi est donc utilisé.

## Ce qui en dépend

- Les courriels de réinitialisation de mot de passe et les invitations du service de connexion (Keycloak). Voir [Connexion et personnes](/fr/configuration/sign-in-and-people/).
- Les courriels d'alerte, comme les alertes sur les ressources du serveur. Voir [Alertes](/fr/configuration/alerts/).
- Le courriel unique envoyé à l'administrateur quand un abonnement payant se verrouille. Voir [Abonnement](/fr/configuration/subscription/).

Une application de messagerie déployée sur le serveur (un serveur de courriel) garde ses propres réglages, distincts; cette section ne la configure pas.

## Prérequis

- Un compte chez un service d'envoi, avec le domaine d'envoi vérifié chez lui (voir les étapes côté compte plus bas), ou un relais SMTP existant.
- Une adresse de ce domaine à utiliser comme expéditeur.

## Champs

Dans **Paramètres** > **Courriel sortant**, **Envoyer le courriel par** propose :

| Option | Sens |
|---|---|
| **Aucun courriel sortant** | Le courriel est désactivé. Cela désactive aussi les courriels de réinitialisation de mot de passe. |
| **Resend (clé d'API)** | Resend connaît son propre hôte et son port. |
| **Brevo (clé d'API)** | Brevo connaît son propre hôte et son port. |
| **Serveur SMTP personnalisé** | N'importe quel relais SMTP. |

Seuls les champs dont l'option choisie a besoin sont affichés :

| Champ | Resend | Brevo | Personnalisé |
|---|---|---|---|
| **Adresse d'expédition** | oui | oui | oui |
| **Hôte du serveur SMTP** | non | non | oui |
| **Port du serveur SMTP** | non | non | oui (587 est le port de soumission habituel) |
| **Nom d'utilisateur** | non | oui | oui |
| **Clé d'API ou mot de passe** | oui | oui | oui |

Le secret est stocké et jamais réaffiché; un champ vide le conserve. Le choix du service est la seule valeur que le panneau valide ("Choisissez l'une des options proposées."). La section se termine par **Enregistrer et appliquer** : les services qui expédient du courriel redémarrent brièvement.

## Étapes côté compte

### Resend

1. Créer un compte Resend et y ajouter le domaine d'envoi.
2. Ajouter au domaine, dans Cloudflare, les enregistrements DNS que Resend liste, puis attendre que le domaine soit indiqué comme vérifié dans Resend.
3. Créer une clé d'API.
4. Dans le panneau, choisir **Resend (clé d'API)**, saisir une adresse d'expédition du domaine vérifié et la clé d'API, puis appuyer sur **Enregistrer et appliquer**.

### Brevo

1. Créer un compte Brevo, puis y ajouter et authentifier le domaine d'envoi à l'aide des enregistrements DNS que Brevo liste.
2. Dans le compte Brevo, repérer l'identifiant SMTP et créer la clé à utiliser avec le relais SMTP.
3. Dans le panneau, choisir **Brevo (clé d'API)**, saisir l'adresse d'expédition du domaine authentifié, l'identifiant SMTP dans **Nom d'utilisateur** et la clé dans **Clé d'API ou mot de passe**, puis appuyer sur **Enregistrer et appliquer**.

### Serveur SMTP personnalisé

Saisir l'hôte et le port du relais, son nom d'utilisateur et son mot de passe, ainsi qu'une adresse d'expédition que le relais accepte.

## Vérifier le fonctionnement

Après l'enregistrement, le lien de mot de passe oublié de la page de connexion, sur `auth.yourdomain.com`, envoie un courriel de réinitialisation à un compte existant. Si rien n'arrive, vérifier le dossier des pourriels, puis l'état de vérification du domaine d'envoi chez le fournisseur.

## Dépannage

- Aucun courriel de réinitialisation après avoir choisi **Aucun courriel sortant** : attendu, cette option les désactive.
- Le fournisseur rejette l'expéditeur : l'adresse d'expédition doit appartenir à un domaine vérifié chez le fournisseur.
- Le courriel fonctionnait puis s'est arrêté : la clé a pu être révoquée ou le compte du fournisseur suspendu. Créer une nouvelle clé et l'enregistrer; un champ secret vide conserve l'ancienne, la nouvelle valeur doit donc être saisie.
