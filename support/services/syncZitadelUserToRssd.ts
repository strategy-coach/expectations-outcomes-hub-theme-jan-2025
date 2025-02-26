import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";
import * as z from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { DB } from "https://deno.land/x/sqlite@v3.9.1/mod.ts";
import { parseArgs } from "jsr:@std/cli/parse-args";
import axios from "axios";
/**
 * Load and validate environment variables
 */
const env = config();
const {
    PUBLIC_ZITADEL_API_TOKEN: ZITADEL_API_TOKEN,
    PUBLIC_ZITADEL_ORGANIZATION_ID: ZITADEL_ORGANIZATION_ID,
    PUBLIC_ZITADEL_AUTHORITY: ZITADEL_AUTHORITY,
} = env;

if (!ZITADEL_API_TOKEN || !ZITADEL_ORGANIZATION_ID || !ZITADEL_AUTHORITY) {
    throw new Error("Missing required environment variables.");
}

/**
 * Initialize SQLite database connection
 */
const database = new DB("src/content/db/rssd/resource-surveillance.sqlite.db");
const args = parseArgs(Deno.args);
const syncUsersOnly = args.syncUsersOnly ?? "false";

/**
 * Zod Schemas for Data Validation
 */
const UserDetailsSchema = z.object({
    sequence: z.string(),
    creationDate: z.string(),
    changeDate: z.string(),
    resourceOwner: z.string(),
});

const MachineSchema = z.object({ name: z.string() }).optional();

const HumanProfileSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    nickName: z.string().optional(),
    displayName: z.string(),
    preferredLanguage: z.string().optional(),
    gender: z.string().optional(),
});

const EmailSchema = z.object({
    email: z.string().email(),
    isEmailVerified: z.boolean(),
});

const PhoneSchema = z.object({
    phone: z.string().optional(),
    isPhoneVerified: z.boolean().optional(),
});

const HumanSchema = z.object({
    profile: HumanProfileSchema,
    email: EmailSchema,
    phone: PhoneSchema.optional(),
    passwordChanged: z.string().optional(),
}).optional();

const UserDataSchema = z.object({
    id: z.string(),
    details: UserDetailsSchema,
    state: z.string(),
    userName: z.string(),
    loginNames: z.array(z.string()),
    preferredLoginName: z.string(),
    machine: MachineSchema,
    human: HumanSchema,
});

const UsersRoleSchema = z.object({
    id: z.string(),
    details: UserDetailsSchema,
    roleKeys: z.array(z.string()),
    userId: z.string(),
    state: z.string(),
    userName: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    displayName: z.string(),
    orgId: z.string(),
    orgName: z.string(),
    orgDomain: z.string(),
    projectId: z.string(),
    projectName: z.string(),
    preferredLoginName: z.string(),
    userType: z.string(),
    grantedOrgId: z.string(),
    grantedOrgName: z.string(),
    grantedOrgDomain: z.string(),
});

const UserApiResponseSchema = z.object({
    details: z.object({
        totalResult: z.string(),
        viewTimestamp: z.string(),
    }),
    result: z.array(UserDataSchema),
});

const OrganizationDetailsSchema = z.object({
    sequence: z.string(),
    creationDate: z.string(),
    changeDate: z.string(),
    resourceOwner: z.string(),
});

const OrganizationSchema = z.object({
    org: z.object({
        id: z.string(),
        details: OrganizationDetailsSchema,
        state: z.string(),
        name: z.string(),
        primaryDomain: z.string(),
    }),
});

export type UserData = z.infer<typeof UserDataSchema>;
export type UsersRole = z.infer<typeof UsersRoleSchema>;
export type Organization = z.infer<typeof OrganizationSchema>;

/**
 * Constants for data mapping.
 */
const organizationRoleTypes = [{ organization_role_type_id: 1, code: "ADMIN", value: "admin" }];

const contactTypes = [
    { contact_type_id: 1, code: "HOME_ADDRESS", value: "Home Address" },
    { contact_type_id: 2, code: "OFFICIAL_ADDRESS", value: "Official Address" },
    { contact_type_id: 3, code: "MOBILE_PHONE_NUMBER", value: "Mobile Phone Number" },
    { contact_type_id: 4, code: "LAND_PHONE_NUMBER", value: "Land Phone Number" },
    { contact_type_id: 5, code: "OFFICIAL_EMAIL", value: "Official Email" },
    { contact_type_id: 6, code: "PERSONAL_EMAIL", value: "Personal Email" },
];

const genderData = [
    { gender_type_id: 1, code: "MALE", value: "Male" },
    { gender_type_id: 2, code: "FEMALE", value: "Female" },
    { gender_type_id: 3, code: "", value: "" },
];

const sexTypeData = [
    { sex_type_id: 1, code: "MALE", value: "Male" },
    { sex_type_id: 2, code: "FEMALE", value: "Female" },
    { sex_type_id: 3, code: "", value: "" },
];

const personTypeData = [
    { person_type_id: 1, code: "INDIVIDUAL", value: "Individual" },
    { person_type_id: 2, code: "PROFESSIONAL", value: "Professional" },
];

const activityTypeData = [
    { activity_type_id: "1", code: "ADD_COMMENT", value: "Add Comment" },
    { activity_type_id: "2", code: "DELETE_COMMENT", value: "Delete Comment" },
    { activity_type_id: "3", code: "EDIT_COMMENT", value: "Edit Comment" },
];

// const reactionType = [
//     { reaction_type_id: 1, reaction_name: "thumbs_up" },
//     { reaction_type_id: 2, reaction_name: "heart" },
//     { reaction_type_id: 3, reaction_name: "laugh" },
//     { reaction_type_id: 4, reaction_name: "sad" },
//     { reaction_type_id: 5, reaction_name: "clap" },
//     { reaction_type_id: 6, reaction_name: "eyes" },
//     { reaction_type_id: 7, reaction_name: "eye_glasses" },
//     { reaction_type_id: 8, reaction_name: "thumbs_down" },
//     { reaction_type_id: 9, reaction_name: "perfect_score" },
// ];

const communicationTypes = [
    {
        communication_type_id: 1,
        code: "INDIVIDUAL_MESSAGE",
        value: "Individual Message",
    },
    {
        communication_type_id: 2,
        code: "GROUP_MESSAGE",
        value: "Group Message",
    },
    {
        communication_type_id: 3,
        code: "COMMENT",
        value: "Comment",
    },
];


const communicationPlatforms = [
    {
        communication_platform_id: 1,
        code: "EOH",
        value: "Eoh",
    },
    {
        communication_platform_id: 2,
        code: "SLACK",
        value: "Slack",
    },
    {
        communication_platform_id: 3,
        code: "DISCORD",
        value: "Discord",
    },
    {
        communication_platform_id: 4,
        code: "WHATSAPP",
        value: "WhatsApp",
    },
    {
        communication_platform_id: 5,
        code: "SKYPE",
        value: "Skype",
    },
    {
        communication_platform_id: 6,
        code: "TWITTER",
        value: "Twitter",
    },
    {
        communication_platform_id: 7,
        code: "EMAIL",
        value: "Email",
    },
    {
        communication_platform_id: 8,
        code: "GITHUB",
        value: "Github",
    },
];

/**
 * API Request Function
 */
async function fetchFromZitadel(endpoint: string): Promise<Response> {
    return fetch(`${ZITADEL_AUTHORITY}${endpoint}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${ZITADEL_API_TOKEN}`,
            "Content-Type": "application/json",
            "x-zitadel-orgid": ZITADEL_ORGANIZATION_ID,
        },
        body: JSON.stringify({}),
    });
}

/**
 * API Request Function
 */
async function getFromZitadel<T>(endpoint: string): Promise<T | undefined> {
    try {
        const response = await axios.get<T>(`${ZITADEL_AUTHORITY}${endpoint}`, {
            headers: {
                Authorization: `Bearer ${ZITADEL_API_TOKEN}`,
                "Content-Type": "application/json",
                "x-zitadel-orgid": ZITADEL_ORGANIZATION_ID,
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching from Zitadel:", error);
        return undefined;
    }
}

/**
 * Fetch Users from Zitadel
 */
export async function getUsers(): Promise<UserData[] | undefined> {
    try {
        const response = await fetchFromZitadel("/management/v1/users/_search");
        if (!response.ok) return undefined;
        const data = await response.json();
        return UserApiResponseSchema.safeParse(data).success ? data.result : undefined;
    } catch (error) {
        console.error("Error fetching users:", error);
        return undefined;
    }
}

/**
 * Fetch User Roles from Zitadel
 */
export async function getUsersRole(): Promise<UsersRole[] | undefined> {
    try {
        const response = await fetchFromZitadel("/management/v1/users/grants/_search");
        if (!response.ok) return undefined;
        const data = await response.json();
        return data.result as UsersRole[];
    } catch (error) {
        console.error("Error fetching user roles:", error);
        return undefined;
    }
}

/**
 * Fetch Tenant Data from Zitadel
 */
export async function getTenantData(): Promise<Organization | undefined> {
    try {
        const data = await getFromZitadel<unknown>("/management/v1/orgs/me");
        if (data && OrganizationSchema.safeParse(data).success) {
            // Now TypeScript knows data matches OrganizationSchema
            const validData = data as z.infer<typeof OrganizationSchema>;
            return validData;
        } else {
            console.log("Invalid data received.");
        }
    } catch (error) {
        console.error("Error fetching tenant data:", error);
        return undefined;
    }
}

/**
 * Interface for Party Type
 */
interface PartyType {
    id: string;
    code: string;
    value: string;
}

/**
 * Interface for Generic Record Type
 */
interface RecordType {
    [key: string]: string | number | null | boolean | undefined;
}

/**
 * Fetch Party Types from Database
 */
export function fetchPartyTypes(): PartyType[] | { error: string } {
    try {
        const query = `SELECT party_type_id AS id, code, value FROM party_type`;
        const rows = database.query(query) as string[][];
        return rows.map(([id, code, value]) => ({ id, code, value }));
    } catch (error) {
        console.error("Database query error:", error);
        return { error: "An error occurred while fetching party types." };
    }
}

/**
 * Insert data into the database table if the record does not already exist
 */
function insertRecords(tableName: string, records: RecordType[], columns: string[]): void {
    records.forEach((record) => {
        const columnNames = columns.join(", ");
        const placeholders = columns.map(() => "?").join(", ");
        const sql = `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`;
        const values = columns.map((col) => record[col] ?? null);

        const existsQuery = `SELECT 1 FROM ${tableName} WHERE ${columns[0]} = ?`;
        const exists = database.query(existsQuery, [record[columns[0]]]);
        if (!exists.length) {
            database.query(sql, values);
        }
    });
}

/**
 * Main Execution Function
 */
async function main(): Promise<void> {
    try {
        let tenantData: { party_id: string; party_type_id: string | undefined; party_name: string; }[] = []
        const users = await getUsers();
        let userRoles = await getUsersRole();
        const partyTypes = fetchPartyTypes();
        if (!Array.isArray(partyTypes)) {
            console.error("Failed to fetch party types:", partyTypes.error);
            return;
        }
        const personType = partyTypes.find((p) => p.code === "PERSON");
        const organizationType = partyTypes.find((p) => p.code === "ORGANIZATION");
        let organizationData: RecordType[] = [];
        if (syncUsersOnly === "false") {
            const organization = await getTenantData();
            tenantData = [{
                party_id: organization ? organization?.org.id : "",
                party_type_id: organizationType?.id,
                party_name: organization ? organization?.org.name : "",
            }];
            organizationData = [{
                organization_id: organization ? organization?.org.id : "",
                party_id: organization ? organization?.org.id : "",
                name: organization ? organization?.org.name : "",
                alias: "",
                description: "",
                license: "",
                registration_date: ""
            }];
        }
        const partyData = users?.map((user) => ({
            party_id: user.id,
            party_type_id: personType?.id,
            party_name: user.human?.profile.displayName || "",
        })) || [];

        const contactElectronics = users?.map((user) => ({
            contact_electronic_id: `${user.userName}-${user.id}`,
            contact_type_id: 6,
            party_id: user.id,
            electronics_details: user.human?.email.email || "",
        })) || [];

        userRoles = userRoles?.filter((user) => users?.some((u) => u.id === user.userId));
        const personIds = new Set<string>();

        const organizationRoleData =
            userRoles
                ?.filter((user) => {
                    if (personIds.has(user.userId)) {
                        return false;
                    } else {
                        personIds.add(user.userId);
                        return true;
                    }
                })
                .map((user) => ({
                    organization_role_id: user.id,
                    person_id: user.userId,
                    organization_id: ZITADEL_ORGANIZATION_ID,
                    organization_role_type_id: organizationRoleTypes.find(role => role.value === user.roleKeys[0])?.organization_role_type_id
                })) || [];

        const personData = users?.map((user) => ({
            person_id: user.id,
            party_id: user.id,
            person_type_id: 1,
            person_first_name: user.human?.profile.firstName || "",
            person_last_name: user.human?.profile.lastName || "",
            gender_id: user.human?.profile.gender === "GENDER_MALE" ? 1 : user.human?.profile.gender === "GENDER_FEMALE" ? 2 : 3,
            sex_id: user.human?.profile.gender === "GENDER_MALE" ? 1 : user.human?.profile.gender === "GENDER_FEMALE" ? 2 : 3,
        })) || [];

        insertRecords("party", [...partyData, ...tenantData], ["party_id", "party_type_id", "party_name"]);
        if (syncUsersOnly === "false") {
            insertRecords("contact_type", contactTypes, ["contact_type_id", "code", "value"]);
            insertRecords("gender_type", genderData, ["gender_type_id", "code", "value"]);
            insertRecords("sex_type", sexTypeData, ["sex_type_id", "code", "value"]);
            insertRecords("person_type", personTypeData, ["person_type_id", "code", "value"]);
            insertRecords("organization", organizationData, ["organization_id", "party_id", "name", "alias", "description", "license", "registration_date"]);
            insertRecords("organization_role_type", organizationRoleTypes, ["organization_role_type_id", "code", "value"]);
        }
        insertRecords("communication_platform", communicationPlatforms, [
            "communication_platform_id",
            "code",
            "value",
        ]);
        insertRecords("communication_type", communicationTypes, [
            "communication_type_id",
            "code",
            "value",
        ]);
        insertRecords("activity_type", activityTypeData, [
            "activity_type_id",
            "code",
            "value",
        ]);
        insertRecords("contact_electronic", contactElectronics, ["contact_electronic_id", "contact_type_id", "party_id", "electronics_details"]);
        insertRecords("person", personData, ["person_id", "party_id", "person_type_id", "person_first_name", "person_last_name", "gender_id", "sex_id"]);
        insertRecords("organization_role", organizationRoleData, ["organization_role_id", "person_id", "organization_id", "organization_role_type_id"]);
    } catch (error) {
        console.error("Unexpected error in main execution:", error);
    } finally {
        database.close();
    }
}

// Run the script
await main();

