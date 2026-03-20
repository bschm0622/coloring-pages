#!/usr/bin/env node

/**
 * new-collection.mjs — Create a new collection page.
 *
 * Usage:
 *   node scripts/new-collection.mjs
 *
 * Collections pull in coloring pages by tag, difficulty, or specific slugs.
 * They appear at /collections/[slug] and in the nav + footer automatically.
 */

import { writeFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createInterface } from "readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const collectionsDir = join(root, "src/content/collections");
const contentDir = join(root, "src/content/coloringPages");

function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans.trim()); }));
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function getExistingTags() {
  const tags = new Map();
  function scan(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        scan(join(dir, entry.name));
      } else if (entry.name.endsWith(".md")) {
        const content = require("fs").readFileSync(join(dir, entry.name), "utf-8");
        const match = content.match(/tags:\s*\[([^\]]*)\]/);
        if (match) {
          match[1].split(",").map(t => t.trim().replace(/"/g, "")).filter(Boolean).forEach(t => {
            tags.set(t.toLowerCase(), (tags.get(t.toLowerCase()) ?? 0) + 1);
          });
        }
      }
    }
  }
  scan(contentDir);
  return Array.from(tags.entries()).sort((a, b) => b[1] - a[1]);
}

async function main() {
  console.log("\n  Create a new collection\n");

  // Show existing tags
  const tags = getExistingTags();
  console.log("  Existing tags (by count):");
  const tagDisplay = tags.slice(0, 20).map(([t, c]) => `${t} (${c})`).join(", ");
  console.log(`  ${tagDisplay}`);
  if (tags.length > 20) console.log(`  ... and ${tags.length - 20} more (run site and check /tags for full list)`);
  console.log();

  // Title
  const title = await ask("Title (e.g. Spring Coloring Pages): ");
  if (!title) { console.error("Title is required."); process.exit(1); }

  // Description
  const description = await ask("Description (under 160 chars): ");
  if (!description) { console.error("Description is required."); process.exit(1); }
  if (description.length > 160) {
    console.warn(`  Warning: ${description.length} chars (max 160).`);
  }

  // Filter tags
  const filterTagsInput = await ask("Filter by tags (comma-separated, or Enter to skip): ");
  const filterTags = filterTagsInput
    ? filterTagsInput.split(",").map(t => t.trim().toLowerCase()).filter(Boolean)
    : [];

  // Filter difficulty
  const filterDifficulty = await ask("Filter by difficulty (easy/medium/hard, or Enter to skip): ") || "";

  // Body
  const body = await ask("Intro paragraph (or Enter to leave as TODO): ");

  // Build frontmatter
  let frontmatter = `---\ntitle: "${title}"\ndescription: "${description}"\npubDate: ${today()}\n`;
  if (filterTags.length > 0) {
    frontmatter += `filterTags: [${filterTags.map(t => `"${t}"`).join(", ")}]\n`;
  }
  if (filterDifficulty) {
    frontmatter += `filterDifficulty: "${filterDifficulty}"\n`;
  }
  frontmatter += `draft: false\n---\n\n${body || "TODO: Write an intro paragraph for this collection."}\n`;

  // Write file
  const slug = slugify(title);
  const filePath = join(collectionsDir, `${slug}.md`);

  if (existsSync(filePath)) {
    console.error(`\n  File already exists: ${filePath}`);
    process.exit(1);
  }

  writeFileSync(filePath, frontmatter);
  console.log(`\n  Created: ${filePath}`);
  console.log(`  URL: /collections/${slug}`);
  console.log("\n  Run `npm run dev` to preview.\n");
}

main().catch(console.error);
