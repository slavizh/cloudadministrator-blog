import { getCollection } from "astro:content";
import { withBase } from "../utils/paths";
import { sortPosts } from "../utils/blog";

function markdownToText(markdown: string | undefined) {
  return (markdown ?? "")
    .replace(/```[^\n]*\n([\s\S]*?)```/g, " $1 ")
    .replace(/~~~[^\n]*\n([\s\S]*?)~~~/g, " $1 ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<https?:\/\/[^>]+>/g, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s{0,3}(?:>|[-*+]|\d+[.)])\s+/gm, "")
    .replace(/[`*_~]/g, "")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET() {
  const posts = sortPosts(await getCollection("blog", ({ data }) => !data.draft));

  return new Response(
    JSON.stringify(posts.map((post) => ({
        title: post.data.title,
        excerpt: post.data.excerpt,
        description: post.data.description,
        slug: withBase(`${post.id}/`),
        pubDate: post.data.pubDate.toISOString(),
        tags: post.data.tags,
        content: markdownToText(post.body)
      }))),
    {
      headers: {
        "content-type": "application/json; charset=utf-8"
      }
    }
  );
}
