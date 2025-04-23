import { google } from 'googleapis';
import path from 'path';

const GDRIVE_JSON_PATH = import.meta.env.GDRIVE_JSON_PATH;
const keyFilePath = path.resolve(GDRIVE_JSON_PATH);

const auth = new google.auth.GoogleAuth({
  keyFile: keyFilePath,
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

export async function GET({ url }) {
  const fileId = url.searchParams.get('id');
  const fileName = url.searchParams.get('name') ?? 'downloaded-file';
  const mimeType = url.searchParams.get('type') ?? 'application/octet-stream';

  if (!fileId) {
    return new Response('Missing file ID', { status: 400 });
  }



  const drive = google.drive({ version: 'v3', auth });

try {
  let res;
  let finalMimeType = mimeType;
  let finalFileName = fileName;

  // Map Google Docs types to export formats and file extensions
  const exportTypes: Record<string, { mime: string; ext: string }> = {
    'application/vnd.google-apps.document': {
      mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ext: '.docx',
    },
    'application/vnd.google-apps.spreadsheet': {
      mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ext: '.xlsx',
    },
    'application/vnd.google-apps.presentation': {
      mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ext: '.pptx',
    },
  };

  if (mimeType in exportTypes) {
    const { mime, ext } = exportTypes[mimeType];
    finalMimeType = mime;

    // Append proper extension if not already in name
    if (!fileName.endsWith(ext)) {
      finalFileName = fileName + ext;
    }

    // Export Google file to standard format
    res = await drive.files.export(
      { fileId, mimeType: mime },
      { responseType: 'arraybuffer' }
    );
  } else {
    // Regular file (PDF, Markdown, etc.)
    res = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );
  }

  const buffer = Buffer.from(res.data as ArrayBuffer);

  return new Response(buffer, {
    headers: {
      'Content-Type': finalMimeType,
      'Content-Disposition': `attachment; filename="${finalFileName}"`,
    },
  });

} catch (err) {
  console.error('Download failed:', err);
  return new Response('Download failed', { status: 500 });
}


}
