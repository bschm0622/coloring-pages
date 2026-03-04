import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
  const pages = await getCollection("coloringPages", ({ data }) => !data.draft);

  const index = pages.map((page) => ({
    slug: page.slug,
    title: page.data.title,
    description: page.data.description,
    category: page.data.category,
    tags: page.data.tags,
    difficulty: page.data.difficulty,
    url: `/coloring-pages/${page.slug}/`,
  }));

  return new Response(JSON.stringify(index), {
    headers: { "Content-Type": "application/json" },
  });
};
