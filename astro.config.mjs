import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightLinksValidator from "starlight-links-validator";

// docs.catena.run -- public client docs.
//
// Content lives under src/content/docs/{en,fr}/. Starlight handles
// the sidebar nav + EN/FR routing automatically.
//
// Deployment: standalone Astro build (`npm run build` -> `dist/`)
// served by nginx via Dockerfile + dokploy.compose.yml at the root
// of its own subdomain. No chained-build coupling with the marketing
// site.
export default defineConfig({
  site: "https://docs.catena.run",
  trailingSlash: "ignore",
  integrations: [
    starlight({
      title: "catena docs",
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
      defaultLocale: "root",
      locales: {
        root: { label: "Français", lang: "fr" },
        en: { label: "English", lang: "en" },
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
});
