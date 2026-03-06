# Pre-Launch Checklist

## ✅ 1. Formspree — Email Collection (15 min)

The email signup form (footer + popup on coloring pages) needs a real Formspree ID.

1. Go to [formspree.io](https://formspree.io) and create a free account
2. Create a new form — name it "Find Coloring Pages Signups"
3. Copy the form ID from the URL (looks like `xpwzabcd`)
4. Replace `YOUR_FORM_ID` in **two files**:
   - `src/components/EmailSignup.astro` — line 4
   - `src/components/EmailPopup.astro` — line 3

Free tier: 50 submissions/month. Upgrade ($10/mo) when you need more.

---

## 2. ✅ OG Image — Social Sharing (30 min)

`public/og-default.png` doesn't exist yet. This is the image that appears when
someone shares a link on Twitter, iMessage, Slack, etc.

**Specs:** 1200 × 630px PNG

**Quickest option:** Use [og-image.vercel.app](https://og-image.vercel.app) or
Canva to create a simple image with:
- Site name: "Find Coloring Pages"
- Tagline: "Free printable coloring pages for kids"
- A light background (white or soft color)

Save as `public/og-default.png`.

Individual coloring pages already use their image as the OG image — this default
is only used for the homepage, blog index, about page, etc.

---

## ✅ 3. Favicon (10 min)

Favicons exist (`public/favicon.ico` + `public/favicon.svg`) but are likely the
default Astro logo. Replace with something on-brand — even just a simple pencil
or crayon emoji turned into an SVG works fine.

Easiest: use [favicon.io](https://favicon.io/emoji-favicons/) to generate from
an emoji (try 🖍️ or ✏️), then replace both files in `public/`.

---

## 4. Fill In Site Author Info (5 min)

Open `src/config/site.ts` and fill in:

```ts
author: {
  name: "Your Name",
  email: "you@example.com",  // used in RSS feed
  twitter: "",               // optional
},
```

This populates the RSS feed metadata. Not critical for launch but good to have.

---

## 5. Verify Build Passes (5 min)

```bash
npm run build
```

Should complete with no errors. Check that these files exist in `dist/` after:
- `dist/sitemap-index.xml`
- `dist/robots.txt`
- `dist/rss.xml`
- `dist/search.json`

---

## 6. Deploy (20–30 min)

Recommended: **Netlify** (simplest Astro support, free tier)

1. Push this repo to GitHub if not already there
2. Go to [netlify.com](https://netlify.com) → "Add new site" → "Import from Git"
3. Select your repo
4. Build settings (Netlify usually auto-detects these):
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click Deploy

Alternatives: Vercel or Cloudflare Pages — both work equally well with Astro.

---

## 7. Connect Domain (15–30 min, depends on registrar)

After deploying to Netlify/Vercel/Cloudflare:

1. In your host's dashboard, go to "Domain settings" and add `findcoloringpages.com`
2. Update your domain registrar's nameservers to point to your host, OR
   add the CNAME/A records they provide
3. SSL/HTTPS is automatic on all three hosts

DNS propagation takes anywhere from a few minutes to a few hours.

---

## 8. Google Search Console (10 min, after DNS is live)

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property → enter `https://findcoloringpages.com`
3. Verify ownership (HTML file method is easiest — download the file, put it in `public/`)
4. Submit sitemap: `https://findcoloringpages.com/sitemap-index.xml`

This tells Google your site exists and accelerates indexing.

---

## Done ✓ (already set up)

- Sitemap (`/sitemap-index.xml`) — auto-generated at build
- Robots.txt (`/robots.txt`) — auto-generated, points to sitemap
- RSS feed (`/rss.xml`) — pulls from blog collection
- Search (`/search.json`) — build-time index for Fuse.js
- SEO meta tags — title, description, canonical, OG, JSON-LD on every page
- 10 coloring pages across 5 categories
- 2 blog posts
- Email popup on coloring page detail pages
- Email signup form in footer
