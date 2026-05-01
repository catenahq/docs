#!/usr/bin/env node
/* apps/docs/scripts/docs-snapshot.mjs
 *
 * Renders docs.catena.run (running locally on the URL passed in)
 * as a single-file HTML bundle + PDF for the offline-distribution
 * artifacts. Used by .github/workflows/docs-release.yml.
 *
 * Single-file HTML: visits each page in the sitemap, inlines its
 * body into one big document with anchor links between sections.
 * No JS evaluated -- the bundle is meant to be opened locally
 * without a server.
 *
 * PDF: same set of pages, rendered through Playwright's
 * page.pdf().
 *
 * Run:
 *   node apps/docs/scripts/docs-snapshot.mjs <base-url> --html <out.html> --pdf <out.pdf>
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { argv } from "node:process";

function usage() {
  console.error("Usage: docs-snapshot.mjs <base-url> --html <out.html> --pdf <out.pdf>");
  process.exit(1);
}

const args = argv.slice(2);
if (args.length < 5) usage();
const baseUrl = args[0].replace(/\/$/, "");
const htmlIdx = args.indexOf("--html");
const pdfIdx = args.indexOf("--pdf");
if (htmlIdx < 0 || pdfIdx < 0) usage();
const htmlOut = args[htmlIdx + 1];
const pdfOut = args[pdfIdx + 1];

async function fetchSitemapUrls(browser) {
  const page = await browser.newPage();
  await page.goto(`${baseUrl}/sitemap-index.xml`);
  const xml = await page.content();
  await page.close();
  // Each <loc> in the sitemap. Strip the host prefix to get site-relative paths.
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  // Normalise to base-relative.
  return matches.map((u) => {
    try {
      return new URL(u).pathname;
    } catch {
      return u;
    }
  });
}

async function renderSingleFile(browser, paths) {
  const sections = [];
  for (const p of paths) {
    const page = await browser.newPage();
    await page.goto(`${baseUrl}${p}`, { waitUntil: "networkidle" });
    const body = await page.evaluate(() => {
      const main = document.querySelector("main");
      return main ? main.innerHTML : document.body.innerHTML;
    });
    const title = await page.title();
    const anchor = p.replace(/[^a-zA-Z0-9]/g, "-");
    sections.push(
      `<section id="${anchor}"><h1>${title}</h1><p class="path"><code>${p}</code></p>${body}</section>`,
    );
    await page.close();
  }
  const toc = paths
    .map((p, i) => {
      const anchor = p.replace(/[^a-zA-Z0-9]/g, "-");
      return `<li><a href="#${anchor}">${p}</a></li>`;
    })
    .join("\n");
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>catena docs (offline bundle)</title>
<style>
body { font-family: system-ui, -apple-system, sans-serif; max-width: 65ch; margin: 0 auto; padding: 2rem; line-height: 1.6; color: #232830; }
section { padding: 2rem 0; border-top: 1px solid #d9dde3; }
section:first-of-type { border-top: 0; }
h1 { color: #1e5fb6; }
.path code { color: #6b7484; font-size: 0.9em; }
nav.toc { background: #f7f8fa; padding: 1rem 1.5rem; border-radius: 8px; margin-bottom: 2rem; }
a { color: #1e5fb6; }
pre { background: #131720; color: #eef0f3; padding: 1rem; border-radius: 6px; overflow-x: auto; }
code { font-family: ui-monospace, SFMono-Regular, monospace; }
img { max-width: 100%; }
</style>
</head>
<body>
<h1>catena docs (offline bundle)</h1>
<p>Generated ${new Date().toISOString()} from ${baseUrl}.</p>
<nav class="toc"><strong>Table of contents</strong><ol>${toc}</ol></nav>
${sections.join("\n")}
</body></html>`;
  writeFileSync(htmlOut, html, "utf8");
}

async function renderPdf(browser, paths) {
  const page = await browser.newPage();
  // Same single-file HTML rendered into PDF -- avoids Playwright
  // issuing 25 separate page.pdf() calls + concat.
  await page.goto(`file://${process.cwd()}/${htmlOut}`);
  await page.pdf({
    path: pdfOut,
    format: "A4",
    margin: { top: "1in", bottom: "1in", left: "0.75in", right: "0.75in" },
    printBackground: true,
  });
  await page.close();
}

(async () => {
  const browser = await chromium.launch();
  try {
    const paths = await fetchSitemapUrls(browser);
    paths.sort();
    console.log(`docs-snapshot: rendering ${paths.length} page(s)`);
    await renderSingleFile(browser, paths);
    await renderPdf(browser, paths);
    console.log(`docs-snapshot: wrote ${htmlOut} + ${pdfOut}`);
  } finally {
    await browser.close();
  }
})();
