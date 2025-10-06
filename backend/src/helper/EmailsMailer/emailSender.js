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
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail({
      to: [{ email: to }],
      sender: { name: "Shivam", email: "phenomenalshivam2@gmail.com" },
      subject,
      htmlContent: html,
    });

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw new Error("Failed to send email via Brevo API");
  }
};
