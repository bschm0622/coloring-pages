# Adding Content

## The one rule about images

The `imageUrl` in your frontmatter must exactly match the filename in `public/coloring-pages/`.

If you upload `puppy-cute.png`, write `imageUrl: "/coloring-pages/puppy-cute.png"`.
If there's a mismatch, the image is broken (but the page still builds).

---

## Every subject is a folder

All coloring pages live in a folder named after the subject. Every folder has an `index.md` (the hub page) and optionally one or more variant `.md` files.

```
src/content/coloringPages/
  puppy/
    index.md        → /coloring-pages/puppy        (hub — shows gallery or single image)
    cute.md         → /coloring-pages/puppy/cute   (variant detail page)
    playful.md      → /coloring-pages/puppy/playful
  duck/
    index.md        → /coloring-pages/duck          (hub — shows image directly, no variants)
```

**Hub with variants** → the hub page shows a gallery grid of all variants.
**Hub with no variants** → the hub page shows the image directly (download button included).

---

## Adding a new subject

### Step 1 — Drop your image(s) in `public/coloring-pages/`

Name them descriptively: `cat-cute.png`, `cat-realistic.png`.

### Step 2 — Create `src/content/coloringPages/cat/index.md`

This is the hub page at `/coloring-pages/cat`.

```md
---
title: "Cat Coloring Pages"
description: "Free printable cat coloring pages for kids. Cute and realistic designs."
pubDate: 2026-03-05
difficulty: "easy"
imageUrl: "/coloring-pages/cat-cute.png"
tags: ["cat", "animals", "cute"]
draft: false
---

Write an intro paragraph here about these cat coloring pages.
```

### Step 3 (optional) — Create variant files

If you have more than one image, add a file per variant: `cat/cute.md`, `cat/realistic.md`, etc.

```md
---
title: "Cute Cat Coloring Page"
description: "A cute cat coloring page with big eyes and simple shapes. Great for kids."
pubDate: 2026-03-05
difficulty: "easy"
imageUrl: "/coloring-pages/cat-cute.png"
tags: ["cat", "animals", "cute"]
draft: false
---

Write a short paragraph about this specific variant here.
```

That's it. The hub appears in the site nav automatically. Variants appear in the hub gallery.

---

## Adding a variant to an existing subject

If you already have `puppy/` and add a new image `puppy-baby.png`:

1. Drop `puppy-baby.png` in `public/coloring-pages/`
2. Create `src/content/coloringPages/puppy/baby.md`
3. Done — it appears at `/coloring-pages/puppy/baby` and in the puppy hub gallery

---

## Frontmatter reference

| Field | Required | Notes |
|---|---|---|
| `title` | Yes | Shows in search results and page heading |
| `description` | Yes | Under 160 characters. Used for SEO. |
| `pubDate` | Yes | `YYYY-MM-DD` format |
| `difficulty` | Yes | `easy`, `medium`, or `hard` |
| `imageUrl` | Yes | Path to image: `/coloring-pages/filename.png` |
| `tags` | Yes | Array of keywords: `["cat", "animals", "cute"]` |
| `draft` | Yes | `false` to publish, `true` to hide |
| `pdfUrl` | No | Path to PDF version if you have one |

---

## Current subjects

| URL | Hub file | Variants |
|---|---|---|
| `/coloring-pages/axolotl` | `axolotl/index.md` | `cute` |
| `/coloring-pages/baby-lamb` | `baby-lamb/index.md` | none |
| `/coloring-pages/bunny` | `bunny/index.md` | `cute`, `realistic` |
| `/coloring-pages/dragon` | `dragon/index.md` | `cute`, `realistic` |
| `/coloring-pages/duck` | `duck/index.md` | none |
| `/coloring-pages/easter` | `easter/index.md` | `easter-bunny`, `easter-egg` |
| `/coloring-pages/lioness` | `lioness/index.md` | none |
| `/coloring-pages/penguin` | `penguin/index.md` | none |
| `/coloring-pages/pug` | `pug/index.md` | none |
| `/coloring-pages/puppy` | `puppy/index.md` | `cute`, `playful` |
| `/coloring-pages/t-rex` | `t-rex/index.md` | none |
| `/coloring-pages/unicorn` | `unicorn/index.md` | `plain`, `rainbow` |

---

## Common mistakes

**Image not showing:** Check that `imageUrl` exactly matches the filename in `public/coloring-pages/`. Case matters.

**Page not in grid:** Check `draft: false`. Check the file is saved with a `.md` extension.

**Hub not working:** The hub file must be named `index.md` inside the subject folder. Not `puppy.md`, not `puppies/index.md` — exactly `puppy/index.md`.

**Duplicate id warning / variant not showing up:** Never name a variant file the same as its parent folder. `palm-trees/palm-trees.md` collides with `palm-trees/index.md` — both resolve to the id `palm-trees`. Name variants after the image variation instead: `palm-trees/tropical-scene.md`, `palm-trees/single.md`, etc.

**Wrong URL:** The URL comes from the filename. `puppy/baby.md` → `/coloring-pages/puppy/baby`. Rename the file to change the URL.

**New subject not in nav:** Hub pages appear in the nav automatically. No config changes needed.
