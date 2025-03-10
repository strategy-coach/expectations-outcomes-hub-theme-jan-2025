import Cookies from "js-cookie";

interface GenericPayload {
  name?: string;
  [key: string]: string | undefined | number | undefined;
  pageTitle?: string;
  commentersName?: string;
  commentUrl?: string;
  commentContent?: string;
  tenantName?: string;
}
// type EnvDataType = Record<string, string | boolean | undefined>;
const apiKey = `ApiKey ${import.meta.env.PUBLIC_NOVU_API_KEY as string}`; // Replace with your API key
async function novuApiCall(
  templateName: string,
  payload: GenericPayload,
  emailTo?: string,
  otherRecievers?: string[] | undefined[],
): Promise<Response> {
  const tenant = Cookies.get("organizationName");
  payload.tenantName = tenant;
  const response = await fetch(import.meta.env.PUBLIC_NOVU_API_URL as string, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: templateName,
      to: {
        subscriberId: import.meta.env.PUBLIC_NOVU_SUBSCRIBER_ID as string,
        email: emailTo,
      },
      overrides: {
        email: {
          to: otherRecievers,
        },
      },
      payload: payload,
    }),
  });

  return response;
}

export default novuApiCall;
