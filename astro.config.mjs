// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import remarkPlantUML from "@akebifiky/remark-simple-plantuml";
//import rehypeMermaid from "rehype-mermaid";
import { rehypeMermaid } from "@beoe/rehype-mermaid";
import { getCache } from "@beoe/cache";

const cache = await getCache();

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react(), mdx()],
  markdown: {
    syntaxHighlight: {
      type: "shiki",
      excludeLangs: ["mermaid", "math"],
    },
    remarkPlugins: [remarkPlantUML],
    //rehypePlugins: [rehypeMermaid],
    rehypePlugins: [
      [
        rehypeMermaid,
        {
          strategy: "file",      // alternatively use "data-url"
          fsPath: "public/beoe", // add this to gitignore
          webPath: "/beoe",
          cache,
        },
      ],
    ],
  },
  output: "server",
  // adapter: deno({
  //   mode: 'middleware' // or 'standalone'
  // }),
  adapter: node({
    mode: "standalone", // or 'middleware'
  }),
});
