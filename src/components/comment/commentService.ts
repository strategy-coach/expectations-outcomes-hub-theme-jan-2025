import sqlite3 from "sqlite3";
import Database from "better-sqlite3";
import z from "zod"


const activityLog = z.object({
    messageId: z.string().optional(),
    tenantId: z.string().optional(),
    userId: z.string(),
    updatedBy: z.string().optional(),
    platform: z.number().optional(),
    parentId: z.union([z.number(), z.undefined()]),
    activityType: z.number(),
    source: z.string().optional(),
    description: z.string(),
    url: z.string(),
    timeStamp: z.string().optional()
});

const logParam = z.object({
    messageId: z.string().nullable().optional(), // Can be null or optional
    logId: z.string(), // Changed to string as per `activities` structure
    parentId: z.string().nullable().optional(), // Changed to string for consistency
    userId: z.string().optional(),
    name: z.string().optional(),
    timestamp: z.number(), // Changed from `z.date()` to `z.number()` for UNIX timestamps
    description: z.string(),
    url: z.string(),
    source: z.string().optional(),
    activityType: z.string().optional(),
    children: z.array(z.object({})).optional(),
    reactions: z
        .array(
            z.object({
                reactionCount: z.number(),
                reactionTypeId: z.string(),
                reactionName: z.string(),
                users: z.array(z.string()),
            }),
        )
        .optional(),
});

type SQLiteRow<T = Record<string, unknown>> = T;
export type LogType = z.infer<typeof logParam>;
export type ActivityLogType = z.infer<typeof activityLog>;

const dbPath = "src/content/db/rssd/resource-surveillance.sqlite.db"

type QueryParams = (string | number | boolean | null)[];

const beginTransaction = (db: sqlite3.Database): Promise<void> =>
    runQuery(db, "BEGIN TRANSACTION");

const commitTransaction = (db: sqlite3.Database): Promise<void> =>
    runQuery(db, "COMMIT");

const rollbackTransaction = (db: sqlite3.Database): Promise<void> =>
    runQuery(db, "ROLLBACK");

let queue: Promise<any> = Promise.resolve();

function resolveQueue<T>(fn: () => Promise<T>): Promise<T> {
    queue = queue.then(() =>
        fn().catch((error) => {
            console.error(error)
        })
    );
    return queue as Promise<T>;
}

const getAll = <T = Record<string, unknown>>(
    db: sqlite3.Database,
    query: string,
    params: QueryParams = [],
): Promise<SQLiteRow<T>[]> => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err: Error | null, rows: SQLiteRow<T>[]) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};
// Function to run a query that does not return rows (INSERT, UPDATE, DELETE)
const runQuery = (
    db: sqlite3.Database,
    query: string,
    params: QueryParams = [],
): Promise<void> => {
    return new Promise((resolve, reject) => {
        db.run(query, params, (err: Error | null) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let writeQueue: Promise<any> = Promise.resolve();

function resolveWriteQueue<T>(fn: () => T): Promise<T> {
    writeQueue = writeQueue.then(() =>
        Promise.resolve()
            .then(fn)
            .catch((error) => {
                console.error(error);
                // throw error if you want the caller to handle it
                throw error;
            })
    );
    return writeQueue as Promise<T>;
}

const getFirstRow = <T = Record<string, unknown>>(
    db: sqlite3.Database,
    query: string,
    params: QueryParams = [],
): Promise<T | undefined> => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err: Error | null, row: T) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

const commentService = {


    addComment: (param: ActivityLogType): Promise<void> => {
        return resolveWriteQueue(() => {
            const auditSessionId = Date.now().toString();
            const db = new Database(dbPath, {
                fileMustExist: true,
            });
            db.pragma("journal_mode = WAL");
            // Use a transaction for all operations
            const transaction = db.transaction(() => {
                // Check if provenance exists
                const checkProvenanceQuery = `
                SELECT communication_id FROM communication WHERE provenance = ?`;

                const row = db.prepare(checkProvenanceQuery).get(
                    String(param.url),
                ) as {
                    communication_id: string;
                };

                let communicationId = auditSessionId;
                if (row === undefined) {
                    // Insert into communication if not exists
                    const insertCommunicationQuery = `
                    INSERT INTO "communication" (
                        "communication_id", "communication_type",
                        "communication_platform", "provenance"
                    ) VALUES (?, ?, ?, ?)`;

                    db.prepare(insertCommunicationQuery).run(
                        communicationId,
                        String(param.activityType),
                        String(param.platform),
                        param.url,
                    );
                } else {
                    communicationId = row.communication_id;
                }

                // Insert into message table
                const insertMessageQuery = `
                INSERT INTO "message" (
                    "message_id", "communication_id", "parent_message_id",
                    "content", "sender_id", "sent_at"
                ) VALUES (?, ?, ?, ?, ?, ?)`;

                db.prepare(insertMessageQuery).run(
                    auditSessionId,
                    communicationId,
                    param.parentId as unknown as string ?? undefined,
                    param.description,
                    param.userId,
                    Date.now(),
                );
            });

            try {
                transaction(); // Commit the transaction
            } catch (error) {
                console.error("Error in addComment:", error);
                throw error; // Transaction will rollback automatically
            } finally {
                db.close(); // Close the database
            }
        });
    },

    addActivityLog(param: ActivityLogType): void {

        const auditSessionId = Date.now().toString();
        const tenantId = param.tenantId;
        const activityLogId = `${auditSessionId}_${tenantId}`;

        const db = new Database(dbPath, {
            fileMustExist: true,
        });

        db.pragma("journal_mode = WAL");

        const transaction = db.transaction(() => {
            const insertActivityLogQuery = `
                INSERT INTO "activity_log" (
                    "activity_log_id",
                    "activity_type",
                    "tenant_id",
                    "data_origin",
                    "data_source",
                    "data_updated_by",
                    "updated_by",
                    "reference_number",
                    "description",
                    "deleted_at",
                    "created_at"
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?,?)`;

            db.prepare(insertActivityLogQuery).run(
                String(activityLogId),
                String(param.activityType),
                String(tenantId),
                String(param.url),
                String(param.source ?? ""),
                String(param.userId),
                String(param.updatedBy) ? String(param.userId) : null,
                param.messageId ? param.messageId : null,
                String(param.description),
                Date.now(),
                param.timeStamp ? param.timeStamp : Date.now(),
            );
        });

        try {
            transaction(); // Commit transaction
        } catch (error) {
            console.error("Error in addActivityLog:", error);
            throw error; // Transaction will roll back automatically if an error is thrown
        } finally {
            db.close(); // Close database
        }
    },

    getActivityLogs: async (
        url = "",
    ): Promise<LogType[]> => {
        try {

            const db = new Database(dbPath, { readonly: true });

            const query = `
        SELECT
                log_id as logId,
                url,
                source,
                description,
                user_id as userId,
                timestamp,
                activity_type as activityType,
                name,
                message_id as messageId,
                deleted_by as deletedBy,
                deleted_user_id as deletedUserId,
                email
            FROM activity_logs
            WHERE url LIKE ?;
        `
            const rows = db.prepare(query).all(`%${url}%`) as LogType[];

            db.close();
            return rows;
        } catch (error) {
            console.error("Error fetching activity logs:", error);
            throw error;
        }
    },

    getComments: (
        url?: string,
    ): Promise<LogType[]> => {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(
                dbPath,
                sqlite3.OPEN_READONLY,
                (err: Error | null) => {
                    if (err) {
                        reject(err);
                    } else {
                        const query = `
                        SELECT
                            log_id as logId,
                            url,
                            parentId,
                            description,
                            user_id as userId,
                            timestamp,
                            activity_type as activityType,
                            name,email,reactions
                        FROM comments
                        WHERE url LIKE '%${url}%'; `

                        db.all(query, [], (err, rows: LogType[]) => {
                            if (err) {
                                reject(err);
                            } else {
                                // Parse reactions and users for each row
                                const parsedRows = rows.map((row) => ({
                                    ...row,
                                    reactions: row.reactions
                                        ? JSON.parse(row.reactions).map((
                                            reaction: any,
                                        ) => ({
                                            ...reaction,
                                            users: Array.isArray(
                                                reaction.users,
                                            )
                                                ? reaction.users
                                                : JSON.parse(
                                                    reaction.users,
                                                ),
                                        }))
                                        : [],
                                }));

                                resolve(parsedRows);
                            }
                        });
                    }
                },
            );

            db.close((err: Error | null) => {
                if (err) {
                    reject(`Error closing database: ${err.message} `);
                }
            });
        });
    },
    addMessageReaction: (
        userId: string,
        messageId: number,
        reactionTypeId: number,
    ): Promise<void> => {
        return resolveQueue(async () => {
            const reactionId = Date.now().toString();

            const db = new sqlite3.Database(
                dbPath,
                sqlite3.OPEN_READWRITE,
            );

            try {
                const getMessageReactionQuery =
                    `SELECT * FROM message_reaction WHERE message_id = ? AND user_id = ? `;
                const reactions = await getAll(db, getMessageReactionQuery, [
                    messageId,
                    userId,
                ]);

                const getMessageIdReactionQuery =
                    `SELECT * FROM message_reaction WHERE message_id = ? AND user_id = ? AND reaction_type_id = ? `;
                const reactionsById = await getAll(
                    db,
                    getMessageIdReactionQuery,
                    [messageId, userId, reactionTypeId],
                );
                if (reactionsById.length > 0) {
                    await beginTransaction(db);
                    await runQuery(
                        db,
                        `DELETE FROM message_reaction WHERE message_id = ? AND user_id = ? AND reaction_type_id = ? `,
                        [messageId, userId, reactionTypeId],
                    );
                    await commitTransaction(db);
                } else if (reactions.length > 0) {
                    await beginTransaction(db);
                    await runQuery(
                        db,
                        `DELETE FROM message_reaction WHERE message_id = ? AND user_id = ? `,
                        [messageId, userId],
                    );
                    await runQuery(
                        db,
                        `INSERT INTO message_reaction(message_reaction_id, message_id, user_id, reaction_type_id) VALUES(?, ?, ?, ?)`,
                        [reactionId, messageId, userId, reactionTypeId],
                    );
                    await commitTransaction(db);
                } else {
                    await beginTransaction(db);
                    await runQuery(
                        db,
                        `INSERT INTO message_reaction(message_reaction_id, message_id, user_id, reaction_type_id) VALUES(?, ?, ?, ?)`,
                        [reactionId, messageId, userId, reactionTypeId],
                    );
                    await commitTransaction(db);
                }
            } catch (error) {
                console.error("Error in addMessageReaction:", error);
                await rollbackTransaction(db);
                throw error;
            } finally {
                db.close();
            }
        });
    },
    editComment: async function (
        messageId: string | number,
        updatedComment: string,
    ): Promise<void> {
        return resolveWriteQueue(() => {
            try {
                const db = new Database(
                    dbPath,
                    { fileMustExist: true },
                );
                db.pragma("journal_mode = WAL");
                const stmt = db.prepare(
                    `UPDATE message SET content = ? WHERE message_id = ? `,
                );
                stmt.run(String(updatedComment), String(messageId));
                db.close();
            } catch (error) {
                console.error("Error in editComment:", error);
                throw error;
            }
        });
    },

    deleteComment: async function (
        messageId: string | number,
    ): Promise<void> {
        return resolveWriteQueue(() => {
            try {
                const db = new Database(
                    dbPath,
                    { fileMustExist: true },
                );
                db.pragma("journal_mode = WAL");
                const stmt = db.prepare(
                    `DELETE FROM message WHERE message_id = ? `,
                );
                stmt.run(String(messageId));

                db.close();
            } catch (error) {
                console.error("Error in deleteComment:", error);
                throw error;
            }
        });
    },
};

export default commentService;
