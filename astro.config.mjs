import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: process.env.SITE_URL || "https://cloudadministrator.net",
  base: process.env.PUBLIC_SITE_BASE || "/",
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      themes: {
        light: "github-light",
        dark: "one-dark-pro",
      },
      langs: ["bicep", "kusto", "kql", "powershell", "sql", "json", "bash", "javascript", "typescript", "xml", "yaml", "ini"],
    },
  },
});