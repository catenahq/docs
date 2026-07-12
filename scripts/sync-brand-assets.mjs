// Copies brand binaries from @catenahq/contracts into public/ so the
// browser can fetch them from fixed, predictable URLs that the
// bundler does not own (favicon, etc.).
//
// Runs on every `npm install` via the `postinstall` script in
// package.json. Idempotent. Safe to invoke manually as
// `npm run sync:brand`.
//
// CSS-imported binaries (the Conthrax @font-face, the Starlight
// logo) are NOT copied here -- they flow through Vite's asset
// pipeline and end up fingerprinted under dist/_astro/.

import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname } from "node:path";

const require = createRequire(import.meta.url);

const targets = [
  { from: "@catenahq/contracts/brand/assets/logo.svg", to: "public/favicon.svg" },
];

for (const { from, to } of targets) {
  const src = require.resolve(from);
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(src, to);
  console.log(`sync:brand  ${from}  ->  ${to}`);
}
