import React, { useEffect, useState } from "react";
import AgGridComponent from "../../AgGrid/AgGridComponent.tsx";
import axios from "axios";
import z from "zod"

const UserInfoSchema = z.object({
    userId: z.string(),
    human: z.object({
        profile: z.object({
            givenName: z.string(),
            familyName: z.string(),
            nickName: z.string(),
            displayName: z.string(),
            preferredLanguage: z.string(),
        }),
        email: z.object({
            email: z.string().email(),
            isEmailVerified: z.boolean(),
        })
    }),
});


const UserGrantSchema = z.object({
    userId: z.string(),
    displayName: z.string(),
    email: z.string(),
    roleKeys: z.array(z.string()),
});

export type UserApiResponse = z.infer<typeof UserInfoSchema>;
export type UserGrantApiResponse = z.infer<typeof UserGrantSchema>;

const projectId = import.meta.env.PUBLIC_ZITADEL_PROJECT_ID;
const token = import.meta.env.PUBLIC_ZITADEL_API_TOKEN;
const organizationId = import.meta.env.PUBLIC_ZITADEL_ORGANIZATION_ID;
const authority = import.meta.env.PUBLIC_ZITADEL_AUTHORITY;


type DataItem = Record<string, string | null | undefined>;


const UserList: React.FC = () => {
    const [users, setUsers] = useState<DataItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!projectId || !authority || !organizationId || !token) {
            setError("Missing environment variables.");
            setLoading(false);
            return;
        }

        const fetchUsers = async () => {
            setLoading(true);
            setError(null);

            const data = JSON.stringify({
                queries: [{ projectIdQuery: { projectId } }],
            });

            try {
                const response = await axios.post(
                    `${authority}/management/v1/users/grants/_search`,
                    data,
                    {
                        headers: {
                            "x-zitadel-orgid": organizationId,
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                );
                const userConfig = {
                    method: 'post',
                    url: `${authority}/v2/users`,
                    headers: {
                        'x-zitadel-orgid': organizationId,
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    data: JSON.stringify({
                        queries: [{ organizationIdQuery: { organizationId } }],
                    }),
                };
                const responseUser = await axios.request(userConfig);
                if (!response.data?.result || !responseUser.data?.result) {
                    setError("No Users Found...");
                    setLoading(false);
                    return;
                }
                const mappedUsers: DataItem[] = response.data.result.map((user: UserGrantApiResponse) => {
                    const member = responseUser.data.result.find((member: UserApiResponse) => member.userId === user.userId);
                    return {
                        "display name": user.displayName || "Unknown",
                        email: user.email || "No Email",
                        role: user.roleKeys?.[0] || "No Role",
                        status: member?.human?.email?.isVerified ? "Active" : "Inactive",
                        "user-list-userId": user.userId
                    };
                })
                setUsers(mappedUsers);
            } catch (err) {
                setError("No Users Found...");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [projectId, authority, organizationId, token]);

    return (
        <div>
            {loading && <p className="text-sm">Loading...</p>}
            {error && <p className="text-sm" style={{ color: "red" }}>{error}</p>}
            {!loading && !error && <AgGridComponent rowData={users} />}
        </div>
    );
};

export default UserList;
