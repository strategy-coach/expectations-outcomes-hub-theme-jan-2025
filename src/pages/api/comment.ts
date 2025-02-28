import type { APIContext } from 'astro';
import CommentService from "../../components/comment/commentService";

export async function POST({ request }: APIContext) {


    try {
        const data = await request.json();
        console.log("Received Data:", data); // Log the request data

        const { userId, type, tenantId, activityType, description, url, messageId, parentId, parentMessageId, updatedBy, timeStamp, reactionTypeId, logId, platform, source } = data;

        switch (type) {
            case "addComment":
                console.log("Calling addComment...");
                if (!userId || !description) {
                    console.error("Missing required fields for addComment.");
                    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
                }
                await CommentService.addComment({ userId, platform, activityType, parentId, description, url });
                console.log("Comment added successfully.");
                break;

            // case "addMessageReaction":
            //     await CommentService.addMessageReaction(userID, messageId, reactionTypeId);
            //     break;

            case "deleteComment":

                await CommentService.deleteComment(messageId);
                await CommentService.addActivityLog({
                    messageId: parentMessageId,
                    userId,
                    updatedBy,
                    activityType,
                    source,
                    tenantId,
                    description,
                    url,
                    timeStamp
                });
                break;

            case "editLog":
                await CommentService.editComment(logId, description);
                await CommentService.addActivityLog({ userId, activityType, messageId: logId, source, tenantId, description, url });
                break;

            default:
                return new Response(JSON.stringify({ error: "Invalid request type" }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
        }

        return new Response(JSON.stringify({ message: "Operation completed successfully!" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error processing request:", error);
        return new Response(JSON.stringify({ error: "Failed to process request" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
