// deno-lint-ignore-file require-await
import sqlite3 from "sqlite3";
import path from "node:path";
import * as fs from "node:fs";
import { lformDB } from "../../utils/env.ts";
import process from "node:process";
import type { FileDetails } from "./types.ts";

const dbName = lformDB.dbPath;
const dbPath = path.resolve(process.cwd(), dbName);

export const getFiledatails = async (filepath: string): Promise<FileDetails[] | string> => {
    return new Promise((resolve) => {
        const query = `SELECT uri, MAX(last_modified_at) AS file_date
                        FROM uniform_resource
                        WHERE uri LIKE '%${filepath}' AND nature = 'json'
                        GROUP BY uri
                        ORDER BY file_date DESC;`;
        // Check if name is not null
        if (dbName == null) {
            resolve(`Database not found!!`);
            return;
        }
        // Check if database exists
        if (!fs.existsSync(dbPath)) {
            resolve(`Database file not found: ${dbPath}`);
            return;
        }

        const db = new sqlite3.Database(dbPath);
        db.all(query, [], (err, rows: []) => {
            db.close();
            if (err) {
                resolve(`Error executing query: ${err.message}`);
            } else {
                resolve(rows);
            }
        });
    });
};

export const getFileHistory = async (filepath: string): Promise<FileDetails[] | string> => {
    return new Promise((resolve) => {
        const query = `SELECT uri, last_modified_at AS file_date
            FROM uniform_resource
            WHERE uri LIKE '%${filepath}' AND nature = 'json'
            ORDER BY file_date DESC;`;
        // Check if name is not null
        if (dbName == null) {
            resolve(`Database not found!!`);
            return;
        }
        // Check if database exists
        if (!fs.existsSync(dbPath)) {
            resolve(`Database file not found: ${dbPath}`);
            return;
        }
        const db = new sqlite3.Database(dbPath);
        db.all(query, [], (err, rows: []) => {
            db.close();
            if (err) {
                resolve(`Error executing query: ${err.message}`);
            } else {
                resolve(rows);
            }
        });
    });
};