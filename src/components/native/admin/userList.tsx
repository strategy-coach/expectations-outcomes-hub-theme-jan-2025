import React, { useEffect, useState } from "react";
import AgGridComponent from "../../AgGrid/AgGridComponent.tsx";
import axios from "axios";

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

                const mappedUsers: DataItem[] = response.data.result.map((user: any) => ({
                    "display name": `${user.displayName}`,
                    email: user.email,
                    role: user.roleKeys[0]
                }));

                setUsers(mappedUsers);
            } catch (err) {
                setError("Failed to fetch team members.");
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
