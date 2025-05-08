/* eslint-disable unicorn/no-null */
import type { APIRoute } from "astro";
import { resetPassword } from "../../services/zitadel.services.ts";
import novuApiCall from "../../services/novu.service.ts";
import themeConfig from "../../../theme.config.ts";

const { title } = themeConfig;

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
            email
        }).toString();

        const payload = {
            code: codeResponse.verificationCode,
            resetButton: true,
            button: `
                  <div style="font-family: sans-serif;">
                  <a 
                  href="${SITE_URL}reset-password?${params}" 
                  target="_blank"
                  style="display: inline-block; padding: 8px 16px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; text-align: center;"
                 >
                 Reset Your Password
                 </a>
                <p style="font-size: 12px; margin-top: 10px;">
                Or copy and paste this link:<br />
                <span style="word-break: break-all;">${SITE_URL}reset-password?${params}</span>
                </p>
               </div>
               `,
            imgUrl: `
                 <div style="text-align: center; margin-bottom: 16px;">
                 <img 
                 src="${SITE_URL}assets/images/logo.png"
                 alt="Reset Password"
                 style="width:50px;height:50px"
                 />
               </div>
                `,
            siteName: title
        };
        await novuApiCall("reset-password", payload, email);

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
