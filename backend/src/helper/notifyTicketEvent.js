// helper/notifyTicketEvent.js
import User from "../model/user.js";
import { generateEmailTemplate } from "./EmailsMailer/emailTemplates.js";
import { sendEmail } from "./EmailsMailer/emailSender.js";

/**
 * userIds: array of user _id strings to email
 * templateType: string matching a case in emailTemplates.js
 * dataBuilder: (user) => data object for that template
 */
export async function notifyTicketEmail({ userIds, templateType, dataBuilder, session }) {
  if (!userIds?.length) return;

  const users = await User.find({ _id: { $in: userIds } })
    .select("firstname lastname email")
    .session(session);

  await Promise.all(
    users.map((user) => {
      const emailContent = generateEmailTemplate({
        type: templateType,
        data: dataBuilder(user),
      });
      return sendEmail({ to: user.email, ...emailContent });
    }),
  );
}