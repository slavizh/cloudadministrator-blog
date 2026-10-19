import { getCollection } from "astro:content";
import { withBase } from "../utils/paths";
import { sortPosts } from "../utils/blog";
import { markdownToText } from "../utils/search-text";

export async function GET() {
  const posts = sortPosts(await getCollection("blog", ({ data }) => !data.draft));

  return new Response(
    JSON.stringify(await Promise.all(posts.map(async (post) => ({
        title: post.data.title,
        excerpt: post.data.excerpt,
        description: post.data.description,
        slug: withBase(`${post.id}/`),
        pubDate: post.data.pubDate.toISOString(),
        tags: post.data.tags,
        content: await markdownToText(post.body)
      })))),
    {
      headers: {
        "content-type": "application/json; charset=utf-8"
      }
    }
  );
}
