

import { z } from "zod";

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





export async function getUserInfo(
    userId: string,
): Promise<ProfileInformation | undefined> {
    try {
        const response = await fetch(
            `/api/zitadel?action=profile&userId=${encodeURIComponent(userId)}`,
        );
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
    try {
        const response = await fetch(
            `/api/zitadel?action=metadata&userId=${encodeURIComponent(userId)}`,
        );
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

export async function deleteUserMeta(type: string, userId: string): Promise<void> {
    await fetch(
        `/api/zitadel?action=metadata&userId=${encodeURIComponent(userId)}&key=${encodeURIComponent(type)}`,
        { method: "DELETE" },
    );
}

export async function UpdateUserMetaData(
    status: string,
    metaKey: string,
    userId: string,
): Promise<void> {
    const options: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId,
            key: metaKey,
            value: btoa(status),
        }),
    };

    try {
        const response = await fetch("/api/zitadel?action=metadata", options);
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

    const options: RequestInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, profile: body }),
    };

    try {
        const response = await fetch("/api/zitadel?action=profile", options);
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
    await deleteUserMeta("bio", userId);
}
