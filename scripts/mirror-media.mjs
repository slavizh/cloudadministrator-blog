import fs from "node:fs/promises";
import path from "node:path";

const CONTENT_DIR = path.resolve("src", "content", "blog");
const PUBLIC_MEDIA_DIR = path.resolve("public", "media", "wordpress");
const CONTENT_MEDIA_DIR = path.resolve("src", "content", "blog", "media", "wordpress");
const POST_MEDIA_REFERENCE = "/media/wordpress";
const HERO_MEDIA_REFERENCE = "/media/wordpress";
const PREVIEW_MEDIA_REFERENCE = "/media/wordpress";
const USER_AGENT = "cloudadministrator-blog-media-mirror/1.0";
const WORDPRESS_UPLOAD_PATTERN =
  /https:\/\/cloudadministrator\.net\/wp-content\/uploads\/[^\s)"']+?\.[a-z0-9]{2,5}(?:\?[^\s)"']*)?(?:%22%3E%3Cimg|&quot;)?/gi;

function normalizeUrl(url) {
  return url.replace(/\?.*$/, "").replace(/#.*$/, "");
}

function toLocalRelativePath(url) {
  const parsed = new URL(normalizeUrl(url));
  const pathname = decodeURIComponent(parsed.pathname).replace(/^\/wp-content\/uploads\//, "");
  return pathname.replace(/\//g, path.sep);
}

function toHeroReplacement(url) {
  return `${HERO_MEDIA_REFERENCE}/${toLocalRelativePath(url).split(path.sep).join("/")}`;
}

function toPreviewReplacement(url) {
  return `${PREVIEW_MEDIA_REFERENCE}/${toLocalRelativePath(url).split(path.sep).join("/")}`;
}

function normalizePreviewPath(value) {
  const marker = "media/wordpress/";
  const markerIndex = value.indexOf(marker);

  if (markerIndex === -1) {
    return value;
  }

  return `${PREVIEW_MEDIA_REFERENCE}/${value.slice(markerIndex + marker.length)}`;
}

function preferFullSizePath(imagePath, fallbackPath) {
  if (!imagePath.includes("_thumb")) {
    return fallbackPath ?? imagePath;
  }

  const upgraded = imagePath.replace(/_thumb([^/.]*)(\.[a-z0-9]+)$/i, "$1$2");
  return fallbackPath ?? upgraded;
}

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

function collectUrls(content) {
  const matches = content.match(WORDPRESS_UPLOAD_PATTERN) ?? [];
  return [...new Set(matches.map(normalizeUrl))];
}

function splitFrontmatter(content) {
  if (!content.startsWith("---")) {
    return { frontmatter: "", body: content };
  }

  const lines = content.split(/\r?\n/);
  const closingIndex = lines.slice(1).findIndex((line) => line === "---");

  if (closingIndex === -1) {
    return { frontmatter: "", body: content };
  }

  const endIndex = closingIndex + 1;
  return {
    frontmatter: `${lines.slice(0, endIndex + 1).join("\n")}\n`,
    body: lines.slice(endIndex + 1).join("\n")
  };
}

async function downloadAsset(url) {
  const relativePath = toLocalRelativePath(url);
  const publicDestination = path.join(PUBLIC_MEDIA_DIR, relativePath);
  const contentDestination = path.join(CONTENT_MEDIA_DIR, relativePath);

  await fs.mkdir(path.dirname(publicDestination), { recursive: true });
  await fs.mkdir(path.dirname(contentDestination), { recursive: true });

  try {
    await fs.access(publicDestination);
    await fs.cp(publicDestination, contentDestination, { force: true });
    return { destination: publicDestination, downloaded: false };
  } catch {
    // fall through
  }

  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await fs.writeFile(publicDestination, buffer);
  await fs.writeFile(contentDestination, buffer);
  return { destination: publicDestination, downloaded: true };
}

function rewriteContent(content) {
  const { frontmatter, body } = splitFrontmatter(content);

  let updatedFrontmatter = frontmatter.replace(
    /(^heroImage:\s+["'])([^"']*?media\/wordpress\/[^"']+|https:\/\/cloudadministrator\.net\/wp-content\/uploads\/[^"']+)(["'])/m,
    (_, prefix, value, suffix) =>
      `${prefix}${
        value.startsWith("https://cloudadministrator.net/wp-content/uploads/")
          ? toHeroReplacement(normalizeUrl(value))
          : preferFullSizePath(`/${value.slice(value.indexOf("media/wordpress/"))}`)
      }${suffix}`
  );

  let updatedBody = body.replace(WORDPRESS_UPLOAD_PATTERN, (match) =>
    toPreviewReplacement(normalizeUrl(match))
  );

  updatedBody = updatedBody.replace(
    /(\]\()([^)\s"]*?media\/wordpress\/[^)\s"]+)/g,
    (_, prefix, value) => `${prefix}${normalizePreviewPath(value)}`
  );

  updatedBody = updatedBody.replace(
    /((?:href|src)=["'])([^"']*?media\/wordpress\/[^"']+)/g,
    (_, prefix, value) => `${prefix}${normalizePreviewPath(value)}`
  );

  updatedBody = updatedBody.replace(
    /\[!\[([^\]]*)\]\(([^)\s"]*_thumb[^)\s"]+)(?:\s+"([^"]*)")?\)\]\(([^)\s"]*?media\/wordpress\/[^)\s"]+)\)/g,
    (_, alt, imagePath, title = "", linkPath) =>
      `[![${alt}](${preferFullSizePath(imagePath, linkPath)}${title ? ` "${title}"` : ""})](${linkPath})`
  );

  updatedBody = updatedBody.replace(
    /!\[([^\]]*)\]\(([^)\s"]*_thumb[^)\s"]+)(?:\s+"([^"]*)")?\)/g,
    (_, alt, imagePath, title = "") =>
      `![${alt}](${preferFullSizePath(imagePath)}${title ? ` "${title}"` : ""})`
  );

  updatedBody = updatedBody.replace(
    /<a\s+href="(\.\.\/\.\.\/\.\.\/media\/wordpress\/[^"]+)"><img\s+src="(\.\.\/\.\.\/\.\.\/media\/wordpress\/[^"]+)"\s+alt="([^"]*)"(?:\s+title="([^"]*)")?\s+loading="lazy"\s*\/><\/a>/g,
    (_, linkPath, imagePath, alt, title = "") =>
      `[![${alt}](${imagePath}${title ? ` "${title}"` : ""})](${linkPath})`
  );

  updatedBody = updatedBody.replace(
    /<img\s+src="(\.\.\/\.\.\/\.\.\/media\/wordpress\/[^"]+)"\s+alt="([^"]*)"(?:\s+title="([^"]*)")?\s+loading="lazy"\s*\/>/g,
    (_, imagePath, alt, title = "") => `![${alt}](${imagePath}${title ? ` "${title}"` : ""})`
  );

  return `${updatedFrontmatter}${updatedBody}`;
}

async function main() {
  const markdownFiles = await listMarkdownFiles(CONTENT_DIR);
  const fileContents = await Promise.all(
    markdownFiles.map(async (file) => ({
      file,
      content: await fs.readFile(file, "utf8")
    }))
  );

  const uniqueUrls = [...new Set(fileContents.flatMap(({ content }) => collectUrls(content)))];
  console.log(`Found ${uniqueUrls.length} unique WordPress upload assets referenced in Markdown.`);

  let downloadedCount = 0;
  let failedCount = 0;
  for (const url of uniqueUrls) {
    try {
      const result = await downloadAsset(url);
      if (result.downloaded) {
        downloadedCount += 1;
        console.log(`Downloaded ${url} -> ${path.relative(process.cwd(), result.destination)}`);
      }
    } catch (error) {
      failedCount += 1;
      console.warn(`Skipping ${url}: ${error instanceof Error ? error.message : error}`);
    }
  }

  await fs.cp(PUBLIC_MEDIA_DIR, CONTENT_MEDIA_DIR, { recursive: true, force: true });

  let rewrittenFiles = 0;
  for (const { file, content } of fileContents) {
    const updated = rewriteContent(content);
    if (updated !== content) {
      await fs.writeFile(file, updated);
      rewrittenFiles += 1;
    }
  }

  console.log(`Downloaded ${downloadedCount} new assets.`);
  console.log(`Skipped ${failedCount} assets that could not be downloaded.`);
  console.log(`Rewrote ${rewrittenFiles} Markdown files to local media paths.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
