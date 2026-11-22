# catenahq/docs -- docs.catena.run

Astro + Starlight client wiki for the catena stack. Public-facing
docs (EN + FR), served at `docs.catena.run`.

Standalone build (`npm run build` -> `dist/`); deployed to GitHub
Pages via `.github/workflows/deploy-pages.yml` on push to `release`: the
deploy builds the site from the pushed commit. A merge into `main` does not
deploy. No chained-build coupling with the marketing site.

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

## Site layout

The sidebar follows the panel: a home page, one page per capability
under `features/`, `installation`, one page per panel setting under
`configuration/`, and `configure-apps` for the labels an app carries.
`astro.config.mjs` maps the addresses of removed pages to the page
that covers their subject, so outside links keep resolving.

A long code example used by both locales lives once in `src/examples/`
and is rendered with Starlight's `Code` component from an `.mdx` page,
so the duplication gate never sees two copies.

Per-application documentation does not live here. A catalog app's
description and setup steps are in its `app.json` in
catenahq/catena-templates (`blueprints/<id>/app.json`).

## The client's domain

Every page writes the client's domain as the literal
`yourdomain.com`.

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

## CI

`.github/workflows/ci.yml` calls the shared PR workflow of catenahq/contracts,
which reads `.github/checks.yml`. `ci/run <name>` runs one check, the same in CI
and on a workstation.

- the `gates` of the shared workflow: unicode hygiene (no em dashes, smart
  quotes, decorative Unicode, plus a scan for the names of systems Catena
  stopped shipping), repo rules, comment prose (comments describe the code as
  it stands, with its history in the commit message) and duplication
  (`.jscpd.json`)
- `site` (`bash ci/run site`): `npm ci`, versions (`npm run check:versions` --
  the documentation names no product version, with placeholder versions
  allowed in examples), Astro typecheck (`npm run check`) and the Starlight
  build (catches broken internal links)
- `scan`: the scanctl security scan, configured by `scanctl.yml` and
  `.scanctl/`

The gates live in catenahq/contracts and run from the sibling checkout, so
this repo holds no copy of them. What it owns is the prose debt list,
`.github/prose-debt.txt`. An entry that has become clean FAILS the gate and
must be deleted.
