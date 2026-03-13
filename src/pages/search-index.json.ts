import { getCollection } from "astro:content";
import { withBase } from "../utils/paths";
import { sortPosts } from "../utils/blog";

export async function GET() {
  const posts = sortPosts(await getCollection("blog", ({ data }) => !data.draft));

  return new Response(
    JSON.stringify(
      posts.map((post) => ({
        title: post.data.title,
        excerpt: post.data.excerpt,
        description: post.data.description,
        slug: withBase(`${post.slug}/`),
        pubDate: post.data.pubDate.toISOString(),
        tags: post.data.tags
      }))
    ),
    {
      headers: {
        "content-type": "application/json; charset=utf-8"
      }
    }
  );
}
