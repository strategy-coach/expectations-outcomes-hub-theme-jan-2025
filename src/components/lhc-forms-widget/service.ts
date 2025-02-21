import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";
import { lformDB } from "../../utils/env";

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

const dbPath = path.resolve(process.cwd(), lformDB.dbPath);

const openDatabase = (): sqlite3.Database => {
    return new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(`Database connection error: ${err.message}`);
        }
    });
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
