# Cloud Administrator ☁️

Personal tech blog by **Stanislav Zhelyazkov** — sharing deep dives on Azure infrastructure, Bicep, Azure Policy, governance, and cloud administration.

🔗 **Live site**: [cloudadministrator.net](https://cloudadministrator.net/)

## Tech Stack

- **Framework**: [Astro 6](https://astro.build/)
- **Styling**: Custom CSS with dark/light mode
- **Hosting**: [GitHub Pages](https://pages.github.com/)
- **CDN/Proxy**: [Cloudflare](https://www.cloudflare.com/)
- **Analytics**: Cloudflare Analytics (server-side)
- **Language**: TypeScript

## Features

- 📝 Markdown blog with syntax highlighting (Shiki dual themes)
- 🔍 Client-side search across all posts
- 🎠 Featured posts carousel on homepage
- 🏷️ Tag-based filtering and categorization
- 🌗 Dark/light mode with system preference detection
- 📱 Fully responsive design
- 📡 RSS feed at `/feed/`
- 🗺️ Auto-generated sitemap
- 🔗 SEO-optimized with JSON-LD structured data and Open Graph tags
- 📊 Reading time estimates
- 🔄 Related posts suggestions

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production (runs astro check + astro build)
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
├── public/
│   ├── media/               # Blog post images (YYYY/MM structure)
│   └── favicon.svg          # Site favicon
├── src/
│   ├── components/          # Astro components (PostCard, HeroCarousel, etc.)
│   ├── content/
│   │   └── blog/            # Blog posts in Markdown (YYYY/MM/DD structure)
│   ├── layouts/             # Base layout with global styles
│   ├── pages/               # File-based routing (archive, tags, search, etc.)
│   ├── plugins/             # Custom remark plugins
│   └── utils/               # Shared utilities (paths, blog helpers, assets)
├── scripts/
│   └── build.mjs            # Build script (check + build)
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Pages deployment
├── astro.config.mjs         # Astro configuration
├── content.config.ts        # Content collection schema
└── tsconfig.json
```

## Deployment

Pushes to `main` automatically deploy via GitHub Actions:

1. Checkout and install dependencies
2. Run `astro check` for type validation
3. Build static site with `astro build`
4. Deploy to GitHub Pages

### Custom Domain

The site uses `cloudadministrator.net` via Cloudflare proxy. Configuration:

- Set repo variable `SITE_URL` to your custom domain URL
- Configure the custom domain in GitHub Pages settings
- Set Cloudflare DNS CNAME to `slavizh.github.io` (proxied)
- Set Cloudflare SSL/TLS to Full

## Writing a New Post

1. Create a new `.md` file in `src/content/blog/YYYY/MM/DD/`
2. Add frontmatter:
   ```yaml
   ---
   title: "Your Post Title"
   excerpt: "Short summary for cards and previews"
   description: "SEO meta description"
   pubDate: "2026-03-13"
   heroImage: "/media/2026/03/your-image.png"
   tags: ["Azure", "Bicep"]
   draft: false
   ---
   ```
3. Add your image to `public/media/YYYY/MM/`
4. Commit and push — the site deploys automatically

## License

Blog content © Stanislav Zhelyazkov. All rights reserved.
