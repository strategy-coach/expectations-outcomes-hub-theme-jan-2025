// src/pages/api/download.ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const rawUrl = url.searchParams.get('url');
  const fileName = url.searchParams.get('name') || 'file';

  if (!rawUrl) {
    return new Response('Missing URL', { status: 400 });
  }

  const res = await fetch(rawUrl);
  if (!res.ok) {
    return new Response('Failed to fetch file', { status: 500 });
  }

  const fileBuffer = await res.arrayBuffer();

  return new Response(fileBuffer, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
};
