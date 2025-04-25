import * as SQLa from "https://raw.githubusercontent.com/netspective-labs/sql-aide/v0.13.20/render/mod.ts";
import * as typ from "https://raw.githubusercontent.com/netspective-labs/sql-aide/v0.13.20/pattern/typical/mod.ts";
import * as udm from "https://raw.githubusercontent.com/netspective-labs/sql-aide/v0.13.20/pattern/udm/mod.ts";
import * as ws from "https://raw.githubusercontent.com/netspective-labs/sql-aide/v0.13.20/lib/universal/whitespace.ts";

// deno-lint-ignore no-explicit-any
type Any = any;

const { gm, gts, tcf } = udm;
const ctx = SQLa.typicalSqlEmitContext();

const partyType = gm.textPkTable(
  "party_type",
  {
    party_type_id: gm.keys.ulidPrimaryKey(),
    code: tcf.unique(udm.text()),
    value: udm.text(),
    ...gm.housekeeping.columns,
  },
);

const sexType = gm.textPkTable(
  "sex_type",
  {
    sex_type_id: gm.keys.ulidPrimaryKey(),
    code: tcf.unique(udm.text()),
    value: udm.text(),
    ...gm.housekeeping.columns,
  },
);

const party = gm.textPkTable("party", {
  party_id: gm.keys.varCharPrimaryKey(),
  party_type_id: partyType.references.code(),
  party_name: udm.text(),
  elaboration: udm.jsonTextNullable(),
  ...gm.housekeeping.columns,
}, {
  isIdempotent: true,
  indexes: (props, tableName) => {
    const tif = SQLa.tableIndexesFactory(tableName, props);
    return [tif.index({ isIdempotent: true }, "party_type_id", "party_name")];
  },
  populateQS: (t, c) => {
    t.description =
      `Entity representing parties involved in business transactions.`;
    c.party_name.description = "The name of the party";
    c.elaboration.description = "Any elaboration needed for the party.";
  },
});

export const contactType = gm.textPkTable(
  "contact_type",
  {
    contact_type_id: gm.keys.varCharPrimaryKey(),
    code: tcf.unique(udm.text()),
    value: udm.text(),
    ...gm.housekeeping.columns,
  },
  {
    qualitySystem: {
      description:
        "Entity Table to store different types of contact information.",
    },
  },
);

export const contactElectronic = gm.textPkTable("contact_electronic", {
  contact_electronic_id: gm.keys.varCharPrimaryKey(),
  contact_type_id: contactType.references.contact_type_id(),
  party_id: party.references.party_id(),
  electronics_details: udm.text(),
  elaboration: udm.jsonTextNullable(),
  ...gm.housekeeping.columns,
}, {
  qualitySystem: {
    description:
      "Entity to store electronic contact information associated with parties. Each electronic contact has a unique ID associated with it.",
  },
});

const activityType = gm.textPkTable(
  "activity_type",
  {
    activity_type_id: gm.keys.varCharPrimaryKey(),
    code: tcf.unique(udm.text()),
    value: udm.text(),
    ...gm.housekeeping.columns,
  },
  { isIdempotent: true },
);

const activityLog = gm.textPkTable(
  "activity_log",
  {
    activity_log_id: gm.keys.varCharPrimaryKey(),
    activity_type: activityType.references.activity_type_id(),
    tenant_id: party.references.party_id(),
    data_note: udm.textNullable(),
    data_origin: udm.text(),
    data_source: udm.text(),
    data_updated_by: party.references.party_id(),
    description: udm.text(),
    reference_number: udm.textNullable(),
    digest: udm.textNullable(),
    display_label: udm.textNullable(),
    name: udm.textNullable(),
    user_label: udm.textNullable(),
    ...gm.housekeeping.columns,
  },
  {
    isIdempotent: true,
    indexes: (props, tableName) => {
      const tif = SQLa.tableIndexesFactory(tableName, props);
      return [
        tif.index(
          { isIdempotent: true },
          "activity_type",
          "tenant_id",
          "data_updated_by",
          "data_source",
          "name",
        ),
      ];
    },
  },
);

const communicationPlatform = gm.textPkTable(
  "communication_platform",
  {
    communication_platform_id: gm.keys.varCharPrimaryKey(),
    code: udm.text(),
    value: udm.text(),
    ...gm.housekeeping.columns,
  },
  {
    isIdempotent: true,
    constraints: (props, tableName) => {
      const c = SQLa.tableConstraints(tableName, props);
      return [
        c.unique("communication_platform_id", "code"),
      ];
    },
    indexes: (props, tableName) => {
      const tif = SQLa.tableIndexesFactory(tableName, props);
      return [
        tif.index(
          { isIdempotent: true },
          "communication_platform_id",
          "code",
        ),
      ];
    },
  },
);

const communicationType = gm.textPkTable(
  "communication_type",
  {
    communication_type_id: gm.keys.varCharPrimaryKey(),
    code: udm.text(),
    value: udm.text(),
    ...gm.housekeeping.columns,
  },
  {
    isIdempotent: true,
    constraints: (props, tableName) => {
      const c = SQLa.tableConstraints(tableName, props);
      return [
        c.unique("communication_type_id", "code"),
      ];
    },
    indexes: (props, tableName) => {
      const tif = SQLa.tableIndexesFactory(tableName, props);
      return [
        tif.index(
          { isIdempotent: true },
          "communication_type_id",
          "code",
        ),
      ];
    },
  },
);

// Reference: https://schema.org/Audience

const channelsGroups = gm.textPkTable("channel_group", {
  channel_group_id: gm.keys.varCharPrimaryKey(),
  name: udm.text(),
  communication_platform: communicationPlatform.references
    .communication_platform_id(),
  elaboration: udm.jsonTextNullable(),
  ...gm.housekeeping.columns,
}, {
  isIdempotent: true,
  constraints: (props, tableName) => {
    const c = SQLa.tableConstraints(tableName, props);
    return [
      c.unique("channel_group_id"),
    ];
  },
  indexes: (props, tableName) => {
    const tif = SQLa.tableIndexesFactory(tableName, props);
    return [tif.index({ isIdempotent: true }, "channel_group_id")];
  },
});

const channelGroupMembers = gm.textPkTable("channel_group_member", {
  channel_group_member_id: gm.keys.varCharPrimaryKey(),
  channel_group_id: channelsGroups.references.channel_group_id(),
  party_id: party.references.party_id(),
  communication_platform: communicationPlatform.references
    .communication_platform_id(),
  elaboration: udm.jsonTextNullable(),
  ...gm.housekeeping.columns,
}, {
  isIdempotent: true,
  constraints: (props, tableName) => {
    const c = SQLa.tableConstraints(tableName, props);
    return [
      c.unique("channel_group_member_id"),
    ];
  },
  indexes: (props, tableName) => {
    const tif = SQLa.tableIndexesFactory(tableName, props);
    return [tif.index({ isIdempotent: true }, "channel_group_member_id")];
  },
});

const communication = gm.textPkTable("communication", {
  communication_id: gm.keys.varCharPrimaryKey(),
  communication_type: communicationType.references.communication_type_id(),
  channel_group_id: channelsGroups.references.channel_group_id().optional(),
  communication_platform: communicationPlatform.references
    .communication_platform_id(),
  provenance: udm.textNullable(),
  ...gm.housekeeping.columns,
}, {
  isIdempotent: true,
  constraints: (props, tableName) => {
    const c = SQLa.tableConstraints(tableName, props);
    return [
      c.unique("communication_id"),
    ];
  },
  indexes: (props, tableName) => {
    const tif = SQLa.tableIndexesFactory(tableName, props);
    return [
      tif.index({ isIdempotent: true }, "communication_id", "provenance"),
    ];
  },
});

// Reference: https://schema.org/EmailMessage
// Reference: surveilr : ur_ingest_session_imap_acct_folder_message

const message = gm.textPkTable("message", {
  message_id: gm.keys.varCharPrimaryKey(),
  communication_id: communication.references.communication_id(),
  parent_message_id: gm.keys.varCharPrimaryKey().optional(),
  bcc_recipient: udm.textNullable(),
  cc_recipient: udm.textNullable(),
  subject: udm.textNullable(),
  sender_id: party.references.party_id(),
  receiver_id: party.references.party_id().optional(),
  content: udm.text(),
  sent_at: udm.date(),
  ...gm.housekeeping.columns,
}, {
  isIdempotent: true,
  constraints: (props, tableName) => {
    const c = SQLa.tableConstraints(tableName, props);
    return [
      c.unique("message_id"),
    ];
  },
  indexes: (props, tableName) => {
    const tif = SQLa.tableIndexesFactory(tableName, props);
    return [tif.index({ isIdempotent: true }, "message_id")];
  },
});

const reactionType = gm.textPkTable("reaction_type", {
  reaction_type_id: gm.keys.varCharPrimaryKey(),
  reaction_name: udm.text(),
  ...gm.housekeeping.columns,
}, {
  isIdempotent: true,
  constraints: (props, tableName) => {
    const c = SQLa.tableConstraints(tableName, props);
    return [
      c.unique("reaction_name"),
    ];
  },
});

const messageReaction = gm.textPkTable("message_reaction", {
  message_reaction_id: gm.keys.varCharPrimaryKey(),
  message_id: message.references.message_id(),
  user_id: party.references.party_id(),
  reaction_type_id: reactionType.references.reaction_type_id(),
  ...gm.housekeeping.columns,
}, {
  isIdempotent: true,
  constraints: (props, tableName) => {
    const c = SQLa.tableConstraints(tableName, props);
    return [
      c.unique("message_id", "user_id", "reaction_type_id", "created_at"),
    ];
  },
  indexes: (props, tableName) => {
    const tif = SQLa.tableIndexesFactory(tableName, props);
    return [
      tif.index(
        { isIdempotent: true },
        "message_id",
        "user_id",
        "reaction_type_id",
      ),
    ];
  },
});

const pageReaction = gm.textPkTable("page_reaction", {
  page_reaction_id: gm.keys.varCharPrimaryKey(),
  url: udm.text(),
  user_id: party.references.party_id(),
  reaction_type_id: reactionType.references.reaction_type_id(),
  ...gm.housekeeping.columns,
}, {
  isIdempotent: true,
  constraints: (props, tableName) => {
    const c = SQLa.tableConstraints(tableName, props);
    return [
      c.unique("url", "user_id", "reaction_type_id", "created_at"),
    ];
  },
  indexes: (props, tableName) => {
    const tif = SQLa.tableIndexesFactory(tableName, props);
    return [
      tif.index(
        { isIdempotent: true },
        "url",
        "user_id",
        "reaction_type_id",
      ),
    ];
  },
});


const attachment = gm.textPkTable("attachment", {
  attachment_id: gm.keys.varCharPrimaryKey(),
  communication_id: communication.references.communication_id(),
  message_id: message.references.message_id(),
  file_url: udm.text(),
  file_type: udm.text(),
  uploaded_at: udm.date(),
  ...gm.housekeeping.columns,
}, {
  isIdempotent: true,
  constraints: (props, tableName) => {
    const c = SQLa.tableConstraints(tableName, props);
    return [
      c.unique("attachment_id"),
    ];
  },
  indexes: (props, tableName) => {
    const tif = SQLa.tableIndexesFactory(tableName, props);
    return [tif.index({ isIdempotent: true }, "attachment_id")];
  },
});


// View Creation

const communication_emailView = SQLa.safeViewDefinition(
  "communication_email",
  {
    communication_type: udm.text(),
    communication_type_id: udm.text(),
    communication_group: udm.text(),
    channel_group_id: udm.text(),
    communication_platform: udm.text(),
    communication_platform_id: udm.text(),
    communication_group_platform: udm.text(),
    message_id: udm.text(),
    parent_message_id: udm.text(),
    message: udm.text(),
    parent_message: udm.text(),
    bcc_recipient: udm.text(),
    cc_recipient: udm.text(),
    subject: udm.text(),
    sender_id: udm.text(),
    receiver_id: udm.text(),
    sent_at: udm.text(),
    send_by: udm.text(),
    receiver: udm.text(),
  },
)`
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
      WHERE comPlat.CODE='EMAIL';`;

const communication_githubView = SQLa.safeViewDefinition(
  "communication_github",
  {
    communication_type: udm.text(),
    communication_type_id: udm.text(),
    communication_group: udm.text(),
    channel_group_id: udm.text(),
    communication_platform: udm.text(),
    communication_platform_id: udm.text(),
    communication_group_platform: udm.text(),
    message_id: udm.text(),
    parent_message_id: udm.text(),
    message: udm.text(),
    parent_message: udm.text(),
    bcc_recipient: udm.text(),
    cc_recipient: udm.text(),
    subject: udm.text(),
    sender_id: udm.text(),
    receiver_id: udm.text(),
    sent_at: udm.text(),
    send_by: udm.text(),
    receiver: udm.text(),
  },
)`
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
      WHERE comPlat.CODE='GITHUB';`;



const communicationGroupView = SQLa.safeViewDefinition(
  "communication_group_list",
  {
    channel_group_id: udm.text(),
    communication_platform_id: udm.text(),
    group_name: udm.text(),
    communication_platform: udm.text(),
  },
)`
  SELECT
  cg.channel_group_id,
  cp.communication_platform_id,
  cg.name as group_name,
  cp.value as communication_platform
  FROM channel_group cg
  INNER JOIN communication_platform as cp ON cp.communication_platform_id=cg.communication_platform;`;

const communicationGroupMemberView = SQLa.safeViewDefinition(
  "communication_group_member_list",
  {
    channel_group_id: udm.text(),
    communication_platform_id: udm.text(),
    party_id: udm.text(),
    group_name: udm.text(),
    member: udm.text(),
    communication_platform: udm.text(),
  },
)`
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
      INNER JOIN communication_platform as cp ON cp.communication_platform_id=cg.communication_platform;;`;

const messageReactionList = SQLa.safeViewDefinition(
  "message_reactions_list",
  {
    message_id: udm.integer(),
    reaction_type_id: udm.integer(),
    reaction_name: udm.text(),
    user_list: udm.jsonTextNullable(),
    reaction_count: udm.integer(),
  },
)`WITH LatestReactions AS (
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
    fr.message_id, rt.reaction_type_id, rt.reaction_name;`;

export const allContentTables: SQLa.TableDefinition<
  Any,
  udm.EmitContext,
  typ.TypicalDomainQS
>[] = [
    party,
    partyType,
    sexType,
    contactType,
    contactElectronic,
    activityType,
    activityLog,
    communicationPlatform,
    communicationType,
    channelsGroups,
    channelGroupMembers,
    communication,
    message,
    reactionType,
    pageReaction,
    messageReaction,
    attachment
  ];

export const allContentViews: SQLa.ViewDefinition<
  Any,
  udm.EmitContext,
  SQLa.SqlDomainQS
>[] = [
    communication_emailView,
    communication_githubView,
    communicationGroupView,
    communicationGroupMemberView,
    messageReactionList,
  ];

export function sqlDDL() {
  // deno-fmt-ignore
  return SQLa.SQL<udm.EmitContext>(gts.ddlOptions)`
    PRAGMA foreign_keys = on;
    ${allContentTables}
     --content views
    ${allContentViews}

    `;
}

typ.typicalCLI({
  resolve: (specifier) =>
    specifier ? import.meta.resolve(specifier) : import.meta.url,
  prepareSQL: () => ws.unindentWhitespace(sqlDDL().SQL(ctx)),
  prepareDiagram: () => {
    sqlDDL().SQL(ctx);
    return gts.pumlERD(ctx).content;
  },
}).commands.command("driver", typ.sqliteDriverCommand(sqlDDL, ctx))
  .parse(Deno.args);
