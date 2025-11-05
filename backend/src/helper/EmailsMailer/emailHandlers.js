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
  // Generate a plain reset token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash it before storing in the database
  const hashedToken = await bcrypt.hash(resetToken, 10);

  // Update user record with token and expiry
  const user = await User.findOneAndUpdate(
    { email },
    {
      forgotPasswordToken: hashedToken,
      forgotPasswordTokenExpiry: Date.now() + 3600000, // 1 hour
    },
    { new: true }
  );

  if (!user) {
    throw new Error("User not found with this email.");
  }

  // Generate reset link
  const resetLink = `${process.env.DOMAIN}/reset-password?token=${hashedToken}`;

  // Create email HTML content
  const emailContent = generateEmailTemplate({
    type: "reset",
    data: { link: resetLink },
  });


  // Send email
  await sendEmail({ to: email, ...emailContent });

  return { success: true, message: "Reset email sent successfully." };
};
