import { writeFile } from 'fs/promises';
import type { APIContext } from 'astro';
import { exec } from "node:child_process";

export async function POST({ request }: APIContext) {
    try {
        const { formData, fileName, userId } = await request.json();
        // Define the file path (modify as needed)

        const filePath = `./src/content/lforms/submissions/${userId}.${fileName}.lform-submittion.json`;
        const dbIngestPath = `src/content/lforms/submissions`;
        const dbPath = `src/content/db/lforms`;
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
            exec(`mv ${dbIngestPath}/resource-surveillance.sqlite.db ${dbPath}`, (mvError, _mvStdout, mvStderr) => {
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
