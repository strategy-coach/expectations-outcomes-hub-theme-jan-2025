import { writeFile } from 'fs/promises';
import { exec as execCb } from 'node:child_process';
import { promisify } from 'node:util';
import type { APIContext } from 'astro';
import { Buffer } from 'node:buffer';
import axios from 'axios';
import type { AxiosError } from 'axios';

const exec = promisify(execCb);


const GITHUB_TOKEN = import.meta.env.PUBLIC_GITHUB_PAT
const GITHUB_OWNER = import.meta.env.PUBLIC_GITHUB_OWNER
const GITHUB_REPO = import.meta.env.PUBLIC_GITHUB_REPO
const GITHUB_BRANCH = 'develop';

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

        if (GITHUB_TOKEN && GITHUB_OWNER && GITHUB_REPO) {
            const githubPath = `src/content/lforms/submissions/${userId}.${sanitizedFileName}.lform-submittion.json`;
            const encodedContent = Buffer.from(JSON.stringify(formData, null, 2)).toString('base64');
            const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${githubPath}`;

            let sha: string | undefined = undefined;
            try {
                const { data } = await axios.get(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${GITHUB_TOKEN}`,
                        Accept: 'application/vnd.github+json',
                    },
                    params: { ref: GITHUB_BRANCH },
                });
                sha = data.sha;
            } catch (err: unknown) {
                const axiosErr = err as AxiosError;
                if (axiosErr.response?.status !== 404) throw err;
            }
            await axios.put(
                apiUrl,
                {
                    message: `chore: auto-commit form submission`,
                    content: encodedContent,
                    branch: GITHUB_BRANCH,
                    ...(sha && { sha }),
                },
                {
                    headers: {
                        Authorization: `Bearer ${GITHUB_TOKEN}`,
                        Accept: 'application/vnd.github+json',
                    },
                }
            );
        } else {
            console.log("Skipping GitHub sync: Missing token, owner, or repo.");
        }

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
