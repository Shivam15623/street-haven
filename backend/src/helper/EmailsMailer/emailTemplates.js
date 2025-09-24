export const generateEmailTemplate = ({ type, data }) => {
  switch (type) {
    case "verification":
      return {
        subject: "Verify Your Email",
        html: `
          <h2>Verify Your Email</h2>
          <p>Click below to verify:</p>
          <a href="${data.link}" style="background:#007bff; color:white; padding:10px 15px; text-decoration:none; border-radius:5px;">Verify</a>
          <p>Expires in 1 hour.</p>
        `,
      };

    case "reset":
      return {
        subject: "Reset Your Password",
        html: `
          <h2>Reset Your Password</h2>
          <p>Click below to reset:</p>
          <a href="${data.link}" style="background:#007bff; color:white; padding:10px 15px; text-decoration:none; border-radius:5px;">Reset</a>
          <p>Expires in 1 hour.</p>
        `,
      };

    default:
      throw new Error("Invalid email type");
  }
};
