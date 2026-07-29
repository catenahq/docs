# catenahq/docs -- catena client wiki

Astro 6 + Starlight. Client-facing documentation served at
`docs.catena.run` via GitHub Pages (`.github/workflows/
deploy-pages.yml`, deploys on push to `main`). Builds standalone
(`npm run build` -> `dist/`).

## Build flow

- `npm run dev` -- Starlight dev server.
- `npm run build` -- standalone Starlight build into `dist/`.
- `npm run check` -- typecheck (Astro check).

## Brand assets (sibling read)

`@catenahq/contracts` is consumed via sibling-directory read, NOT a
vendored tarball. `package.json` declares it as
`"@catenahq/contracts": "file:../contracts"`, so npm symlinks
`node_modules/@catenahq/contracts` to the sibling `catena/contracts/`
checkout. Edits in `contracts/` are visible immediately on the next
`npm run dev` / `npm run build`.

Local dev assumes the standard `catena/docs/` + `catena/contracts/`
sibling layout. CI mirrors this: the docs job checks out docs into
`docs/` and catenahq/contracts into `contracts/` under
`$GITHUB_WORKSPACE`, then runs npm install + build with
`working-directory: ./docs`.

catenahq/contracts is public (2026-07-11): the sibling-checkout steps
need no token (the former CONTRACTS_READ_TOKEN secret is retired).

## Content rules

- Client-facing. Never reference the internal operator documentation,
  operator-side paths, Ansible roles, or filesystem paths.
- Standing rule (updated 2026-07-17): Catena is fully self-hosted. The
  READER is the admin who owns and runs the VPS; address them as "you"
  and tell them how to do the task themselves, pointing at the concrete
  tool or another doc (Tailscale SSH, the recovery keyset + self-restore,
  provider rescue mode, credential regeneration in the provider console,
  the catena-admin panel). Do NOT write "we" / "us" / "contact us" /
  "get in touch" / "ask us" as the primary path, and do not imply a
  managed service performs recovery. Human help is OPTIONAL and a last
  resort only: at most a single light fallback like "prefer a hand?
  reach your Catena contact" AFTER the self-service steps -- never the
  first instruction. "operator" stays banned. Use "Catena" for the
  product/system, not as an entity that acts on the reader's behalf.
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

## Security invariants (machine-enforced -- do not weaken silently)

- Client docs never reference operator paths, internal tooling or
  scenario names; trust/what-we-test.md is GENERATED (do not
  hand-edit; the ops-side drift gate fails on divergence).
- Public trust claims live on generated or gate-backed pages only; a
  new claim needs a pointer to the gate that enforces it (see
  trust/how-we-validate).
- No secrets in tree or history (gitleaks; history re-rooted clean at
  publication 2026-07-12 -- never push the backup-pre-reroot-* branches).
