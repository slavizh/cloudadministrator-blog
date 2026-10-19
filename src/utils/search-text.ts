import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import { parseFragment, type DefaultTreeAdapterMap } from "parse5";

const processor = createMarkdownProcessor({ syntaxHighlight: false, smartypants: false });
const excludedTags = new Set(["script", "style", "template"]);
const blockTags = new Set([
  "address", "article", "aside", "blockquote", "br", "dd", "div", "dl", "dt",
  "figcaption", "figure", "footer", "h1", "h2", "h3", "h4", "h5", "h6",
  "header", "hr", "li", "main", "nav", "ol", "p", "pre", "section", "table",
  "td", "th", "tr", "ul"
]);

function collectText(node: DefaultTreeAdapterMap["node"]): string {
  if ("value" in node) return node.value;
  if (!("childNodes" in node)) return "";

  const tag = "tagName" in node ? node.tagName : "";
  if (excludedTags.has(tag)) return "";
  if (tag === "img" && "attrs" in node) {
    return ` ${node.attrs.find((attribute) => attribute.name === "alt")?.value ?? ""} `;
  }

  const text = node.childNodes.map(collectText).join("");
  return blockTags.has(tag) ? ` ${text} ` : text;
}

export async function markdownToText(markdown: string | undefined) {
  const { code } = await (await processor).render(markdown ?? "");
  // Parse once so encoded text is decoded once, without interpreting it as markup again.
  return collectText(parseFragment(code)).replace(/\s+/g, " ").trim();
}
