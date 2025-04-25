import { exec } from "node:child_process";

const databasePath = "src/content/db/models/models.db";
const sqlFilePath = "src/content/db/models/models.auto.sql";

exec(`sqlite3 ${databasePath} ""`, (error, _stdout, stderr) => {
    if (error) {
        console.error(`Failed to create SQLite database: ${error.message}`);
        return;
    }

    if (stderr.trim()) {
        console.error(`SQLite database creation error: ${stderr}`);
        return;
    }

    console.log(`SQLite database successfully created at ${databasePath}`);

    exec(`sqlite3 ${databasePath} ".read ${sqlFilePath}"`, (error, _stdout, stderr) => {
        if (error) {
            console.error(`Failed to import SQL file: ${error.message}`);
            return;
        }

        if (stderr.trim()) {
            console.error(`SQL import error: ${stderr}`);
            return;
        }

        console.log(`SQL file successfully imported into SQLite database`);

        exec(`mv src/content/db/models/models.db src/content/db/rssd`, (error, _stdout, stderr) => {
            if (error) {
                console.error(`Failed to move models.db: ${error.message}`);
                return;
            }

            if (stderr.trim()) {
                console.error(`Move command error: ${stderr}`);
                return;
            }

            console.log(`models.db moved successfully`);

            exec(`rm -rf src/content/db/models/models.auto.sql`, (error, _stdout, stderr) => {
                if (error) {
                    console.error(`Failed to remove models.auto.sql: ${error.message}`);
                    return;
                }

                if (stderr.trim()) {
                    console.error(`Remove command error: ${stderr}`);
                    return;
                }

                console.log(`models.auto.sql removed successfully`);

                exec(`cd src/content/db/rssd && surveilr admin merge -p "activity%" -p "message%" -p "communication%" -p "contact%" -p "channel%" -p "reaction%" -p "attachment%" -p "page%" && rm -rf resource-surveillance.sqlite.db && mv resource-surveillance-aggregated.sqlite.db resource-surveillance.sqlite.db && rm -rf models.db`, (error, _stdout, stderr) => {
                    if (error) {
                        console.error(`Failed to execute merge command: ${error.message}`);
                        return;
                    }

                    if (stderr.trim()) {
                        console.error(`Merge command error: ${stderr}`);
                        return;
                    }

                    console.log(`Merge command executed successfully`);
                });
            });
        });
    });
});

