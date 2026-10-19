import type { CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;
export type TaxonomyKey = "tags";

export interface TaxonomyEntry {
  name: string;
  slug: string;
  count: number;
  values: string[];
}

export interface ArchiveMonthGroup {
  month: number;
  label: string;
  slug: string;
  posts: BlogPost[];
}

export interface ArchiveYearGroup {
  year: number;
  posts: BlogPost[];
  months: ArchiveMonthGroup[];
}

const TAG_COLORS = ["blue", "green", "purple", "orange", "pink", "teal", "red", "yellow", "indigo", "cyan"] as const;

export function getTagColor(tag: string) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

export function calculateReadTime(body: string | undefined) {
  const wordCount = body ? body.split(/\s+/).length : 0;
  return Math.max(1, Math.round(wordCount / 200));
}

export function formatDate(date: Date, month: "short" | "long" = "short") {
  return date.toLocaleDateString("en-US", { year: "numeric", month, day: "numeric" });
}

export function sortPosts(posts: BlogPost[]) {
  return [...posts].sort((left, right) => right.data.pubDate.valueOf() - left.data.pubDate.valueOf());
}

export function slugifySegment(value: string) {
  return (
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item"
  );
}

export function getTaxonomyHref(kind: "tag", value: string) {
  return `${kind}/${slugifySegment(value)}/`;
}

export function getTaxonomyEntries(posts: BlogPost[], key: TaxonomyKey) {
  const entries = new Map<string, { values: Set<string>; postIds: Set<string> }>();

  for (const post of posts) {
    for (const value of post.data[key]) {
      const slug = slugifySegment(value);
      const entry = entries.get(slug) ?? { values: new Set<string>(), postIds: new Set<string>() };
      entry.values.add(value);
      entry.postIds.add(post.id);
      entries.set(slug, entry);
    }
  }

  return [...entries.entries()]
    .map(([slug, entry]) => {
      const values = [...entry.values].sort((left, right) => left.localeCompare(right));
      return {
        name: values.join(" / "),
        slug,
        count: entry.postIds.size,
        values
      };
    })
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
}

export function getPostsByTaxonomy(posts: BlogPost[], key: TaxonomyKey, value: string | string[]) {
  const values = new Set(Array.isArray(value) ? value : [value]);
  return posts.filter((post) => post.data[key].some((entry) => values.has(entry)));
}

export function groupPostsByYear(posts: BlogPost[]) {
  const years = new Map<number, BlogPost[]>();

  for (const post of posts) {
    const year = post.data.pubDate.getFullYear();
    const yearPosts = years.get(year) ?? [];
    yearPosts.push(post);
    years.set(year, yearPosts);
  }

  return [...years.entries()]
    .sort(([leftYear], [rightYear]) => rightYear - leftYear)
    .map(([year, yearPosts]) => {
      const months = new Map<number, BlogPost[]>();

      for (const post of yearPosts) {
        const month = post.data.pubDate.getMonth() + 1;
        const monthPosts = months.get(month) ?? [];
        monthPosts.push(post);
        months.set(month, monthPosts);
      }

      return {
        year,
        posts: sortPosts(yearPosts),
        months: [...months.entries()]
          .sort(([leftMonth], [rightMonth]) => rightMonth - leftMonth)
          .map(([month, monthPosts]) => ({
            month,
            label: new Date(Date.UTC(year, month - 1, 1)).toLocaleString("en-US", { month: "long" }),
            slug: month.toString().padStart(2, "0"),
            posts: sortPosts(monthPosts)
          }))
      } satisfies ArchiveYearGroup;
    });
}
