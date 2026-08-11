---
title: Ce que Catena promet, et comment cela se vérifie
description: La promesse du produit, la méthode derrière chaque vérification, et la liste générée de toutes les répétitions qui l'appuient.
---

<!-- Generated file. Do not hand-edit: the maintainers' tooling
     regenerates it and the build fails on drift. -->

Cette page est **générée, pas rédigée** : elle est rendue à partir du même manifeste vérifié par machine qui classifie chaque fichier source et chaque scénario de test du produit Catena, et la compilation échoue dès que cette page dérive de ce manifeste. Ce qu'elle affirme est ce qui est appliqué.

## La promesse

> **Un serveur Catena se reconstruit à partir du seul stockage de sauvegarde et de sa clé.**

Tout le reste en découle. Les sauvegardes sont chiffrées sur le serveur avant de le quitter et arrivent dans un stockage objet détenu par le compte du client. Le trafic web entre par un tunnel chiffré : aucun port web n'est ouvert sur la machine elle-même. Une seule connexion couvre toute la suite, avec un contrôle d'accès par application devant chaque app. Chaque édition inclut une sauvegarde planifiée.

## Comment chaque affirmation est vérifiée

Quatre types de preuves soutiennent la liste ci-dessous, et chacune fait échouer la compilation plutôt qu'une relecture :

- **Répétitions.** Des serveurs virtuels jetables sont provisionnés, pilotés à travers le vrai produit (installation, sauvegarde, bris, restauration) et vérifiés sur le résultat -- y compris des pannes injectées délibérément : disque plein, clé de stockage révoquée, paquet de sauvegarde corrompu.
- **Analyses externes.** Une passe de validation analyse le serveur fini depuis l'extérieur pour confirmer qu'il n'expose rien qu'il ne devrait.
- **Garde-fous anti-dérive.** Cette page, les fiches de spécification et le manifeste des fonctionnalités sont générés depuis une source unique. Une affirmation qui ne correspond plus à une vérification réelle arrête la compilation.
- **Artefacts signés.** L'image de conteneur publiée est signée, analysée et accompagnée d'une nomenclature logicielle, afin que les octets exécutés correspondent à la source dont ils proviennent.

Une répétition ne compte ici que si sa dernière exécution enregistrée a réussi. Celle qui existe sans avoir encore réussi est nommée à part, jamais fondue dans le compte.

## Inclus dans Community

### Sauvegardes chiffrées vers un stockage détenu par le client (11 répétitions)

Une sauvegarde hebdomadaire planifiée plus des sauvegardes manuelles en tout temps. Les sauvegardes sont chiffrées sur le serveur avant d'en sortir et aboutissent dans un stockage objet appartenant au client; les instantanés se listent, se parcourent et s'exportent sans restauration. La cadence quotidienne et infra-quotidienne est une fonction Catena Pro.

Répétitions: `backup_rollback`, `backup_schedule_applied`, `concurrent_backup_lock_contention`, `fi_b2_pg_dump_failed`, `fi_b3_snapshot_id_mismatch`, `fi_b4_locked_pack_rotation`, `fi_b6_healthchecks_down`, `fi_b7_ntfy_delivery_fails`, `malformed_catalog_rejection`, `restic_password_rotation_round_trip`, `snapshot_export_round_trip`

### Authentification unique pour toute la suite (10 répétitions)

Un seul compte ouvre toutes les applications, avec contrôle d'accès par application et séparation employé/administrateur appliquée en amont des applications, pas dans chacune.

Répétitions: `fi_a1_realm_marker_collision`, `fi_a2_oidc_secret_rotation`, `fi_a3_keycloak_unreachable`, `fi_a4_master_realm_idempotent`, `fi_a5_wrong_group_assignment`, `keycloak_admin_email_loss_recovery`, `keycloak_signing_keys_rotation_round_trip`, `oauth2_proxy_cookie_rotation_round_trip`, `user_recovery_2fa_reset`, `user_recovery_kcadm_temp_password`

### Tableau de bord d'administration (5 répétitions)

Un tableau de bord web à accès selon le rôle (le personnel voit l'état, les administrateurs ont aussi les actions d'entretien). Chaque action déclenchée par un bouton est consignée au journal système du serveur.

Répétitions: `audit_chain_tamper_evident`, `ce_admin_actions`, `ce_admin_smoke`, `quiesce_resume_round_trip`, `wizard_restore_smoke`

### Installation et déploiement des applications (15 répétitions)

Prépare un serveur neuf, installe la plateforme et déploie les applications choisies. Relancer la même opération gérée ramène le serveur à sa configuration déclarée : un serveur ayant dérivé est réparé, pas reconstruit à la main.

Répétitions: `ce_converge`, `ce_install_suite`, `ce_uninstall`, `converge_modify`, `fi_c1_docker_daemon_hang`, `fi_c3_portainer_crash_mid_deploy`, `fi_c4_registry_pull_timeout`, `fi_c6_cloudflared_flapping`, `fi_c7_coturn_cert_expired`, `fi_c8_nextcloud_init_loop`, `fi_u1_compose_lint_reject`, `mixed_template_negative_restore`, `repair_broken_template_round_trip`, `scheduler_easyappointments`, `swarm_overlay_selfheal`

Écrite, pas encore réussie: `converge_preserves_bumped_image`, `dev_to_prod_cutover_round_trip`

### Catalogue d'applications et intégrations de la suite (2 répétitions)

Déploiement par application plus le câblage qui fait de la suite un seul produit : courriel, clavardage et visioconférence, intégration fichiers/bureautique, veille antivirus et canaris de livraison.

Répétitions: `mailserver_round_trip`, `nextcloud_versions_retention_applied`

### Supervision auto-hébergée (1 répétition)

Pages d'état sur le serveur, suivi des ressources, chien de garde d'espace disque et rapport toujours à jour des mises à jour disponibles pour les applications installées -- le tout hébergé sur le serveur du client.

Répétitions: `fi_u3_gatus_baseline_down`

### Réseau privé et accès public durci (13 répétitions)

Tout le trafic web atteint le serveur par un tunnel chiffré : aucun port web n'est ouvert sur la machine elle-même. L'administration à distance passe par un réseau privé pair à pair, et les appels audio/vidéo ont leur relais dédié.

Répétitions: `ce_install_headscale`, `cf_activate`, `cf_tunnel_regenerate_round_trip`, `fi_n10_multidomain_cap`, `fi_n1_tailnet_partition_mid_converge`, `fi_n2_cf_tunnel_down`, `fi_n3_dns_propagation_lag`, `fi_n4_cf_zone_misconfigured`, `fi_n5_provider_outage_mid_restore`, `fi_n6_s3_endpoint_5xx`, `fi_n7_restic_repo_unreachable`, `fi_n8_ufw_concurrent_ssh`, `fi_n9_public_ip_change`

Écrite, pas encore réussie: `cloudflare_api_rotation_round_trip`, `fi_v3_tailscale_acl_misconfig`, `tailscale_oauth_rotation_round_trip`

### Reprise après sinistre et restauration (16 répétitions)

Un serveur entier se reconstruit à partir du seul point d'accès de sauvegarde et de sa clé, et un serveur en marche se restaure sur place. Bases de données et applications reviennent en une seule opération coordonnée, cohérentes entre elles plutôt que chacune à son propre instant. Les deux chemins sont répétés en continu, y compris à travers les versions majeures du système et de la base de données.

Répétitions: `ce_restore`, `fi_d2_pg_dumpall_replay_constraint`, `fi_d3_postgres_oom_mid_restore`, `fi_d4_disk_full_mid_snapshot`, `fi_d5_disk_full_mid_converge`, `fi_d6_volume_uid_drift`, `fi_d7_restic_corrupt_pack`, `nc_s3_hot_recovery`, `nc_sync_wipe_restore`, `pitr_fuse_round_trip`, `recover_secrets_from_running_host`, `recovery_landing_page_bilingual_parity`, `restore_dr`, `restore_version_skew_abort`, `s3_reconcile_orphan_cleanup`, `selective_restore_round_trip`

Écrite, pas encore réussie: `debian_major_upgrade_restore`, `pg_major_version_cross_restore`

### Aucune dépendance forcée, jamais (2 répétitions)

Le panneau d'administration peut être supprimé sans que rien d'autre s'arrête : les sauvegardes tournent, les restaurations réussissent et chaque application reste en ligne, avec seulement des outils standards et les réglages conservés sur le serveur lui-même. Partir coûte du confort, jamais des données.

Répétitions: `recovery_readme_manual_restore`, `sovereign_exit`

### Vérifications automatisées de santé et d'exposition (3 répétitions)

Une passe de validation prouve les deux sens : chaque service répond là où il le doit (sur le serveur et via le réseau privé), et un balayage externe confirme que rien d'interdit n'est joignable.

Répétitions: `ce_validate`, `fi_v2_external_scan_blocked`, `security_scan`

## Catena Pro

Les fonctions Catena Pro sont exercées par la même suite de répétitions; les comptes proviennent du même manifeste.

### Attestation de conformité mensuelle signée (1 répétition)

Un rapport mensuel signé cryptographiquement (disponibilité, sauvegardes, test de restauration, correctifs, posture d'identité, événements d'audit) présentable à un assureur ou un auditeur, vérifiable contre toute altération.

Répétitions: `ee_attest`

### Journal d'audit centralisé infalsifiable (1 répétition)

Chaque action administrative sur le serveur est aussi expédiée hors de la machine vers un stockage d'audit central : la trace survit même si le serveur est perdu ou altéré.

Répétitions: `ee_audit_ship`

### Copie de sauvegarde hors site immuable (6 répétitions)

Une seconde copie de sauvegarde chez un fournisseur différent, verrouillée en écriture pour qu'un serveur compromis ne puisse ni la modifier ni l'effacer, avec vérification récurrente que les deux copies se restaurent réellement.

Répétitions: `mirror_skips_on_bad_verify_hot`, `rclone_copy_preserves_pruned_packs`, `restic_check_subset_weekly`, `verify_hot_bootprobe_weekly`, `worm_object_lock_expiry_edge`, `worm_round_trip`

### Analyse de vulnérabilités (1 répétition)

Analyses récurrentes des logiciels installés et de leurs conteneurs pour vulnérabilités connues, avec résultats versés aux rapports d'entretien et d'attestation.

Répétitions: `cve_residual_emits_findings`

### Entretien quotidien automatisé (13 répétitions)

Une routine quotidienne supervisée sur le serveur : sauvegardes horaires, contrôles de paquets et de santé, et une chaîne d'entretien ordonnée qui reprend sans danger après interruption.

Répétitions: `daily_chain_container_rollback`, `daily_chain_full_pass`, `daily_chain_preflight_aborts_low_disk`, `daily_chain_quiesce_invoked`, `daily_chain_quiesce_invoked_backup_abort`, `daily_chain_resume_after_reboot`, `daily_chain_security_rollback`, `daily_chain_verify_cold_blocks_mirror`, `daily_chain_verify_cold_fail_configurable`, `daily_chain_verify_hot_fail_aborts_updates`, `daily_state_corrupt_fallback`, `daily_umbrella_healthchecks`, `ee_daily_cycle`

### Opérations de cycle de vie gérées (migration, retrait) (répétée comme opération gérée)

Migration complète de serveur entre fournisseurs, retrait ordonné avec remise des données, et pause/arrêt de flotte -- exécutés pour le client comme opérations gérées et répétés régulièrement.

### Activation des fonctions sous licence (6 répétitions)

Les fonctions Pro s'activent par une licence signée cryptographiquement et se désactivent proprement à son échéance; la base Community continue de fonctionner dans les deux cas.

Répétitions: `activate_ee`, `ee_ce_regression`, `ee_entitlement_partial`, `ee_lapse`, `ee_named_buttons`, `license_domain_mismatch`

### Surveillance de la posture d'identité (1 répétition)

Contrôles récurrents de la santé des comptes : authentification multifacteur imposée, modèle de groupes convenu et aucun compte administrateur inattendu -- toute dérive lève une alerte.

Répétitions: `ee_identity_probe`

### Mises à jour gérées avec retour arrière automatique (9 répétitions)

Les applications et composants système se mettent à jour selon un calendrier géré; une mise à jour ratée est détectée et ramenée à la dernière version fonctionnelle sans intervention.

Répétitions: `auto_update_mid_crash`, `auto_update_rollback`, `control_plane_update_rollback`, `daily_chain_container_rollback`, `daily_chain_security_rollback`, `fi_u2_resume_after_reboot`, `fi_u4_ovh_rate_limited`, `fi_u5_persistent_quarantine`, `fi_u6_full_rollback_state`

### Supervision externe de la disponibilité (répétition écrite, pas encore réussie)

Supervision indépendante depuis l'extérieur du serveur, avec interrupteur homme-mort : le silence lui-même déclenche une alerte, un serveur qui s'éteint ne passe pas inaperçu.

Écrite, pas encore réussie: `healthchecks_self_host_loss`

### Domaines multiples, chacun avec sa propre connexion privée (1 répétition)

Sur les forfaits payants, un même serveur peut héberger plusieurs domaines distincts et non liés, chacun avec sa propre connexion privée, de sorte que les personnes utilisant un domaine ne voient jamais la connexion d'un autre domaine. Les tableaux de bord partagés restent sur le premier domaine (principal).

Répétitions: `ee_multidomain`

### Un déplacement annulable (4 répétitions)

Déplacer les données vers un autre serveur copie presque tout pendant que l'ancien continue de servir : l'indisponibilité des applications se compte donc en minutes plutôt qu'en heures. Jusqu'à la dernière vérification, le déplacement peut être annulé et l'ancien serveur se remet en service de lui-même. Passé ce point, il continue de répondre à une seule demande -- remets-toi en service -- même après l'arrêt de tout le reste, et ses propres sauvegardes restent intactes comme voie de retour. Cette demande passe par le réseau privé du client et ne fonctionne que pendant une fenêtre ouverte depuis le serveur lui-même, avec un code à usage unique affiché une seule fois.

Répétitions: `migrate_lane_auth_denied`, `migrate_preseed_no_split_brain`, `wizard_migrate_resume_source`, `wizard_migrate_round_trip`

Le détail technique complet (chemins d'implémentation et noms de scénarios pour l'édition Community) se trouve dans la [fiche de validation publique sur GitHub](https://github.com/catenahq/catena-ce/blob/main/VALIDATION.md).
