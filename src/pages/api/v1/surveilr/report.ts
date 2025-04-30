import type { APIRoute } from 'astro';
import sqlite3 from 'sqlite3';
import { z } from 'zod';

// Zod schema for validation with default fallbacks
export const ObservabilitySchema = z.object({
    versions: z.object({
        sqlpage: z.string(),
        pgwire: z.string(),
        rusqlite: z.string()
    }),
    static_extensions: z.array(z.object({
        name: z.string(),
        url: z.string(),
        version: z.string()
    })),
    dynamic_extensions: z.array(z.unknown()),
    views: z.array(z.unknown()),
    env_vars: z.array(z.unknown()),
    capturable_executables: z.array(z.unknown()),
    telemetry: z.array(z.unknown()).optional(),
});

export type ObservabilityData = z.infer<typeof ObservabilitySchema>;

const DB_PATH = import.meta.env.PUBLIC_RSSD_DB;
const AUTH_SECRET = import.meta.env.PUBLIC_SECRET_API_KEY;
// define in .env
export const POST: APIRoute = async ({ request }) => {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== AUTH_SECRET) {
            return new Response('Unauthorized', { status: 401 });
        }
        const contentType = request.headers.get('content-type');

        if (!contentType?.includes('application/json')) {
            return new Response('Only application/json is supported', { status: 415 });
        }

        const body = await request.json();

        // Validate and coerce the payload using Zod
        const data = ObservabilitySchema.parse(body);

        const DB = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE);
        const reportId = Date.now().toString();
        const insertSQL = `
      INSERT INTO surveilr_report (
        surveilr_report_id, versions, static_extensions, dynamic_extensions, views,
        env_vars, capturable_executables, telemetry, payload
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)
    `;

        await new Promise<void>((resolve, reject) => {
            DB.run(
                insertSQL,
                [
                    reportId,
                    JSON.stringify(data.versions),
                    JSON.stringify(data.static_extensions),
                    JSON.stringify(data.dynamic_extensions),
                    JSON.stringify(data.views),
                    JSON.stringify(data.env_vars),
                    JSON.stringify(data.capturable_executables),
                    data.telemetry ? JSON.stringify(data.telemetry) : "[]",
                    JSON.stringify(data),
                ],
                (err) => {
                    DB.close();
                    err ? reject(err) : resolve();
                }
            );
        });

        return new Response('Surveilr report saved successfully', { status: 200 });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error('Error processing surveilr report:', err.message);
        } else {
            console.error('Unknown error:', err);
        }

        return new Response('Internal server error', { status: 500 });
    }
};
