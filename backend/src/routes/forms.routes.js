import { Router } from "express";
import {
  createClientFeedback,
  createClientIncident,
  createEmployeeIncident,
  createFAF,
  createMediaConsent,
  createPaymentRequisition,
  GetAllClientFeedback,
  GetAllClientIncidents,
  GetAllEmployeeIncidents,
  GetAllFunctionalAbilities,
  GetAllMediaConsent,
  GetAllPaymentRequisitions,
} from "../controllers/form.controller.js";
import { upload } from "../middleware/multer.js";

import { validateRequest } from "../middleware/validate.js";
import { functionalAbilitiesSchema } from "../validations/formSchemas.js";

const router = Router();

router.route("/clientIncident").post(createClientIncident);
router.route("/clientFeedback").post(createClientFeedback);
router.route("/employeeIncident").post(createEmployeeIncident);
router
  .route("/paymentRequistion")
  .post(upload.single("invoiceAttachment"), createPaymentRequisition);
router
  .route("/functionalAbilties")
  .post(validateRequest(functionalAbilitiesSchema, "body"), createFAF);
router.route("/mediaConsent").post(createMediaConsent);

// -------------------- GET routes --------------------
// Client Feedback
router.route("/clientFeedback").get(GetAllClientFeedback);

// Client Incident
router.route("/clientIncident").get(GetAllClientIncidents);

// Employee Incident
router.route("/employeeIncident").get(GetAllEmployeeIncidents);

// Functional Abilities
router.route("/functionalAbilties").get(GetAllFunctionalAbilities);

// Media Consent
router.route("/mediaConsent").get(GetAllMediaConsent);

// Payment Requisition
router.route("/paymentRequistion").get(GetAllPaymentRequisitions);
export default router;
