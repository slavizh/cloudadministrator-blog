---
title: "Blog Migration from Wordpress to GitHub Pages"
excerpt: ""
description: "Azure Bicep Snapshots, introduced in version 0.36.1, enables users to generate resource definitions as JSON files, reflecting their configurations in the Azu..."
pubDate: 2026-03-16
updatedDate: 2026-03-16
heroImage: "/media/blog-migration-wordpress-github-pages/wordpress-to-github-pages-hero.jpg"
sourceUrl: "https://cloudadministrator.net/blog-migration-wordpress-github-pages/"
tags:
  - "Wordpress"
  - "Migration"
  - "GitHub Pages"
  - "GitHub Copilot CLI"
  - "Astro"
---
I have been using Wordpress as platform for my blog since the beginning of my blogging 14 years ago. It served me a good purpose until the wide adoption of Markdown. Even though I write all my blog posts in Markdown for quite some time and Wordpress supports the format it is not that seamless experience. I have to keep copy of my blog in Markdown in private GitHub repository and when it is time to publish I need to use the Wordpress UI to copy the content like text, pictures and code. Needless to say that is tedious experience compared to just doing Git commit and sync. I knew about alternatives as GitHub Pages but I just never had the time to migrate to such alternative due to not having my previous blog posts in Markdown. This means that I would have to invest a lot of time of finding a way to extract my blog posts to Markdown before even considering moving to something else. This was a pending task for me until I saw "[Redesigning My Blog with GitHub Copilot: From WordPress to Astro](https://azureviking.com/post/redesigning-my-blog-with-github-copilot-from-wordpress-to-astro/)" by [Haflidi Fridthjofsson](https://azureviking.com/about/).

I won't explain what I did as Haflidi already did it quite well. Basically I took his advise and notes to migrate my blog from Wordpress to GitHub Pages + Astro via GitHub Copilot CLI. It is iterative session where you have to guide Copilot CLI to achieve your desired state. Overall I have managed in a few hours to migrate everything achieve almost the same functionality I had before. I have used the same site theme as I like it. Some site features I did not need I haven't put them in the new blog. In the end I did not write any code but achieved the functionality I want. A few additional things to ask Copilot CLI:

* Update any dependencies to latest version available. Some of the initial dependencies used were not the latest and I was using soon to be deprecated node.js version.
* Optimize code.
* Cleanup any code that was used only for the migration process.

In summary the benefits are:

* I can add new new blog post by just creating markdown file, commit and sync.
* Proper syntax highlighting for language I use like Bicep, KQL, SQL, PowerShell, etc.
* Free hosting on GitHub Pages, no more 50 euro fee per year. It is worth paying for one month GitHub Copilot just to migrate.
* Switched to using Web Analytics by Confluence.
* Option for Dark and Light themes.
* Moved to just using tags instead of tags and categories.
* Better mobile support.
* Blog Urls no longer need to include date.

Note that this is quite simple site so overall migration it is not so complex so Copilot CLI can do its thing without me having to supervise thoroughly.

In case you are in such situation try GitHub Copilot CLI and share your results.
