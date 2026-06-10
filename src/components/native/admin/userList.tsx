import React, { useEffect, useState } from "react";
import AgGridComponent from "../../AgGrid/AgGridComponent.tsx";
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

type DataItem = Record<string, string | null | undefined>;


const UserList: React.FC = () => {
    const [users, setUsers] = useState<DataItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch("/api/zitadel?action=users");
                if (!response.ok) {
                    setError("No Users Found...");
                    return;
                }
                const data = await response.json() as { result?: DataItem[] };
                setUsers(data.result ?? []);
            } catch (err) {
                setError("No Users Found...");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div>
            {loading && <p className="text-sm">Loading...</p>}
            {error && <p className="text-sm" style={{ color: "red" }}>{error}</p>}
            {!loading && !error && <AgGridComponent rowData={users} />}
        </div>
    );
};

export default UserList;
