#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-run --allow-sys --allow-env --allow-net
/**
 * CommandExecutor class handles executing shell commands.
 */
import "https://deno.land/x/dotenv@v3.2.2/load.ts";
import console from "node:console";
class CommandExecutor {
    /**
     * Executes a shell command and streams the output.
     * @param command - Command to be executed along with its arguments.
     */
    static async executeCommand(command: string[]): Promise<void> {
        console.log(`Executing command: ${command.join(" ")}`);

        const process = new Deno.Command(command[0], {
            args: command.slice(1), // Extract executable and arguments
            stdout: "piped",
            stderr: "piped",
        });

        try {
            // Execute the command and collect outputs
            const { code, stdout, stderr } = await process.output();

            console.log(new TextDecoder().decode(stdout)); // Print standard output
            console.error(new TextDecoder().decode(stderr)); // Print standard error

            if (code !== 0) {
                throw new Error(`Command failed with status: ${code}`);
            }

            console.log(`Command executed successfully.`);
            // deno-lint-ignore no-explicit-any
        } catch (error: any) {
            console.error(`Error executing command: ${error.message}`);
            throw error; // Rethrow to allow caller to handle
        }
    }
}

/**
 * Main Application Class orchestrates the command execution workflow.
 */
class App {
    private rssdPath: string;
    private ingestCommand: string[];
    private dbRemoveCommand: string[];

    constructor(
        rssdPath: string,
        ingestCommand: string[],
        dbRemoveCommand: string[]
    ) {
        this.rssdPath = rssdPath;
        this.ingestCommand = ingestCommand;
        this.dbRemoveCommand = dbRemoveCommand;
    }

    /**
     * Executes the command for the application workflow.
     */
    async run(): Promise<void> {
        // Install the SQLite extension first
        // await this.installSQLiteExtensions();
        try {
            await CommandExecutor.executeCommand(this.dbRemoveCommand);
            try {
                await CommandExecutor.executeCommand(this.ingestCommand);
            } catch (error) {
                if (error instanceof Error) {
                    console.error(`Error: ${error.message}`);
                } else {
                    console.error("An unknown error occurred.", error);
                }
                Deno.exit(1);
            }
        }
        catch (error) {
            if (error instanceof Error) {
                console.error(`Error: ${error.message}`);
            } else {
                console.error("An unknown error occurred.", error);
            }
            Deno.exit(1);
        }
    }
}

if (import.meta.main) {
    // Parse command-line arguments with a default for rssdPat
    const rssdPath = Deno.env.get("PUBLIC_IMAP_DB");
    console.log(rssdPath)
    if (rssdPath == "" || rssdPath == null || rssdPath == undefined) {
        throw new Error("DB Path missing check `PUBLIC_IMAP_DB` in env");

    }
    const ingestCommand = [
        "surveilr",
        "ingest",
        "imap",
        `-f=${Deno.env.get("IMAP_FOLDER")}`,
        `-u=${Deno.env.get("IMAP_USER_NAME")}`,
        `-p=${Deno.env.get("IMAP_PASS")}`,
        `-a=${Deno.env.get("IMAP_HOST")}`,
        "-d",
        rssdPath,
    ];

    const dbRemoveCommand = [
        "rm",
        "-rf",
        rssdPath
    ];

    // Initialize and run the application
    const app = new App(rssdPath, ingestCommand, dbRemoveCommand);
    if (Deno.env.get("ENABLE_IMAP_DB_PREPARE") === "true") {
        await app.run();
    }
}
