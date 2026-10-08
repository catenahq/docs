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

## Site layout

The sidebar follows the panel: a home page, one page per capability
under `features/`, `installation`, one page per panel setting under
`configuration/`, and `configure-apps` for the labels an app carries.
`astro.config.mjs` maps the addresses of removed pages to the page
that covers their subject, so outside links keep resolving.

A long code example used by both locales lives once in `src/examples/`
and is rendered with Starlight's `Code` component from an `.mdx` page,
so the duplication gate never sees two copies.

Per-application documentation does not live here. Each template carries
its own README beside its compose file, in its
catenahq/catena-templates blueprint directory, which is also what a
client's Portainer shows in the entry's detail panel.

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

## CI gates

- unicode hygiene (`npm run check:unicode` -- no em dashes, smart
  quotes, decorative Unicode per workspace CLAUDE.md, plus a scan for
  the names of systems Catena stopped shipping)
- voice (`npm run check:voice` -- the documentation does not address a
  reader and names no product version, with placeholder versions allowed
  in examples; `scripts/voice-debt.txt` lists the pages not yet converted
  to the voice rule)
- comment prose (`npm run check:prose` -- comments describe the code as
  it stands, with its history in the commit message)
- Astro typecheck + Starlight build (catches broken internal links)

The first and third live in catenahq/contracts and run from the sibling
checkout, so this repo holds no copy of either. What it owns is the debt
lists: `.github/prose-debt.txt` here, `scripts/voice-debt.txt` for
voice. An entry in either that has become clean FAILS the gate and must
be deleted.
