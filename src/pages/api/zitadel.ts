import type { APIRoute } from "astro";

const ZITADEL_AUTHORITY = import.meta.env.PUBLIC_ZITADEL_AUTHORITY as string;
const ZITADEL_API_TOKEN = (import.meta.env.ZITADEL_API_TOKEN ??
    import.meta.env.PUBLIC_ZITADEL_API_TOKEN) as string;
const ORGANIZATION_ID = import.meta.env.PUBLIC_ZITADEL_ORGANIZATION_ID as string;
const PROJECT_ID = import.meta.env.PUBLIC_ZITADEL_PROJECT_ID as string;

const jsonHeaders = {
    "Content-Type": "application/json",
};

function zitadelHeaders(includeOrganization = true): HeadersInit {
    return {
        ...jsonHeaders,
        Authorization: `Bearer ${ZITADEL_API_TOKEN}`,
        ...(includeOrganization ? { "x-zitadel-orgid": ORGANIZATION_ID } : {}),
    };
}

function json(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: jsonHeaders,
    });
}

async function zitadelRequest(
    path: string,
    init: RequestInit = {},
    includeOrganization = true,
): Promise<Response> {
    if (!ZITADEL_AUTHORITY || !ZITADEL_API_TOKEN) {
        return json({ error: "ZITADEL server configuration is incomplete." }, 500);
    }

    return fetch(`${ZITADEL_AUTHORITY}${path}`, {
        ...init,
        headers: {
            ...zitadelHeaders(includeOrganization),
            ...init.headers,
        },
    });
}

async function forward(response: Response): Promise<Response> {
    const body = await response.text();
    return new Response(body, {
        status: response.status,
        headers: jsonHeaders,
    });
}

function isAdmin(request: Request): boolean {
    const cookies = request.headers.get("cookie") ?? "";
    return /(?:^|;\s*)auth_rl=[^;]*admin/i.test(cookies);
}

function isCurrentUser(request: Request, userId: string): boolean {
    const cookies = request.headers.get("cookie") ?? "";
    const match = cookies.match(/(?:^|;\s*)uid=([^;]+)/);
    return match ? decodeURIComponent(match[1]) === userId : false;
}

export const GET: APIRoute = async ({ request, url }) => {
    const action = url.searchParams.get("action");
    const userId = url.searchParams.get("userId") ?? "";

    if (action === "team") {
        return forward(await zitadelRequest(
            "/management/v1/users/grants/_search",
            {
                method: "POST",
                body: JSON.stringify({
                    queries: [{ projectIdQuery: { projectId: PROJECT_ID } }],
                }),
            },
        ));
    }

    if (action === "roles") {
        return forward(await zitadelRequest(
            `/management/v1/projects/${encodeURIComponent(PROJECT_ID)}/roles/_search`,
            { method: "POST", body: "{}" },
        ));
    }

    if (action === "users") {
        if (!isAdmin(request)) return json({ error: "Forbidden" }, 403);

        const [grantsResponse, usersResponse] = await Promise.all([
            zitadelRequest("/management/v1/users/grants/_search", {
                method: "POST",
                body: JSON.stringify({
                    queries: [{ projectIdQuery: { projectId: PROJECT_ID } }],
                }),
            }),
            zitadelRequest("/v2/users", {
                method: "POST",
                body: JSON.stringify({
                    queries: [{
                        organizationIdQuery: { organizationId: ORGANIZATION_ID },
                    }],
                }),
            }),
        ]);

        if (!grantsResponse.ok) return forward(grantsResponse);
        if (!usersResponse.ok) return forward(usersResponse);

        const grants = await grantsResponse.json() as { result?: Array<Record<string, unknown>> };
        const users = await usersResponse.json() as {
            result?: Array<{
                userId: string;
                human?: { email?: { isVerified?: boolean; isEmailVerified?: boolean } };
            }>;
        };
        const rows = (grants.result ?? []).map((grant) => {
            const userId = String(grant.userId ?? "");
            const user = users.result?.find((item) => item.userId === userId);
            return {
                "display name": String(grant.displayName ?? "Unknown"),
                email: String(grant.email ?? "No Email"),
                role: Array.isArray(grant.roleKeys) ? String(grant.roleKeys[0] ?? "No Role") : "No Role",
                status: user?.human?.email?.isVerified || user?.human?.email?.isEmailVerified
                    ? "Active"
                    : "Inactive",
                "user-list-userId": userId,
            };
        });
        return json({ result: rows });
    }

    if ((action === "profile" || action === "metadata") && userId) {
        if (!isAdmin(request) && !isCurrentUser(request, userId)) {
            return json({ error: "Forbidden" }, 403);
        }
        const suffix = action === "metadata" ? "/metadata/_search" : "";
        return forward(await zitadelRequest(
            `/management/v1/users/${encodeURIComponent(userId)}${suffix}`,
            { method: action === "metadata" ? "POST" : "GET" },
        ));
    }

    return json({ error: "Unsupported ZITADEL operation." }, 400);
};

export const POST: APIRoute = async ({ request, url }) => {
    const action = url.searchParams.get("action");
    const body = await request.json() as Record<string, unknown>;

    if (action === "user-id") {
        const email = String(body.email ?? "");
        const organizationId = String(body.organizationId ?? ORGANIZATION_ID);
        const response = await zitadelRequest("/v2/users", {
            method: "POST",
            body: JSON.stringify({
                queries: [{
                    emailQuery: {
                        emailAddress: email,
                        method: "TEXT_QUERY_METHOD_EQUALS",
                    },
                }],
            }),
        }, false);
        if (!response.ok) return json({ status: response.status, message: "Failed to fetch user data" });

        const data = await response.json() as {
            result?: Array<{ userId: string; details: { resourceOwner: string } }>;
        };
        const user = data.result?.find((item) => item.details.resourceOwner === organizationId);
        return json(user
            ? { status: 200, userId: user.userId }
            : { status: 400, message: "User not found" });
    }

    const userId = String(body.userId ?? "");
    if (!userId || (!isAdmin(request) && !isCurrentUser(request, userId))) {
        return json({ error: "Forbidden" }, 403);
    }

    if (action === "profile") {
        return forward(await zitadelRequest(
            `/v2/users/human/${encodeURIComponent(userId)}`,
            {
                method: "PUT",
                body: JSON.stringify(body.profile),
            },
        ));
    }

    if (action === "metadata") {
        const key = encodeURIComponent(String(body.key ?? ""));
        return forward(await zitadelRequest(
            `/management/v1/users/${encodeURIComponent(userId)}/metadata/${key}`,
            {
                method: "POST",
                body: JSON.stringify({ value: body.value }),
            },
        ));
    }

    return json({ error: "Unsupported ZITADEL operation." }, 400);
};

export const DELETE: APIRoute = async ({ request, url }) => {
    const action = url.searchParams.get("action");
    const userId = url.searchParams.get("userId") ?? "";

    if (!userId || (!isAdmin(request) && !isCurrentUser(request, userId))) {
        return json({ error: "Forbidden" }, 403);
    }

    if (action === "user") {
        if (!isAdmin(request)) return json({ error: "Forbidden" }, 403);
        return forward(await zitadelRequest(
            `/v2/users/${encodeURIComponent(userId)}`,
            { method: "DELETE", body: "{}" },
            false,
        ));
    }

    if (action === "metadata") {
        const key = encodeURIComponent(url.searchParams.get("key") ?? "");
        return forward(await zitadelRequest(
            `/management/v1/users/${encodeURIComponent(userId)}/metadata/${key}`,
            { method: "DELETE", body: "{}" },
        ));
    }

    return json({ error: "Unsupported ZITADEL operation." }, 400);
};
