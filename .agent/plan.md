# Plan: ops issue 409, shorten "Configure an app for Catena"

The page `src/content/docs/{en,fr}/configure-apps.mdx` (sidebar "Apps") is 497 lines and 11,739 words in EN
(12,721 in FR). The issue asks for it MUCH shorter and concise. The page repeats facts other pages own (updates,
vulnerabilities, consoles), quotes every panel message and timing, and lists the Swarm rules twice (step 2 and the
checker's S, K, X tables).

## Contracts the rewrite keeps

- Rule anchors `s0`..`s4`, `k1`..`k17`, `x1`..`x11`, `x17` on both locales: catena-admin
  `shell/web/templates/pages/check.tmpl` links "What this means" to `configure-apps/#<rule>`.
- `#declare-a-verify-check-optional`: catena-templates `README.md` links it.
- Headings other docs pages link to (EN and the FR slug of the same heading): add-an-app-from-a-repository,
  settings-deploy-take-down-and-delete, changes-that-run-together, declare-the-settings-optional,
  declare-the-backup-mode-and-update-steps-optional, sign-in-with-catena-accounts-optional,
  check-an-app-with-the-panel, updates, x17.

## Steps

1. [Done] Investigate: page, inbound links (docs, catena-admin, catena-templates, ops, website), gates.
2. [Open] Rewrite EN and FR together to about a third of the words: drop quoted panel messages, timings and
   behaviour other pages own (link them), merge "How Catena reads an app" and steps 1-8 into one short sequence,
   keep step 2 to what the checker tables do not say, word "What an app can ask of Catena" generically (per-app
   pairings live in each app's `app.json`), shorten the Nextcloud example's notes and the troubleshooting table.
   Move the inline settings YAML to `src/examples/app-settings.yml` so both locales render one copy.
   Files: `src/content/docs/en/configure-apps.mdx`, `src/content/docs/fr/configure-apps.mdx`,
   `src/examples/app-settings.yml`. Helper: fleet:docs-manager.
3. [Open] Gates: `npm ci`, `npm run check:unicode`, `node ../contracts/scripts/check-repo-rules.mjs`,
   `npm run check:versions`, `npm run check:prose`, `npm run check`, `npm run build`, `npx --yes jscpd@4 --silent`.
4. [Open] Review: fleet:code-reviewer on the diff (no claim the old page did not support, anchors kept, EN/FR
   parity, client-page rules).
5. [Open] Commit `docs(configure-apps): ...` with the three paths.

## Open questions

None.
