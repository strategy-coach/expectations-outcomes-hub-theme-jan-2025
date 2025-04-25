import sqlite3 from "sqlite3";
import z from "zod";

const dbPath = import.meta.env.PUBLIC_RSSD_DB;

// Zod schema for reactions
const reactions = z.array(
    z.object({
        reactionCount: z.number(),
        reactionTypeId: z.string(),
        reactionName: z.string(),
        users: z.array(z.string()),
    })
);

export type ReactionType = z.infer<typeof reactions>;
export type SingleReaction = ReactionType[number];

// Raw row type from the SQLite query
type RawReactionRow = {
    url: string;
    reactionCount: number;
    reactionTypeId: string;
    reactionName: string;
    users: string;
};

export const getReactions = (url?: string): Promise<ReactionType> => {
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
              page_reactions_list.url as url,
              json_each.value as users,
              reaction_count as reactionCount,
              reaction_name as reactionName,
              reaction_type_id as reactionTypeId
            FROM page_reactions_list,
            json_each(user_list)
            WHERE url LIKE ?;
          `;

                    db.all(query, [`%${url ?? ''}%`], (err, rows: RawReactionRow[]) => {
                        if (err) {
                            reject(err);
                        } else {
                            const grouped: Record<string, SingleReaction & { url: string }> = {};

                            for (const row of rows) {
                                const key = `${row.url}-${row.reactionTypeId}`;
                                if (!grouped[key]) {
                                    grouped[key] = {
                                        url: row.url,
                                        reactionCount: row.reactionCount,
                                        reactionTypeId: row.reactionTypeId,
                                        reactionName: row.reactionName,
                                        users: [],
                                    };
                                }
                                grouped[key].users.push(row.users);
                            }

                            resolve(Object.values(grouped));
                        }
                    });
                }
            }
        );
    });
};
