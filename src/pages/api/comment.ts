import type { APIContext } from 'astro';
import CommentService from "../../components/comment/commentService";

export async function POST({ request }: APIContext) {


    try {
        const data = await request.json();
        const { userId, type, tenantId, activityType, description, url, messageId, parentId, parentMessageId, updatedBy, timeStamp, reactionTypeId, logId, platform, source } = data;
        switch (type) {
            case "addComment":

                if (!userId || !description) {
                    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
                }
                await CommentService.addComment({ userId, platform, activityType, parentId, description, url });
                break;

            case "addMessageReaction":
                await CommentService.addMessageReaction(userId, messageId, reactionTypeId);
                break;

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
