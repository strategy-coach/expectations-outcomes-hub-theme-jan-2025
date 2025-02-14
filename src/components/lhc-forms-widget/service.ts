import sqlite3 from "sqlite3";
import path from 'path';
import { lformDB } from "../../utils/env";
interface FormDataType {
    content_fm_body_attrs: Text;
    content: Text;
    nature: string;
}

export const getFormData = async (fileName: string): Promise<FormDataType[]> => {
    return new Promise((resolve, reject) => {
        try {
            const dbName = lformDB.dbPath;
            const dbPath = path.resolve(process.cwd(), dbName);

            const db = new sqlite3.Database(
                dbPath,
                sqlite3.OPEN_READWRITE,
                (err: Error | null) => {
                    if (err) {
                        console.log(err)
                        console.error(`Database connection error: ${err.message}`);
                        return reject(err);
                    }

                    const query = `
                        SELECT content FROM uniform_resource where uri like "%${fileName}%" and nature="json";`;

                    db.all(query, (err: Error | null, rows: FormDataType[]) => {
                        if (err) {
                            console.error(`Error executing query: ${err.message}`);
                            return reject(err);
                        }
                        const parsedData = rows.map((row) => {
                            try {
                                if (typeof row.content === 'string') {

                                    return JSON.parse(row.content);
                                }
                                return row.content;
                            } catch (parseError) {
                                console.error(`Error parsing data`);
                                return null;
                            }
                        }).filter(item => item !== null);

                        resolve(parsedData);
                    });

                    db.close((err: Error | null) => {
                        if (err) {
                            console.error(`Error closing database: ${err.message}`);
                        }
                    });
                }
            );
        } catch (error) {
            console.error(`Unexpected error: ${(error as Error).message}`);
            reject(error);
        }
    });
};
