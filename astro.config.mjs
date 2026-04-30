import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// docs.catena.run -- public client docs.
//
// Content lives under src/content/docs/{en,fr}/. Starlight handles
// the sidebar nav + EN/FR routing automatically.
//
// On-VPS deployment: the same static dist/ ships as a release
// tarball (build with `npm run build`, package as
// catena-docs-<version>.tar.gz, attach to a `docs-v<version>` GitHub
// release). The Ansible vps_docs role downloads the pinned tarball
// per `catena_docs_version` instead of templating Jinja per-host.
export default defineConfig({
  site: "https://docs.catena.run",
  trailingSlash: "ignore",
  integrations: [
    starlight({
      title: "catena docs",
      logo: { src: "./src/assets/logo.svg", replacesTitle: false },
      defaultLocale: "en",
      locales: {
        en: { label: "English", lang: "en" },
        fr: { label: "Français", lang: "fr" },
      },
      customCss: ["./src/styles/global.css"],
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
      ],
    }),
  ],
});
