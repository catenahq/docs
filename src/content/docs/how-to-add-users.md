---
title: "Comment ajouter des utilisateurs"
description: "Version abrégée :"
---

Version abrégée :

1. Rendez-vous sur `https://auth.yourdomain.com` et connectez-vous
   en tant qu'administrateur.
2. Interface d'administration -> Directory -> Users -> "Create".
3. Remplissez le nom d'utilisateur et le courriel. Définissez un mot de
   passe fort OU envoyez une invitation (Keycloak expédie par SMTP un
   lien pour définir le mot de passe -- suppose que l'opérateur a
   configuré SMTP).
4. Attribuez le groupe `client-staff` (accès de base aux applications
   protégées). Pour un contrôle plus fin, utilisez un groupe par
   département (consultez la documentation de déploiement de votre
   opérateur).
5. L'utilisateur peut alors se connecter à n'importe quel sous-domaine
   d'application (`admin.yourdomain.com`,
   `monitor.yourdomain.com`,
   `actions.yourdomain.com`,
   `dash.yourdomain.com`) avec son courriel et son mot
   de passe.

Les flux en libre-service qui fonctionnent sans intervention de
l'opérateur :

- Réinitialisation du mot de passe (lien par courriel).
- Modification du profil (nom affiché, courriel).
- Activation de l'authentification multifacteur sur son propre compte.
