import { Router } from "express";
import {
  ForgotPassword,
  Login,
  LogOut,
  refreshAccessToken,
  RegisterAdmin,
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
  setupTotpSchema,
} from "../validations/AuthSchema.js";
import passport from "passport";

const router = Router();


router
  .route("/register/admin")
  .post(validateRequest(registerUserSchema, "body"), RegisterAdmin);
router.route("/refresh").post(refreshAccessToken);
router.route("/login").post(validateRequest(loginUserSchema, "body"), Login);
router.route("/generate-totp").post(totpGenerate);
router
  .route("/setup-totp")
  .post(validateRequest(setupTotpSchema, "body"), verifyTOTPSetup);
router
  .route("/verify-totp")
  .post(validateRequest(setupTotpSchema, "body"), verifyTOTP);
router
  .route("/logout")
  .post(passport.authenticate("jwt", { session: false }), LogOut);
router.route("/forgot-password").post(ForgotPassword);
router
  .route("/reset-password")
  .post(validateRequest(resetPasswordSchema, "body"), ResetPassword);

router.route("/silent-auth").get(silentAuth);

export default router;
