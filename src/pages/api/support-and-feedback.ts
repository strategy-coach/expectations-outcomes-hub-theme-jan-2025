// src/pages/api/support.ts
import { type APIRoute } from "astro";
import { ConsoleLogWriter } from "drizzle-orm";

const GITHUB_OWNER = import.meta.env.PUBLIC_GITHUB_OWNER;


const GITHUB_REPO = import.meta.env.PUBLIC_GITHUB_REPO;
const GITHUB_PAT = import.meta.env.PUBLIC_GITHUB_PAT;

const NOVU_API_URL = import.meta.env.PUBLIC_NOVU_API_URL;
const NOVU_API_KEY = import.meta.env.PUBLIC_NOVU_API_KEY;
const NOVU_CONTACT_ADMIN_TEMPLATE = import.meta.env.PUBLIC_NOVU_ADMIN_TEMPLATE;
const NOVU_CONTACTUS_TEMPLATE = import.meta.env.PUBLIC_NOVU_CONTACTUS_TEMPLATE;
const NOVU_SUBSCRIBER_ID = import.meta.env.PUBLIC_NOVU_SUBSCRIBER_ID;
const CONTACTUS_ADMIN_EMAIL = import.meta.env.PUBLIC_NOVU_CONTACTUS_ADMIN_EMAIL;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { formData, submissionDate, screenshotBase64, currentURL, type } =
      await request.json();

    if (type === "createIssue") {
      const issue = await createGitHubIssue(
        formData,
        submissionDate,
        screenshotBase64,
        currentURL
      );
      return new Response(JSON.stringify(issue), { status: 200 });
    }

    if (type === "sendAdminMail") {
      await sendAdminMail(formData);
      return new Response(JSON.stringify({ message: "Admin mail sent" }), {
        status: 200,
      });

    }

    if (type === "sendAcknowledgement") {
      await sendAcknowledgementMail(formData);
      return new Response(JSON.stringify({ message: "Acknowledgement mail sent" }), {
        status: 200,
      });
    }

    return new Response("Invalid request type", { status: 400 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
};

async function createGitHubIssue(
  formData,
  submissionDate,
  screenshotBase64,
  currentURL
) {
  const issueDescription = `
name: ${formData.username}
email: ${formData.email}
subject: ${formData.subject}
message: ${formData.message}
submissionDate: ${submissionDate}
pageUrl: ${currentURL}
`.trim();

  const urlObj = new URL(currentURL);
  const hostnameParts = urlObj.hostname.split(".");
  let siteLabel = hostnameParts[0] + " hub";

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_PAT}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: formData.subject,
        body: `### Feedback Details\n\`\`\`yaml\n${issueDescription}\n\`\`\``,
        labels: ["feedback", siteLabel],
      }),
    }
  );

  if (!response.ok) {
    throw new Error("GitHub issue creation failed");
  }

  const issueData = await response.json();

  if (screenshotBase64) {
    await uploadFileToGitHub(issueData.number, screenshotBase64);
  }

  return issueData;
}

async function uploadFileToGitHub(issueId: number, screenshotBase64: string) {
  console.log("Uploading screenshot to GitHub");
  const fileName = `${issueId}.png`;
  const filePath = `uploads/${fileName}`;

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_PAT}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Upload screenshot for issue #${issueId}`,
          content: screenshotBase64.split(",")[1], // Remove the base64 header
        }),
      }
    );

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error("Error uploading file to GitHub:", errorDetails);
      throw new Error("Failed to upload screenshot to GitHub");
    }
  } catch (error) {
    console.error("Error during upload to GitHub:", error);
    throw error;
  }
}

async function sendAdminMail(payload) {
  try {
    const response = await fetch(NOVU_API_URL, {
      method: "POST",
      headers: {
        Authorization: `ApiKey ${NOVU_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: NOVU_CONTACT_ADMIN_TEMPLATE,
        to: {
          subscriberId: NOVU_SUBSCRIBER_ID,
          email: CONTACTUS_ADMIN_EMAIL,
        },
        payload,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Novu API error:", errorText);
      throw new Error("Admin email sending failed");
    }

    console.log("Admin email sent successfully.");
  } catch (err) {
    console.error("Error in sendAdminMail:", err);
    throw err;
  }
}

async function sendAcknowledgementMail(formData) {
  const response = await fetch(NOVU_API_URL, {
    method: "POST",
    headers: {
      Authorization: `ApiKey ${NOVU_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: NOVU_CONTACTUS_TEMPLATE,
      to: {
        subscriberId: NOVU_SUBSCRIBER_ID,
        email: formData.email,
      },
      payload: {
        name: formData.username,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Acknowledgement email sending failed");
  }
}
