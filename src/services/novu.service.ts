import Cookies from "js-cookie";
import { z } from "zod";

// Define Zod schema for payload validation
const GenericPayloadSchema = z.object({
    name: z.string().optional(),
    pageTitle: z.string().optional(),
    commentersName: z.string().optional(),
    commentUrl: z.string().optional(),
    commentContent: z.string().optional(),
    tenantName: z.string().optional(),
    // Allow additional properties of type string or number
}).catchall(z.union([z.string(), z.number(), z.undefined(), z.boolean()]));

// Infer TypeScript type from Zod schema
type GenericPayload = z.infer<typeof GenericPayloadSchema>;

// Define environment variables and API configurations
const apiKey = `ApiKey ${import.meta.env.PUBLIC_NOVU_API_KEY as string}`; // Set API key
const novuApiUrl = import.meta.env.PUBLIC_NOVU_API_URL as string;
const subscriberId = import.meta.env.PUBLIC_NOVU_SUBSCRIBER_ID as string;

// Novu API call function
async function novuApiCall(
    templateName: string,
    payload: GenericPayload,
    emailTo?: string,
    otherReceivers?: string[],
): Promise<Response> {
    // Get tenant name from cookies and add to payload
    const tenantName = Cookies.get("organizationName");
    const validatedPayload = GenericPayloadSchema.parse({
        ...payload,
        tenantName,
    });

    // API request body
    const requestBody = {
        name: templateName,
        to: {
            subscriberId,
            email: emailTo,
        },
        overrides: {
            email: {
                to: otherReceivers,
            },
        },
        payload: validatedPayload,
    };

    // Make API request
    const response = await fetch(novuApiUrl, {
        method: "POST",
        headers: {
            Authorization: apiKey,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
    });

    return response;
}

export default novuApiCall;
