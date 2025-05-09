import { exec as execCallback } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execCallback);

async function runSequentialCommands() {
    const databasePath = "src/content/db/models/models.db";
    const sqlFilePath = "src/content/db/models/models.auto.sql";

    try {
        await exec(`sqlite3 ${databasePath} ""`);
        console.log(`SQLite database successfully created at ${databasePath}`);

        await exec(`sqlite3 ${databasePath} ".read ${sqlFilePath}"`);
        console.log(`SQL file successfully imported into SQLite database`);

        await exec(`mv ${databasePath} src/content/db/rssd`);
        console.log(`models.db moved successfully`);

        await exec(`rm -rf ${sqlFilePath}`);
        console.log(`models.auto.sql removed successfully`);

        await exec(`cd src/content/db/rssd && surveilr admin merge -p "activity%" -p "message%" -p "communication%" -p "contact%" -p "channel%" -p "reaction%" -p "attachment%" -p "page%" -p "surveilr_report%" && rm -rf resource-surveillance.sqlite.db && mv resource-surveillance-aggregated.sqlite.db resource-surveillance.sqlite.db && rm -rf models.db`);
        console.log(`Merge command executed successfully`);

    } catch (error) {
        if (error instanceof Error) {
            console.error(`Command failed: ${error.message}`);
        } else {
            console.error("Unknown error in getDBPath:", error);
        }
    }
}

runSequentialCommands();
