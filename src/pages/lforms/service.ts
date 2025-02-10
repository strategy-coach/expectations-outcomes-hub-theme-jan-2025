import sqlite3 from "sqlite3";
import path from "path";
import * as fs from "fs";

const dbName = "resource-surveillance.sqlite.db";
const dbPath = path.resolve(process.cwd(), dbName);
export const getFiledatails = async (filepath: string, fileName: string): Promise<Array<Record<string, any>> | string> => {
    return new Promise((resolve, reject) => {
        const query = `SELECT uri,last_modified_at as file_date FROM uniform_resource WHERE uri LIKE '%${filepath}' AND nature='json'`;

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
