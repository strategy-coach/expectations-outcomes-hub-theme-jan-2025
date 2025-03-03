// @ts-check
import { defineConfig } from 'astro/config';
import node from "@astrojs/node";
import tailwind from '@astrojs/tailwind';

import react from '@astrojs/react';
import mdx from "@astrojs/mdx";
import remarkPlantUML from "@akebifiky/remark-simple-plantuml";
// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react(), mdx()],
  markdown: {
    remarkPlugins: [
      
      remarkPlantUML,
     
    ],
  },
  output: "server",
  // adapter: deno({
  //   mode: 'middleware' // or 'standalone'
  // }),
  adapter: node({
    mode: "standalone", // or 'middleware'
  })
});