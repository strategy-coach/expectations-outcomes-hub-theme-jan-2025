import axios from "axios";
import { useEffect, useState } from "react";
import { Gravatar } from "../profile/gravatar/Gravatar";
import themeConfig from "../../../theme.config";

const { organization } = themeConfig || {};
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
    const [gridView, setGridView] = useState(true)

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
        <div className="p-6 pt-4 mt-3 mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">{organization} Members</h2>
            <div className="">
                <div className="flex space-x-4">

                    <button
                        className={`flex items-center font-semibold py-2 px-4 rounded-lg shadow-md border transition 
                ${gridView ? "bg-slate-200 text-slate-900 border-slate-400" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100 active:bg-slate-200"}`}
                        onClick={() => setGridView(true)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 mr-2">
                            <path fillRule="evenodd" d="M15 11a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6ZM7.25 7.5a.5.5 0 0 0-.5-.5H3a.5.5 0 0 0-.5.5V8a.5.5 0 0 0 .5.5h3.75a.5.5 0 0 0 .5-.5v-.5Zm1.5 3a.5.5 0 0 1 .5-.5H13a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5H9.25a.5.5 0 0 1-.5-.5v-.5ZM13.5 8v-.5A.5.5 0 0 0 13 7H9.25a.5.5 0 0 0-.5.5V8a.5.5 0 0 0 .5.5H13a.5.5 0 0 0 .5-.5Zm-6.75 3.5a.5.5 0 0 0 .5-.5v-.5a.5.5 0 0 0-.5-.5H3a.5.5 0 0 0-.5.5v.5a.5.5 0 0 0 .5.5h3.75Z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs">Grid</span>
                    </button>

                    <button
                        className={`flex items-center font-semibold py-2 px-4 rounded-lg shadow-md border transition 
                ${!gridView ? "bg-slate-200 text-slate-900 border-slate-400" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100 active:bg-slate-200"}`}
                        onClick={() => setGridView(false)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 mr-2">
                            <path d="M2 4a2 2 0 0 1 2-2h8a2 2 0 1 1 0 4H4a2 2 0 0 1-2-2ZM2 9.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 9.25ZM2.75 12.5a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5H2.75Z" />
                        </svg>
                        <span className="text-xs">List</span>
                    </button>
                </div>


                {gridView ? (
                    <div className="grid grid-cols-12 gap-4 mt-6">
                        {team.map((member) => (
                            <div key={member.userId} className=" leading-[3rem] col-span-3 md:col-span-3 bg-white p-4 rounded-lg shadow-lg shadow-gray-400">
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
                    </div>) :
                    <div className="mt-4">
                        <table className="border-collapse border border-gray-300 w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Role</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Organization</th>
                                </tr>
                            </thead>
                            <tbody>
                                {team.map((member) => (
                                    <tr className="hover:bg-gray-50">
                                        <td className="border border-gray-300 px-4 py-2 flex">
                                            <Gravatar userEmail={member.email} width={5} height={5} /> <span className="ml-2"> {member.displayName}</span>
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">{member.email}</td>
                                        <td className="border border-gray-300 px-4 py-2">{member.roleKeys[0]}</td>
                                        <td className="border border-gray-300 px-4 py-2">{member.orgName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>}
            </div>
        </div >
    );
};

export default TeamDetails;
