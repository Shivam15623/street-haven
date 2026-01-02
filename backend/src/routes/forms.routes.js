import { Router } from "express";
import {
  createClientFeedback,
  createClientIncident,
  createEmployeeIncident,
  createFAF,
  createMediaConsent,
  createPaymentRequisition,
  deleteClientFeedback,
  deleteClientIncident,
  deleteEmployeeIncident,
  deleteFAF,
  deleteMediaConsent,
  deletePaymentRequisition,
  editClientFeedback,
  editClientIncident,
  editEmployeeIncident,
  editFAF,
  editMediaConsent,
  editPaymentRequisition,
  generateFilledclientFeedbackPdf,
  generateFilledClientIncident,
  generateFilledEmployeeIncidentPdf,
  generateFilledIncidentReport,
  generateFilledMediaConsent,
  generatefilledPaymentPdf,
  generatefilledStaffFeedbackpdf,
  GetAllClientFeedback,
  GetAllClientIncidents,
  GetAllEmployeeIncidents,
  GetAllFunctionalAbilities,
  GetAllMediaConsent,
  GetAllPaymentRequisitions,
  getClientFeedbackById,
  getClientIncidentById,
  getEmployeeIncidentById,
  getFAFById,
  getPaymentRequisitionById,
} from "../controllers/form.controller.js";
import { upload } from "../middleware/multer.js";

import { validateRequest } from "../middleware/validate.js";
import { functionalAbilitiesSchema } from "../validations/formSchemas.js";
import { idParamSchema } from "../validations/common.js";

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

router
  .route("/clientIncident/:id")
  .get(getClientIncidentById)
  .delete(deleteClientIncident)
  .patch(editClientIncident);

router
  .route("/clientFeedback/:id")
  .get(getClientFeedbackById)
  .delete(deleteClientFeedback)
  .patch(editClientFeedback);

router
  .route("/mediaConsent/:id")
  // .get(getMediaConsentById)
  .delete(deleteMediaConsent)
  .patch(editMediaConsent);

router
  .route("/paymentRequistion/:id")
  .get(getPaymentRequisitionById)
  .delete(deletePaymentRequisition)
  .patch(upload.single("invoiceAttachment"), editPaymentRequisition);
router
  .route("/employeeIncident/:id")
  .get(getEmployeeIncidentById)
  .delete(deleteEmployeeIncident)
  .patch(editEmployeeIncident);
router
  .route("/functionalAbilties/:id")
  .get(getFAFById)
  .delete(deleteFAF)
  .patch(
    validateRequest(idParamSchema, "params"),
    validateRequest(functionalAbilitiesSchema, "body"),
    editFAF
  );
router.route("/paymentRequistion/pdfForm/:id").get(generatefilledPaymentPdf);

router.route("/staffFeedback/pdfForm/:id").get(generatefilledStaffFeedbackpdf);
router.route("/clientIncident/pdfForm/:id").get(generateFilledClientIncident);
router
  .route("/clientFeedback/pdfForm/:id")
  .get(generateFilledclientFeedbackPdf);
router.route("/incidentReport/pdfForm/:id").get(generateFilledIncidentReport);
router.route("/mediaConsent/pdfForm/:id").get(generateFilledMediaConsent);
router
  .route("/employeeIncident/pdfForm/:id")
  .get(generateFilledEmployeeIncidentPdf);
export default router;
