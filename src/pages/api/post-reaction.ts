
import sqlite3 from "sqlite3";
import type { APIContext } from 'astro';

const dbPath = import.meta.env.PUBLIC_RSSD_DB

const addPageReaction = async (
    userId: string,
    url: string,
    reactionTypeId: number,
): Promise<void> => {
    const reactionId = Date.now().toString();
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE);

    // deno-lint-ignore no-explicit-any
    const runAsync = (sql: string, params: any[] = []) =>
        new Promise<void>((resolve, reject) => {
            db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve();
            });
        });

    const allAsync = <T = any>(sql: string, params: any[] = []) =>
        new Promise<T[]>((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows as T[]);
            });
        });

    const beginTransaction = () => runAsync("BEGIN TRANSACTION");
    const commitTransaction = () => runAsync("COMMIT");
    const rollbackTransaction = () => runAsync("ROLLBACK");

    try {
        const reactions = await allAsync(
            `SELECT * FROM page_reaction WHERE url = ? AND user_id = ?`,
            [url, userId],
        );
        console.log(reactions)
        const reactionsById = await allAsync(
            `SELECT * FROM page_reaction WHERE url = ? AND user_id = ? AND reaction_type_id = ?`,
            [url, userId, reactionTypeId],
        );
        console.log(reactionsById)
        await beginTransaction();

        if (reactionsById.length > 0) {
            await runAsync(
                `DELETE FROM page_reaction WHERE url = ? AND user_id = ? AND reaction_type_id = ?`,
                [url, userId, reactionTypeId],
            );
        } else {
            if (reactions.length > 0) {
                await runAsync(
                    `DELETE FROM page_reaction WHERE url = ? AND user_id = ?`,
                    [url, userId],
                );
            }
            await runAsync(
                `INSERT INTO page_reaction(page_reaction_id, url, user_id, reaction_type_id) VALUES(?, ?, ?, ?)`,
                [reactionId, url, userId, reactionTypeId],
            );
        }

        await commitTransaction();
    } catch (err) {
        console.error("Error in adding page Reaction", err);
        await rollbackTransaction();
        throw err;
    } finally {
        db.close();
    }
};



export async function POST({ request }: APIContext) {
    const { url, userId, reactionTypeId } = await request.json();
    try {
        await addPageReaction(userId, url, reactionTypeId);
        return new Response(JSON.stringify({ message: "Page reaction added successfully!" }), {
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