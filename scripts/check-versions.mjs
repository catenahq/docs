#!/usr/bin/env node
// Version gate: the client documentation names no product version.
//
// A version number in documentation is out of date at the next release. A
// page names the property the reader needs instead, and an illustrative
// example uses one of the placeholders in VERSION_RULE.allow. The rule
// matches three-part numbers (2.12.3, v2.12.3): a two-part number reads the
// same as a decimal ("1.5 GB"), and a fourth part makes an IP address.
// Letter forms (x.y.z, X.Y.Z) never match.
//
// SCOPE. Prose only. Fenced code blocks, inline code spans, link
// destinations and bare URLs are skipped: a version inside a command or an
// address is part of what the example says to copy. Link text, frontmatter
// titles and descriptions are prose and are scanned.
//
// Wired as `npm run check:versions` and a CI step.

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

// allow: a pinned version and its patch, minor and major bumps.
const VERSION_RULE = {
  re: /(?<![\d.])\d+\.\d+\.\d+(?!\.?\d)/g,
  allow: new Set(["1.2.3", "1.2.4", "1.2.9", "1.3.0", "1.9.0", "2.0.0"]),
};

const CONTENT_PREFIX = "src/content/docs/";

// Strip fenced blocks and inline spans, preserving line numbering so a
// finding still points at the line it is on.
function stripCode(text) {
  let fenced = false;
  return text.split("\n").map((line) => {
    if (/^\s*(```|~~~)/.test(line)) {
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

const files = execSync("git ls-files", { encoding: "utf-8" })
  .trim()
  .split("\n")
  .filter((f) => f.startsWith(CONTENT_PREFIX) && /\.mdx?$/.test(f));

const findings = [];
for (const file of files) {
  stripCode(readFileSync(file, "utf-8")).forEach((line, idx) => {
    const versions = (line.match(VERSION_RULE.re) || []).filter(
      (v) => !VERSION_RULE.allow.has(v),
    );
    if (versions.length) {
      findings.push(`${file}:${idx + 1}: ${[...new Set(versions)].join(", ")}\n    ${line.trim().slice(0, 110)}`);
    }
  });
}

if (findings.length) {
  console.error("Documentation names a product version:");
  console.error("");
  for (const f of findings) console.error("  " + f);
  console.error("");
  console.error(`Total: ${findings.length} line(s).`);
  console.error(
    "A version is out of date at the next release. Name the property the " +
      "reader needs, or use a placeholder: " + [...VERSION_RULE.allow].join(", ") + ".",
  );
  process.exit(1);
}

console.log(`Versions: clean (${files.length} page(s) scanned).`);
