import axios from "axios";
import type { APIRoute } from "astro";

const ZITADEL_DOMAIN = import.meta.env.PUBLIC_ZITADEL_AUTHORITY as string;
const ZITADEL_TOKEN = import.meta.env.PUBLIC_ZITADEL_API_TOKEN as string;


export const POST: APIRoute = async ({ cookies }) => {
    try {
        const sessionId = cookies.get("session_id")?.value ?? "";
        console.log(`${ZITADEL_DOMAIN}/v2/sessions/${sessionId}`);
        // Delete session from your auth backend
        await axios.delete(`${ZITADEL_DOMAIN}/v2/sessions/${sessionId}`, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${ZITADEL_TOKEN.trim()}`,
            },
        });

        // Clear the cookie
        cookies.set("session_id", "", {
            httpOnly: true,
            secure: true,
            path: "/",
            sameSite: "strict",
            maxAge: 0,
        });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "Logout failed" }), {
            status: 500,
        });
    }
};
