/* eslint-disable unicorn/no-null */
import type { APIRoute } from "astro";
import { resetPassword } from "../../services/zitadel.services.ts";
import novuApiCall from "../../services/novu.service.ts";

const SITE_URL = import.meta.env.PUBLIC_ZITADEL_LOGOUT_REDIRECT_URI as string;

interface CodeRequest {
    email: string;
    userId: string;
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const { userId, email } = (await request.json()) as CodeRequest;
        const codeResponse = (await resetPassword(userId)) as unknown as {
            status: number;
            message: string;
            verificationCode?: string;
        };

        if (codeResponse.status !== 200) {
            return new Response(
                JSON.stringify({
                    error:
                        codeResponse.message ?? "Unable to generate verification code.",
                }),
                { status: codeResponse.status },
            );
        }

        const params = new URLSearchParams({
            code: codeResponse.verificationCode ?? "",
            userId,
        }).toString();

        const payload = {
            code: codeResponse.verificationCode,
            resetButton: true,
            button: `<div><a class="btn" href="${SITE_URL}reset-password?${params}" target="_blank">Reset Password</a></div>`,
        };
        await novuApiCall("password-change", payload, email);

        return new Response(
            JSON.stringify({
                message:
                    "Your verification code has been successfully sent to your email.",
            }),
            { status: 200 },
        );
    } catch {
        return new Response(
            JSON.stringify({ error: "Something went wrong. Please try again." }),
            { status: 500 },
        );
    }
};
