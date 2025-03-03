import React, { useState } from "react";
import Cookie from "js-cookie";

const reactionType = [
    { reaction_type_id: 1, reaction_name: "thumbs_up", icon: "👍" },
    { reaction_type_id: 2, reaction_name: "heart", icon: "❤️" },
    { reaction_type_id: 3, reaction_name: "laugh", icon: "😂" },
    { reaction_type_id: 4, reaction_name: "sad", icon: "😢" },
    { reaction_type_id: 5, reaction_name: "clap", icon: "👏" },
    { reaction_type_id: 6, reaction_name: "eyes", icon: "👀" },
    { reaction_type_id: 7, reaction_name: "eye_glasses", icon: "👓" },
    { reaction_type_id: 8, reaction_name: "thumbs_down", icon: "👎" },
    { reaction_type_id: 9, reaction_name: "perfect_score", icon: "💯" },
];

interface ReactionType {
    reactionCount: number;
    reactionTypeId: string;
    reactionName: string;
    users: string[];
}

interface MessageReactionProps {
    messageId: number;
    reactions: ReactionType[];
}

const MessageReaction: React.FC<MessageReactionProps> = ({ messageId, reactions }) => {
    const [showReactions, setShowReactions] = useState(false)
    const [commentReactions, setCommentReaction] = useState<ReactionType[]>(reactions);
    const [selectedReaction, setSelectedReaction] = useState<string | null>();

    const user = Cookie.get("zitadel_user_name");
    console.log(user)
    const userId = Cookie.get("zitadel_user_id")
    const getReaction = (name: string): string => {
        const reactiontype = reactionType.find(type => type.reaction_name === name);
        return reactiontype ? reactiontype.icon : "";
    };

    const toggleReactions = (): void => setShowReactions(prev => !prev);

    const handleReactionClick = async (reactionTypeId: string, reactionName: string): Promise<void> => {
        const updatedReactions = [...commentReactions];

        // Find if the user already reacted to this specific reaction
        const existingReactionIndex = updatedReactions.findIndex(
            (reaction) => reaction.reactionTypeId === reactionTypeId && reaction.users.includes(user!)
        );

        // If user already reacted with the same reaction, remove it (toggle off)
        if (existingReactionIndex !== -1) {
            updatedReactions[existingReactionIndex].users = updatedReactions[existingReactionIndex].users.filter(
                (member) => member !== user
            );
            updatedReactions[existingReactionIndex].reactionCount -= 1;

            // Remove the reaction from the list if count reaches 0
            if (updatedReactions[existingReactionIndex].reactionCount === 0) {
                updatedReactions.splice(existingReactionIndex, 1);
            }

            setCommentReaction(updatedReactions);
            setSelectedReaction(null);

            try {
                await fetch("/api/comment", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "addMessageReaction", userId, messageId, reactionTypeId }),
                });
            } catch (error) {
                console.error("Error removing reaction:", error);
            }

            return;
        }

        // If the user has a different reaction, remove it before adding a new one
        const userExistingReactionIndex = updatedReactions.findIndex((reaction) => reaction.users.includes(user!));
        if (userExistingReactionIndex !== -1) {
            const userExistingReaction = updatedReactions[userExistingReactionIndex];

            // Remove the user's previous reaction
            userExistingReaction.users = userExistingReaction.users.filter((member) => member !== user);
            userExistingReaction.reactionCount -= 1;

            if (userExistingReaction.reactionCount === 0) {
                updatedReactions.splice(userExistingReactionIndex, 1);
            }
        }

        // Add the new reaction
        const existingReaction = updatedReactions.find((reaction) => reaction.reactionTypeId === reactionTypeId);
        if (existingReaction) {
            existingReaction.reactionCount += 1;
            existingReaction.users.push(user!);
        } else {
            updatedReactions.push({ reactionTypeId, reactionName, reactionCount: 1, users: [user!] });
        }

        setCommentReaction(updatedReactions);
        setSelectedReaction(reactionTypeId);

        try {
            await fetch("/api/comment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "addMessageReaction", userId, messageId, reactionTypeId }),
            });
        } catch (error) {
            console.error("Error adding reaction:", error);
        }

        setShowReactions(false);
    };

    return (
        <div className="reaction-container">
            <div className="flex gap-2">
                {commentReactions.map(reaction => (
                    <div className="relative group" key={reaction.reactionTypeId}>
                        <div className="border-2 text-md pr-1 border-gray rounded">
                            {getReaction(reaction.reactionName)} {reaction.reactionCount}
                        </div>
                        <div className="absolute bottom-full mb-2 hidden group-hover:inline-flex bg-gray-800 max-w-max text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                            reacted by
                            <strong className="text-white text-xs ml-1">
                                {reaction.users.map((u) => (u === user ? `${u} (you)` : u)).join(", ")}
                            </strong>
                        </div>

                    </div>

                ))}
                <div className="border-2 border-gray rounded">
                    <button className="text-md text-gray-500" onClick={toggleReactions}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 17" fill="currentColor" className="w-4 h-4">
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.536-4.464a.75.75 0 1 0-1.061-1.061 3.5 3.5 0 0 1-4.95 0 .75.75 0 0 0-1.06 1.06 5 5 0 0 0 7.07 0ZM9 8.5c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S7.448 7 8 7s1 .672 1 1.5Zm3 1.5c.552 0 1-.672 1-1.5S12.552 7 12 7s-1 .672-1 1.5.448 1.5 1 1.5Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>
            </div>
            {showReactions && (
                <div className="flex gap-2 bg-white border border-gray-300 rounded-lg p-2 shadow-lg z-10">
                    {reactionType.map(reaction => (
                        <button
                            key={reaction.reaction_type_id}
                            className={`reaction-button ${Number(selectedReaction) === reaction.reaction_type_id ? "selected" : ""}`}
                            onClick={() => handleReactionClick(reaction.reaction_type_id.toString(), reaction.reaction_name)}
                        >
                            {reaction.icon}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MessageReaction;