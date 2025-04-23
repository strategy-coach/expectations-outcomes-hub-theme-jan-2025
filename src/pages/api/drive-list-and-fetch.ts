import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import type { APIRoute } from 'astro';

const GDRIVE_JSON_PATH = import.meta.env.GDRIVE_JSON_PATH;

const keyFilePath = path.resolve(GDRIVE_JSON_PATH);

const auth = new google.auth.GoogleAuth({
  keyFile: keyFilePath,
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

export const GET: APIRoute = async () => {
  try {
    const drive = google.drive({ version: 'v3', auth: await auth.getClient() });

    // Step 1: List all files
    const fileList = await drive.files.list({
      q: "mimeType != 'application/vnd.google-apps.folder'",
      fields: 'files(id, name, mimeType)',
    });

    const files = fileList.data.files || [];

    const fileContents = [];

    for (const file of files) {
      let content = '';
      try {
        // Handle Google Docs/Sheets differently
        if (file.mimeType?.includes('application/vnd.google-apps')) {
          const exportMimeType =
            file.mimeType === 'application/vnd.google-apps.document'
              ? 'text/plain'
              : file.mimeType === 'application/vnd.google-apps.spreadsheet'
              ? 'text/csv'
              : 'application/pdf';

          const exported = await drive.files.export(
            { fileId: file.id!, mimeType: exportMimeType },
            { responseType: 'stream' }
          );

          const chunks: Uint8Array[] = [];
          await new Promise((resolve, reject) => {
            exported.data
              .on('data', (chunk) => chunks.push(chunk))
              .on('end', resolve)
              .on('error', reject);
          });

          content = Buffer.concat(chunks).toString('utf-8');
        } else {
          // For PDFs, Markdown, .txt, etc.
          const res = await drive.files.get(
            { fileId: file.id!, alt: 'media' },
            { responseType: 'stream' }
          );

          const chunks: Uint8Array[] = [];
          await new Promise((resolve, reject) => {
            res.data
              .on('data', (chunk) => chunks.push(chunk))
              .on('end', resolve)
              .on('error', reject);
          });

          content = Buffer.concat(chunks).toString('utf-8'); // fallback; for PDFs you may need special handling
        }

        fileContents.push({
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          content: content,
        });
      } catch (innerErr) {
        console.warn(`Failed to fetch content for ${file.name}`, innerErr);
      }
    }

    return new Response(JSON.stringify(fileContents), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Drive API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch files' }), { status: 500 });
  }
};
