import { writeFile } from 'fs/promises';
import type { APIContext } from 'astro';
import { exec } from "node:child_process";

export async function POST({ request }: APIContext) {
    try {
        const { formData, fileName, userId } = await request.json();
        let sanitizedFileName = fileName
            .replace(new RegExp(`^${userId}\\.?`), '')  // Remove leading userId if exists
            .replace(/\.lform-submittion\.json$/, '');
        // Define the file path (modify as needed)
        const filePath = `./src/content/lforms/submissions/${userId}.${sanitizedFileName}.lform-submittion.json`;
        const dbIngestPath = `src/content/lforms/submissions`;
        // Write form data to a file
        await writeFile(filePath, JSON.stringify(formData, null, 2), 'utf-8');

        exec(`cd ${dbIngestPath} && surveilr ingest files`, (error, _stdout, stderr) => {
            if (error) {
                console.error(`Failed to execute ingest command: ${error.message}`);
                return;
            }

            if (stderr.trim()) {
                console.error(`Ingest command error: ${stderr}`);
                return;
            }

            // Move the file only if the ingest command succeeded

            exec(`cp ${dbIngestPath}/resource-surveillance.sqlite.db src/content/db/rssd/resource-surveillance-copy.sqlite.db && cd src/content/db/rssd && surveilr admin merge -p "activity%" -p "message%" -p "communication%" -p "contact%" -p "channel%" -p "reaction%" -p "attachment%" && mv resource-surveillance-aggregated.sqlite.db resource-surveillance.sqlite.db && rm -rf resource-surveillance-copy.sqlite.db && pnpm run generate-db-views`, (mvError, _mvStdout, mvStderr) => {
                if (mvError) {
                    console.error(`Failed to move file: ${mvError.message}`);
                    return;
                }

                if (mvStderr.trim()) {
                    console.error(`Move command error: ${mvStderr}`);
                    return;
                }

                console.log(`Merge command executed successfully`);
            });

            console.log(`Merge command executed successfully`);

        });

        return new Response(JSON.stringify({ message: "Form data saved successfully!" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to save form data" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
