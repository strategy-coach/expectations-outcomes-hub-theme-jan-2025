/* eslint-disable unicorn/no-null */
import type { APIRoute } from "astro";
import type { AxiosResponse } from "axios";
import axios from "axios";
import { z } from "zod";
import themeConfig from "../../../theme.config.ts";


const { activeProject } = themeConfig;
const ZITADEL_DOMAIN = import.meta.env.PUBLIC_ZITADEL_AUTHORITY as string;
const ZITADEL_TOKEN = import.meta.env.PUBLIC_ZITADEL_API_TOKEN as string;
const ORGANIZATION = import.meta.env
    .PUBLIC_ZITADEL_ORGANIZATION_ID as string;

interface AuthRequest {
    email: string;
    password: string;
    userID: string;
}

interface SessionResponse {
    sessionId: string;
    sessionToken: string;
}

interface AuthResponse {
    sessionToken: string;
}

// Define a single Zod schema
export const UserAPIResponseSchema = z.object({
    details: z.object({
        totalResult: z.string(),
        timestamp: z.string().datetime(),
    }),
    result: z.array(
        z.object({
            userId: z.string(),
            details: z.object({
                sequence: z.string(),
                changeDate: z.string().datetime(),
                resourceOwner: z.string(),
            }),
            state: z.string(),
            username: z.string(),
            loginNames: z.array(z.string()),
            preferredLoginName: z.string(),
            human: z.object({
                profile: z.object({
                    givenName: z.string(),
                    familyName: z.string(),
                    nickName: z.string().optional(),
                    displayName: z.string(),
                    preferredLanguage: z.string(),
                    gender: z.string(),
                }),
                email: z.object({
                    email: z.string().email(),
                    isVerified: z.boolean(),
                }),
                phone: z
                    .object({
                        phone: z.string(),
                    })
                    .optional(),
                passwordChangeRequired: z.boolean(),
                passwordChanged: z.string().datetime(),
            }),
        }),
    ),
});

export const UserRoleSchema = z.object({
    details: z.object({
        totalResult: z.string(),
        timestamp: z.string().datetime(),
    }),
    result: z.array(
        z.object({
            roleKeys: z.array(z.string()),
        }),
    ),
});

export const userSchema = z.object({
    preferredLoginName: z.string(),
    userId: z.string(),
    username: z.string(),
    givenName: z.string(),
    familyName: z.string(),
    nickName: z.string(),
    displayName: z.string(),
    preferredLanguage: z.string(),
    gender: z.string(),
    email: z.string().email(),
    phone: z.string(),
});

export const SessionSchema = z.object({
    session: z.object({
        id: z.string(),
        creationDate: z.string().datetime(),
        changeDate: z.string().datetime(),
        sequence: z.string(),
        factors: z.object({
            user: z.object({
                verifiedAt: z.string().datetime(),
                id: z.string(),
                loginName: z.string(),
                displayName: z.string(),
                organizationId: z.string(),
            }),
            password: z.object({
                verifiedAt: z.string().datetime(),
            }),
            webAuthN: z.object({
                verifiedAt: z.string().datetime(),
                userVerified: z.boolean(),
            }),
            intent: z.object({
                verifiedAt: z.string().datetime(),
            }),
            totp: z.object({
                verifiedAt: z.string().datetime(),
            }),
            otpSms: z.object({
                verifiedAt: z.string().datetime(),
            }),
            otpEmail: z.object({
                verifiedAt: z.string().datetime(),
            }),
        }),
        metadata: z.record(z.any()),
        userAgent: z.object({
            fingerprintId: z.string(),
            ip: z.string(),
            description: z.string(),
            header: z.record(z.any()),
        }),
        expirationDate: z.string().datetime(),
    }),
});

// Define TypeScript type
export type UserAPIResponse = z.infer<typeof UserAPIResponseSchema>;
export type User = z.infer<typeof userSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type Session = z.infer<typeof SessionSchema>;

// Fetch preferredLoginName from the user API
async function getPreferredLoginName(email: string): Promise<User | null> {
    try {
        const data = JSON.stringify({
            query: {
                offset: "0",
                limit: 2,
                asc: true,
            },
            queries: [
                {
                    emailQuery: {
                        emailAddress: email,
                        method: "TEXT_QUERY_METHOD_EQUALS",
                    },
                },
                {
                    organizationIdQuery: {
                        organizationId: ORGANIZATION,
                    },
                },
            ],
        });

        const response: AxiosResponse<UserAPIResponse> = await axios.post(
            `${ZITADEL_DOMAIN}/v2/users`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${ZITADEL_TOKEN}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "x-zitadel-orgid": ORGANIZATION,
                },
            },
        );
        if (response.data.result !== undefined && response.data.result.length > 0) {
            return {
                preferredLoginName: response.data.result[0].preferredLoginName,
                userId: response.data.result[0].userId,
                username: response.data.result[0].username,
                givenName: response.data.result[0].human.profile.givenName,
                familyName: response.data.result[0].human.profile.familyName,
                nickName: response.data.result[0].human.profile.nickName ?? "",
                displayName: response.data.result[0].human.profile.displayName,
                preferredLanguage:
                    response.data.result[0].human.profile.preferredLanguage,
                gender: response.data.result[0].human.profile.gender,
                email: response.data.result[0].human.email.email,
                phone: response.data.result[0].human.phone?.phone ?? "",
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching loginName:", error);
        return null;
    }
}

async function getUserRole(userId: string): Promise<{
    userRole: string[];
} | null> {
    try {
        const data = JSON.stringify({
            query: { offset: "0", limit: 1, asc: true },
            queries: [
                { userIdQuery: { userId } },
                {
                    projectNameQuery: {
                        projectName: activeProject,
                        method: "TEXT_QUERY_METHOD_EQUALS",
                    },
                },
            ],
        });

        const response: AxiosResponse<UserRole> = await axios.post(
            `${ZITADEL_DOMAIN}/management/v1/users/grants/_search`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${ZITADEL_TOKEN}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "x-zitadel-orgid": ORGANIZATION,
                },
            },
        );
        if (response.data.result !== undefined && response.data.result.length > 0) {
            return {
                userRole: response.data.result[0].roleKeys,
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching loginName:", error);
        return null;
    }
}

async function sessionValidation(
    userId: string,
    sessionId: string,
): Promise<boolean> {
    try {
        const response: AxiosResponse<Session> = await axios.get(
            `${ZITADEL_DOMAIN}/v2/sessions/${sessionId}`,
            {
                headers: {
                    Authorization: `Bearer ${ZITADEL_TOKEN}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            },
        );
        if (response.data.session !== undefined) {
            const sessionUser = response.data.session.factors.user.id;
            return sessionUser == userId ? true : false;
        }
        return false;
    } catch (error) {
        console.error("Error fetching user session:", error);
        return false;
    }
}

export const POST: APIRoute = async ({ request, cookies }) => {
    try {
        const { email, password, userID } = (await request.json()) as AuthRequest;

        if (userID == undefined) {
            if (email.length === 0) {
                return new Response(JSON.stringify({ error: "Email is required" }), {
                    status: 200,
                });
            }

            if (password.length === 0) {
                return new Response(JSON.stringify({ error: "Password is required" }), {
                    status: 200,
                });
            }

            // Fetch preferredLoginName
            const loginResponse = await getPreferredLoginName(email);

            if (loginResponse == null) {
                cookies.set("session_id", "", {
                    httpOnly: true,
                    secure: true,
                    path: "/",
                    sameSite: "strict",
                    maxAge: 0,
                });

                return new Response(
                    JSON.stringify({ error: "Login name not found for this email" }),
                    { status: 200 },
                );
            }

            const userRoles = await getUserRole(loginResponse.userId);
            const userRole =
                userRoles && userRoles?.userRole.length > 0
                    ? userRoles?.userRole[0]
                    : "";

            // Step 1: Create session with loginName
            const responseData: AxiosResponse<SessionResponse> = await axios.post(
                `${ZITADEL_DOMAIN}/v2/sessions`,
                JSON.stringify({
                    checks: { user: { loginName: loginResponse.preferredLoginName } },
                }),
                {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${ZITADEL_TOKEN}`,
                        "Content-Type": "application/json",
                        "x-zitadel-orgid": ORGANIZATION,
                    },
                },
            );
            const sessionId = responseData.data.sessionId;
            const response: AxiosResponse<AuthResponse> = await axios.patch(
                `${ZITADEL_DOMAIN}/v2/sessions/${sessionId}`,
                {
                    checks: { password: { password } },
                },
                {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${ZITADEL_TOKEN}`,
                        "Content-Type": "application/json",
                        "x-zitadel-orgid": ORGANIZATION,
                    },
                },
            );

            if (response.data.sessionToken == undefined) {
                cookies.set("session_id", "", {
                    httpOnly: true,
                    secure: true,
                    path: "/",
                    sameSite: "strict",
                    maxAge: 0,
                });

                return new Response(
                    JSON.stringify({ error: "Incorrect password. Please try again." }),
                    { status: 200 },
                );
            } else {
                cookies.set("session_id", sessionId, {
                    httpOnly: true,
                    secure: true,
                    path: "/",
                    sameSite: "strict",
                    maxAge: 60 * 60 * 24, // 1 day
                });
                return new Response(
                    JSON.stringify({
                        userId: loginResponse.userId,
                        userRole: userRole,
                        username: loginResponse.username,
                        givenName: loginResponse.givenName,
                        familyName: loginResponse.familyName,
                        displayName: loginResponse.displayName,
                        email: loginResponse.email,
                    }),
                    { status: 200 },
                );
            }
        } else {
            const sessionId = cookies.get("session_id")?.value ?? "";
            const validSession = await sessionValidation(userID, sessionId);
            return new Response(JSON.stringify({ validSession: validSession }), {
                status: 200,
            });
        }
    } catch {
        cookies.set("session_id", "", {
            httpOnly: true,
            secure: true,
            path: "/",
            sameSite: "strict",
            maxAge: 0,
        });
        return new Response(
            JSON.stringify({ error: "Incorrect password. Please try again." }),
            { status: 200 },
        );
    }
};
