# catenahq/docs -- catena client wiki

Astro 6 + Starlight. Client-facing documentation. Builds standalone
(`npm run build` -> `dist/`).

## Build flow

- `npm run dev` -- Starlight dev server.
- `npm run build` -- standalone Starlight build into `dist/`.
- `npm run check` -- typecheck (Astro check).

## Brand assets

Brand tokens come from `@catenahq/contracts/brand`, vendored locally
under `vendor/catenahq-contracts-X.Y.Z.tgz`. Do not edit the
vendored copy by hand.

To bump the vendored version: run the "Bump @catenahq/contracts to
latest" workflow (Actions tab -> Run workflow), or wait for the
daily cron. The companion `contracts-freshness` job in `ci.yml`
fails the build whenever the vendored version drifts from the
latest tag on `catenahq/contracts`, so a stale vendored copy blocks
every merge until a bump PR lands.

Required repository secret:

  CONTRACTS_READ_TOKEN  fine-grained GitHub PAT with
                        `Contents: read` on catenahq/contracts only.
                        Used by both contracts-update.yml and the
                        contracts-freshness gate.

## Content rules

- Client-facing. Never reference the operator documentation,
  operator paths, Ansible roles, or filesystem paths.
- Standing rule (2026-04-22): for maintenance / recovery / internal
  tasks, write "contact your operator" instead of citing the
  operator doc path or task name. Intentional exception:
  `self-restore.md`, which describes the client taking on the
  operator role.
- Never write "playbook" in client-facing copy. Use "automation flow"
  or "managed operation".
- Bilingual parity is required: every page exists in EN and FR.
  Canadian English + Quebec French.
- Cross-page references must be real hyperlinks (Starlight handles
  link validation via `starlight-links-validator`); verify targets
  exist before linking.
- No emojis or em-dashes in copy or code. Plain hyphens + straight
  quotes only.

## Working on Astro / Starlight

Use the Astro MCP (`mcp__Astro_docs__search_astro_docs`) for any
Astro / Starlight feature question rather than guessing.
