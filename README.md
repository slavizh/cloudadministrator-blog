# Cloud Administrator in Azure World

This repository contains an Astro-based static rebuild of `cloudadministrator.net`, designed to run well on GitHub Pages while preserving WordPress-style dated permalinks and the blog's Azure-focused presentation.

## What's included

- Astro static site scaffold
- Content collections for blog posts
- Seeded post content based on the public site feed
- RSS feed generation
- GitHub Pages deployment workflow

## Local development

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Start the dev server:

   ```powershell
   npm run dev
   ```

   The dev server binds to all local interfaces so both `http://localhost:4321` and `http://127.0.0.1:4321` work reliably during image-heavy post previews.

3. Build the production site:

   ```powershell
   npm run build
   ```

4. Import posts directly from the live WordPress site:

   ```powershell
   npm run import:live
   ```

   This fetches the public sitemap and post pages from `https://cloudadministrator.net/` and writes Markdown files into `src/content/blog/`.

5. Mirror referenced WordPress media locally:

   ```powershell
   npm run mirror:media
   ```

   This downloads referenced `wp-content/uploads` assets into `public/media/wordpress/` and rewrites imported content to use the local copies.

6. Audit imported content for leftover WordPress blocks, shortcode markers, or placeholder embeds:

   ```powershell
   npm run audit:content
   ```

   This helps spot any imported content that may still need a manual pass after the automated migration.

## GitHub Pages deployment

The workflow at `.github/workflows/deploy.yml` builds the site and deploys the `dist` output to GitHub Pages.

If you want to publish with a custom domain such as `cloudadministrator.net`, set the repository variable `SITE_URL` to that full URL and then configure the custom domain in GitHub Pages.

## Continuing the WordPress migration

This project can now import directly from the live public site, so a WordPress export is optional as long as the posts remain publicly accessible.

If you later want a more complete archival migration, the remaining work is still similar:

1. Review any posts with complex embeds, shortcodes, or custom WordPress blocks.
2. Add redirects or canonical metadata if you need a staged cutover.

Because the site already uses dated content paths, the migration can preserve the same route structure without redesigning the front end.
