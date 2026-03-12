import fs from "node:fs/promises";
import path from "node:path";

import { rewriteImportedMarkdownLinks } from "./content-link-utils.mjs";

const SITE_URL = process.env.WORDPRESS_SITE_URL ?? "https://cloudadministrator.net";
const CONTENT_DIR = path.resolve("src", "content", "blog");

async function listMarkdownFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return listMarkdownFiles(fullPath);
      }

      return entry.name.endsWith(".md") ? [fullPath] : [];
    })
  );

  return files.flat();
}

async function main() {
  const files = await listMarkdownFiles(CONTENT_DIR);
  let rewrittenFiles = 0;

  for (const file of files) {
    const original = await fs.readFile(file, "utf8");
    const updated = rewriteImportedMarkdownLinks(original, SITE_URL);

    if (updated === original) {
      continue;
    }

    await fs.writeFile(file, updated);
    rewrittenFiles += 1;
  }

  console.log(`Rewrote ${rewrittenFiles} Markdown files with normalized internal links.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
