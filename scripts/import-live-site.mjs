import fs from "node:fs/promises";
import path from "node:path";

import { load } from "cheerio";
import { XMLParser } from "fast-xml-parser";
import he from "he";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import {
  normalizeReferenceUrl,
  rewriteImportedMarkdownLinks
} from "./content-link-utils.mjs";

const { decode } = he;

const SITE_URL = process.env.WORDPRESS_SITE_URL ?? "https://cloudadministrator.net";
const OUTPUT_DIR = path.resolve("src", "content", "blog");
const SITEMAP_URL = new URL("/sitemap.xml", SITE_URL).toString();
const USER_AGENT = "cloudadministrator-blog-importer/1.0";

const turndownService = new TurndownService({
  codeBlockStyle: "fenced",
  headingStyle: "atx",
  hr: "---",
  bulletListMarker: "-"
});

turndownService.use(gfm);

function getCodeLanguage(node) {
  const className = node.getAttribute?.("class") ?? "";
  const brushMatch = className.match(/brush:\s*([a-z0-9#+-]+)/i);
  if (brushMatch) {
    const language = brushMatch[1].toLowerCase();
    if (language === "jscript") {
      return "javascript";
    }

    return language;
  }

  const languageMatch = className.match(/language-([a-z0-9#+-]+)/i);
  return languageMatch?.[1]?.toLowerCase() ?? "";
}

turndownService.addRule("wordpressCaption", {
  filter(node) {
    return node.nodeName === "FIGURE";
  },
  replacement(content, node) {
    const image = node.querySelector("img");
    if (!image?.getAttribute("src")) {
      return `\n\n${content}\n\n`;
    }

    const alt = image.getAttribute("alt") ?? "";
    const caption = node.querySelector("figcaption")?.textContent?.trim();
    const markdownImage = `![${alt}](${image.getAttribute("src")})`;

    return caption
      ? `\n\n${markdownImage}\n\n*${caption}*\n\n`
      : `\n\n${markdownImage}\n\n`;
  }
});

turndownService.addRule("codeFence", {
  filter(node) {
    return node.nodeName === "PRE";
  },
  replacement(_, node) {
    const rawText = node.textContent ?? "";
    const code = decode(rawText).replace(/\r\n/g, "\n").replace(/\u00a0/g, " ").trimEnd();
    const language = getCodeLanguage(node);

    return `\n\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
  }
});

function toTitleCaseFromSlug(value) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => {
      if (part.toUpperCase() === part) {
        return part;
      }

      if (part.length <= 3) {
        return part.toUpperCase();
      }

      return `${part[0].toUpperCase()}${part.slice(1)}`;
    })
    .join(" ");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function collapseWhitespace(value) {
  return value.replace(/\u00a0/g, " ").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function yamlString(value) {
  return JSON.stringify(value ?? "");
}

function yamlArray(values) {
  if (!values.length) {
    return "[]";
  }

  return `\n${values.map((value) => `  - ${yamlString(value)}`).join("\n")}`;
}

function formatDate(value) {
  return new Date(value).toISOString().slice(0, 10);
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function getPostUrls() {
  const xml = await fetchText(SITEMAP_URL);
  const parser = new XMLParser({
    ignoreAttributes: false
  });
  const parsed = parser.parse(xml);
  const urls = parsed.urlset?.url ?? [];
  const entries = Array.isArray(urls) ? urls : [urls];

  return entries
    .map((entry) => entry.loc)
    .filter((url) => /\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/?$/.test(url));
}

function cleanContent($, pageUrl) {
  const article = $("article.type-post").first();
  const entryContent = article.find(".entry-content").first();

  if (!entryContent.length) {
    throw new Error(`Could not find .entry-content in ${pageUrl}`);
  }

  entryContent
    .find(
      [
        "script",
        "style",
        "form",
        "noscript",
        ".sharedaddy",
        ".sd-sharing-enabled",
        ".sd-like",
        ".jp-relatedposts",
        "#jp-post-flair",
        ".entry-meta",
        ".post-edit-link"
      ].join(", ")
    )
    .remove();

  entryContent.find("iframe").each((_, iframe) => {
    const $iframe = $(iframe);
    const src = $iframe.attr("src");

    if (!src) {
      $iframe.remove();
      return;
    }

    $iframe.replaceWith(
      `<p><a href="${normalizeReferenceUrl(src, pageUrl)}">Embedded content</a></p>`
    );
  });

  entryContent.find("a[href], img[src], source[src]").each((_, element) => {
    const $element = $(element);
    const href = $element.attr("href");
    const src = $element.attr("src");

    if (href) {
      $element.attr("href", normalizeReferenceUrl(href, pageUrl));
    }

    if (src) {
      $element.attr("src", normalizeReferenceUrl(src, pageUrl));
    }
  });

  return entryContent.html() ?? "";
}

function extractTaxonomy($, article) {
  const categories = unique(
    article
      .find(".cat-links a")
      .map((_, link) => decode($(link).text().trim()))
      .get()
  );

  const visibleTags = article
    .find(".tags-links a")
    .map((_, link) => decode($(link).text().trim()))
    .get();

  const classTags = (article.attr("class") ?? "")
    .split(/\s+/)
    .filter((value) => value.startsWith("tag-"))
    .map((value) => toTitleCaseFromSlug(value.replace(/^tag-/, "")))
    .filter((value) => value.toLowerCase() !== "uncategorized");

  return {
    categories,
    tags: unique([...visibleTags, ...classTags])
  };
}

function buildFrontmatter(post) {
  return [
    "---",
    `title: ${yamlString(post.title)}`,
    `excerpt: ${yamlString(post.excerpt)}`,
    `description: ${yamlString(post.description)}`,
    `pubDate: ${formatDate(post.pubDate)}`,
    `updatedDate: ${formatDate(post.updatedDate)}`,
    `heroImage: ${yamlString(post.heroImage)}`,
    `sourceUrl: ${yamlString(post.sourceUrl)}`,
    `categories: ${yamlArray(post.categories)}`,
    `tags: ${yamlArray(post.tags)}`,
    "---",
    ""
  ].join("\n");
}

async function importPost(pageUrl) {
  const html = await fetchText(pageUrl);
  const $ = load(html);
  const article = $("article.type-post").first();

  if (!article.length) {
    throw new Error(`Could not find article.type-post in ${pageUrl}`);
  }

  const url = new URL(pageUrl);
  const slug = url.pathname.replace(/^\/|\/$/g, "");
  const title =
    decode(article.find(".entry-title").first().text().trim()) ||
    decode($("meta[property='og:title']").attr("content")?.replace(/\s+[–-]\s+Cloud Administrator in Azure World$/, "") ?? "");
  const excerpt = decode(
    $("meta[property='og:description']").attr("content") ??
      $("meta[name='description']").attr("content") ??
      article.find("p").first().text().trim()
  );
  const heroImage =
    $("meta[property='og:image']").attr("content") ??
    article.find("img").first().attr("src");
  const pubDate =
    $("meta[property='article:published_time']").attr("content") ??
    article.find("time.entry-date").attr("datetime");
  const updatedDate =
    $("meta[property='article:modified_time']").attr("content") ??
    pubDate;

  if (!title || !heroImage || !pubDate) {
    throw new Error(`Missing required metadata in ${pageUrl}`);
  }

  const { categories, tags } = extractTaxonomy($, article);
  const contentHtml = cleanContent($, pageUrl);
  const markdown = rewriteImportedMarkdownLinks(
    collapseWhitespace(turndownService.turndown(contentHtml)),
    SITE_URL
  );
  const description = excerpt.length > 160 ? `${excerpt.slice(0, 157).trimEnd()}...` : excerpt;
  const relativePath = path.join(...slug.split("/")) + ".md";
  const destination = path.join(OUTPUT_DIR, relativePath);

  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, `${buildFrontmatter({
    title,
    excerpt,
    description,
    pubDate,
    updatedDate,
    heroImage,
    sourceUrl: pageUrl,
    categories,
    tags
  })}${markdown}\n`);

  return destination;
}

async function main() {
  const urls = await getPostUrls();
  console.log(`Found ${urls.length} posts in ${SITEMAP_URL}`);

  let importedCount = 0;
  for (const pageUrl of urls) {
    const destination = await importPost(pageUrl);
    importedCount += 1;
    console.log(`[${importedCount}/${urls.length}] Imported ${pageUrl} -> ${path.relative(process.cwd(), destination)}`);
  }

  console.log(`Imported ${importedCount} posts from ${SITE_URL}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
