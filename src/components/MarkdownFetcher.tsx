import { useEffect, useState } from "react";
import { marked } from "marked";

export default function MarkdownFetcher() {
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        const res = await fetch("/api/fetch-md");
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const md = await res.text();
        const stripped = md.replace(/^---[\s\S]*?---/, "").trim(); // Remove frontmatter
        setHtml(marked.parse(stripped));
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError("Error loading content.");
      }
    };

    fetchMarkdown();
  }, []);

  if (error) return <p>{error}</p>;
  if (!html) return <p>Loading...</p>;

  return (
    <article
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
