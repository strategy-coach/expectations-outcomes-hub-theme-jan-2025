import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";

/**
 * Load and validate environment variables
 */
const env = config();
const {
    PUBLIC_RSSD_DB: RSSD_DB_PATH,
} = env;

if (!RSSD_DB_PATH) {
    throw new Error("Missing required environment variables.");
}

const RSSD_DB = new DB(RSSD_DB_PATH);

const createView = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {

            RSSD_DB.query(`CREATE VIEW IF NOT EXISTS "communication_email"("communication_type", "communication_type_id", "communication_group", "channel_group_id", "communication_platform", "communication_platform_id", "communication_group_platform", "message_id", "parent_message_id", "message", "parent_message", "bcc_recipient", "cc_recipient", "subject", "sender_id", "receiver_id", "sent_at", "send_by", "receiver") AS
            SELECT
            comTyp.value as communication_type,
            comTyp.communication_type_id,
            comGrp.name as communication_group,
            comGrp.channel_group_id,
            comPlat.value as communication_platform,
            comPlat.communication_platform_id,
            grpPlat.value as communication_group_platform,
            msg.message_id,
            msg.parent_message_id,
            msg.content as message,
            thread.content as parent_message,
            msg.bcc_recipient,
            msg.cc_recipient,
            msg.subject,
            msg.sender_id,
            msg.receiver_id,
            msg.sent_at,
            sp.party_name as send_by,
            rp.party_name as receiver
            FROM communication com
            INNER JOIN communication_type as comTyp ON comTyp.communication_type_id=com.communication_type
            LEFT JOIN channel_group as comGrp ON comGrp.channel_group_id=com.channel_group_id
            INNER JOIN communication_platform as comPlat ON comPlat.communication_platform_id=com.communication_platform
            LEFT JOIN communication_platform as grpPlat ON grpPlat.communication_platform_id=comGrp.communication_platform
            INNER JOIN message as msg ON msg.communication_id=com.communication_id
            LEFT JOIN message as thread ON thread.message_id=msg.parent_message_id
            INNER JOIN party as sp ON sp.party_id=msg.sender_id
            LEFT JOIN party as rp ON rp.party_id=msg.receiver_id
            WHERE comPlat.CODE='EMAIL';`);

            RSSD_DB.query(`CREATE VIEW IF NOT EXISTS "communication_github"("communication_type", "communication_type_id", "communication_group", "channel_group_id", "communication_platform", "communication_platform_id", "communication_group_platform", "message_id", "parent_message_id", "message", "parent_message", "bcc_recipient", "cc_recipient", "subject", "sender_id", "receiver_id", "sent_at", "send_by", "receiver") AS
            SELECT
            comTyp.value as communication_type,
            comTyp.communication_type_id,
            comGrp.name as communication_group,
            comGrp.channel_group_id,
            comPlat.value as communication_platform,
            comPlat.communication_platform_id,
            grpPlat.value as communication_group_platform,
            msg.message_id,
            msg.parent_message_id,
            msg.content as message,
            thread.content as parent_message,
            msg.bcc_recipient,
            msg.cc_recipient,
            msg.subject,
            msg.sender_id,
            msg.receiver_id,
            msg.sent_at,
            sp.party_name as send_by,
            rp.party_name as receiver
            FROM communication com
            INNER JOIN communication_type as comTyp ON comTyp.communication_type_id=com.communication_type
            LEFT JOIN channel_group as comGrp ON comGrp.channel_group_id=com.channel_group_id
            INNER JOIN communication_platform as comPlat ON comPlat.communication_platform_id=com.communication_platform
            LEFT JOIN communication_platform as grpPlat ON grpPlat.communication_platform_id=comGrp.communication_platform
            INNER JOIN message as msg ON msg.communication_id=com.communication_id
            LEFT JOIN message as thread ON thread.message_id=msg.parent_message_id
            INNER JOIN party as sp ON sp.party_id=msg.sender_id
            LEFT JOIN party as rp ON rp.party_id=msg.receiver_id
            WHERE comPlat.CODE='GITHUB';`);

            RSSD_DB.query(`CREATE VIEW IF NOT EXISTS "communication_group_list"("channel_group_id", "communication_platform_id", "group_name", "communication_platform") AS
            SELECT
            cg.channel_group_id,
            cp.communication_platform_id,
            cg.name as group_name,
            cp.value as communication_platform
            FROM channel_group cg
            INNER JOIN communication_platform as cp ON cp.communication_platform_id=cg.communication_platform;`);

            RSSD_DB.query(`CREATE VIEW IF NOT EXISTS "communication_group_member_list"("channel_group_id", "communication_platform_id", "party_id", "group_name", "member", "communication_platform") AS
            SELECT
            cg.channel_group_id,
            cp.communication_platform_id,
            party.party_id,
            cg.name as group_name,
            party.party_name as member,
            cp.value as communication_platform
            FROM channel_group cg
            INNER JOIN channel_group_member as cgm ON cgm.channel_group_id=cg.channel_group_id
            INNER JOIN party ON cgm.party_id=party.party_id
            INNER JOIN communication_platform as cp ON cp.communication_platform_id=cg.communication_platform;`);

            RSSD_DB.query(`
            CREATE VIEW IF NOT EXISTS "message_reactions_list" AS 
            WITH LatestReactions AS (
            SELECT
            mr.message_id,
            mr.user_id,
            mr.reaction_type_id,
            mr.created_at,
            ROW_NUMBER() OVER (PARTITION BY mr.message_id, mr.user_id ORDER BY mr.created_at DESC) AS rn
            FROM message_reaction mr
            ),
            FilteredReactions AS (
            SELECT
            message_id,
            user_id,
            reaction_type_id
            FROM LatestReactions
            WHERE rn = 1
            )
            SELECT
            fr.message_id,
            rt.reaction_type_id,
            rt.reaction_name,
            json_group_array(p.party_name) AS user_list,
            COUNT(fr.reaction_type_id) AS reaction_count
            FROM FilteredReactions fr
            JOIN reaction_type rt ON fr.reaction_type_id = rt.reaction_type_id
            JOIN party p ON fr.user_id = p.party_id
            GROUP BY fr.message_id, rt.reaction_type_id, rt.reaction_name;
           `);

            RSSD_DB.query(`
            CREATE VIEW IF NOT EXISTS "comments"(
            "log_id",
            "parentId",
            "url",
            "description",
            "user_id",
            "timestamp",
            "activity_type",
            "name",
            "reactions",
            "email"
            ) AS
        SELECT
        message.message_id AS log_id,
        message.parent_message_id AS parentId,
        cm.provenance AS url,
        message.content AS description,
        message.sender_id AS user_id,
        message.sent_at AS timestamp,
        ct.value AS activity_type,
        party.party_name AS name,
        COALESCE(
            (
                SELECT json_group_array(
                    json_object(
                        'reactionTypeId', message_reactions_list.reaction_type_id,
                        'reactionCount', message_reactions_list.reaction_count,
                        'reactionName', message_reactions_list.reaction_name,
                        'users', message_reactions_list.user_list
                    )
                )
                FROM message_reactions_list
                WHERE message_reactions_list.message_id = message.message_id
            ),
            '[]'
        ) AS reactions,
        ce.electronics_details AS email
    FROM message
    LEFT JOIN communication AS cm ON message.communication_id = cm.communication_id
    LEFT JOIN communication_type AS ct ON cm.communication_type = ct.communication_type_id
    LEFT JOIN party ON party.party_id = message.sender_id
    LEFT JOIN contact_electronic AS ce ON ce.party_id = party.party_id
    WHERE ct.value = "Comment";
`);

            RSSD_DB.query(`
    CREATE VIEW IF NOT EXISTS "activity_logs"(
        "log_id",
        "url",
        "source",
        "description",
        "user_id",
        "timestamp",
        "activity_type",
        "name",
        "message_id",
        "deleted_user_id",
        "deleted_by",
        "email"
    ) AS
    SELECT
        activity_log.activity_log_id AS log_id,
        activity_log.data_origin AS url,
        activity_log.data_source AS source,
        activity_log.description AS description,
        activity_log.data_updated_by AS user_id,
        activity_log.created_at AS timestamp,
        activity_type.value AS activity_type,
        party.party_name AS name,
        reference_number AS message_id,
        activity_log.updated_by AS deleted_user_id,
        deleted_by_user.party_name AS deleted_by,
        ce.electronics_details AS email
    FROM activity_log
    LEFT JOIN activity_type ON activity_type.activity_type_id = activity_log.activity_type
    LEFT JOIN party AS deleted_by_user ON deleted_by_user.party_id = activity_log.updated_by 
    LEFT JOIN party ON party.party_id = activity_log.data_updated_by
    LEFT JOIN contact_electronic AS ce ON ce.party_id = party.party_id;
`);

            resolve();
        } catch (error) {
            reject(`Error: ${error}`);
        }
    });
};

await createView();