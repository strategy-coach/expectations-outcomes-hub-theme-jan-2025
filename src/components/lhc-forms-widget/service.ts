// deno-lint-ignore-file
import sqlite3 from "sqlite3";
import path from "node:path";
import fs from "node:fs";
import { lformDB } from "../../utils/env.ts";
import process from "node:process";

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

// Write queue to serialize writes
let writeQueue: Promise<void> = Promise.resolve();

function enqueueWrite<T>(writeTask: () => Promise<T>): Promise<T> {
    const task = writeQueue.then(writeTask);
    writeQueue = task.then(() => { }, () => { });
    return task;
}

function getDBPath(): string | null {
    try {
        if (!lformDB || !lformDB.dbPath) {
            throw new Error("PUBLIC_LFORM_DB environment variable is not set. Please check your environment configuration.");
        }
        return path.resolve(process.cwd(), lformDB.dbPath);
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error in getDBPath:", error.message);
        } else {
            console.error("Unknown error in getDBPath:", error);
        }
        return null; // Allow execution to continue
    }
}

let walInitialized = false;

const openDatabase = (): sqlite3.Database => {
    const dbPath = getDBPath() as string;
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(`Database connection error: ${err.message}`);
        } else if (!walInitialized) {
            walInitialized = true;
            db.run("PRAGMA journal_mode = WAL;", (err) => {
                if (err) {
                    console.error("Failed to set WAL mode:", err.message);
                }
            });
        }
    });
    return db;
};

export function getPageFromSlug(input: string) {
    return input.replace(/\/[^/]*component\.css\.map$/, '');
}

export function slugify(text: string) {
    return text
        .toString()
        .trim()
        .toLowerCase()
        .normalize("NFD") // Normalize special characters
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
        .replace(/\//g, "-") // Replace / with -
        .replace(/[^a-z0-9-.]/g, "") // Remove non-alphanumeric characters except - and .
        .replace(/-{2,}/g, "-") // Remove duplicate dashes
        .replace(/\.{2,}/g, "."); // Remove duplicate dots
}

export const getFormData = async (digest: string): Promise<LHCFormDataType[]> => {
    return new Promise((resolve, reject) => {
        const db = openDatabase();
        const query = `SELECT content, uri FROM uniform_resource WHERE content_digest = ?`;

        db.all(query, [digest], (err, rows: { content: string; uri: string }[]) => {
            db.close();
            if (err) {
                console.error(`Error executing query: ${err.message}`);
                return reject(err);
            }

            const parsedData: LHCFormDataType[] = rows
                .map(({ content, uri }: { content: string; uri: string }) => {
                    try {
                        return { content: JSON.parse(content), uri };
                    } catch (parseError) {
                        console.error(`Error parsing JSON for URI ${uri}: ${parseError}`);
                        return null;
                    }
                })
                .filter((item): item is LHCFormDataType => item !== null);

            resolve(parsedData);
        });
    });
};

const executeQuery = (query: string): Promise<FileDetails[] | string> => {
    return new Promise((resolve) => {
        const dbPath = getDBPath() as string;
        if (!fs.existsSync(dbPath)) {
            return resolve(`Database file not found: ${dbPath}`);
        }

        const db = openDatabase();
        db.all(query, [], (err, rows: FileDetails[]) => {
            db.close();
            if (err) {
                return resolve(`Error executing query: ${err.message}`);
            }
            resolve(rows);
        });
    });
};

// Example insert operation wrapped with write queue
export const insertFileRecord = (uri: string, contentDigest: string, jsonContent: object): Promise<void> => {
    return enqueueWrite(() => {
        return new Promise((resolve, reject) => {
            const db = openDatabase();
            const query = `INSERT INTO uniform_resource (uri, content_digest, content, nature, last_modified_at) VALUES (?, ?, ?, 'json', datetime('now'))`;

            db.run(query, [uri, contentDigest, JSON.stringify(jsonContent)], function (err) {
                db.close();
                if (err) {
                    console.error("Insert failed:", err.message);
                    return reject(err);
                }
                resolve();
            });
        });
    });
};

export const getFileDetails = (filepath: string): Promise<FileDetails[] | string> => {
    const query = `SELECT 
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
        ORDER BY file_date DESC;`;
    return executeQuery(query);
};

export const getFileHistory = (filepath: string): Promise<FileDetails[] | string> => {
    const query = `SELECT uri, content_digest, last_modified_at AS file_date
        FROM uniform_resource
        WHERE uri LIKE '%${filepath}' AND nature = 'json'
        ORDER BY file_date DESC;`;
    return executeQuery(query);
};
