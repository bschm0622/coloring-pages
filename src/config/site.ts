export const siteConfig = {
  name: "Find Coloring Pages",
  url: "https://findcoloringpages.com",
  description:
    "Free printable coloring pages for kids and adults. Browse hundreds of coloring sheets by category.",
  author: {
    name: "Becky Schmidt",
    email: "findcoloringpages@gmail.com",
    twitter: "",
  },
  nav: [
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
  ],
  social: {
    twitter: "",
    github: "",
    pinterest: "https://www.pinterest.com/findcoloringpages/",
  },
  defaultOgImage: "/og-default.png",
} as const;
