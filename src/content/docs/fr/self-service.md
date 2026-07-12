---
title: "Libre-service -- ce que vous pouvez faire sans l'opérateur"
description: "Règle empirique : tout ce que les interfaces web exposent, vous pouvez le faire vous-même. Tout ce qui requiert SSH + sudo passe par l'opérateur."
---

Règle empirique : tout ce que les interfaces web exposent, vous
pouvez le faire vous-même. Tout ce qui requiert un accès SSH et sudo
passe par l'opérateur.

## Oui, faites-le vous-même

- **Ajouter / retirer des comptes d'employés :** interface Keycloak
  (`auth.yourdomain.com`). Inclut les réinitialisations de mot de
  passe, l'enrôlement MFA, et l'appartenance aux groupes pour l'accès
  par département.
- **Déployer de nouvelles applications du catalogue éprouvé :**
  interface Portainer (`portainer.yourdomain.com`). Choisissez un modèle,
  réglez le label de groupe par département, déployez. Le SSO est
  branché automatiquement.
- **Vérifier la santé des services :** Gatus
  (`monitor.yourdomain.com`) pour la vue par sondes externes,
  Homepage (`dash.yourdomain.com`) pour les tuiles d'état par
  application.
- **Lancer des sauvegardes ponctuelles, consulter l'historique des
  sauvegardes :** OliveTin (`actions.yourdomain.com`).
- **Voir les alertes actives :** Healthchecks
  (`checks.yourdomain.com`) affiche l'état homme-mort de chaque tâche
  planifiée.
- **Gérer les réglages applicatifs :** tout ce qui se trouve dans
  Nextcloud, Rocket.Chat, EspoCRM, etc. -- les interfaces admin des
  applications elles-mêmes sont à vous.

## Passez par l'opérateur

- Mises à niveau majeures de Keycloak, Portainer ou Postgres.
- Changements à la topologie Cloudflare Tunnel ou DNS.
- Restauration à partir d'une sauvegarde (destructif ; exige le VPS
  en état suspendu).
- Migration vers un autre fournisseur de VPS.
- Ajout d'un modèle personnalisé (hors catalogue éprouvé), ou tout
  ce qui sort du catalogue d'applications.
- Toute opération qui demande SSH ou sudo.

Si vous n'êtes pas certain de quel côté de la ligne tombe une tâche,
demandez d'abord. La plupart penchent vers le libre-service ; les
rares exceptions sont clairement destructives ou transverses.
