## Core Philosophy

The key insight for "AI-friendly" is that Claude Code works best when there's **one obvious right way to do everything**. No ambiguity about where files go, how components get composed, or what patterns to follow. The boilerplate should be so opinionated that Claude never has to guess.

---

## Site Config (`src/config/site.ts`)

This is table stakes. A single exported object with everything static:

```ts
export const siteConfig = {
  name: "My Site",
  url: "https://example.com",
  description: "...",
  author: { name: "...", email: "...", twitter: "@..." },
  nav: [...],
  social: { twitter: "...", github: "..." },
  defaultOgImage: "/og-default.png",
}
```

Claude can read this once and never make up values. Every layout, SEO component, RSS feed, and sitemap pulls from here — no magic strings scattered around.

---

## File/Folder Structure

```
src/
  config/
    site.ts          ← the one source of truth
  layouts/
    Base.astro       ← shell: head, SEO, scripts
    Page.astro       ← Base + header/footer, for regular pages
    Prose.astro      ← Page + markdown typography wrapper
  components/
    seo/             ← SEO.astro, OgImage.astro
    ui/              ← Button, Card, Badge (Starwind primitives)
    search/          ← SearchModal.astro, search-index.json logic
  content/
    blog/            ← .md/.mdx with enforced frontmatter schema
    pages/           ← optional static content pages
  pages/
    index.astro
    blog/
      index.astro    ← listing page
      [slug].astro   ← detail page
    rss.xml.ts
    sitemap (auto via integration)
    search.json.ts   ← Fuse.js index endpoint
  styles/
    global.css       ← Tailwind base + CSS custom properties
    prose.css        ← typography overrides
```

The key: **layouts have a clear hierarchy** and Claude knows exactly which one to use for what.

---

## Content Collections + Enforced Schema

Define strict Zod schemas in `src/content/config.ts`. This is massive for AI reliability:

```ts
const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().max(160), // SEO-enforced
    pubDate: z.date(),
    updatedDate: z.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    ogImage: z.string().optional(),
  })
})
```

Claude will always produce valid frontmatter. No missing fields, no broken RSS.

---

## The Two Layouts — What Makes Them Rock-Solid

**`Page.astro`** accepts: `title`, `description`, `ogImage?` — that's it. It internally handles all the SEO, canonical URL, OG tags, Twitter cards, structured data. Claude never has to think about meta tags.

**`Prose.astro`** extends Page, adds: `pubDate`, `updatedDate?`, `tags[]`, auto-generates article structured data (JSON-LD), reading time, and wraps slot in a typography container.

The rule: **if it's a blog post, use Prose. Everything else, use Page.** That's it. That's the decision tree.

---

## SEO Component Design

One `<SEO />` component that Page.astro calls internally. It should handle:
- Title templating (`Page Title | Site Name`)
- Canonical URLs (auto-derived from `Astro.url`)
- OG/Twitter meta
- JSON-LD (WebSite on homepage, Article on posts, BreadcrumbList everywhere)
- Robots meta

Claude should never have to write a `<meta>` tag manually. It's all abstracted.

---

## Integrations Stack

| Integration | Why |
|---|---|
| `@astrojs/sitemap` | Zero config, just add to integrations |
| `@astrojs/rss` | Feed from content collection, pulls siteConfig |
| `@astrojs/tailwind` | With Starwind as the component layer |
| `astro-robots-txt` | Auto-generates robots.txt pointing to sitemap |
| `@playform/compress` | HTML/CSS/JS/image compression at build time |
| `astro-seo-schema` | Optional but good for JSON-LD ergonomics |

Fuse.js: generate a `search.json` endpoint at build time from content collections, then a lightweight client-side modal that only loads the Fuse bundle when the search trigger is clicked. Keep it out of the critical path.

---

## The AI-Friendliness Layer

This is the part most boilerplates skip. A few specific additions:

**`CLAUDE.md` at the root** — project-specific instructions. How to add a page, how to add a blog post, what components exist, what Tailwind tokens are defined, what *not* to do. Claude Code reads this automatically. This is arguably the most important file in the whole repo.

**Component API consistency** — every UI component should follow the same prop patterns. If cards have `title`, `description`, `href` — everything with those concepts uses those same prop names. No `label` vs `title` vs `heading` ambiguity.

**CSS custom properties for theming** — don't scatter Tailwind config colors everywhere. Define `--color-brand`, `--color-surface`, etc. in global.css and map them to Tailwind. Claude can retheme by touching one file.

**Named slot conventions** — if layouts use slots, name them consistently: `header`, `aside`, `footer`. Document them in CLAUDE.md.

---

## What to Leave Out

The temptation is to include everything. Resist it. No auth, no database integration, no image optimization opinions beyond what Astro provides natively. The boilerplate's job is to make the *content and presentation layer* bulletproof. Everything else is app-specific and should be added per-project.

---

## Summary of the Opinionated Bets

1. TypeScript everywhere, strict mode
2. Content Collections with Zod schemas — no loose frontmatter
3. Two layouts max, with a clear decision rule
4. One SEO component, fully abstracted
5. siteConfig as the single source of truth
6. CLAUDE.md as the AI entry point
7. Starwind/Tailwind with CSS custom properties, not raw config values
8. Fuse.js search loaded lazily, index generated at build time