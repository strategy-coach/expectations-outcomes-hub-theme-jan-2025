import fetch from 'node-fetch';
import { readFileSync, writeFileSync } from 'fs';
import process from "node:process";

const loadDotEnv = () => {
  if (process.env.PUBLIC_GITHUB_TOKEN) return;
  try {
    const raw = readFileSync('.env', 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (key && !(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // No .env file available; continue without it.
  }
};

loadDotEnv();

const owner = 'opsfolio';
const repo = 'docs.opsfolio.com';
const branch = 'main'; // or 'master'
const filePath =
  'content/docs/surveilr/evidence/surveilr-evidence-collection-guide.mdx';
//const perPage = 20;

// Optional: use a GitHub token for private repos or high request limits
const token = process.env.PUBLIC_GITHUB_TOKEN;
//const url = `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch}`;
const url = `https://api.github.com/repos/${owner}/${repo}/commits?path=${filePath}&sha=${branch}`;

const headers = {
  'Accept': 'application/vnd.github.v3+json',
  ...(token && { Authorization: `Bearer ${token}` })
};

const res = await fetch(url, { headers });

if (!res.ok) {
  console.warn(
    '⚠️ Failed to fetch commits. Writing empty commit list to avoid build failure:',
    `${res.status} ${res.statusText}`
  );
  writeFileSync('./surveilr-commit-details/commits.json', JSON.stringify([], null, 2));
  process.exit(0);
}

const rawCommits = await res.json();

const commits = rawCommits.map(c => ({
  //hash: c.sha.slice(0, 7),
  authorName: c.commit.author.name,
  authorDate: c.commit.author.date.slice(0, 10),
  subject: c.commit.message,
  url: c.html_url,
}));

writeFileSync('./surveilr-commit-details/commits.json', JSON.stringify(commits, null, 2));
console.log(`✅ ${commits.length} commits saved.`);
