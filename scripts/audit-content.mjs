import fs from "node:fs/promises";
import path from "node:path";

const CONTENT_DIR = path.resolve("src", "content", "blog");

const checks = [
  { name: "WordPress block comments", pattern: /<!--\s*wp:/gi },
  { name: "Shortcode markers", pattern: /\[(?:embed|caption|gallery|audio|video|playlist)\b/gi },
  { name: "Embedded content placeholders", pattern: /\bEmbedded content\b/gi },
  { name: "Raw iframe HTML", pattern: /<iframe\b/gi }
];

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
  const summaries = [];

  for (const check of checks) {
    let matchCount = 0;
    const matchedFiles = [];

    for (const file of files) {
      const content = await fs.readFile(file, "utf8");
      const matches = content.match(check.pattern);
      if (!matches?.length) {
        continue;
      }

      matchCount += matches.length;
      matchedFiles.push(path.relative(process.cwd(), file));
    }

    summaries.push({
      name: check.name,
      matchCount,
      matchedFiles
    });
  }

  for (const summary of summaries) {
    console.log(`${summary.name}: ${summary.matchCount} match(es) across ${summary.matchedFiles.length} file(s).`);
    for (const file of summary.matchedFiles.slice(0, 10)) {
      console.log(`  - ${file}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
