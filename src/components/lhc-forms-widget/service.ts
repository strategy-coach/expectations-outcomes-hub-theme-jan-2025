// deno-lint-ignore-file
import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { lformDB } from '../../utils/env.ts';
import process from 'node:process';

interface LHCFormDataType {
    content: unknown;
    uri: string;
}

export type FileDetails = {
    uri: string;
    file_date: string;
    content_digest: string;
    party_name: string;
};

type Row = { content: string; uri: string };

let dbInstance: Database.Database | null = null;

function getDBPath(): string {
    if (!lformDB?.dbPath) {
        throw new Error('PUBLIC_LFORM_DB environment variable is not set.');
    }
    return path.resolve(process.cwd(), lformDB.dbPath);
}

function getDatabase(): Database.Database {
    if (!dbInstance) {
        const dbPath = getDBPath();
        if (!fs.existsSync(dbPath)) {
            throw new Error(`Database file not found: ${dbPath}`);
        }
        dbInstance = new Database(dbPath, { readonly: true });
        dbInstance.pragma('journal_mode = WAL'); // Improves concurrency
    }
    return dbInstance;
}

export function getPageFromSlug(input: string): string {
    return input.replace(/\/[^/]*component\.css\.map$/, '');
}

export function slugify(text: string): string {
    return text
        .toString()
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\//g, "-")
        .replace(/[^a-z0-9-.]/g, "")
        .replace(/-{2,}/g, "-")
        .replace(/\.{2,}/g, ".");
}

export function getFormData(digest: string): LHCFormDataType[] {
    try {
        const db = getDatabase();
        const stmt = db.prepare(`
            SELECT content, uri
            FROM uniform_resource
            WHERE content_digest = ?
        `);

        const rows = stmt.all(digest) as Row[]; // 👈 Cast the result to the expected shape

        return rows
            .map(({ content, uri }) => {
                try {
                    return { content: JSON.parse(content), uri };
                } catch (err) {
                    console.error(`Error parsing content for ${uri}:`, err instanceof Error ? err.message : err);
                    return null;
                }
            })
            .filter((row): row is LHCFormDataType => row !== null);
    } catch (err) {
        console.error(`getFormData error:`, err instanceof Error ? err.message : err);
        return [];
    }
}

function executeQuery(query: string): FileDetails[] | string {
    try {
        const db = getDatabase();
        const stmt = db.prepare(query);
        return stmt.all() as FileDetails[];
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error in getDBPath:", error.message);
            return `Error executing query: ${error.message}`;
        } else {
            return `Error executing query: ${error}`;
        }
    }
}

export function getFileDetails(filepath: string): FileDetails[] | string {
    const query = `
        SELECT 
            ur.uri, 
            ur.content_digest, 
            MAX(ur.last_modified_at) AS file_date, 
            p.party_name
        FROM uniform_resource ur
        JOIN party p 
            ON p.party_id = CAST(
                SUBSTR(
                    ur.uri, 
                    INSTR(ur.uri, 'submissions/') + LENGTH('submissions/'), 
                    INSTR(SUBSTR(ur.uri, INSTR(ur.uri, 'submissions/') + LENGTH('submissions/')), '.') - 1
                ) AS TEXT
            )
        WHERE ur.uri LIKE '%${filepath}' 
            AND ur.nature = 'json'
        GROUP BY ur.uri
        ORDER BY file_date DESC;
    `;
    return executeQuery(query);
}

export function getFileHistory(filepath: string): FileDetails[] | string {
    const query = `
        SELECT uri, content_digest, last_modified_at AS file_date
        FROM uniform_resource
        WHERE uri LIKE '%${filepath}' AND nature = 'json'
        ORDER BY file_date DESC;
    `;
    return executeQuery(query);
}
