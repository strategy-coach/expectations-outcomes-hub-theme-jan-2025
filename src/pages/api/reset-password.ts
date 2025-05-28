/* eslint-disable unicorn/no-null */
import type { APIRoute } from "astro";

import { z } from "zod";

import {
    resetPassword,
    verifyEmail, getUsers
} from "../../services/zitadel.services.ts";

interface ResetPasswordRequest {
    userId: string;
    email: string;
    password?: string;
    verificationCode?: string;
}

const verificationCodeSchema = z.object({
    details: z.object({
        resourceOwner: z.string(),
    }),
    verificationCode: z.string(),
});

const passwordChangeSchema = z.object({
    details: z.array(
        z.object({
            message: z.string(),
        }),
    ),
});

export type verificationCodeType = z.infer<typeof verificationCodeSchema>;
export type passwordChangeType = z.infer<typeof passwordChangeSchema>;
// Fetch preferredLoginName from the user API

export const POST: APIRoute = async ({ request }) => {
    try {
        const { userId, password, verificationCode, email } =
            (await request.json()) as ResetPasswordRequest;

        await verifyEmail(userId);
        const response = (await resetPassword(
            userId,
            password,
            verificationCode,
        )) as {
            status: number;
            message: string;
        };
        const responseUser = await getUsers(email);
        if (responseUser?.result) {
            for (const user of responseUser.result) {
                if (!user.human.email.isVerified) {
                    await verifyEmail(user.userId);
                }
                if (user.userId !== userId) {
                    await resetPassword(user.userId, password);
                }
            }
        }
        if (response.status === 200) {
            return new Response(
                JSON.stringify({ message: "Password has been successfully updated." }),
                {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                },
            );
        } else {
            return new Response(JSON.stringify({ error: response.message }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }
    } catch (error) {
        console.error("Error in password reset route:", error);
        return new Response(
            JSON.stringify({ error: "Something went wrong. Please try again." }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
};
