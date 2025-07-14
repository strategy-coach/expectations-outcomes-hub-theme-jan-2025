import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";
import { githubDiscussionsBlogLoader } from "github-discussions-blog-loader";

const baseSchema = z.object({
  title: z.string(),
  date: z.string().optional(),
  description: z.string().optional(),
  discussionsEnabled: z.boolean().optional().default(false),
  enableEditButton: z.boolean().optional().default(false),
  enableReaction: z.boolean().optional().default(false),
  enablePageHistory: z.boolean().optional().default(true),
  redirect: z.string().optional(),
  summary: z.string().optional(),
  home: z
    .object({
      skipTo: z
        .object({
          category: z.string().optional(),
        })
        .optional(),
      keyResources: z
        .object({
          category: z.string().optional(),
        })
        .optional(),
      meetingMinutes: z
        .object({
          category: z.string().optional(),
        })
        .optional(),
      accomplishments: z
        .object({
          category: z.string().optional(),
        })
        .optional(),
      ItGovernance: z
        .object({
          category: z.string().optional(),
        })
        .optional(),
      featuredBlogs: z
        .object({
          category: z.string().optional(),
        })
        .optional(),
      whatsNext: z
        .object({
          category: z.string().optional(),
          order: z.number().optional(),
          status: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    date: z.string().refine((date) => /^\d{4}-\d{2}-\d{2}$/.test(date), {
      message: "Date must be in format YYYY-MM-DD",
    }),
    description: z.string(),
    featuredImage: z.string().optional(),
    thumbImage: z.string().optional(),
    home: z
      .object({
        featuredBlog: z.boolean().optional(),
      })
      .optional(),
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

const documentation = defineCollection({
  loader: glob({
    base: "./src/content/documentation",
    pattern: "**/*.{md,mdx}",
  }),
  schema: z.object({
    title: z.string().optional(),
    draft: z.boolean().optional(),
    enableEditButton: z.boolean().optional().default(false),
  }),
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
  documentation,
};
