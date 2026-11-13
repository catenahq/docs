# Checkpoint: ops issue 409

## Done

- Rewrite committed in 23e01d3: EN 11,739 to 4,467 words, FR 12,721 to 4,872 (fleet:docs-manager wrote it; the
  coordinator restored the facts a file author needs; fleet:code-reviewer found ten minor points, all applied).
- Gates after the last edit: check:unicode, check:versions, check:prose, astro check (0 errors), build (all internal
  links valid), jscpd 0%. Every anchor other repos link checked in `dist/{en,fr}/configure-apps/index.html`.
- `check-repo-rules.mjs` fails only on the tracked `.agent/` files, which the coordinator removes before merge.

## Next

- None: result `done`.

## Facts

- The issue body holds only the title; the ops backlog line (ops 27126e95) adds nothing.
- catena-admin `shell/web/templates/pages/check.tmpl:66` links `configure-apps/#<rule anchor>`.
- catena-templates `README.md:314` links `#declare-a-verify-check-optional`.
- website `src/i18n/*/common.json:92` link the page without an anchor.
- The mail server's own DNS records are in catena-templates `blueprints/mailserver/app.json`.

## Hypotheses

- Not a fault to diagnose: a docs length request.
