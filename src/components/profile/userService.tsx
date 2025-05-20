

import { z } from "zod";

const organizationId = import.meta.env.PUBLIC_ZITADEL_ORGANIZATION_ID
const UserInfoSchema = z.object({
    id: z.string(),
    details: z.object({
        sequence: z.string(),
        creationDate: z.string().datetime(),
        changeDate: z.string().datetime(),
        resourceOwner: z.string(),
    }),
    state: z.string(),
    userName: z.string(),
    preferredLoginName: z.string(),
    human: z.object({
        profile: z.object({
            firstName: z.string(),
            lastName: z.string(),
            nickName: z.string(),
            displayName: z.string(),
            preferredLanguage: z.string(),
        }),
        email: z.object({
            email: z.string().email(),
            isEmailVerified: z.boolean(),
        }),
        phone: z.object({
            phone: z.string(),
        }),
        passwordChanged: z.string().datetime(),
    }),
});
const UserDataSchema = z.object({
    user: UserInfoSchema,
});

const MetaDetailsSchema = z.object({
    sequence: z.string(),
    creationDate: z.string().datetime(),
    changeDate: z.string().datetime(),
    resourceOwner: z.string(),
});

const ResultSchema = z.object({
    details: MetaDetailsSchema,
    key: z.string(),
    value: z.string(), // Assuming Base64 encoded strings
});

const UserMetaSchema = z.object({
    details: z.object({
        totalResult: z.string(),
        viewTimestamp: z.string().datetime(),
    }),
    result: z.array(ResultSchema),
});

// TypeScript type
export type UserMeta = z.infer<typeof UserMetaSchema>;

export type ProfileInformation = z.infer<typeof UserDataSchema>;


interface ProfileFormData {
    firstName: string;
    lastName: string;
    nickName: string;
    userDisplayName: string;
    userEmail: string;
    userPhone: string;
    userNotificationStatus: string;
    // Add other properties if needed
}





const authority = import.meta.env.PUBLIC_ZITADEL_AUTHORITY as string;
const apiKey = import.meta.env.PUBLIC_ZITADEL_API_TOKEN as string;



export async function getUserInfo(
    userId: string,
): Promise<ProfileInformation | undefined> {
    const url = `${authority}/management/v1/users/${userId}`;
    const headers = new Headers({
        'x-zitadel-orgid': organizationId,
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
    });
    const options = {
        method: "GET",
        headers,
    };
    try {
        const response = await fetch(url, options);
        if (response.ok) {
            const data = (await response.json()) as ProfileInformation;
            return data;
        } else {
            console.error("Error:", response.statusText);
            return;
        }
    } catch (error) {
        console.error("Request failed:", error);
        return;
    }
}

export async function getUserMetaData(
    userId: string,
): Promise<UserMeta | undefined> {
    const url = `${authority}/management/v1/users/${userId}/metadata/_search`;
    const headers = new Headers({
        'x-zitadel-orgid': organizationId,
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
    });
    const options = {
        method: "POST",
        headers,
    };
    try {
        const response = await fetch(url, options);
        if (response.ok) {
            const data = (await response.json()) as UserMeta;
            return data;
        } else {
            console.error("Error:", response.statusText);
            return;
        }
    } catch (error) {
        console.error("Request failed:", error);
        return;
    }
}

export async function deleteUserMeta(type: string, userId): Promise<void> {
    const url = `${authority}/management/v1/users/${userId}/metadata/${type}`;
    const apiKey = import.meta.env.PUBLIC_ZITADEL_API_TOKEN as string;
    const headers = new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "x-zitadel-orgid":
            organizationId == undefined ? "" : organizationId.toString(),
    });

    const options = {
        method: "DELETE",
        headers,
        body: JSON.stringify({}),
    };

    await fetch(url, options);
}

export async function UpdateUserMetaData(
    status: string,
    metaKey: string,
    userId: string,
): Promise<void> {
    const url = `${authority}/management/v1/users/${userId}/metadata/${metaKey}`;
    const body = {
        value: btoa(status),
    };

    const headers = new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "x-zitadel-orgid":
            organizationId
    });

    const options = {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    };

    try {
        const response = await fetch(url, options);
        if (response.ok) {
            //return response.status;
        } else {
            console.error("Error:", response.statusText);
            //return response;
        }
    } catch (error) {
        console.error("Request failed:", error);
    }
}

export async function UpdateUserProfile(
    formData: ProfileFormData,
    userId: string
): Promise<void> {
    const apiKey = import.meta.env.PUBLIC_ZITADEL_API_TOKEN as string;
    const url = `${authority}/v2/users/human/${userId}`;
    const { firstName, lastName, nickName, userDisplayName, userPhone } =
        formData;

    const body = {
        profile: {
            givenName: firstName,
            familyName: lastName,
            nickName: nickName,
            displayName: userDisplayName,
        },
        phone: {
            phone: userPhone,
            isVerified: true,
        },
    };

    const headers = new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
        "x-zitadel-orgid":
            organizationId == undefined ? "" : organizationId.toString(),
    });

    const options = {
        method: "PUT",
        headers,
        body: JSON.stringify(body),
    };

    try {
        const response = await fetch(url, options);
        if (response.ok) {
            return;
        } else {
            console.error("Error:", response.statusText);
            return;
        }
    } catch (error) {
        console.error("Request failed:", error);
    }
}


export async function DeleteUserBio(userId: string): Promise<void> {
    const url = `${authority}/management/v1/users/${userId}/metadata/bio`;
    const apiKey = import.meta.env.PUBLIC_ZITADEL_API_TOKEN as string;
    const headers = new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "x-zitadel-orgid":
            organizationId == undefined ? "" : organizationId.toString(),
    });

    const options = {
        method: "DELETE",
        headers,
        body: JSON.stringify({}),
    };

    await fetch(url, options);
}


