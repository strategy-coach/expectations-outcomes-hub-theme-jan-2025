import axios from "axios";
import type { APIRoute } from "astro";

const ZITADEL_DOMAIN = import.meta.env.PUBLIC_ZITADEL_AUTHORITY as string;
const ZITADEL_TOKEN = import.meta.env.PUBLIC_ZITADEL_API_TOKEN as string;

const AUTH_COOKIES = [
    "session_id",
    "uid",
    "auth_rl",
    "ctx_tid",
    "acct_eml",
    "usr_lbl",
];

export const POST: APIRoute = async ({ cookies }) => {
    const sessionId = cookies.get("session_id")?.value ?? "";

    let revokeFailed = false;
    if (sessionId) {
        try {
            await axios.delete(
                `${ZITADEL_DOMAIN}/v2/sessions/${encodeURIComponent(sessionId)}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        Authorization: `Bearer ${ZITADEL_TOKEN.trim()}`,
                    },
                },
            );
        } catch (error) {
            console.error(error);
            revokeFailed = true;
        }
    }

    for (const name of AUTH_COOKIES) {
        cookies.delete(name, {
            httpOnly: name === "session_id",
            secure: true,
            path: "/",
            sameSite: "strict",
        });
    }

    if (revokeFailed) {
        return new Response(JSON.stringify({ error: "Backend session revoke failed" }), {
            status: 502,
            headers: { "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
};
