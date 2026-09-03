import SibApiV3Sdk from "sib-api-v3-sdk";

const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY; // your Brevo V3 API key

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

/**
 * Send email via Brevo API
 * @param {Object} param0
 * @param {string} param0.to Recipient email
 * @param {string} param0.subject Email subject
 * @param {string} param0.html HTML content
 */ export const sendEmail = async ({ to, subject, html }) => {
  try {
    const senderEmail = "phenomenalshivam2@gmail.com";
    const senderName = "CRM";

    const response = await apiInstance.sendTransacEmail({
      sender: {
        name: senderName,
        email: senderEmail,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });

    console.log("Brevo Response:", response);

    return response;
  } catch (error) {
    console.error("========== BREVO ERROR ==========");
    console.error(error);

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Body:", error.response.body);
      console.error("Text:", error.response.text);
    }

    throw error;
  }
};
