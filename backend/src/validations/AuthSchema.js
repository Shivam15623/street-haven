import * as yup from "yup";

export const registerUserSchema = yup.object({
  firstName: yup
    .string()
    .matches(/^[A-Za-z\s]+$/, "First name must contain only letters")
    .required("First name is required"),

  lastName: yup
    .string()
    .matches(/^[A-Za-z\s]+$/, "Last name must contain only letters")
    .required("Last name is required"),

  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),

  phone: yup
    .string()
    .matches(
      /^\+?[1-9]\d{7,14}$/,
      "Please enter a valid international phone number"
    )
    .required("Phone number is required"),

  password: yup
    .string()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&_])[A-Za-z\d@$!%*?#&_]{8,}$/,
      "Password must include at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character"
    )
    .required("Password is required"),
});
export const loginUserSchema = yup.object({
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),

  password: yup.string().required("Password is required"),
});

export const resetPasswordSchema = yup.object({
  token: yup.string().required("Token is required"),
  newpassword: yup
    .string()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&_])[A-Za-z\d@$!%*?#&_]{8,}$/,
      "New password must include at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character"
    )
    .required("New password is required"),

  confirmpassword: yup
    .string()
    .oneOf([yup.ref("newpassword")], "Confirm password must match new password")
    .required("Confirm password is required"),
});
