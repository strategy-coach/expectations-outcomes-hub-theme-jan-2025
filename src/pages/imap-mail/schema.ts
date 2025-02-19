import { sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core";


// ur_ingest_session_imap_account Table
export const urIngestSessionImapAccount = sqliteTable("ur_ingest_session_imap_account", {
    urIngestSessionImapAccountId: text("ur_ingest_session_imap_account_id").primaryKey().notNull(),
    ingestSessionId: text("ingest_session_id").notNull(),
    email: text("email"),
    password: text("password"),
    host: text("host"),
    mail_date: text("last_modified_at"),
}, (table) => ({
    uniqueIngestEmail: primaryKey(table.ingestSessionId, table.email),
}));

