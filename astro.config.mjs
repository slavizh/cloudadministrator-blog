import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import remarkBasePath from "./src/plugins/remark-base-path.mjs";

export default defineConfig({
  site: process.env.SITE_URL || "https://cloudadministrator.net",
  base: process.env.PUBLIC_SITE_BASE || "/",
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkBasePath],
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "one-dark-pro",
      },
      langs: ["bicep", "kusto", "kql", "powershell", "sql", "json", "bash", "javascript", "typescript", "xml", "yaml", "ini"],
    },
  },
});