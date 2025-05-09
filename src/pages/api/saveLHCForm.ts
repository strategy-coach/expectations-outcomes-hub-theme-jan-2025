import { writeFile } from 'fs/promises';
import { exec as execCb } from 'node:child_process';
import { promisify } from 'node:util';
import type { APIContext } from 'astro';

const exec = promisify(execCb); // Promisified version of exec

export async function POST({ request }: APIContext) {
    try {
        const { formData, fileName, userId } = await request.json();

        const sanitizedFileName = fileName
            .replace(new RegExp(`^${userId}\\.?`), '') // Remove leading userId if exists
            .replace(/\.lform-submittion\.json$/, '');

        const filePath = `./src/content/lforms/submissions/${userId}.${sanitizedFileName}.lform-submittion.json`;
        const dbIngestPath = `src/content/lforms/submissions`;
        // Write form data to file
        await writeFile(filePath, JSON.stringify(formData, null, 2), 'utf-8');

        // Step 1: Ingest command
        await exec(`cd ${dbIngestPath} && surveilr ingest files`);

        // Step 2: Merge and move files
        await exec(`cp ${dbIngestPath}/resource-surveillance.sqlite.db src/content/db/rssd/resource-surveillance-copy.sqlite.db && cd src/content/db/rssd && surveilr admin merge -p "activity%" -p "message%" -p "communication%" -p "contact%" -p "channel%" -p "reaction%" -p "attachment%" -p "page%" -p "surveilr_report%" && mv resource-surveillance-aggregated.sqlite.db resource-surveillance.sqlite.db && rm -rf resource-surveillance-copy.sqlite.db resource-surveillance-aggregated.sqlite.db && pnpm run generate-db-views`);

        // Step 3: Cleanup
        await exec(`cd ${dbIngestPath} && rm -rf resource-surveillance.sqlite.db`);

        // await exec(`sqlite3 src/content/db/rssd/resource-surveillance.sqlite.db "PRAGMA wal_checkpoint(FULL);"`);

        // ✅ Return final response
        return new Response(JSON.stringify({ message: "Form data saved and ingested successfully!" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        if (error instanceof Error) {
            console.error("Error during processing:", error.message);
        } else {
            console.error("Unknown error in processing:", error);
        }
        return new Response(JSON.stringify({ error: "Failed to process form data" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
