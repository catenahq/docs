---
title: What Catena promises, and how it is verified
description: The product promise, the method behind each check, and the live generated list of every rehearsal that backs it.
---

<!-- Generated file. Do not hand-edit: the maintainers' tooling
     regenerates it and the build fails on drift. -->

This page is **generated, not written**: it is rendered from the same machine-checked manifest that classifies every source file and every test scenario of the Catena product, and the build fails whenever this page drifts from that manifest. What it claims is what is enforced.

## The promise

> **A Catena server can be rebuilt from nothing but its backup storage and the backup key.**

Everything else follows from that. Backups are encrypted on the server before they leave it and land in object storage held under the client's own account. Web traffic enters through an encrypted tunnel, so no web port is open on the machine itself. One login covers the whole suite, with per-application access control in front of each app. Every edition includes a scheduled backup.

## How each claim is checked

Four kinds of evidence sit behind the list below, and each one fails the build rather than a review:

- **Rehearsals.** Disposable virtual servers are provisioned, driven through the real product (install, back up, break, restore) and checked against the outcome -- including deliberately injected failures such as a full disk, a revoked storage key or a corrupted backup pack.
- **External scans.** A validation pass scans the finished server from outside to confirm it exposes nothing it should not.
- **Drift gates.** This page, the specification sheets and the feature manifest are generated from one source. A claim that no longer resolves to a real check stops the build.
- **Signed artifacts.** The published container image is signed, scanned and accompanied by a software bill of materials, so the running bytes can be matched to the source they were built from.

A rehearsal counts here only when its last recorded run passed. One that exists but has not passed yet is named separately, never folded into the number.

## Included in Community

### Encrypted backups to client-owned storage (11 rehearsals)

A scheduled weekly backup plus manual backups any time. Backups are encrypted on the server before leaving it and land in object storage the client owns; snapshots can be listed, browsed and exported without a restore. Daily and sub-daily cadence is a Catena Pro feature.

Rehearsals: `backup_rollback`, `backup_schedule_applied`, `concurrent_backup_lock_contention`, `fi_b2_pg_dump_failed`, `fi_b3_snapshot_id_mismatch`, `fi_b4_locked_pack_rotation`, `fi_b6_healthchecks_down`, `fi_b7_ntfy_delivery_fails`, `malformed_catalog_rejection`, `restic_password_rotation_round_trip`, `snapshot_export_round_trip`

### Single sign-on across the suite (10 rehearsals)

One account signs in to every application, with per-application access control and staff/administrator separation enforced in front of the applications, not inside each one.

Rehearsals: `fi_a1_realm_marker_collision`, `fi_a2_oidc_secret_rotation`, `fi_a3_keycloak_unreachable`, `fi_a4_master_realm_idempotent`, `fi_a5_wrong_group_assignment`, `keycloak_admin_email_loss_recovery`, `keycloak_signing_keys_rotation_round_trip`, `oauth2_proxy_cookie_rotation_round_trip`, `user_recovery_2fa_reset`, `user_recovery_kcadm_temp_password`

### Administration dashboard (5 rehearsals)

A web dashboard with role-aware access (staff see status, administrators also get maintenance actions). Every action a button triggers is logged in the server's system journal.

Rehearsals: `audit_chain_tamper_evident`, `ce_admin_actions`, `ce_admin_smoke`, `quiesce_resume_round_trip`, `wizard_restore_smoke`

### Installation and application deployment (17 rehearsals)

Prepares a fresh server, installs the platform, and deploys the selected applications. Re-running the same managed operation converges the server back to its declared configuration, so a drifted or half-configured server is repaired, not rebuilt by hand.

Rehearsals: `ce_converge`, `ce_install_suite`, `ce_uninstall`, `converge_modify`, `converge_preserves_bumped_image`, `fi_c1_docker_daemon_hang`, `fi_c3_portainer_crash_mid_deploy`, `fi_c4_registry_pull_timeout`, `fi_c6_cloudflared_flapping`, `fi_c7_coturn_cert_expired`, `fi_c8_nextcloud_init_loop`, `fi_u1_compose_lint_reject`, `mixed_template_negative_restore`, `release_manifest_converge_state`, `repair_broken_template_round_trip`, `scheduler_easyappointments`, `swarm_overlay_selfheal`

Written, not yet passing: `dev_to_prod_cutover_round_trip`

### Application catalog and suite integrations (2 rehearsals)

Per-application deployment plus the wiring that makes the suite feel like one product: email, chat and video calling, file/office integration, antivirus watch and delivery canaries.

Rehearsals: `mailserver_round_trip`, `nextcloud_versions_retention_applied`

### Self-hosted monitoring (1 rehearsal)

On-server status pages, resource monitoring, a disk-space watchdog and an always-fresh report of which installed applications have updates available -- all hosted on the client's own server.

Rehearsals: `fi_u3_gatus_baseline_down`

### Private networking and hardened public access (13 rehearsals)

All web traffic reaches the server through an encrypted tunnel, so no web port is ever open on the machine itself; remote administration rides a private peer-to-peer network, and audio/video calls get their own dedicated relay.

Rehearsals: `ce_install_headscale`, `cf_activate`, `cf_tunnel_regenerate_round_trip`, `fi_n10_multidomain_cap`, `fi_n1_tailnet_partition_mid_converge`, `fi_n2_cf_tunnel_down`, `fi_n3_dns_propagation_lag`, `fi_n4_cf_zone_misconfigured`, `fi_n5_provider_outage_mid_restore`, `fi_n6_s3_endpoint_5xx`, `fi_n7_restic_repo_unreachable`, `fi_n8_ufw_concurrent_ssh`, `fi_n9_public_ip_change`

Written, not yet passing: `cloudflare_api_rotation_round_trip`, `fi_v3_tailscale_acl_misconfig`, `tailscale_oauth_rotation_round_trip`

### Disaster recovery and restore (17 rehearsals)

A whole server can be rebuilt from nothing but the backup endpoint and its key, and a live server can be restored in place. Databases and applications come back as one coordinated operation, consistent with each other rather than each from its own moment in time. Both paths are rehearsed continuously, including across operating-system and database major versions.

Rehearsals: `ce_restore`, `fi_d2_pg_dumpall_replay_constraint`, `fi_d3_postgres_oom_mid_restore`, `fi_d4_disk_full_mid_snapshot`, `fi_d5_disk_full_mid_converge`, `fi_d6_volume_uid_drift`, `fi_d7_restic_corrupt_pack`, `nc_s3_hot_recovery`, `nc_sync_wipe_restore`, `pitr_fuse_round_trip`, `recover_secrets_from_running_host`, `recovery_landing_page_bilingual_parity`, `restore_dr`, `restore_version_skew_abort`, `restore_version_skew_upgrade`, `s3_reconcile_orphan_cleanup`, `selective_restore_round_trip`

Written, not yet passing: `debian_major_upgrade_restore`, `pg_major_version_cross_restore`

### No lock-in, ever (2 rehearsals)

Delete the admin panel and everything else keeps working: backups run, restores work, and every application stays online, using only standard tools and the settings stored on the server itself. Leaving costs convenience, never data.

Rehearsals: `recovery_readme_manual_restore`, `sovereign_exit`

### Automated health and exposure checks (3 rehearsals)

A validation pass proves both directions: every service answers where it should (on-server and through the private network), and an external scan confirms nothing is reachable that should not be.

Rehearsals: `ce_validate`, `fi_v2_external_scan_blocked`, `security_scan`

## Catena Pro

Catena Pro features are exercised by the same rehearsal suite; the counts come from the same manifest.

### Signed monthly compliance attestation (1 rehearsal)

A monthly, cryptographically signed report (uptime, backups, restore test, patching, identity posture, audit events) suitable for an insurer or auditor, verifiable against tampering.

Rehearsals: `ee_attest`

### Tamper-evident central audit trail (1 rehearsal)

Every administrative action on the server is also shipped off the machine to central audit storage, so the trail survives even if the server itself is lost or tampered with.

Rehearsals: `ee_audit_ship`

### Offsite immutable backup copy (6 rehearsals)

A second backup copy at a different provider, write-locked so that even a compromised server cannot alter or delete it, with recurring verification that both copies actually restore.

Rehearsals: `mirror_skips_on_bad_verify_hot`, `rclone_copy_preserves_pruned_packs`, `restic_check_subset_weekly`, `verify_hot_bootprobe_weekly`, `worm_object_lock_expiry_edge`, `worm_round_trip`

### Vulnerability scanning (1 rehearsal)

Recurring scans of the installed software and its containers for known vulnerabilities, with findings fed into the maintenance and attestation reporting.

Rehearsals: `cve_residual_emits_findings`

### Automated daily maintenance (13 rehearsals)

A supervised daily routine on the server: hourly backups, package and health checks, and an ordered maintenance chain that resumes safely after interruption.

Rehearsals: `daily_chain_container_rollback`, `daily_chain_full_pass`, `daily_chain_preflight_aborts_low_disk`, `daily_chain_quiesce_invoked`, `daily_chain_quiesce_invoked_backup_abort`, `daily_chain_resume_after_reboot`, `daily_chain_security_rollback`, `daily_chain_verify_cold_blocks_mirror`, `daily_chain_verify_cold_fail_configurable`, `daily_chain_verify_hot_fail_aborts_updates`, `daily_state_corrupt_fallback`, `daily_umbrella_healthchecks`, `ee_daily_cycle`

### Managed lifecycle operations (migration, decommission) (rehearsed as a managed operation)

Whole-server migration between providers, orderly decommission with data handback, and fleet-wide pause/stop -- performed for the client as managed operations and rehearsed regularly.

### Licensed feature activation (6 rehearsals)

Pro features activate through a cryptographically signed license and deactivate cleanly when it lapses; the Community base keeps working either way.

Rehearsals: `activate_ee`, `ee_ce_regression`, `ee_entitlement_partial`, `ee_lapse`, `ee_named_buttons`, `license_domain_mismatch`

### Identity posture monitoring (1 rehearsal)

Recurring checks that the account structure stays healthy: enforced multi-factor authentication, the agreed group model, and no unexpected administrator accounts -- with drift raised as an alert.

Rehearsals: `ee_identity_probe`

### Managed updates with automatic rollback (11 rehearsals)

Applications and system components update on a managed schedule; a failed update is detected and rolled back to the last working version without intervention.

Rehearsals: `auto_update_mid_crash`, `auto_update_rollback`, `catena_admin_self_update`, `control_plane_update_rollback`, `daily_chain_container_rollback`, `daily_chain_security_rollback`, `fi_u2_resume_after_reboot`, `fi_u4_ovh_rate_limited`, `fi_u5_persistent_quarantine`, `fi_u6_full_rollback_state`, `infra_stack_update_rollback`

### External availability monitoring (rehearsal written, not yet passing)

Independent monitoring from outside the server, including a dead-man switch: silence itself raises an alert, so a server that goes dark cannot go unnoticed.

Written, not yet passing: `healthchecks_self_host_loss`

### Multiple domains, each with its own private sign-on (1 rehearsal)

On paid plans a single server can host several separate, unlinked domains, each with its own private sign-on so people using one domain never see another domain's login. Shared dashboards stay on the first (primary) domain.

Rehearsals: `ee_multidomain`

### A move that can be called off (4 rehearsals)

Moving to another server copies almost everything while the old one is still serving, so application downtime is measured in minutes rather than hours. Up to the last check the move can be called off and the old server puts itself back into service on its own. Past that point it keeps answering one request, named `put yourself back in service`, even after everything else on it has stopped, and its own backups are left untouched as the way back. That request travels over the client's own private network and works only during a window opened from the server itself, using a one-time code it displays once.

Rehearsals: `migrate_lane_auth_denied`, `migrate_preseed_no_split_brain`, `wizard_migrate_resume_source`, `wizard_migrate_round_trip`

Full technical detail (implementation paths and scenario names for the Community edition) lives in the public [validation sheet on GitHub](https://github.com/catenahq/catena-ce/blob/main/VALIDATION.md).
