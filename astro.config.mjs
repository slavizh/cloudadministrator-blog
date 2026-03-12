import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://cloudadministrator.net",
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