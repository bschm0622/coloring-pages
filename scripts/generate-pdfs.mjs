/**
 * generate-pdfs.mjs
 *
 * For each coloring page content file:
 *   - Creates a single-page letter-size PDF from the PNG
 *   - Saves it to /public/coloring-pages/
 *   - Updates pdfUrl in the frontmatter
 *
 * For each hub page that has variants:
 *   - Creates a multi-page PDF with all variant images
 *   - Saves it alongside the singles
 *
 * Usage: node scripts/generate-pdfs.mjs
 */

import { PDFDocument } from "pdf-lib";
import { readFileSync, writeFileSync, readdirSync, statSync, unlinkSync, existsSync } from "fs";
import { join, dirname, basename, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");
const contentDir = join(root, "src/content/coloringPages");

// Letter size in PDF points (72pt = 1 inch)
const LETTER_W = 612; // 8.5"
const LETTER_H = 792; // 11"
const MARGIN = 36;    // 0.5" margin

/** Read all .md files recursively */
function findMdFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...findMdFiles(full));
    } else if (entry.endsWith(".md")) {
      results.push(full);
    }
  }
  return results;
}

/** Extract frontmatter value by key */
function getFrontmatterValue(content, key) {
  const match = content.match(new RegExp(`^${key}:\\s*["']?([^"'\\n]+)["']?`, "m"));
  return match ? match[1].trim() : null;
}

/** Set or update a frontmatter value */
function setFrontmatterValue(content, key, value) {
  const existingPattern = new RegExp(`^(${key}:).*$`, "m");
  const newLine = `${key}: "${value}"`;
  if (existingPattern.test(content)) {
    return content.replace(existingPattern, newLine);
  }
  // Insert after imageUrl line
  return content.replace(/(^imageUrl:.*$)/m, `$1\n${newLine}`);
}

/** Create a single-page PDF from a PNG path, return PDFDocument */
async function pngToPdf(pngPath) {
  const pngBytes = readFileSync(pngPath);
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([LETTER_W, LETTER_H]);
  const img = await pdfDoc.embedPng(pngBytes);

  const maxW = LETTER_W - MARGIN * 2;
  const maxH = LETTER_H - MARGIN * 2;
  const scale = Math.min(maxW / img.width, maxH / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const x = (LETTER_W - drawW) / 2;
  const y = (LETTER_H - drawH) / 2;

  page.drawImage(img, { x, y, width: drawW, height: drawH });
  return pdfDoc;
}

/** Add a PNG as a new page to an existing PDFDocument */
async function addPngPage(pdfDoc, pngPath) {
  const pngBytes = readFileSync(pngPath);
  const img = await pdfDoc.embedPng(pngBytes);
  const page = pdfDoc.addPage([LETTER_W, LETTER_H]);

  const maxW = LETTER_W - MARGIN * 2;
  const maxH = LETTER_H - MARGIN * 2;
  const scale = Math.min(maxW / img.width, maxH / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const x = (LETTER_W - drawW) / 2;
  const y = (LETTER_H - drawH) / 2;

  page.drawImage(img, { x, y, width: drawW, height: drawH });
}

async function main() {
  const mdFiles = findMdFiles(contentDir);

  // Hub pages: topic/index.md — variants: topic/anything-else.md
  const hubs = mdFiles.filter((f) => f.endsWith("/index.md"));
  const variants = mdFiles.filter((f) => !f.endsWith("/index.md"));

  // Build the set of PDF paths this run will produce, so we can clean up orphans
  const expectedPdfs = new Set();

  for (const mdPath of mdFiles) {
    const content = readFileSync(mdPath, "utf8");
    const imageUrl = getFrontmatterValue(content, "imageUrl");
    if (imageUrl) expectedPdfs.add(join(publicDir, imageUrl.replace(/\.png$/i, ".pdf")));
  }
  for (const hubPath of hubs) {
    const topic = basename(dirname(hubPath));
    const topicDir = dirname(hubPath);
    const topicVariants = variants.filter((v) => dirname(v) === topicDir);
    if (topicVariants.length > 0) {
      expectedPdfs.add(join(publicDir, "coloring-pages", `${topic}-pack.pdf`));
    }
  }

  // --- Delete orphaned PDFs ---
  const publicColoringDir = join(publicDir, "coloring-pages");
  let deleted = 0;
  for (const entry of readdirSync(publicColoringDir)) {
    if (!entry.endsWith(".pdf")) continue;
    const fullPath = join(publicColoringDir, entry);
    if (!expectedPdfs.has(fullPath)) {
      unlinkSync(fullPath);
      console.log(`  🗑 Deleted orphan: /coloring-pages/${entry}`);
      deleted++;
    }
  }

  let generated = 0;
  let skipped = 0;

  // --- Generate single-page PDFs for all individual pages ---
  for (const mdPath of mdFiles) {
    const content = readFileSync(mdPath, "utf8");
    const imageUrl = getFrontmatterValue(content, "imageUrl");
    if (!imageUrl) { skipped++; continue; }

    const pngPath = join(publicDir, imageUrl);
    try { readFileSync(pngPath); } catch {
      console.warn(`  MISSING PNG: ${imageUrl}`);
      skipped++;
      continue;
    }

    // Derive PDF path: same name, .pdf extension
    const pdfPublicPath = imageUrl.replace(/\.png$/i, ".pdf");
    const pdfDiskPath = join(publicDir, pdfPublicPath);

    // Skip if PDF already exists — delete it manually to force regeneration
    if (existsSync(pdfDiskPath)) {
      // Still ensure frontmatter is up to date
      const updated = setFrontmatterValue(content, "pdfUrl", pdfPublicPath);
      if (updated !== content) writeFileSync(mdPath, updated);
      skipped++;
      continue;
    }

    const pdfDoc = await pngToPdf(pngPath);
    const pdfBytes = await pdfDoc.save();
    writeFileSync(pdfDiskPath, pdfBytes);

    // Update frontmatter
    const updated = setFrontmatterValue(content, "pdfUrl", pdfPublicPath);
    if (updated !== content) writeFileSync(mdPath, updated);

    console.log(`  ✓ ${pdfPublicPath}`);
    generated++;
  }

  // --- Generate multi-page pack PDFs for hub pages with variants ---
  for (const hubPath of hubs) {
    const topic = basename(dirname(hubPath)); // e.g. "unicorn"
    const topicDir = dirname(hubPath);
    const topicVariants = variants.filter((v) => dirname(v) === topicDir);
    if (topicVariants.length === 0) continue;

    const packPdfPublicPath = `/coloring-pages/${topic}-pack.pdf`;
    const packPdfDiskPath = join(publicDir, packPdfPublicPath);

    const packDoc = await PDFDocument.create();
    let addedPages = 0;

    for (const varPath of topicVariants) {
      const varContent = readFileSync(varPath, "utf8");
      const imageUrl = getFrontmatterValue(varContent, "imageUrl");
      if (!imageUrl) continue;
      const pngPath = join(publicDir, imageUrl);
      try {
        readFileSync(pngPath);
        await addPngPage(packDoc, pngPath);
        addedPages++;
      } catch {
        console.warn(`  MISSING PNG for pack: ${imageUrl}`);
      }
    }

    if (addedPages > 0) {
      const packBytes = await packDoc.save();
      writeFileSync(packPdfDiskPath, packBytes);

      // Update hub frontmatter with packPdfUrl → we use pdfUrl on the hub
      const hubContent = readFileSync(hubPath, "utf8");
      const updated = setFrontmatterValue(hubContent, "pdfUrl", packPdfPublicPath);
      if (updated !== hubContent) writeFileSync(hubPath, updated);

      console.log(`  ✓ PACK: ${packPdfPublicPath} (${addedPages} pages)`);
      generated++;
    }
  }

  console.log(`\nDone. Generated: ${generated}, Deleted: ${deleted}, Skipped: ${skipped}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
