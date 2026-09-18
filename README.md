# catenahq/docs -- docs.catena.run

Astro + Starlight client wiki for the catena stack. Public-facing
docs (EN + FR), served at `docs.catena.run`.

Standalone build (`npm run build` -> `dist/`); deployed to GitHub
Pages via `.github/workflows/deploy-pages.yml` on push to `main`.
No chained-build coupling with the marketing site.

## Develop

```bash
npm install
npm run dev       # -> http://localhost:4321/
npm run build     # -> dist/
npm run check     # astro check + starlight-links-validator
```

## Adding a page

1. Create the EN file: `src/content/docs/en/<slug>.md`.
2. Create the FR mirror: `src/content/docs/fr/<slug>.md`. Both
   locales in the same commit (parity rule).
3. If the page belongs to a sidebar nav group, add the slug to
   `astro.config.mjs::sidebar` under the matching group.
4. `npm run build` validates frontmatter, internal links
   (starlight-links-validator), and missing locales.

## Sizing page

`src/content/docs/{en,fr}/sizing.md` is the one generated page here.
It is written from the app catalog's measured footprints by a generator
in catenahq/ops, which reaches this tree through the
`CATENAHQ_DOCS_ROOT` env var (default = sibling `docs/`):

```bash
uv run python automation/operator-tools/generate-sizing-doc.py
```

Do NOT hand-edit it; the numbers belong in the catalog upstream.

Per-application documentation does not live here. Each template carries
its own README beside its compose file, in its
catenahq/catena-templates blueprint directory, which is also what a
client's Portainer shows in the entry's detail panel.

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

Brand tokens come from `@catenahq/contracts/brand`, consumed via
sibling-directory read (`file:../contracts` in `package.json`). Edit
`catena/contracts/` and the change shows up on the next build. CI
checks out catenahq/contracts as a sibling before running npm install.

## CI gates

- unicode hygiene (`npm run check:unicode` -- no em dashes, smart
  quotes, decorative Unicode per workspace CLAUDE.md, plus a scan for
  the names of systems Catena stopped shipping)
- voice (`npm run check:voice` -- the documentation does not address a
  reader; `scripts/voice-debt.txt` lists the pages not yet converted)
- comment prose (`npm run check:prose` -- comments describe the code as
  it stands, with its history in the commit message)
- Astro typecheck + Starlight build (catches broken internal links)

The first and third live in catenahq/contracts and run from the sibling
checkout, so this repo holds no copy of either. What it owns is the debt
lists: `.github/prose-debt.txt` here, `scripts/voice-debt.txt` for
voice. An entry in either that has become clean FAILS the gate and must
be deleted.
