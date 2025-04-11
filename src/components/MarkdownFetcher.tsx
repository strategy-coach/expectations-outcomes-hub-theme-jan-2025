import { useEffect, useState } from "react";
import { marked } from "marked";

export default function GithubDataFetcher() {
  const [data, setData] = useState({ markdownContent: "", otherFiles: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/fetch-md");
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        const result = await res.json();
        setData(result);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError("Error loading content.");
      }
    };

    fetchData();
  }, []);

  if (error) return <p>{error}</p>;
  if (!data.markdownContent && data.otherFiles.length === 0) return <p>Loading...</p>;

  return (
    <div>
      <article
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: marked.parse(data.markdownContent) }}
      />
      <h2>Downloadable Files</h2>
      <ul>
        {data.otherFiles.map((file) => (
          <li key={file.sha}>
            <a href={file.download_url} download>{file.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}



// import { useEffect, useState } from "react";
// import { marked } from "marked";

// export default function MarkdownFetcher() {
//   const [html, setHtml] = useState("");
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchMarkdown = async () => {
//       try {
//         const res = await fetch("/api/fetch-md");
//         if (!res.ok) throw new Error(`Status: ${res.status}`);
//         const md = await res.text();
//         const stripped = md.replace(/^---[\s\S]*?---/, "").trim(); // Remove frontmatter
//         setHtml(marked.parse(stripped));
//       } catch (err: any) {
//         console.error("Fetch error:", err);
//         setError("Error loading content.");
//       }
//     };

//     fetchMarkdown();
//   }, []);

//   if (error) return <p>{error}</p>;
//   if (!html) return <p>Loading...</p>;

//   return (
//     <article
//       className="prose max-w-none"
//       dangerouslySetInnerHTML={{ __html: html }}
//     />
//   );
// }
