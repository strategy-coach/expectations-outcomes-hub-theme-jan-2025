import { z } from "zod";
import axios from "axios";
import themeConfig from "../../theme.config.ts";

const { activeProject } = themeConfig;

const Details = z.object({
    sequence: z.string(),
    creationDate: z.string(),
    changeDate: z.string(),
    resourceOwner: z.string(),
});

const TotalDetails = z.object({
    totalResult: z.string(),
    viewTimestamp: z.string(),
});

const Organization = z.object({
    id: z.string(),
    details: Details,
    state: z.string(),
    name: z.string(),
    primaryDomain: z.string(),
});

const OrganizationResponse = z.object({
    details: TotalDetails,
    result: z.array(Organization),
});
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
                    isVerified: z.boolean().optional(),
                }),
            }),
        }),
    ),
});

const RoleSchema = z.object({
    details: z.object({
        totalResult: z.string(),
        viewTimestamp: z.string().datetime(),
    }),
    result: z.array(
        z.object({
            key: z.string(),
            details: z.object({
                sequence: z.string(),
                creationDate: z.string().datetime(),
                changeDate: z.string().datetime(),
                resourceOwner: z.string(),
            }),
            displayName: z.string(),
        })
    ),
});

const NoUserFoundSchema = z.object({
    details: z.object({
        timestamp: z.string(),
    }),
});

const OrganizationUsersApiResponseSchema = z.union([UserApiResponseSchema, NoUserFoundSchema]);


const RootDetailsSchema = z.object({
    totalResult: z.string(),
    viewTimestamp: z.string().datetime(),
});

const ResultDetailsSchema = z.object({
    sequence: z.string(),
    creationDate: z.string().datetime(),
    changeDate: z.string().datetime(),
    resourceOwner: z.string(),
});

const ResultSchema = z.object({
    id: z.string(),
    details: ResultDetailsSchema,
    roleKeys: z.array(z.string()),
    state: z.string(),
    userId: z.string(),
    userName: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    displayName: z.string(),
    orgId: z.string(),
    orgName: z.string(),
    orgDomain: z.string(),
    projectId: z.string(),
    projectName: z.string(),
    preferredLoginName: z.string(),
    userType: z.string(),
    grantedOrgId: z.string(),
    grantedOrgName: z.string(),
    grantedOrgDomain: z.string(),
});

const UserGrantSchema = z.object({
    details: RootDetailsSchema,
    result: z.array(ResultSchema),
});


export type UserGrantResponse = z.infer<typeof UserGrantSchema>;
export type OrganizationData = z.infer<typeof OrganizationResponse>;
export type verificationCodeType = z.infer<typeof verificationCodeSchema>;
export type passwordChangeType = z.infer<typeof passwordChangeSchema>;
export type UserApiResponse = z.infer<typeof UserApiResponseSchema>;
export type Roles = z.infer<typeof RoleSchema>;

const ZITADEL_AUTHORITY = import.meta.env.PUBLIC_ZITADEL_AUTHORITY as string;
const ZITADEL_API_TOKEN = import.meta.env.PUBLIC_ZITADEL_API_TOKEN as string;
const ORGANIZATION_ID = import.meta.env.PUBLIC_ZITADEL_ORGANIZATION_ID as string;
const PROJECT_ID = import.meta.env.PUBLIC_ZITADEL_PROJECT_ID as string;


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
        // Only parse response once
        const responseDataJSON = await response.json();

        // Validate with Zod
        const result = OrganizationUsersApiResponseSchema.parse(responseDataJSON);
        if ('result' in result && result.result) {
            return result;
        } else {
            return undefined;
        }

    } catch (error) {
        console.error(error); // Log the error for debugging
        return undefined; // Return undefined in case of an error
    }
}

export async function getOrganizationRoles(
): Promise<Roles | undefined> {
    try {
        const data = ''
        const config = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${ZITADEL_API_TOKEN}`,
                "x-zitadel-orgid": ORGANIZATION_ID,
            },
            body: data,
        };
        const response = await fetch(`${ZITADEL_AUTHORITY}/management/v1/projects/${PROJECT_ID}/roles/_search`, config);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const result = RoleSchema.parse(await response.json());
        return result;
    } catch (error) {
        console.error(error); // Log the error for debugging
        return undefined; // Return undefined in case of an error
    }
}

export async function getUserId(
    email: string,
    organizationId: string,
): Promise<{ status: number; userId?: string; message?: string } | undefined> {
    try {
        const data = JSON.stringify({
            queries: [
                {
                    emailQuery: {
                        emailAddress: email,
                        method: "TEXT_QUERY_METHOD_EQUALS",
                    },
                },
            ],
        });

        const config = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${ZITADEL_API_TOKEN}`,
            },
            body: data,
        };

        const url = `${ZITADEL_AUTHORITY}/v2/users`;
        const response = await fetch(url, config);

        if (!response.ok) {
            return { status: response.status, message: "Failed to fetch user data" };
        }

        const userResponse = (await response.json()) as UserApiResponse;

        if (userResponse.result) {
            const user = userResponse.result.find(
                (org) => org.details.resourceOwner === organizationId,
            );

            return user === undefined
                ? { status: 400, message: "User not found" }
                : { status: 200, userId: user.userId };
        } else {
            return { status: 400, message: "User not found" };
        }
    } catch (error) {
        console.error("Error fetching user ID:", error);
        return { status: 500, message: "Internal server error" };
    }
}

export async function verifyEmail(userId?: string): Promise<void> {
    const data = JSON.stringify({
        returnCode: {},
    });
    const url = `${ZITADEL_AUTHORITY}/v2/users/${userId}/email/send`;
    const headers = new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${ZITADEL_API_TOKEN}`,
    });

    const options = {
        method: "post",
        headers,
        body: data,
    };
    const response = await fetch(url, options);
    const responseData = (await response.json()) as verificationCodeType;
    if (response.status == 200) {
        const data = JSON.stringify({
            verificationCode: responseData.verificationCode,
        });
        const url = `${ZITADEL_AUTHORITY}/v2/users/${userId}/email/verify`;
        const headers = new Headers({
            "Content-Type": "application/json",
            Authorization: `Bearer ${ZITADEL_API_TOKEN}`,
        });

        const options = {
            method: "post",
            headers,
            body: data,
        };
        await fetch(url, options);
    }
}
export async function DeleteUser(id: string): Promise<void> {
    const url = `${ZITADEL_AUTHORITY}/v2/users/${id}`;
    const headers = new Headers({
        Authorization: `Bearer ${ZITADEL_API_TOKEN}`,
        "Content-Type": "application/json",
    });

    const options = {
        method: "DELETE",
        headers,
        body: JSON.stringify({}),
    };

    await fetch(url, options);
}


export async function getUserRole(
    userId: string,
    organizationId: string,
): Promise<UserGrantResponse | undefined> {
    try {
        console.log("User ID:", userId);
        const requestBody = {
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
        };

        const response = await axios.post(
            `${ZITADEL_AUTHORITY}/management/v1/users/grants/_search`,
            requestBody,
            {
                headers: {
                    "x-zitadel-orgid": organizationId,
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${ZITADEL_API_TOKEN}`,
                },
            },
        );
        const parsedResponse = UserGrantSchema.parse(response.data);
        return parsedResponse;
    } catch (error) {
        console.error(error);
        return undefined;
    }
}