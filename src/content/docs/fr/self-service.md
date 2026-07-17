---
title: "Libre-service -- interface web ou ligne de commande"
description: "Règle empirique : tout ce que les interfaces web exposent, vous le faites dans un navigateur. Le reste, via votre accès SSH Tailscale ou la CLI catena."
---

Règle empirique : tout ce que les interfaces web exposent, vous le
faites dans un navigateur. Tout le reste, vous le faites via votre
accès SSH Tailscale à la machine, ou avec la CLI `catena` depuis votre
dépôt Catena. Dans les deux cas, c'est à vous de l'exécuter -- rien ici
n'exige quelqu'un d'autre.

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

## Via la ligne de commande ou la CLI `catena`

Ceci nécessite un shell sur la machine (connexion SSH via Tailscale)
ou la CLI `catena` lancée depuis votre dépôt Catena :

- **Restaurer depuis une sauvegarde** -- `catena restore` en place, ou
  `catena recover` sur un serveur neuf. Voir
  [Reconstruire votre serveur à partir de la sauvegarde](/fr/self-restore/).
- **Migrer vers un autre fournisseur de VPS** -- `catena recover` chez
  le nouveau fournisseur, avec votre jeu de clés de récupération.
- **Régénérer le tunnel Cloudflare ou l'accès Tailscale** -- régénérez
  l'identifiant dans la console du fournisseur, puis
  `catena rotate-tunnel` / `catena rotate-tailscale`.
- **Ré-appliquer la configuration** après un changement de réglage --
  `catena converge`.
- Mises à niveau majeures des services de base, modèles personnalisés
  (hors catalogue), ou toute modification directe d'un fichier sur
  l'hôte.

Si vous n'êtes pas certain de quel côté tombe une tâche, commencez par
l'interface web ; la ligne de commande est le repli pour les rares
choses qu'elle ne couvre pas. Vous préférez un coup de main ? Joignez
votre contact Catena -- c'est une option, pas une obligation.
