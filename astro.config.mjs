import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightLinksValidator from "starlight-links-validator";

// catena.run/docs -- public client docs.
//
// Content lives under src/content/docs/{en,fr}/. Starlight handles
// the sidebar nav + EN/FR routing automatically.
//
// Deployment: this is a sub-build of apps/website. The website
// build script chains `astro build` here with base="/docs", then
// copies dist/* into apps/website/dist/docs/ so a single nginx
// container serves both surfaces. There is no standalone deploy.
export default defineConfig({
  site: "https://catena.run",
  base: "/docs",
  trailingSlash: "ignore",
  integrations: [
    starlight({
      title: "catena docs",
      plugins: [
        starlightLinksValidator({
          // Provider-installation screenshots land later (see backlog).
          // Until then, exclude the directory rather than maintain a
          // file-by-file ignore list.
          exclude: ["/img/guides/provider-accounts/**"],
        }),
      ],
      lastUpdated: true,
      logo: { src: "./src/assets/logo.svg", replacesTitle: false },
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
          attrs: { src: "/docs/domain-rewriter.js", defer: true },
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
          autogenerate: { directory: "apps" },
          collapsed: true,
        },
      ],
    }),
  ],
});
