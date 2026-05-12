#!/usr/bin/env node
// tools/sync-brand.mjs
//
// Copies tools/brand/{tokens,src} into a target directory inside an
// app, so the app can build standalone (no monorepo workspace deps,
// no path traversals out of the app folder). Each catena app calls
// this from a `prebuild` script:
//
//   "prebuild": "node ../../tools/sync-brand.mjs ./src/styles/brand"
//
// The target is gitignored on the app side; this script seeds it.
// Idempotent: re-running mirrors the source tree, replacing any
// stale files. Files in target that no longer exist in source are
// removed.
//
// Used only by catena's own apps. Client repos shipped via the
// Dokploy webapp-from-github flow do NOT call this and do NOT
// depend on tools/brand/.

import { mkdir, readdir, copyFile, stat, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = resolve(HERE, "brand");

const target = process.argv[2];
if (!target) {
  console.error("usage: node tools/sync-brand.mjs <target-dir>");
  process.exit(2);
}
const TARGET = resolve(process.cwd(), target);

async function listAll(root) {
  const out = [];
  async function walk(dir) {
    for (const name of await readdir(dir)) {
      const p = join(dir, name);
      const st = await stat(p);
      if (st.isDirectory()) await walk(p);
      else out.push(p);
    }
  }
  if (existsSync(root)) await walk(root);
  return out;
}

const sourceFiles = await listAll(SOURCE);
const wanted = new Set();

for (const src of sourceFiles) {
  const rel = relative(SOURCE, src);
  if (rel === "test.js" || rel === "README.md") continue;
  const dst = join(TARGET, rel);
  wanted.add(dst);
  await mkdir(dirname(dst), { recursive: true });
  await copyFile(src, dst);
}

// Drop any stale files in TARGET that no longer match the source.
const targetFiles = await listAll(TARGET);
for (const t of targetFiles) {
  if (!wanted.has(t)) await rm(t);
}

console.log(`brand: synced ${wanted.size} file(s) -> ${relative(process.cwd(), TARGET)}`);
