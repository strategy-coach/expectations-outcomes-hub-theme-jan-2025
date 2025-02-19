import type { APIContext } from "astro";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function POST({ request }: APIContext) {
    try {
        const { role, userId, type } = await request.json();

        if (role !== "admin" || userId === undefined) {
            return new Response(JSON.stringify({ error: "You have no permission to sync the profile" }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            });
        }

        const command = type === "users-only" ? "pnpm run sync-users" : "pnpm run sync-db-and-users";

        try {
            const { stdout, stderr } = await execAsync(command);

            console.log(`Command output: ${stdout}`);

            // Log stderr but do not fail unless it's a critical error
            if (stderr.trim()) {
                console.warn(`Non-critical warning from command: ${stderr}`);
            }

        } catch (error) {
            console.error(`Failed to execute command: ${error instanceof Error ? error.message : String(error)}`);
            return new Response(JSON.stringify({ error: "Failed to sync profile data" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ message: "User profiles synced successfully!" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
        return new Response(JSON.stringify({ error: "Failed to process the request" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
