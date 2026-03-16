---
title: "Blog Migration from WordPress to GitHub Pages"
excerpt: "After 14 years on WordPress, I migrated my blog to GitHub Pages and Astro using GitHub Copilot CLI. In a few hours I achieved the same functionality without writing any code."
description: "How I migrated my blog from WordPress to GitHub Pages + Astro using GitHub Copilot CLI, and why it was worth it."
pubDate: 2026-03-16
updatedDate: 2026-03-16
heroImage: "/media/blog-migration-wordpress-github-pages/wordpress-to-github-pages-hero.jpg"
sourceUrl: "https://cloudadministrator.net/blog-migration-wordpress-github-pages/"
tags:
  - "WordPress"
  - "Migration"
  - "GitHub Pages"
  - "GitHub Copilot CLI"
  - "Astro"
---
I have been using WordPress as platform for my blog since the beginning of my blogging 14 years ago. It served me well until the wide adoption of Markdown. Even though I have been writing all my blog posts in Markdown for quite some time and WordPress supports the format, it is not that seamless an experience. I have to keep a copy of my blog in Markdown in a private GitHub repository and when it is time to publish I need to use the WordPress UI to copy the content like text, pictures and code. Needless to say, that is a tedious experience compared to just doing Git commit and sync. I knew about alternatives like GitHub Pages but I just never had the time to migrate to such an alternative due to not having my previous blog posts in Markdown. This means that I would have to invest a lot of time finding a way to extract my blog posts to Markdown before even considering moving to something else. This was a pending task for me until I saw "[Redesigning My Blog with GitHub Copilot: From WordPress to Astro](https://azureviking.com/post/redesigning-my-blog-with-github-copilot-from-wordpress-to-astro/)" by [Haflidi Fridthjofsson](https://azureviking.com/about/).

I won't explain what I did as Haflidi already did it quite well. Basically I took his advice and notes to migrate my blog from WordPress to GitHub Pages + Astro via GitHub Copilot CLI. It is an iterative session where you have to guide Copilot CLI to achieve your desired state. Overall, I managed in a few hours to migrate everything and achieve almost the same functionality I had before. I have used the same site theme as I like it. Some site features I did not need, I haven't included in the new blog. In the end I did not write any code but achieved the functionality I want. A few additional things I asked Copilot CLI to do:

* Update any dependencies to latest version available. Some of the initial dependencies used were not the latest and I was using a soon-to-be-deprecated Node.js version.
* Optimize code.
* Cleanup any code that was used only for the migration process.

In summary the benefits are:

* I can add a new blog post by just creating a markdown file, commit and sync.
* Proper syntax highlighting for languages I use like Bicep, KQL, SQL, PowerShell, etc.
* Free hosting on GitHub Pages, no more 50 euro fee per year. It is worth paying for one month GitHub Copilot just to migrate.
* Switched to using Web Analytics by Cloudflare.
* Option for Dark and Light themes.
* Moved to just using tags instead of tags and categories.
* Better mobile support.
* Blog URLs no longer need to include date.

Note that this is quite a simple site so the overall migration is not that complex so Copilot CLI can do its thing without me having to supervise thoroughly.

If you are in a similar situation, try GitHub Copilot CLI and share your results.
