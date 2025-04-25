import React, { useState } from "react";
import Cookie from "js-cookie";

const reactionType = [
    { reaction_type_id: 1, reaction_name: "thumbs_up", icon: "👍" },
    { reaction_type_id: 7, reaction_name: "eye_glasses", icon: "👓" },
    { reaction_type_id: 8, reaction_name: "thumbs_down", icon: "👎" },
    { reaction_type_id: 10, reaction_name: "approved", icon: "✅" },
];

interface ReactionType {
    reactionCount: number;
    reactionTypeId: string;
    reactionName: string;
    users: string[];
}

interface PageReactionProps {
    url: string;
    reactions: ReactionType[];
}

const PageReaction: React.FC<PageReactionProps> = ({ url, reactions }) => {
    const [commentReactions, setCommentReaction] = useState<ReactionType[]>(reactions);

    const user = Cookie.get("zitadel_user_name");
    const userId = Cookie.get("zitadel_user_id")



    const handleReactionClick = async (reactionTypeId: string, reactionName: string, icon: string): Promise<void> => {
        const updatedReactions = [...commentReactions];

        const existingReactionIndex = updatedReactions.findIndex(
            (reaction) => reaction.reactionTypeId === reactionTypeId && reaction.users.includes(user!)
        );
        if (existingReactionIndex !== -1) {
            updatedReactions[existingReactionIndex].users = updatedReactions[existingReactionIndex].users.filter(
                (member) => member !== user
            );
            updatedReactions[existingReactionIndex].reactionCount -= 1;

            if (updatedReactions[existingReactionIndex].reactionCount === 0) {
                updatedReactions.splice(existingReactionIndex, 1);
            }

            setCommentReaction(updatedReactions);

            try {
                await fetch("/api/post-reaction", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, url, reactionTypeId }),
                });

            } catch (error) {
                console.error("Error removing reaction:", error);
            }

            return;
        }

        const userExistingReactionIndex = updatedReactions.findIndex((reaction) => reaction.users.includes(user!));
        if (userExistingReactionIndex !== -1) {
            const userExistingReaction = updatedReactions[userExistingReactionIndex];

            userExistingReaction.users = userExistingReaction.users.filter((member) => member !== user);
            userExistingReaction.reactionCount -= 1;

            if (userExistingReaction.reactionCount === 0) {
                updatedReactions.splice(userExistingReactionIndex, 1);
            }
        }

        const existingReaction = updatedReactions.find((reaction) => reaction.reactionTypeId === reactionTypeId);
        if (existingReaction) {
            existingReaction.reactionCount += 1;
            existingReaction.users.push(user!);
        } else {
            updatedReactions.push({ reactionTypeId, reactionName, reactionCount: 1, users: [user!] });
        }

        setCommentReaction(updatedReactions);

        try {
            await fetch("/api/post-reaction", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, url, reactionTypeId }),
            });
            const attributes = globalThis.setAttributes("Add Page Reaction", {
                reactionname: reactionName,
                icon: icon
            })
            globalThis.setOTTracer("add-page-reaction", attributes);

        } catch (error) {
            console.error("Error adding reaction:", error);
        }

    };
    return (
        <div className="reaction-container space-y-2 mt-4 text-xs">
            <div className="flex flex-wrap gap-4">
                {reactionType.map((type) => {
                    const current = commentReactions.find(
                        (r) => r.reactionTypeId === type.reaction_type_id.toString()
                    );
                    // const userReacted = current?.users.includes(user!);

                    return (
                        <div
                            key={type.reaction_type_id}
                            className={`group relative px-2 py-1 rounded-2xl shadow-md flex items-center bg-gray-200 gap-2 border transition-colors cursor-pointer
                          `}
                            // ${userReacted ? "border-blue-500 bg-blue-50" : ""}
                            onClick={() =>
                                handleReactionClick(
                                    type.reaction_type_id.toString(),
                                    type.reaction_name === "eye_glasses" ? "View" : type.reaction_name === "approved" ? "Approved" : type.reaction_name === "thumbs_down" ? "Disagree" : type.reaction_name === "thumbs_up" ? "Agreed " : type.reaction_name,
                                    type.icon
                                )
                            }
                        >
                            <span className="text-sm">{type.icon}</span>
                            <div className="flex flex-row items-center gap-x-2">
                                <span className="capitalize text-gray-800 font-semibold">
                                    {type.reaction_name === "eye_glasses" ? "View" : type.reaction_name === "approved" ? "Approved" : type.reaction_name === "thumbs_down" ? "Disagree" : type.reaction_name === "thumbs_up" ? "Agreed " : type.reaction_name}
                                </span>
                                <span className="text-gray-800 text-sm">
                                    {current?.reactionCount || ""}
                                </span>
                            </div>


                            {current && (
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg z-10">
                                    {current.users
                                        .map((u) => (u === user ? `${u} (you)` : u))
                                        .join(", ")}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );


};

export default PageReaction;