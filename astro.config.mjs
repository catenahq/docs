import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightLinksValidator from "starlight-links-validator";
import { fileURLToPath } from "node:url";

// docs.catena.run -- public client docs.
//
// Content lives under src/content/docs/en/ (EN) and
// src/content/docs/fr/ (FR). Every locale is prefixed (/en/, /fr/); a
// bare / request lands on src/pages/index.astro, which redirects by
// browser language. Starlight handles the sidebar nav + EN/FR routing
// automatically.
//
// Deployment: standalone Astro build (`npm run build` -> `dist/`)
// published to GitHub Pages by .github/workflows/deploy-pages.yml on
// push to main. No chained-build coupling with the marketing site.
export default defineConfig({
  site: "https://docs.catena.run",
  trailingSlash: "ignore",
  integrations: [
    starlight({
      title: "catena docs",
      // We ship our own src/pages/404.astro (a language-neutral splash
      // that links into /en/ and /fr/). Disable Starlight's built-in
      // /404 route so the two don't collide.
      disable404Route: true,
      editLink: {
        // "Suggest edit" link in every page footer; opens the file
        // on GitHub on the active branch (dev = default; main is the
        // protected deploy branch).
        baseUrl: "https://github.com/catenahq/docs/edit/dev/",
      },
      plugins: [
        starlightLinksValidator({
          // Provider-installation screenshots land later (see backlog).
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
        SiteTitle: "./src/components/SiteTitle.astro",
      },
      customCss: ["./src/styles/global.css"],
      head: [
        {
          tag: "script",
          attrs: { src: "/domain-rewriter.js", defer: true },
        },
        {
          // Remember the language the visitor is reading (reads
          // <html lang>) so the nginx redirect at / honours it later.
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
            { slug: "guides/communications-platforms" },
            { slug: "guides/email-providers" },
            { slug: "guides/provider-accounts" },
            { slug: "guides/dns-hardening" },
          ],
        },
        {
          label: "Day-to-day",
          translations: { fr: "Au quotidien" },
          items: [
            { slug: "how-to-add-users" },
            { slug: "how-to-deploy-apps" },
            { slug: "self-service" },
          ],
        },
        {
          label: "Disaster handling",
          translations: { fr: "Sinistres" },
          items: [
            { slug: "disaster-prevention" },
            { slug: "disaster-recovery" },
            { slug: "self-restore" },
            { slug: "email-archive" },
          ],
        },
        {
          label: "Reference",
          translations: { fr: "Référence" },
          items: [
            { slug: "do-not-touch" },
            { slug: "sizing" },
            { slug: "how-to-pick-a-scheduler" },
            { slug: "nextcloud-apps-vs-suite" },
          ],
        },
        {
          label: "Apps",
          translations: { fr: "Applications" },
          collapsed: true,
          // Starlight 0.39 requires `autogenerate` to live INSIDE an
          // `items` array on a sidebar group. The legacy top-level
          // `autogenerate` shape (still accepted in 0.38) was removed.
          // This nested form is the canonical schema documented for
          // 0.38 and 0.39, so it works on both.
          items: [{ autogenerate: { directory: "apps" } }],
        },
      ],
    }),
  ],
  vite: {
    // The sibling `../contracts/` checkout holds brand assets (the
    // Conthrax .otf, logo.svg) that `@catenahq/contracts` imports via
    // src/styles/global.css. npm symlinks it into node_modules but
    // Vite's dev fs-allow-list resolves through the symlink to the REAL
    // path and rejects it as outside the project root, throwing "outside
    // of Vite serving allow list" for the .otf/.svg request. Allow the
    // sibling explicitly. See CLAUDE.md "Brand assets (sibling read)".
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
