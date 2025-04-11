import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
    const GITHUB_TOKEN = import.meta.env.PUBLIC_GITHUB_TOKEN;
    const FILE_URL ="https://api.github.com/repos/surveilr/www.surveilr.com/contents/src/content/docs/docs/evidence/surveilr-evidence-collection-guide.md";

 
    const res = await fetch(FILE_URL, {
    headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3.raw",
    },
    });

    if (!res.ok) {
        return new Response("Error fetching markdown", { status: 500 });
    }

    const markdown = await res.text();
    return new Response(markdown, {
        headers: { "Content-Type": "text/plain" },
    });
};
