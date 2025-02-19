import { sqliteTable, text, primaryKey, blob } from "drizzle-orm/sqlite-core";


// ur_ingest_session_imap_account Table
export const urIngestSessionImapAccount = sqliteTable("ur_ingest_session_imap_account", {
    urIngestSessionImapAccountId: text("ur_ingest_session_imap_account_id").primaryKey().notNull(),
    ingestSessionId: text("ingest_session_id").notNull(),
    email: text("email"),
    password: text("password"),
    host: text("host"),
}, (table) => ({
    uniqueIngestEmail: primaryKey(table.ingestSessionId, table.email),
}));

export const urIngestSession = sqliteTable("ur_ingest_session_imap_account", {
    urIngestSessionId: text("urIngestSessionId").primaryKey().notNull(),
});

export const urIngestSessionImapAcctFolder = sqliteTable("ur_ingest_session_imap_acct_folder", {
    urIngestSessionImapAcctFolderId: text("ur_ingest_session_imap_acct_folder_id").primaryKey().notNull(),
    ingestSessionId: text("ingest_session_id").notNull().references(() => urIngestSession.urIngestSessionId),
    ingestAccountId: text("ingest_account_id").notNull().references(() => urIngestSessionImapAccount.urIngestSessionImapAccountId),
    folderName: text("folder_name").notNull(),
    elaboration: text("elaboration"),
    createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
    createdBy: text("created_by").default("UNKNOWN"),
    updatedAt: text("updated_at"),
    updatedBy: text("updated_by"),
    deletedAt: text("deleted_at"),
    deletedBy: text("deleted_by"),
    activityLog: text("activity_log"),
}, (table) => ({
    uniqueFolder: primaryKey({ columns: [table.ingestAccountId, table.folderName] }),
}));

export const urIngestSessionImapAcctFolderMessage = sqliteTable("ur_ingest_session_imap_acct_folder_message", {
    urIngestSessionImapAcctFolderMessageId: text("ur_ingest_session_imap_acct_folder_message_id").primaryKey().notNull(),
    ingestSessionId: text("ingest_session_id").notNull(),
    ingestImapAcctFolderId: text("ingest_imap_acct_folder_id").notNull(),
    message: text("message").notNull(),
    messageId: text("message_id").notNull(),
    subject: text("subject").notNull(),
    fromAddress: text("from").notNull(), // Renamed to avoid SQL keyword issue
    cc: text("cc", { mode: "json" }).notNull().default("{}"),
    bcc: text("bcc", { mode: "json" }).notNull().default("{}"),
    status: text("status", { mode: "json" }).notNull().default("[]"), // Storing as JSON
    date: text("date"), // SQLite stores DATE as TEXT (YYYY-MM-DD)
    emailReferences: text("email_references", { mode: "json" }).notNull().default("{}")
}
);

export const uniformResource = sqliteTable("uniform_resource", {
    uniformResourceId: text("uniform_resource_id").primaryKey().notNull(),
    ingestSessionImapAcctFolderMessage: text("ingest_session_imap_acct_folder_message"),
    content: blob("content"),
    nature: text("nature").notNull(),
    mail_date: text("last_modified_at"),
});