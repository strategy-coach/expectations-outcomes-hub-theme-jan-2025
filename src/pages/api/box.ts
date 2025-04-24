// src/pages/api/box.ts
import type { APIRoute } from "astro";
import fs from "fs/promises";
import path from "path";

// File path for token storage
const authPath = path.resolve("src/keys/box-auth.json");

// Client ID/secret still from .env (these don’t rotate)
const clientId = import.meta.env.BOX_CLIENT_ID;
const clientSecret = import.meta.env.BOX_CLIENT_SECRET;

// Initial tokens (will be loaded from JSON)
let accessToken = "";
let refreshToken = "";

// Load tokens from box-auth.json
try {
  const tokenData = await fs.readFile(authPath, "utf-8");
  const parsed = JSON.parse(tokenData);
  console.log(["🔑 Loaded Box tokens from file:", parsed]);
  accessToken = parsed.accessToken;
  refreshToken = parsed.refreshToken;
} catch (err) {
  console.error("❌ Failed to load Box tokens from file:", err);
}

// Function to refresh access token and save updated tokens
const refreshAccessToken = async (): Promise<boolean> => {
  console.log("🔄 Refreshing Box access token...");
  try {
    const response = await fetch("https://api.box.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();
    if (!data.access_token || !data.refresh_token) {
      console.error("❌ Failed to refresh tokens:", data);
      return false;
    }

    accessToken = data.access_token;
    refreshToken = data.refresh_token;

    await fs.writeFile(
      authPath,
      JSON.stringify({ accessToken, refreshToken }, null, 2)
    );
    console.log("✅ Tokens refreshed and saved.");
    return true;
  } catch (err) {
    console.error("❌ Error refreshing access token:", err);
    return false;
  }
};

// Main handler
export const GET: APIRoute = async ({ url }) => {
  const fileId = url.searchParams.get("fileId");
  const download = url.searchParams.has("download");
  const folderId = import.meta.env.BOX_FOLDER_ID;

  // 📦 File Download
  if (download && fileId) {
    let response = await fetch(
      `https://api.box.com/2.0/files/${fileId}/content`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        redirect: "follow",
      }
    );

    if (response.status === 401) {
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        return new Response(
          JSON.stringify({ error: "Session expired. Please re-authenticate." }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Retry the original request
      response = await fetch(
        `https://api.box.com/2.0/folders/${folderId}/items`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
    }

    if (!response.ok) return new Response("Download failed", { status: 500 });

    const fileBlob = await response.blob();
    return new Response(fileBlob, {
      status: 200,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileId}"`,
      },
    });
  }

  // 📁 Folder Listing
  let res = await fetch(`https://api.box.com/2.0/folders/${folderId}/items`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401) {
    await refreshAccessToken();
    res = await fetch(`https://api.box.com/2.0/folders/${folderId}/items`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  if (!res.ok) {
    return new Response(JSON.stringify({ error: "Failed to fetch from Box" }), {
      status: 500,
    });
  }

  const folderData = await res.json();
  return new Response(JSON.stringify(folderData.entries || []), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
