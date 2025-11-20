import { Router } from "express";
import {
  ForgotPassword,
  Login,
  LogOut,
  refreshAccessToken,
  RegisterAdmin,
  RegisterEmployee,
  ResetPassword,
  silentAuth,
  totpGenerate,
  verifyTOTP,
  verifyTOTPSetup,
} from "../controllers/Auth.controller.js";
import { validateRequest } from "../middleware/validate.js";
import {
  loginUserSchema,
  registerUserSchema,
  resetPasswordSchema,
} from "../validations/AuthSchema.js";
import passport from "passport";

const router = Router();

router
  .route("/register/employee")
  .post(validateRequest(registerUserSchema, "body"), RegisterEmployee);
router
  .route("/register/admin")
  .post(validateRequest(registerUserSchema, "body"), RegisterAdmin);
router.route("/refresh").post(refreshAccessToken);
router.route("/login").post(validateRequest(loginUserSchema, "body"), Login);
router.route("/generate-totp").post(totpGenerate);
router.route("/setup-totp").post(verifyTOTPSetup);
router.route("/verify-totp").post(verifyTOTP);
router
  .route("/logout")
  .post(passport.authenticate("jwt", { session: false }), LogOut);
router.route("/forgot-password").post(ForgotPassword);
router
  .route("/reset-password")
  .post(validateRequest(resetPasswordSchema, "body"), ResetPassword);

router.route("/silent-auth").get(silentAuth);

export default router;
