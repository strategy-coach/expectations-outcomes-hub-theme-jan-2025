import axios from "axios";

const ZITADEL_AUTHORITY = import.meta.env.PUBLIC_ZITADEL_AUTHORITY as string;
const ZITADEL_TOKEN = (import.meta.env.ZITADEL_API_TOKEN ??
    import.meta.env.PUBLIC_ZITADEL_API_TOKEN) as string;
const ORGANIZATION_ID = import.meta.env.PUBLIC_ZITADEL_ORGANIZATION_ID as string;
const PROJECT_ID = import.meta.env.PUBLIC_ZITADEL_PROJECT_ID as string;

export function sessionIdFromCookieHeader(cookieHeader: string): string {
    const match = cookieHeader.match(/(?:^|;\s*)session_id=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : "";
}

export async function getSessionUserId(sessionId: string): Promise<string | null> {
    if (!sessionId) return null;
    try {
        const response = await axios.get(
            `${ZITADEL_AUTHORITY}/v2/sessions/${encodeURIComponent(sessionId)}`,
            {
                headers: {
                    Authorization: `Bearer ${ZITADEL_TOKEN}`,
                    Accept: "application/json",
                },
            },
        );
        return response.data?.session?.factors?.user?.id ?? null;
    } catch {
        return null;
    }
}

export async function isAdminUser(userId: string): Promise<boolean> {
    try {
        const response = await axios.post(
            `${ZITADEL_AUTHORITY}/management/v1/users/grants/_search`,
            {
                query: { offset: "0", limit: 100, asc: true },
                queries: [
                    { userIdQuery: { userId } },
                    { projectIdQuery: { projectId: PROJECT_ID } },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${ZITADEL_TOKEN}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "x-zitadel-orgid": ORGANIZATION_ID,
                },
            },
        );
        const grants = (response.data?.result ?? []) as Array<{ roleKeys?: string[] }>;
        return grants.some((grant) =>
            (grant.roleKeys ?? []).some((key) => key.toLowerCase().includes("admin")),
        );
    } catch {
        return false;
    }
}

export async function sessionUserIdFrom(request: Request): Promise<string | null> {
    return getSessionUserId(sessionIdFromCookieHeader(request.headers.get("cookie") ?? ""));
}

export function unauthorizedResponse(): Response {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
    });
}

export async function resolveCaller(
    cookieHeader: string,
): Promise<{ userId: string | null; isAdmin: boolean }> {
    const userId = await getSessionUserId(sessionIdFromCookieHeader(cookieHeader));
    if (!userId) return { userId: null, isAdmin: false };
    return { userId, isAdmin: await isAdminUser(userId) };
}
