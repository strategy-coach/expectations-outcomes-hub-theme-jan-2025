// src/lib/github.ts

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
  labels: { name: string }[];
  user: {
    login: string;
    html_url: string;
  };
  created_at: string;
  body: string;
}

/**
 * Fetch open GitHub issues (optionally filtered by label).
 */
export async function getGitHubIssues(label = ''): Promise<GitHubIssue[]> {
  const owner = `${import.meta.env.PUBLIC_GITHUB_OWNER}`; // 👈 Replace with your GitHub username
  const repo = `${import.meta.env.PUBLIC_GITHUB_REPO}`; // 👈 Replace with your actual repo
//console.log(owner, repo);
  const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=open${label ? `&labels=${label}` : ''}`;
//console.log(url);
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${import.meta.env.PUBLIC_GITHUB_PAT}`, // Optional: Add token if rate-limited
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API Error: ${response.statusText}`);
  }

  return await response.json();
}
export async function getGitHubIssue(issueNumber: string): Promise<GitHubIssue> {
  const owner = import.meta.env.PUBLIC_GITHUB_OWNER;
  const repo = import.meta.env.PUBLIC_GITHUB_REPO;

  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${import.meta.env.PUBLIC_GITHUB_PAT}`,
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API Error: ${response.statusText}`);
  }

  return await response.json();
}

export async function postGitHubComment(issueNumber: string, comment: string): Promise<void> {
  const owner = import.meta.env.PUBLIC_GITHUB_OWNER;
  const repo = import.meta.env.PUBLIC_GITHUB_REPO;

  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${import.meta.env.PUBLIC_GITHUB_PAT}`,
    },
    body: JSON.stringify({ body: comment }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API Error (comment): ${response.statusText}`);
  }
}

/**
 * Close a GitHub issue by updating its state.
 */
export async function closeGitHubIssue(issueNumber: string): Promise<void> {
  const owner = import.meta.env.PUBLIC_GITHUB_OWNER;
  const repo = import.meta.env.PUBLIC_GITHUB_REPO;

  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `Bearer ${import.meta.env.PUBLIC_GITHUB_PAT}`,
    },
    body: JSON.stringify({ state: 'closed' }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API Error (close): ${response.statusText}`);
  }
}
