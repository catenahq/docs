# apps/docs -- catena.run/docs

Astro Starlight site. Public client docs (EN + FR), served as a
sub-build of `apps/website` at `catena.run/docs/`.

## Architecture

This workspace builds independently with `base="/docs"`. The
top-level `apps/website` build chains a `astro build` here and
copies `apps/docs/dist/` into `apps/website/dist/docs/` so a single
nginx container serves both surfaces.

There is no standalone deploy target -- `apps/docs` is not a
separate Docker image. Reach the site via `catena.run/docs/`.

## Develop

```bash
# Standalone dev server (handy when iterating on docs only):
npm run dev -w @catena/docs
# -> http://localhost:4321/docs/

# End-to-end build of marketing + docs into one dist tree:
npm run build -w @catena/website
# -> apps/website/dist/  (marketing + /docs)
```

## Adding a page

1. Create `apps/docs/src/content/docs/<slug>.md` (FR, default) and
   `apps/docs/src/content/docs/en/<slug>.md` (EN mirror).
2. If the page belongs to a navigation group, add the slug to
   `astro.config.mjs::sidebar` under the right group. Pages in
   `apps/` are auto-generated from the directory.
3. `npm run build -w @catena/website` -- catches frontmatter errors,
   broken links, and missing locales.

The unit test `automation/tests/unit/test_docs_translation_parity.py`
asserts every FR page has an EN sibling and that heading + mermaid
counts match.

## Interactive `yourdomain.com`

Every page references the client's domain as the literal string
`yourdomain.com`. The `apps/docs/public/domain-rewriter.js` script,
loaded via Starlight's `head` config, ships an input pill in the
header that swaps the placeholder for the user's actual domain at
read time (localStorage + `?domain=` URL override). Source markdown
stays plain and grep-able.

The placeholder is canonical: only `yourdomain.com` matches the
rewriter. Variants (example.com, mydomain.com, your-domain.com,
companyname.com) are rejected by
`test_docs_canonical_domain_placeholder.py`.

## Adding a language

Mirror the FR tree (default) under `src/content/docs/<lang>/`,
register the locale in the website's astro.config.mjs (the docs
sub-build picks up Astro's i18n automatically), then add a third
locale to the sidebar group `translations` blocks.
