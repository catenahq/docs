# catenahq/docs -- catena.run/docs

Astro + Starlight client wiki for the catena stack. Public-facing
docs (EN + FR), served at `catena.run/docs/`.

Standalone build (`npm run build` -> `dist/`); nginx in front routes
`/docs/` to the build output. No chained-build coupling with the
marketing site.

## Develop

```bash
npm install
npm run dev       # -> http://localhost:4321/docs/
npm run build     # -> dist/
npm run check     # astro check + starlight-links-validator
```

## Adding a page

1. Create the FR file (default locale, no prefix):
   `src/content/docs/<slug>.md`.
2. Create the EN mirror under `en/`:
   `src/content/docs/en/<slug>.md`.
3. If the page belongs to a sidebar nav group, add the slug to
   `astro.config.mjs::sidebar` under the matching group. Pages under
   `apps/` are auto-generated from the directory.
4. `npm run build` validates frontmatter, internal links
   (starlight-links-validator), and missing locales.

## Apps catalog

The per-template pages under `src/content/docs/apps/` are
machine-generated from the catenahq/ops repo's
`automation/ansible/roles/infrastructure/vars/dokploy_template_catalog.yml`.
Run the generator from `catenahq/ops`:

```bash
uv run python automation/operator-tools/generate-template-docs.py
```

The generator writes into this repo's tree via the
`CATENAHQ_DOCS_ROOT` env var (default = sibling `docs/`). Do NOT
hand-edit the generated pages -- changes belong in the catalog file
upstream.

## Interactive yourdomain.com placeholder

Every page references the client's domain as the literal string
`yourdomain.com`. The `public/domain-rewriter.js` script, loaded
via Starlight's `head` config, ships an input pill in the header
that swaps the placeholder for the user's actual domain at read
time (localStorage + `?domain=` URL override). Source markdown
stays plain and grep-able.

## Adding a language

Mirror the default-locale tree under `src/content/docs/<lang>/`,
register the locale in this repo's `astro.config.mjs::locales`,
then add a third locale to each sidebar group's `translations`
block.

## Brand assets

Brand tokens come from `@catenahq/contracts/brand`, vendored
locally under `vendor/catenahq-contracts-X.Y.Z.tgz`. Bumped via
the `Bump @catenahq/contracts to latest` GitHub Action; the
companion contracts-freshness CI gate fails the build if the
vendored version drifts from the latest tag.

## CI gates

- contracts-freshness (vendored contracts version is current)
- unicode hygiene (`npm run check:unicode` -- no em dashes, smart
  quotes, decorative Unicode per workspace CLAUDE.md)
- Astro typecheck + Starlight build (catches broken internal links)
