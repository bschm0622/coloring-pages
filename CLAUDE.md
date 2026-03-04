# Find Coloring Pages — Claude Code Instructions

## Project Overview

Astro 5 + Tailwind CSS v4 + Starwind UI site at **findcoloringpages.com**.
Content: blog posts + downloadable coloring pages.

---

## The One Rule for Layouts

| Content type | Layout to use |
|---|---|
| Blog post | `src/layouts/Prose.astro` |
| Coloring page detail | `src/layouts/Prose.astro` |
| Everything else (index, about, listing pages) | `src/layouts/Page.astro` |

**Never use `Base.astro` or `Layout.astro` directly in pages.** Those are internal to the layout hierarchy.

---

## How to Add a Blog Post

1. Create `src/content/blog/your-slug.md`
2. Required frontmatter (enforced by Zod — build will fail without it):

```md
---
title: "Your Post Title"
description: "Under 160 characters. Used for SEO meta description."
pubDate: 2024-01-15
tags: ["coloring", "kids"]
draft: false
---

Post content here...
```

3. Optional fields: `updatedDate`, `ogImage` (path to image in `/public/`)
4. Use `Prose.astro` layout — it's applied automatically via content collection rendering

---

## How to Add a Coloring Page

1. Create `src/content/coloringPages/your-slug.md`
2. Required frontmatter:

```md
---
title: "Butterfly Coloring Page"
description: "Under 160 characters."
pubDate: 2024-01-15
category: "Animals"
difficulty: "easy"
imageUrl: "/coloring-pages/butterfly-preview.png"
tags: ["butterfly", "animals", "nature"]
draft: false
---
```

3. Optional fields: `pdfUrl`
4. `difficulty` must be one of: `easy`, `medium`, `hard`

---

## Site Config (Single Source of Truth)

`src/config/site.ts` — all site-wide values live here:
- Site name, URL, description
- Author info (name, email, twitter)
- Navigation links
- Social links
- Default OG image path

**Never hardcode site name, URL, or nav items elsewhere.** Always import from `siteConfig`.

---

## SEO

`src/components/seo/SEO.astro` — called internally by `Base.astro`. **You never need to write `<meta>` tags manually.**

The SEO component handles:
- `<title>` formatted as `"Page Title | Find Coloring Pages"`
- Canonical URL (auto-derived from `Astro.url`)
- OG image + Twitter card
- JSON-LD structured data (WebSite on homepage, Article on blog posts)
- Robots meta

Pass `type="article"` and `pubDate` when rendering blog/coloring page content.

---

## Layout Props Reference

### `Page.astro`
```ts
title: string          // required
description: string    // required, used for SEO
ogImage?: string       // path to image in /public/
noindex?: boolean      // default false
```

### `Prose.astro`
```ts
title: string          // required
description: string    // required
pubDate: Date          // required
updatedDate?: Date
tags?: string[]
ogImage?: string
```

---

## Typography

Heading and text role classes are defined in `src/styles/starwind.css`. **Use these instead of composing raw `text-*`/`font-*` utilities.**

### Headings

| Class | Size | Use |
|---|---|---|
| `heading-1` | 4xl bold | Page hero titles |
| `heading-2` | 3xl bold | Article titles, major section headers |
| `heading-3` | 2xl semibold | Section titles within a page |
| `heading-4` | xl semibold | Card titles, subsection headers |
| `heading-5` | lg medium | Minor headings, sidebar labels |

### Text roles

| Class | Style | Use |
|---|---|---|
| `text-lead` | lg muted, relaxed | Intro/subtitle paragraph under a heading |
| `text-body` | base, relaxed | Standard body copy |
| `text-caption` | sm muted | Timestamps, labels, helper text |

To restyle headings site-wide, edit the `@layer components` block in `src/styles/starwind.css` — nowhere else.

---

## Spacing & Layout

**Always use `Container` for width-constrained content** — never write `mx-auto max-w-*` manually.

```astro
import Container from "@/components/ui/Container.astro";

<Container>          <!-- full-width container (default) -->
<Container prose>    <!-- narrow prose container for articles -->
<Container tag="article">  <!-- renders as <article> instead of <div> -->
```

Layout spacing tokens are defined in `src/styles/starwind.css` and used via Tailwind:

| Token (Tailwind v4 syntax) | CSS var | Default | Use |
|---|---|---|---|
| `py-(--page-padding-y)` | `--page-padding-y` | `2rem` | Vertical padding inside `<main>` |
| `mt-(--section-gap)` | `--section-gap` | `4rem` | Space between major page sections |
| `px-(--container-padding-x)` | `--container-padding-x` | `1rem` | Horizontal page gutter (built into Container) |

To change site-wide spacing, edit the variables in `src/styles/starwind.css` `:root` — nowhere else.

---

## Theming (CSS Custom Properties)

All colors are CSS custom properties defined in `src/styles/starwind.css`. Use these Tailwind tokens — never raw hex values:

| Token | Use |
|---|---|
| `bg-background` / `text-foreground` | Page background / primary text |
| `text-muted-foreground` | Secondary/subdued text |
| `bg-primary` / `text-primary-foreground` | Primary action buttons |
| `bg-secondary` / `text-secondary-foreground` | Tags, badges |
| `bg-accent` / `text-accent-foreground` | Hover states |
| `border-border` | All borders |
| `bg-card` / `text-card-foreground` | Card components |

Dark mode is supported automatically via the `.dark` class. Never use `dark:` variants with raw colors — use the token system.

---

## Search

- Search index is generated at build time from the `coloringPages` collection: `src/pages/search.json.ts`
- `SearchModal.astro` is already wired into `Page.astro`'s header — **do not add another search trigger**
- Fuse.js loads lazily when the modal opens (Cmd+K / Ctrl+K shortcut)
- Search covers: title, description, category, tags

---

## Component Patterns

All UI components follow these prop naming conventions:
- Link/URL props: `href`
- Display text: `title`, `description`, `label`
- Variant props: `variant` (not `type` or `kind`)

Starwind components live in `src/components/starwind/`. Install via: `npx starwind add <component>`

Utility function for class merging: `import { cn } from "@/lib/utils"`

---

## File Structure

```
src/
  config/
    site.ts              ← single source of truth
  layouts/
    Base.astro           ← html shell + SEO (internal, don't use directly)
    Page.astro           ← Base + header/footer (use for most pages)
    Prose.astro          ← Page + article wrapper (use for blog/coloring pages)
  components/
    seo/
      SEO.astro          ← all meta tags (called by Base, not directly)
    ui/
      Container.astro    ← width-constrained wrapper (use everywhere instead of mx-auto max-w-*)
    search/
      SearchModal.astro  ← Fuse.js modal (already in Page header)
    starwind/            ← UI primitives (install via npx starwind add)
  content/
    blog/                ← .md blog posts
    coloringPages/       ← .md coloring page entries
    config.ts            ← Zod schemas (enforces frontmatter)
  pages/
    index.astro
    rss.xml.ts           ← RSS feed (blog)
    search.json.ts       ← Fuse.js search index (coloring pages)
  styles/
    starwind.css         ← Tailwind base + CSS custom properties
  lib/
    utils.ts             ← cn() utility
```

---

## What NOT to Do

- Don't write `<meta>` tags manually — SEO component handles everything
- Don't use `Layout.astro` — it's the old starter shell, use `Page.astro` or `Prose.astro`
- Don't use `Base.astro` in pages — it has no header/footer
- Don't hardcode colors with `#hex` or raw Tailwind colors — use the token system
- Don't compose raw `text-3xl font-bold tracking-tight text-foreground` — use `heading-1` through `heading-5`
- Don't write `mx-auto max-w-*` manually — use `<Container>` or `<Container prose>`
- Don't add inline `<style>` blocks — use Tailwind utilities
- Don't scatter site name/URL strings — always use `siteConfig`
- Don't add `<script>` tags for analytics/fonts in individual pages — add them to `Base.astro`
