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
            INNER JOIN communication_platform as cp ON cp.communication_platform_id=cg.communication_platform;;

            WITH LatestReactions AS (
                SELECT
                mr.message_id,
                mr.user_id,
                mr.reaction_type_id,
                mr.created_at,
                MAX(mr.created_at) OVER (PARTITION BY mr.message_id, mr.user_id) AS latest_reaction
                FROM
                message_reaction mr
            ),
            FilteredReactions AS (
                SELECT
                lr.message_id,
                lr.user_id,
                lr.reaction_type_id
                FROM
                LatestReactions lr
                WHERE
                lr.created_at = lr.latest_reaction
            )
            SELECT
                fr.message_id,
                rt.reaction_type_id,
                rt.reaction_name,
                json_group_array(p.party_name) AS user_list,
                COUNT(fr.reaction_type_id) AS reaction_count
            FROM
                FilteredReactions fr
            JOIN
                reaction_type rt ON fr.reaction_type_id = rt.reaction_type_id
            JOIN
                party p ON fr.user_id = p.party_id
            GROUP BY
                fr.message_id, rt.reaction_type_id, rt.reaction_name;`);

            resolve();
        } catch (error) {
            reject(`Error: ${error}`);
        }
    });
};

await createView();