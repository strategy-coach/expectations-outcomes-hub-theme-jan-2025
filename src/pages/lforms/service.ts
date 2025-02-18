// deno-lint-ignore-file require-await
import sqlite3 from "sqlite3";
import path from "node:path";
import * as fs from "node:fs";
import { lformDB } from "../../utils/env.ts";
import process from "node:process";
import { FileDetails } from "./types.ts";


const dbName = lformDB.dbPath;
const dbPath = path.resolve(process.cwd(), dbName);
export const getFiledatails = async (filepath: string): Promise<FileDetails[] | string> => {

    return new Promise((resolve) => {
        const query = `SELECT DISTINCT uri,last_modified_at as file_date FROM uniform_resource WHERE uri LIKE '%${filepath}' AND nature='json' ORDER BY last_modified_at DESC`;
        console.log(query)
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
