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
export default defineConfig({
  site: "https://docs.catena.run",
  trailingSlash: "ignore",
  fonts: [inter(fontProviders)],
  integrations: [
    starlight({
      title: "catena docs",
      editLink: {
        // "Suggest edit" link in every page footer; opens the file
        // on GitHub on the repo's default branch.
        baseUrl: "https://github.com/catenahq/docs/edit/HEAD/",
      },
      plugins: [
        starlightLinksValidator({
          // Provider-installation screenshots land later (see
          // ops/BACKLOG_TECHNICAL.md, "starlight-image-zoom plugin").
          // Until then, exclude the directory rather than maintain a
          // file-by-file ignore list.
          exclude: ["/img/guides/provider-accounts/**"],
        }),
      ],
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
        {
          label: "Start here",
          translations: { fr: "Commencer ici" },
          items: [
            { slug: "index" },
            { slug: "how-this-stack-works" },
            { slug: "where-is-my-data" },
          ],
        },
        {
          label: "Setup guides",
          translations: { fr: "Guides de configuration" },
          items: [
            { slug: "guides/provider-accounts" },
          ],
        },
        {
          label: "Day-to-day",
          translations: { fr: "Au quotidien" },
          items: [
            { slug: "manage-users-and-roles" },
            { slug: "manage-apps" },
            { slug: "self-service" },
            { slug: "subscribe-and-activate" },
          ],
        },
        {
          label: "Tasks",
          translations: { fr: "Tâches" },
          items: [
            { slug: "disaster-prevention" },
            { slug: "disaster-recovery" },
            { slug: "restore-data" },
            { slug: "self-restore" },
            { slug: "move-server" },
          ],
        },
        {
          label: "Trust",
          translations: { fr: "Confiance" },
          items: [
            { slug: "leaving" },
          ],
        },
        {
          label: "Reference",
          translations: { fr: "Référence" },
          items: [
            { slug: "do-not-touch" },
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
