# packages/tools/brand

Catena design tokens (colors, typography, spacing, breakpoints).
Single source of truth, synced into each catena app's
`src/styles/brand/` at prebuild time by [packages/tools/sync-brand.mjs](../sync-brand.mjs).
The synced output is gitignored on the app side.

This is a project-internal asset directory, NOT an npm package. No
`package.json`, no `@catena/brand` import path. Apps reference the
synced location via plain relative paths.

## Layout

```
tokens/
  colors.css       :root color palette (accent + neutrals + status)
  typography.css   font stacks, type scale, line heights, weights
  spacing.css      4px-grid spacing, radii, shadows, content widths
  all.css          single-import entry that pulls in the three above
src/
  index.js         JS exports: breakpoints map, accent, baseFontSize
  breakpoints.js   breakpoints + minWidth() helper for matchMedia
test.js            standalone smoke test (run with `node packages/tools/brand/test.js`)
```

## Use in a catena app

App's `package.json`:

```json
{
  "scripts": {
    "prebuild": "node ../../packages/tools/sync-brand.mjs ./src/styles/brand"
  }
}
```

App's `.gitignore`:

```
src/styles/brand/
```

App's CSS (e.g. `src/styles/global.css`):

```css
@import "./brand/tokens/all.css";
```

App's JS (if needed):

```js
import { breakpoints, minWidth, accent } from "./styles/brand/index.js";
```

## Swap the accent color

The whole palette derives from `--catena-accent`. Override that one
variable in `:root` to rebrand a fork. The neutrals stay neutral;
surface/link/info derive from `--catena-primary-500` (which equals
`--catena-accent`). For a fully custom palette, override
`--catena-primary-50` through `-900` explicitly. Status colors
(success/warning/danger) deliberately don't follow the accent.

## Add a token

- New color, semantic surface, status color: `tokens/colors.css`.
- New font, size, weight, line-height: `tokens/typography.css`.
- New spacing step, radius, shadow, max-width: `tokens/spacing.css`.

Naming: `--catena-<group>-<name>`. Keep t-shirt sizing
(`xs`/`sm`/`md`/`lg`/`xl`) for type scale + radii; numeric 4px-grid
scale for spacing. Question every new token before adding it.

## Don't add

- Components (this is tokens-only).
- App-specific tokens (the Stripe blue for an upgrade button is the
  app's concern).
- Logos / SVG assets (would belong in a separate `packages/tools/assets/`
  directory; not yet needed).
