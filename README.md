# Find Coloring Pages

Free printable coloring pages for kids and adults at [findcoloringpages.com](https://findcoloringpages.com).

Built with Astro 5, Tailwind CSS v4, and Starwind UI.

## Project Structure

```
src/
  config/
    site.ts              ← site name, URL, nav, author — single source of truth
  layouts/
    Base.astro           ← html shell + SEO
    Page.astro           ← Base + header/footer (use for most pages)
    Prose.astro          ← Page + article wrapper (use for blog & coloring pages)
  components/
    seo/SEO.astro        ← all meta tags, OG, JSON-LD
    search/SearchModal.astro ← Fuse.js search modal
    starwind/            ← UI primitives
  content/
    blog/                ← markdown blog posts
    coloringPages/       ← markdown coloring page entries
    config.ts            ← Zod schemas for content collections
  pages/
    index.astro
    rss.xml.ts           ← RSS feed
    search.json.ts       ← search index for Fuse.js
  styles/
    starwind.css         ← Tailwind base + CSS custom properties
  lib/
    utils.ts             ← cn() class utility
```

## Commands

| Command | Action |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build to `./dist/` |
| `npm run preview` | Preview production build locally |

## Adding Content

**Blog post** — create `src/content/blog/your-slug.md`:
```md
---
title: "Post Title"
description: "Under 160 characters."
pubDate: 2024-01-15
tags: ["coloring", "kids"]
draft: false
---
```

**Coloring page** — create `src/content/coloringPages/your-slug.md`:
```md
---
title: "Butterfly Coloring Page"
description: "Under 160 characters."
pubDate: 2024-01-15
category: "Animals"
difficulty: "easy"
imageUrl: "/coloring-pages/butterfly-preview.png"
tags: ["butterfly", "animals"]
draft: false
---
```

See [CLAUDE.md](CLAUDE.md) for full authoring and development guidelines.
