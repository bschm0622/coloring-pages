# Adding Content

## Add a coloring page

**When:** You have a new coloring page PNG to add to the site.

**Steps:**

1. Drop your PNG in `public/coloring-pages/` (name it like `cat-bow.png`)
2. Run `npm run new-page`

**The script asks you:**

```
Subject (e.g. cat, puppy, easter):       → type the subject name
Title:                                    → "Cat with Bow Coloring Page"
Image filename (e.g. cat-bow.png):        → the file you just dropped in
Description (under 160 chars):            → "Free printable cat coloring page..."
```

Then it asks for difficulty, tags, and a one-line body text:

```
Difficulty (easy/medium/hard) [easy]:     → pick one, or Enter for default
Tags (comma-separated) [cat, animals]:    → type new tags, or Enter for default
One-line body text:                       → short description, or Enter to skip
```

For existing subjects, the hub's difficulty and tags are shown as defaults — just hit Enter to keep them, or type new values if this variant is different (e.g. a winter cat vs. a summer cat).

Then it generates PDFs. Done.

**Shortcut:** `npm run new-page -- cat "Cat with Bow"` skips the subject/title prompts.

---

## Add a collection

**When:** You want a themed landing page that groups existing coloring pages together (e.g. "Spring Coloring Pages", "Easy Coloring Pages for Toddlers"). Good for SEO — each collection targets a search query.

**Steps:**

1. Run `npm run new-collection`

**The script asks you:**

```
Title:                                    → "Spring Coloring Pages"
Description (under 160 chars):            → "Free printable spring coloring pages..."
Filter by tags (comma-separated):         → spring (or Enter to skip)
Filter by difficulty (easy/medium/hard):   → Enter to skip, or pick one
Intro paragraph:                          → short paragraph about the collection
```

It shows your existing tags so you can pick from them. The collection automatically pulls in every coloring page matching your filters. It appears in the nav and footer right away.

---

## Other commands

| Command | When to use it |
|---|---|
| `npm run pdfs` | After editing a coloring page manually (the new-page script runs this for you) |
| `npm run dev` | Preview the site locally before deploying |
| `npm run build` | Production build |

---

## How the site is organized

```
src/content/coloringPages/
  puppy/
    index.md        → /coloring-pages/puppy        (hub — shows gallery)
    cute.md         → /coloring-pages/puppy/cute   (single page)
    playful.md      → /coloring-pages/puppy/playful
  duck/
    index.md        → /coloring-pages/duck          (solo — no variants)

src/content/collections/
  spring-coloring-pages.md    → /collections/spring-coloring-pages
  animal-coloring-pages.md    → /collections/animal-coloring-pages
```

Everything below is automatic — you don't create or manage these pages, they build themselves from your content:

### Packs (`/packs`)

A pack is just a hub that has 2+ variants. The `/packs` page lists every hub that has multiple coloring pages, with a "Download PDF Pack" button for each. When you add variants to a subject, it automatically becomes a pack. When you run `npm run pdfs` (or `npm run new-page`), the pack PDF gets regenerated with all the variants included.

**You don't need to do anything** — just keep adding variants to subjects and the packs page updates itself.

### Tags (`/tags` and `/tags/[tag]`)

Every tag used on 2+ coloring pages gets its own page (e.g. `/tags/animals` shows all pages tagged "animals"). The `/tags` index shows all tags with counts.

**How to influence what shows up:** Pick tags carefully when adding pages. Reuse existing tags (the `new-page` script shows them). Good tags are:
- The subject itself: `cat`, `puppy`, `unicorn`
- A broad category: `animals`, `fantasy`, `holiday`
- Useful descriptors: `cute`, `spring`, `pets`

Check `/tags` on the live site to see what already exists before inventing new ones.

### Difficulty pages (`/coloring-pages/difficulty/easy`, `/medium`, `/hard`)

Every coloring page's `difficulty` field groups it onto these pages automatically. They're labeled with age ranges (Easy = Ages 2–5, Medium = Ages 5–10, Hard = Ages 10+).

**How to influence what shows up:** Set the `difficulty` field accurately when adding pages.

### Nav and footer

All automatic:
- New subjects appear in the "Coloring Pages" dropdown in the nav
- Difficulty links are in the mobile nav and footer
- Collections appear in the footer (up to 6, most recent first)
- Tags link is in the footer under "More"

---

## Writing guide

**Voice:** Casual, parent-to-parent. "Kids love them" not "Children will enjoy these." No hype words (amazing, wonderful, stunning).

**Titles:**
- Hub: "Cat Coloring Pages" (plural)
- Variant: "Cat with Bow Coloring Page" (singular)
- Collection: "Spring Coloring Pages" or "Easy Coloring Pages for Toddlers"

**Descriptions:** Under 160 chars. Always start with "Free printable".

**Body text:**
- Hub: 1–2 paragraphs — why kids like this subject, what's included, it's free
- Variant: 1 paragraph — describe this specific image
- Collection: 1–2 paragraphs — what the theme is, who it's for

**Tags:** Reuse existing ones (the script shows them). Include the subject (`cat`), a category (`animals`), and descriptors (`cute`, `spring`).

---

## Common mistakes

| Problem | Fix |
|---|---|
| Image not showing | `imageUrl` must exactly match the filename. Case matters. |
| Page not in grid | Check `draft: false` and file ends in `.md` |
| Hub not working | Must be `subject/index.md` — not `subject.md` |
| Duplicate ID warning | Don't name a variant the same as the folder. `palm-trees/palm-trees.md` breaks — use `palm-trees/single.md` |

---

## Editing pages by hand

If you ever want to skip the scripts and edit markdown directly, the frontmatter fields are:

**Coloring pages** — `title`, `description`, `pubDate` (YYYY-MM-DD), `difficulty` (easy/medium/hard), `imageUrl`, `tags`, `draft` (false to publish). Run `npm run pdfs` after.

**Collections** — `title`, `description`, `pubDate`, `filterTags` (array), `filterDifficulty` (optional), `manualSlugs` (optional array of specific page slugs), `draft`.
