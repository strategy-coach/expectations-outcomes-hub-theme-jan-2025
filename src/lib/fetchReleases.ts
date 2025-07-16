import themeConfig from "../../theme.config";

/**
 * Fetch GitHub releases for the repo set in themeConfig.releaseListUrl.
 * - If token is present → use it.
 * - If no token → try anonymous fetch.
 * - Return releases + friendly error message if something fails.
 */
export async function fetchReleases() {
  const { releaseListUrl } = themeConfig || {};
  const perPage = 100;
  let page = 1;
  let allReleases: any[] = [];
  let error: string | null = null;

  const token = import.meta.env.PUBLIC_RELEASE_NOTES_GITHUB_TOKEN;

  try {
    while (true) {
      const url = `https://api.github.com/repos/${releaseListUrl}/releases?page=${page}&per_page=${perPage}`;

      const headers = token ? { Authorization: `token ${token}` } : {};

      if (!token && page === 1) {
        console.warn(
          "⚠ No GitHub token set in .env. Trying unauthenticated request (might fail for private repos)."
        );
      }

      const response = await fetch(url, { headers });
      console.log(`Fetching releases: ${url} → Status: ${response.status}`);

      if (!response.ok) {
        // Handle known errors with friendly messages
        if (response.status === 404) {
          error =
            "We couldn’t find the repository or it might be private. Please check the repository URL in theme.config or add your GitHub token in the .env file.";
        } else if (response.status === 401 || response.status === 403) {
          error =
            "Access denied or rate limit exceeded. This usually happens if the repository is private or the GitHub token is missing or invalid. Please add or check your token in the .env file.";
        } else {
          error = `Something went wrong while fetching release notes (HTTP ${response.status}). Please try again later.`;
        }
        break;
      }

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) break;

      allReleases = [...allReleases, ...data];
      page += 1;
    }
  } catch (e) {
    console.error("Error fetching releases:", e);
    error =
      "Unexpected error occurred while loading release notes. Please try again later.";
  }

  return { allReleases, error };
}
