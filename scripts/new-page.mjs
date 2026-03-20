#!/usr/bin/env node

/**
 * new-page.mjs — Create a new coloring page with frontmatter pre-filled.
 *
 * Usage:
 *   node scripts/new-page.mjs                        (interactive prompts)
 *   node scripts/new-page.mjs cat "Cat with Bow"     (subject + title, skips prompts)
 *
 * What it does:
 *   1. Creates the folder + index.md if the subject is new
 *   2. Creates a variant .md file if the subject already exists
 *   3. Inherits tags and difficulty from the hub's index.md when adding variants
 *   4. Runs generate-pdfs.mjs at the end
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createInterface } from "readline";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const contentDir = join(root, "src/content/coloringPages");
const publicDir = join(root, "public/coloring-pages");

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

function parseHubFrontmatter(hubPath) {
  const content = readFileSync(hubPath, "utf-8");
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = match[1];
  const tags = fm.match(/tags:\s*\[([^\]]*)\]/)?.[1]?.split(",").map(t => t.trim().replace(/"/g, "")) ?? [];
  const difficulty = fm.match(/difficulty:\s*"?(\w+)"?/)?.[1] ?? "easy";
  return { tags, difficulty };
}

function listImages() {
  if (!existsSync(publicDir)) return [];
  return readdirSync(publicDir).filter(f => f.endsWith(".png"));
}

async function main() {
  let [,, subjectArg, titleArg] = process.argv;

  // Step 1: Subject
  let subject = subjectArg;
  if (!subject) {
    subject = await ask("Subject (e.g. cat, puppy, easter): ");
  }
  subject = slugify(subject);
  if (!subject) { console.error("Subject is required."); process.exit(1); }

  const subjectDir = join(contentDir, subject);
  const hubPath = join(subjectDir, "index.md");
  const isNewSubject = !existsSync(hubPath);

  if (isNewSubject) {
    console.log(`\n  New subject: "${subject}" — will create hub page.\n`);
  } else {
    console.log(`\n  Adding variant to existing subject: "${subject}"\n`);
  }

  // Step 2: Title
  let title = titleArg;
  if (!title) {
    const defaultTitle = isNewSubject
      ? subject.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ") + " Coloring Pages"
      : "";
    title = await ask(`Title${defaultTitle ? ` [${defaultTitle}]` : ""}: `) || defaultTitle;
  }
  if (!title) { console.error("Title is required."); process.exit(1); }

  // Step 3: Pick image
  const images = listImages();
  const subjectImages = images.filter(f => f.startsWith(subject));
  if (subjectImages.length > 0) {
    console.log(`  Images matching "${subject}":`);
    subjectImages.forEach((f, i) => console.log(`    ${i + 1}. ${f}`));
  }
  let imageFile = await ask("Image filename (e.g. cat-bow.png): ");
  if (!imageFile) { console.error("Image filename is required."); process.exit(1); }
  if (!imageFile.endsWith(".png")) imageFile += ".png";
  const imageUrl = `/coloring-pages/${imageFile}`;

  // Step 4: Description
  const description = await ask("Description (under 160 chars): ");
  if (!description) { console.error("Description is required."); process.exit(1); }
  if (description.length > 160) {
    console.warn(`  Warning: description is ${description.length} chars (max 160).`);
  }

  // Step 5: Difficulty + tags
  let difficulty, tags;
  if (isNewSubject) {
    difficulty = await ask("Difficulty (easy/medium/hard) [easy]: ") || "easy";
    const tagsInput = await ask(`Tags (comma-separated) [${subject}]: `) || subject;
    tags = tagsInput.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
  } else {
    const hub = parseHubFrontmatter(hubPath);
    const hubDifficulty = hub.difficulty;
    const hubTags = hub.tags;
    console.log(`  Hub defaults — difficulty: ${hubDifficulty}, tags: [${hubTags.join(", ")}]`);
    difficulty = await ask(`Difficulty (easy/medium/hard) [${hubDifficulty}]: `) || hubDifficulty;
    const tagsInput = await ask(`Tags (comma-separated) [${hubTags.join(", ")}]: `);
    tags = tagsInput
      ? tagsInput.split(",").map(t => t.trim().toLowerCase()).filter(Boolean)
      : hubTags;
  }

  // Step 6: Body text
  const body = await ask("One-line body text (or Enter to leave blank): ");

  // Build frontmatter
  const tagsStr = tags.map(t => `"${t}"`).join(", ");
  const md = `---
title: "${title}"
description: "${description}"
pubDate: ${today()}
difficulty: "${difficulty}"
imageUrl: "${imageUrl}"
tags: [${tagsStr}]
draft: false
---

${body || `TODO: Write a short description of this coloring page.`}
`;

  // Write file
  if (isNewSubject) {
    mkdirSync(subjectDir, { recursive: true });
    writeFileSync(hubPath, md);
    console.log(`\n  Created: ${hubPath}`);
  } else {
    const variantSlug = slugify(title.replace(/coloring pages?/i, "").replace(subject, "").trim()) || slugify(title);
    const variantPath = join(subjectDir, `${variantSlug}.md`);
    if (existsSync(variantPath)) {
      console.error(`\n  File already exists: ${variantPath}`);
      process.exit(1);
    }
    writeFileSync(variantPath, md);
    console.log(`\n  Created: ${variantPath}`);
  }

  // Step 7: Generate PDFs
  console.log("\n  Running generate-pdfs.mjs...\n");
  try {
    execSync("node scripts/generate-pdfs.mjs", { cwd: root, stdio: "inherit" });
  } catch {
    console.warn("  PDF generation had an issue — you can run it manually later.");
  }

  console.log("\n  Done! Run `npm run dev` to preview.\n");
}

main().catch(console.error);
