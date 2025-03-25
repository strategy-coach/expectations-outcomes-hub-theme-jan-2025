/* eslint-disable unicorn/no-null */
import type { APIRoute } from "astro";
import type { AxiosResponse } from "axios";
import axios from "axios";
import { z } from "zod";
import { getOrganizationUsers } from "../../services/zitadel.services.ts";
import type { SignUpFormData } from "../../components/signup/signup.tsx";

const UserGrantSchema = z.object({
    userGrantId: z.string(),
    details: z.object({
        sequence: z.string(),
        creationDate: z.string(),
        changeDate: z.string(),
        resourceOwner: z.string(),
    }),
});

export type UserGrantType = z.infer<typeof UserGrantSchema>;

const ZITADEL_DOMAIN = import.meta.env.PUBLIC_ZITADEL_AUTHORITY as string;
const ZITADEL_TOKEN = import.meta.env.PUBLIC_ZITADEL_API_TOKEN as string;
const ZITADEL_ORGANIZATION_ID = import.meta.env.PUBLIC_ZITADEL_ORGANIZATION_ID as string;
const PROJECT_ID = import.meta.env.PUBLIC_ZITADEL_PROJECT_ID as string;

// Helper function to get a random character from a string
const getRandomChar = (str: string): string =>
    str.charAt(Math.floor(Math.random() * str.length));

const generateRandomString = (length = 15): string => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specialChars = "!@#$%^&*()-_+=<>?";

    // Ensure at least one of each required character
    let randomString: string =
        getRandomChar(uppercase) +
        getRandomChar(numbers) +
        getRandomChar(specialChars);

    // Fill the remaining length with random characters
    const allChars: string = uppercase + lowercase + numbers + specialChars;
    for (let i = 3; i < length; i++) {
        randomString += getRandomChar(allChars);
    }

    // Shuffle the string to randomize positions
    randomString = [...randomString].sort(() => 0.5 - Math.random()).join("");

    return randomString;
};

export const addUserGrantToPorject = async (
    param: {
        userId: string;
        grant: string;
    },
): Promise<UserGrantType> => {
    const data = JSON.stringify({
        "projectId": PROJECT_ID,
        "roleKeys": [
            param.grant,
        ],
    });

    const config = {
        method: "post",
        maxBodyLength: Number.POSITIVE_INFINITY,
        url: `${ZITADEL_DOMAIN}/management/v1/users/${param.userId}/grants`,
        headers: {
            "x-zitadel-orgid": ZITADEL_ORGANIZATION_ID,
            "Content-Type": "application/json",
            "Authorization": `Bearer ${ZITADEL_TOKEN}`,
        },
        data: data,
    };

    try {
        const response = await axios.request(config);
        const result = response.data as UserGrantType;
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const POST: APIRoute = async ({ request }) => {
    try {
        const { givenName, familyName, displayName, gender, email, phone, role } =
            (await request.json()) as SignUpFormData;

        const userExist = await getOrganizationUsers(email);
        if (userExist !== undefined && Number(userExist?.details.totalResult) > 0) {
            return new Response(
                JSON.stringify({
                    error:
                        "This email is already registered. Please use a different email address.",
                }),
                { status: 200 },
            );
        } else {
            const signUpData = JSON.stringify({
                organization: {
                    orgId: ZITADEL_ORGANIZATION_ID,
                },
                profile: {
                    givenName: givenName,
                    familyName: familyName,
                    displayName: displayName,
                    preferredLanguage: "en",
                    gender: gender,
                },
                email: {
                    email: email,
                    isVerified: false,
                },
                phone: {
                    phone: phone,
                },
                password: {
                    password: generateRandomString(),
                    changeRequired: false,
                },
            });

            const config = {
                method: "post",
                url: `${ZITADEL_DOMAIN}/v2/users/human`,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${ZITADEL_TOKEN}`,
                },
                data: signUpData,
            };

            const response: AxiosResponse<{ userId: string }> =
                await axios.request(config);

            if (response.data.userId === undefined) {
                return new Response(
                    JSON.stringify({
                        error: "Unable to create user",
                    }),
                    { status: 200 },
                )
            } else {
                const roleResponse = await addUserGrantToPorject({
                    userId: response.data.userId,
                    grant: role
                });
                if (roleResponse.userGrantId) {
                    return new Response(
                        JSON.stringify({
                            userId: response.data.userId,
                        }),
                        { status: 200 },
                    );
                } else {
                    return new Response(
                        JSON.stringify({
                            error: 'Can not assign user role',
                        }),
                        { status: 200 },
                    );
                }
            }

        }
    } catch {
        return new Response(JSON.stringify({ error: "Error during user signup" }), {
            status: 200,
        });
    }
};
