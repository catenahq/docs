---
title: "Libre-service -- interface web ou ligne de commande"
description: "Règle empirique : tout ce que les interfaces web exposent est une tâche de navigateur. Le reste passe par l'accès SSH Tailscale ou catena-cli."
---

Règle empirique : tout ce que les interfaces web exposent est une
tâche de navigateur. Tout le reste passe par l'accès SSH Tailscale à
la machine, ou par la CLI `catena-cli` depuis un dépôt Catena. Dans les
deux cas, rien ici n'exige quelqu'un d'autre.

## Tâches de navigateur

- **Ajouter / retirer des comptes d'employés :** interface Keycloak
  (`auth.yourdomain.com`). Inclut les réinitialisations de mot de
  passe, l'enrôlement MFA, et l'appartenance aux groupes pour l'accès
  par département.
- **Déployer de nouvelles applications du catalogue éprouvé :**
  interface Portainer (`portainer.yourdomain.com`). Choisir un modèle,
  régler le label de groupe par département, déployer. Le SSO est
  branché automatiquement.
- **Vérifier la santé des services :** Gatus
  (`monitor.yourdomain.com`) pour la vue par sondes externes,
  le tableau de bord (`dash.yourdomain.com`) pour les tuiles
  d'état par application.
- **Lancer des sauvegardes ponctuelles, consulter l'historique des
  sauvegardes :** l'onglet **Actions** du tableau de bord
  (`dash.yourdomain.com`).
- **Voir les alertes actives :** Healthchecks
  (`heartbeat.yourdomain.com`) affiche l'état homme-mort de chaque
  tâche planifiée.
- **Gérer les réglages applicatifs :** tout ce qui se trouve dans
  Nextcloud, Rocket.Chat, EspoCRM, et le reste -- l'interface admin de
  chaque application couvre ses propres réglages.
- **Remplacer le tunnel Cloudflare ou rejoindre de nouveau Tailscale :**
  après avoir régénéré l'identifiant dans la console du fournisseur,
  appuyer sur **Appliquer** sous catena-admin **Settings -> Domain**
  pour le tunnel ; pour Tailscale, enregistrer le nouvel identifiant
  dans **Settings** et appuyer sur **Rejoindre de nouveau le réseau
  privé**.
- **Ré-appliquer la configuration** après un changement de réglage :
  **Remettre ce serveur à niveau** dans catena-admin **Settings**.

## Via la ligne de commande ou la CLI `catena-cli`

Ceci nécessite un shell sur la machine (connexion SSH via Tailscale)
ou la CLI `catena-cli` lancée depuis un dépôt Catena :

- **Reconstruire un serveur perdu** -- `catena-cli install` sur un
  serveur neuf, puis la vue **Les sauvegardes d'un autre serveur** de la
  page Restauration, avec le jeu de clés de récupération. Voir
  [Reconstruire un serveur à partir de la sauvegarde](/fr/self-restore/).
  Remettre les données en place sur un serveur qui fonctionne encore est
  une tâche de navigateur : la page **Restauration** du panneau
  d'administration. Voir
  [Restaurer les données depuis le panneau d'administration](/fr/restore-data/).
- **Migrer vers un autre fournisseur de VPS** -- `catena-cli install`
  chez le nouveau fournisseur, puis restaurer depuis les sauvegardes de
  l'ancien serveur avec le jeu de clés de récupération.
- **Ré-appliquer toute l'installation** -- relancer `catena-cli
  install`, qui peut être relancé sans risque.
- Mises à niveau majeures des services de base, modèles personnalisés
  (hors catalogue), ou toute modification directe d'un fichier sur
  l'hôte.

Quand le côté d'une tâche n'est pas évident, l'interface web est le
point de départ ; la ligne de commande est le repli pour les rares
choses qu'elle ne couvre pas. Un coup de main reste disponible auprès
du contact Catena -- une option, pas une obligation.
