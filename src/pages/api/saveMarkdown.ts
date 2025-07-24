import type { APIRoute } from "astro";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import util from "util";
import * as cookie from "cookie";
import { getUserMetaData } from "../../components/profile/userService";

const execAsync = util.promisify(exec);

// Validate token works
const validateGitHubToken = async (token: string): Promise<boolean> => {
  try {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${token}`,
        "User-Agent": "opsfolio-token-validator",
      },
    });
    return res.ok;
  } catch {
    return false;
  }
};

// Get GitHub username & email using the token
const getGitHubUserInfo = async (
  token: string
): Promise<{ login: string; email: string }> => {
  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `token ${token}`,
      "User-Agent": "opsfolio-token-validator",
    },
  });
  const userData = await userRes.json();

  let email = userData.email as string | null;

  if (!email) {
    // Try to get primary email if email is private
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `token ${token}` },
    });
    const emailsData = await emailsRes.json();
    email = emailsData.find((e: any) => e.primary && e.verified)?.email ?? "";
  }

  return { login: userData.login, email: email ?? "" };
};

export const POST: APIRoute = async ({ request }) => {
  try {
    // Read env variables inside the handler
    const owner = import.meta.env.PUBLIC_CONTENT_GITHUB_OWNER;
    const repo = import.meta.env.PUBLIC_CONTENT_GITHUB_REPO;

    // Validate that env variables are set
    if (!owner || !repo) {
      console.error(
        "Missing GitHub repository info: owner or repo name is undefined"
      );
      return new Response(
        JSON.stringify({
          error:
            "Server misconfiguration: GitHub repository information is missing in environment variables",
        }),
        { status: 500 }
      );
    }

    const { slug, content, commitMessage } = await request.json();

    if (!slug || !content || !commitMessage) {
      return new Response(
        JSON.stringify({ error: "Missing slug, content, or commit message" }),
        { status: 400 }
      );
    }

    // Parse cookies to get userId
    const cookies = cookie.parse(request.headers.get("cookie") || "");
    const userId = cookies["zitadel_user_id"];
    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID missing" }), {
        status: 401,
      });
    }

    // Get token from metadata
    const userMetaData = await getUserMetaData(userId);
    let token = "";
    if (userMetaData?.result) {
      for (const item of userMetaData.result) {
        if (item.key === "gitHubToken") {
          token = atob(item.value);
          break;
        }
      }
    }

    if (!token) {
      return new Response(
        JSON.stringify({ error: "GitHub token not found in metadata" }),
        { status: 403 }
      );
    }

    // Validate token
    const isValid = await validateGitHubToken(token);
    if (!isValid) {
      return new Response(
        JSON.stringify({
          error: "Invalid GitHub token. Please update your profile.",
        }),
        { status: 401 }
      );
    }

    // Get actual GitHub user info
    const { login, email } = await getGitHubUserInfo(token);
    if (!login || !email) {
      return new Response(
        JSON.stringify({ error: "Could not fetch GitHub user info" }),
        { status: 500 }
      );
    }

    // Resolve file path
    const cleanedSlug = slug.replace(/^\/+|\/+$/g, "");
    const baseDir = path.resolve("src/content");
    const mdPath = path.join(baseDir, `${cleanedSlug}.md`);
    const mdxPath = path.join(baseDir, `${cleanedSlug}.mdx`);

    let fullFilePath = mdPath;
    try {
      await fs.access(mdxPath);
      fullFilePath = mdxPath;
    } catch {
      // fallback to .md
    }

    const relativeFilePath = path.relative(path.resolve("."), fullFilePath);

    await fs.mkdir(path.dirname(fullFilePath), { recursive: true });
    await fs.writeFile(fullFilePath, content, "utf-8");

    // Make commit under GitHub user identity
    await execAsync(`git config user.name "${login}"`);
    await execAsync(`git config user.email "${email}"`);
    await execAsync(`git add ${relativeFilePath}`);
    await execAsync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`);

    //  Push using HTTPS token auth
    // // const remoteUrl = `https://${token}@github.com/strategy-coach/expectations-outcomes-hub-theme-jan-2025.git`;
    const remoteUrl = `https://${token}@github.com/${owner}/${repo}.git`;
    await execAsync(`git remote set-url origin ${remoteUrl}`);
    await execAsync(`git push origin main`);

    return new Response(JSON.stringify({ message: "Saved and committed" }), {
      status: 200,
    });
  } catch (err: any) {
    console.error("Error saving or pushing:", err);
    if (err.stderr?.includes("Authentication failed")) {
      return new Response(
        JSON.stringify({
          error: "Invalid GitHub token. Please update your profile.",
        }),
        { status: 401 }
      );
    }
    return new Response(JSON.stringify({ error: "Failed to save or commit" }), {
      status: 500,
    });
  }
};
