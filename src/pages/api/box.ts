// src/pages/api/box.ts
import type { APIRoute } from "astro";

const clientId = import.meta.env.BOX_CLIENT_ID;
const clientSecret = import.meta.env.BOX_CLIENT_SECRET;
let accessToken = import.meta.env.BOX_ACCESS_TOKEN;
let refreshToken = import.meta.env.BOX_REFRESH_TOKEN;
const folderId = import.meta.env.BOX_FOLDER_ID;



const refreshAccessToken = async () => {
  console.log("inisde refresh token............");
  const response = await fetch("https://api.box.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),

  }

);

  const data = await response.json();
  accessToken = data.access_token;
  refreshToken = data.refresh_token;
};

export const GET: APIRoute = async ({ url }) => {
  const fileId = url.searchParams.get("fileId");
  const download = url.searchParams.has("download"); // or get("download") === 'true'

  if (download && fileId) {
  // Handle file download
  const downloadResponse = await fetch(
    `https://api.box.com/2.0/files/${fileId}/content`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      redirect: "follow",
    }
  );

  if (downloadResponse.status === 401) {
    await refreshAccessToken();
    return new Response("Token expired, try again.", { status: 401 });
  }

  if (!downloadResponse.ok) {
    return new Response("Download failed", { status: 500 });
  }

  const fileBlob = await downloadResponse.blob();
  return new Response(fileBlob, {
    status: 200,
    headers: {
      "Content-Type": downloadResponse.headers.get("Content-Type") || "",
      "Content-Disposition": `attachment; filename="file.bin"`, // Optional: Replace with filename header if available
    },
  });
}

  // Handle folder listing
  let response = await fetch(
    `https://api.box.com/2.0/folders/${folderId}/items`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (response.status === 401) {
    await refreshAccessToken();
    response = await fetch(
      `https://api.box.com/2.0/folders/${folderId}/items`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  }

  if (!response.ok) {
    return new Response(JSON.stringify({ error: "Failed to fetch from Box" }), {
      status: 500,
    });
  }

  const folderData = await response.json();

  return new Response(JSON.stringify(folderData.entries || []), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
