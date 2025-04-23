import fetch from 'node-fetch';
import { writeFileSync } from 'fs';
import process from "node:process";

const owner = 'surveilr';
const repo = 'www.surveilr.com';
const branch = 'main'; // or 'master'
const filePath = "src/content/docs/docs/evidence/surveilr-evidence-collection-guide.md";
//const perPage = 20;

// Optional: use a GitHub token for private repos or high request limits
const token = process.env.GITHUB_TOKEN;


//const url = `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch}`;
const url = `https://api.github.com/repos/${owner}/${repo}/commits?path=${filePath}&sha=${branch}`;

const headers = {
  'Accept': 'application/vnd.github.v3+json',
  ...(token && { Authorization: `Bearer ${token}` })
};

const res = await fetch(url, { headers });

if (!res.ok) {
  console.error('❌ Failed to fetch commits:', res.statusText);
  process.exit(1);
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
