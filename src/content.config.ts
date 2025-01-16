import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";
import { githubDiscussionsBlogLoader } from "github-discussions-blog-loader";

const baseSchema = z.object({
  title: z.string(),
  date: z.string().optional(),
});

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    heroImage: z.string().optional(),
  }),
});

const expectations = defineCollection({
  loader: glob({
    base: "./src/content/expectations",
    pattern: "**/*.{md,mdx}",
  }),
  schema: baseSchema,
});

const progress = defineCollection({
  loader: glob({ base: "./src/content/progress", pattern: "**/*.{md,mdx}" }),
  schema: baseSchema,
});

const outcomes = defineCollection({
  loader: glob({ base: "./src/content/outcomes", pattern: "**/*.{md,mdx}" }),
  schema: baseSchema,
});

const envData = import.meta.env;

const githubToken = String(envData.PUBLIC_GITHUB_TOKEN || "");
const repoName = String(envData.PUBLIC_GITHUB_REPO_NAME || "");
const repoOwner = String(envData.PUBLIC_GITHUB_OWNER_NAME || "");

let discussions;
if (githubToken && repoName && repoOwner) {
  discussions = defineCollection({
    loader: githubDiscussionsBlogLoader({
      auth: githubToken,
      repo: { name: repoName, owner: repoOwner },
      incremental: false,
    }),
  });
} else {
  console.warn(
    "GitHub discussions blog loader requires proper environment variables."
  );
  discussions = defineCollection({
    loader: async () => [],
  });
}

export const collections = {
  blog,
  expectations,
  outcomes,
  progress,
  discussions,
};
