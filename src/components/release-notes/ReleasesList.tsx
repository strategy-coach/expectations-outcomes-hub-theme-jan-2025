import React from "react";
import { marked } from "marked";

interface Release {
  id: number;
  name: string;
  body: string;
  html_url: string;
}

const ReleasesList: React.FC<{ allReleases: Release[] }> = ({
  allReleases,
}) => (
  <ul>
    {allReleases.map((release) => (
      <li key={release.id}>
        <h1 id={release.name.toLowerCase().replace(/\s+/g, "-")}>
          {release.name}
        </h1>
        <div dangerouslySetInnerHTML={{ __html: marked(release.body) }} />
        <a href={release.html_url} target="_blank" rel="noopener noreferrer">
          View Release
        </a>
      </li>
    ))}
  </ul>
);

export default ReleasesList;
