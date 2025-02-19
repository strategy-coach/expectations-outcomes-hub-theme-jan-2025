import axios from "axios";
import { useEffect, useState } from "react";
import { Gravatar } from "../profile/gravatar/Gravatar.tsx";
import { zitadelConfig } from "../../utils/env.ts"

const projectId = zitadelConfig.projectId;
const token = zitadelConfig.zitalAPIToken;
const organizationId = zitadelConfig.organizationId;
const authority = zitadelConfig.authority;

type TeamMember = {
    userId: string;
    displayName: string;
    email: string;
    roleKeys: string[];
};

const Teams = () => {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // State to toggle showing more users

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                let data = JSON.stringify({
                    "queries": [
                        {
                            "projectIdQuery": {
                                "projectId": projectId
                            }
                        }
                    ]
                });
                const response = await axios.post(
                    `${authority}/management/v1/users/grants/_search`,
                    data,
                    {
                        headers: {
                            "x-zitadel-orgid": organizationId,
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setTeam(response.data.result);
            } catch (err) {
                setError("Failed to fetch team members.");
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
    }, []);

    if (loading) return <div className="text-center text-gray-600">Loading...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    // Show only first 5 users unless "Show More" is clicked
    const visibleTeam = team.slice(0, 5);

    return (
        <>
            {
                visibleTeam.map((member) => (
                    <div key={member.userId} className="text-sm rounded flex space-x-2 items-center">
                        <span className="rounded-full overflow-hidden w-4 h-4">
                            <Gravatar userEmail={member.email} height={5} width={5} />
                        </span>
                        <span>{member.displayName}</span>
                    </div>
                ))
            }
        </>

    );
};

export default Teams;
