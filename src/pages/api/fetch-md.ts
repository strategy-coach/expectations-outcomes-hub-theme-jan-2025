import type { APIRoute } from "astro";
import fetch from 'node-fetch';
import matter from 'gray-matter';

export const GET: APIRoute = async () => {
  const GITHUB_TOKEN =
    import.meta.env.PUBLIC_GITHUB_TOKEN ??
    process.env.PUBLIC_GITHUB_TOKEN;
  const FOLDER_URL =
    "https://api.github.com/repos/opsfolio/docs.opsfolio.com/contents/content/docs/surveilr/evidence";

  const headers = {
    ...(GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {}),
    Accept: "application/vnd.github+json",
  };

  const res = await fetch(FOLDER_URL, { headers });

  if (!res.ok) {
    const body = await res.text();
    return new Response(
      `Error fetching folder contents: ${res.status} ${res.statusText}${body ? ` - ${body}` : ''}`,
      { status: 500 }
    );
  }

  const files = await res.json();
  const markdownFile = files.find((file: any) => file.name.endsWith('.mdx')) ??
    files.find((file: any) => file.name.endsWith('.md'));
  const otherFiles = files.filter((file: any) => !file.name.endsWith('.mdx') && !file.name.endsWith('.md'));

  let markdownContent = '';

  
  if (markdownFile) {
    const fileResponse = await fetch(markdownFile.download_url, {
      headers: {
        ...(GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {}),
        Accept: "application/vnd.github.v3.raw",
      },
    });
    if (!fileResponse.ok) {
      const body = await fileResponse.text();
      return new Response(
        `Error fetching markdown file: ${fileResponse.status} ${fileResponse.statusText}${body ? ` - ${body}` : ''}`,
        { status: 500 }
      );
    }
    const text = await fileResponse.text();
    const { content } = matter(text);
    const cleaned = content
      .replace(/^\s*import\s+.+?;\s*$/gm, '')
      .replace(/^\s*export\s+.+?;\s*$/gm, '')
      .trim();
    markdownContent = cleaned;
  }

  return new Response(JSON.stringify({
    markdownContent,
    otherFiles,
  }), {
    headers: { "Content-Type": "application/json" },
  });
};


// import type { APIRoute } from "astro";

// export const GET: APIRoute = async () => {
//     const GITHUB_TOKEN = import.meta.env.PUBLIC_GITHUB_TOKEN;
//     const FILE_URL ="https://api.github.com/repos/surveilr/www.surveilr.com/contents/src/content/docs/docs/evidence/surveilr-evidence-collection-guide.md";

 
//     const res = await fetch(FILE_URL, {
//     headers: {
//         Authorization: `token ${GITHUB_TOKEN}`,
//         Accept: "application/vnd.github.v3.raw",
//     },
//     });

//     if (!res.ok) {
//         return new Response("Error fetching markdown", { status: 500 });
//     }

//     const markdown = await res.text();
//     return new Response(markdown, {
//         headers: { "Content-Type": "text/plain" },
//     });
// };
