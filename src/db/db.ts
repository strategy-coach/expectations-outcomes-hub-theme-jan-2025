import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import fs from "node:fs";
// import { imapDBPath } from "../utils/env.ts";

// if (!fs.existsSync(imapDBPath)) {
//     throw new Error(`Database file not found: ${imapDBPath}`);
// }
export function connectionDB(imapDBPath: string) {
    if (!fs.existsSync(imapDBPath)) {
        return undefined;
        // throw new Error(`Database file not found: ${imapDBPath}`);
    }
    try {
        // Attempt to connect to the database
        const sqlite = new Database(imapDBPath);
        const db = drizzle(sqlite);

        // Check if the database is open
        if (sqlite.open) {
            console.log(`✅ Database connection successful: ${imapDBPath}`);
            return db;
        } else {
            throw new Error("Database file exists, but failed to open.");
        }
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);

        // Return a fallback to avoid breaking the app
        return null;
    }
}



// export default db;