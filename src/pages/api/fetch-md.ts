import type { APIRoute } from "astro";
import fetch from 'node-fetch';
import matter from 'gray-matter';

export const GET: APIRoute = async () => {
  const GITHUB_TOKEN = import.meta.env.PUBLIC_GITHUB_TOKEN;
  const FOLDER_URL = "https://api.github.com/repos/surveilr/www.surveilr.com/contents/src/content/docs/docs/evidence";

  const res = await fetch(FOLDER_URL, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3.raw",
    },
  });

  if (!res.ok) {
    return new Response("Error fetching folder contents", { status: 500 });
  }

  const files = await res.json();
  const markdownFile = files.find((file: any) => file.name.endsWith('.md'));
  const otherFiles = files.filter((file: any) => !file.name.endsWith('.md'));

  let markdownContent = '';
  if (markdownFile) {
    const fileResponse = await fetch(markdownFile.download_url, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3.raw",
      },
    });
    const text = await fileResponse.text();
    const stripped = text.replace(/^```yaml\s*([\s\S]*?)```[\r\n]+/, '').trim();
    
markdownContent = stripped;
   // markdownContent = parsed.content.trim(); // remove any leading/trailing whitespace
    
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
