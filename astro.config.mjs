import { defineConfig, fontProviders } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightLinksValidator from "starlight-links-validator";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { inter } from "@catenahq/contracts/brand/fonts.mjs";

// docs.catena.run -- public client docs.
//
// Content lives under src/content/docs/en/ (EN) and
// src/content/docs/fr/ (FR). Every locale is prefixed (/en/, /fr/); a
// bare / request lands on src/pages/index.astro, which redirects by
// browser language. Starlight handles the sidebar nav + EN/FR routing
// automatically.
//
// Styling: Starlight's theme, mapped onto the brand tokens, with Tailwind
// CSS and the brand theme the website uses (src/styles/global.css), and
// Inter self-hosted through the Fonts API with the website's entry. The
// header's site title and selects are restyled to match catena.run.
//
// Deployment: standalone Astro build (`npm run build` -> `dist/`)
// published to GitHub Pages by .github/workflows/deploy-pages.yml on
// push to main. No chained-build coupling with the marketing site.
// Addresses that outside links still use, each mapped to the page that
// covers its subject, in both locales.
const formerPages = {
  "how-this-stack-works": "",
  "where-is-my-data": "features/backup-restore-migrate/",
  "leaving": "features/backup-restore-migrate/",
  "guides/provider-accounts": "configuration/",
  "self-service": "features/admin-dashboard/",
  "subscribe-and-activate": "configuration/subscription/",
  "manage-users-and-roles": "configuration/sign-in-and-people/",
  "manage-apps": "configure-apps/",
  "disaster-prevention": "configuration/backups/",
  "disaster-recovery": "configuration/restore-and-migrate/",
  "restore-data": "configuration/restore-and-migrate/",
  "self-restore": "configuration/restore-and-migrate/",
  "move-server": "configuration/restore-and-migrate/",
  "do-not-touch": "configuration/server/",
  "sizing": "installation/",
  "loi25-client-onboarding": "",
};

export default defineConfig({
  site: "https://docs.catena.run",
  trailingSlash: "ignore",
  redirects: Object.fromEntries(
    ["en", "fr"].flatMap((locale) =>
      Object.entries(formerPages).map(([from, to]) => [`/${locale}/${from}`, `/${locale}/${to}`]),
    ),
  ),
  fonts: [inter(fontProviders)],
  integrations: [
    starlight({
      title: "catena docs",
      editLink: {
        // "Suggest edit" link in every page footer; opens the file
        // on GitHub on the repo's default branch.
        baseUrl: "https://github.com/catenahq/docs/edit/HEAD/",
      },
      plugins: [starlightLinksValidator()],
      lastUpdated: true,
      defaultLocale: "en",
      locales: {
        en: { label: "English", lang: "en" },
        fr: { label: "Français", lang: "fr" },
      },
      components: {
        Head: "./src/components/Head.astro",
        SiteTitle: "./src/components/SiteTitle.astro",
        ThemeSelect: "./src/components/ThemeSelect.astro",
        LanguageSelect: "./src/components/LanguageSelect.astro",
      },
      customCss: [
        "@catenahq/contracts/brand/tokens/all.css",
        "@catenahq/contracts/brand/wordmark/conthrax.css",
        "./src/styles/global.css",
      ],
      head: [
        {
          // Remember the language the visitor is reading (reads
          // <html lang>) so the redirect at / (src/pages/index.astro)
          // honours it later.
          tag: "script",
          attrs: { src: "/lang-cookie.js", defer: true },
        },
      ],
      sidebar: [
        { slug: "index" },
        {
          label: "Features",
          translations: { fr: "Fonctionnalités" },
          items: [
            { slug: "features/secure-connections" },
            { slug: "features/backup-restore-migrate" },
            { slug: "features/single-sign-on" },
            { slug: "features/safe-updates" },
            { slug: "features/admin-dashboard" },
            { slug: "features/monitoring-alerts" },
          ],
        },
        { slug: "installation" },
        {
          label: "Configuration",
          translations: { fr: "Configuration" },
          items: [
            { slug: "configuration" },
            { slug: "configuration/subscription" },
            { slug: "configuration/domain" },
            { slug: "configuration/admin-access" },
            { slug: "configuration/backups" },
            { slug: "configuration/schedules" },
            { slug: "configuration/restore-and-migrate" },
            { slug: "configuration/email" },
            { slug: "configuration/sign-in-and-people" },
            { slug: "configuration/alerts" },
            { slug: "configuration/server" },
            { slug: "configuration/updates" },
            { slug: "configuration/vulnerabilities" },
          ],
        },
        {
          label: "Apps",
          translations: { fr: "Applications" },
          items: [
            { slug: "configure-apps" },
          ],
        },
      ],
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    // The sibling `../contracts/` checkout holds brand assets (the
    // Conthrax .otf, logo.svg) that `@catenahq/contracts` serves through
    // customCss and SiteTitle.astro. npm symlinks it into node_modules but
    // Vite's dev fs-allow-list resolves through the symlink to the REAL
    // path and rejects it as outside the project root, throwing "outside
    // of Vite serving allow list" for the .otf/.svg request. Allow the
    // sibling explicitly. See AGENTS.md "Brand assets (sibling read)".
    server: {
      fs: {
        allow: [
          fileURLToPath(new URL(".", import.meta.url)),
          fileURLToPath(new URL("../contracts", import.meta.url)),
        ],
      },
    },
  },
});
