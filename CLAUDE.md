# apps/docs -- catena client wiki

Astro 6 + Starlight. Client-facing documentation. Builds standalone
(`npm run build`) and is also chained into `apps/website/dist/docs/`
by `apps/website/scripts/build-with-docs.mjs` for the single-deploy
production setup.

## Build flow

- `npm run dev` -- Starlight dev server.
- `npm run build` -- standalone Starlight build into `dist/`.
- `npm run check` -- typecheck (Astro check).
- `prebuild` runs `packages/tools/sync-brand.mjs` to seed
  `src/styles/brand/`. Vendored locally after split (see
  `internal_docs/operator/repo-split-runbook.md`).

## Content rules

- This is **client-facing** documentation. Never reference the
  operator documentation, operator paths, Ansible roles, playbooks,
  or filesystem paths.
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

## Repo split

This folder is structured to be lifted into its own repo via
`git subtree split --prefix=apps/docs`. See the runbook at
`internal_docs/operator/repo-split-runbook.md` in the canonical
monorepo. Couplings the runbook resolves:

- `predev` / `prebuild` reference `../../packages/tools/sync-brand.mjs`
  -- vendor `tools/` locally on split.
- After split, the operator wires the Starlight `editLink.baseUrl`
  in `astro.config.mjs` to point at the new public repo.
