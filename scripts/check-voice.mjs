#!/usr/bin/env node
// Voice gate: the client documentation does not address a reader, and it
// names no product version.
//
// The rest of the codebase describes mechanism rather than instructing a
// person -- comments, commit messages, role docs -- and this gate holds the
// client pages to the same voice: no "you"/"your" in English, no
// "vous"/"votre" in French. Describe what the system does and how it is used.
//
//   "The token is entered in catena-admin > Settings"
//   not "enter your token in catena-admin > Settings"
//
// VERSIONS. A version number in documentation is out of date at the next
// release. A page names the property the reader needs instead, and an
// illustrative example uses one of the placeholders in VERSION_RULE.allow.
// The rule matches three-part numbers (2.12.3, v2.12.3): a two-part number
// reads the same as a decimal ("1.5 GB"), and a fourth part makes an IP
// address. Letter forms (x.y.z, X.Y.Z) never match.
//
// SCOPE. Prose only. Fenced code blocks and inline code spans are skipped:
// a placeholder like `your-domain.com` inside a command is part of an
// example, and rewriting it would change what the example says to copy.
// Link DESTINATIONS and bare URLs are skipped for the same reason -- an
// anchor like #ajoutez-un-second-compartiment is generated from the target
// page's heading, so it changes when that page is converted and not before.
// Link TEXT is prose and is scanned. So are frontmatter titles and
// descriptions.
//
// GENERATED PAGES ARE IN SCOPE. A generated page that fails the gate is
// still a page that fails it; the fix lands in the generator or its source
// data, and the entry in the debt file below says so.
//
// DEBT. scripts/voice-debt.txt lists the pages not yet converted to the voice
// rule, one path per line with a reason. A file in the list is allowed to
// address the reader; a file NOT in the list must be clean, and a listed file
// that is ALREADY clean fails too -- a stale exemption is how a gate quietly
// stops gating. The version rule applies to every page, listed or not.
//
// Wired as `npm run check:voice` and a CI step.

import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

const RULES = [
  { re: /\b(you|your|yours|yourself|yourselves|you'?re|you'?ve|you'?ll|you'?d)\b/gi,
    lang: "en", name: 'second person ("you"/"your")' },
  // (?<!rendez-) because "rendez-vous" is the French for appointment, and a
  // hyphen is a word boundary. It is a noun, not an address to the reader.
  { re: /\b(?<!rendez-)(vous|votre|vos|v[oô]tres?)\b/gi,
    lang: "fr", name: 'deuxieme personne ("vous"/"votre")' },
];

// allow: a pinned version and its patch, minor and major bumps.
const VERSION_RULE = {
  re: /(?<![\d.])\d+\.\d+\.\d+(?!\.?\d)/g,
  name: "product version",
  allow: new Set(["1.2.3", "1.2.4", "1.2.9", "1.3.0", "1.9.0", "2.0.0"]),
};

const DEBT_FILE = "scripts/voice-debt.txt";
const CONTENT_PREFIX = "src/content/docs/";

// Which rule applies where. A French page must not be scanned for "you"
// (it appears in no French sentence, but "Youtube" and product names do),
// and an English page must not be scanned for "vos" (a substring of nothing
// in English, but the reverse mistake is the expensive one).
function ruleFor(file) {
  if (file.startsWith(CONTENT_PREFIX + "fr/")) return RULES[1];
  if (file.startsWith(CONTENT_PREFIX + "en/")) return RULES[0];
  return null;
}

// Strip fenced blocks and inline spans, preserving line numbering so a
// finding still points at the line it is on.
function stripCode(text) {
  const lines = text.split("\n");
  let fenced = false;
  return lines.map((line) => {
    const fence = /^\s*(```|~~~)/.test(line);
    if (fence) {
      fenced = !fenced;
      return "";
    }
    if (fenced) return "";
    return line
      .replace(/`[^`]*`/g, "")
      // Link destination only; the bracketed text stays.
      .replace(/\]\([^)]*\)/g, "]")
      .replace(/https?:\/\/\S+/g, "");
  });
}

function readDebt() {
  if (!existsSync(DEBT_FILE)) return new Map();
  const entries = new Map();
  for (const raw of readFileSync(DEBT_FILE, "utf-8").split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const [path, ...reason] = line.split(/\s+--\s+/);
    entries.set(path.trim(), (reason.join(" -- ") || "").trim());
  }
  return entries;
}

function finding(file, idx, rule, hits, line) {
  const preview = line.trim().slice(0, 110);
  return `${file}:${idx + 1}: ${rule.name}: ${[...new Set(hits)].join(", ")}\n    ${preview}`;
}

function report(title, list, hint) {
  console.error(title);
  console.error("");
  for (const f of list) console.error("  " + f);
  console.error("");
  console.error(`Total: ${list.length} line(s).`);
  console.error(hint);
}

const debt = readDebt();
const files = execSync("git ls-files", { encoding: "utf-8" })
  .trim()
  .split("\n")
  .filter((f) => f.startsWith(CONTENT_PREFIX) && /\.mdx?$/.test(f));

const findings = [];
const versionFindings = [];
const dirty = new Set();

for (const file of files) {
  const rule = ruleFor(file);
  if (!rule) continue;

  let content;
  try {
    content = readFileSync(file, "utf-8");
  } catch {
    continue;
  }

  const lines = stripCode(content);
  lines.forEach((line, idx) => {
    const versions = (line.match(VERSION_RULE.re) || []).filter(
      (v) => !VERSION_RULE.allow.has(v),
    );
    if (versions.length) versionFindings.push(finding(file, idx, VERSION_RULE, versions, line));

    rule.re.lastIndex = 0;
    const hits = line.match(rule.re);
    if (!hits) return;
    dirty.add(file);
    if (debt.has(file)) return;
    findings.push(finding(file, idx, rule, hits, line));
  });
}

// A stale exemption is how a gate quietly stops gating: the page was
// converted, the line stayed, and the next regression on it is silent.
const stale = [...debt.keys()].filter((f) => !dirty.has(f));

if (findings.length || versionFindings.length || stale.length) {
  if (findings.length) {
    report(
      "Documentation addresses the reader (workspace voice rule):",
      findings,
      "Describe what the system does, not what the reader should do. " +
        "A page that cannot be converted yet goes in " + DEBT_FILE +
        " with the reason.",
    );
  }
  if (versionFindings.length) {
    if (findings.length) console.error("");
    report(
      "Documentation names a product version:",
      versionFindings,
      "A version is out of date at the next release. Name the property the " +
        "reader needs, or use a placeholder: " +
        [...VERSION_RULE.allow].join(", ") + ".",
    );
  }
  if (stale.length) {
    console.error("");
    console.error("Stale entries in " + DEBT_FILE + " (these pages are clean now):");
    for (const f of stale) console.error("  " + f);
    console.error("Delete them, or the gate stops gating those pages.");
  }
  process.exit(1);
}

console.log(`Voice and versions: clean (${files.length} page(s) scanned).`);
