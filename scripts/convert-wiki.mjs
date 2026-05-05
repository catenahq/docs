#!/usr/bin/env node
// Convert apps/docs/wiki/src/*.md.j2 -> apps/docs/src/content/docs/**/*.md.
//
// The wiki was Jinja-rendered per VPS. The new docs site is a single
// static set; the canonical placeholder for the client zone is
// `yourdomain.com`. This script strips the small number of Jinja
// substitutions used by the wiki and emits Starlight-ready markdown
// with frontmatter derived from the H1.
//
// Usage:
//   node apps/docs/scripts/convert-wiki.mjs           # convert + write
//   node apps/docs/scripts/convert-wiki.mjs --check   # fail if any
//                                                       output would
//                                                       still contain
//                                                       Jinja

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(here, "..");
const wikiSrc = join(docsRoot, "wiki", "src");
const contentRoot = join(docsRoot, "src", "content", "docs");

const checkOnly = process.argv.includes("--check");

// Flat substitutions. Keep narrow -- if a wiki page references
// something not in this map, we want a hard failure rather than a
// silently-leaked Jinja braces.
const SUBS = [
  // Jinja escapes for emitting Go-template syntax (e.g. docker ps
  // --format '{{.Names}}'). In wiki sources these are written as
  // `{{ "{{" }}` and `{{ "}}" }}` to bypass Jinja's own delimiters.
  // After conversion they're plain literal text.
  [/\{\{\s*"\{\{"\s*\}\}/g, "{{"],
  [/\{\{\s*"\}\}"\s*\}\}/g, "}}"],
  // Canonical placeholder for the client domain.
  [/\{\{\s*cloudflare_zone\s*\}\}/g, "yourdomain.com"],
  // Per-service hostnames -- map to the matching subdomain pattern.
  [/\{\{\s*healthchecks_hostname\s*\}\}/g, "checks.yourdomain.com"],
  [/\{\{\s*dokploy_admin_hostname\s*\}\}/g, "admin.yourdomain.com"],
  [/\{\{\s*keycloak_hostname\s*\}\}/g, "auth.yourdomain.com"],
  [/\{\{\s*gatus_hostname\s*\}\}/g, "monitor.yourdomain.com"],
  [/\{\{\s*olivetin_hostname\s*\}\}/g, "actions.yourdomain.com"],
  [/\{\{\s*homepage_hostname\s*\}\}/g, "dash.yourdomain.com"],
  [/\{\{\s*infrastructure_monitor_hostname\s*\}\}/g, "monitor.yourdomain.com"],
  [/\{\{\s*infrastructure_dash_hostname\s*\}\}/g, "dash.yourdomain.com"],
  [/\{\{\s*infrastructure_actions_hostname\s*\}\}/g, "actions.yourdomain.com"],
  [/\{\{\s*vps_docs_hostname\s*\}\}/g, "docs.yourdomain.com"],
  [/\{\{\s*recovery_hostname\s*\}\}/g, "recovery.yourdomain.com"],
  [/\{\{\s*nextcloud_hostname\s*\}\}/g, "nextcloud.yourdomain.com"],
  [/\{\{\s*outline_hostname\s*\}\}/g, "wiki.yourdomain.com"],
  [/\{\{\s*rocketchat_hostname\s*\}\}/g, "chat.yourdomain.com"],
  [/\{\{\s*espocrm_hostname\s*\}\}/g, "crm.yourdomain.com"],
  // Realm names in Keycloak instructions -- `catena` is the standard.
  [/\{\{\s*keycloak_realm\s*\}\}/g, "catena"],
  // Vault secrets -- public docs show a placeholder, never a real
  // value. Match any `vault_*` Jinja var generically.
  [/\{\{\s*vault_([a-zA-Z0-9_]+)\s*\}\}/g, "<your-$1>"],
  // The hostname/inventory name is operator-side; for end-user docs,
  // the right phrasing is generic.
  [/\{\{\s*inventory_hostname\s*\}\}/g, "your VPS"],
];

// 12 top-level scaffold pages. The wiki-source `index.md.j2` is
// per-VPS-flavored (auto-generated framing + your-zone hostnames);
// we keep a hand-written generic public index in place and skip it
// here. The 16 catalog pages live under wiki/src/catalog/ and emit
// to apps/docs/src/content/docs/apps/.
const TOP_LEVEL_SLUGS = [
  "how-this-stack-works",
  "where-is-my-data",
  "do-not-touch",
  "how-to-add-users",
  "how-to-deploy-apps",
  "self-service",
  "disaster-prevention",
  "disaster-recovery",
  "self-restore",
  "sizing",
  "how-to-add-second-backup-bucket",
];

function frontmatterFrom(body, slug) {
  // Strip the leading H1 and use it as the title. If the file already
  // has frontmatter (from a previous run), leave it alone.
  if (body.startsWith("---\n")) return body;
  const lines = body.split("\n");
  let title = slug;
  let descLine = "";
  let bodyStart = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("# ")) {
      title = line.slice(2).trim();
      bodyStart = i + 1;
      // Skip the blank line right after the H1, if any.
      if (lines[bodyStart] === "") bodyStart++;
      break;
    }
  }
  // Use the first non-empty paragraph as the description (one line).
  for (let i = bodyStart; i < lines.length; i++) {
    if (lines[i].trim() === "") continue;
    if (lines[i].startsWith("#")) break;
    if (lines[i].startsWith(">")) continue;
    descLine = lines[i].trim();
    break;
  }
  // Truncate description to ~160 chars on a sentence boundary.
  if (descLine.length > 160) {
    const cut = descLine.lastIndexOf(".", 160);
    descLine = (cut > 80 ? descLine.slice(0, cut + 1) : descLine.slice(0, 157) + "...").trim();
  }
  // Escape double quotes for YAML.
  const yamlTitle = title.replace(/"/g, '\\"');
  const yamlDesc = descLine.replace(/"/g, '\\"');
  const fm = `---\ntitle: "${yamlTitle}"\ndescription: "${yamlDesc}"\n---\n\n`;
  return fm + lines.slice(bodyStart).join("\n");
}

function convertFile(srcPath, destPath, slug) {
  let body = readFileSync(srcPath, "utf8");
  // Strip Jinja default filters first: `{{ var | default(...) }}`
  // collapses to `{{ var }}` so the SUBS map can match the bare
  // identifier. The default value is dropped -- the canonical
  // hostname is whatever SUBS maps the var to.
  body = body.replace(/\{\{\s*([a-zA-Z_]+)\s*\|\s*default\([^)]*\)\s*\}\}/g, "{{ $1 }}");
  for (const [re, rep] of SUBS) body = body.replace(re, rep);
  // Convert raw .md links (file references) to slug links the way
  // Starlight expects. wiki source uses `disaster-prevention.md`;
  // Starlight wants either a slug like `/disaster-prevention/` or a
  // relative `./disaster-prevention/`.
  body = body.replace(/\(([a-z0-9-]+)\.md(#[^)]+)?\)/g, (_, name, hash) => {
    return `(/${name}/${hash ?? ""})`;
  });
  // Also rewrite catalog links: `catalog/foo.md` -> `/apps/foo/`.
  body = body.replace(/\(catalog\/([a-z0-9-]+)\.md(#[^)]+)?\)/g, (_, name, hash) => {
    return `(/apps/${name}/${hash ?? ""})`;
  });

  // Detect any remaining Jinja and fail loudly. Match only the
  // whitespace-bracketed form ({{ var }}, {% block %}) so plain
  // Go-template syntax in code blocks ({{.Names}}, no leading space)
  // doesn't trip the check.
  const leftover = body.match(/\{\{\s+\S[^}]*\}\}|\{%[^%]+%\}/);
  if (leftover) {
    throw new Error(`${srcPath}: leftover Jinja: ${leftover[0]}`);
  }

  body = frontmatterFrom(body, slug);

  if (checkOnly) {
    const existing = readFileSync(destPath, "utf8");
    if (existing !== body) {
      throw new Error(`${destPath}: out of sync with ${srcPath}`);
    }
    return;
  }
  mkdirSync(dirname(destPath), { recursive: true });
  writeFileSync(destPath, body);
  console.log(`wrote ${destPath}`);
}

function processTopLevel() {
  for (const slug of TOP_LEVEL_SLUGS) {
    // EN
    const en = join(wikiSrc, `${slug}.md.j2`);
    convertFile(en, join(contentRoot, `${slug}.md`), slug);
    // FR
    const fr = join(wikiSrc, `${slug}.fr.md.j2`);
    convertFile(fr, join(contentRoot, "fr", `${slug}.md`), slug);
  }
}

function processCatalog() {
  const catalogSrc = join(wikiSrc, "catalog");
  const slugs = readdirSync(catalogSrc)
    .filter((f) => f.endsWith(".md.j2") && !f.includes(".fr."))
    .map((f) => f.replace(".md.j2", ""))
    .filter((s) => s !== "index");
  for (const slug of slugs) {
    const en = join(catalogSrc, `${slug}.md.j2`);
    convertFile(en, join(contentRoot, "apps", `${slug}.md`), slug);
    const fr = join(catalogSrc, `${slug}.fr.md.j2`);
    convertFile(fr, join(contentRoot, "fr", "apps", `${slug}.md`), slug);
  }
  // Catalog index too.
  convertFile(
    join(catalogSrc, "index.md.j2"),
    join(contentRoot, "apps", "index.md"),
    "apps",
  );
  convertFile(
    join(catalogSrc, "index.fr.md.j2"),
    join(contentRoot, "fr", "apps", "index.md"),
    "apps",
  );
}

processTopLevel();
processCatalog();
