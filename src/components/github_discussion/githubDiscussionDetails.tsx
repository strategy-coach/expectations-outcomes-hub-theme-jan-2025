import axios from "axios";
import type { Post } from "github-discussions-blog-loader"
import { useEffect, useState } from "react";

const token = import.meta.env.PUBLIC_GITHUB_TOKEN
const repoName = import.meta.env.PUBLIC_GITHUB_REPO_NAME
const owner = import.meta.env.PUBLIC_GITHUB_OWNER_NAME

interface GithubDiscussionDetailProps {
    data: Post;
}

interface Comment {
    body: string;
    user: {
        login: string;
        avatar_url: string;
        html_url: string;
    }
    updated_at: Date
}
const GithubDiscussionDetail: React.FC<GithubDiscussionDetailProps> = ({ data }) => {

    const [comments, setComments] = useState<Comment[]>([])

    useEffect(() => {
        if (data) {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `https://api.github.com/repos/${owner}/${repoName}/discussions/${data.githubDiscussionNumber}/comments`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `token ${token}`
                }
            };

            axios.request(config)
                .then((response) => {
                    setComments(response.data);
                })
                .catch((error) => {
                    console.log(error);
                });

        }
    }, [])
    return (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200">
            <h2 className="font-semibold text-xl text-gray-800 mb-4">
                {data.title}
            </h2>
            <div className="flex items-center gap-4 mb-4">
                <div>
                    <span className="text-sm text-gray-500">
                        <strong className="mr-2">Created At :</strong>
                        {(() => {
                            const updatedDate = new Date(data.created);
                            const currentDate = new Date();
                            const updatedMidnight = new Date(
                                updatedDate.getFullYear(),
                                updatedDate.getMonth(),
                                updatedDate.getDate()
                            );
                            const currentMidnight = new Date(
                                currentDate.getFullYear(),
                                currentDate.getMonth(),
                                currentDate.getDate()
                            );
                            const differenceInMs =
                                currentMidnight.getTime() - updatedMidnight.getTime();
                            const differenceInDays = Math.floor(
                                differenceInMs / (1000 * 60 * 60 * 24)
                            );

                            if (differenceInDays === 0) {
                                return updatedDate.toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                });
                            } else {
                                return `${differenceInDays} days ago`;
                            }
                        })()}
                    </span>
                    <div className="mt-2">
                        <span className="text-sm flex items-center text-gray-500">
                            <strong className="mr-2">Author :</strong>
                            <img
                                src={data.author.avatarUrl}
                                alt="User Avatar"
                                className="w-6 h-6 rounded-full border border-gray-300 mr-2"
                            />
                            <span className="font-medium"><a target="_blank" href={data.author.url}>{data.author.username || 'No username available.'}</a></span>
                        </span>

                    </div>
                    <div className="mt-2">
                        <span className="text-sm text-gray-500">
                            <strong>Category :</strong> {data.category.name || 'Uncategorized'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="text-gray-700 text-sm leading-relaxed mb-4">
                <span dangerouslySetInnerHTML={{ __html: data.body }} />
            </div>
            <h2 className="text-gray-500 font-bold mb-4">Comments</h2>
            {comments.length > 0 ? (
                comments.map((comment) => (<div className="bg-white shadow-md rounded-lg p-6 mb-6 border border-gray-200">
                    <span className="text-sm text-gray-500 float-right">
                        {(() => {
                            const updatedDate = new Date(comment.updated_at);
                            const currentDate = new Date();
                            const updatedMidnight = new Date(
                                updatedDate.getFullYear(),
                                updatedDate.getMonth(),
                                updatedDate.getDate()
                            );
                            const currentMidnight = new Date(
                                currentDate.getFullYear(),
                                currentDate.getMonth(),
                                currentDate.getDate()
                            );
                            const differenceInMs =
                                currentMidnight.getTime() - updatedMidnight.getTime();
                            const differenceInDays = Math.floor(
                                differenceInMs / (1000 * 60 * 60 * 24)
                            );

                            if (differenceInDays === 0) {
                                return updatedDate.toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                });
                            } else {
                                return `${differenceInDays} days ago`;
                            }
                        })()}
                    </span>
                    <div className="flex items-center gap-4 mb-4">
                        <div>

                            <div className="mt-2">
                                <span className="text-sm flex items-center text-gray-500">
                                    <strong className="mr-2">Author :</strong>
                                    <img
                                        src={comment.user.avatar_url}
                                        alt="User Avatar"
                                        className="w-6 h-6 rounded-full border border-gray-300 mr-2"
                                    />
                                    <span className="font-medium"><a target="_blank" href={comment.user.html_url}>{comment.user.login || 'No username available.'}</a></span>
                                </span>

                            </div>
                        </div>
                    </div>

                    <div className="text-sm flex items-center text-gray-500 ">
                        <strong>Comment : </strong><span className="ml-1 text-md" dangerouslySetInnerHTML={{ __html: " " + comment.body }} />
                    </div>
                </div>))) : <div className="text-gray-500">No comments to display...</div>}
            <hr className="my-4 border-gray-300" />
            <div className="flex items-center justify-between">
                <a target="_blank" className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-semibold" href={data.githubUrl}>
                    github <span>&#8594;</span>
                </a>

                <span className="text-xs text-gray-400">
                    Last updated
                    {(() => {
                        const updatedDate = new Date(data.created);
                        const currentDate = new Date();

                        // Normalize both dates to midnight
                        const updatedMidnight = new Date(
                            updatedDate.getFullYear(),
                            updatedDate.getMonth(),
                            updatedDate.getDate()
                        );
                        const currentMidnight = new Date(
                            currentDate.getFullYear(),
                            currentDate.getMonth(),
                            currentDate.getDate()
                        );

                        // Calculate the difference in days
                        const differenceInMs =
                            currentMidnight.getTime() - updatedMidnight.getTime();
                        const differenceInDays = Math.floor(
                            differenceInMs / (1000 * 60 * 60 * 24)
                        );

                        if (differenceInDays === 0) {
                            // Format time for today's posts
                            return " " + updatedDate.toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                            });
                        } else {
                            return ` ${differenceInDays} days ago`;
                        }
                    })()}
                </span>
            </div>
        </div>
    )
}
export default GithubDiscussionDetail