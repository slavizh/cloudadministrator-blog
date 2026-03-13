import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { withBase } from "../../utils/paths";

export async function GET(context) {
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (left, right) => right.data.pubDate.valueOf() - left.data.pubDate.valueOf()
  );

  return rss({
    title: "Cloud Administrator",
    description: "Begin Your Azure Management Journey with the Cloud Administrator",
    site: context.site,
    language: "en",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.excerpt || post.data.description,
      pubDate: post.data.pubDate,
      link: withBase(`${post.slug}/`),
      categories: [...post.data.tags],
      author: "Stanislav Zhelyazkov",
    })),
    customData: `<language>en</language>`,
  });
}
