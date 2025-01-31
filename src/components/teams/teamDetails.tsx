import axios from "axios";
import { useEffect, useState } from "react";
import { Gravatar } from "../profile/gravatar/Gravatar";

const projectId = import.meta.env.PUBLIC_ZITADEL_PROJECT_ID;
const token = import.meta.env.PUBLIC_ZITADEL_API_TOKEN;
const organizationId = import.meta.env.PUBLIC_ZITADEL_ORGANIZATION_ID;
const authority = import.meta.env.PUBLIC_ZITADEL_AUTHORITY;

type TeamMember = {
    userId: string;
    displayName: string;
    email: string;
    roleKeys: string[];
    orgName: string;
};

const TeamDetails = () => {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let data = JSON.stringify({
            queries: [
                {
                    projectIdQuery: {
                        projectId: projectId,
                    },
                },
            ],
        });

        const fetchTeam = async () => {
            try {
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

    return (
        <div className="p-6 pt-4 mt-3 min-h-screen h-full mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Team Members</h2>
            <div className="grid grid-cols-12 gap-4">
                {team.map((member) => (
                    <div key={member.userId} className=" leading-[3rem] col-span-3 md:col-span-3 bg-white p-4 rounded-lg shadow-md">
                        <div className="flex items-center gap-3">
                            <Gravatar userEmail={member.email} width={20} height={20} />
                            <div>
                                <h3 className="text-lg font-medium text-gray-700">{member.displayName}</h3>
                                <p className="text-sm text-gray-600">
                                    <strong>Role:</strong> {member.roleKeys[0]}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <strong>Email:</strong>{" "}
                                    <a href={`mailto:${member.email}`} className="text-blue-500 hover:underline">
                                        {member.email}
                                    </a>
                                </p>
                                <p className="text-sm text-gray-600">
                                    <strong>Organization:</strong> {member.orgName}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TeamDetails;
