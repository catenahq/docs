import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

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
  i18n: {
    locales: ["en", "fr"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  integrations: [
    starlight({
      title: "catena docs",
      logo: { src: "./src/assets/logo.svg", replacesTitle: false },
      customCss: ["./src/styles/global.css"],
      head: [
        {
          tag: "script",
          attrs: { src: "/docs/domain-rewriter.js", defer: true },
        },
      ],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/ma-lalonde/catena",
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
          ],
        },
        {
          label: "Reference",
          translations: { fr: "Référence" },
          items: [
            { slug: "do-not-touch" },
            { slug: "sizing" },
            { slug: "how-to-add-second-backup-bucket" },
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
