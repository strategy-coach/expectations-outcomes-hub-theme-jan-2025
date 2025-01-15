import type { Post } from "github-discussions-blog-loader"
import { useState } from "react";
import GithubDiscussionDetail from "./githubDiscussionDetails";

interface DiscussionsProps {
    discussions: Discussion[]
}
interface Discussion {
    id: string;
    data: Post
}
const GithubDiscussion: React.FC<DiscussionsProps> = ({ discussions }) => {

    const [data, setData] = useState<Post | undefined>()

    return (
        <>
            {data === undefined ? (<>{
                discussions.map((post: Discussion) => (
                    <div className="bg-white shadow-md rounded-lg p-6 mb-2 border border-gray-200">
                        <h2 className="font-semibold text-md text-gray-800 mb-4">
                            {post.data.title}
                        </h2>
                        <div className="flex items-center gap-4 mb-4">
                            <img
                                src={post.data.author.avatarUrl}
                                alt="User Avatar"
                                className="w-10 h-10 rounded-full border border-gray-300"
                            />
                            <div>
                                <h3 className="text-sm text-gray-500">
                                    {post.data.author.username}
                                </h3>
                                <span className="text-sm text-gray-500">
                                    {(() => {
                                        const updatedDate = new Date(post.data.created);
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
                            </div>
                        </div>
                        <div className="text-gray-700 text-sm leading-relaxed flex items-center">
                            <span >{post.data.description}</span>
                        </div>
                        <hr className="my-4 border-gray-300" />
                        <div className="flex items-center justify-between">

                            <button className="inline-block mt-4 text-sm text-blue-600 hover:text-blue-800 font-semibold" onClick={() => {
                                setData(post.data)
                            }}>
                                View Details <span>&#8594;</span>
                            </button>
                            <span className="text-xs text-gray-400">
                                Last updated by
                                {(() => {
                                    const updatedDate = new Date(post.data.updated);
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
                ))
            }</>) :
                <div>
                    <button
                        onClick={() => { setData(undefined); }}
                        className="px-8 py-2 mb-3 bg-gray-500 text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        ← Back
                    </button>
                    <GithubDiscussionDetail data={data} />

                </div>}

        </ >)
}
export default GithubDiscussion