// https://astro.build/config
import { defineConfig } from "astro/config";
  import node from "@astrojs/node";
  import tailwind from "@astrojs/tailwind";
  import react from "@astrojs/react";
  import mdx from "@astrojs/mdx";
  import { rehypeMermaid } from "@beoe/rehype-mermaid";
import plantuml from "astro-plantuml";
import process from "node:process";

process.loadEnvFile?.(".env");
const enableDiagramRendering = process.env.ENABLE_DIAGRAM_RENDERING === "true";

console.log("Diagram rendering enabled:", enableDiagramRendering);

export default defineConfig({
  integrations: [
    tailwind(),
    react(),
    mdx(),
    ...(enableDiagramRendering ? [plantuml()] : []),
  ],
  markdown: {
    syntaxHighlight: {
      type: "shiki",
      excludeLangs: ["mermaid", "math"],
    },
    rehypePlugins: [
      [
        rehypeMermaid,
        {
          strategy: "inline-svg",
        },
      ],
    ],
  },
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
});
