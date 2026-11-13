# Checkpoint: ops issue 409

## Done

- Read the page, docs AGENTS.md and README.md, CI workflow, `.jscpd.json`.
- Inbound links found with `git grep configure-apps` in docs, catena-admin, catena-templates, ops, website.

## In flight

- Step 2 (rewrite) with fleet:docs-manager; brief `/var/tmp/issues/409/briefs/docs-manager.md`, notes
  `/var/tmp/issues/409/notes/docs-manager.md`.

## Next

- Gates, review, commit.

## Facts

- The issue body holds only the title; the ops backlog line (ops 27126e95) adds nothing.
- catena-admin `shell/web/templates/pages/check.tmpl:66` links `configure-apps/#<rule anchor>`.
- catena-templates `README.md:314` links `#declare-a-verify-check-optional`.
- website `src/i18n/*/common.json:92` link the page without an anchor.
- The mail server's own DNS records are in catena-templates `blueprints/mailserver/app.json`.

## Hypotheses

- Not a fault to diagnose: a docs length request.
