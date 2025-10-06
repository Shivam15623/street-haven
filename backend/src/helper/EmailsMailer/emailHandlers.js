import bcrypt from "bcrypt";
import { sendEmail } from "./emailSender.js";
import { generateEmailTemplate } from "./emailTemplates.js";

import crypto from "crypto";
import User from "../../model/user.js";

export const sendVerificationEmail = async ({ email, userId }) => {
  const token = await bcrypt.hash(userId.toString(), 10);
  await EmailVerification.create({
    email: email,
    mode: "token",
    type: "user",
    expiresAt: Date.now() + 3600000,
    value: token,
  });
  const emailContent = generateEmailTemplate({
    type: "verification",
    data: { link: `${process.env.DOMAIN}/verifyemail?token=${token}` },
  });

  return sendEmail({ to: email, ...emailContent });
};

export const sendResetEmail = async ({ email }) => {
  // Generate plain token

  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash it before storing in DB
  const hashedToken = await bcrypt.hash(resetToken, 10);

  await User.findOne(
    { email },
    {
      forgotPasswordToken: hashedToken,
      forgotPasswordTokenExpiry: Date.now() + 3600000,
    }
  );

  const resetLink = `${process.env.DOMAIN}/reset-password?token=${resetToken}`;

  const emailContent = generateEmailTemplate({
    type: "reset",
    data: { link: resetLink },
  });
  console.log("token reset", resetLink, emailContent);
  return sendEmail({ to: email, ...emailContent });
};
