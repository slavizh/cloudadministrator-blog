import type { APIContext } from "astro";

export function GET({ site }: APIContext) {
  const baseUrl = site ?? new URL("https://cloudadministrator.net");

  return new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${new URL("sitemap-index.xml", baseUrl).toString()}\n`,
    {
      headers: {
        "content-type": "text/plain; charset=utf-8"
      }
    }
  );
}
