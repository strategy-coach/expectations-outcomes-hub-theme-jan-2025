import { z } from "zod";

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

const UserApiResponseSchema = z.object({
    details: z.object({
        totalResult: z.string(),
        timestamp: z.string(),
    }),
    result: z.array(
        z.object({
            userId: z.string(),
            details: z.object({
                sequence: z.string(),
                changeDate: z.string(),
                resourceOwner: z.string(),
            }),
            state: z.string(),
            username: z.string(),
            human: z.object({
                profile: z.object({
                    givenName: z.string(),
                    familyName: z.string(),
                    displayName: z.string(),
                    preferredLanguage: z.string(),
                    gender: z.string(),
                }),
                email: z.object({
                    email: z.string(),
                    isVerified: z.boolean(),
                }),
            }),
        }),
    ),
});

export type verificationCodeType = z.infer<typeof verificationCodeSchema>;
export type passwordChangeType = z.infer<typeof passwordChangeSchema>;
export type UserApiResponse = z.infer<typeof UserApiResponseSchema>;

const ZITADEL_AUTHORITY = import.meta.env.PUBLIC_ZITADEL_AUTHORITY as string;
const ZITADEL_API_TOKEN = import.meta.env.PUBLIC_ZITADEL_API_TOKEN as string;
const ORGANIZATION_ID = import.meta.env.PUBLIC_ZITADEL_ORGANIZATION_ID as string;

export async function resetPassword(
    userId: string,
    password?: string,
    verificationCode?: string,
): Promise<
    | void
    | { status: number; message: string }
    | { status: number; verificationCode: string }
> {
    const data = JSON.stringify({
        returnCode: {},
    });

    const url = `${ZITADEL_AUTHORITY}/v2/users/${userId}/password_reset`;
    const headers = new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${ZITADEL_API_TOKEN}`,
    });

    const options = {
        method: "post",
        headers,
        body: data,
    };
    let responseData: verificationCodeType | undefined;
    if (verificationCode === undefined) {
        const response = await fetch(url, options);
        responseData = (await response.json()) as verificationCodeType;
        if (response.status === 200 && password == undefined) {
            return { status: 200, verificationCode: responseData.verificationCode };
        }
    }

    const passwordChangeBody =
        verificationCode == undefined
            ? JSON.stringify({
                ["newPassword"]: {
                    password: password,
                    changeRequired: false,
                },
                verificationCode: responseData?.verificationCode,
            })
            : JSON.stringify({
                ["newPassword"]: {
                    password: password,
                    changeRequired: false,
                },
                verificationCode: verificationCode,
            });

    const passwordChangeUrl = `${ZITADEL_AUTHORITY}/v2/users/${userId}/password`;

    const passwordChangeOptions = {
        method: "post",
        headers,
        body: passwordChangeBody,
    };
    if (password !== undefined) {
        const response = await fetch(passwordChangeUrl, passwordChangeOptions);
        if (response.status == 400) {
            const res = (await response.json()) as passwordChangeType;
            return {
                status: 400,
                message: res.details[0].message,
            };
        } else if (response.status == 200) {
            return {
                status: 200,
                message: "Password Changed SuccessFully",
            };
        }
    }
}

export async function getOrganizationUsers(
    email: string,
): Promise<UserApiResponse | undefined> {
    try {
        const data = JSON.stringify({
            queries: [
                {
                    emailQuery: {
                        emailAddress: email,
                        method: "TEXT_QUERY_METHOD_EQUALS",
                    },
                },
                {
                    organizationIdQuery: {
                        organizationId: ORGANIZATION_ID,
                    },
                },
            ],
        });
        const config = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${ZITADEL_API_TOKEN}`,
                "x-zitadel-orgid": ORGANIZATION_ID,
            },
            body: data,
        };
        const response = await fetch(`${ZITADEL_AUTHORITY}/v2/users`, config);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const result = UserApiResponseSchema.parse(await response.json());
        return result;
    } catch (error) {
        console.error(error); // Log the error for debugging
        return undefined; // Return undefined in case of an error
    }
}